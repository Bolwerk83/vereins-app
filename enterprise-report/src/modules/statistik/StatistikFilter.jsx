// =========================================================================
//  STATISTIK-FILTER — gemeinsame Filterleiste für die Statistik-Berichte:
//  Zeitraum (Jahr/Halbjahr/Quartal), Zeitdimension (wonach die Periode
//  gefiltert wird: Bestell-/Beleg-/Lieferdatum …) und Profit-Center.
//  Auswahl wird je Bericht in localStorage gemerkt.
// =========================================================================
import React from 'react'
import { ZEITRAEUME, PROFITCENTER, datumsartenFuer } from '../../core/statistikFilter.js'

const cap = { fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const sel = { padding: '5px 8px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--panel)', color: 'var(--ink)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }
const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }

export function ladeFilter(key, fallbackDatumsart) {
  const def = { zeitraum: 'jahr', datumsart: fallbackDatumsart, pc: 'alle' }
  try { const raw = localStorage.getItem('er_statfilter_' + key); return raw == null ? def : { ...def, ...JSON.parse(raw) } } catch { return def }
}
export function speichereFilter(key, wert) { try { localStorage.setItem('er_statfilter_' + key, JSON.stringify(wert)) } catch {} }

export default function StatistikFilter({ bereich, wert, onChange }) {
  const datumsarten = datumsartenFuer(bereich)
  const set = (feld, v) => onChange({ ...wert, [feld]: v })
  return (
    <div className="no-print" style={{ ...card, padding: '9px 14px', display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 12 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={cap}>Zeitraum</span>
        <select style={sel} value={wert.zeitraum} onChange={(e) => set('zeitraum', e.target.value)}>
          {ZEITRAEUME.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={cap}>🗓 Zeitdimension (Periode nach …)</span>
        <select style={sel} value={wert.datumsart} onChange={(e) => set('datumsart', e.target.value)}>
          {datumsarten.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={cap}>Profit-Center</span>
        <select style={sel} value={wert.pc} onChange={(e) => set('pc', e.target.value)}>
          {PROFITCENTER.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>
      <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto', maxWidth: 240, lineHeight: 1.4 }}>
        Die Zeitdimension bestimmt, in welche Periode ein Vorgang fällt — die Zahlen passen sich an.
      </span>
    </div>
  )
}
