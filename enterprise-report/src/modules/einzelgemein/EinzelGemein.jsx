// =========================================================================
//  EINZEL- & GEMEINKOSTEN — Zurechenbarkeit erklärt + Zuschlagskalkulation
//  (Material/Fertigung → Herstellkosten → Selbstkosten) mit Zuschlagssätzen.
// =========================================================================
import React from 'react'
import { KONZEPTE, GK_BEISPIELE, kalkulation, schema } from '../../core/einzelGemein.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const mio = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' Mio €'

export default function EinzelGemein({ onGeh }) {
  const k = kalkulation()
  const zeilen = schema()
  const einzelAnteil = +(k.einzel / (k.einzel + k.gemein) * 100).toFixed(1)

  const kachel = (label, wert, hint) => (
    <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 150 }}>
      <div style={cap}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{wert}</div>
      {hint && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{hint}</div>}
    </div>
  )

  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Einzel- &amp; Gemeinkosten</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 720 }}>
            Was lässt sich einem Produkt <b>direkt</b> zurechnen (Einzelkosten) und was nur über einen <b>Schlüssel</b>
            (Gemeinkosten)? Daraus folgt die <b>Zuschlagskalkulation</b> bis zu den Selbstkosten.
          </div>
        </div>
        {onGeh && <button onClick={() => onGeh('klr')} style={{ ...card, padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← zur KLR</button>}
      </div>

      {/* Kennzahlen */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {kachel('Einzelkosten', mio(k.einzel), einzelAnteil + ' % der Kosten')}
        {kachel('Gemeinkosten', mio(k.gemein), k.gemeinquote + ' % der Kosten')}
        {kachel('Herstellkosten', mio(k.hk))}
        {kachel('Selbstkosten', mio(k.selbst))}
      </div>

      {/* Konzepte */}
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Begriffe — einfach erklärt</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          {KONZEPTE.map((c) => (
            <div key={c.begriff} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 11 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{c.begriff}</div>
              <div style={{ fontSize: 12.5, color: 'var(--slate)', marginTop: 3 }}>{c.laie}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ ...cap, marginBottom: 4 }}>Echte Gemeinkosten</div>
            <div style={{ fontSize: 12.5, color: 'var(--slate)' }}>{GK_BEISPIELE.echt.join(' · ')}</div>
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ ...cap, marginBottom: 4 }}>Unechte Gemeinkosten</div>
            <div style={{ fontSize: 12.5, color: 'var(--slate)' }}>{GK_BEISPIELE.unecht.join(' · ')}</div>
          </div>
        </div>
      </div>

      {/* Zuschlagssätze */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {kachel('Material-GK-Zuschlag', k.zuschlag.mgk + ' %', 'auf Materialeinzelkosten')}
        {kachel('Fertigungs-GK-Zuschlag', k.zuschlag.fgk + ' %', 'auf Fertigungseinzelkosten')}
        {kachel('Verwaltungs-GK', k.zuschlag.vwgk + ' %', 'auf Herstellkosten')}
        {kachel('Vertriebs-GK', k.zuschlag.vtgk + ' %', 'auf Herstellkosten')}
      </div>

      {/* Kalkulationsschema */}
      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Differenzierte Zuschlagskalkulation</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <tbody>
            {zeilen.map((z, i) => (
              <tr key={i} style={{ background: z.typ === 'sum' ? 'var(--bg)' : 'transparent' }}>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)', fontWeight: z.typ === 'sum' ? 700 : 500 }}>
                  {z.typ === 'sum' ? '= ' : '+ '}{z.label}
                </td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)', fontSize: 12, color: 'var(--muted)' }}>{z.hinweis || ''}</td>
                <td className="mono" style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)', textAlign: 'right', fontWeight: z.typ === 'sum' ? 700 : 500 }}>{mio(z.wert)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
          Einzelkosten gehen direkt ein; Gemeinkosten werden über die Zuschlagssätze auf die Bezugsbasis verrechnet. Dieses Schema ist die Grundlage der Kostenträger-Stückrechnung (Selbstkosten je Produkt).
        </div>
      </div>
    </div>
  )
}
