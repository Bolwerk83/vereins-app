// =========================================================================
//  LOGIN-DIALOG (Demo) — separates Fenster: Rolle + Name (+ Passwort als
//  Demo-Textfeld) eingeben, danach sind mehr Berichte sichtbar (rollenbasiert).
//  Ohne Anmeldung gilt die Standard-Rolle (Lesezugriff). Das Passwort wird im
//  Demo NICHT geprüft — es ist nur als realistisches Feld vorhanden.
// =========================================================================
import React, { useState } from 'react'

const wrap = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }
const box = { width: 380, maxWidth: '94vw', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: '0 24px 64px rgba(0,0,0,.35)', overflow: 'hidden' }
const feld = { width: '100%', padding: '9px 11px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 14, background: 'var(--panel)', color: 'var(--ink)', boxSizing: 'border-box' }
const lbl = { fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }

export default function LoginDialog({ gruppen = [], onAnmelden, onClose }) {
  // Vorauswahl: erste „echte" Rolle (nicht Standard), damit man sofort mehr sieht.
  const vor = gruppen.find((g) => g.id !== 'g-leser') || gruppen[0]
  const [rolleId, setRolleId] = useState(vor?.id || '')
  const [name, setName] = useState('')
  const [pw, setPw] = useState('')

  function anmelden() {
    if (!rolleId) return
    onAnmelden({ name: name.trim() || 'Demo-Nutzer', rolleId })
  }

  return (
    <div style={wrap} onMouseDown={onClose}>
      <div style={box} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-label="Anmelden">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', background: 'var(--accent)', color: '#fff' }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>🔐 Anmelden</div>
          <div style={{ fontSize: 12, opacity: .95, marginTop: 2 }}>Mit Rolle und Name anmelden, um mehr Berichte zu sehen.</div>
        </div>
        <div style={{ padding: 16, display: 'grid', gap: 13 }}
          onKeyDown={(e) => { if (e.key === 'Enter') anmelden() }}>
          <div>
            <label style={lbl}>Rolle</label>
            <select value={rolleId} onChange={(e) => setRolleId(e.target.value)} style={feld} autoFocus>
              {gruppen.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{gruppen.find((g) => g.id === rolleId)?.beschreibung || ''}</div>
          </div>
          <div>
            <label style={lbl}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Maria Vogel" style={feld} />
          </div>
          <div>
            <label style={lbl}>Passwort <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(Demo — beliebig)</span></label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" style={feld} />
          </div>
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13 }}>Abbrechen</button>
          <button onClick={anmelden} style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Anmelden</button>
        </div>
      </div>
    </div>
  )
}
