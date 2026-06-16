"use strict";

// ─── Letter-to-number tables ────────────────────────────────────────────────
// System: Pythagorean numerology (1–9 cycle)
// Sources:
//   Decoz, H. (1994). Numerology: Key to Your Inner Self. Avery Publishing Group.
//   Goodwin, M.O. (1981). Numerology: The Complete Guide. Newcastle Publishing.
//
// English: standard Pythagorean assignment (A=1…Z=8, cycling 1–9)
// Russian: Pythagorean cycle adapted to Cyrillic alphabet order
//   Decision: Ё treated as a distinct letter (value 7, continuing from Е=6)
//   Decision: Ъ and Ь included with assigned values (1 and 3 respectively) but treated as consonants
//   Known alternative: some systems assign Ё=6 (same as Е). Documented here as deliberate choice.
// Baltic/Finnish: Pythagorean cycle adapted; special characters mapped to base letter value
//   Status: NEEDS_REVIEW — less-established convention for these alphabets

const LETTER_VALUES_EN = {
  a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,
  j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,
  s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8,
};

// Extended English for languages using Latin alphabet (ET, FI, LV, LT)
// Special characters mapped to their base letter value
const LETTER_VALUES_LATIN_EXTENDED = {
  ...LETTER_VALUES_EN,
  // Estonian, Finnish
  ä:1, ö:6, ü:3, õ:6,  // ä→a=1, ö→o=6, ü→u=3, õ→o=6
  š:1, ž:8,             // š→s=1, ž→z=8
  // Latvian long vowels (same value as short)
  ā:1, ē:5, ī:9, ū:3,
  č:3, ģ:7, ķ:2, ļ:3, ņ:5,
  // Lithuanian
  ą:1, ę:5, ė:5, į:9, ų:3, ū:3,
};

const LETTER_VALUES_RU = {
  а:1,б:2,в:3,г:4,д:5,е:6,ё:7,ж:8,з:9,
  и:1,й:2,к:3,л:4,м:5,н:6,о:7,п:8,р:9,
  с:1,т:2,у:3,ф:4,х:5,ц:6,ч:7,ш:8,щ:9,
  ъ:1,ы:2,ь:3,э:4,ю:5,я:6,
};

// ─── Vowel definitions per alphabet ────────────────────────────────────────
// CORRECTION (v2.7): Й removed from Russian vowels — it is a semivowel/consonant
// and should NOT be included in Soul Urge (Heart's Desire) calculation.
// Previous version incorrectly included Й in the vowel set.

const VOWELS_EN    = new Set(["a","e","i","o","u"]);
// Y treated as consonant for EN (standard Pythagorean). Some systems treat Y as vowel
// when it acts as the only vowel sound. Marked as NEEDS_REVIEW for edge cases.

const VOWELS_RU    = new Set(["а","е","ё","и","о","у","ы","э","ю","я"]);
// Й excluded: semivowel, treated as consonant. Ъ and Ь excluded: silent signs.

const VOWELS_ET    = new Set(["a","e","i","o","u","ä","ö","ü","õ"]);
// Estonian: Y is not a common vowel in Estonian names; treated as consonant here

const VOWELS_FI    = new Set(["a","e","i","o","u","ä","ö","y"]);
// Finnish: Y is a full vowel (e.g., yö, työ) — included

const VOWELS_LV    = new Set(["a","ā","e","ē","i","ī","o","u","ū"]);
// Latvian: long and short vowels carry same value, both counted as vowels

const VOWELS_LT    = new Set(["a","ą","e","ę","ė","i","į","o","u","ų","ū","y"]);
// Lithuanian: Y is a vowel; all nasalised vowels included

const VOWELS_BY_LANG = {
  en: VOWELS_EN,
  ru: VOWELS_RU,
  et: VOWELS_ET,
  fi: VOWELS_FI,
  lv: VOWELS_LV,
  lt: VOWELS_LT,
};

function getVowelSet(lang) {
  return VOWELS_BY_LANG[lang] || VOWELS_EN;
}

