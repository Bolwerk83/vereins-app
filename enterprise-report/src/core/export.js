// =========================================================================
//  EXPORT — CSV (Excel-kompatibel) und PDF (Druck).
//  Rein clientseitig: CSV als Download (Semikolon + BOM für Umlaute in
//  Excel), PDF über den Browser-Druck (window.print + @media print).
// =========================================================================
import { KPI } from './kpiRegistry.js'
import { kpiInsight } from './insights.js'
import { formatWert, AMPEL_LABEL } from '../design/theme.js'

function csvCell(v) {
  const s = String(v ?? '')
  return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}
export function downloadCsv(filename, rows) {
  const csv = rows.map((r) => r.map(csvCell).join(';')).join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename.endsWith('.csv') ? filename : filename + '.csv'
  document.body.appendChild(a); a.click(); a.remove()
  URL.revokeObjectURL(a.href)
}

export function druckePdf() { window.print() }

/** CSV-Zeilen für einen Berichtsknoten (KPIs + optional Detailtabelle). */
export function knotenAlsCsv({ titel, periode, kpiIds = [], werte = {}, rolle, detail }) {
  const rows = [[titel || 'Bericht'], [`Periode: ${periode || ''}`], []]
  if (kpiIds.length) {
    rows.push(['Kennzahl', 'Ist', 'Ziel', 'Status', 'Abw. Ziel'])
    kpiIds.forEach((id) => {
      const k = KPI[id]; if (!k) return
      const ins = kpiInsight(id, werte[id])
      rows.push([k.name, formatWert(werte[id], k.einheit),
        k.ziel != null ? formatWert(k.ziel, k.einheit) : '–',
        AMPEL_LABEL[ins.status], ins.zielText])
    })
    rows.push([])
  }
  if (detail?.spalten) {
    rows.push([detail.titel || 'Detail'])
    rows.push(detail.spalten)
    detail.zeilen.forEach((z) => rows.push(z))
  }
  return rows
}
