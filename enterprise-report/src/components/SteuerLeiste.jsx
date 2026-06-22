// =========================================================================
//  STEUER-/FILTERLEISTE — einheitliches Muster für alle Seiten & Berichte.
//
//   [ Highlight-Filter (immer sichtbar) ........ ⚙ Zusatzfilter (n aktiv) ]
//   └─ Texthinweis: welche Zusatzfilter es gibt   (nur wenn zugeklappt)
//   └─ aufklappbares Panel mit vielen Filtern     (nur wenn aufgeklappt)
//
//  Die Aktiv-Anzeige (Badge / Chips) erscheint NUR, wenn Zusatzfilter
//  gesetzt sind — sonst nicht.
// =========================================================================
import React, { useState } from 'react'

export default function SteuerLeiste({
  highlight,                 // immer sichtbarer Bereich (React-Node)
  zusatzNamen = [],          // Namen der verfügbaren Zusatzfilter (für den Hinweis)
  aktiveFilter = [],         // Liste gesetzter Zusatzfilter, z. B. ['Zeitraum', 'Status: offen']
  children                   // Inhalt des aufklappbaren Zusatzfilter-Panels
}) {
  const [auf, setAuf] = useState(false)
  const n = aktiveFilter.length

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--panel)', padding: 12, boxShadow: 'var(--shadow)' }}>
      {/* Kopfzeile: Highlight links, Zusatzfilter-Schalter rechts */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>{highlight}</div>
        <button onClick={() => setAuf((v) => !v)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 13px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            border: `1px solid ${n ? 'var(--accent)' : 'var(--line)'}`, background: n ? 'var(--accent-soft)' : 'var(--panel)',
            color: n ? 'var(--accent)' : 'var(--ink)', fontWeight: 600, fontSize: 13 }}>
          ⚙ Zusatzfilter
          {/* Aktiv-Anzeige NUR wenn gesetzt */}
          {n > 0 && <span className="mono" style={{ fontSize: 11, background: 'var(--accent)', color: '#fff', borderRadius: 999, padding: '1px 7px' }}>{n} aktiv</span>}
          <span style={{ fontSize: 11 }}>{auf ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Aktive Filter als Chips — nur wenn welche gesetzt sind */}
      {n > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {aktiveFilter.map((f, i) => (
            <span key={i} className="mono" style={{ fontSize: 11, padding: '2px 9px', borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>{f}</span>
          ))}
        </div>
      )}

      {/* Hinweis, welche Zusatzfilter es gibt — nur im zugeklappten Zustand */}
      {!auf && zusatzNamen.length > 0 && (
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
          Zusatzfilter verfügbar: {zusatzNamen.join(' · ')}. Über „⚙ Zusatzfilter" ein-/ausblenden.
        </div>
      )}

      {/* Aufklappbares Panel mit vielen Filtern */}
      {auf && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
          {children}
        </div>
      )}
    </div>
  )
}
