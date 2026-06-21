// =========================================================================
//  VERSIONSVERGLEICH — Datenarten/Stände gegenüberstellen (Ist vs Plan,
//  FC vs FC Januar …). Kürzel in der Tabelle, Klartext bei der Auswahl.
// =========================================================================
import React, { useState } from 'react'
import { VERSIONEN, version, vergleich } from '../../core/versionen.js'
import { formatWert } from '../../design/theme.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const sel = { padding: '7px 9px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit' }

export default function Versionsvergleich() {
  const [aId, setAId] = useState('ist')
  const [bId, setBId] = useState('plan')
  const a = version(aId), b = version(bId)
  const zeilen = vergleich(aId, bId)

  const auswahl = (wert, set, exclude) => (
    // Filter/Auswahl IMMER mit sauberer Bezeichnung (Klartext)
    <select style={sel} value={wert} onChange={(e) => set(e.target.value)}>
      {VERSIONEN.map((v) => <option key={v.id} value={v.id} disabled={v.id === exclude}>{v.name}</option>)}
    </select>
  )

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Versionsvergleich</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>
          Stelle zwei Datenarten/Stände gegenüber — z. B. <b>Ist vs Plan</b> oder <b>Forecast aktuell vs Forecast Januar</b>.
          In der Tabelle stehen die <b>Kürzel</b> (kompakt), bei der Auswahl die <b>klare Bezeichnung</b>.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 14 }}>
        <label style={{ fontSize: 11, color: 'var(--muted)' }}>Version A (Basis)<br />{auswahl(aId, setAId, bId)}</label>
        <span style={{ fontSize: 20, color: 'var(--muted)', paddingBottom: 4 }}>vs</span>
        <label style={{ fontSize: 11, color: 'var(--muted)' }}>Version B (Vergleich)<br />{auswahl(bId, setBId, aId)}</label>
      </div>

      <div style={{ ...card, overflow: 'auto' }} className="tabelle-scroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 520 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)' }}>
              <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>Kennzahl</th>
              <th title={a.name} style={{ textAlign: 'right', padding: '10px 14px', fontSize: 12 }}>{a.kurz}</th>
              <th title={b.name} style={{ textAlign: 'right', padding: '10px 14px', fontSize: 12 }}>{b.kurz}</th>
              <th style={{ textAlign: 'right', padding: '10px 14px', fontSize: 12 }}>Δ abs.</th>
              <th style={{ textAlign: 'right', padding: '10px 14px', fontSize: 12 }}>Δ %</th>
            </tr>
          </thead>
          <tbody>
            {zeilen.map((z) => {
              const farbe = z.istGut == null ? 'var(--muted)' : z.istGut ? 'var(--amp-g)' : 'var(--amp-r)'
              return (
                <tr key={z.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '9px 14px' }}>{z.name}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '9px 14px' }}>{formatWert(z.a, z.einheit)}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '9px 14px', color: 'var(--muted)' }}>{formatWert(z.b, z.einheit)}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '9px 14px', color: farbe, fontWeight: 600 }}>
                    {z.dAbs == null ? '—' : `${z.dAbs >= 0 ? '+' : ''}${formatWert(z.dAbs, z.einheit)}`}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '9px 14px', color: farbe }}>
                    {z.dPct == null ? '—' : `${z.dPct >= 0 ? '+' : ''}${z.dPct.toFixed(1)} %`}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legende: Kürzel -> Klartext */}
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {VERSIONEN.map((v) => <span key={v.id}><b className="mono">{v.kurz}</b> = {v.name}</span>)}
      </div>
    </div>
  )
}
