// =========================================================================
//  SEGMENT-/KONZERNBERICHT — Ergebnis je Gesellschaft + Konsolidierung.
// =========================================================================
import React from 'react'
import { segmentbericht } from '../../core/segment.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const m = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const th = (al) => ({ textAlign: al, padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '7px 10px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })

export default function Segmentbericht() {
  const s = segmentbericht()
  const maxU = Math.max(...s.rows.map((r) => r.umsatz), 1)

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Segment- &amp; Konzernbericht</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 720 }}>
          Ergebnis je Gesellschaft/Segment und der konsolidierte Konzern — nach Eliminierung der konzerninternen
          (Intercompany-)Umsätze.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 160 }}><div style={cap}>Konzernumsatz (konsol.)</div><div style={{ fontSize: 22, fontWeight: 700 }}>{m(s.konzernUmsatz)} Mio €</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>brutto {m(s.summeUmsatz)} − IC {m(s.summeIc)}</div></div>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 160 }}><div style={cap}>Konzern-EBIT</div><div style={{ fontSize: 22, fontWeight: 700 }}>{m(s.konzernEbit)} Mio €</div></div>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 160 }}><div style={cap}>Konzern-EBIT-Marge</div><div style={{ fontSize: 22, fontWeight: 700, color: s.konzernMarge >= 4 ? 'var(--amp-g)' : 'var(--amp-a)' }}>{s.konzernMarge} %</div></div>
      </div>

      <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 640 }}>
          <thead><tr>{['Gesellschaft', 'Umsatz', '', 'EBIT', 'EBIT-Marge', 'davon IC'].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
          <tbody>
            {s.rows.map((r) => (
              <tr key={r.id}>
                <td style={td('left', true)}>{r.name}</td>
                <td className="mono" style={td('right')}>{m(r.umsatz)}</td>
                <td style={{ padding: '7px 10px', borderBottom: '1px solid var(--line)', width: 90 }}><div style={{ height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: `${r.umsatz / maxU * 100}%`, height: '100%', background: 'var(--accent)' }} /></div></td>
                <td className="mono" style={td('right', true)}>{m(r.ebit)}</td>
                <td className="mono" style={{ ...td('right'), color: r.marge >= 4 ? 'var(--amp-g)' : 'var(--amp-a)' }}>{r.marge} %</td>
                <td className="mono" style={{ ...td('right'), color: 'var(--muted)' }}>{m(r.ic)}</td>
              </tr>
            ))}
            <tr style={{ background: 'var(--bg)' }}>
              <td style={td('left', true)}>Summe Gesellschaften</td>
              <td className="mono" style={td('right', true)}>{m(s.summeUmsatz)}</td><td />
              <td className="mono" style={td('right', true)}>{m(s.konzernEbit)}</td><td />
              <td className="mono" style={td('right', true)}>{m(s.summeIc)}</td>
            </tr>
            <tr>
              <td style={{ ...td('left'), color: 'var(--accent)' }}>− Intercompany-Eliminierung</td>
              <td className="mono" style={{ ...td('right'), color: 'var(--accent)' }}>− {m(s.summeIc)}</td><td colSpan={4} />
            </tr>
            <tr style={{ background: 'var(--accent-soft)' }}>
              <td style={td('left', true)}>= Konzern (konsolidiert)</td>
              <td className="mono" style={td('right', true)}>{m(s.konzernUmsatz)}</td><td />
              <td className="mono" style={td('right', true)}>{m(s.konzernEbit)}</td>
              <td className="mono" style={td('right', true)}>{s.konzernMarge} %</td><td />
            </tr>
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
          Intercompany-Umsätze (Lieferungen zwischen den Gesellschaften) werden für die Konzernsicht eliminiert — sonst würde der Umsatz doppelt gezählt.
        </div>
      </div>
    </div>
  )
}
