"use strict";
const express = require("express");
const path    = require("path");
const app     = express();

const { calcNumerology, calcPersonalYear, getCalcSteps,
        getZodiacName, getZodiac, getEasternAnimal } = require("./src/numerology");
const { getLocale, isApprovedForGeneration }          = require("./src/localization");
const { validateReport }                              = require("./src/validator");

// ─── Knowledge Base (internal context only — never exposed to client) ────────
let kbRecords = [];
try {
  const XLSX   = require("xlsx");
  const kbPath = path.join(__dirname, "..", "Knowledge_Base",
                           "Knowledge_Base_v2_6_1_AI_Report_Generation.xlsx");
  const wb     = XLSX.readFile(kbPath);
  kbRecords    = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  console.log(`Behavioral context loaded: ${kbRecords.length} records`);
} catch (err) {
  console.log("Behavioral context not available:", err.message);
}

const isPlaceholder = (s) =>
  !s || s.startsWith("[") || s.startsWith("Для ") || s.trim().length < 20;

// ─── KB context builders — NO internal codes in output ──────────────────────
// These produce prompt context only. Forbidden patterns (Big Five, EXT-, MD-XX, etc.)
// are stripped from labels. The validator enforces this in the final HTML.

const DIM_LABELS = {
  EXT: { ru: "Экстраверсия / стиль энергии и социальности",         en: "Extraversion / social energy style" },
  AGR: { ru: "Доброжелательность / стиль взаимодействия",           en: "Agreeableness / interaction style" },
  CON: { ru: "Добросовестность / стиль организации и самодисциплины",en: "Conscientiousness / organisation style" },
  NEG: { ru: "Эмоциональная устойчивость / стиль переработки стресса",en:"Emotional steadiness / stress processing style" },
  OPE: { ru: "Открытость / стиль любопытства и новизны",            en: "Openness / curiosity and novelty style" },
};
const SEC_LABELS = {
  "Strengths":              { ru: "Сильные стороны",        en: "Strengths" },
  "Emotional triggers":     { ru: "Эмоциональные паттерны", en: "Emotional patterns" },
  "Communication style":    { ru: "Стиль общения",          en: "Communication style" },
  "Practical recommendations":{ ru:"Практические рекомендации",en:"Practical recommendations" },
  "Journal prompts":        { ru: "Вопросы для саморефлексии",en:"Reflection prompts" },
};
const LVL_LABELS = {
  low:      { ru: "низкий",          en: "lower range" },
  balanced: { ru: "сбалансированный",en: "balanced" },
  high:     { ru: "высокий",         en: "higher range" },
};

function buildBehavioralBlock(lang) {
  if (!kbRecords.length) return "";
  const isRu   = lang === "ru";
  const instrKey  = isRu ? "generator_instruction_ru" : "generator_instruction_EN";
  const interpKey = isRu ? "interpretation_ru"        : "interpretation_EN";

  const DIMS   = ["EXT","AGR","CON","NEG","OPE"];
  const LEVELS = ["low","balanced","high"];
  const SECS   = ["Strengths","Emotional triggers","Communication style",
                  "Practical recommendations","Journal prompts"];

  const lines = [
    isRu
      ? "\n═══ ПОВЕДЕНЧЕСКИЙ КОНТЕКСТ — ориентиры для персонализированного текста ═══"
      : "\n═══ BEHAVIORAL CONTEXT — reference material for personalised content ═══",
    isRu
      ? "  (Используй как основу для написания разделов. Не цитируй эти ориентиры дословно.)"
      : "  (Use as a foundation for writing sections. Do not quote these guides verbatim.)",
  ];

  for (const dim of DIMS) {
    const dimLabel = (isRu ? DIM_LABELS[dim].ru : DIM_LABELS[dim].en);
    lines.push(`\n## Параметр: ${dimLabel}`);

    const ovr = kbRecords.find(r => r.concept_code === dim && r.concept_group === "Domain overview");
    if (ovr) {
      const txt = ovr[interpKey];
      if (!isPlaceholder(txt)) lines.push(`  Контекст: ${txt}`);
    }

    for (const level of LEVELS) {
      const lvLabel  = isRu ? LVL_LABELS[level].ru : LVL_LABELS[level].en;
      const code     = `${dim}-${level}`;
      const blockLines = [];

      for (const sec of SECS) {
        const rec = kbRecords.find(r => r.concept_code === code && r.report_section === sec);
        if (!rec) continue;
        const instr  = rec[instrKey];
        const interp = rec[interpKey];
        const secLabel = isRu ? SEC_LABELS[sec].ru : SEC_LABELS[sec].en;
        if (!isPlaceholder(instr) || !isPlaceholder(interp)) {
          blockLines.push(`    [${secLabel}]`);
          if (!isPlaceholder(instr))  blockLines.push(`      Ориентир: ${instr}`);
          if (!isPlaceholder(interp)) blockLines.push(`      Пример: "${interp}"`);
        }
      }

      if (blockLines.length) {
        lines.push(`  [Диапазон: ${lvLabel}]`);
        lines.push(...blockLines);
      }
    }
  }
  return lines.join("\n");
}

