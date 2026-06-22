// =========================================================================
//  PROFITCENTER-ERGEBNISRECHNUNG — Ergebnis je Center, ROCE und Beitrag
//  zum Gesamtergebnis.
// =========================================================================
import React, { useState } from 'react'
import { auswertung, auswertungNach, centerTypInfo, CENTER_TYPEN, DIMENSIONEN } from '../../core/profitcenter.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const m = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })

export default function Profitcenter({ onGeh }) {
  const [dim, setDim] = useState('name')
  const a = auswertungNach(dim)
  const maxAbs = Math.max(...a.rows.map((r) => Math.abs(r.ergebnis)), 1)
  const dimName = DIMENSIONEN.find((d) => d.key === dim)?.name || 'Center'
  const zeigeTyp = dim === 'name'

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Profitcenter-Ergebnisrechnung</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 720 }}>
            Ergebnis je Verantwortungsbereich und sein Beitrag zum Gesamtergebnis. Investment Center zusätzlich mit ROCE.
          </div>
        </div>
        {onGeh && <button onClick={() => onGeh('kostenstellen')} style={{ ...card, padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Kostenstellen →</button>}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 160 }}><div style={cap}>Gesamtergebnis</div><div style={{ fontSize: 22, fontWeight: 700, color: a.gesamt >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' }}>{m(a.gesamt)} Mio €</div></div>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 160 }}><div style={cap}>Umsatz gesamt</div><div style={{ fontSize: 22, fontWeight: 700 }}>{m(a.umsatz)} Mio €</div></div>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 160 }}><div style={cap}>Center</div><div style={{ fontSize: 22, fontWeight: 700 }}>{a.rows.length}</div></div>
      </div>

      <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Gruppieren nach:</span>
          {DIMENSIONEN.map((d) => (
            <button key={d.key} onClick={() => setDim(d.key)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, cursor: 'pointer', fontWeight: 600,
              border: `1px solid ${dim === d.key ? 'var(--accent)' : 'var(--line)'}`, background: dim === d.key ? 'var(--accent-soft)' : 'var(--panel)', color: dim === d.key ? 'var(--accent)' : 'var(--muted)' }}>{d.name}</button>
          ))}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 720 }}>
          <thead><tr>{[dimName, ...(zeigeTyp ? ['Typ'] : []), 'Umsatz', 'DB', 'Fixkosten', 'Ergebnis', 'ROCE', 'Beitrag'].map((h, i) => <th key={i} style={th(i <= (zeigeTyp ? 1 : 0) ? 'left' : 'right')}>{h}</th>)}</tr></thead>
          <tbody>
            {a.rows.map((r) => (
              <tr key={r.id}>
                <td style={td('left', true)}>{r.name}</td>
                {zeigeTyp && <td style={td('left')}><span style={{ fontSize: 11, color: r.typ === 'profit' ? 'var(--amp-g)' : r.typ === 'investment' ? 'var(--accent)' : 'var(--muted)' }}>{centerTypInfo(r.typ).name}</span></td>}
                <td className="mono" style={td('right')}>{r.umsatz ? m(r.umsatz) : '–'}</td>
                <td className="mono" style={td('right')}>{r.umsatz ? m(r.db) : '–'}</td>
                <td className="mono" style={{ ...td('right'), color: 'var(--muted)' }}>− {m(r.fixKosten)}</td>
                <td className="mono" style={{ ...td('right', true), color: r.ergebnis >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' }}>{m(r.ergebnis)}</td>
                <td className="mono" style={td('right')}>{r.roce != null ? r.roce + ' %' : '–'}</td>
                <td style={td('right')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                    <div style={{ width: 60, height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.abs(r.ergebnis) / maxAbs * 100}%`, height: '100%', background: r.ergebnis >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' }} />
                    </div>
                    <span className="mono" style={{ fontSize: 12 }}>{r.beitrag} %</span>
                  </div>
                </td>
              </tr>
            ))}
            <tr style={{ background: 'var(--bg)' }}>
              <td style={td('left', true)}>Gesamt</td>{zeigeTyp && <td />}
              <td className="mono" style={td('right', true)}>{m(a.umsatz)}</td><td /><td />
              <td className="mono" style={{ ...td('right', true), color: a.gesamt >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' }}>{m(a.gesamt)}</td><td /><td />
            </tr>
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
          Ergebnis = Umsatz − variable Kosten − zurechenbare Fixkosten. Cost Center (Zentrale) liefert keinen Umsatz und mindert das Ergebnis. ROCE = Ergebnis ÷ gebundenes Kapital (nur Investment Center).
        </div>
      </div>
    </div>
  )
}