function getLetterValues(lang) {
  return lang === "ru" ? LETTER_VALUES_RU : LETTER_VALUES_LATIN_EXTENDED;
}

// Sanitise name: keep only letters of the relevant alphabet
function sanitiseName(name, lang) {
  if (lang === "ru") {
    return name.toLowerCase().replace(/[^а-яё]/g, "").split("");
  }
  // Latin-based alphabets
  return name.toLowerCase()
    .replace(/[^a-zäöüõšžāēīūčģķļņąęėįųū]/g, "")
    .split("");
}

// ─── Master number rule ─────────────────────────────────────────────────────
// Master numbers 11, 22, 33 are NOT reduced further.
// Source: Decoz (1994), Goodwin (1981) — both preserve 11 and 22.
// 33 included as third master number per contemporary extensions of the system.

const MASTER_NUMBERS = new Set([11, 22, 33]);

function reduceNum(n) {
  while (n > 9 && !MASTER_NUMBERS.has(n)) {
    n = String(n).split("").reduce((sum, d) => sum + Number(d), 0);
  }
  return n;
}

// Personal Year: reduces to 1–9 only (master numbers not preserved for Personal Year)
// Source: Decoz (1994) — Personal Year is a transient cycle, not a core identity number
function reduceNumPersonalYear(n) {
  while (n > 9) {
    n = String(n).split("").reduce((sum, d) => sum + Number(d), 0);
  }
  return n;
}

// ─── Core calculations ──────────────────────────────────────────────────────

function calcNumerology(name, date, lang = "en") {
  const letters = sanitiseName(name, lang);
  const lv = getLetterValues(lang);
  const vowels = getVowelSet(lang);

  const dateDigits = date.replace(/-/g, "").split("").map(Number);
  const lifePathRaw = dateDigits.reduce((a, b) => a + b, 0);
  const lifePath = reduceNum(lifePathRaw);

  const vowelLetters = letters.filter(l => vowels.has(l));
  const consonantLetters = letters.filter(l => !vowels.has(l));

  const soulUrgeRaw  = vowelLetters.reduce((a, l) => a + (lv[l] || 0), 0);
  const expressionRaw= letters.reduce((a, l) => a + (lv[l] || 0), 0);
  const personalityRaw = consonantLetters.reduce((a, l) => a + (lv[l] || 0), 0);

  const soulUrge    = reduceNum(soulUrgeRaw);
  const expression  = reduceNum(expressionRaw);
  const personality = reduceNum(personalityRaw);

  return { lifePath, soulUrge, expression, personality };
}

// Personal Year: day + month + digit-sum of target year, all reduced to single digits first
// Formula documented in Calculation_Rules_v1_0.json
function calcPersonalYear(dateStr, year) {
  const [, mStr, dStr] = dateStr.split("-");
  const d = parseInt(dStr, 10);
  const m = parseInt(mStr, 10);

  const dayReduced   = d > 9 ? Math.floor(d / 10) + (d % 10) : d;
  const monthReduced = m; // months 1–12 already ≤ 9 after digit-sum if we reduce: 10→1, 11→2, 12→3
  const monthFinal   = m > 9 ? Math.floor(m / 10) + (m % 10) : m;
  const yearSum      = String(year).split("").map(Number).reduce((a, b) => a + b, 0);
  const yearReduced  = yearSum > 9 ? Math.floor(yearSum / 10) + (yearSum % 10) : yearSum;

  const total = dayReduced + monthFinal + yearReduced;
  return reduceNumPersonalYear(total);
}

// ─── Localized labels for calculation steps ─────────────────────────────────

