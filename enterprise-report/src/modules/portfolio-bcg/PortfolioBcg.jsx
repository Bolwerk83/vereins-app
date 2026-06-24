// =========================================================================
//  PORTFOLIO-MATRIX (BCG) — mehrere Boston-Consulting-Portfolios über
//  Produkte, Kunden, Kanäle, Regionen und Lieferanten. Je Portfolio: Mehrwert-
//  Erklärung, Quadranten-Lesart, Blasenmatrix und Tabelle. Quadrant anklicken
//  grenzt Matrix + Tabelle auf das Feld ein.
// =========================================================================
import React, { useState } from 'react'
import { portfolioListe, portfolio } from '../../core/bcgPortfolios.js'
import { quadrantVon } from '../../core/lebenszyklus.js'
import ExecKopf, { ampelVon } from '../../components/ExecKopf.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const chip = (aktiv) => ({ padding: '6px 13px', borderRadius: 999, fontSize: 13, cursor: 'pointer', fontWeight: 600,
  border: `1px solid ${aktiv ? 'var(--accent)' : 'var(--line)'}`, background: aktiv ? 'var(--accent)' : 'var(--panel)', color: aktiv ? '#fff' : 'var(--ink)' })

function Matrix({ objekte, felder, schwellen, xLabel, yLabel, quadrant, onQuadrant }) {
  const W = 720, H = 360, pad = 46
  const xs = objekte.map((o) => o.wachstum), ys = objekte.map((o) => o.db)
  const xMin = Math.min(-12, ...xs) - 2, xMax = Math.max(12, ...xs) + 4
  const yMin = Math.min(...ys) - 4, yMax = Math.max(...ys) + 4
  const px = (x) => pad + (x - xMin) / (xMax - xMin) * (W - pad - 16)
  const py = (y) => H - pad - (y - yMin) / (yMax - yMin) * (H - pad - 16)
  const rmax = Math.max(...objekte.map((o) => o.umsatz), 1)
  const rad = (u) => 8 + Math.sqrt(u / rmax) * 26
  const x0 = px(schwellen.wachstum), y0 = py(schwellen.db)
  const li = pad, re = W - 16, ob = 16, un = H - pad
  const rect = { star: [x0, ob, re, y0], cashcow: [li, ob, x0, y0], question: [x0, y0, re, un], dog: [li, y0, x0, un] }
  const von = (id) => felder.find((f) => f.id === id) || {}
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {Object.entries(rect).map(([id, [a, b, c, d]]) => {
        const f = von(id), aktiv = quadrant === id
        return (
          <g key={id} onClick={() => onQuadrant(aktiv ? null : id)} style={{ cursor: 'pointer' }}>
            <title>{`${f.name} — ${f.anzahl} Objekte (klick: filtern)`}</title>
            <rect x={a} y={b} width={c - a} height={d - b} fill={f.farbe} fillOpacity={aktiv ? 0.16 : 0.05} />
            {aktiv && <rect x={a} y={b} width={c - a} height={d - b} fill="none" stroke={f.farbe} strokeWidth="2" />}
            <text x={id === 'cashcow' || id === 'dog' ? a + 7 : c - 7} y={id === 'star' || id === 'cashcow' ? b + 16 : d - 9}
              textAnchor={id === 'cashcow' || id === 'dog' ? 'start' : 'end'} fontSize="11.5" fontWeight="700" fill={f.farbe} fillOpacity={aktiv ? 1 : 0.7} style={{ pointerEvents: 'none' }}>
              {f.name} ({f.anzahl})
            </text>
          </g>
        )
      })}
      <line x1={pad} y1={H - pad} x2={W - 12} y2={H - pad} stroke="var(--line)" />
      <line x1={pad} y1={16} x2={pad} y2={H - pad} stroke="var(--line)" />
      <line x1={x0} y1={16} x2={x0} y2={H - pad} stroke="var(--line)" strokeDasharray="4 4" />
      <line x1={pad} y1={y0} x2={W - 12} y2={y0} stroke="var(--line)" strokeDasharray="4 4" />
      <text x={W - 14} y={H - pad + 16} fontSize="10" fill="var(--muted)" textAnchor="end">{xLabel} →</text>
      <text x={pad - 6} y={22} fontSize="10" fill="var(--muted)" textAnchor="end">{yLabel}</text>
      {objekte.map((o) => {
        const imQuad = !quadrant || quadrantVon(o, schwellen) === quadrant
        return (
          <g key={o.id} style={{ opacity: imQuad ? 1 : 0.16 }}>
            <title>{`${o.name} · ${o.umsatz}`}</title>
            <circle cx={px(o.wachstum)} cy={py(o.db)} r={rad(o.umsatz)} fill={von(o.quadrant).farbe} fillOpacity="0.3" stroke={von(o.quadrant).farbe} />
            <text x={px(o.wachstum)} y={py(o.db) + 3} fontSize="9.5" textAnchor="middle" fill="var(--ink)" style={{ pointerEvents: 'none' }}>{o.name.length > 16 ? o.name.slice(0, 15) + '…' : o.name}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default function PortfolioBcg() {
  const [id, setId] = useState('produkte')
  const [quadrant, setQuadrant] = useState(null)
  const p = portfolio(id)
  const gez = quadrant ? p.objekte.filter((o) => o.quadrant === quadrant) : p.objekte
  const qName = quadrant ? p.felder.find((f) => f.id === quadrant)?.name : null
  const jeStrich = (einheit) => (p.id === 'lieferanten' && einheit === 'y' ? '' : ' %')

  // Exec-Kopf: Lage aus dem Anteil "gesunder" Felder (Stars + Cash Cows) am
  // Volumen; Empfehlung aus dem volumenstärksten Cluster.
  const felder = p.felder || []
  const feld = (fid) => felder.find((f) => f.id === fid) || { anzahl: 0, anteil: 0, umsatz: 0 }
  const stars = feld('star'), cashcow = feld('cashcow'), question = feld('question'), dog = feld('dog')
  const gesundAnteil = +((stars.anteil || 0) + (cashcow.anteil || 0)).toFixed(1)
  const groesstes = [...felder].sort((a, b) => (b.umsatz || 0) - (a.umsatz || 0))[0]
  const execStatus = ampelVon(gesundAnteil, { gut: 70, schlecht: 50 })
  const execAussage = `${stars.anzahl} Stars · ${cashcow.anzahl} Cash Cows · ${question.anzahl} Question Marks · ${dog.anzahl} Poor Dogs — Stars + Cash Cows tragen ${gesundAnteil} % des Volumens.`
  const execEmpf = groesstes
    ? `Größtes Cluster „${groesstes.name}" (${groesstes.anzahl} Objekte, ${groesstes.anteil} % Volumen): ${p.quadrant?.[groesstes.id] || 'gezielt steuern.'}`
    : 'Verteilung über die Quadranten-Karten prüfen.'

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: '0 0 4px' }}>Portfolio-Matrix (BCG)</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 820 }}>
          Boston-Consulting-Portfolios über mehrere Sichten. Zwei Achsen — <b>Dynamik</b> (waagerecht) und
          <b> Attraktivität</b> (senkrecht) — teilen die Objekte in vier Felder: <b>Stars</b>, <b>Cash Cows</b>,
          <b> Question Marks</b> und <b>Poor Dogs</b>. Blasengröße = Volumen. So wird aus „viel Umsatz" eine
          klare Investitions-/Steuerungsentscheidung je Objekt.
        </div>
      </div>

      {/* Portfolio-Auswahl */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {portfolioListe().map((x) => (
          <button key={x.id} style={chip(id === x.id)} onClick={() => { setId(x.id); setQuadrant(null) }}>{x.kurz}</button>
        ))}
      </div>

      <ExecKopf status={execStatus} kennzahl={`${gesundAnteil} %`} kennzahlLabel="Stars + Cash Cows (Volumen)" kernaussage={execAussage} empfehlung={execEmpf} />

      {/* Mehrwert-Erklärung */}
      <div style={{ ...card, padding: 16, marginBottom: 14, borderLeft: '3px solid var(--accent)' }}>
        <div style={{ ...cap, marginBottom: 6 }}>{p.titel} — Mehrwert</div>
        <div style={{ fontSize: 14, lineHeight: 1.55 }}>{p.mehrwert}</div>
        <div style={{ ...cap, margin: '12px 0 4px' }}>Typische Fragen</div>
        <ul style={{ margin: '2px 0 0', paddingLeft: 18, fontSize: 13.5, lineHeight: 1.6 }}>{p.fragen.map((f, i) => <li key={i}>{f}</li>)}</ul>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>Achsen: {p.xLabel} (x) × {p.yLabel} (y), Blasengröße = {p.blase}. Schwellen: {p.xLabel} {p.schwellen.wachstum}{jeStrich('x')}, {p.yLabel} {p.schwellen.db}{jeStrich('y')} (Median).</div>
      </div>

      {/* Quadranten-Karten mit fachlicher Lesart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 14 }}>
        {p.felder.map((f) => {
          const aktiv = quadrant === f.id
          return (
            <div key={f.id} onClick={() => setQuadrant(aktiv ? null : f.id)} title="Klick: Matrix & Tabelle filtern"
              style={{ ...card, padding: '11px 13px', cursor: 'pointer', borderTop: `3px solid ${f.farbe}`,
                outline: aktiv ? `2px solid ${f.farbe}` : 'none', background: aktiv ? 'var(--bg)' : 'var(--panel)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 13.5, color: f.farbe }}>{f.name}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{f.anzahl} · {f.anteil}%</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{f.umsatz}</div>
              <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 5, lineHeight: 1.4 }}>{p.quadrant[f.id]}</div>
            </div>
          )
        })}
      </div>

      {/* Matrix */}
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          <div style={cap}>{p.titel} — {p.xLabel} × {p.yLabel} (Blase = {p.blase})</div>
          {quadrant && <button onClick={() => setQuadrant(null)} style={{ fontSize: 12, cursor: 'pointer', border: '1px solid var(--line)', background: 'var(--panel)', borderRadius: 999, padding: '2px 10px', color: 'var(--muted)' }}>Filter „{qName}" ✕</button>}
        </div>
        <Matrix objekte={p.objekte} felder={p.felder} schwellen={p.schwellen} xLabel={p.xLabel} yLabel={p.yLabel} quadrant={quadrant} onQuadrant={setQuadrant} />
        <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 6 }}>↳ Quadrant (im Chart oder als Karte) anklicken: Matrix &amp; Tabelle auf das Feld eingrenzen.</div>
      </div>

      {/* Tabelle */}
      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 10 }}>{p.titel} ({gez.length}){qName ? ` · Feld „${qName}"` : ''}</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr>{['', 'Name', p.blase, p.xLabel, p.yLabel, 'Feld'].map((h, i) => (
            <th key={i} style={{ textAlign: i >= 2 && i <= 4 ? 'right' : 'left', padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {[...gez].sort((a, b) => b.umsatz - a.umsatz).map((o) => {
              const f = p.felder.find((x) => x.id === o.quadrant) || {}
              return (
                <tr key={o.id}>
                  <td style={{ padding: '5px 10px', borderBottom: '1px solid var(--line)', width: 14 }}><span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: f.farbe }} /></td>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{o.name}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>{o.umsatz.toFixed(1)}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)', color: o.wachstum < 0 ? 'var(--amp-r)' : o.wachstum >= 10 ? 'var(--amp-g)' : 'var(--ink)' }}>{o.wachstum > 0 ? '+' : ''}{o.wachstum}{jeStrich('x')}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>{o.db}{jeStrich('y')}</td>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)' }}><span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: f.farbe, padding: '1px 8px', borderRadius: 999 }}>{f.name}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