function buildSymbolicBlock(nums, lang) {
  if (!kbRecords.length) return "";
  const isRu     = lang === "ru";
  const instrKey  = isRu ? "generator_instruction_ru" : "generator_instruction_EN";
  const interpKey = isRu ? "interpretation_ru"        : "interpretation_EN";

  const SUB_LABELS = {
    archetype:    { ru: "Архетипический образ",       en: "Archetypal image" },
    resource:     { ru: "Ресурс и потенциал",         en: "Resource and potential" },
    shadow:       { ru: "Теневой аспект",             en: "Shadow aspect" },
    relationship: { ru: "В отношениях",               en: "In relationships" },
    journal:      { ru: "Вопрос для саморефлексии",   en: "Reflection question" },
  };

  const numberMap = [
    { n: nums.lifePath,    label: isRu ? "Жизненный путь" : "Life Path" },
    { n: nums.soulUrge,    label: isRu ? "Душевный порыв" : "Soul Urge" },
    { n: nums.expression,  label: isRu ? "Выражение"      : "Expression" },
    { n: nums.personality, label: isRu ? "Личность"       : "Personality" },
  ];

  const lines = [
    isRu
      ? "\n═══ СИМВОЛИЧЕСКИЙ КОНТЕКСТ — архетипические образы для саморефлексии ═══"
      : "\n═══ SYMBOLIC CONTEXT — archetypal images for self-reflection ═══",
    isRu
      ? "  (Символическая система, не научная оценка. Используй как метафору.)"
      : "  (Symbolic system, not a scientific assessment. Use as reflective metaphor.)",
  ];

  const seen = new Set();
  for (const { n, label } of numberMap) {
    if (!n || n > 22 || seen.has(n)) continue;
    seen.add(n);
    const padded  = String(n).padStart(2, "0");
    const overview = kbRecords.find(r => r.concept_code === `MD-${padded}`);
    if (!overview) continue;

    lines.push(`\n### Символический образ для числа ${n} (${label}): ${overview.concept_name}`);
    const ovrTxt = overview[interpKey];
    if (!isPlaceholder(ovrTxt)) lines.push(`  ${ovrTxt}`);

    for (const [sub, subLbl] of Object.entries(SUB_LABELS)) {
      const rec = kbRecords.find(r => r.concept_code === `MD-${padded}-${sub}`);
      if (!rec) continue;
      const instr  = rec[instrKey];
      const interp = rec[interpKey];
      lines.push(`  [${isRu ? subLbl.ru : subLbl.en}]`);
      if (!isPlaceholder(instr))  lines.push(`    Ориентир: ${instr}`);
      if (!isPlaceholder(interp)) lines.push(`    Пример: "${interp}"`);
    }
  }
  return lines.join("\n");
}

// ─── Pre-generated sections (no Claude involvement — guaranteed accuracy) ───

function renderCalcSection(steps, loc, name) {
  const L = loc.labels;
  const s = loc.sections;
  const isMaster = steps.lifePath.isMaster;
  const masterNote = isMaster
    ? `<span class="master-badge"> ★ ${loc.masterNumberNote}</span>` : "";

  return `
<h2>${s.calculations}</h2>
<p class="section-intro">${loc.calculationsIntro}</p>
<div class="calc-grid">

  <div class="calc-item">
    <h3>${s.lifePath}: <strong class="num${steps.lifePath.isMaster?" master":""}">
      ${steps.lifePath.result}${isMaster?" ★":""}
    </strong></h3>
    <p><span class="calc-label">${L.input}:</span> ${steps.lifePath.input}</p>
    <p><span class="calc-label">${L.formula}:</span>
      ${loc.language_name==="Русский"
        ? "Сумма всех цифр даты рождения → редукция до 1–9 (мастер-числа 11, 22, 33 не редуцируются)"
        : "Sum all digits of date of birth → reduce to 1–9 (master numbers 11, 22, 33 preserved)"}</p>
    <p><span class="calc-label">${L.stepByStep}:</span> <code>${steps.lifePath.steps}</code></p>
    ${isMaster ? `<p class="master-note">${loc.masterNumberNote}</p>` : ""}
  </div>

  <div class="calc-item">
    <h3>${s.soulUrge}: <strong class="num">${steps.soulUrge.result}</strong></h3>
    <p><span class="calc-label">${L.vowels}:</span> ${steps.soulUrge.input}</p>
    <p><span class="calc-label">${L.formula}:</span>
      ${loc.language_name==="Русский"
        ? "Сумма числовых значений гласных букв имени → редукция"
        : "Sum Pythagorean values of vowels in name → reduce"}</p>
    <p><span class="calc-label">${L.stepByStep}:</span> <code>${steps.soulUrge.steps}</code></p>
  </div>

  <div class="calc-item">
    <h3>${s.expression}: <strong class="num">${steps.expression.result}</strong></h3>
    <p><span class="calc-label">${L.letters}:</span> ${steps.expression.input}</p>
    <p><span class="calc-label">${L.formula}:</span>
      ${loc.language_name==="Русский"
        ? "Сумма числовых значений всех букв имени → редукция"
        : "Sum Pythagorean values of all letters in name → reduce"}</p>
    <p><span class="calc-label">${L.stepByStep}:</span> <code>${steps.expression.steps}</code></p>
  </div>

  <div class="calc-item">
    <h3>${s.personality}: <strong class="num">${steps.personality.result}</strong></h3>
    <p><span class="calc-label">${L.consonants}:</span> ${steps.personality.input}</p>
    <p><span class="calc-label">${L.formula}:</span>
      ${loc.language_name==="Русский"
        ? "Сумма числовых значений согласных букв имени → редукция"
        : "Sum Pythagorean values of consonants in name → reduce"}</p>
    <p><span class="calc-label">${L.stepByStep}:</span> <code>${steps.personality.steps}</code></p>
  </div>

  <div class="calc-item">
    <h3>${loc.language_name==="Русский"?"Личный год 2026":"Personal Year 2026"}: <strong class="num">${steps.personalYear.result}</strong></h3>
    <p><span class="calc-label">${L.formula}:</span> ${L.personalYearFormula}</p>
    <p><span class="calc-label">${L.stepByStep}:</span> <code>${steps.personalYear.steps}</code></p>
  </div>

</div>`;
}

