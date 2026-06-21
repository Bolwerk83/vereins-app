// =========================================================================
//  ADMIN-BEREICH — vom Admin verwaltet. Logo hinterlegen/tauschen,
//  App-Name und Theme/Motto (Black Week, Weihnachten, Ferien …) wählen.
//  Änderungen wirken sofort (CSS-Variablen + Topbar-Logo via onChange).
// =========================================================================
import React, { useState, useRef } from 'react'
import { ladeBranding, speichereBranding, applyBranding, THEMES } from '../../core/admin.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', padding: 18 }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700, marginBottom: 8 }

export default function Admin({ istAdmin = false, onChange }) {
  const [b, setB] = useState(ladeBranding())
  const [gespeichert, setGespeichert] = useState(false)
  const fileRef = useRef(null)

  if (!istAdmin) {
    return (
      <div style={{ ...card, maxWidth: 560, margin: '0 auto', textAlign: 'center', color: 'var(--muted)' }}>
        <div style={{ fontSize: 30, marginBottom: 8 }}>🔒</div>
        Dieser Bereich ist dem <b>Admin</b> vorbehalten. Bitte mit einer Admin-Rolle anmelden.
      </div>
    )
  }

  function aktualisiere(patch) {
    const next = speichereBranding(patch)
    setB(next); applyBranding(next); onChange?.(next)
    setGespeichert(true); setTimeout(() => setGespeichert(false), 1600)
  }

  function onDatei(e) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 400 * 1024) { alert('Bitte ein Logo unter 400 KB wählen.'); return }
    const reader = new FileReader()
    reader.onload = () => aktualisiere({ logoDataUrl: reader.result })
    reader.readAsDataURL(f)
  }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Admin-Bereich</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>
          Branding der Anwendung verwalten: Logo, Name und Motto/Theme. Änderungen wirken sofort.
        </div>
      </div>

      {gespeichert && (
        <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-soft)',
          color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>✓ Gespeichert</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Logo */}
        <div style={card}>
          <div style={cap}>Logo</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: 12, border: '1px solid var(--line)', background: 'var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flex: '0 0 auto' }}>
              {b.logoDataUrl
                ? <img src={b.logoDataUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                : <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)' }} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input ref={fileRef} type="file" accept="image/*" onChange={onDatei} style={{ display: 'none' }} />
              <button onClick={() => fileRef.current?.click()}
                style={{ padding: '7px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13 }}>
                Logo hochladen
              </button>
              {b.logoDataUrl && (
                <button onClick={() => aktualisiere({ logoDataUrl: null })}
                  style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--muted)', cursor: 'pointer', fontSize: 12 }}>
                  Entfernen
                </button>
              )}
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10 }}>PNG/SVG/JPG, max. 400 KB. Wird in der Topbar angezeigt.</div>
        </div>

        {/* App-Name */}
        <div style={card}>
          <div style={cap}>App-Name</div>
          <input value={b.appName} onChange={(e) => setB({ ...b, appName: e.target.value })}
            onBlur={(e) => aktualisiere({ appName: e.target.value.trim() || 'Enterprise Report' })}
            style={{ width: '100%', padding: '9px 11px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 14 }} />
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10 }}>Erscheint in der Topbar und im Browser-Tab.</div>
        </div>
      </div>

      {/* Themes */}
      <div style={{ ...card, marginTop: 14 }}>
        <div style={cap}>Motto / Theme</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
          {THEMES.map((t) => {
            const aktiv = b.themeId === t.id
            return (
              <button key={t.id} onClick={() => aktualisiere({ themeId: t.id })}
                style={{ textAlign: 'left', cursor: 'pointer', borderRadius: 'var(--radius-sm)', padding: '12px 13px',
                  border: aktiv ? `2px solid ${t.accent}` : '1px solid var(--line)', background: aktiv ? t.accent + '14' : 'var(--panel)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, borderRadius: 5, background: t.accent, flex: '0 0 auto' }} />
                  <span style={{ fontSize: 14 }}>{t.emoji} {t.name}</span>
                </div>
                {t.banner && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>{t.banner}</div>}
                {aktiv && <div style={{ fontSize: 11, color: t.accent, fontWeight: 700, marginTop: 6 }}>aktiv</div>}
              </button>
            )
          })}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 12 }}>
          Das Theme setzt die Akzentfarbe der gesamten Anwendung — passend zu Aktionen wie Black Week oder Weihnachten.
        </div>
      </div>
    </div>
  )
}
