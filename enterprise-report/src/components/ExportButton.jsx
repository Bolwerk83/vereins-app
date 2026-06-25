// =========================================================================
//  EXPORT-BUTTON — wiederverwendbarer CSV-Export (Excel-kompatibel) für
//  Berichts-Tabellen. `rows` enthält die Kopfzeile als erste Zeile.
// =========================================================================
import React from 'react'
import { downloadCsv } from '../core/export.js'

export default function ExportButton({ filename, rows, label = '⬇ CSV', title = 'Tabelle als CSV exportieren (Excel-kompatibel)' }) {
  const leer = !rows || rows.length <= 1
  return (
    <button className="no-print" onClick={() => { if (!leer) downloadCsv(filename, rows) }} disabled={leer} title={title} aria-label={title}
      style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: leer ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: leer ? 0.5 : 1, color: 'var(--ink)' }}>
      {label}
    </button>
  )
}
