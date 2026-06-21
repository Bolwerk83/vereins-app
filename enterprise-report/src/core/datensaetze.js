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
