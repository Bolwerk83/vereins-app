// =========================================================================
//  ABGRENZUNGSRECHNUNG (Betriebsüberleitungsbogen) — vollständiger Übergang
//  GuV → KLR: neutrale Posten abgrenzen, kalkulatorische Kosten verrechnen,
//  Betriebsergebnis ableiten. Macht die Kalkulatorik „echt verbucht".
// =========================================================================
import React from 'react'
import { abgrenzung, GRUND_LABEL } from '../../core/abgrenzung.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const m = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const th = (al) => ({ textAlign: al, padding: '6px 10px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '6px 10px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })

export default function Abgrenzungsrechnung({ onGeh }) {
  const a = abgrenzung('ist')

  const Kpi = ({ label, wert, farbe, sub }) => (
    <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 170 }}>
      <div style={cap}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: farbe || 'var(--ink)' }}>{m(wert)} <span style={{ fontSize: 12, fontWeight: 400 }}>Mio €</span></div>
      {sub && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>}
    </div>
  )

  const grundTag = (g) => <span style={{ fontSize: 10, color: 'var(--amp-a)', border: '1px solid var(--amp-a)', borderRadius: 999, padding: '0 6px', marginLeft: 6 }}>{GRUND_LABEL[g] || g}</span>

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Abgrenzungsrechnung (Betriebsüberleitungsbogen)</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 740 }}>
          Vom Unternehmensergebnis der GuV zum Betriebsergebnis der KLR: neutrale Posten werden abgegrenzt und die
          kalkulatorischen Kosten echt verrechnet. So fließt die Kalkulatorik in Kostenarten und Betriebsergebnis ein.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <Kpi label="Unternehmensergebnis (GuV)" wert={a.unternehmensergebnis} />
        <Kpi label="− Neutrales Ergebnis" wert={a.neutralesErgebnis} farbe="var(--muted)" sub="betriebsfremd / periodenfremd / ao" />
        <Kpi label="= Betriebsergebnis (KLR)" wert={a.betriebsergebnis} farbe={a.betriebsergebnis >= 0 ? 'var(--amp-g)' : 'var(--amp-r)'} sub="nach kalk. Verrechnung" />
      </div>

      {/* Aufwand → Kosten */}
      <div style={{ ...card, padding: 16, marginBottom: 14, overflowX: 'auto' }}>
        <div style={{ ...cap, marginBottom: 8 }}>Aufwendungen → Kosten</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 640 }}>
          <thead><tr>{['Position', 'GuV-Aufwand', 'neutral', 'Zweckaufwand'].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
          <tbody>
            {a.aufwendungen.map((p) => (
              <tr key={p.id}>
                <td style={td('left')}>{p.name}{p.details.map((d, i) => <React.Fragment key={i}>{grundTag(d.grund)}</React.Fragment>)}</td>
                <td className="mono" style={td('right')}>{m(p.guv)}</td>
                <td className="mono" style={{ ...td('right'), color: p.neutral ? 'var(--amp-a)' : 'var(--muted)' }}>{p.neutral ? m(p.neutral) : '–'}</td>
                <td className="mono" style={td('right', true)}>{m(p.zweck)}</td>
              </tr>
            ))}
            <tr style={{ background: 'var(--bg)' }}>
              <td style={td('left', true)}>Summen</td>
              <td className="mono" style={td('right', true)}>{m(a.summeGuvAufwand)}</td>
              <td className="mono" style={td('right', true)}>{m(a.summeNeutralAufwand)}</td>
              <td className="mono" style={td('right', true)}>{m(a.summeZweckaufwand)}</td>
            </tr>
            <tr><td style={td('left')}>− bilanzielle Pendants (durch kalk. ersetzt)</td><td colSpan={2} /><td className="mono" style={{ ...td('right'), color: 'var(--accent)' }}>− {m(a.summePendants)}</td></tr>
            <tr><td style={td('left', true)}>= Grundkosten</td><td colSpan={2} /><td className="mono" style={td('right', true)}>{m(a.grundkosten)}</td></tr>
            {a.kalk.map((z) => (
              <tr key={z.id}><td style={td('left')}>+ {z.name} <span style={{ fontSize: 10, color: 'var(--muted)' }}>({z.typ === 'anders' ? 'Anderskosten' : 'Zusatzkosten'})</span></td>
                <td colSpan={2} /><td className="mono" style={{ ...td('right'), color: 'var(--accent)' }}>+ {m(z.kalkWert)}</td></tr>
            ))}
            <tr style={{ background: 'var(--accent-soft)' }}><td style={td('left', true)}>= Kosten der KLR</td><td colSpan={2} /><td className="mono" style={td('right', true)}>{m(a.kosten)}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Ertrag → Leistung */}
      <div style={{ ...card, padding: 16, marginBottom: 14, overflowX: 'auto' }}>
        <div style={{ ...cap, marginBottom: 8 }}>Erträge → Leistungen</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 640 }}>
          <thead><tr>{['Position', 'GuV-Ertrag', 'neutral', 'Zweckertrag (Leistung)'].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
          <tbody>
            {a.ertraege.map((p) => (
              <tr key={p.id}>
                <td style={td('left')}>{p.name}{p.details.map((d, i) => <React.Fragment key={i}>{grundTag(d.grund)}</React.Fragment>)}</td>
                <td className="mono" style={td('right')}>{m(p.guv)}</td>
                <td className="mono" style={{ ...td('right'), color: p.neutral ? 'var(--amp-a)' : 'var(--muted)' }}>{p.neutral ? m(p.neutral) : '–'}</td>
                <td className="mono" style={td('right', true)}>{m(p.zweck)}</td>
              </tr>
            ))}
            <tr style={{ background: 'var(--accent-soft)' }}>
              <td style={td('left', true)}>= Leistungen der KLR</td>
              <td className="mono" style={td('right', true)}>{m(a.summeGuvErtrag)}</td>
              <td className="mono" style={td('right', true)}>{m(a.summeNeutralErtrag)}</td>
              <td className="mono" style={td('right', true)}>{m(a.leistungen)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Überleitung / Identitäten */}
      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 8 }}>Überleitung & Probe</div>
        <Zeile label="Unternehmensergebnis (GuV)" wert={a.unternehmensergebnis} bold />
        <Zeile label="− Neutrales Ergebnis (Ertrag − Aufwand der neutralen Posten)" wert={a.neutralesErgebnis} muted />
        <Zeile label="= Zweckergebnis (rein betrieblich)" wert={a.zweckergebnis} bold />
        <Zeile label="+ Verrechnungsdifferenz (bilanzielle Pendants − kalk. Kosten)" wert={a.verrechnungsdifferenz} muted />
        <Zeile label="= Betriebsergebnis (KLR)" wert={a.betriebsergebnis} bold farbe={a.betriebsergebnis >= 0 ? 'var(--amp-g)' : 'var(--amp-r)'} />
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
          Probe: Betriebsergebnis = Leistungen {m(a.leistungen)} − Kosten {m(a.kosten)} = {m(a.betriebsergebnis)} Mio €.
          {onGeh && <> Die kalk. Werte stammen aus der <a style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => onGeh('kalkulatorik')}>Kalkulatorik</a>.</>}
        </div>
      </div>
    </div>
  )
}

function Zeile({ label, wert, bold, muted, farbe }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)',
      fontWeight: bold ? 700 : 400, color: farbe || (muted ? 'var(--muted)' : 'var(--ink)') }}>
      <span>{label}</span><span className="mono">{wert.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Mio €</span>
    </div>
  )
}
