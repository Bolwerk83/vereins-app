// =========================================================================
//  KOSTENSTELLENRECHNUNG (BAB) — Umlage Vor→Endstellen, Zuschlagssätze,
//  Plan/Ist-Wirtschaftlichkeitskontrolle, Center-Typen.
// =========================================================================
import React from 'react'
import { CENTER_TYPEN, centerTypInfo, VORSTELLEN, ENDSTELLEN, bab, wirtschaftlichkeit } from '../../core/kostenstellen.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const m = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export default function Kostenstellenrechnung({ onGeh }) {
  const b = bab()
  const w = wirtschaftlichkeit()

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Kostenstellenrechnung (BAB)</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 740 }}>
            „Wo entstehen die Kosten?" Gemeinkosten werden auf Stellen verteilt, Vorkostenstellen auf Endkostenstellen
            umgelegt — daraus ergeben sich die <b>Zuschlagssätze</b>. Plus Plan/Ist-Kontrolle je Stelle.
          </div>
        </div>
        {onGeh && <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onGeh('bab')} style={{ ...card, padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>Voller BAB →</button>
          <button onClick={() => onGeh('klr')} style={{ ...card, padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← zur KLR</button>
        </div>}
      </div>

      {/* Center-Typen */}
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 8 }}>Verantwortungsbereiche (Center-Typen)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          {CENTER_TYPEN.map((c) => (
            <div key={c.id} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 11 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{c.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--slate)', marginTop: 3 }}>{c.laie}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Vorkostenstellen-Umlage */}
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 8 }}>Vorkostenstellen → Umlage</div>
        {VORSTELLEN.map((v) => (
          <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontWeight: 600, fontSize: 13.5 }}>{v.name}</span>
            <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{m(v.primaerIst)} Mio € · verteilt {v.schluesselText} → {Object.entries(v.schluessel).map(([k, q]) => `${k} ${Math.round(q * 100)} %`).join(', ')}</span>
          </div>
        ))}
      </div>

      {/* BAB */}
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Betriebsabrechnungsbogen — Endkostenstellen (Mio €)</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr>{['Endkostenstelle', 'Center', 'Primär', '+ Umlage', '= Gesamt-GK', 'Bezugsbasis', 'Zuschlag'].map((h, i) => (
              <th key={i} style={{ textAlign: i >= 2 && i <= 4 ? 'right' : 'left', padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {b.rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{r.name}</td>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)' }}><span style={{ fontSize: 11, color: r.centerTyp === 'profit' ? 'var(--amp-g)' : 'var(--muted)' }}>{centerTypInfo(r.centerTyp).name}</span></td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>{m(r.primaer)}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)', color: 'var(--muted)' }}>{m(r.umlage)}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)', fontWeight: 700 }}>{m(r.gesamt)}</td>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 12, color: 'var(--slate)' }}>{r.bezugLabel} ({m(r.bezugWert)})</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)', fontWeight: 700, color: 'var(--accent)' }}>{r.zuschlag} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
          Summe Gemeinkosten {m(b.gemeinSumme)} Mio € · Herstellkosten-Bezug {m(b.hk)} Mio €. Die Zuschlagssätze fließen in die Kostenträger-Kalkulation.
        </div>
      </div>

      {/* Wirtschaftlichkeitskontrolle */}
      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Wirtschaftlichkeitskontrolle — Plan/Ist je Stelle</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr>{['Kostenstelle', 'Plan', 'Ist', 'Abw.', 'Abw. %'].map((h, i) => (
            <th key={i} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {w.map((s) => (
              <tr key={s.id}>
                <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{s.name}</td>
                <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)', color: 'var(--muted)' }}>{m(s.plan)}</td>
                <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>{m(s.ist)}</td>
                <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)', color: s.abw > 0 ? 'var(--amp-r)' : 'var(--amp-g)' }}>{s.abw > 0 ? '+' : ''}{m(s.abw)}</td>
                <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)', color: s.abw > 0 ? 'var(--amp-r)' : 'var(--amp-g)' }}>{s.abwPct > 0 ? '+' : ''}{s.abwPct} %</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Mehrkosten gegenüber Plan (rot) zeigen, wo die Wirtschaftlichkeit nachlässt — die Kernaufgabe der Kostenstellenrechnung.</div>
      </div>
    </div>
  )
}
