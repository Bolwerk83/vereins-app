// =========================================================================
//  MEASURES (Kennzahlen-Schicht) — zentral definierte Measures mit Formel,
//  Format, Richtung und Zielband. Tabular-Baustein: einmal definiert, überall
//  wiederverwendbar. Admin-editierbar, persistent.
// =========================================================================
export const EINHEITEN = ['%', '€', 'T€', '×', 'Tage', 'Stk']
export const RICHTUNGEN = [
  { id: 'hoch', name: 'höher = besser' },
  { id: 'tief', name: 'niedriger = besser' }
]

const KEY = 'er_measures'
function seed() {
  return [
    { id: 'm-umsatzrendite', name: 'Umsatzrendite', formel: 'Jahresüberschuss / Umsatz * 100', einheit: '%', richtung: 'hoch', zielGut: 5, zielOk: 2, beschreibung: 'Wie viel vom Umsatz unterm Strich bleibt.', aktiv: true },
    { id: 'm-roce', name: 'ROCE', formel: 'EBIT / Capital Employed * 100', einheit: '%', richtung: 'hoch', zielGut: 12, zielOk: 8, beschreibung: 'Verzinsung des langfristig gebundenen Kapitals.', aktiv: true },
    { id: 'm-ccc', name: 'Cash Conversion Cycle', formel: 'DIO + DSO − DPO', einheit: 'Tage', richtung: 'tief', zielGut: 80, zielOk: 110, beschreibung: 'Kapitalbindungsdauer im Umlaufvermögen.', aktiv: true },
    { id: 'm-versanddeckung', name: 'Versand-Deckungsquote', formel: 'Versanderlös / Versandkosten * 100', einheit: '%', richtung: 'hoch', zielGut: 100, zielOk: 80, beschreibung: 'Decken die Versanderlöse die echten Carrier-Kosten?', aktiv: true }
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
  return { id: 'm-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: 'Neue Kennzahl', formel: '', einheit: '%', richtung: 'hoch', zielGut: 0, zielOk: 0, beschreibung: '', aktiv: true }
}
/** Ampel einer Measure für einen Wert (Zielband + Richtung). */
export function ampel(m, wert) {
  if (m.richtung === 'tief') return wert <= m.zielGut ? 'g' : wert <= m.zielOk ? 'a' : 'r'
  return wert >= m.zielGut ? 'g' : wert >= m.zielOk ? 'a' : 'r'
}
export function setzeZurueck() { localStorage.removeItem(KEY); return ladeMeasures() }
