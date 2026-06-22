// =========================================================================
//  MEASURES (Kennzahlen-Schicht) — zentral definierte Measures mit Formel,
//  Format, Richtung und Zielband. Tabular-Baustein: einmal definiert, überall
//  wiederverwendbar. Admin-editierbar, persistent.
// =========================================================================
export const EINHEITEN = ['%', '€', '×', 'Tage', 'Stk', 'Pkt', '']
export const RICHTUNGEN = [
  { id: 'hoch', name: 'höher = besser' },
  { id: 'tief', name: 'niedriger = besser' }
]
// Skalierung der Anzeige (Roh / Tausend / Million).
export const SKALEN = [
  { id: 'einheit', name: '— (Originalwert)', faktor: 1, suffix: '' },
  { id: 'tausend', name: 'Tausend (T)', faktor: 1000, suffix: 'T' },
  { id: 'million', name: 'Million (Mio)', faktor: 1e6, suffix: 'Mio' }
]
const FORMAT_DEFAULT = { nachkomma: 1, tausender: true, skala: 'einheit', vorzeichen: false, klammerNegativ: false }

/** Wert gemäß Measure-Format darstellen (Nachkommastellen, Währung/Einheit,
 *  Skalierung, Vorzeichen, buchhalterische Klammern für Negativwerte). */
export function formatWert(m, wert) {
  if (wert == null || isNaN(wert)) return '—'
  const f = { ...FORMAT_DEFAULT, ...(m.format || {}) }
  const skala = SKALEN.find((s) => s.id === f.skala) || SKALEN[0]
  const v = wert / skala.faktor
  const neg = v < 0
  const zahl = Math.abs(v).toLocaleString('de-DE', { minimumFractionDigits: f.nachkomma, maximumFractionDigits: f.nachkomma, useGrouping: f.tausender !== false })
  const e = m.einheit || ''
  let suffix
  if (e === '€') suffix = (skala.suffix ? ' ' + skala.suffix + ' €' : ' €')
  else if (e === '%' || e === 'Tage' || e === 'Stk' || e === 'Pkt') suffix = (skala.suffix ? ' ' + skala.suffix : '') + ' ' + e
  else if (e === '×') suffix = '×' + (skala.suffix ? ' ' + skala.suffix : '')
  else suffix = skala.suffix ? ' ' + skala.suffix : ''
  let out = zahl + suffix
  if (neg) out = f.klammerNegativ ? '(' + out + ')' : '−' + out
  else if (f.vorzeichen) out = '+' + out
  return out
}

const KEY = 'er_measures'
function seed() {
  return [
    { id: 'm-umsatzrendite', name: 'Umsatzrendite', formel: 'Jahresüberschuss / Umsatz * 100', einheit: '%', richtung: 'hoch', zielGut: 5, zielOk: 2, beschreibung: 'Wie viel vom Umsatz unterm Strich bleibt.', aktiv: true, format: { nachkomma: 1, tausender: false, skala: 'einheit' } },
    { id: 'm-roce', name: 'ROCE', formel: 'EBIT / Capital Employed * 100', einheit: '%', richtung: 'hoch', zielGut: 12, zielOk: 8, beschreibung: 'Verzinsung des langfristig gebundenen Kapitals.', aktiv: true, format: { nachkomma: 1, tausender: false, skala: 'einheit' } },
    { id: 'm-ccc', name: 'Cash Conversion Cycle', formel: 'DIO + DSO − DPO', einheit: 'Tage', richtung: 'tief', zielGut: 80, zielOk: 110, beschreibung: 'Kapitalbindungsdauer im Umlaufvermögen.', aktiv: true, format: { nachkomma: 0, tausender: false, skala: 'einheit' } },
    { id: 'm-umsatz', name: 'Umsatz (Mio €)', formel: 'SUM(Umsatzerlöse)', einheit: '€', richtung: 'hoch', zielGut: 200000000, zielOk: 150000000, beschreibung: 'Gesamtumsatz, skaliert in Mio €.', aktiv: true, format: { nachkomma: 1, tausender: true, skala: 'million' } },
    { id: 'm-versanddeckung', name: 'Versand-Deckungsquote', formel: 'Versanderlös / Versandkosten * 100', einheit: '%', richtung: 'hoch', zielGut: 100, zielOk: 80, beschreibung: 'Decken die Versanderlöse die echten Carrier-Kosten?', aktiv: true, format: { nachkomma: 0, tausender: false, skala: 'einheit' } }
  ]
}
export function ladeMeasures() {
  try { const raw = localStorage.getItem(KEY); return raw == null ? seed() : JSON.parse(raw) } catch { return seed() }
}
function speichere(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); return arr }

export function speichereMeasure(m) {
  const arr = ladeMeasures(); const i = arr.findIndex((x) => x.id === m.id)
  if (i >= 0) arr[i] = m; else arr.push(m)
  return speichere(arr)
}
export function loescheMeasure(id) { return speichere(ladeMeasures().filter((m) => m.id !== id)) }
export function toggleAktiv(id) { return speichere(ladeMeasures().map((m) => m.id === id ? { ...m, aktiv: !m.aktiv } : m)) }
export function neueMeasure() {
  return { id: 'm-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: 'Neue Kennzahl', formel: '', einheit: '%', richtung: 'hoch', zielGut: 0, zielOk: 0, beschreibung: '', aktiv: true, format: { nachkomma: 1, tausender: true, skala: 'einheit', vorzeichen: false, klammerNegativ: false } }
}
/** Ampel einer Measure für einen Wert (Zielband + Richtung). */
export function ampel(m, wert) {
  if (m.richtung === 'tief') return wert <= m.zielGut ? 'g' : wert <= m.zielOk ? 'a' : 'r'
  return wert >= m.zielGut ? 'g' : wert >= m.zielOk ? 'a' : 'r'
}
export function setzeZurueck() { localStorage.removeItem(KEY); return ladeMeasures() }
