"use strict";

// ─── Production validation ──────────────────────────────────────────────────
// Run this against every generated HTML before client delivery.
// Returns { passed, status, errors, warnings }
// Status: READY_FOR_CLIENT_DELIVERY | NOT_READY_FOR_CLIENT_DELIVERY

const FORBIDDEN_PATTERNS = [
  // Internal system references
  { pattern: /knowledge\s*base/i,          category: "INTERNAL_LEAK",    description: "Direct Knowledge Base reference" },
  { pattern: /\bKB\s+v\d/i,               category: "INTERNAL_LEAK",    description: "KB version reference" },
  { pattern: /generator_instruction/i,     category: "INTERNAL_LEAK",    description: "Internal instruction field name" },
  { pattern: /interpretation_ru/i,         category: "INTERNAL_LEAK",    description: "Internal field name: interpretation_ru" },
  { pattern: /interpretation_EN/i,         category: "INTERNAL_LEAK",    description: "Internal field name: interpretation_EN" },
  { pattern: /source_tier/i,               category: "INTERNAL_LEAK",    description: "Internal field: source_tier" },
  { pattern: /approval_status/i,           category: "INTERNAL_LEAK",    description: "Internal field: approval_status" },
  { pattern: /production_status/i,         category: "INTERNAL_LEAK",    description: "Internal field: production_status" },
  { pattern: /active_for_generation/i,     category: "INTERNAL_LEAK",    description: "Internal field: active_for_generation" },
  { pattern: /concept_code/i,              category: "INTERNAL_LEAK",    description: "Internal field: concept_code" },
  { pattern: /concept_group/i,             category: "INTERNAL_LEAK",    description: "Internal field: concept_group" },
  { pattern: /report_section/i,            category: "INTERNAL_LEAK",    description: "Internal field: report_section" },
  { pattern: /\bEXT-(?:low|balanced|high)/i, category: "INTERNAL_LEAK", description: "Big Five internal level code (EXT-)" },
  { pattern: /\bAGR-(?:low|balanced|high)/i, category: "INTERNAL_LEAK", description: "Big Five internal level code (AGR-)" },
  { pattern: /\bCON-(?:low|balanced|high)/i, category: "INTERNAL_LEAK", description: "Big Five internal level code (CON-)" },
  { pattern: /\bNEG-(?:low|balanced|high)/i, category: "INTERNAL_LEAK", description: "Big Five internal level code (NEG-)" },
  { pattern: /\bOPE-(?:low|balanced|high)/i, category: "INTERNAL_LEAK", description: "Big Five internal level code (OPE-)" },
  { pattern: /MD-\d{2}-\w+/,              category: "INTERNAL_LEAK",    description: "Matrix of Destiny internal code (MD-XX-type)" },
  { pattern: /BFI-2/i,                     category: "INTERNAL_LEAK",    description: "Internal model code: BFI-2" },
  { pattern: /база знаний/i,               category: "INTERNAL_LEAK",    description: "Russian: база знаний (Knowledge Base reference)" },
  { pattern: /по инструкции/i,             category: "INTERNAL_LEAK",    description: "Russian: по инструкции (internal reference)" },
  { pattern: /основан на инструкции/i,     category: "INTERNAL_LEAK",    description: "Russian: основан на инструкции" },
  { pattern: /инструкциях Knowledge/i,     category: "INTERNAL_LEAK",    description: "Russian: инструкциях Knowledge" },
  { pattern: /Блок\s+[12]/i,              category: "INTERNAL_LEAK",    description: "Prompt block reference: Блок 1/2" },
  { pattern: /Block\s+[12]/i,             category: "INTERNAL_LEAK",    description: "Prompt block reference: Block 1/2" },

  // Safety: deterministic claims
  { pattern: /ваша судьба/i,               category: "SAFETY",           description: "Deterministic: ваша судьба" },
  { pattern: /your destiny/i,              category: "SAFETY",           description: "Deterministic: your destiny" },
  { pattern: /это (доказывает|докажет)/i,  category: "SAFETY",           description: "Deterministic Russian: это доказывает" },
  { pattern: /this proves/i,               category: "SAFETY",           description: "Deterministic: this proves" },
  { pattern: /гарантирует/i,               category: "SAFETY",           description: "Guarantee language: гарантирует" },
  { pattern: /guarantees/i,                category: "SAFETY",           description: "Guarantee language: guarantees" },
  { pattern: /вы всегда\b/i,               category: "SAFETY",           description: "Absolute claim: вы всегда" },
  { pattern: /вы никогда\b/i,              category: "SAFETY",           description: "Absolute claim: вы никогда" },
  { pattern: /you will always\b/i,         category: "SAFETY",           description: "Absolute claim: you will always" },
  { pattern: /you will never\b/i,          category: "SAFETY",           description: "Absolute claim: you will never" },
  { pattern: /\bпредсказывает\b/i,         category: "SAFETY",           description: "Deterministic: предсказывает" },
  { pattern: /\bpredicts\b/i,              category: "SAFETY",           description: "Deterministic: predicts" },
  { pattern: /<h2>[^<]*Прогноз/,           category: "SAFETY",           description: "Predictive section title: Прогноз in <h2>" },
];