const CALC_LABELS = {
  en: {
    day:        "Day",
    month:      "Month",
    reportYear: "Report year",
    total:      "Total",
    noVowels:      "no vowels found",
    noConsonants:  "no consonants found",
  },
  ru: {
    day:        "День",
    month:      "Месяц",
    reportYear: "Год отчёта",
    total:      "Итог",
    noVowels:      "гласных не найдено",
    noConsonants:  "согласных не найдено",
  },
  et: {
    day:        "Päev",
    month:      "Kuu",
    reportYear: "Aruande aasta",
    total:      "Kokku",
    noVowels:      "täishäälikuid ei leitud",
    noConsonants:  "kaashäälikuid ei leitud",
  },
  fi: {
    day:        "Päivä",
    month:      "Kuukausi",
    reportYear: "Raportin vuosi",
    total:      "Yhteensä",
    noVowels:      "vokaaleja ei löydy",
    noConsonants:  "konsonantteja ei löydy",
  },
  lv: {
    day:        "Diena",
    month:      "Mēnesis",
    reportYear: "Atskaites gads",
    total:      "Kopā",
    noVowels:      "patskaņu nav",
    noConsonants:  "līdzskaņu nav",
  },
  lt: {
    day:        "Diena",
    month:      "Mėnuo",
    reportYear: "Ataskaitos metai",
    total:      "Iš viso",
    noVowels:      "balsių nerasta",
    noConsonants:  "priebalsių nerasta",
  },
};

// Build multi-line Personal Year step string (uses \n, caller converts to <br>)
function buildPersonalYearSteps(d, m, year, dayReduced, monthFinal, yearSum, yearReduced, pyTotal, personalYear, labels) {
  const dayLine = d > 9
    ? `${labels.day}: ${d} → ${String(d).split("").join(" + ")} = ${dayReduced}`
    : `${labels.day}: ${d}`;

  const monthLine = m > 9
    ? `${labels.month}: ${m} → ${String(m).split("").join(" + ")} = ${monthFinal}`
    : `${labels.month}: ${m}`;

  const yearDigits = String(year).split("").join(" + ");
  let yearLine = `${labels.reportYear}: ${year} → ${yearDigits} = ${yearSum}`;
  if (yearSum > 9) {
    yearLine += ` → ${String(yearSum).split("").join(" + ")} = ${yearReduced}`;
  }

  let totalLine = `${labels.total}: ${dayReduced} + ${monthFinal} + ${yearReduced} = ${pyTotal}`;
  if (pyTotal !== personalYear) {
    totalLine += ` → ${String(pyTotal).split("").join(" + ")} = ${personalYear}`;
  }

  return [dayLine, monthLine, yearLine, totalLine].join("\n");
}

// ─── Step-by-step calculation records (for transparent section) ─────────────

