// =========================================================================
//  FORDERUNGS-AGING — Altersstruktur, Mahnstufen, Wertberichtigung, DSO.
// =========================================================================
import React, { useState } from 'react'
import { aging } from '../../core/forderungen.js'
import { addMassnahme, ladeMassnahmen } from '../../core/massnahmen.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const m = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })
const RISIKO_FARBE = { kein: 'var(--muted)', gering: 'var(--amp-g)', mittel: 'var(--amp-a)', hoch: 'var(--amp-r)', kritisch: 'var(--amp-r)' }

export default function Forderungen() {
  const [, setTick] = useState(0)
  const a = aging()
  const massn = ladeMassnahmen()
  const hatInkasso = massn.some((x) => x.quelle === 'forderungen')
  const max = Math.max(...a.rows.map((r) => r.betrag), 0.01)

  function inkasso() {
    addMassnahme({ titel: 'Überfällige Forderungen > 90 Tage: Inkasso & Klärung', owner: 'Finanzen', quelle: 'forderungen', bereich: 'FIN', hebel: 'Working Capital',
      relevanz: `Überfällig ${m(a.ueberfaellig)} Mio € (${a.ueberfaelligkeitsquote} %), erwarteter Ausfall ${m(a.erwarteterAusfall)} Mio €.` })
    setTick((t) => t + 1)
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Forderungs-Aging</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 740 }}>
          Altersstruktur der offenen Forderungen mit Mahnstufen und Wertberichtigung. Je älter, desto höher das
          Ausfallrisiko — und desto wichtiger das konsequente Mahnwesen.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 150 }}><div style={cap}>Forderungen gesamt</div><div style={{ fontSize: 22, fontWeight: 700 }}>{m(a.gesamt)} Mio €</div></div>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 150 }}><div style={cap}>DSO</div><div style={{ fontSize: 22, fontWeight: 700 }}>{a.dso} Tg</div></div>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 150 }}><div style={cap}>Überfällig</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--amp-a)' }}>{a.ueberfaelligkeitsquote} %</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{m(a.ueberfaellig)} Mio €</div></div>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 150 }}><div style={cap}>Erwarteter Ausfall</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--amp-r)' }}>{m(a.erwarteterAusfall)} Mio €</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{a.ausfallquote} %</div></div>
      </div>

      <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 720 }}>
          <thead><tr>{['Altersklasse', 'Betrag', 'Anteil', '', 'WB-Satz', 'Erw. Ausfall', 'Mahnstufe', 'Risiko'].map((h, i) => <th key={i} style={th(i === 0 || i === 6 || i === 7 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
          <tbody>
            {a.rows.map((r) => (
              <tr key={r.id}>
                <td style={td('left', true)}>{r.name}</td>
                <td className="mono" style={td('right')}>{m(r.betrag)}</td>
                <td className="mono" style={td('right')}>{r.anteil} %</td>
                <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', width: 90 }}>
                  <div style={{ height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: `${r.betrag / max * 100}%`, height: '100%', background: RISIKO_FARBE[r.risiko] }} /></div>
                </td>
                <td className="mono" style={{ ...td('right'), color: 'var(--muted)' }}>{r.wbSatz} %</td>
                <td className="mono" style={{ ...td('right', true), color: r.ausfall > 0 ? 'var(--amp-r)' : 'var(--muted)' }}>{m(r.ausfall)}</td>
                <td style={td('left')}>{r.mahnstufe}</td>
                <td style={{ ...td('left'), color: RISIKO_FARBE[r.risiko], fontWeight: 600 }}>{r.risiko}</td>
              </tr>
            ))}
            <tr style={{ background: 'var(--bg)' }}>
              <td style={td('left', true)}>Gesamt</td>
              <td className="mono" style={td('right', true)}>{m(a.gesamt)}</td>
              <td colSpan={3} />
              <td className="mono" style={td('right', true)}>{m(a.erwarteterAusfall)}</td>
              <td colSpan={2} />
            </tr>
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Erwarteter Ausfall = Betrag × Wertberichtigungssatz. Jeder Tag weniger DSO setzt Liquidität frei.</div>
          {hatInkasso ? <span style={{ fontSize: 12, color: 'var(--amp-g)' }}>✓ Inkasso-Maßnahme angelegt</span>
            : <button onClick={inkasso} style={{ fontSize: 12.5, cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '7px 12px', fontWeight: 600 }}>→ Inkasso-Maßnahme (&gt; 90 Tage)</button>}
        </div>
      </div>
    </div>
  )
}
