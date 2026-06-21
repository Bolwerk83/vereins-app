// =========================================================================
//  LEBENSZYKLUS — zwei getrennte Modelle in zwei Reitern:
//   • Produkte: Portfolio-Matrix (Wachstum × DB), Phasen + Normstrategie,
//     Drill-down Produktgruppe → Artikel.
//   • Kunden: Beziehungsphasen + Empfehlung, „gefährdet/verloren" → Maßnahme.
// =========================================================================
import React, { useState } from 'react'
import {
  PRODUKT_PHASEN, produktPhaseInfo, produkte, kinderProdukt, produktPhaseVerteilung,
  KUNDE_PHASEN, kundePhaseInfo, kunden, kundePhaseVerteilung
} from '../../core/lebenszyklus.js'
import { addMassnahme, ladeMassnahmen } from '../../core/massnahmen.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }

function Portfolio({ objekte, info }) {
  const W = 720, H = 340, pad = 44
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
      <line x1={pad} y1={H - pad} x2={W - 10} y2={H - pad} stroke="var(--line)" />
      <line x1={pad} y1={14} x2={pad} y2={H - pad} stroke="var(--line)" />
      <line x1={x0} y1={14} x2={x0} y2={H - pad} stroke="var(--line)" strokeDasharray="4 4" />
      <text x={x0 + 4} y={22} fontSize="10" fill="var(--muted)">Wachstum 0 %</text>
      <text x={W - 12} y={H - pad + 16} fontSize="10" fill="var(--muted)" textAnchor="end">Wachstum % →</text>
      <text x={pad - 6} y={20} fontSize="10" fill="var(--muted)" textAnchor="end">DB %</text>
      {objekte.map((o) => (
        <g key={o.id}>
          <circle cx={px(o.wachstum)} cy={py(o.db)} r={rad(o.umsatz)} fill={info(o.phase).farbe} fillOpacity="0.30" stroke={info(o.phase).farbe} />
          <text x={px(o.wachstum)} y={py(o.db) + 3} fontSize="10" textAnchor="middle" fill="var(--ink)">{o.name}</text>
        </g>
      ))}
    </svg>
  )
}

const chipStyle = (aktiv) => ({ padding: '6px 13px', borderRadius: 999, fontSize: 13, cursor: 'pointer', fontWeight: 600,
  border: `1px solid ${aktiv ? 'var(--accent)' : 'var(--line)'}`, background: aktiv ? 'var(--accent)' : 'var(--panel)', color: aktiv ? '#fff' : 'var(--ink)' })
const badge = (farbe) => ({ fontSize: 11, fontWeight: 700, color: '#fff', background: farbe, padding: '1px 8px', borderRadius: 999 })

function PhasenKacheln({ vert }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
      {vert.map((p) => (
        <div key={p.id} style={{ ...card, padding: '10px 13px', flex: 1, minWidth: 150, borderTop: `3px solid ${p.farbe}` }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{p.umsatz} Mio €</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.anzahl} · {p.anteil} % Umsatz</div>
        </div>
      ))}
    </div>
  )
}

function Produkte() {
  const [ebene, setEbene] = useState('produkt')
  const [auf, setAuf] = useState({})
  const objekte = produkte(ebene)
  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[['produkt', 'Produktgruppe'], ['artikel', 'Artikel']].map(([id, n]) => (
          <button key={id} style={chipStyle(ebene === id)} onClick={() => { setEbene(id); setAuf({}) }}>{n}</button>
        ))}
      </div>
      <PhasenKacheln vert={produktPhaseVerteilung(ebene)} />
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 6 }}>Portfolio — Wachstum × Deckungsbeitrag (Blasengröße = Umsatz)</div>
        <Portfolio objekte={objekte} info={produktPhaseInfo} />
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 8 }}>
          {PRODUKT_PHASEN.map((p) => (
            <span key={p.id} style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.farbe }} /><b>{p.name}</b> → {p.strategie}
            </span>
          ))}
        </div>
      </div>
      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 10 }}>{ebene === 'produkt' ? 'Produktgruppen' : 'Artikel'} ({objekte.length})</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr>{['', 'Name', 'Umsatz', 'DB %', 'Wachstum', 'Margentrend', 'Phase', 'Normstrategie'].map((h, i) => (
            <th key={i} style={{ textAlign: i >= 2 && i <= 5 ? 'right' : 'left', padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {objekte.map((o) => {
              const drill = ebene === 'produkt'; const offen = !!auf[o.id]
              const kids = drill && offen ? kinderProdukt(o.id) : []
              const zeile = (x, sub) => (
                <tr key={x.id} style={sub ? { background: 'var(--bg)' } : { cursor: drill ? 'pointer' : 'default' }} onClick={!sub && drill ? () => setAuf((a) => ({ ...a, [o.id]: !a[o.id] })) : undefined}>
                  <td style={{ padding: '5px 10px', borderBottom: '1px solid var(--line)', color: 'var(--muted)', width: 18 }}>{sub ? '' : drill ? (offen ? '▾' : '▸') : ''}</td>
                  <td style={{ padding: sub ? '5px 10px 5px 24px' : '6px 10px', borderBottom: '1px solid var(--line)', fontWeight: sub ? 400 : 600, fontSize: sub ? 12.5 : 13 }}>{sub ? '↳ ' : ''}{x.name}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '5px 10px', borderBottom: '1px solid var(--line)' }}>{x.umsatz.toFixed(1)}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '5px 10px', borderBottom: '1px solid var(--line)' }}>{x.db}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '5px 10px', borderBottom: '1px solid var(--line)', color: x.wachstum < 0 ? 'var(--amp-r)' : x.wachstum >= 6 ? 'var(--amp-g)' : 'var(--ink)' }}>{x.wachstum > 0 ? '+' : ''}{x.wachstum} %</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '5px 10px', borderBottom: '1px solid var(--line)', color: x.dbTrend < 0 ? 'var(--amp-r)' : 'var(--muted)' }}>{x.dbTrend > 0 ? '+' : ''}{x.dbTrend}</td>
                  <td style={{ padding: '5px 10px', borderBottom: '1px solid var(--line)' }}><span style={badge(produktPhaseInfo(x.phase).farbe)}>{produktPhaseInfo(x.phase).name}</span></td>
                  <td style={{ padding: '5px 10px', borderBottom: '1px solid var(--line)', fontSize: 12, color: 'var(--slate)' }}>{produktPhaseInfo(x.phase).strategie}</td>
                </tr>
              )
              return <React.Fragment key={o.id}>{zeile(o, false)}{kids.map((k) => zeile(k, true))}</React.Fragment>
            })}
          </tbody>
        </table>
        {ebene === 'produkt' && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Zeile anklicken: Artikel der Produktgruppe aufklappen.</div>}
      </div>
    </>
  )
}

