// =========================================================================
//  BERICHT-INFO-LEISTE — schlanke Kopfzeile über jedem Bericht: „Was zeigt
//  dieser Bericht?". Eingeklappt eine Zeile (Zweck), ausklappbar mit
//  Zielgruppe, Mehrwert und Pfad. Zentral gerendert – kein Eingriff je Modul.
// =========================================================================
import React, { useState, useEffect } from 'react'
import { infoVon } from '../../core/berichtInfo.js'

export default function BerichtInfoBanner({ view, label, icon, pfad }) {
  const [auf, setAuf] = useState(false)
  useEffect(() => { setAuf(false) }, [view]) // bei Berichtswechsel einklappen
  const info = infoVon(view)
  if (!info) return null

  return (
    <div className="no-print" style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderLeft: '3px solid var(--accent)',
      borderRadius: 'var(--radius-sm)', padding: '8px 12px', marginBottom: 14, fontSize: 13 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ color: 'var(--accent)', flex: '0 0 auto', marginTop: 1 }}>ⓘ</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ color: 'var(--ink)' }}><b>{icon ? `${icon} ` : ''}{label}</b> — {info.zweck}</span>
          {auf && (
            <div style={{ marginTop: 7, color: 'var(--muted)', lineHeight: 1.6 }}>
              <div><b style={{ color: 'var(--ink)' }}>Für wen:</b> {info.zielgruppe}</div>
              <div><b style={{ color: 'var(--ink)' }}>Mehrwert:</b> {info.mehrwert}</div>
              {pfad && <div style={{ fontSize: 11.5, marginTop: 3 }}>📍 {pfad}</div>}
            </div>
          )}
        </div>
        <button onClick={() => setAuf((v) => !v)}
          style={{ flex: '0 0 auto', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}>
          {auf ? 'Weniger ▴' : 'Mehr ▾'}
        </button>
      </div>
    </div>
  )
}
