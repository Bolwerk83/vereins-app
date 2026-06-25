// =========================================================================
//  PC-FILTER (gemeinsam) — schlanke Profit-Center-Filterleiste für Berichte
//  außerhalb der Statistik-Suite (Versand, Leasing, Forderungen, DB, Ergebnis,
//  Finanz-Cockpit). Der Wert kommt aus dem GLOBALEN Filter-Kontext: eine
//  Profit-Center-Auswahl gilt damit berichtsübergreifend. Nutzt denselben
//  PC-Baum (Geschäftsbereich / Vertriebskanal / Land); Kanäle sind PC-Knoten.
// =========================================================================
import React from 'react'
import { pcBaum, pcName } from '../../core/statistikFilter.js'

const cap = { fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const selStyle = { padding: '5px 8px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--panel)', color: 'var(--ink)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }
const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }

export { pcName }

/** Hinweistext für die Überschrift: leer bei „alle", sonst „· <PC-Name>". */
export const pcHinweis = (pc) => (!pc || pc === 'alle' ? '' : ` · ${pcName(pc)}`)

export default function PcFilter({ pc, onChange, hinweis }) {
  return (
    <div className="no-print" style={{ ...card, padding: '9px 14px', display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 12, background: 'var(--accent-soft)' }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={cap}>🎯 Profit-Center · global (inkl. Kanal)</span>
        <select style={selStyle} value={pc} onChange={(e) => onChange(e.target.value)}>
          <option value="alle">Gesamtunternehmen</option>
          {pcBaum().map((gr) => (
            <optgroup key={gr.id} label={gr.name}>
              {gr.knoten.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
            </optgroup>
          ))}
        </select>
      </label>
      <span style={{ fontSize: 11, color: 'var(--muted)', maxWidth: 380, lineHeight: 1.4 }}>
        {hinweis || 'Wert nach Profit-Center-Anteil; Verhältniskennzahlen bleiben unverändert.'} <span style={{ fontStyle: 'italic' }}>Gilt berichtsübergreifend.</span>
      </span>
    </div>
  )
}
