// =========================================================================
//  DIMENSIONS-HIERARCHIEN — je Dimension eine oder MEHRERE Hierarchien
//  (parallele Strukturen) aus den Spalten der Quelltabelle. Tabular-Baustein:
//  Ebenen ordnen (z. B. Warenbereich → Produktgruppe → SKU). Persistent.
// =========================================================================
import { QUELLEN } from './datenmodell.js'

export const DIMENSIONEN = QUELLEN.filter((q) => q.typ === 'dim')
export const spaltenVon = (dimId) => (QUELLEN.find((q) => q.id === dimId)?.spalten) || []

const KEY = 'er_dim_hierarchien'
function seed() {
  return [
    { id: 'h-periode-kal', dimId: 'DimPeriode', name: 'Kalender', ebenen: ['Jahr', 'Quartal', 'Monat'] },
    { id: 'h-artikel-prod', dimId: 'DimArtikel', name: 'Produkthierarchie', ebenen: ['Warenbereich', 'Produktgruppe', 'Bezeichnung', 'SKU'] },
    { id: 'h-pc-gb', dimId: 'DimProfitcenter', name: 'Geschäftsbereich', ebenen: ['Name'] },
    { id: 'h-pc-kanal', dimId: 'DimProfitcenter', name: 'Vertriebskanal', ebenen: ['Kanal', 'Name'] },
    { id: 'h-pc-land', dimId: 'DimProfitcenter', name: 'Land/Region', ebenen: ['Land', 'Name'] },
    { id: 'h-konto-guv', dimId: 'DimKonto', name: 'GuV-Struktur', ebenen: ['GuVGruppe', 'Bezeichnung'] }
  ]
}
export function ladeHierarchien() {
  try { const raw = localStorage.getItem(KEY); return raw == null ? seed() : JSON.parse(raw) } catch { return seed() }
}
function speichere(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); return arr }
export const hierarchienVon = (dimId) => ladeHierarchien().filter((h) => h.dimId === dimId)

export function neueHierarchie(dimId, name) {
  const arr = ladeHierarchien()
  arr.push({ id: 'h-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), dimId, name: name || 'Neue Hierarchie', ebenen: [] })
  return speichere(arr)
}
export function loescheHierarchie(id) { return speichere(ladeHierarchien().filter((h) => h.id !== id)) }
export function benenneHierarchie(id, name) {
  return speichere(ladeHierarchien().map((h) => h.id === id ? { ...h, name } : h))
}
export function addEbene(id, spalte) {
  return speichere(ladeHierarchien().map((h) => h.id === id && !h.ebenen.includes(spalte) ? { ...h, ebenen: [...h.ebenen, spalte] } : h))
}
export function removeEbene(id, idx) {
  return speichere(ladeHierarchien().map((h) => h.id === id ? { ...h, ebenen: h.ebenen.filter((_, i) => i !== idx) } : h))
}
export function verschiebeEbene(id, idx, dir) {
  return speichere(ladeHierarchien().map((h) => {
    if (h.id !== id) return h
    const e = [...h.ebenen]; const j = idx + dir
    if (j < 0 || j >= e.length) return h
    ;[e[idx], e[j]] = [e[j], e[idx]]
    return { ...h, ebenen: e }
  }))
}
export function setzeZurueck() { localStorage.removeItem(KEY); return ladeHierarchien() }