function getCalcSteps(name, date, lang = "en") {
  const letters = sanitiseName(name, lang);
  const lv = getLetterValues(lang);
  const vowels = getVowelSet(lang);

  // Life Path
  const dateClean = date.replace(/-/g, "");
  const dateDigits = dateClean.split("").map(Number);
  const lifePathRaw = dateDigits.reduce((a, b) => a + b, 0);
  const lifePath = reduceNum(lifePathRaw);
  const isMaster = MASTER_NUMBERS.has(lifePath);

  // Soul Urge
  const vowelLetters = letters.filter(l => vowels.has(l));
  const vowelValues  = vowelLetters.map(l => ({ letter: l, value: lv[l] || 0 }));
  const soulUrgeRaw  = vowelValues.reduce((a, v) => a + v.value, 0);
  const soulUrge     = reduceNum(soulUrgeRaw);

  // Expression
  const allValues    = letters.map(l => ({ letter: l, value: lv[l] || 0 }));
  const expressionRaw= allValues.reduce((a, v) => a + v.value, 0);
  const expression   = reduceNum(expressionRaw);

  // Personality
  const consLetters  = letters.filter(l => !vowels.has(l));
  const consValues   = consLetters.map(l => ({ letter: l, value: lv[l] || 0 }));
  const personalityRaw = consValues.reduce((a, v) => a + v.value, 0);
  const personality  = reduceNum(personalityRaw);

  // Personal Year 2026
  const [, mStr, dStr] = date.split("-");
  const d = parseInt(dStr, 10);
  const m = parseInt(mStr, 10);
  const dayReduced   = d > 9 ? Math.floor(d / 10) + (d % 10) : d;
  const monthFinal   = m > 9 ? Math.floor(m / 10) + (m % 10) : m;
  const yearSum      = 2 + 0 + 2 + 6; // 2026
  const yearReduced  = yearSum > 9 ? Math.floor(yearSum / 10) + (yearSum % 10) : yearSum;
  const pyTotal      = dayReduced + monthFinal + yearReduced;
  const personalYear = reduceNumPersonalYear(pyTotal);

  const cl = CALC_LABELS[lang] || CALC_LABELS.en;

  return {
    lifePath: {
      result: lifePath,
      isMaster,
      input: date,
      digits: dateDigits,
      rawSum: lifePathRaw,
      steps: `${dateClean} → ${dateDigits.join(" + ")} = ${lifePathRaw}${lifePathRaw !== lifePath ? ` → ${String(lifePathRaw).split("").join(" + ")} = ${lifePath}${isMaster ? " ★" : ""}` : ""}`,
    },
    soulUrge: {
      result: soulUrge,
      input: vowelLetters.join(", ") || "—",
      values: vowelValues,
      rawSum: soulUrgeRaw,
      steps: vowelValues.length
        ? `${vowelValues.map(v => `${v.letter}=${v.value}`).join(" + ")} = ${soulUrgeRaw}${soulUrgeRaw !== soulUrge ? ` → ${soulUrge}` : ""}`
        : cl.noVowels,
    },
    expression: {
      result: expression,
      input: letters.join(", "),
      values: allValues,
      rawSum: expressionRaw,
      steps: `${allValues.map(v => `${v.letter}=${v.value}`).join(" + ")} = ${expressionRaw}${expressionRaw !== expression ? ` → ${expression}` : ""}`,
    },
    personality: {
      result: personality,
      input: consLetters.join(", ") || "—",
      values: consValues,
      rawSum: personalityRaw,
      steps: consValues.length
        ? `${consValues.map(v => `${v.letter}=${v.value}`).join(" + ")} = ${personalityRaw}${personalityRaw !== personality ? ` → ${personality}` : ""}`
        : cl.noConsonants,
    },
    personalYear: {
      result: personalYear,
      year: 2026,
      dayReduced,
      monthFinal,
      yearSum,
      yearReduced,
      total: pyTotal,
      steps: buildPersonalYearSteps(d, m, 2026, dayReduced, monthFinal, yearSum, yearReduced, pyTotal, personalYear, cl),
    },
  };
}

// ─── Zodiac sign ────────────────────────────────────────────────────────────
// Source: Standard Western tropical astrology date ranges
// Cusp dates are approximate; exact times require ephemeris calculation

const ZODIAC_SIGNS = [
  { name: "Capricorn",   ru:"Козерог",   et:"Kaljukits", fi:"Kauris",     lv:"Mežāzis",  lt:"Ožiaragis", end:[1,19]  },
  { name: "Aquarius",    ru:"Водолей",   et:"Veevalaja", fi:"Vesimies",   lv:"Ūdensvīrs", lt:"Vandenis",  end:[2,18]  },
  { name: "Pisces",      ru:"Рыбы",      et:"Kalad",     fi:"Kalat",      lv:"Zivis",     lt:"Žuvys",     end:[3,20]  },
  { name: "Aries",       ru:"Овен",      et:"Jäär",      fi:"Oinas",      lv:"Auns",      lt:"Avinas",    end:[4,19]  },
  { name: "Taurus",      ru:"Телец",     et:"Sõnn",      fi:"Härkä",      lv:"Vērsis",    lt:"Jautis",    end:[5,20]  },
  { name: "Gemini",      ru:"Близнецы",  et:"Kaksikud",  fi:"Kaksoset",   lv:"Dvīņi",     lt:"Dvyniai",   end:[6,20]  },
  { name: "Cancer",      ru:"Рак",       et:"Vähk",      fi:"Rapu",       lv:"Vēzis",     lt:"Vėžys",     end:[7,22]  },
  { name: "Leo",         ru:"Лев",       et:"Lõvi",      fi:"Leijona",    lv:"Lauva",     lt:"Liūtas",    end:[8,22]  },
  { name: "Virgo",       ru:"Дева",      et:"Neitsi",    fi:"Neitsyt",    lv:"Jaunava",   lt:"Mergelė",   end:[9,22]  },
  { name: "Libra",       ru:"Весы",      et:"Kaalud",    fi:"Vaaka",      lv:"Svari",     lt:"Svarstyklės",end:[10,22]},
  { name: "Scorpio",     ru:"Скорпион",  et:"Skorpion",  fi:"Skorpioni",  lv:"Skorpions", lt:"Skorpionas",end:[11,21] },
  { name: "Sagittarius", ru:"Стрелец",   et:"Ambur",     fi:"Jousimies",  lv:"Strēlnieks",lt:"Šaulys",    end:[12,21] },
  { name: "Capricorn",   ru:"Козерог",   et:"Kaljukits", fi:"Kauris",     lv:"Mežāzis",  lt:"Ožiaragis", end:[12,31] },
];

