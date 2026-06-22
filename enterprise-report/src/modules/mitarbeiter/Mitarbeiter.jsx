// =========================================================================
//  MITARBEITER-LEBENSZYKLUS (HR) — Phasen, Personalkennzahlen je Bereich,
//  Maßnahme bei hoher Fluktuation.
// =========================================================================
import React, { useState } from 'react'
import { PHASEN, phaseInfo, phaseVerteilung, BEREICHE, kennzahlen, gruppiereNach, DIMENSIONEN } from '../../core/mitarbeiter.js'
import { addMassnahme, ladeMassnahmen } from '../../core/massnahmen.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })

export default function Mitarbeiter() {
  const [, setTick] = useState(0)
  const [dim, setDim] = useState('bereich') // Gruppierungs-Dimension
  const v = phaseVerteilung()
  const k = kennzahlen()
  const max = Math.max(...v.map((p) => p.koepfe), 1)
  const massn = ladeMassnahmen()
  const hat = (id) => massn.some((m) => m.bereichId === id)
  const dimName = DIMENSIONEN.find((d) => d.key === dim)?.name || 'Bereich'
  const zeilen = gruppiereNach(dim)

  function massnahme(b) {
    addMassnahme({ titel: `Fluktuation senken: ${b.dimension} (${b.fluktuation} %)`, owner: 'HR', quelle: 'mitarbeiter', bereichId: dim + ':' + b.dimension, bereich: 'HR', hebel: 'Personal',
      relevanz: `Fluktuation ${b.fluktuation} %, Krankenstand ${b.krankenstand} %, ${b.offen} offene Stellen.` })
    setTick((t) => t + 1)
  }

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Mitarbeiter-Lebenszyklus</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 740 }}>
          Von der Einstellung bis zum Austritt — Recruiting, Onboarding, Entwicklung, Bindung und Fluktuation, plus
          Personalkennzahlen je Bereich.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 140 }}><div style={cap}>Belegschaft (FTE)</div><div style={{ fontSize: 22, fontWeight: 700 }}>{k.fte}</div></div>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 140 }}><div style={cap}>Fluktuation</div><div style={{ fontSize: 22, fontWeight: 700, color: k.fluktuation > 10 ? 'var(--amp-r)' : 'var(--ink)' }}>{k.fluktuation} %</div></div>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 140 }}><div style={cap}>Krankenstand</div><div style={{ fontSize: 22, fontWeight: 700 }}>{k.krankenstand} %</div></div>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 140 }}><div style={cap}>Ø Zugehörigkeit</div><div style={{ fontSize: 22, fontWeight: 700 }}>{k.zugehoerigkeit} J</div></div>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 140 }}><div style={cap}>Offene Stellen</div><div style={{ fontSize: 22, fontWeight: 700 }}>{k.offen}</div></div>
      </div>

      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Lebenszyklus-Phasen (Köpfe)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {v.map((p) => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 120px', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
              <div style={{ background: 'var(--bg)', borderRadius: 6, height: 18, overflow: 'hidden' }}><div style={{ width: `${p.koepfe / max * 100}%`, height: '100%', background: p.farbe }} /></div>
              <span className="mono" style={{ fontSize: 12.5, textAlign: 'right' }}>{p.koepfe} · {p.anteil}%</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 10 }}>
          {PHASEN.map((p) => <span key={p.id} style={{ fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: p.farbe }} /><b>{p.name}</b>: {p.empfehlung}</span>)}
        </div>
      </div>

      <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          <div style={cap}>Personalkennzahlen je {dimName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>Dimension:</span>
            {DIMENSIONEN.map((d) => (
              <button key={d.key} onClick={() => setDim(d.key)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, cursor: 'pointer', fontWeight: 600,
                border: `1px solid ${dim === d.key ? 'var(--accent)' : 'var(--line)'}`, background: dim === d.key ? 'var(--accent-soft)' : 'var(--panel)', color: dim === d.key ? 'var(--accent)' : 'var(--muted)' }}>{d.name}</button>
            ))}
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 660 }}>
          <thead><tr>{[dimName, 'FTE', 'Fluktuation', 'Krankenstand', 'Ø Zugehörigkeit', 'Offen', ''].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
          <tbody>
            {zeilen.map((b) => (
              <tr key={b.dimension}>
                <td style={td('left', true)}>{b.dimension}</td>
                <td className="mono" style={td('right')}>{b.fte}</td>
                <td className="mono" style={{ ...td('right'), color: b.fluktuation > 10 ? 'var(--amp-r)' : b.fluktuation > 7 ? 'var(--amp-a)' : 'var(--ink)' }}>{b.fluktuation} %</td>
                <td className="mono" style={{ ...td('right'), color: b.krankenstand > 5 ? 'var(--amp-a)' : 'var(--ink)' }}>{b.krankenstand} %</td>
                <td className="mono" style={td('right')}>{b.zugehoerigkeit} J</td>
                <td className="mono" style={td('right')}>{b.offen}</td>
                <td style={td('right')}>{b.fluktuation > 10 && (hat(dim + ':' + b.dimension) ? <span style={{ fontSize: 12, color: 'var(--amp-g)' }}>✓ Maßnahme</span>
                  : <button onClick={() => massnahme(b)} style={{ fontSize: 12, cursor: 'pointer', border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--panel)', borderRadius: 999, padding: '3px 10px' }}>→ Maßnahme</button>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Dimension oben umschaltbar (Bereich / Profit-Center / Region). Hohe Fluktuation (rot) treibt Recruiting- und Einarbeitungskosten — Bindung lohnt sich.</div>
      </div>
    </div>
  )
}
