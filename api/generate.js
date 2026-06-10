require('dotenv').config();
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

async function callBedrock(systemPrompt, userPrompt) {
  const modelId = process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-3-5-sonnet-20241022-v2:0';
  const res = await bedrock.send(new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept:      'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 8096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })
  }));
  const body = JSON.parse(Buffer.from(res.body).toString('utf8'));
  return body.content[0].text;
}

function buildPrompt(companyName, jobTitle, street, zip, city) {
  return `Du erstellst Inhalte für eine "Schulcard" – eine visuelle Berufserkundungskarte für deutsche Schülerinnen und Schüler (14–16 Jahre).

WICHTIG: Erstelle alle Inhalte AUSSCHLIESSLICH für dieses konkrete Unternehmen und diesen konkreten Beruf:
- Unternehmen: ${companyName}
- Ausbildungsberuf: ${jobTitle}
- Adresse: ${street}, ${zip} ${city}

Nutze dein Wissen über ${companyName} (Branche, Geschichte, Produkte, Werte, Größe). Wenn du keine gesicherten Infos hast, erfinde realistische, glaubwürdige Inhalte passend zu genau diesem Beruf und dieser Branche. Niemals Inhalte aus anderen Berufsfeldern verwenden.

Sprache: Deutsch, Du-Form, jugendlich aber seriös, für 14–16-Jährige.

Antworte NUR mit validem JSON – kein Markdown, keine Erklärungen:

{
  "pageTitle": "Schulcard – ${jobTitle} bei ${companyName}",
  "companyName": "Vollständiger Name von ${companyName}",
  "companyNameShort": "Kurzname von ${companyName} ohne Rechtsform",
  "jobTitle": "${jobTitle} mit Genderstern (z.B. Kosmetiker*in)",
  "jobTitleShort": "Kurzform von ${jobTitle} MIT Genderstern – PFLICHT",
  "website": "Offizielle Website von ${companyName}",
  "address": "${street} · ${zip} ${city}",
  "personName": "Passender Vorname für eine*n Azubi bei ${companyName}",
  "personRole": "Azubi ${jobTitle} · ${companyName}",
  "companyDescription": "Was ${companyName} macht – max 18 Wörter, direkt und ansprechend, passend zur Branche",
  "jobDescription": "Was man als ${jobTitle} bei ${companyName} konkret macht – 2 Sätze, Du-Form, berufsspezifisch",
  "importanceText": "Warum ${jobTitle} wichtig ist – 2 emotionale Sätze mit einem Highlight-Wort, berufsspezifisch",
  "importanceHighlight": "1–3 Wörter die den Kern des Berufs ${jobTitle} beschreiben",
  "photoCaptions": ["Bildunterschrift 1 passend zu ${jobTitle}", "Bildunterschrift 2", "Bildunterschrift 3", "Bildunterschrift 4"],
  "tasksDo": ["Typische Aufgabe 1 als ${jobTitle}", "Typische Aufgabe 2", "Typische Aufgabe 3", "Typische Aufgabe 4", "Typische Aufgabe 5"],
  "tasksDont": ["Was man als ${jobTitle} NICHT macht 1", "Nicht-Aufgabe 2", "Nicht-Aufgabe 3", "Nicht-Aufgabe 4"],
  "education": "Welcher Schulabschluss für ${jobTitle} bei ${companyName} nötig ist",
  "salaryY1": 900,
  "salaryY2": 1000,
  "salaryY3": 1100,
  "workHours": "Typische Wochenstunden für ${jobTitle}",
  "duration": "Ausbildungsdauer für ${jobTitle}",
  "equipment": [
    {"name": "Arbeitsutensil 1 typisch für ${jobTitle}", "desc": "Wozu man es braucht"},
    {"name": "Arbeitsutensil 2", "desc": "Wozu man es braucht"},
    {"name": "Arbeitsutensil 3", "desc": "Wozu man es braucht"},
    {"name": "Arbeitsutensil 4", "desc": "Wozu man es braucht"},
    {"name": "Arbeitsutensil 5", "desc": "Wozu man es braucht"}
  ],
  "traits": [
    {"emoji": "passendes Emoji", "name": "Eigenschaft 1 wichtig für ${jobTitle}", "desc": "Warum diese Eigenschaft für den Beruf wichtig ist"},
    {"emoji": "passendes Emoji", "name": "Eigenschaft 2", "desc": "Kurze Erklärung"},
    {"emoji": "passendes Emoji", "name": "Eigenschaft 3", "desc": "Kurze Erklärung"},
    {"emoji": "passendes Emoji", "name": "Eigenschaft 4", "desc": "Kurze Erklärung"},
    {"emoji": "passendes Emoji", "name": "Eigenschaft 5", "desc": "Kurze Erklärung"}
  ],
  "internshipDesc": "Wie ein Praktikum als ${jobTitle} bei ${companyName} aussieht",
  "applyDate": "01.08.2026",
  "applyUrl": "Bewerbungsseite von ${companyName}",
  "socialInstagram": "",
  "socialFacebook": "",
  "socialYoutube": "",
  "socialLinkedin": "",
  "brandColor": "Primärfarbe von ${companyName} als Hex-Code (recherchieren oder sinnvoll wählen)",
  "brandColorLight": "Helle Version der Primärfarbe als Hex-Code",
  "quiz": [
    {
      "type": "wf",
      "label": "WAHR ODER FALSCH",
      "q": "Interessante Frage über ${companyName} – nur eine Aussage ist wahr",
      "opts": [
        {"lbl": "AUSSAGE 1", "txt": "Wahre Aussage über ${companyName}", "ok": true},
        {"lbl": "AUSSAGE 2", "txt": "Falsche aber plausible Aussage über ${companyName}", "ok": false},
        {"lbl": "AUSSAGE 3", "txt": "Falsche aber plausible Aussage über ${companyName}", "ok": false}
      ],
      "fbOk": "Richtig! Kurze Erklärung warum diese Aussage stimmt.",
      "fbErr": "Leider falsch. Die richtige Antwort mit Erklärung."
    },
    {
      "type": "mc",
      "label": "MULTIPLE CHOICE",
      "q": "Konkrete Frage über den Alltag als ${jobTitle}",
      "opts": [
        {"txt": "Falsche Antwort passend zum Beruf", "ok": false},
        {"txt": "Richtige Antwort passend zum Beruf", "ok": true},
        {"txt": "Falsche Antwort passend zum Beruf", "ok": false},
        {"txt": "Falsche Antwort passend zum Beruf", "ok": false}
      ],
      "fbOk": "Genau! Kurze Bestätigung mit Berufsbezug.",
      "fbErr": "Fast! Die richtige Antwort mit Erklärung."
    },
    {
      "type": "schaetz",
      "label": "SCHÄTZFRAGE",
      "q": "Interessante Schätzfrage passend zu ${jobTitle} oder ${companyName}",
      "unit": "sinnvolle Einheit für die Schätzfrage",
      "answer": 50,
      "tol": 15,
      "fbOk": "Gut geschätzt! Kurze Erklärung mit Berufsbezug.",
      "fbClose": "Nah dran! Die genaue Zahl mit Kontext.",
      "fbErr": "Die Antwort mit Erklärung und Berufsbezug."
    }
  ]
}`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { companyName, jobTitle, street = '', zip = '', city = '' } = req.body;
    if (!companyName || !jobTitle) return res.status(400).json({ error: 'Unternehmensname und Beruf sind Pflicht.' });

    const system = `Du bist ein Experte für deutsche Ausbildungsberufe und Unternehmen. Du erstellst Inhalte für Schulcards – visuelle Berufserkundungskarten für Schüler*innen (14–16 Jahre). WICHTIGSTE REGEL: Alle Inhalte müssen 100% zum genannten Beruf und Unternehmen passen. Verwende niemals Inhalte aus anderen Berufsfeldern.`;
    let raw = await callBedrock(system, buildPrompt(companyName, jobTitle, street, zip, city));
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    const data = JSON.parse(raw);
    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports.config = { api: { bodyParser: { sizeLimit: '1mb' } } };
