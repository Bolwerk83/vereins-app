// =========================================================================
//  BURGER-MENÜ (☰) — globale, MEHRSTUFIGE Navigation von jeder Seite aus.
//  Ebene 1: Gruppe (aufklappbar) → Ebene 2: Untergruppe (Bereich) → Eintrag.
//  Klare Abgrenzung durch Akkordeon; die Gruppe mit der aktiven Seite ist offen.
// =========================================================================
import React, { useState } from 'react'

// Untergruppen ODER flache Einträge unterstützen (rückwärtskompatibel).
const untergruppenVon = (g) => g.untergruppen || (g.eintraege ? [{ titel: null, eintraege: g.eintraege }] : [])
const hatAktive = (g) => untergruppenVon(g).some((u) => (u.eintraege || []).some((e) => e.aktiv))

function Eintrag({ e, onNav }) {
  return (
    <button onClick={() => { e.onClick(); onNav() }}
      style={{ textAlign: 'left', padding: '8px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 13.5,
        border: `1px solid ${e.aktiv ? 'var(--accent)' : 'transparent'}`,
        background: e.aktiv ? 'var(--accent-soft)' : 'transparent', color: e.aktiv ? 'var(--accent)' : 'var(--ink)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontWeight: e.aktiv ? 600 : 400 }}>
      <span>{e.icon ? `${e.icon} ` : ''}{e.label}</span>
      {e.badge ? <span className="mono" style={{ fontSize: 11, color: 'var(--amp-r)' }}>{e.badge}</span> : null}
    </button>
  )
}

export default function BurgerMenu({ gruppen = [] }) {
  const [auf, setAuf] = useState(false)
  // Standard: Gruppe(n) mit aktiver Seite offen, sonst die erste.
  const [offen, setOffen] = useState(() => {
    const s = new Set(gruppen.filter(hatAktive).map((g) => g.titel))
    if (s.size === 0 && gruppen[0]) s.add(gruppen[0].titel)
    return s
  })
  const toggle = (titel) => setOffen((s) => { const n = new Set(s); n.has(titel) ? n.delete(titel) : n.add(titel); return n })
  const schliessen = () => setAuf(false)

  return (
    <>
      <button onClick={() => setAuf(true)} title="Menü" aria-label="Menü öffnen"
        style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)',
          background: 'var(--panel)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>☰</button>

      {auf && (
        <div onClick={schliessen} className="no-print"
          style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(15,23,42,.45)' }}>
          <aside onClick={(e) => e.stopPropagation()}
            style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 320, maxWidth: '88vw', background: 'var(--panel)',
              borderRight: '1px solid var(--line)', boxShadow: '6px 0 30px rgba(0,0,0,.18)', overflowY: 'auto', padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Navigation</div>
              <button onClick={schliessen} title="Schließen" style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)', lineHeight: 1 }}>×</button>
            </div>

            {gruppen.map((g) => {
              const istOffen = offen.has(g.titel)
              const ug = untergruppenVon(g)
              const anzahl = ug.reduce((n, u) => n + (u.eintraege?.length || 0), 0)
              if (!anzahl) return null
              return (
                <div key={g.titel} style={{ marginBottom: 6, border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <button onClick={() => toggle(g.titel)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 12px',
                      border: 'none', cursor: 'pointer', background: istOffen ? 'var(--bg)' : 'var(--panel)', fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>
                    <span>{g.icon ? `${g.icon} ` : ''}{g.titel}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="mono" style={{ fontSize: 10.5, color: 'var(--muted)' }}>{anzahl}</span>
                      <span style={{ color: 'var(--muted)', transform: istOffen ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>›</span>
                    </span>
                  </button>
                  {istOffen && (
                    <div style={{ padding: '4px 8px 10px' }}>
                      {ug.map((u, i) => (
                        <div key={u.titel || i} style={{ marginTop: u.titel ? 8 : 2 }}>
                          {u.titel && <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '2px 4px 5px' }}>{u.titel}</div>}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {u.eintraege.map((e) => <Eintrag key={e.label} e={e} onNav={schliessen} />)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </aside>
        </div>
      )}
    </>
  )
}