// Required sections by language
const REQUIRED_SECTION_PATTERNS = {
  ru: [
    { key: "calculations",      pattern: /персональные расчёты/i },
    { key: "birthYear",         pattern: /год рождения/i },
    { key: "integratedProfile", pattern: /сводный персональный портрет|свод.*портрет/i },
    { key: "conclusion",        pattern: /заключени/i },
  ],
  en: [
    { key: "calculations",      pattern: /personal calculations/i },
    { key: "birthYear",         pattern: /birth year/i },
    { key: "integratedProfile", pattern: /integrated.*profile|personal portrait/i },
    { key: "conclusion",        pattern: /closing reflection/i },
  ],
};

const REQUIRED_SECTION_PATTERNS_FALLBACK = [
  /calculations|расчёты|arvutused|laskelmat|aprēķini|skaičiavimai/i,
  /birth year|год рождения|sünniaasta|syntymävuosi|dzimšanas gads|gimimo metai/i,
  /integrated.*profile|сводный|integreeritud|integroitu|integrētais|integruotas/i,
  /lõpumõtted|loppupohdinnat|noslēguma|baigiamieji/i,
];

// What the methodology note must mention (validated against first 4000 chars)
const METHODOLOGY_NOTE_REQUIRED_TERMS = [
  { pattern: /Big Five/i,                                                   description: "Big Five (behavioral model)" },
  { pattern: /\bDISC\b/,                                                    description: "DISC (communication model)" },
  { pattern: /Matrix of Destiny|Матрица Судьбы/i,                          description: "Matrix of Destiny (symbolic system)" },
  // "numerolo" matches all forms: numerology, numeroloogia, numerologia, numerologiją, numeroloģiju
  { pattern: /numerolo|нумерологи/i,                                        description: "numerology" },
  // zodiac in all languages
  { pattern: /zodiac|знак зодиака|sodiaag|horoskooppi|zodiaka|zodiako/i,   description: "zodiac sign" },
  // birth year: use root words that cover all inflected forms
  { pattern: /birth year|год рождения|sünniaasta|syntymävuosi|dzimšanas|gimimo/i, description: "birth year" },
];

// Short disclaimer must be present near the end
const SHORT_DISCLAIMER_PATTERNS = {
  ru: /короткое примечание|не является.*диагнозом.*предсказанием/i,
  en: /a brief note|not a.*diagnosis.*prediction/i,
  et: /lühike märkus|ei ole.*diagnoos/i,
  fi: /lyhyt huomio|ei ole.*diagnoosi/i,
  lv: /īsa piezīme|nav.*diagnoze/i,
  lt: /trumpa pastaba|nėra.*diagnozė/i,
};

