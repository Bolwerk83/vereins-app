// =========================================================================
//  PERSONA-SIMULATION — simuliert 200 Mitarbeiter, die den lokalen
//  Assistenten nutzen, und wertet die Wissenslücken aus. Daraus lernt das
//  Modell: welche Begriffe Kollegen verwenden, die der Assistent (noch)
//  nicht kennt. Aufruf:  node scripts/persona-simulation.mjs
//
//  Deterministisch (seedbarer PRNG), damit der Lauf reproduzierbar ist.
// =========================================================================
import '../tests/_setup.mjs'
import { beantworte, findeKpis } from '../src/core/localAssistant.js'
import { berechneAlle } from '../src/core/kpiRegistry.js'
import { MOCK } from '../src/data/mock.js'
import { ROLLEN } from '../src/core/rbac.js'

const werte = berechneAlle(MOCK.roheWerte['2025'])
const ladeHistorie = async () => []

// Deterministischer PRNG (mulberry32) — kein Math.random, reproduzierbar.
let seed = 20260624
const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
const pick = (arr) => arr[Math.floor(rnd() * arr.length)]

// Fragetemplates je Themenbereich. Mischung aus Begriffen, die der Assistent
// kennt, und realistischen ALTERNATIVEN, die Kollegen im Alltag verwenden.
const THEMEN = {
  vertrieb: ['Wie hoch ist der Umsatz?', 'Wie ist die Marge?', 'Wie hoch ist die Handelsspanne?', 'Wie ist der Rohertrag?', 'Wie viele Räder haben wir verkauft?', 'Wie ist die Conversion im Shop?', 'Wie hoch ist die Kaufquote?', 'Wie hoch sind die Retouren?', 'Wie ist der Online-Anteil?', 'Wie hoch ist der Rabatt?', 'Wie viel Werbebudget geben wir aus?', 'Wie hoch sind die Werbekosten?', 'Wie ist die Umsatzrendite?'],
  finanzen: ['Wie hoch ist das EBIT?', 'Wie ist die Gewinnmarge?', 'Wie hoch ist der Gewinn?', 'Wie viel Liquidität haben wir?', 'Wie viel Geld ist in der Kasse?', 'Wie hoch sind die Außenstände?', 'Wie ist das Zahlungsziel der Kunden?', 'Wie hoch ist der DSO?', 'Wie ist die Eigenkapitalquote?', 'Wie hoch ist der Cashflow?', 'Wie ist die Rendite?', 'Wie hoch ist der Schuldenstand?'],
  logistik: ['Wie hoch ist der Lagerbestand?', 'Wie ist die Reichweite?', 'Wie viele Ladenhüter haben wir?', 'Wie ist der Lagerumschlag?', 'Wie ist die Liefertreue?', 'Wie ist die Termintreue der Lieferanten?', 'Wie ist die Lieferfähigkeit?', 'Wie hoch ist die Verfügbarkeit im Shop?', 'Wie ist die Auslastung der Produktion?', 'Wie hoch ist der Ausschuss?', 'Wie ist die Fehlerquote in der Produktion?', 'Wie lange ist die Lieferzeit?'],
  hr: ['Wie hoch sind die Personalkosten?', 'Wie ist die Fluktuation?', 'Wie hoch ist die Kündigungsquote?', 'Wie ist der Krankenstand?', 'Wie hoch sind die Fehlzeiten?', 'Wie viele Mitarbeiter haben wir?', 'Wie ist die Mitarbeiterzufriedenheit?'],
  strategie: ['Wie ist das prognostizierte Wachstum?', 'Wie ist der Forecast?', 'Wie ist die Prognosegüte?', 'Wie hoch ist der Auftragsbestand?', 'Wie ist die Zielerreichung beim Umsatz?', 'Wie diszipliniert sind wir bei den Kosten?', 'Wie ist die F&E-Quote?', 'Wie hoch ist der NPS?'],
  service: ['Wie ist die Kundenzufriedenheit?', 'Wie viele Probefahrten hatten wir?', 'Wie sind die Bewertungen?', 'Wie hoch ist der Serviceumsatz?', 'Wie ist die Wartezeit an der Hotline?', 'Wie ist der CO2-Fußabdruck pro Rad?'],
}
// Welche Themen eine Rolle typischerweise fragt.
const ROLLE_THEMEN = {
  gf: ['vertrieb', 'finanzen', 'strategie', 'logistik', 'hr', 'service'],
  controller: ['finanzen', 'vertrieb', 'strategie', 'logistik'],
  bl_vk: ['vertrieb', 'service', 'strategie'],
  bl_log: ['logistik', 'strategie'],
  bl_hr: ['hr'],
  mitarbeiter: ['vertrieb', 'logistik'],
  admin: ['finanzen', 'vertrieb', 'logistik', 'hr', 'strategie', 'service'],
}
const ROLLEN_IDS = Object.keys(ROLLEN)

async function simuliere() {
  const eintraege = []
  for (let i = 0; i < 200; i++) {
    const rolleId = ROLLEN_IDS[i % ROLLEN_IDS.length]
    const rolle = ROLLEN[rolleId]
    const themen = ROLLE_THEMEN[rolleId] || ['vertrieb']
    const anzahl = 4 + Math.floor(rnd() * 6) // 4–9 Fragen je Persona
    for (let j = 0; j < anzahl; j++) {
      const frage = pick(THEMEN[pick(themen)])
      const a = await beantworte(frage, { werte, rolle, ladeHistorie })
      eintraege.push({ frage, intent: a.intent, kpis: a.kpis, rolle: rolleId })
    }
  }
  return eintraege
}

function auswerten(eintraege, label) {
  const META = new Set(['leer', 'begruessung', 'hilfe', 'fehler'])
  const fach = eintraege.filter((e) => !META.has(e.intent))
  const treffer = fach.filter((e) => e.intent !== 'unbekannt' && e.intent !== 'thema').length
  const quote = fach.length ? treffer / fach.length : 0
  // Lücken clustern
  const map = new Map()
  for (const e of eintraege) {
    if (e.intent !== 'unbekannt' && e.intent !== 'thema') continue
    const k = e.frage.toLowerCase()
    const c = map.get(k) || { frage: e.frage, anzahl: 0 }
    c.anzahl++; map.set(k, c)
  }
  const luecken = [...map.values()].sort((a, b) => b.anzahl - a.anzahl).map((l) => {
    const kand = findeKpis(l.frage, null, 1)[0]
    return { ...l, naheKpi: kand ? kand.name + ' (' + kand.id + ')' : '—' }
  })
  console.log(`\n=== ${label} ===`)
  console.log(`Fragen gesamt: ${eintraege.length} · Fachfragen: ${fach.length} · Treffer: ${treffer} · Trefferquote: ${(quote * 100).toFixed(1)}%`)
  console.log(`Offene/​schwache Cluster: ${luecken.length}`)
  for (const l of luecken) console.log(`  ${String(l.anzahl).padStart(3)}×  "${l.frage}"   → nahe: ${l.naheKpi}`)
  return { quote, luecken }
}

const eintraege = await simuliere()
auswerten(eintraege, 'ERGEBNIS (200 Personas, aktuelles Modell)')
// Verbleibende Cluster ohne nahe KPI = echte Wissenslücken → neue Kennzahlen
// nötig (siehe docs/BACKLOG.md: Bewertungen, Lieferzeit, Probefahrten,
// Hotline-Wartezeit, Absatzmenge-Ist).
