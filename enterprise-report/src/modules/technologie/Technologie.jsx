// =========================================================================
//  TECHNOLOGIE-REIFEGRAD & F&E-PORTFOLIO — Forschungs-/Entwicklungsprojekte
//  über ihren Reifegrad steuern: Budget, Time-to-Market, Erfolg, Pipeline-Wert.
// =========================================================================
import React from 'react'
import { auswertung, REIFEGRADE } from '../../core/technologie.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const m = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '7px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })

export default function Technologie({ onGeh }) {
  const a = auswertung()
  const maxWert = Math.max(...a.rows.map((p) => p.erwarteterWert), 1)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Technologie-Reifegrad &amp; F&amp;E-Portfolio</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 720 }}>
          Forschungs- und Entwicklungsprojekte über ihren Reifegrad (Idee → Markt → Substitution) gesteuert.
          Der erwartete Wert ist das mit der Erfolgswahrscheinlichkeit gewichtete Marktpotenzial.
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <Kpi label="F&E-Budget" wert={`${m(a.budget)} Mio €`} />
        <Kpi label="Davon ausgegeben" wert={`${m(a.ausgegeben)} Mio €`} farbe="var(--muted)" />
        <Kpi label="Restbudget" wert={`${m(a.restbudget)} Mio €`} farbe="var(--accent)" />
        <Kpi label="Pipeline-Wert (gewichtet)" wert={`${m(a.pipelineWert)} Mio €`} farbe="var(--amp-g)" />
        <Kpi label="Nah am Markt" wert={`${a.nahAmMarkt} Projekte`} />
      </div>

      {/* Reifegrad-Verteilung */}
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Verteilung über die Reifegrade</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {a.verteilung.map((r) => (
            <div key={r.id} style={{ flex: 1, minWidth: 90, textAlign: 'center', padding: '8px 6px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--line)', background: r.anzahl ? r.farbe + '14' : 'var(--bg)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.farbe, margin: '0 auto 5px' }} />
              <div style={{ fontSize: 11, color: 'var(--ink)', fontWeight: 600 }}>{r.name}</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{r.anzahl}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>{m(r.budget)} Mio €</div>
            </div>
          ))}
        </div>
      </div>

      {/* Projektliste */}
      <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 760 }}>
          <thead><tr>{['Projekt', 'Reifegrad', 'Budget', 'Rest', 'Time-to-Market', 'Erfolg', 'Erw. Wert', ''].map((h, i) => <th key={i} style={th(i === 0 || i === 1 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
          <tbody>
            {a.rows.map((p) => (
              <tr key={p.id}>
                <td style={td('left', true)}>{p.name}</td>
                <td style={td('left')}><span style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: p.farbe, padding: '2px 8px', borderRadius: 999 }}>{p.reifegradName}</span></td>
                <td className="mono" style={td('right')}>{m(p.budget)}</td>
                <td className="mono" style={td('right')}>{m(p.restbudget)}</td>
                <td className="mono" style={td('right')}>{p.ttm === 0 ? 'am Markt' : `${p.ttm} Mon`}</td>
                <td className="mono" style={{ ...td('right'), color: p.erfolg >= 70 ? 'var(--amp-g)' : p.erfolg >= 50 ? 'var(--amp-a)' : 'var(--amp-r)' }}>{p.erfolg} %</td>
                <td className="mono" style={td('right', true)}>{m(p.erwarteterWert)}</td>
                <td style={{ padding: '7px 9px', borderBottom: '1px solid var(--line)', width: 90 }}>
                  <div style={{ height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${p.erwarteterWert / maxWert * 100}%`, height: '100%', background: p.farbe }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
          Substitutions-Projekte (z. B. Blei-Akku-Linie) gehören auf den Prüfstand: niedriger erwarteter Wert, am Ende des Zyklus.
          {onGeh && <> Verwandt: <a style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => onGeh('lebenszyklus')}>Produkt-Lebenszyklus</a>.</>}
        </div>
      </div>
    </div>
  )
}

function Kpi({ label, wert, farbe }) {
  return <div style={{ ...card, padding: '10px 13px', flex: 1, minWidth: 150 }}>
    <div style={cap}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 700, color: farbe || 'var(--ink)' }}>{wert}</div>
  </div>
}
