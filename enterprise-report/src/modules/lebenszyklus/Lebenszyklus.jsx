// =========================================================================
//  PRODUKT-LEBENSZYKLUS & PORTFOLIO — mehrstufig (Artikel/Produkt/Kunde).
//  Portfolio-Matrix (Wachstum × Deckungsbeitrag, Blasengröße = Umsatz),
//  Phasen-Verteilung und Tabelle mit Drill-down Produkt → Artikel.
// =========================================================================
import React, { useState } from 'react'
import { EBENEN, PHASEN, phaseInfo, daten, kinder, phaseVerteilung } from '../../core/lebenszyklus.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }

// Portfolio-Streudiagramm (SVG): x = Wachstum, y = DB%, Fläche ∝ Umsatz.
function Portfolio({ objekte }) {
  const W = 720, H = 360, pad = 44
  const xs = objekte.map((o) => o.wachstum), ys = objekte.map((o) => o.db)
  const xMin = Math.min(-10, ...xs), xMax = Math.max(40, ...xs)
  const yMin = Math.min(15, ...ys) - 2, yMax = Math.max(50, ...ys) + 2
  const px = (x) => pad + (x - xMin) / (xMax - xMin) * (W - pad - 14)
  const py = (y) => H - pad - (y - yMin) / (yMax - yMin) * (H - pad - 14)
  const rmax = Math.max(...objekte.map((o) => o.umsatz), 1)
  const rad = (u) => 7 + Math.sqrt(u / rmax) * 26
  const x0 = px(0)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {/* Achsen */}
      <line x1={pad} y1={H - pad} x2={W - 10} y2={H - pad} stroke="var(--line)" />
      <line x1={pad} y1={14} x2={pad} y2={H - pad} stroke="var(--line)" />
      {/* Null-Wachstum */}
      <line x1={x0} y1={14} x2={x0} y2={H - pad} stroke="var(--line)" strokeDasharray="4 4" />
      <text x={x0 + 4} y={22} fontSize="10" fill="var(--muted)">Wachstum 0 %</text>
      <text x={W - 12} y={H - pad + 16} fontSize="10" fill="var(--muted)" textAnchor="end">Wachstum % →</text>
      <text x={pad - 6} y={20} fontSize="10" fill="var(--muted)" textAnchor="end">DB %</text>
      {objekte.map((o) => (
        <g key={o.id}>
          <circle cx={px(o.wachstum)} cy={py(o.db)} r={rad(o.umsatz)} fill={phaseInfo(o.phase).farbe} fillOpacity="0.30" stroke={phaseInfo(o.phase).farbe} />
          <text x={px(o.wachstum)} y={py(o.db) + 3} fontSize="10" textAnchor="middle" fill="var(--ink)">{o.name}</text>
        </g>
      ))}
    </svg>
  )
}

