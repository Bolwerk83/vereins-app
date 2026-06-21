// =========================================================================
//  DATENSÄTZE — Katalog der einbettbaren Tabellen (Detail- & Perspektiv-
//  datensätze) für Tabellen-Blöcke im Report-Designer.
//  Liste aus den Mock-Schlüsseln; geladen wird quellenrein über den
//  dataProvider (Mock oder MSSQL), inkl. Virtualisierung großer Tabellen.
// =========================================================================
import { MOCK } from '../data/mock.js'
import { ladeDetail, ladePerspektive } from './dataProvider.js'

/** Auswahlliste: [{ kind, key, titel, zeilen }]. */
export function datensatzKatalog() {
  const d = Object.entries(MOCK.details || {}).map(([key, v]) => ({ kind: 'detail', key, titel: v.titel, zeilen: v.zeilen?.length || 0 }))
  const p = Object.entries(MOCK.perspektiven || {}).map(([key, v]) => ({ kind: 'perspektive', key, titel: v.titel, zeilen: v.zeilen?.length || 0 }))
  return [...d, ...p].sort((a, b) => a.titel.localeCompare(b.titel, 'de'))
}

export const datensatzInfo = (kind, key) => datensatzKatalog().find((x) => x.kind === kind && x.key === key)

/** Einen Datensatz laden (quellenrein, async). */
export function ladeDatensatz(kind, key) {
  return kind === 'detail' ? ladeDetail(key) : ladePerspektive(key)
}

// Deutsche Zahl ("1.240" / "38 %" / "−0,3") parsen — sonst null.
function parseNum(v) {
  const s = String(v).replace(/[^\d,.\-−]/g, '').replace(/−/g, '-').replace(/\./g, '').replace(',', '.')
  const n = parseFloat(s)
  return Number.isNaN(n) ? null : n
}

/** Eindeutige Werte einer Spalte (für Filter-Dropdowns). */
export const distinktWerte = (ds, idx) => [...new Set((ds?.zeilen || []).map((z) => z[idx]))]

/**
 * Sicht auf einen Datensatz anwenden: Spaltenfilter, Schnellsuche, Sortierung
 * und Top-N. view = { feld:{idx:wert}, suche, sortIdx, sortDir, top }.
 * Liefert { ...ds, zeilen, _gesamt } (Gesamtzahl vor Top-N).
 */
export function tabellenSicht(ds, view = {}) {
  if (!ds?.zeilen) return ds
  let zeilen = ds.zeilen
  for (const [idx, wert] of Object.entries(view.feld || {})) if (wert) zeilen = zeilen.filter((z) => String(z[idx]) === wert)
  const s = (view.suche || '').trim().toLowerCase()
  if (s) zeilen = zeilen.filter((z) => z.some((c) => String(c).toLowerCase().includes(s)))
  if (view.sortIdx != null) {
    zeilen = [...zeilen].sort((a, b) => {
      const na = parseNum(a[view.sortIdx]), nb = parseNum(b[view.sortIdx])
      const c = (na != null && nb != null) ? na - nb : String(a[view.sortIdx]).localeCompare(String(b[view.sortIdx]), 'de')
      return view.sortDir === 'desc' ? -c : c
    })
  }
  const gesamt = zeilen.length
  if (view.top) zeilen = zeilen.slice(0, view.top)
  return { ...ds, zeilen, _gesamt: gesamt }
}
