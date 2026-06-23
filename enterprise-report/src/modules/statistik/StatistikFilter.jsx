// =========================================================================
//  STATISTIK-FILTER — berichtsspezifische Zeitdimension (wonach die Periode
//  gefiltert wird: Bestell-/Beleg-/Lieferdatum …). Zeitraum und Profit-Center
//  werden global (Topbar-Leiste) gesetzt, da sie für alle Berichte gleich
//  gelten. Die Zeitdimension bleibt hier, weil sie je Fachbereich variiert.
//  Auswahl wird je Bericht in localStorage gemerkt.
// =========================================================================
import React from 'react'
import { datumsartenFuer } from '../../core/statistikFilter.js'

const cap = { fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const sel = { padding: '5px 8px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--panel)', color: 'var(--ink)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }
const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }

// Liefert die gemerkte Zeitdimension eines Berichts (Zeitraum/PC kommen global).
export function ladeFilter(key, fallbackDatumsart) {
  const def = { datumsart: fallbackDatumsart }
  try { const raw = localStorage.getItem('er_statfilter_' + key); return raw == null ? def : { ...def, ...JSON.parse(raw) } } catch { return def }
}
export function speichereFilter(key, wert) { try { localStorage.setItem('er_statfilter_' + key, JSON.stringify(wert)) } catch {} }

export default function StatistikFilter({ bereich, datumsart, onDatumsart }) {
  const datumsarten = datumsartenFuer(bereich)
  return (
    <div className="no-print" style={{ ...card, padding: '9px 14px', display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 12 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={cap}>🗓 Zeitdimension (Periode nach …)</span>
        <select style={sel} value={datumsart} onChange={(e) => onDatumsart(e.target.value)}>
          {datumsarten.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </label>
      <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto', maxWidth: 320, lineHeight: 1.4 }}>
        Die Zeitdimension bestimmt, in welche Periode ein Vorgang fällt — die Zahlen passen sich an. Zeitraum &amp; Profit-Center setzt du oben in der globalen Leiste.
      </span>
    </div>
  )
}
