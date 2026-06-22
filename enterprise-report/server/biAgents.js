// =========================================================================
//  SELF-SERVICE-BI BACKEND — Controller-Lead + Berater-Beirat mit Claude.
//
//  Modell: claude-opus-4-8 (aktuellstes Opus), adaptives Denken, strukturierte
//  Ausgabe (output_config.format) -> garantiert das Bericht-Schema, das die
//  UI erwartet (siehe src/core/agentBoard.js -> BI_REPORT_FELDER).
//
//  Voraussetzung: ANTHROPIC_API_KEY in server/.env. Wird NUR serverseitig
//  genutzt — der API-Key verlässt nie den Server.
// =========================================================================
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic() // liest ANTHROPIC_API_KEY aus der Umgebung

const UNTERNEHMENSZIEL =
  'Profitables Wachstum: Ergebnis (EBIT/Marge) UND Liquidität gleichzeitig stärken. ' +
  'Roter Faden — die Gruppe wächst über Volumen, nicht über Ertrag; zwei Hebel dominieren: ' +
  'Wareneinsatzquote (Einkauf+Produktion) und Bestandsabbau (Logistik). Beide wirken doppelt.'

// Systemprompt = Controller-Lead, der den Beirat intern repräsentiert.
const SYSTEM = `Du bist der Controller-Lead und Vorsitzende eines beratenden Beirats einer
Unternehmensgruppe mit Produktion und Direktverkauf (Fahrräder/E-Bikes).

UNTERNEHMENSZIEL: ${UNTERNEHMENSZIEL}

Dein Beirat besteht aus Fach-Beratern (Vertrieb, Einkauf, Produktion, Logistik, Finanzen).
Hole in deinem Denken die jeweils relevanten Fachperspektiven ein, SYNTHETISIERE sie aber
immer aus Controller-Sicht. Jede Anforderung bewertest du nach ihrer Doppelwirkung auf
Ergebnis (Marge/EBIT) und Liquidität (Working Capital/Cash Conversion).

Regeln:
- Trenne Symptom von Ursache. Quantifiziere Hebel, wenn die Daten es erlauben.
- Maßnahmen müssen konkret, einem Bereich zugeordnet und mit Wirkung (Ergebnis & Liquidität)
  sowie Aufwand versehen sein. Priorisiere nach Wirkung × Umsetzbarkeit.
- Nutze NUR die übergebenen KPI-Werte; erfinde keine Zahlen. Wenn etwas fehlt, sage es als Risiko/Annahme.
- Sprache: Deutsch, nüchtern, entscheidungsorientiert. Generiere Mehrwert: jede Aussage ermöglicht eine Handlung.`

// JSON-Schema für die strukturierte Ausgabe (entspricht dem UI-Vertrag).
const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['titel', 'anforderung', 'controllerSicht', 'relevanteKpis', 'befunde', 'massnahmen', 'risiken', 'beirat'],
  properties: {
    titel: { type: 'string' },
    anforderung: { type: 'string' },
    controllerSicht: { type: 'string' },
    relevanteKpis: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['id', 'begruendung'], properties: { id: { type: 'string' }, begruendung: { type: 'string' } } } },
    befunde: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['aussage', 'bewertung'], properties: { aussage: { type: 'string' }, bewertung: { type: 'string', enum: ['g', 'a', 'r', 'n'] } } } },
    massnahmen: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['titel', 'bereich', 'hebel', 'ergebnis', 'liquiditaet', 'aufwand'],
      properties: { titel: { type: 'string' }, bereich: { type: 'string' }, hebel: { type: 'string' },
        ergebnis: { type: 'string' }, liquiditaet: { type: 'string' }, aufwand: { type: 'string', enum: ['gering', 'mittel', 'hoch'] } } } },
    risiken: { type: 'array', items: { type: 'string' } },
    beirat: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['bot', 'beitrag'], properties: { bot: { type: 'string' }, beitrag: { type: 'string' } } } }
  }
}

