// =========================================================================
//  ASSISTENT-LOG — erfasst die Fragen an den lokalen Assistenten, um daraus
//  zu LERNEN (KI-frei): kein Machine-Learning, sondern ein kuratierter
//  Telemetrie-Loop. Jede Frage wird mit erkanntem Intent, getroffener KPI,
//  Treffer-Status und Rolle protokolliert. Daraus werden ausgewertet:
//   • Top-Fragen & Trefferquote (gesamt / je Rolle)
//   • häufigste Kennzahlen
//   • WISSENSLÜCKEN: unbeantwortete Fragen geclustert, je mit einem
//     Synonym-Vorschlag (welcher Begriff sollte welcher KPI zugeordnet
//     werden) — ein Mensch übernimmt ihn bewusst in die Wissensbasis.
//
//  Speicher: localStorage (pro Browser, kein Datenabfluss). Ringpuffer.
//  Späterer Backend-Sync kann dieselben Sätze an einen Endpoint schicken.
// =========================================================================
import { findeKpis } from './localAssistant.js'

const KEY = 'er_assistent_log'
const MAX = 1000 // Ringpuffer: nur die letzten N Fragen halten

// Intents, die KEINE Fachfrage sind und daher nicht in die Quote zählen.
const META = new Set(['leer', 'begruessung', 'hilfe', 'fehler'])
// Intents ohne echte Kennzahl-Antwort = Wissenslücke.
const OFFEN = new Set(['unbekannt'])

const jetzt = () => new Date().toISOString()
function lade() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
function sichern(arr) { try { localStorage.setItem(KEY, JSON.stringify(arr.slice(-MAX))) } catch {} }

const norm = (s) => String(s || '').toLowerCase().replace(/[?.,;:!"']/g, ' ').replace(/\s+/g, ' ').trim()
const rolleId = (r) => (r && (r.id || r.name)) || (typeof r === 'string' ? r : null)

// Stoppwörter — für die Extraktion „markanter" Begriffe aus offenen Fragen.
const STOPP = new Set('was ist sind der die das wie hoch viel wir uns bei von im in auf fuer und oder ein eine einen gerade aktuell aktuelle wieso warum weshalb welche welcher welches mir mein unsere unser haben hat sich denn mal bitte zeig zeige nenne sag sage gibt es zum zur des dem den am'.split(' '))

/** Eine Frage protokollieren. Wird direkt nach beantworte() aufgerufen. */
export function protokolliere({ frage, intent, kpis = [], rolle, zeit } = {}) {
  const f = norm(frage)
  if (!f) return
  const arr = lade()
  arr.push({
    f: f.slice(0, 200),
    intent: intent || 'unbekannt',
    kpis: (kpis || []).slice(0, 5),
    rolle: rolleId(rolle),
    meta: META.has(intent),
    offen: OFFEN.has(intent),
    schwach: intent === 'thema',
    treffer: !META.has(intent) && !OFFEN.has(intent) && intent !== 'thema',
    t: zeit || jetzt(),
  })
  sichern(arr)
  return arr.length
}

export function ladeLog() { return lade() }
export function leereLog() { try { localStorage.removeItem(KEY) } catch {} }
export function exportJson() { return JSON.stringify(lade(), null, 2) }

/** Markante Begriffe einer Frage (für Synonym-Vorschläge). */
export function markanteWoerter(frage) {
  return [...new Set(norm(frage).split(' ').filter((w) => w.length > 3 && !STOPP.has(w)))]
}

/** Kennzahlen-Fragen (ohne Meta wie Begrüßung/Hilfe). */
const fachfragen = (log) => log.filter((x) => !x.meta)

/** Gesamtstatistik: Volumen, Trefferquote, offene/schwache Fälle. */
export function statistik() {
  const log = lade(), fach = fachfragen(log)
  const treffer = fach.filter((x) => x.treffer).length
  const schwach = fach.filter((x) => x.schwach).length
  const offen = fach.filter((x) => x.offen).length
  return {
    gesamt: log.length,
    fachfragen: fach.length,
    treffer, schwach, offen,
    trefferquote: fach.length ? treffer / fach.length : 0,
    lueckenquote: fach.length ? (offen + schwach) / fach.length : 0,
  }
}

/** Häufigste Fragen (nach normalisiertem Wortlaut geclustert). */
export function topFragen(n = 10) {
  const map = new Map()
  for (const x of lade()) {
    const e = map.get(x.f) || { frage: x.f, anzahl: 0, treffer: 0, intent: x.intent }
    e.anzahl++; if (x.treffer) e.treffer++
    map.set(x.f, e)
  }
  return [...map.values()].sort((a, b) => b.anzahl - a.anzahl).slice(0, n)
}

/** Trefferquote je Rolle — zeigt, wo der Assistent schlechter abdeckt. */
export function quoteJeRolle() {
  const map = new Map()
  for (const x of fachfragen(lade())) {
    const r = x.rolle || '—'
    const e = map.get(r) || { rolle: r, anzahl: 0, treffer: 0 }
    e.anzahl++; if (x.treffer) e.treffer++
    map.set(r, e)
  }
  return [...map.values()].map((e) => ({ ...e, quote: e.anzahl ? e.treffer / e.anzahl : 0 }))
    .sort((a, b) => b.anzahl - a.anzahl)
}

/** Häufigste Kennzahlen in beantworteten Fragen. */
export function topKpis(n = 10) {
  const map = new Map()
  for (const x of lade()) for (const id of x.kpis || []) map.set(id, (map.get(id) || 0) + 1)
  return [...map.entries()].map(([id, anzahl]) => ({ id, anzahl })).sort((a, b) => b.anzahl - a.anzahl).slice(0, n)
}

/**
 * WISSENSLÜCKEN: offene/schwache Fragen geclustert, je mit Synonym-Vorschlag.
 * Pro Cluster wird via findeKpis die naheliegendste KPI bestimmt — ihr sollten
 * die markanten Begriffe der Frage als Synonym zugeordnet werden.
 */
export function wissensluecken(n = 10) {
  const map = new Map()
  for (const x of lade()) {
    if (!x.offen && !x.schwach) continue
    const e = map.get(x.f) || { frage: x.f, anzahl: 0, schwach: x.schwach }
    e.anzahl++
    map.set(x.f, e)
  }
  return [...map.values()].sort((a, b) => b.anzahl - a.anzahl).slice(0, n).map((e) => {
    const kandidat = findeKpis(e.frage, null, 1)[0] || null
    return {
      ...e,
      woerter: markanteWoerter(e.frage),
      vorschlagKpiId: kandidat?.id || null,
      vorschlagKpiName: kandidat?.name || null,
    }
  })
}