function Kunden() {
  const [, setTick] = useState(0)
  const liste = kunden()
  const massn = ladeMassnahmen()
  const hat = (id) => massn.some((m) => m.kundeId === id)
  function massnahme(k) {
    const p = kundePhaseInfo(k.phase)
    addMassnahme({ titel: `${p.name}: ${k.name} — ${p.empfehlung}`, owner: 'Vertrieb', quelle: 'kunde-lebenszyklus', kundeId: k.id, bereich: 'VK', hebel: 'Kundenbindung',
      relevanz: `Kunde in Phase „${p.name}" (Umsatz ${k.umsatz} Mio €, Wachstum ${k.wachstum} %).` })
    setTick((t) => t + 1)
  }
  return (
    <>
      <PhasenKacheln vert={kundePhaseVerteilung()} />
      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Kunden ({liste.length}) — Beziehungsphasen</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr>{['Kunde', 'Umsatz', 'DB %', 'Wachstum', 'Letzte Best.', 'Phase', 'Empfehlung', ''].map((h, i) => (
            <th key={i} style={{ textAlign: i >= 1 && i <= 4 ? 'right' : 'left', padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {liste.map((k) => {
              const p = kundePhaseInfo(k.phase); const risiko = k.phase === 'gefaehrdet' || k.phase === 'verloren'
              return (
                <tr key={k.id}>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{k.name}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>{k.umsatz.toFixed(1)}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>{k.db}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)', color: k.wachstum < 0 ? 'var(--amp-r)' : k.wachstum >= 10 ? 'var(--amp-g)' : 'var(--ink)' }}>{k.wachstum > 0 ? '+' : ''}{k.wachstum} %</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)', color: k.letzteBestellungTage > 180 ? 'var(--amp-r)' : 'var(--muted)' }}>{k.letzteBestellungTage} Tg</td>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)' }}><span style={badge(p.farbe)}>{p.name}</span></td>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 12, color: 'var(--slate)' }}>{p.empfehlung}</td>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>
                    {risiko && (hat(k.id)
                      ? <span style={{ fontSize: 12, color: 'var(--amp-g)' }}>✓ Maßnahme</span>
                      : <button onClick={() => massnahme(k)} style={{ fontSize: 12, cursor: 'pointer', border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--panel)', borderRadius: 999, padding: '3px 10px' }}>→ Maßnahme</button>)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default function Lebenszyklus() {
  const [tab, setTab] = useState('produkt')
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Lebenszyklus &amp; Portfolio</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 760 }}>
          Zwei getrennte Sichten: der <b>Produkt-Lebenszyklus</b> (Einführung→Wachstum→Reife→Rückgang mit Normstrategie)
          und der <b>Kunden-Lebenszyklus</b> (Akquise→Entwicklung→Bestand→gefährdet→verloren). Ein Kunde durchläuft
          bewusst keinen Produkt-Lebenszyklus.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button style={chipStyle(tab === 'produkt')} onClick={() => setTab('produkt')}>Produkte</button>
          <button style={chipStyle(tab === 'kunde')} onClick={() => setTab('kunde')}>Kunden</button>
        </div>
      </div>
      {tab === 'produkt' ? <Produkte /> : <Kunden />}
    </div>
  )
}
