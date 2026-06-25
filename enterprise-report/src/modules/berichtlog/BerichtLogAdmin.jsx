// =========================================================================
//  BERICHT-ZUGRIFFS-LOG (Admin) — je Bericht: Personen, Aufrufe (pro Tag/User
//  einmal), Ersteller & Bearbeiter mit Datum, Direkt-Link. Admin-Aufrufe
//  werden NICHT gezählt.
// =========================================================================
import React, { useState } from 'react'
import { alleBerichte, ladeGlobale, berichtLink } from '../../core/berichtOrdner.js'
import { logVon } from '../../core/berichtLog.js'
import { nutzerLabel } from '../../core/identitaet.js'
import { gesamtStand } from '../../core/datenstand.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }

export default function BerichtLogAdmin({ istAdmin }) {
  const [kopiert, setKopiert] = useState(null)
  if (!istAdmin) return <div style={{ padding: 24, color: 'var(--muted)' }}>Nur für Administratoren.</div>
  const berichte = [...alleBerichte(), ...ladeGlobale().map((g) => ({ ...g, global: true }))]
  const kopiere = (id) => { try { navigator.clipboard?.writeText(berichtLink(id)) } catch {} setKopiert(id); setTimeout(() => setKopiert(null), 1200) }

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 12 }}>
        <div style={cap}>Administration · Nutzung der Berichte</div>
        <h2 style={{ margin: '4px 0 0' }}>Bericht-Zugriffs-Log</h2>
      </div>

      <div style={{ ...card, padding: 14, marginBottom: 14, borderLeft: '3px solid var(--accent)', fontSize: 13, lineHeight: 1.5 }}>
        Aufrufe je Bericht — ein Nutzer zählt <b>pro Tag nur einmal</b>. <b>Admin-Aufrufe werden nicht gezählt</b>
        (sonst verzerren Verwaltungs-Zugriffe die Statistik). · Datenstand: <b>{gesamtStand()}</b>
      </div>

      <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
        {berichte.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)' }}>Noch keine gespeicherten Berichte.</div>}
        {berichte.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead><tr>{['Bericht', 'Personen', 'Aufrufe', 'Heute', 'Erstellt von / am', 'Zuletzt bearb. von / am', 'Link'].map((h, i) => (
              <th key={i} style={{ textAlign: i >= 1 && i <= 3 ? 'right' : 'left', padding: '6px 8px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {berichte.map((b) => {
                const l = logVon(b.id)
                return (
                  <tr key={b.id}>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{b.global ? '🌐 ' : ''}{b.titel}{b.privat ? ' 🔒' : ''}</td>
                    <td className="mono" style={{ padding: '6px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{l.personen}</td>
                    <td className="mono" style={{ padding: '6px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{l.aufrufeGesamt}</td>
                    <td className="mono" style={{ padding: '6px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right', color: l.heute ? 'var(--amp-g)' : 'var(--muted)' }}>{l.heute}</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--line)', color: 'var(--slate)' }}>{nutzerLabel(b.ersteller)} · {b.erstellt || '—'}</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--line)', color: 'var(--slate)' }}>{b.bearbeitetVon ? `${nutzerLabel(b.bearbeitetVon)} · ${b.bearbeitetAm}` : '—'}</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--line)' }}>
                      <button onClick={() => kopiere(b.id)} title={berichtLink(b.id)} style={{ fontSize: 11.5, cursor: 'pointer', border: '1px solid var(--line)', background: 'var(--panel)', borderRadius: 999, padding: '2px 10px' }}>{kopiert === b.id ? '✓ kopiert' : '🔗 Link'}</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