function renderMethodologyNote(loc) {
  const title = loc.methodologyNoteTitle || "About This Report";
  const body  = (loc.methodologyNoteBody || loc.disclaimer || "")
    .split("\n\n")
    .map(para => `<p class="methodology-text">${para.trim()}</p>`)
    .join("\n  ");
  return `
<div class="methodology-block">
  <h2 class="methodology-title">${title}</h2>
  ${body}
</div>`;
}

function renderDisclaimerSection(loc) {
  const title = loc.shortDisclaimerTitle || "A Brief Note";
  const body  = loc.shortDisclaimerBody  || loc.disclaimer || "";
  return `
<div class="disclaimer-block">
  <h3 class="disclaimer-title">${title}</h3>
  <p class="disclaimer-text">${body}</p>
</div>`;
}

// ─── Life Path names ─────────────────────────────────────────────────────────
const LP_NAMES = {
  en:{1:"The Leader",2:"The Peacemaker",3:"The Creator",4:"The Builder",
      5:"The Adventurer",6:"The Nurturer",7:"The Seeker",8:"The Achiever",
      9:"The Humanitarian",11:"The Visionary",22:"The Master Builder",33:"The Teacher"},
  ru:{1:"Лидер",2:"Миротворец",3:"Творец",4:"Строитель",
      5:"Искатель",6:"Хранитель",7:"Мудрец",8:"Достигатор",
      9:"Гуманист",11:"Провидец",22:"Мастер-Строитель",33:"Учитель"},
};

const PY_THEMES = {
  ru:{
    1:"новые начинания и личная инициатива",
    2:"партнёрство, сотрудничество и терпение",
    3:"творчество, самовыражение и расширение",
    4:"строительство, дисциплина и прочная основа",
    5:"перемены, свобода и неожиданные повороты",
    6:"ответственность, забота и гармония",
    7:"внутренний поиск, осмысление и рост",
    8:"сила, признание и финансовые вопросы",
    9:"завершения, освобождение и мудрость",
    11:"интуиция, вдохновение и высшее призвание",
    22:"масштабные проекты и реализация потенциала",
  },
  en:{
    1:"new beginnings and personal initiative",
    2:"partnerships, cooperation and patience",
    3:"creativity, self-expression and expansion",
    4:"building, discipline and a solid foundation",
    5:"change, freedom and unexpected turns",
    6:"responsibility, care and harmony",
    7:"inner search, meaning and spiritual growth",
    8:"power, recognition and financial themes",
    9:"completion, release and wisdom",
    11:"intuition, inspiration and higher calling",
    22:"large-scale projects and realising potential",
  },
};

