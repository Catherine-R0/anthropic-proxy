const express = require("express");
const app = express();

// Raw body for Stripe webhook verification
app.use("/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.options("*", (req, res) => res.sendStatus(200));

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Cosmic Reading proxy is running" });
});

// Main AI proxy
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

// Generate full PDF reading via AI
async function generateFullReading(name, date, lang) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  const prompts = {
    ru: `Ты опытный нумеролог и астролог. Создай полный персональный разбор для ${name}, дата рождения ${date}.

Создай детальный анализ включающий:
1. Число жизненного пути и его значение
2. Число душевного порыва
3. Число выражения/судьбы  
4. Число личности
5. Астрологический знак и его влияние
6. Прогноз на 2026 год
7. Совместимость в любви и карьере
8. Персональные рекомендации

Ответь в формате HTML с красивым оформлением, используя теги <h2>, <p>, <ul>, <li>. Пиши тепло и лично, обращаясь к ${name}.`,
    
    en: `You are an experienced numerologist and astrologer. Create a full personal reading for ${name}, born ${date}.

Create a detailed analysis including:
1. Life Path Number and its meaning
2. Soul Urge Number
3. Expression/Destiny Number
4. Personality Number
5. Astrological sign and its influence
6. Forecast for 2026
7. Love and career compatibility
8. Personal recommendations

Reply in HTML format with beautiful structure using <h2>, <p>, <ul>, <li> tags. Write warmly and personally, addressing ${name}.`,

    et: `Sa oled kogenud numeroloog ja astroloog. Loo täielik isiklik horoskoop ${name} jaoks, sündinud ${date}.

Loo üksikasjalik analüüs, sealhulgas:
1. Eluteenumber ja selle tähendus
2. Hingejõu number
3. Väljenduse/saatuse number
4. Isiksuse number
5. Astroloogiline märk ja selle mõju
6. Prognoos 2026. aastaks
7. Armastuse ja karjääri ühilduvus
8. Isiklikud soovitused

Vasta HTML-vormingus, kasutades silte <h2>, <p>, <ul>, <li>. Kirjuta soojalt ja isiklikult, pöördudes ${name} poole.`,

    fi: `Olet kokenut numerologi ja astrologi. Luo täydellinen henkilökohtainen analyysi ${name}:lle, syntynyt ${date}.

Luo yksityiskohtainen analyysi, joka sisältää:
1. Elämänpolkunumero ja sen merkitys
2. Sielun kaipauksen numero
3. Ilmaisun/kohtalon numero
4. Persoonallisuusnumero
5. Astrologinen merkki ja sen vaikutus
6. Ennuste vuodelle 2026
7. Rakkaus- ja urakumppanuus
8. Henkilökohtaiset suositukset

Vastaa HTML-muodossa käyttäen tageja <h2>, <p>, <ul>, <li>. Kirjoita lämpimästi ja henkilökohtaisesti puhutellen ${name}:ää.`,

    lv: `Tu esi pieredzējis numerologs un astrologs. Izveido pilnu personīgu raksturojumu ${name}, dzimis ${date}.

Izveido detalizētu analīzi, ieskaitot:
1. Dzīves ceļa skaitlis un tā nozīme
2. Dvēseles tieksmes skaitlis
3. Izteiksmes/likteņa skaitlis
4. Personības skaitlis
5. Astroloģiskā zīme un tās ietekme
6. Prognoze 2026. gadam
7. Mīlestības un karjeras saderība
8. Personīgie ieteikumi

Atbildi HTML formātā, izmantojot tagus <h2>, <p>, <ul>, <li>. Raksti silti un personiski, uzrunājot ${name}.`,

    lt: `Tu esi patyręs numerologas ir astrologas. Sukurk išsamią asmeninę charakteristiką ${name}, gimęs ${date}.

Sukurk išsamią analizę, įskaitant:
1. Gyvenimo kelio skaičius ir jo reikšmė
2. Sielos troškimo skaičius
3. Išraiškos/likimo skaičius
4. Asmenybės skaičius
5. Astrologinis ženklas ir jo įtaka
6. Prognozė 2026 metams
7. Meilės ir karjeros suderinamumas
8. Asmeninės rekomendacijos

Atsakyk HTML formatu naudodamas žymes <h2>, <p>, <ul>, <li>. Rašyk šiltai ir asmeniškai, kreipdamasis į ${name}.`
  };

  const prompt = prompts[lang] || prompts['en'];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }]
    }),
  });

  const data = await response.json();
  return data.content[0].text;
}

// Send email via Resend
async function sendEmail(to, name, htmlContent, lang) {
  const resendKey = process.env.RESEND_API_KEY;
  
  const subjects = {
    ru: `✨ Твой космический портрет готов, ${name}!`,
    en: `✨ Your Cosmic Reading is ready, ${name}!`,
    et: `✨ Sinu kosmilised kaardid on valmis, ${name}!`,
    fi: `✨ Kosminen lukemisesi on valmis, ${name}!`,
    lv: `✨ Tavs kosmiskais portrets ir gatavs, ${name}!`,
    lt: `✨ Tavo kosminis portretas paruoštas, ${name}!`
  };

  const subject = subjects[lang] || subjects['en'];

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Georgia, serif; background: #0a0a1a; color: #e0d5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #12122a; border-radius: 16px; padding: 40px; border: 1px solid #2a2a5a; }
        h1 { color: #c4a8ff; text-align: center; font-size: 28px; margin-bottom: 10px; }
        .subtitle { text-align: center; color: #8a7ab5; margin-bottom: 30px; }
        h2 { color: #c4a8ff; border-bottom: 1px solid #2a2a5a; padding-bottom: 8px; }
        p { line-height: 1.8; color: #d0c5e8; }
        ul { color: #d0c5e8; line-height: 1.8; }
        .footer { text-align: center; margin-top: 40px; color: #5a4a7a; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✨ Cosmic Reading</h1>
        <p class="subtitle">Your personal numerology & astrology portrait</p>
        ${htmlContent}
        <div class="footer">
          <p>cosmic-reading.netlify.app</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${resendKey}`
    },
    body: JSON.stringify({
      from: "Cosmic Reading <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: emailHtml
    })
  });

  return response.json();
}

// Stripe webhook
app.post("/webhook", async (req, res) => {
  // TEST MODE: hardcoded data, signature check disabled
  const email = "katikero@gmail.com";
  const name = "Катя";
  const date = "1990-06-15";
  const lang = "ru";

  console.log(`Payment received! Email: ${email}, Name: ${name}`);

  try {
    const htmlContent = await generateFullReading(name, date, lang);
    await sendEmail(email, name, htmlContent, lang);
    console.log(`Email sent to ${email}`);
  } catch (err) {
    console.error("Error generating/sending reading:", err);
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => console.log(`Proxy running on port ${PORT}`));