function validateReport(html, lang, calculatedNumbers, displayedNumbers) {
  const errors   = [];
  const warnings = [];

  if (!html || typeof html !== "string" || html.trim().length < 500) {
    return {
      passed: false,
      status: "NOT_READY_FOR_CLIENT_DELIVERY",
      errors: ["Report is empty or too short to be valid"],
      warnings: [],
    };
  }

  // 1. Internal leakage / safety check
  for (const { pattern, category, description } of FORBIDDEN_PATTERNS) {
    if (pattern.test(html)) {
      errors.push(`[${category}] ${description}`);
    }
  }

  // 2. Methodology note: present near beginning (first 4000 chars)
  const openingBlock = html.slice(0, 4000);
  const methodologyPresent =
    /методологическая заметка|about this report|selle aruande kohta|tästä raportista|par šo ziņojumu|apie šią ataskaitą/i.test(openingBlock);
  if (!methodologyPresent) {
    errors.push("[STRUCTURE] Introductory methodology note missing from beginning of report");
  }

  // 3. Methodology note mentions required systems and models
  if (methodologyPresent) {
    for (const { pattern, description } of METHODOLOGY_NOTE_REQUIRED_TERMS) {
      if (!pattern.test(openingBlock)) {
        errors.push(`[METHODOLOGY_NOTE] Methodology note does not mention: ${description}`);
      }
    }
  }

  // 4. Short final disclaimer: present near end (last 3000 chars)
  const closingBlock = html.slice(-3000);
  const shortDisclaimerPattern = SHORT_DISCLAIMER_PATTERNS[lang] ||
    /brief note|short note|короткое примечание|lühike märkus|lyhyt huomio|īsa piezīme|trumpa pastaba/i;
  if (!shortDisclaimerPattern.test(closingBlock)) {
    errors.push("[STRUCTURE] Short final disclaimer missing from end of report");
  }

  // 5. Short disclaimer must be brief (< 800 chars from its heading to end)
  const disclaimerIdx = closingBlock.search(shortDisclaimerPattern);
  if (disclaimerIdx !== -1) {
    const disclaimerBlock = closingBlock.slice(disclaimerIdx);
    const disclaimerText = disclaimerBlock.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (disclaimerText.length > 800) {
      warnings.push("[STRUCTURE] Short final disclaimer appears longer than expected (>800 chars) — may be repeating full methodology");
    }
  }

  // 6. Required sections check
  const sectionPatterns = REQUIRED_SECTION_PATTERNS[lang] || null;
  if (sectionPatterns) {
    for (const { key, pattern } of sectionPatterns) {
      if (!pattern.test(html)) {
        errors.push(`[STRUCTURE] Missing required section: ${key}`);
      }
    }
  } else {
    for (const pattern of REQUIRED_SECTION_PATTERNS_FALLBACK) {
      if (!pattern.test(html)) {
        warnings.push(`[STRUCTURE] Possibly missing required section (pattern: ${pattern})`);
      }
    }
  }

  // 7. No abrupt cut-off (report must not end mid-sentence)
  const lastChars = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trimEnd();
  if (lastChars.length > 100) {
    const tail = lastChars.slice(-200);
    // If the last meaningful character isn't a sentence-ending punctuation or closing quote
    if (!/[.!?»"')\]]\s*$/.test(tail)) {
      warnings.push("[STRUCTURE] Report may be cut off — last characters do not end with sentence-closing punctuation");
    }
  }

  // 8. Calculation integrity check
  if (calculatedNumbers && displayedNumbers) {
    const fields = ["lifePath", "soulUrge", "expression", "personality", "personalYear"];
    for (const field of fields) {
      if (calculatedNumbers[field] !== undefined && displayedNumbers[field] !== undefined) {
        if (calculatedNumbers[field] !== displayedNumbers[field]) {
          errors.push(`[CALCULATION_MISMATCH] ${field}: calculated=${calculatedNumbers[field]}, displayed=${displayedNumbers[field]}`);
        }
      }
    }
  }

  // 9. Content length check
  const textContent = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  if (textContent.length < 2000) {
    errors.push("[CONTENT_LENGTH] Report text is too short — may indicate generation failure");
  }

  // 10. Language consistency check
  if (lang === "ru" && !/[а-яА-ЯёЁ]{5,}/.test(html)) {
    errors.push("[LANGUAGE] Report requested in Russian but contains no Cyrillic text");
  }
  if (lang !== "ru" && /[а-яА-ЯёЁ]{10,}/.test(html) && lang !== "en") {
    warnings.push("[LANGUAGE] Report may contain Cyrillic text in a non-Russian language output");
  }

  const passed = errors.length === 0;
  return {
    passed,
    status: passed ? "READY_FOR_CLIENT_DELIVERY" : "NOT_READY_FOR_CLIENT_DELIVERY",
    errors,
    warnings,
  };
}

module.exports = { validateReport, FORBIDDEN_PATTERNS };