// ─── Core generation function ─────────────────────────────────────────────────
async function generateFullReading(name, date, lang) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const loc         = getLocale(lang);
  const nums        = calcNumerology(name, date, lang);
  const personalYear= calcPersonalYear(date, 2026);
  const steps       = getCalcSteps(name, date, lang);
  const zodiacSign  = getZodiac(date);
  const zodiacName  = getZodiacName(date, lang === "ru" ? "ru" : (zodiacSign[lang] ? lang : "name"));
  const zodiacDisplay = zodiacSign[lang] || zodiacSign.name;
  const easternAnimal = getEasternAnimal(date);
  const animalData    = loc.easternAnimals[easternAnimal] || { label: easternAnimal, traits: "" };
  const birthYear     = parseInt(date.split("-")[0], 10);

  const isMaster  = [11, 22, 33].includes(nums.lifePath);
  const lpKey     = lang === "ru" ? "ru" : "en";
  const lpName    = LP_NAMES[lpKey][nums.lifePath] || "";
  const pyTheme   = (PY_THEMES[lang] || PY_THEMES.en)[personalYear] || "";

  // Pre-generated sections
  const methodologyNoteHTML = renderMethodologyNote(loc);
  const calcHTML            = renderCalcSection(steps, loc, name);
  const disclaimerHTML      = renderDisclaimerSection(loc);

  // Behavioral and symbolic context blocks (internal only, cleaned)
  const behavioralBlock = buildBehavioralBlock(lang);
  const symbolicBlock   = buildSymbolicBlock(nums, lang);

  // ─── Language-specific prompts ─────────────────────────────────────────────
  // IMPORTANT: Do not add Big Five, Matrix of Destiny, EXT-/AGR-/CON-/NEG-/OPE- codes,
  // or Knowledge Base references to these prompts — the validator will reject those in output.

  const secs = loc.sections;
  const isRu = lang === "ru";

  const forbiddenReminder = isRu
    ? `
═══ КРИТИЧЕСКИЕ ПРАВИЛА ДЛЯ ВЫВОДА ═══
НЕ используй в тексте отчёта (в разделах ниже):
• Технические коды: EXT-, AGR-, CON-, NEG-, OPE-, BFI-2, любые аббревиатуры моделей
• Внутренние ссылки: "база знаний", "по инструкции", "Блок 1", "Блок 2", "ориентир гласит"
• Категоричные заявления: "ваша судьба", "это доказывает", "вы всегда", "вы никогда", "гарантирует", "предсказывает"
Используй:
• "поведенческие паттерны", "тенденции в общении", "эмоциональные реакции" — вместо названий моделей
• "символический слой для саморефлексии" — для архетипов
• "может", "нередко", "склонн(-а)", "возможно" — вместо категоричного "есть", "будет"
`
    : `
═══ CRITICAL OUTPUT RULES ═══
Do NOT use in the report sections below:
• Technical codes: EXT-, AGR-, CON-, NEG-, OPE-, BFI-2, any model abbreviations
• Internal references: "knowledge base", "per the guide", "Block 1", "Block 2"
• Absolute claims: "your destiny", "this proves", "you always", "you never", "guarantees", "predicts"
Use instead:
• "behavioral patterns", "communication tendencies", "emotional responses"
• "symbolic layer for self-reflection" for archetypes
• "may", "often", "tends to", "can" — not "is", "will always"
`;

  const prompts = {
    ru: `Ты пишешь премиальный персональный отчёт для саморефлексии для ${name}, дата рождения: ${date}.

═══ ЧИСЛОВОЙ ПРОФИЛЬ ═══
• Число жизненного пути: ${nums.lifePath}${isMaster?" ★ (МАСТЕР-ЧИСЛО)":""} — ${lpName}
• Число душевного порыва (гласные): ${nums.soulUrge}
• Число выражения (все буквы): ${nums.expression}
• Число личности (согласные): ${nums.personality}
• Личный год 2026: ${personalYear} — ${pyTheme}
• Знак Солнца: ${zodiacDisplay}
• Год рождения: ${birthYear} | Восточный символ: ${animalData.label} (символический слой — ${animalData.traits})

${behavioralBlock}

${symbolicBlock}

${forbiddenReminder}

═══ СОЗДАЙ HTML-ОТЧЁТ СО СЛЕДУЮЩИМИ РАЗДЕЛАМИ ═══
Используй ТОЛЬКО теги: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>

ВАЖНО: Раздел "${secs.calculations}" УЖЕ создан отдельно — НЕ создавай раздел с расчётами. Начни сразу с портрета.

<h2>${secs.portrait}</h2>
Персональное вступление: что делает сочетание чисел, знака и года рождения ${name} уникальным. ${isMaster?`Особое внимание — мастер-числу ${nums.lifePath}: его двойная природа, вызов и потенциал.`:""}
2–3 вдохновляющих абзаца, упоминание имени.

<h2>${secs.zodiac}: ${zodiacDisplay}</h2>
Ключевые качества этого знака. Как они взаимодействуют с числом жизненного пути ${nums.lifePath} и другими числами ${name}. Конкретные синергии.

<h2>${secs.birthYear}</h2>
${loc.birthYearIntro}
Раздел включает:
— Символический образ ${animalData.label} (${loc.birthYearSymbolicNote}): ${animalData.traits}. Как эти качества могут перекликаться с числом ${nums.lifePath}?
— Контекст ${birthYear} года: какие темы и вызовы характерны для людей, выросших в этот период? (мягко, без детерминизма)
— Как фон этого времени мог повлиять на формирование паттернов общения, реакций, ожиданий.
Тёплый, рефлексивный тон. Нет предсказаний. Минимум 150 слов.

<h2>${secs.strengths}</h2>
Используй ПОВЕДЕНЧЕСКИЙ КОНТЕКСТ выше как основу. Определи наиболее подходящий диапазон для ${name} на основе числового профиля.
Минимум 4 конкретные, персонализированные сильные стороны. Каждая — с примером того, как это может проявляться в жизни. Связь с числом жизненного пути ${nums.lifePath}.

<h2>${secs.emotional}</h2>
Нейтральный, принимающий тон. Опиши возможные эмоциональные паттерны: что может активировать стресс-реакцию, как ${name} может перерабатывать эмоции. Используй "может", "нередко", "склонна". Без диагнозов. Как архетип числа ${nums.soulUrge} (душевный порыв) может окрашивать эмоциональные реакции?

<h2>${secs.communication}</h2>
Как ${name} может взаимодействовать с другими. Стиль подачи информации, предпочтения в общении. Как число выражения ${nums.expression} влияет на способ самовыражения?

<h2>${secs.relationships}</h2>
Используй символический контекст числа ${nums.lifePath} (отношения). Что ${name} может искать в отношениях, как может проявляться, что может быть источником трений. Тёплый, рефлексивный тон.

<h2>${secs.integratedProfile}</h2>
${loc.integratedProfileIntro}
СИНТЕЗ: Как число ${nums.lifePath} (жизненный путь) взаимодействует с числом ${nums.soulUrge} (душевный порыв) — что это говорит о внутренней мотивации vs. внешних целях?
Как число ${nums.expression} (${nums.expression}) и число личности (${nums.personality}) создают разрыв или синергию между тем, как ${name} выражает себя и как воспринимается?
Как знак ${zodiacDisplay} усиливает или уравновешивает эти числа?
Как символический образ ${animalData.label} (${birthYear}) перекликается со всем профилем?
Минимум 300 слов. Это важнейший раздел отчёта.

<h2>${secs.forecast}</h2>
Личный год ${personalYear} (${pyTheme}): ключевые темы, окна возможностей, зоны роста. Как знак ${zodiacDisplay} взаимодействует с темой личного года? Конкретные акценты по кварталам 2026 года. Не предсказания — приглашение к намеренным действиям.

<h2>${secs.recommendations}</h2>
5–6 конкретных, действенных рекомендаций — список (<ul><li>). Каждая связана с одним из чисел или с сочетанием. Практично, применимо в жизни.

<h2>${secs.journalPrompts}</h2>
6–7 открытых вопросов для дневника — список. Сочетай вопросы, связанные с числами, с вопросами из символического контекста. Вопросы должны открывать пространство для размышления.

<h2>${secs.conclusion}</h2>
Завершающее послание для ${name}: что делает это сочетание чисел, знака и символического образа уникальным, какой главный вызов и подарок несёт этот профиль. Тёплые, поддерживающие слова. Призыв к осознанному пути. 2–3 абзаца.`,

    en: `You are writing a premium personal self-reflection report for ${name}, born ${date}.

═══ NUMEROLOGICAL PROFILE ═══
• Life Path: ${nums.lifePath}${isMaster?" ★ (MASTER NUMBER)":""} — ${lpName}
• Soul Urge (vowels): ${nums.soulUrge}
• Expression (all letters): ${nums.expression}
• Personality (consonants): ${nums.personality}
• Personal Year 2026: ${personalYear} — ${pyTheme}
• Sun Sign: ${zodiacDisplay}
• Birth Year: ${birthYear} | Eastern Symbol: ${animalData.label} (symbolic layer — ${animalData.traits})

${behavioralBlock}

${symbolicBlock}

${forbiddenReminder}

═══ CREATE AN HTML REPORT WITH THE FOLLOWING SECTIONS ═══
Use ONLY: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>

IMPORTANT: The "${secs.calculations}" section has ALREADY been generated — do NOT include a calculations section. Start with the Portrait.

<h2>${secs.portrait}</h2>
Personal introduction: what makes the combination of ${name}'s numbers, Sun Sign and birth year unique. ${isMaster?`Special attention to Master Number ${nums.lifePath}: its dual nature, challenge and potential.`:""}
2–3 inspiring paragraphs, refer to ${name} by name.

<h2>${secs.zodiac}: ${zodiacDisplay}</h2>
Key qualities of this sign. How they interact with Life Path ${nums.lifePath} and other numbers. Specific synergies.

<h2>${secs.birthYear}</h2>
${loc.birthYearIntro}
Include:
— Symbolic image of ${animalData.label} (${loc.birthYearSymbolicNote}): ${animalData.traits}. How might these qualities resonate with Life Path ${nums.lifePath}?
— Context of ${birthYear}: themes and challenges characteristic of people shaped by this era (gentle, non-deterministic)
— How the backdrop of this time may have influenced the formation of communication patterns, reactions, expectations
Warm, reflective tone. No predictions. Minimum 150 words.

<h2>${secs.strengths}</h2>
Use the BEHAVIORAL CONTEXT above as your foundation. Identify the most fitting range for ${name} based on the numerological profile.
Minimum 4 specific, personalised strengths — each with an example of how it might appear in daily life. Connect to Life Path ${nums.lifePath}.

<h2>${secs.emotional}</h2>
Neutral, accepting tone. Describe possible emotional patterns: what may activate stress responses, how ${name} may process emotions. Use "may", "often", "tends to". No diagnoses. How might the archetype of Soul Urge ${nums.soulUrge} colour emotional reactions?

<h2>${secs.communication}</h2>
How ${name} may interact with others. Information-sharing style, communication preferences. How might Expression ${nums.expression} influence self-expression?

<h2>${secs.relationships}</h2>
Use the symbolic context for Life Path ${nums.lifePath} (relationships). What ${name} may seek in relationships, how they may show up, what may be a source of friction. Warm, reflective tone.

<h2>${secs.integratedProfile}</h2>
${loc.integratedProfileIntro}
SYNTHESIS: How does Life Path ${nums.lifePath} interact with Soul Urge ${nums.soulUrge} — what does this say about inner motivation vs. outer goals?
How do Expression ${nums.expression} and Personality ${nums.personality} create either a gap or synergy between how ${name} expresses and how they are perceived?
How does ${zodiacDisplay} amplify or balance these numbers?
How does the symbolic image of ${animalData.label} (${birthYear}) resonate with the whole profile?
Minimum 300 words. This is the most important section.

<h2>${secs.forecast}</h2>
Personal Year ${personalYear} (${pyTheme}): key themes, windows of opportunity, growth areas. How does ${zodiacDisplay} interact with the Personal Year theme? Specific quarterly accents for 2026. Not predictions — an invitation to intentional action.

<h2>${secs.recommendations}</h2>
5–6 specific, actionable recommendations — a list (<ul><li>). Each linked to one or more numbers or their combination. Practical, applicable.

<h2>${secs.journalPrompts}</h2>
6–7 open-ended journal questions — a list. Combine number-related questions with symbolic context questions. Questions should open space for reflection.

<h2>${secs.conclusion}</h2>
A closing message for ${name}: what makes this combination of numbers, sign, and symbolic image unique, the main challenge and gift this profile carries. Warm, encouraging words. An invitation to the conscious path ahead. 2–3 paragraphs.`,

    et: `Sa lood isiklikku enesereflektsiooni aruannet ${name} jaoks, sündinud ${date}.

NUMEROLOOGILINE PROFIIL:
• Elutee number: ${nums.lifePath}${isMaster?" ★ (MEISTRARV)":""}
• Hinge number: ${nums.soulUrge} | Väljenduse number: ${nums.expression} | Isiksuse number: ${nums.personality}
• Isiklik aasta 2026: ${personalYear} | Päikesemärk: ${zodiacDisplay}
• Sünniaasta: ${birthYear} | Ida sümbol: ${animalData.label} (${animalData.traits})

${behavioralBlock}
${symbolicBlock}
${forbiddenReminder}

Loo HTML-aruanne järgmiste osadega (ainult <h2>,<h3>,<p>,<ul>,<li>,<strong>,<em>):
Ära lisa arvutuste sektsiooni — see on juba eraldi genereeritud.
${secs.portrait} | ${secs.zodiac}: ${zodiacDisplay} | ${secs.birthYear} | ${secs.strengths} | ${secs.emotional} | ${secs.communication} | ${secs.relationships} | ${secs.integratedProfile} | ${secs.forecast} | ${secs.recommendations} | ${secs.journalPrompts} | ${secs.conclusion}
Isiklik, soe toon. Vähemalt 200 sõna sektsiooni kohta. Pöördu ${name} poole nimepidi. Ärge kasutage süsteeminimesid ega sisekoode.`,

    fi: `Luot henkilökohtaista itsereflektioraporttia ${name}:lle, syntynyt ${date}.

NUMEROLOGINEN PROFIILI:
• Elämänpolku: ${nums.lifePath}${isMaster?" ★ (MESTARLUKU)":""}
• Sielun numero: ${nums.soulUrge} | Ilmaisun numero: ${nums.expression} | Persoonallisuusnumero: ${nums.personality}
• Henkilökohtainen vuosi 2026: ${personalYear} | Aurinkomerkki: ${zodiacDisplay}
• Syntymävuosi: ${birthYear} | Itäinen symboli: ${animalData.label} (${animalData.traits})

${behavioralBlock}
${symbolicBlock}
${forbiddenReminder}

Luo HTML-raportti seuraavilla osioilla (vain <h2>,<h3>,<p>,<ul>,<li>,<strong>,<em>):
Älä lisää laskenta-osiota — se on jo luotu erikseen.
${secs.portrait} | ${secs.zodiac}: ${zodiacDisplay} | ${secs.birthYear} | ${secs.strengths} | ${secs.emotional} | ${secs.communication} | ${secs.relationships} | ${secs.integratedProfile} | ${secs.forecast} | ${secs.recommendations} | ${secs.journalPrompts} | ${secs.conclusion}
Henkilökohtainen, lämmin sävy. Vähintään 200 sanaa osiota kohden. Viittaa ${name}:ään nimellä. Älä käytä sisäisiä koodeja tai mallinimiä.`,

    lv: `Tu veido personisku pašrefleksijas ziņojumu ${name}, dzimis ${date}.

NUMEROLOĢISKAIS PROFILS:
• Dzīves ceļa skaitlis: ${nums.lifePath}${isMaster?" ★ (MEISTARA SKAITLIS)":""}
• Dvēseles skaitlis: ${nums.soulUrge} | Izteiksmes skaitlis: ${nums.expression} | Personības skaitlis: ${nums.personality}
• Personīgais gads 2026: ${personalYear} | Saules zīme: ${zodiacDisplay}
• Dzimšanas gads: ${birthYear} | Austrumu simbols: ${animalData.label} (${animalData.traits})

${behavioralBlock}
${symbolicBlock}
${forbiddenReminder}

Izveido HTML ziņojumu ar šādām sadaļām (tikai <h2>,<h3>,<p>,<ul>,<li>,<strong>,<em>):
Nepievieno aprēķinu sadaļu — tā jau izveidota atsevišķi.
${secs.portrait} | ${secs.zodiac}: ${zodiacDisplay} | ${secs.birthYear} | ${secs.strengths} | ${secs.emotional} | ${secs.communication} | ${secs.relationships} | ${secs.integratedProfile} | ${secs.forecast} | ${secs.recommendations} | ${secs.journalPrompts} | ${secs.conclusion}
Personīgs, silts tonis. Vismaz 200 vārdi katrā sadaļā. Uzrunā ${name} vārdā. Neizmanto iekšējos kodus vai modeļu nosaukumus.`,

    lt: `Kuriate asmeninę savirefleksijos ataskaitą ${name}, gimęs ${date}.

NUMEROLOGINIS PROFILIS:
• Gyvenimo kelio skaičius: ${nums.lifePath}${isMaster?" ★ (MEISTRO SKAIČIUS)":""}
• Sielos skaičius: ${nums.soulUrge} | Raiškos skaičius: ${nums.expression} | Asmenybės skaičius: ${nums.personality}
• Asmeninis metų skaičius 2026: ${personalYear} | Zodiako ženklas: ${zodiacDisplay}
• Gimimo metai: ${birthYear} | Rytų simbolis: ${animalData.label} (${animalData.traits})

${behavioralBlock}
${symbolicBlock}
${forbiddenReminder}

Sukurkite HTML ataskaitą su šiais skyriais (tik <h2>,<h3>,<p>,<ul>,<li>,<strong>,<em>):
Nepridėkite skaičiavimų skyriaus — jis jau sugeneruotas atskirai.
${secs.portrait} | ${secs.zodiac}: ${zodiacDisplay} | ${secs.birthYear} | ${secs.strengths} | ${secs.emotional} | ${secs.communication} | ${secs.relationships} | ${secs.integratedProfile} | ${secs.forecast} | ${secs.recommendations} | ${secs.journalPrompts} | ${secs.conclusion}
Asmeninis, šiltas tonas. Mažiausiai 200 žodžių kiekvienam skyriui. Kreipkitės į ${name} vardu. Nenaudokite vidinių kodų ar modelių pavadinimų.`,
  };

  const prompt = prompts[lang] || prompts["en"];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 16000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  if (!data.content || !data.content[0]) throw new Error(JSON.stringify(data));

  // Strip markdown code fences that Claude sometimes wraps HTML output in
  const claudeContent = data.content[0].text
    .replace(/^```(?:html)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();

  // Assemble final report:
  // [Methodology note] + Portrait + [Calculations] + Zodiac + ... + Conclusion + [Short disclaimer]
  // Calculations section (pre-generated) is inserted before the Sun Sign section
  let bodyHTML;
  const matchIdx = claudeContent.search(/<h2>[^<]*(?:Sun Sign|Знак Солнца|Päikesemärk|Aurinkomerkki|Saules zīme|Zodiako ženklas|Zodiaka zīme)/i);
  if (matchIdx > 0) {
    bodyHTML = claudeContent.slice(0, matchIdx) + calcHTML + "\n" + claudeContent.slice(matchIdx);
  } else {
    bodyHTML = claudeContent + "\n" + calcHTML;
  }

  const finalHTML = methodologyNoteHTML + "\n" + bodyHTML + "\n" + disclaimerHTML;

  // ─── Production validation ─────────────────────────────────────────────────
  const validation = validateReport(finalHTML, lang, {
    lifePath: nums.lifePath,
    soulUrge: nums.soulUrge,
    expression: nums.expression,
    personality: nums.personality,
    personalYear,
  });

  if (!validation.passed) {
    console.error("VALIDATION FAILED for delivery:", validation.errors);
    // Log warnings even on success
    if (validation.warnings.length) console.warn("Validation warnings:", validation.warnings);
    throw new Error(`Report failed production validation: ${validation.errors.join("; ")}`);
  }

  if (validation.warnings.length) {
    console.warn("Validation warnings (non-blocking):", validation.warnings);
  }

  return finalHTML;
}

// ─── Express middleware ───────────────────────────────────────────────────────
app.use("/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.options("*", (req, res) => res.sendStatus(200));

app.get("/", (req, res) => res.json({ status: "ok", message: "Cosmic Reading proxy is running" }));

// Protected test endpoint — requires Authorization: Bearer <ANTHROPIC_API_KEY>
app.post("/generate", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const auth = (req.headers.authorization || "").replace("Bearer ", "").trim();
  if (!auth || auth !== apiKey) return res.status(401).json({ error: "Unauthorized" });

  const { name, date, lang } = req.body;
  if (!name || !date) return res.status(400).json({ error: "name and date required" });
  try {
    const html = await generateFullReading(name, date, lang || "ru");
    res.json({ status: "ok", length: html.length, html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Free preview proxy (passes through to Anthropic)
app.post("/", async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API key not configured" });
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Email delivery ───────────────────────────────────────────────────────────
async function sendEmail(to, name, htmlContent, lang) {
  const resendKey = process.env.RESEND_API_KEY;
  const loc = getLocale(lang);
  const subjects = {
    ru: `✨ Твой персональный портрет готов, ${name}`,
    en: `✨ Your Personal Portrait is ready, ${name}`,
    et: `✨ Sinu isiklik portree on valmis, ${name}`,
    fi: `✨ Henkilökohtainen muotokuvasi on valmis, ${name}`,
    lv: `✨ Tavs personīgais portrets ir gatavs, ${name}`,
    lt: `✨ Jūsų asmeninis portretas paruoštas, ${name}`,
  };
  const emailHtml = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body{font-family:Georgia,serif;background:#0a0812;color:#e0d5f5;margin:0;padding:20px}
  .container{max-width:640px;margin:0 auto;background:#12122a;border-radius:16px;padding:40px;border:1px solid #2a2a5a}
  h1{color:#c4a8ff;text-align:center;font-size:26px;margin-bottom:4px}
  .subtitle{text-align:center;color:#8a7ab5;margin-bottom:32px;font-size:14px}
  h2{color:#c4a8ff;border-bottom:1px solid #2a2a5a;padding-bottom:8px;margin-top:36px}
  h3{color:#e8c97a}
  p{line-height:1.8;color:#d0c5e8}
  ul{color:#d0c5e8;line-height:1.8} li{margin-bottom:6px}
  strong{color:#c4a8ff} em{color:#7de8d0}
  .calc-grid{display:grid;gap:16px;margin:16px 0}
  .calc-item{background:#1a1a3a;border-radius:10px;padding:16px;border:1px solid #2a2a5a}
  .calc-item h3{color:#7de8d0;margin-top:0}
  .calc-label{color:#8a7ab5;font-size:13px}
  .num{color:#c4a8ff;font-size:1.3em}
  .num.master{color:#e8c97a}
  code{background:#0a0812;padding:2px 6px;border-radius:4px;font-size:12px;color:#7de8d0}
  .master-note{color:#e8c97a;font-size:13px;font-style:italic}
  .methodology-block{margin-bottom:32px;padding:20px;background:#0f0f22;border-radius:10px;border:1px solid #2a2a5a}
  .methodology-title{color:#8a7ab5;font-size:15px;margin-top:0;margin-bottom:10px}
  .methodology-text{color:#6a5a8a;font-size:12px;line-height:1.7;margin:0 0 8px}
  .disclaimer-block{margin-top:40px;padding:20px;background:#0f0f22;border-radius:10px;border:1px solid #2a2a5a}
  .disclaimer-title{color:#6a5a8a;font-size:13px;margin-top:0;margin-bottom:6px}
  .disclaimer-text{color:#6a5a8a;font-size:12px;line-height:1.7;margin:0}
  .footer{text-align:center;margin-top:32px;color:#4a3a6a;font-size:12px}
  .section-intro{color:#8a7ab5;font-size:14px;font-style:italic}
</style></head><body><div class="container">
  <h1>✨ Cosmic Reading</h1>
  <p class="subtitle">${name} · ${lang.toUpperCase()}</p>
  ${htmlContent}
  <div class="footer"><p>cosmic-reading.netlify.app</p></div>
</div></body></html>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
    body: JSON.stringify({
      from: "Cosmic Reading <onboarding@resend.dev>",
      to: [to],
      subject: subjects[lang] || subjects["en"],
      html: emailHtml,
    }),
  });
  return response.json();
}

// ─── Stripe checkout ──────────────────────────────────────────────────────────
app.post("/create-checkout", async (req, res) => {
  try {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const { name, date, lang, email } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: "Cosmic Reading — Full Personal Portrait" },
          unit_amount: 900,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: "https://cosmic-reading.netlify.app?success=true",
      cancel_url:  "https://cosmic-reading.netlify.app",
      customer_email: email || undefined,
      metadata: {
        name:  name  || "",
        date:  date  || "",
        lang:  lang  || "en",
        email: email || "",
      },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Stripe webhook ───────────────────────────────────────────────────────────
app.post("/webhook", async (req, res) => {
  // Acknowledge immediately — Stripe requires fast response
  res.json({ received: true });

  let event;
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (stripeKey && webhookSecret) {
      const stripe = require("stripe")(stripeKey);
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        webhookSecret
      );
    } else {
      // Dev fallback — no signature verification
      event = JSON.parse(req.body);
    }
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return;
  }

  if (event.type !== "checkout.session.completed") return;

  const session = event.data.object;
  const meta = session.metadata || {};
  const name  = meta.name  || "Friend";
  const date  = meta.date  || "";
  const lang  = meta.lang  || "en";
  const email = meta.email || session.customer_email || session.customer_details?.email;

  if (!email) {
    console.error("Webhook: no email found in session", session.id);
    return;
  }
  if (!date) {
    console.error("Webhook: no date in metadata for session", session.id);
    return;
  }

  console.log(`Generating report for: ${name}, ${date}, ${lang} → ${email}`);
  try {
    const htmlContent = await generateFullReading(name, date, lang);
    const emailResult = await sendEmail(email, name, htmlContent, lang);
    console.log("Email sent:", emailResult);
  } catch (err) {
    console.error("Error generating/sending reading:", err.message);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => console.log(`Proxy running on port ${PORT}`));
