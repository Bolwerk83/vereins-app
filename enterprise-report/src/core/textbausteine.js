// =========================================================================
//  TEXTBAUSTEINE — editierbare Controller-Kommentare mit dynamischen Werten.
//  Syntax:
//    @kpiId                      -> aktueller, formatierter Wert der Kennzahl
//    @kpiId[positiv|negativ]     -> Textzweig je nach Vorzeichen des Werts
//    @kpiId[positiv|negativ|kein]-> 3. Zweig, wenn kein Wert vorhanden ist
//  Dadurch bleiben Zahlen UND Formulierung automatisch aktuell (positiv vs.
//  negativ wird umgeschaltet). Rein statische Aussagen werden über einen
//  Snapshot auf „veraltet" geprüft (Periodenwechsel / Vorzeichenwechsel /
//  starke Änderung), da sich die Daten täglich ändern.
// =========================================================================
import { KPI } from './kpiRegistry.js'
import { formatWert } from '../design/theme.js'

const wertOf = (id, werte) => (werte ? werte[id] : undefined)
function fmt(id, werte) {
  const k = KPI[id]; if (!k) return '@' + id
  const v = wertOf(id, werte)
  return v == null ? '–' : formatWert(v, k.einheit)
}

/** Text mit aktuellen Werten/Bedingungen auflösen. */
export function renderText(text = '', werte = {}) {
  if (!text) return ''
  // 1) Bedingte Blöcke: @kpiId[positiv|negativ|keinWert]
  let out = text.replace(/@(\w+)\[([^\]]*)\]/g, (m, id, body) => {
    const teile = body.split('|')
    const v = wertOf(id, werte)
    let zweig
    if (v == null) zweig = teile[2] ?? teile[1] ?? teile[0] ?? ''
    else if (v >= 0) zweig = teile[0] ?? ''
    else zweig = teile[1] ?? teile[0] ?? ''
    return zweig
  })
  // 2) Variablen: @kpiId -> Wert
  out = out.replace(/@(\w+)/g, (m, id) => (KPI[id] ? fmt(id, werte) : m))
  return out
}

/** Im Text referenzierte (existierende) Kennzahlen. */
export function referenzierteKpis(text = '') {
  const ids = new Set()
  for (const mm of String(text).matchAll(/@(\w+)/g)) if (KPI[mm[1]]) ids.add(mm[1])
  return [...ids]
}

/** Momentaufnahme der referenzierten Werte (für die Veraltet-Prüfung). */
export function snapshot(text, werte = {}) {
  const s = {}
  for (const id of referenzierteKpis(text)) s[id] = werte?.[id] ?? null
  return s
}

/** Ist der gespeicherte Text gegenüber den aktuellen Daten womöglich veraltet? */
export function istVeraltet(meta, werte = {}, periode = null) {
  if (!meta) return { veraltet: false }
  if (meta.periode && periode && meta.periode !== periode) {
    return { veraltet: true, grund: `Verfasst für Periode ${meta.periode} (aktuell ${periode}).` }
  }
  const snap = meta.snapshot || {}
  for (const id of Object.keys(snap)) {
    const alt = snap[id], neu = werte?.[id]
    if (alt == null || neu == null) continue
    if ((alt >= 0) !== (neu >= 0)) return { veraltet: true, grund: `${KPI[id]?.name || id}: Vorzeichen gewechselt — Aussage prüfen.` }
    const rel = Math.abs(alt) > 1e-9 ? Math.abs((neu - alt) / alt) : (neu !== alt ? 1 : 0)
    if (rel > 0.05) return { veraltet: true, grund: `${KPI[id]?.name || id}: Wert hat sich um ${Math.round(rel * 100)} % geändert.` }
  }
  return { veraltet: false }
}

// ---- Persistenz ----------------------------------------------------------
const KEY = 'er_textboxen'
function lade() { try { const o = JSON.parse(localStorage.getItem(KEY) || '{}'); return o && typeof o === 'object' ? o : {} } catch { return {} } }
export function ladeText(id) { return lade()[id] || null }
export function speichereText(id, { text, periode = null, autor = 'Du', werte = {} }) {
  const o = lade()
  o[id] = { text, periode, autor, erstellt: Date.now(), snapshot: snapshot(text, werte) }
  try { localStorage.setItem(KEY, JSON.stringify(o)) } catch {}
  return o[id]
}
export function loescheText(id) { const o = lade(); delete o[id]; try { localStorage.setItem(KEY, JSON.stringify(o)) } catch {} }

// ---- Vorlagen & KI-Formulierungshilfe ------------------------------------
export const VORLAGEN = [
  { bereich: 'Umsatz & Ergebnis', name: 'Lagekommentar', text: 'Der Nettoumsatz liegt bei @nettoumsatz, die DB-Quote bei @dbQuote. @ebit[Das operative Ergebnis ist mit @ebit positiv — Spielraum für gezielte Investitionen.|Das operative Ergebnis ist mit @ebit negativ; kurzfristige Gegenmaßnahmen sind erforderlich.]' },
  { bereich: 'Kosten', name: 'Kostenkommentar', text: 'Die Wareneinsatzquote beträgt @wareneinsatzquote. @ebitda[Das EBITDA von @ebitda stützt die Innenfinanzierung.|Das EBITDA von @ebitda ist angespannt — Kostenhebel priorisieren.]' },
  { bereich: 'Allgemein', name: 'Leer (frei formulieren)', text: '' }
]

/** Mehrere KI-Formulierungsvorschläge zu einer Kennzahl (dynamisch, mit @-Variablen). */
export function kiVorschlaege(kpiId, werte = {}) {
  const k = KPI[kpiId]; if (!k) return []
  const v = werte?.[kpiId]
  const negativ = v != null && v < 0
  const name = k.name
  return [
    `${name}: @${kpiId}. @${kpiId}[Entwicklung positiv — Kurs halten.|Negativer Wert — Ursachenanalyse einleiten.]`,
    `Mit @${kpiId} liegt ${name} ${negativ ? 'unter Druck' : 'im erwarteten Rahmen'}. @${kpiId}[Chancen nutzen und Vorsprung sichern.|Risiken priorisiert adressieren, Maßnahmen siehe unten.]`,
    `Kommentar ${name}: aktueller Wert @${kpiId}. ${negativ ? 'Deutlicher Handlungsbedarf.' : 'Stabil, Entwicklung weiter beobachten.'}`
  ]
}
