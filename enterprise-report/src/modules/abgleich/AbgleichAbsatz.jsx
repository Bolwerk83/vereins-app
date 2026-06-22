// =========================================================================
//  ABGLEICH Absatzmenge (Rechnungspositionen) ↔ Auftragseingang tatsächlich (AET).
// =========================================================================
import React from 'react'
import { abgleich, gesamt, TOLERANZ_PCT } from '../../core/abgleichAbsatz.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const n0 = (v) => Math.round(v).toLocaleString('de-DE')
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '7px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })

export default function AbgleichAbsatz() {
  const rows = abgleich()
  const g = gesamt()
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Abgleich: Absatzmenge ↔ Auftragseingang tatsächlich</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 820 }}>
          Fakturierter <b>Absatz (aus Rechnungspositionen)</b> gegen den <b>Auftragseingang tatsächlich (AET, WaWi)</b> je
          Produkt. Abweichungen über {TOLERANZ_PCT} % brauchen eine Erklärung (Teillieferung, Storno, Verschiebung, Nachfakturierung).
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <Kpi label="Absatz (Rechnungspos.)" wert={`${n0(g.absatz)} Stk`} />
        <Kpi label="Auftragseingang tatsächl." wert={`${n0(g.aet)} Stk`} />
        <Kpi label="Differenz" wert={`${g.diff > 0 ? '+' : ''}${n0(g.diff)} Stk`} sub={`${g.diffPct > 0 ? '+' : ''}${g.diffPct} %`} farbe={Math.abs(g.diffPct) > TOLERANZ_PCT ? 'var(--amp-a)' : 'var(--amp-g)'} />
        <Kpi label="Auffällige Produkte" wert={`${g.auffaellig}`} farbe={g.auffaellig ? 'var(--amp-r)' : 'var(--amp-g)'} />
      </div>

      <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 760 }}>
          <thead><tr>{['Produkt', 'Absatz (Rechn.pos.)', 'AET (WaWi)', 'Differenz', 'Abw. %', 'Status', 'Wahrscheinliche Ursache'].map((h, i) => <th key={i} style={th(i === 0 || i === 6 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => {
              const farbe = r.imRahmen ? 'var(--amp-g)' : 'var(--amp-r)'
              return (
                <tr key={r.id} style={{ background: r.imRahmen ? undefined : 'var(--amp-r-soft)' }}>
                  <td style={td('left', true)}>{r.name}</td>
                  <td className="mono" style={td('right')}>{n0(r.absatz)}</td>
                  <td className="mono" style={td('right')}>{n0(r.aet)}</td>
                  <td className="mono" style={{ ...td('right'), color: farbe }}>{r.diff > 0 ? '+' : ''}{n0(r.diff)}</td>
                  <td className="mono" style={{ ...td('right', true), color: farbe }}>{r.diffPct > 0 ? '+' : ''}{r.diffPct} %</td>
                  <td style={td('right')}><span style={{ fontSize: 11, fontWeight: 700, color: farbe, border: `1px solid ${farbe}`, borderRadius: 999, padding: '1px 8px' }}>{r.status}</span></td>
                  <td style={{ ...td('left'), color: 'var(--muted)' }}>{r.ursache || '—'}</td>
                </tr>
              )
            })}
            <tr style={{ background: 'var(--bg)' }}>
              <td style={td('left', true)}>Gesamt</td>
              <td className="mono" style={td('right', true)}>{n0(g.absatz)}</td>
              <td className="mono" style={td('right', true)}>{n0(g.aet)}</td>
              <td className="mono" style={td('right', true)}>{g.diff > 0 ? '+' : ''}{n0(g.diff)}</td>
              <td className="mono" style={td('right', true)}>{g.diffPct > 0 ? '+' : ''}{g.diffPct} %</td>
              <td colSpan={2} />
            </tr>
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
          <b>Absatz &lt; AET</b> → noch offener Auftragsbestand / Stornos. <b>Absatz &gt; AET</b> → Nachfakturierung aus Vorperioden.
        </div>
      </div>
    </div>
  )
}

function Kpi({ label, wert, sub, farbe }) {
  return <div style={{ ...card, padding: '10px 13px', flex: 1, minWidth: 150 }}>
    <div style={cap}>{label}</div>
    <div style={{ fontSize: 19, fontWeight: 700, color: farbe || 'var(--ink)' }}>{wert}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>}
  </div>
}
