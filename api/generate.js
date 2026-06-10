require('dotenv').config();
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

async function callBedrock(prompt) {
  const modelId = process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-3-5-sonnet-20241022-v2:0';
  const res = await bedrock.send(new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept:      'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 8096,
      messages: [{ role: 'user', content: prompt }]
    })
  }));
  const body = JSON.parse(Buffer.from(res.body).toString('utf8'));
  return body.content[0].text;
}

function buildPrompt(companyName, jobTitle, street, zip, city) {
  return `Du erstellst Inhalte für eine "Schulcard" – eine visuelle Berufserkundungskarte für deutsche Schülerinnen und Schüler (14–16 Jahre).

Unternehmen: ${companyName}
Ausbildungsberuf / Duales Studium: ${jobTitle}
Adresse: ${street}, ${zip} ${city}

Recherchiere dieses Unternehmen und diesen Beruf. Erstelle hochwertige, authentische Inhalte auf Deutsch. Du-Form, jugendlich aber seriös. Wenn du keine Infos findest, erfinde realistische, glaubwürdige Inhalte.

Antworte NUR mit validem JSON – kein Markdown, keine Erklärungen:

{
  "pageTitle": "Schulcard – ${jobTitle} bei ${companyName}",
  "companyName": "vollständiger Unternehmensname",
  "companyNameShort": "Kurzname ohne Rechtsform",
  "jobTitle": "Berufsbezeichnung mit Genderstern z.B. Straßenbauer*in",
  "jobTitleShort": "Kurzform MIT Genderstern z.B. Straßenbauer*in (immer gendern)",
  "website": "https://...",
  "address": "${street} · ${zip} ${city}",
  "personName": "Typischer Azubi-Vorname",
  "personRole": "z.B. Azubi Straßenbauer · PORR",
  "companyDescription": "Kurze Beschreibung des Unternehmens, max 18 Wörter, direkt und ansprechend",
  "jobDescription": "Was du in diesem Beruf machst – 2 Sätze, Du-Form, packend",
  "importanceText": "Warum dieser Beruf wichtig ist – 2 emotionale Sätze mit einem Highlight-Wort",
  "importanceHighlight": "das Highlight-Wort oder die -phrase (1–3 Wörter)",
  "photoCaptions": ["Caption 1", "Caption 2", "Caption 3", "Caption 4"],
  "tasksDo": ["Aufgabe 1", "Aufgabe 2", "Aufgabe 3", "Aufgabe 4", "Aufgabe 5"],
  "tasksDont": ["Nicht-Aufgabe 1", "Nicht-Aufgabe 2", "Nicht-Aufgabe 3", "Nicht-Aufgabe 4"],
  "education": "Mindestabschluss z.B. Hauptschule",
  "salaryY1": 1200,
  "salaryY2": 1350,
  "salaryY3": 1500,
  "workHours": "z.B. 39 Std./Woche",
  "duration": "z.B. 3 Jahre",
  "equipment": [
    {"name": "Schutzhelm", "desc": "damit dein Kopf sicher bleibt"},
    {"name": "Warnweste", "desc": "damit du immer klar zu sehen bist"},
    {"name": "Arbeitshose", "desc": "stabil und mit Taschen"},
    {"name": "Arbeitshandschuhe", "desc": "für festen Grip und Schutz"},
    {"name": "Sicherheitsschuhe", "desc": "falls mal etwas herunterfällt"}
  ],
  "traits": [
    {"emoji": "🤝", "name": "Teamgeist", "desc": "Du arbeitest täglich eng mit anderen zusammen"},
    {"emoji": "💪", "name": "Körperliche Fitness", "desc": "Der Job ist körperlich anspruchsvoll"},
    {"emoji": "🔧", "name": "Handwerkliches Geschick", "desc": "Präzision und Technikgefühl"},
    {"emoji": "🌤️", "name": "Wetterresistenz", "desc": "Du bist bei jedem Wetter draußen"},
    {"emoji": "⏰", "name": "Zuverlässigkeit", "desc": "Pünktlichkeit und Verlässlichkeit zählen"}
  ],
  "internshipDesc": "z.B. 1–2 Wochen direkt im Betrieb",
  "applyDate": "01.08.2026",
  "applyUrl": "https://...",
  "socialInstagram": "",
  "socialFacebook": "",
  "socialYoutube": "",
  "socialLinkedin": "",
  "brandColor": "#003087",
  "brandColorLight": "#e8eef7",
  "quiz": [
    {
      "type": "wf",
      "label": "WAHR ODER FALSCH",
      "q": "Nur eine dieser Aussagen über das Unternehmen ist wahr. Welche?",
      "opts": [
        {"lbl": "AUSSAGE 1", "txt": "Eine wahre Aussage über das Unternehmen", "ok": true},
        {"lbl": "AUSSAGE 2", "txt": "Eine falsche Aussage", "ok": false},
        {"lbl": "AUSSAGE 3", "txt": "Eine falsche Aussage", "ok": false}
      ],
      "fbOk": "Richtig! Kurze Erklärung.",
      "fbErr": "Leider falsch. Richtig ist: ..."
    },
    {
      "type": "mc",
      "label": "MULTIPLE CHOICE",
      "q": "Eine Frage über den Beruf oder Arbeitsalltag",
      "opts": [
        {"txt": "Falsche Antwort", "ok": false},
        {"txt": "Richtige Antwort", "ok": true},
        {"txt": "Falsche Antwort", "ok": false},
        {"txt": "Falsche Antwort", "ok": false}
      ],
      "fbOk": "Genau! Kurze Bestätigung.",
      "fbErr": "Fast! Die richtige Antwort mit Erklärung."
    },
    {
      "type": "schaetz",
      "label": "SCHÄTZFRAGE",
      "q": "Eine Schätzfrage passend zum Beruf",
      "unit": "passende Einheit",
      "answer": 20,
      "tol": 8,
      "fbOk": "Gut geschätzt! Kurze Erklärung.",
      "fbClose": "Nah dran! Die genaue Zahl mit Kontext.",
      "fbErr": "Die Antwort: Zahl + Erklärung."
    }
  ]
}`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { companyName, jobTitle, street = '', zip = '', city = '' } = req.body;
    if (!companyName || !jobTitle) return res.status(400).json({ error: 'Unternehmensname und Beruf sind Pflicht.' });

    let raw = await callBedrock(buildPrompt(companyName, jobTitle, street, zip, city));
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    const data = JSON.parse(raw);
    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports.config = { api: { bodyParser: { sizeLimit: '1mb' } } };
