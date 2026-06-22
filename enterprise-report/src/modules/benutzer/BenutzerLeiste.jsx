// =========================================================================
//  BENUTZER-ANMELDUNG (Kopfzeile)
//  Name/Login eingeben -> das Tool ermittelt automatisch die Gruppe(n) und
//  damit die Rechte. Ohne Anmeldung: Demo-/Admin-Modus mit Gruppenauswahl.
// =========================================================================
import React, { useState } from 'react'
import { findeGruppenFuerName } from '../../core/gruppen.js'

const inp = { padding: '5px 8px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', fontSize: 12 }

export default function BenutzerLeiste({ benutzer, rolle, onLogin, onLogout, gruppen }) {
  const [name, setName] = useState('')
  const [fehler, setFehler] = useState('')

  function anmelden() {
    const n = name.trim()
    if (!n) return
    const treffer = findeGruppenFuerName(n)
    if (!treffer.length) {
      setFehler('Kein Mitglied dieses Namens in einer Gruppe gefunden.')
      return
    }
    setFehler(''); setName(''); onLogin(n)
  }

  if (benutzer) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px 4px 10px', borderRadius: 999, background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}>
        <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>👤 {benutzer}</span>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>· {rolle?.gruppen?.join(' + ') || '—'}</span>
        <button onClick={onLogout} title="Abmelden" style={{ ...inp, padding: '3px 8px', cursor: 'pointer' }}>Abmelden</button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input value={name} onChange={(e) => { setName(e.target.value); setFehler('') }}
        onKeyDown={(e) => { if (e.key === 'Enter') anmelden() }}
        placeholder="Anmelden (Name)…" style={{ ...inp, width: 140 }} />
      <button onClick={anmelden} style={{ ...inp, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600 }}>Anmelden</button>
      {fehler && <span style={{ fontSize: 11, color: 'var(--amp-r)' }}>{fehler}</span>}
    </div>
  )
}
