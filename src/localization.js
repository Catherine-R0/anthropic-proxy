"use strict";

// Status values: APPROVED | NEEDS_REVIEW | MACHINE_TRANSLATED_NEEDS_HUMAN_REVIEW | NOT_READY
const LOCALIZATION = {
  en: {
    language_name: "English",
    translation_status: "APPROVED",
    localization_status: "APPROVED",
    approved_for_language: true,
    active_for_generation: true,

    sections: {
      portrait:          "✦ Your Personal Portrait",
      calculations:      "✦ Your Personal Calculations",
      lifePath:          "✦ Life Path",
      soulUrge:          "✦ Soul Urge",
      expression:        "✦ Expression Number",
      personality:       "✦ Personality Number",
      zodiac:            "✦ Sun Sign",
      birthYear:         "✦ Birth Year and Life Context",
      strengths:         "✦ Strengths",
      emotional:         "✦ Emotional Patterns",
      communication:     "✦ Communication Style",
      relationships:     "✦ In Relationships",
      recommendations:   "✦ Practical Recommendations",
      journalPrompts:    "✦ Reflection Prompts",
      forecast:          "✦ Personal Year Forecast",
      integratedProfile: "✦ Integrated Personal Profile",
    },

    disclaimer: "This report is created for self-reflection and a deeper understanding of personal patterns. It combines behavioral reference models (Big Five personality research) and symbolic interpretation systems (numerology, Sun sign, birth year symbolism). This report is not a psychological diagnosis, medical, legal, or financial advice, and it does not claim to predict your future. All interpretations are invitations to self-reflection — not fixed truths about who you are.",

    behavioralLayerNote: "This section draws on behavioral pattern research to describe possible tendencies in communication, emotional response, and adaptation. These are descriptions of patterns — not fixed labels or diagnoses.",
    symbolicLayerNote: "This section uses symbolic interpretation systems as a reflective mirror. These systems are not scientifically proven personality models — they are symbolic languages that can help notice patterns and ask meaningful questions.",

    calculationsIntro: "Below are the step-by-step calculations behind every number shown in your report. All calculations are based on your name and date of birth.",
    birthYearIntro: "Your birth year serves as an additional context layer in this portrait. It reflects the broader backdrop against which habits, expectations, reactions, and ways of adapting may have formed.",
    birthYearSymbolicNote: "The Eastern birth year cycle is used here as a symbolic self-reflection layer — not a scientific personality system.",
    integratedProfileIntro: "This section brings together your name, date of birth, Life Path, Soul Urge, Expression, Personality numbers, Personal Year, Sun Sign, birth year context, and behavioral patterns into a single coherent portrait — showing how these layers interact, not just listing them separately.",

    masterNumberNote: "Master Number — carries amplified energy. Worked with as a double vibration: the foundation number and the master layer above it.",

    labels: {
      input: "Input",
      letters: "Letters",
      vowels: "Vowels",
      consonants: "Consonants",
      digitSum: "Digit sum",
      reduction: "Reduction",
      result: "Result",
      masterPreserved: "Master Number — not reduced further",
      stepByStep: "Step by step",
      formula: "Formula",
      personalYearFormula: "Birth day + birth month + year digit sum → reduce to 1–9",
    },

    easternAnimals: {
      Rat:     { label: "Rat",    traits: "Resourceful, adaptable, quick-thinking, observant" },
      Ox:      { label: "Ox",     traits: "Persistent, reliable, methodical, strong-willed" },
      Tiger:   { label: "Tiger",  traits: "Courageous, passionate, independent, dynamic" },
      Rabbit:  { label: "Rabbit", traits: "Thoughtful, gentle, creative, perceptive" },
      Dragon:  { label: "Dragon", traits: "Visionary, confident, imaginative, ambitious" },
      Snake:   { label: "Snake",  traits: "Intuitive, reflective, wise, perceptive" },
      Horse:   { label: "Horse",  traits: "Energetic, adventurous, free-spirited, sociable" },
      Goat:    { label: "Goat",   traits: "Creative, empathetic, calm, thoughtful" },
      Monkey:  { label: "Monkey", traits: "Versatile, witty, curious, clever" },
      Rooster: { label: "Rooster",traits: "Observant, precise, confident, expressive" },
      Dog:     { label: "Dog",    traits: "Loyal, honest, caring, principled" },
      Pig:     { label: "Pig",    traits: "Sincere, generous, diligent, warm-hearted" },
    },
  },

  ru: {
    language_name: "Русский",
    translation_status: "APPROVED",
    localization_status: "APPROVED",
    approved_for_language: true,
    active_for_generation: true,

    sections: {
      portrait:          "✦ Твой персональный портрет",
      calculations:      "✦ Твои персональные расчёты",
      lifePath:          "✦ Число жизненного пути",
      soulUrge:          "✦ Число душевного порыва",
      expression:        "✦ Число выражения",
      personality:       "✦ Число личности",
      zodiac:            "✦ Знак Солнца",
      birthYear:         "✦ Год рождения и жизненный контекст",
      strengths:         "✦ Сильные стороны",
      emotional:         "✦ Эмоциональные паттерны",
      communication:     "✦ Стиль общения",
      relationships:     "✦ В отношениях",
      recommendations:   "✦ Практические рекомендации",
      journalPrompts:    "✦ Вопросы для саморефлексии",
      forecast:          "✦ Прогноз на 2026 год",
      integratedProfile: "✦ Сводный персональный портрет",
    },

    disclaimer: "Этот отчёт создан для саморефлексии и более глубокого понимания личных паттернов. Он сочетает поведенческие ориентиры (исследования личностных паттернов) и символические системы интерпретации (нумерология, знак Солнца, символика года рождения). Отчёт не является психологическим диагнозом, медицинской, юридической или финансовой рекомендацией, а также не претендует на предсказание будущего. Все интерпретации — это приглашения к саморефлексии, а не фиксированные истины о том, кто ты есть.",

    behavioralLayerNote: "Этот раздел опирается на исследования поведенческих паттернов для описания возможных тенденций в общении, эмоциональном реагировании и адаптации. Это описание паттернов — не фиксированные ярлыки и не диагноз.",
    symbolicLayerNote: "Этот раздел использует символические системы интерпретации как зеркало для саморефлексии. Эти системы не являются научно проверенными моделями личности — это символические языки, помогающие замечать паттерны и задавать значимые вопросы.",

    calculationsIntro: "Ниже — пошаговые расчёты для каждого числа, показанного в твоём отчёте. Все расчёты основаны на твоём имени и дате рождения.",
    birthYearIntro: "Год рождения служит дополнительным контекстным слоем в этом портрете. Он отражает более широкий фон, на котором могли сформироваться привычки, ожидания, реакции и способы адаптации.",
    birthYearSymbolicNote: "Восточный цикл года рождения используется здесь как символический слой саморефлексии — не как научная система описания личности.",
    integratedProfileIntro: "Этот раздел объединяет имя, дату рождения, Число жизненного пути, Душевного порыва, Выражения, Личности, Личный год, Знак Солнца, контекст года рождения и поведенческие ориентиры в единый связный портрет — показывая, как эти слои взаимодействуют между собой, а не просто перечисляя их.",

    masterNumberNote: "Мастер-число — несёт усиленную энергию. Работается как двойная вибрация: базовое число и мастер-уровень над ним.",

    labels: {
      input: "Исходные данные",
      letters: "Буквы",
      vowels: "Гласные",
      consonants: "Согласные",
      digitSum: "Сумма цифр",
      reduction: "Редукция",
      result: "Результат",
      masterPreserved: "Мастер-число — дальнейшая редукция не применяется",
      stepByStep: "Пошагово",
      formula: "Формула",
      personalYearFormula: "День рождения + месяц рождения + сумма цифр года → редукция до 1–9",
    },

    easternAnimals: {
      Rat:     { label: "Крыса",   traits: "Находчивость, адаптивность, острый ум, наблюдательность" },
      Ox:      { label: "Бык",     traits: "Упорство, надёжность, методичность, сила воли" },
      Tiger:   { label: "Тигр",    traits: "Смелость, страстность, независимость, динамичность" },
      Rabbit:  { label: "Кролик",  traits: "Вдумчивость, мягкость, творчество, проницательность" },
      Dragon:  { label: "Дракон",  traits: "Видение, уверенность, воображение, амбициозность" },
      Snake:   { label: "Змея",    traits: "Интуиция, глубина, мудрость, проницательность" },
      Horse:   { label: "Лошадь",  traits: "Энергичность, авантюризм, свободолюбие, общительность" },
      Goat:    { label: "Коза",    traits: "Творчество, эмпатия, спокойствие, вдумчивость" },
      Monkey:  { label: "Обезьяна",traits: "Разносторонность, остроумие, любопытство, находчивость" },
      Rooster: { label: "Петух",   traits: "Наблюдательность, точность, уверенность, выразительность" },
      Dog:     { label: "Собака",  traits: "Преданность, честность, забота, принципиальность" },
      Pig:     { label: "Свинья",  traits: "Искренность, щедрость, трудолюбие, сердечность" },
    },
  },

  et: {
    language_name: "Eesti",
    translation_status: "MACHINE_TRANSLATED_NEEDS_HUMAN_REVIEW",
    localization_status: "NEEDS_REVIEW",
    approved_for_language: false,
    active_for_generation: true,

    sections: {
      portrait:          "✦ Sinu isiklik portree",
      calculations:      "✦ Sinu isiklikud arvutused",
      lifePath:          "✦ Elutee number",
      soulUrge:          "✦ Hinge number",
      expression:        "✦ Väljenduse number",
      personality:       "✦ Isiksuse number",
      zodiac:            "✦ Päikesemärk",
      birthYear:         "✦ Sünniaasta ja elukonksteks",
      strengths:         "✦ Tugevused",
      emotional:         "✦ Emotsionaalsed mustrid",
      communication:     "✦ Suhtlemisstiil",
      relationships:     "✦ Suhetes",
      recommendations:   "✦ Praktilised soovitused",
      journalPrompts:    "✦ Mõtiskluse küsimused",
      forecast:          "✦ Isikliku aasta prognoos",
      integratedProfile: "✦ Integreeritud isiklik portree",
    },

    disclaimer: "See aruanne on loodud eneserefleksiooniks ja isiklike mustrite paremaks mõistmiseks. See ühendab käitumuslikke viitemudeleid ja sümboolseid tõlgendussüsteeme. See ei ole psühholoogiline diagnoos, meditsiiniline, juriidiline ega finantsnõustamine ega pretendeeri tuleviku ennustamisele.",
    behavioralLayerNote: "See jaotis kasutab käitumuslikke viitemudeleid suhtlemismustrite, emotsionaalse reageerimise ja kohanemise kirjeldamiseks. See ei ole diagnoos ega fikseeritud etikett.",
    symbolicLayerNote: "See jaotis kasutab sümboolseid tõlgendussüsteeme eneserefleksiooniks. Need süsteemid ei ole teaduslikult tõestatud isiksusmudelid.",
    calculationsIntro: "Allpool on täpsed arvutused iga arvu jaoks, mis on sinu aruandes näidatud.",
    birthYearIntro: "Sünniaasta kasutatakse lisakonksteksina. See aitab mõtiskleda laiema elutausta üle.",
    birthYearSymbolicNote: "Ida-sünniaasta tsüklit kasutatakse siin sümboolse eneserefleksiooni kihina.",
    integratedProfileIntro: "See jaotis ühendab sinu nime, sünnikuupäeva, kõik arvud, sodiaagimärgi, sünniaasta ja käitumuslikud mustrid ühtseks isiklikuks portreeks.",
    masterNumberNote: "Meistrarv — kandab võimendatud energiat.",
    labels: {
      input: "Sisend", letters: "Tähed", vowels: "Täishäälikud", consonants: "Kaashäälikud",
      digitSum: "Numbrite summa", reduction: "Redutseerimine", result: "Tulemus",
      masterPreserved: "Meistrarv — ei redutseerita edasi", stepByStep: "Samm-sammult",
      formula: "Valem", personalYearFormula: "Sünniday + sünnikuu + aasta numbrite summa → redutseeritakse 1–9ni",
    },
    easternAnimals: {
      Rat:{label:"Rott",traits:"Leidlik, kohanemisvõimeline, terane"}, Ox:{label:"Härg",traits:"Püsiv, usaldusväärne, metodiline"},
      Tiger:{label:"Tiiger",traits:"Julge, kirglane, sõltumatu"}, Rabbit:{label:"Küülik",traits:"Mõtlik, hell, loov"},
      Dragon:{label:"Draakon",traits:"Visionäärne, enesekindel, ambitsioonikas"}, Snake:{label:"Madu",traits:"Intuitiivne, mõtlik, tark"},
      Horse:{label:"Hobune",traits:"Energiline, seiklushimuline, vabameelne"}, Goat:{label:"Kits",traits:"Loov, empaatiline, rahulik"},
      Monkey:{label:"Ahv",traits:"Mitmekülgne, vaimukas, uudishimulik"}, Rooster:{label:"Kukk",traits:"Tähelepanelik, täpne, enesekindel"},
      Dog:{label:"Koer",traits:"Lojaalne, aus, hooliv"}, Pig:{label:"Siga",traits:"Siiras, helde, töökene"},
    },
  },

  fi: {
    language_name: "Suomi",
    translation_status: "MACHINE_TRANSLATED_NEEDS_HUMAN_REVIEW",
    localization_status: "NEEDS_REVIEW",
    approved_for_language: false,
    active_for_generation: true,

    sections: {
      portrait:          "✦ Henkilökohtainen muotokuvasi",
      calculations:      "✦ Henkilökohtaiset laskelmasi",
      lifePath:          "✦ Elämänpolun numero",
      soulUrge:          "✦ Sielun numero",
      expression:        "✦ Ilmaisun numero",
      personality:       "✦ Persoonallisuusnumero",
      zodiac:            "✦ Aurinkomerkki",
      birthYear:         "✦ Syntymävuosi ja elämänkonteksti",
      strengths:         "✦ Vahvuudet",
      emotional:         "✦ Tunnemallit",
      communication:     "✦ Viestintätyyli",
      relationships:     "✦ Suhteissa",
      recommendations:   "✦ Käytännön suositukset",
      journalPrompts:    "✦ Pohdintakysymykset",
      forecast:          "✦ Henkilökohtaisen vuoden ennuste",
      integratedProfile: "✦ Integroitu henkilökohtainen profiili",
    },

    disclaimer: "Tämä raportti on luotu itsereflektioon ja henkilökohtaisten mallien parempaan ymmärtämiseen. Se ei ole psykologinen diagnoosi, lääketieteellinen, oikeudellinen tai taloudellinen neuvonta eikä väitä ennustavansa tulevaisuutta.",
    behavioralLayerNote: "Tämä osio kuvaa mahdollisia taipumuksia viestinnässä, tunnereaktiossa ja sopeutumisessa. Se ei ole diagnoosi eikä kiinteä persoonallisuusmerkintä.",
    symbolicLayerNote: "Tämä osio käyttää symbolisia tulkintajärjestelmiä itsereflektioon. Ne eivät ole tieteellisesti todistettuja persoonallisuusmalleja.",
    calculationsIntro: "Alla ovat tarkat laskelmat jokaiselle raportissasi näytetylle numerolle.",
    birthYearIntro: "Syntymävuottasi käytetään lisäkontekstina. Se auttaa pohtimaan laajempaa elämänkontekstia.",
    birthYearSymbolicNote: "Itäistä syntymävuosisykliä käytetään symbolisena itsereflektiokerroksena.",
    integratedProfileIntro: "Tämä osio yhdistää nimesi, syntymäaikasi, kaikki numerot, horoskooppimerkin ja elämänkontekstin yhtenäiseksi muotokuvaksi.",
    masterNumberNote: "Mestarluku — kantaa vahvistettua energiaa.",
    labels: {
      input: "Syöte", letters: "Kirjaimet", vowels: "Vokaalit", consonants: "Konsonantit",
      digitSum: "Numeroiden summa", reduction: "Reduktio", result: "Tulos",
      masterPreserved: "Mestarluku — ei redusoida edelleen", stepByStep: "Askel askeleelta",
      formula: "Kaava", personalYearFormula: "Syntymäpäivä + syntymäkuukausi + vuoden numerosumma → redusoidaan 1–9:ksi",
    },
    easternAnimals: {
      Rat:{label:"Rotta",traits:"Kekseliäs, sopeutuvainen, nopeaälyinen"}, Ox:{label:"Härkä",traits:"Sinnikäs, luotettava, järjestelmällinen"},
      Tiger:{label:"Tiikeri",traits:"Rohkea, intohimoinen, itsenäinen"}, Rabbit:{label:"Kani",traits:"Harkitseva, herkkä, luova"},
      Dragon:{label:"Lohikäärme",traits:"Visionäärinen, itsevarma, kunnianhimoinen"}, Snake:{label:"Käärme",traits:"Intuitiivinen, harkitseva, viisas"},
      Horse:{label:"Hevonen",traits:"Energinen, seikkailunhaluinen, vapaamielinen"}, Goat:{label:"Vuohi",traits:"Luova, empaattinen, rauhallinen"},
      Monkey:{label:"Apina",traits:"Monipuolinen, nokkela, utelias"}, Rooster:{label:"Kukko",traits:"Tarkkaavainen, tarkka, itsevarma"},
      Dog:{label:"Koira",traits:"Uskollinen, rehellinen, huolehtiva"}, Pig:{label:"Sika",traits:"Vilpitön, antelias, ahkera"},
    },
  },

  lv: {
    language_name: "Latviešu",
    translation_status: "MACHINE_TRANSLATED_NEEDS_HUMAN_REVIEW",
    localization_status: "NEEDS_REVIEW",
    approved_for_language: false,
    active_for_generation: true,

    sections: {
      portrait:          "✦ Tavs personīgais portrets",
      calculations:      "✦ Tavi personīgie aprēķini",
      lifePath:          "✦ Dzīves ceļa skaitlis",
      soulUrge:          "✦ Dvēseles skaitlis",
      expression:        "✦ Izteiksmes skaitlis",
      personality:       "✦ Personības skaitlis",
      zodiac:            "✦ Zodiaka zīme",
      birthYear:         "✦ Dzimšanas gads un dzīves konteksts",
      strengths:         "✦ Stiprās puses",
      emotional:         "✦ Emocionālie modeļi",
      communication:     "✦ Komunikācijas stils",
      relationships:     "✦ Attiecībās",
      recommendations:   "✦ Praktiskie ieteikumi",
      journalPrompts:    "✦ Pārdomas un jautājumi",
      forecast:          "✦ Personīgā gada prognoze",
      integratedProfile: "✦ Integrētais personīgais portrets",
    },

    disclaimer: "Šis ziņojums ir izveidots pašrefleksijai un personisko modeļu labākai izpratnei. Tas nav psiholoģiska diagnoze, medicīnisks, juridisks vai finansiāls padoms, un tas nepretendē uz nākotnes prognozēšanu.",
    behavioralLayerNote: "Šī sadaļa apraksta iespējamās tendences komunikācijā, emocionālajā reakcijā un pielāgošanās spējā. Tas nav diagnoze vai fiksēta etiķete.",
    symbolicLayerNote: "Šī sadaļa izmanto simboliskās interpretācijas sistēmas pašrefleksijai. Šīs sistēmas nav zinātniski pierādīti personības modeļi.",
    calculationsIntro: "Zemāk ir precīzi aprēķini katram skaitlim, kas rādīts tavā ziņojumā.",
    birthYearIntro: "Tavs dzimšanas gads tiek izmantots kā papildu konteksta slānis šajā portretā.",
    birthYearSymbolicNote: "Austrumu dzimšanas gada cikls tiek izmantots kā simbolisks pašrefleksijas slānis.",
    integratedProfileIntro: "Šī sadaļa apvieno tavu vārdu, dzimšanas datumu, visus skaitļus, zodiaka zīmi un dzīves kontekstu vienotā personīgajā portretā.",
    masterNumberNote: "Meistara skaitlis — nes pastiprinātu enerģiju.",
    labels: {
      input: "Ievade", letters: "Burti", vowels: "Patskaņi", consonants: "Līdzskaņi",
      digitSum: "Ciparu summa", reduction: "Redukcija", result: "Rezultāts",
      masterPreserved: "Meistara skaitlis — netiek reducēts tālāk", stepByStep: "Soli pa solim",
      formula: "Formula", personalYearFormula: "Dzimšanas diena + dzimšanas mēnesis + gada ciparu summa → reducē līdz 1–9",
    },
    easternAnimals: {
      Rat:{label:"Žurka",traits:"Atjautīgs, pielāgojams, ātri domājošs"}, Ox:{label:"Vērsis",traits:"Neatlaidīgs, uzticams, metodisks"},
      Tiger:{label:"Tīģeris",traits:"Drošsirdīgs, kaislīgs, neatkarīgs"}, Rabbit:{label:"Trusis",traits:"Pārdomāts, maigs, radošs"},
      Dragon:{label:"Pūķis",traits:"Vīzionārs, pašpārliecināts, ambiciozs"}, Snake:{label:"Čūska",traits:"Intuitīvs, pārdomāts, gudrs"},
      Horse:{label:"Zirgs",traits:"Enerģisks, piedzīvojumiem tiekošs, brīvmīlīgs"}, Goat:{label:"Kaza",traits:"Radošs, empātisks, mierīgs"},
      Monkey:{label:"Pērtiķis",traits:"Daudzpusīgs, asprātīgs, ziņkārīgs"}, Rooster:{label:"Gailis",traits:"Vērīgs, precīzs, pašpārliecināts"},
      Dog:{label:"Suns",traits:"Uzticīgs, godīgs, rūpīgs"}, Pig:{label:"Cūka",traits:"Sirsnīgs, dāsns, čakls"},
    },
  },

  lt: {
    language_name: "Lietuvių",
    translation_status: "MACHINE_TRANSLATED_NEEDS_HUMAN_REVIEW",
    localization_status: "NEEDS_REVIEW",
    approved_for_language: false,
    active_for_generation: true,

    sections: {
      portrait:          "✦ Jūsų asmeninis portretas",
      calculations:      "✦ Jūsų asmeniniai skaičiavimai",
      lifePath:          "✦ Gyvenimo kelio skaičius",
      soulUrge:          "✦ Sielos skaičius",
      expression:        "✦ Raiškos skaičius",
      personality:       "✦ Asmenybės skaičius",
      zodiac:            "✦ Zodiako ženklas",
      birthYear:         "✦ Gimimo metai ir gyvenimo kontekstas",
      strengths:         "✦ Stiprybės",
      emotional:         "✦ Emociniai modeliai",
      communication:     "✦ Bendravimo stilius",
      relationships:     "✦ Santykiuose",
      recommendations:   "✦ Praktinės rekomendacijos",
      journalPrompts:    "✦ Apmąstymų klausimai",
      forecast:          "✦ Asmeninio meto prognozė",
      integratedProfile: "✦ Integruotas asmeninis portretas",
    },

    disclaimer: "Ši ataskaita skirta savęs pažinimui ir asmeninių modelių geresniam supratimui. Ji nėra psichologinė diagnozė, medicininė, teisinė ar finansinė konsultacija ir nepretenduje numatyti ateities.",
    behavioralLayerNote: "Šiame skyriuje apibūdinamos galimos tendencijos bendraujant, emociškai reaguojant ir prisitaikant. Tai ne diagnozė ar fiksuota etiketė.",
    symbolicLayerNote: "Šiame skyriuje naudojamos simbolinės interpretacijos sistemos savirefleksijai. Šios sistemos nėra moksliškai įrodyti asmenybės modeliai.",
    calculationsIntro: "Žemiau pateikiami tikslūs skaičiavimai kiekvienam jūsų ataskaitoje rodomam skaičiui.",
    birthYearIntro: "Jūsų gimimo metai naudojami kaip papildomas konteksto sluoksnis šiame portrete.",
    birthYearSymbolicNote: "Rytų gimimo metų ciklas naudojamas kaip simbolinis savirefleksijos sluoksnis.",
    integratedProfileIntro: "Šiame skyriuje sujungiamas jūsų vardas, gimimo data, visi skaičiai, zodiako ženklas ir gyvenimo kontekstas į vientisą asmeninį portretą.",
    masterNumberNote: "Meistro skaičius — neša sustiprintą energiją.",
    labels: {
      input: "Įvestis", letters: "Raidės", vowels: "Balsiai", consonants: "Priebalsiai",
      digitSum: "Skaitmenų suma", reduction: "Redukcija", result: "Rezultatas",
      masterPreserved: "Meistro skaičius — toliau neredukuojamas", stepByStep: "Žingsnis po žingsnio",
      formula: "Formulė", personalYearFormula: "Gimimo diena + gimimo mėnuo + metų skaitmenų suma → redukuojama iki 1–9",
    },
    easternAnimals: {
      Rat:{label:"Žiurkė",traits:"Išradingas, prisitaikantis, greito proto"}, Ox:{label:"Jautis",traits:"Atkaklus, patikimas, metodiškas"},
      Tiger:{label:"Tigras",traits:"Drąsus, aistringas, nepriklausomas"}, Rabbit:{label:"Triušis",traits:"Apgalvotas, švelnus, kūrybingas"},
      Dragon:{label:"Drakonas",traits:"Vizionieriškas, pasitikintis savimi, ambicingas"}, Snake:{label:"Gyvatė",traits:"Intuityvus, apmąstantis, išmintingas"},
      Horse:{label:"Arklys",traits:"Energingas, nuotykių ieškantis, laisvamintiškas"}, Goat:{label:"Ožka",traits:"Kūrybingas, empatingas, ramus"},
      Monkey:{label:"Beždžionė",traits:"Universalus, sąmojingas, smalsus"}, Rooster:{label:"Gaidys",traits:"Stebėjimo, tikslus, pasitikintis savimi"},
      Dog:{label:"Šuo",traits:"Ištikimas, sąžiningas, rūpestingas"}, Pig:{label:"Kiaulė",traits:"Nuoširdus, dosnus, darbštus"},
    },
  },
};

function getLocale(lang) {
  return LOCALIZATION[lang] || LOCALIZATION["en"];
}

function isApprovedForGeneration(lang) {
  const loc = LOCALIZATION[lang];
  if (!loc) return false;
  return loc.approved_for_language === true &&
         loc.active_for_generation === true &&
         loc.localization_status === "APPROVED";
}

module.exports = { LOCALIZATION, getLocale, isApprovedForGeneration };