export default function Lebenszyklus() {
  const [ebene, setEbene] = useState('produkt')
  const [auf, setAuf] = useState({})   // aufgeklappte Produktgruppen
  const objekte = daten(ebene)
  const vert = phaseVerteilung(ebene)

  const chip = (aktiv) => ({ padding: '6px 13px', borderRadius: 999, fontSize: 13, cursor: 'pointer', fontWeight: 600,
    border: `1px solid ${aktiv ? 'var(--accent)' : 'var(--line)'}`, background: aktiv ? 'var(--accent)' : 'var(--panel)', color: aktiv ? '#fff' : 'var(--ink)' })
  const badge = (phase) => { const p = phaseInfo(phase); return { fontSize: 11, fontWeight: 700, color: '#fff', background: p.farbe, padding: '1px 8px', borderRadius: 999 } }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Produkt-Lebenszyklus &amp; Portfolio</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 740 }}>
          Wo steht jedes Objekt im Lebenszyklus? Auswertbar auf drei Ebenen — <b>Artikel</b>, <b>Produktgruppe</b> und
          <b> Kunde</b>. Die Phase wird aus dem Wachstum abgeleitet; die Blasengröße zeigt den Umsatz.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {EBENEN.map((e) => <button key={e.id} style={chip(ebene === e.id)} onClick={() => { setEbene(e.id); setAuf({}) }}>{e.name}</button>)}
        </div>
      </div>

      {/* Phasen-Verteilung */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {vert.map((p) => (
          <div key={p.id} style={{ ...card, padding: '10px 13px', flex: 1, minWidth: 150, borderTop: `3px solid ${p.farbe}` }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{p.umsatz} Mio €</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.anzahl} Objekte · {p.anteil} % Umsatz</div>
          </div>
        ))}
      </div>

      {/* Portfolio-Matrix */}
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 6 }}>Portfolio — Wachstum × Deckungsbeitrag (Blasengröße = Umsatz)</div>
        <Portfolio objekte={objekte} />
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 8 }}>
          {PHASEN.map((p) => (
            <span key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.farbe }} />{p.name} — <span style={{ color: 'var(--muted)' }}>{p.laie}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Tabelle mit Drill-down */}
      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 10 }}>{EBENEN.find((e) => e.id === ebene).name} ({objekte.length})</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr>
            {['', 'Name', 'Umsatz', 'DB %', 'Wachstum', 'Phase'].map((h, i) => (
              <th key={i} style={{ textAlign: i >= 2 && i <= 4 ? 'right' : 'left', padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {objekte.map((o) => {
              const drillbar = ebene === 'produkt'
              const offen = !!auf[o.id]
              const kids = drillbar && offen ? kinder(o.id) : []
              return (
                <React.Fragment key={o.id}>
                  <tr style={{ cursor: drillbar ? 'pointer' : 'default' }} onClick={() => drillbar && setAuf((a) => ({ ...a, [o.id]: !a[o.id] }))}>
                    <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', color: 'var(--muted)', width: 18 }}>{drillbar ? (offen ? '▾' : '▸') : ''}</td>
                    <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{o.name}</td>
                    <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>{o.umsatz.toFixed(1)}</td>
                    <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>{o.db}</td>
                    <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)', color: o.wachstum < 0 ? 'var(--amp-r)' : o.wachstum >= 6 ? 'var(--amp-g)' : 'var(--ink)' }}>{o.wachstum > 0 ? '+' : ''}{o.wachstum} %</td>
                    <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)' }}><span style={badge(o.phase)}>{phaseInfo(o.phase).name}</span></td>
                  </tr>
                  {kids.map((k) => (
                    <tr key={k.id} style={{ background: 'var(--bg)' }}>
                      <td style={{ borderBottom: '1px solid var(--line)' }} />
                      <td style={{ padding: '5px 10px 5px 24px', borderBottom: '1px solid var(--line)', fontSize: 12.5 }}>↳ {k.name}</td>
                      <td className="mono" style={{ textAlign: 'right', padding: '5px 10px', borderBottom: '1px solid var(--line)', fontSize: 12.5 }}>{k.umsatz.toFixed(1)}</td>
                      <td className="mono" style={{ textAlign: 'right', padding: '5px 10px', borderBottom: '1px solid var(--line)', fontSize: 12.5 }}>{k.db}</td>
                      <td className="mono" style={{ textAlign: 'right', padding: '5px 10px', borderBottom: '1px solid var(--line)', fontSize: 12.5, color: k.wachstum < 0 ? 'var(--amp-r)' : k.wachstum >= 6 ? 'var(--amp-g)' : 'var(--ink)' }}>{k.wachstum > 0 ? '+' : ''}{k.wachstum} %</td>
                      <td style={{ padding: '5px 10px', borderBottom: '1px solid var(--line)' }}><span style={badge(k.phase)}>{phaseInfo(k.phase).name}</span></td>
                    </tr>
                  ))}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
        {ebene === 'produkt' && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Zeile anklicken: Artikel der Produktgruppe aufklappen.</div>}
      </div>
    </div>
  )
}
