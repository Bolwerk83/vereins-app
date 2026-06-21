// =========================================================================
//  BURGER-MENÜ (☰) — globale Steuerung von jeder Seite aus.
//  Öffnet eine Schublade (Drawer) mit allen Bereichen/Aktionen. So kann man
//  von überall navigieren, ohne die Topbar zu überladen.
// =========================================================================
import React, { useState } from 'react'

export default function BurgerMenu({ gruppen = [] }) {
  const [auf, setAuf] = useState(false)
  return (
    <>
      <button onClick={() => setAuf(true)} title="Menü" aria-label="Menü öffnen"
        style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)',
          background: 'var(--panel)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>☰</button>

      {auf && (
        <div onClick={() => setAuf(false)} className="no-print"
          style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(15,23,42,.45)' }}>
          <aside onClick={(e) => e.stopPropagation()}
            style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 300, maxWidth: '85vw', background: 'var(--panel)',
              borderRight: '1px solid var(--line)', boxShadow: '6px 0 30px rgba(0,0,0,.18)', overflowY: 'auto', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Navigation</div>
              <button onClick={() => setAuf(false)} title="Schließen" style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)', lineHeight: 1 }}>×</button>
            </div>

            {gruppen.map((g) => (
              <div key={g.titel} style={{ marginBottom: 14 }}>
                <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>{g.titel}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {g.eintraege.map((e) => (
                    <button key={e.label} onClick={() => { e.onClick(); setAuf(false) }}
                      style={{ textAlign: 'left', padding: '9px 11px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 14,
                        border: `1px solid ${e.aktiv ? 'var(--accent)' : 'transparent'}`,
                        background: e.aktiv ? 'var(--accent-soft)' : 'transparent', color: e.aktiv ? 'var(--accent)' : 'var(--ink)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontWeight: e.aktiv ? 600 : 400 }}>
                      <span>{e.icon ? `${e.icon} ` : ''}{e.label}</span>
                      {e.badge ? <span className="mono" style={{ fontSize: 11, color: 'var(--amp-r)' }}>{e.badge}</span> : null}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </aside>
        </div>
      )}
    </>
  )
}
