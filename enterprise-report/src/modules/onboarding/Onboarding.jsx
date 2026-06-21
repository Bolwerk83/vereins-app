// =========================================================================
//  ONBOARDING — rollenbasierte, jederzeit aufrufbare Einführung (Modal).
//  Zeigt einen zugeschnittenen Pfad mit Sprunglinks in die Ansichten.
// =========================================================================
import React, { useState } from 'react'
import { profilFuer, merkeGesehen } from '../../core/onboarding.js'

export default function Onboarding({ rolle, istAdmin = false, onGeh, onClose }) {
  const profil = profilFuer(rolle, istAdmin)
  const [i, setI] = useState(0)
  const [nicht, setNicht] = useState(false)
  const schritt = profil.schritte[i]
  const letzter = i === profil.schritte.length - 1

  function schliessen() { if (nicht) merkeGesehen(rolle?.id); onClose?.() }
  function spring(ziel) { if (nicht) merkeGesehen(rolle?.id); onGeh?.(ziel); onClose?.() }

  return (
    <div onClick={schliessen} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--panel)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', width: 'min(560px, 100%)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '2px solid var(--accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>Onboarding · {profil.titel}</div>
            <h2 style={{ margin: '4px 0 0', fontSize: 19 }}>👋 {profil.intro}</h2>
          </div>
          <button onClick={schliessen} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}>×</button>
        </div>

        <div style={{ padding: 20 }}>
          {/* Fortschritt */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {profil.schritte.map((_, x) => (
              <div key={x} style={{ flex: 1, height: 4, borderRadius: 2, background: x <= i ? 'var(--accent)' : 'var(--line)' }} />
            ))}
          </div>

          <div style={{ minHeight: 96 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>Schritt {i + 1} von {profil.schritte.length}</div>
            <h3 style={{ margin: '4px 0 6px', fontSize: 17 }}>{schritt.titel}</h3>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--slate)', lineHeight: 1.5 }}>{schritt.text}</p>
            {schritt.ziel && (
              <button onClick={() => spring(schritt.ziel)} style={{ marginTop: 12, padding: '8px 14px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                Dorthin springen →
              </button>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, flexWrap: 'wrap', gap: 10 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={nicht} onChange={(e) => setNicht(e.target.checked)} /> nicht erneut automatisch zeigen
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0} style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--panel)', cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? .5 : 1 }}>Zurück</button>
              {letzter
                ? <button onClick={schliessen} style={{ padding: '8px 14px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--amp-g)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Fertig</button>
                : <button onClick={() => setI((x) => x + 1)} style={{ padding: '8px 14px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Weiter</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