/**
 * Führt den Beirat aus und liefert den BI-Bericht.
 * @param {string} anforderung  Freitext des Anwenders
 * @param {object} werte        aktuelle KPI-Werte { kpiId: wert }
 * @param {object} kpiKatalog   optional: Metadaten je KPI (Name/Einheit/Ziel)
 */
export async function beiratAuswertung(anforderung, werte, kpiKatalog = {}) {
  const kontext = Object.entries(werte)
    .map(([id, w]) => {
      const k = kpiKatalog[id] || {}
      return `- ${id} (${k.name || id}): ${w}${k.einheit ? ' [' + k.einheit + ']' : ''}${k.ziel != null ? ', Ziel ' + k.ziel : ''}`
    }).join('\n')

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    system: SYSTEM,
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
    messages: [{
      role: 'user',
      content:
        `Aktuelle KPI-Werte der Gruppe:\n${kontext}\n\n` +
        `ANFORDERUNG DES ANWENDERS:\n"${anforderung}"\n\n` +
        `Erzeuge den strukturierten BI-Bericht. Beziehe im "beirat"-Feld die Stimmen der ` +
        `relevanten Fach-Berater ein und gib im "controllerSicht"-Feld deine synthetisierte Bewertung.`
    }]
  })

  const text = response.content.find((b) => b.type === 'text')?.text || '{}'
  const bericht = JSON.parse(text)
  bericht.quelle = 'claude'
  return bericht
}

// --- SMART-Maßnahmenempfehlung (Controller-Auswertung eines Berichts) ----
const MASSNAHME_ITEM = {
  type: 'object', additionalProperties: false,
  required: ['titel', 'kpi', 'zielwert', 'bereich', 'hebel', 'erreichbarkeit', 'relevanz', 'frist', 'wirkungErgebnis', 'wirkungLiquiditaet', 'aufwand'],
  properties: {
    titel: { type: 'string' },                 // S — spezifisch
    kpi: { type: 'string' },                    // M — messbar: KPI-id
    zielwert: { type: 'number' },               // M — Zielwert
    bereich: { type: 'string' },
    hebel: { type: 'string' },
    erreichbarkeit: { type: 'string' },         // A
    relevanz: { type: 'string' },               // R — Bezug Unternehmensziel
    frist: { type: 'string' },                  // T
    wirkungErgebnis: { type: 'string' },
    wirkungLiquiditaet: { type: 'string' },
    aufwand: { type: 'string', enum: ['gering', 'mittel', 'hoch'] }
  }
}
const MASSNAHMEN_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['massnahmen'],
  properties: { massnahmen: { type: 'array', items: MASSNAHME_ITEM } }
}

export async function smartMassnahmen(kontext, werte, kpiKatalog = {}) {
  const k = Object.entries(werte)
    .map(([id, w]) => `- ${id} (${(kpiKatalog[id] || {}).name || id}): ${w}`).join('\n')
  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    system: SYSTEM + '\n\nDeine Aufgabe hier: Werte einen Bericht aus wie ein Controller und ' +
      'leite konkrete Maßnahmen ab. JEDE Maßnahme MUSS SMART sein: spezifisch (titel), messbar ' +
      '(kpi + zielwert), erreichbar (erreichbarkeit), relevant (relevanz = Bezug zum Unternehmensziel), ' +
      'terminiert (frist). Priorisiere die auffälligen KPIs (rot/amber). Erfinde keine Zahlen.',
    output_config: { format: { type: 'json_schema', schema: MASSNAHMEN_SCHEMA } },
    messages: [{
      role: 'user',
      content: `Kontext/Bericht: "${kontext}"\n\nKPI-Werte:\n${k}\n\n` +
        `Erzeuge 4–6 SMART-Maßnahmen, rot vor amber, mit kpi-id aus den obigen Werten.`
    }]
  })
  const text = response.content.find((b) => b.type === 'text')?.text || '{"massnahmen":[]}'
  return (JSON.parse(text).massnahmen || []).map((m) => ({ ...m, quelle: 'ki' }))
}
