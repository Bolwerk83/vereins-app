// =========================================================================
//  KI-STEUERUNG (Admin) — Schalter „KI im Reporting an/aus" plus Betriebsmodus
//  für Datensouveränität (wo bleiben die Daten?) und Datenfreigabe-Stufe.
// =========================================================================
import React, { useState } from 'react'
import { MODI, DATENFREIGABE, ladeKi, setzeKi, datenStandort } from '../../core/kiEinstellungen.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }

export default function KiSteuerung({ istAdmin }) {
  const [, setTick] = useState(0)
  const refresh = () => setTick((t) => t + 1)
  if (!istAdmin) return <div style={{ padding: 24, color: 'var(--muted)' }}>Nur für Administratoren.</div>
  const k = ladeKi()
  const set = (patch) => { setzeKi(patch); refresh() }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: 12 }}>
        <div style={cap}>Administration · KI im Reporting</div>
        <h2 style={{ margin: '4px 0 0' }}>KI-Steuerung</h2>
      </div>

      {/* Master-Schalter */}
      <div style={{ ...card, padding: 18, marginBottom: 14, borderLeft: `4px solid ${k.aktiv ? 'var(--amp-g)' : 'var(--amp-r)'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>KI im Reporting {k.aktiv ? 'aktiviert' : 'deaktiviert'}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Steuert KI-Vorschläge, Erkenntnisse und den KI-Report-Builder.</div>
          </div>
          <button onClick={() => set({ aktiv: !k.aktiv })} role="switch" aria-checked={k.aktiv}
            style={{ width: 64, height: 32, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative', background: k.aktiv ? 'var(--amp-g)' : 'var(--line)' }}>
            <span style={{ position: 'absolute', top: 3, left: k.aktiv ? 35 : 3, width: 26, height: 26, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
          </button>
        </div>
      </div>

      {k.aktiv && (
        <>
          <div style={{ ...card, padding: 16, marginBottom: 14 }}>
            <div style={{ ...cap, marginBottom: 8 }}>Betriebsmodus — wo liegen die Daten?</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {MODI.map((m) => (
                <label key={m.id} style={{ display: 'flex', gap: 10, padding: 10, borderRadius: 'var(--radius-sm)', cursor: 'pointer', alignItems: 'flex-start',
                  border: `1.5px solid ${k.modus === m.id ? 'var(--accent)' : 'var(--line)'}`, background: k.modus === m.id ? 'var(--bg)' : 'var(--panel)' }}>
                  <input type="radio" name="modus" checked={k.modus === m.id} onChange={() => set({ modus: m.id })} style={{ marginTop: 3 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{m.name} <span title="Souveränität">{'🛡'.repeat(m.souv)}</span></div>
                    <div style={{ fontSize: 12.5, color: 'var(--slate)', lineHeight: 1.45 }}>{m.info}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div style={{ ...card, padding: 16, marginBottom: 14 }}>
            <div style={{ ...cap, marginBottom: 8 }}>Datenfreigabe an die KI</div>
            <div style={{ display: 'grid', gap: 6 }}>
              {DATENFREIGABE.map((d) => (
                <label key={d.id} style={{ display: 'flex', gap: 10, padding: '6px 4px', cursor: 'pointer', alignItems: 'flex-start' }}>
                  <input type="radio" name="freigabe" checked={k.datenfreigabe === d.id} onChange={() => set({ datenfreigabe: d.id })} style={{ marginTop: 3 }} />
                  <div><span style={{ fontSize: 13.5, fontWeight: 600 }}>{d.name}</span> <span style={{ fontSize: 12, color: 'var(--muted)' }}>— {d.info}</span></div>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      <div style={{ ...card, padding: 16, borderLeft: '3px solid var(--accent)' }}>
        <div style={{ ...cap, marginBottom: 6 }}>Aktueller Datenstandort</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{datenStandort()}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
          Empfehlung für maximale Souveränität: <b>Lokal/On-Premise</b> + Freigabe <b>nur Metadaten</b> — die KI plant
          dann nur über Struktur & Kennzahlnamen, echte Firmendaten verlassen das Haus nie. Durchsetzung serverseitig.
        </div>
      </div>
    </div>
  )
}