function getZodiac(dateStr) {
  const [, mStr, dStr] = dateStr.split("-");
  const m = parseInt(mStr, 10);
  const d = parseInt(dStr, 10);
  return ZODIAC_SIGNS.find(s => m < s.end[0] || (m === s.end[0] && d <= s.end[1])) || ZODIAC_SIGNS[0];
}

function getZodiacName(dateStr, lang) {
  const sign = getZodiac(dateStr);
  return sign[lang] || sign.name;
}

// ─── Eastern (Chinese) birth year cycle ────────────────────────────────────
// Source: Traditional Chinese calendar; 12-year animal cycle
// Chinese New Year falls in Jan–Feb; early-year births need adjustment
// Note: CNY dates shift annually. Table covers 1960–2005 (common user birth range)
// Status: symbolic layer only — not a scientific personality system

const CHINESE_NEW_YEAR = {
  1960:[1,28],1961:[2,15],1962:[2,5], 1963:[1,25],1964:[2,13],
  1965:[2,2], 1966:[1,21],1967:[2,9], 1968:[1,30],1969:[2,17],
  1970:[2,6], 1971:[1,27],1972:[2,15],1973:[2,3], 1974:[1,23],
  1975:[2,11],1976:[1,31],1977:[2,18],1978:[2,7], 1979:[1,28],
  1980:[2,16],1981:[2,5], 1982:[1,25],1983:[2,13],1984:[2,2],
  1985:[2,20],1986:[2,9], 1987:[1,29],1988:[2,17],1989:[2,6],
  1990:[1,27],1991:[2,15],1992:[2,4], 1993:[1,23],1994:[2,10],
  1995:[1,31],1996:[2,19],1997:[2,7], 1998:[1,28],1999:[2,16],
  2000:[2,5], 2001:[1,24],2002:[2,12],2003:[2,1], 2004:[1,22],
  2005:[2,9],
};

const EASTERN_ANIMALS = [
  "Rat","Ox","Tiger","Rabbit","Dragon","Snake",
  "Horse","Goat","Monkey","Rooster","Dog","Pig",
];

// Reference year: 1900 = Rat (year index 0)
const REFERENCE_YEAR = 1900;

function getEasternAnimal(dateStr) {
  const [yStr, mStr, dStr] = dateStr.split("-");
  let year = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  const d = parseInt(dStr, 10);

  // Adjust for Chinese New Year: if born before CNY of birth year, use previous year's animal
  const cny = CHINESE_NEW_YEAR[year];
  if (cny) {
    const [cnyMonth, cnyDay] = cny;
    if (m < cnyMonth || (m === cnyMonth && d < cnyDay)) {
      year -= 1; // Still in previous Chinese year
    }
  }

  const idx = ((year - REFERENCE_YEAR) % 12 + 12) % 12;
  return EASTERN_ANIMALS[idx];
}

module.exports = {
  calcNumerology,
  calcPersonalYear,
  getCalcSteps,
  getZodiac,
  getZodiacName,
  getEasternAnimal,
  MASTER_NUMBERS,
  reduceNum,
  CALC_LABELS,
  LETTER_VALUES_EN,
  LETTER_VALUES_RU,
  LETTER_VALUES_LATIN_EXTENDED,
};
