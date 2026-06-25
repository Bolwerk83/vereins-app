// =========================================================================
//  ZEIT-DIMENSION — mehrere Kalender-Hierarchien (Wirtschaftsjahr WJ /
//  Kalenderjahr KJ) plus die Datumsart, nach der ein Beleg zeitlich
//  eingeordnet wird (Belegdatum / Bestelldatum / Lieferdatum / Zahldatum).
//  So kann jeder Bericht nach einer wählbaren Zeit-Hierarchie und Datumsart
//  gefiltert werden.
//
//  Kalender-Varianten:
//    Jahr → Monat → Tag                (KJ / WJ)
//    Jahr → KW → Tag                   (KJ / WJ)
//    Jahr → Quartal → Monat → Tag      (KJ)
// =========================================================================
import { DATUMSSICHTEN } from './periodenmodell.js'
export { DATUMSSICHTEN }

// Wirtschaftsjahr beginnt im April (Demo) — zeigt, dass WJ ≠ KJ.
export const WJ_START_MONAT = 4

export const KALENDER_VARIANTEN = [
  { id: 'kj-monat',   name: 'Jahr → Monat → Tag (KJ)',           jahr: 'kj', ebenen: ['Jahr', 'Monat', 'Tag'] },
  { id: 'wj-monat',   name: 'Jahr → Monat → Tag (WJ)',           jahr: 'wj', ebenen: ['Jahr', 'Monat', 'Tag'] },
  { id: 'kj-kw',      name: 'Jahr → KW → Tag (KJ)',              jahr: 'kj', ebenen: ['Jahr', 'KW', 'Tag'] },
  { id: 'wj-kw',      name: 'Jahr → KW → Tag (WJ)',              jahr: 'wj', ebenen: ['Jahr', 'KW', 'Tag'] },
  { id: 'kj-quartal', name: 'Jahr → Quartal → Monat → Tag (KJ)', jahr: 'kj', ebenen: ['Jahr', 'Quartal', 'Monat', 'Tag'] },
]
export const variante = (id) => KALENDER_VARIANTEN.find((v) => v.id === id) || KALENDER_VARIANTEN[0]

const MON = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
const p2 = (n) => String(n).padStart(2, '0')

/** ISO-8601-Kalenderwoche eines Datums. */
export function isoKW(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = (date.getUTCDay() + 6) % 7
  date.setUTCDate(date.getUTCDate() - dayNum + 3)
  const firstThu = date.getTime()
  date.setUTCMonth(0, 1)
  if (date.getUTCDay() !== 4) date.setUTCMonth(0, 1 + ((4 - date.getUTCDay()) + 7) % 7)
  return 1 + Math.round((firstThu - date.getTime()) / 604800000)
}
const quartalVon = (m) => Math.floor((m - 1) / 3) + 1 // m = 1..12

// Wirtschaftsjahr-Schlüssel/Label eines Datums (WJ y/y+1 ab WJ_START_MONAT).
function wjVon(d) {
  const m = d.getMonth() + 1, y = d.getFullYear()
  const start = m >= WJ_START_MONAT ? y : y - 1
  return { key: `wj-${start}`, name: `WJ ${start}/${String(start + 1).slice(-2)}` }
}

// Segment (key+name) eines Datums auf einer Ebene.
function segment(ebene, d, v) {
  const m = d.getMonth() + 1, y = d.getFullYear()
  switch (ebene) {
    case 'Jahr': return v.jahr === 'wj' ? wjVon(d) : { key: `${y}`, name: `${y}` }
    case 'Quartal': return { key: `q${y}-${quartalVon(m)}`, name: `Q${quartalVon(m)} ${y}` }
    case 'Monat': return { key: `m${y}-${p2(m)}`, name: `${MON[m - 1]} ${y}` }
    case 'KW': { const kw = isoKW(d); return { key: `kw${y}-${p2(kw)}`, name: `KW ${p2(kw)}` } }
    case 'Tag': return { key: `t${y}-${p2(m)}-${p2(d.getDate())}`, name: `${p2(d.getDate())}.${p2(m)}.` }
    default: return { key: 'x', name: '—' }
  }
}

// Datumsbereich (von/bis) für Variante + Jahr.
function bereich(v, jahr) {
  if (v.jahr === 'wj') return [new Date(jahr, WJ_START_MONAT - 1, 1), new Date(jahr + 1, WJ_START_MONAT - 1, 0)]
  return [new Date(jahr, 0, 1), new Date(jahr, 11, 31)]
}

/**
 * Baut den Kalender-Hierarchiebaum für eine Variante und ein (Start-)Jahr.
 * @returns Wurzel { name, ebene:0, kinder } mit verschachtelten Ebenen bis Tag.
 */
export function baueZeitbaum(variantId, jahr) {
  const v = variante(variantId)
  const [von, bis] = bereich(v, jahr)
  const root = { id: 'root', name: v.name, ebene: 0, kinder: [], _idx: {} }
  for (let t = new Date(von); t <= bis; t.setDate(t.getDate() + 1)) {
    let knoten = root
    v.ebenen.forEach((ebeneName, i) => {
      const s = segment(ebeneName, t, v)
      if (!knoten._idx[s.key]) {
        const neu = { id: s.key, name: s.name, ebene: i + 1, ebeneName, kinder: [], _idx: {} }
        knoten._idx[s.key] = neu; knoten.kinder.push(neu)
      }
      knoten = knoten._idx[s.key]
    })
  }
  // Aufräum-Indizes entfernen (nur für den Aufbau gebraucht).
  const putze = (n) => { delete n._idx; n.kinder.forEach(putze); return n }
  return putze(root)
}

/** Tiefe (Anzahl Ebenen unter der Wurzel) einer Variante. */
export const tiefeVon = (variantId) => variante(variantId).ebenen.length

/** Anzahl Knoten je Ebene (für Diagnose/Tests). */
export function ebenenZaehlung(root) {
  const z = {}
  const lauf = (n) => { if (n.ebene > 0) z[n.ebene] = (z[n.ebene] || 0) + 1; n.kinder.forEach(lauf) }
  lauf(root)
  return z
}
