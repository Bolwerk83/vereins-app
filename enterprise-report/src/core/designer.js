// =========================================================================
//  REPORT-DESIGNER — Speicher für selbst gebaute Management-Reports.
//  Ein Report ist eine Liste von Blöcken: KPI · Text · Maßnahmen.
//  Persistenz: LocalStorage (später MSSQL-Tabelle).
// =========================================================================
const KEY = 'er_designer_reports'

export function ladeReports() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
function speichere(a) { localStorage.setItem(KEY, JSON.stringify(a)); return a }

export function saveReport(r) {
  const a = ladeReports()
  const i = a.findIndex((x) => x.id === r.id)
  if (i >= 0) a[i] = r; else a.unshift(r)
  return speichere(a)
}
export function removeReport(id) { return speichere(ladeReports().filter((x) => x.id !== id)) }

// Katalog-Einträge der eigenen Reports mit fortlaufender Nummer EIG-00N.
export function eigeneBerichtsItems() {
  return ladeReports().map((r, i) => ({
    id: r.id, nummer: `EIG-${String(i + 1).padStart(3, '0')}`,
    titel: r.titel, ebene: '—', typ: 'designer'
  }))
}

export function neuerReport() {
  return {
    id: 'r_' + Date.now().toString(36),
    titel: 'Neuer Management Report',
    beschreibung: '',
    bloecke: [],
    erstellt: new Date().toISOString().slice(0, 10)
  }
}
