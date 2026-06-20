// =========================================================================
//  MODUL: Controlling-Instrumente
//  Berichte mit klassischen Werkzeugen: BCG-Portfolio (Cash Cow, Star,
//  Question Mark, Poor Dog), Break-even-Analyse, Deckungsbeitrags-Ranking.
// =========================================================================
import React from 'react'
import { MOCK } from '../../data/mock.js'
import { bcgPortfolio, BCG_KLASSEN, breakEven, WACHSTUM_SCHWELLE, ANTEIL_SCHWELLE } from '../../core/instrumente.js'
import { formatWert } from '../../design/theme.js'
import { Badge } from '../../components/ui.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 16, boxShadow: 'var(--shadow)' }

function BcgMatrix({ daten }) {
  const W = 520, H = 360, ml = 52, mb = 42, mt = 16, mr = 16
  const x0 = ml, x1 = W - mr, y0 = H - mb, y1 = mt
  const domX = [0, 2], domY = [-5, 15]
  const sx = (v) => x0 + ((v - domX[0]) / (domX[1] - domX[0])) * (x1 - x0)
  const sy = (v) => y0 - ((v - domY[0]) / (domY[1] - domY[0])) * (y0 - y1)
  const r = (u) => Math.max(9, Math.min(34, Math.sqrt(u) * 2.4))
  const qx = sx(ANTEIL_SCHWELLE), qy = sy(WACHSTUM_SCHWELLE)
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W }}>
      {/* Quadranten-Hintergründe */}
      <rect x={x0} y={y1} width={qx - x0} height={qy - y1} fill="var(--amp-a-soft)" opacity=".5" />
      <rect x={qx} y={y1} width={x1 - qx} height={qy - y1} fill="var(--amp-g-soft)" opacity=".5" />
      <rect x={x0} y={qy} width={qx - x0} height={y0 - qy} fill="var(--amp-r-soft)" opacity=".4" />
      <rect x={qx} y={qy} width={x1 - qx} height={y0 - qy} fill="var(--accent-soft)" opacity=".6" />
      {/* Quadranten-Labels */}
      <text x={qx - 6} y={y1 + 16} textAnchor="end" fontSize="11" fill="var(--amp-a)" fontWeight="600">Question Mark</text>
      <text x={qx + 6} y={y1 + 16} fontSize="11" fill="var(--amp-g)" fontWeight="600">Star</text>
      <text x={qx - 6} y={y0 - 8} textAnchor="end" fontSize="11" fill="var(--amp-r)" fontWeight="600">Poor Dog</text>
      <text x={qx + 6} y={y0 - 8} fontSize="11" fill="var(--accent)" fontWeight="600">Cash Cow</text>
      {/* Achsen */}
      <line x1={x0} y1={y0} x2={x1} y2={y0} stroke="var(--line)" />
      <line x1={x0} y1={y1} x2={x0} y2={y0} stroke="var(--line)" />
      <line x1={qx} y1={y1} x2={qx} y2={y0} stroke="var(--line)" strokeDasharray="4 3" />
      <line x1={x0} y1={qy} x2={x1} y2={qy} stroke="var(--line)" strokeDasharray="4 3" />
      <text x={(x0 + x1) / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--muted)">relativer Marktanteil →</text>
      <text x={14} y={(y0 + y1) / 2} textAnchor="middle" fontSize="11" fill="var(--muted)" transform={`rotate(-90 14 ${(y0 + y1) / 2})`}>Marktwachstum % →</text>
      {/* Blasen */}
      {daten.map((p) => (
        <g key={p.gruppe}>
          <circle cx={sx(p.marktanteil)} cy={sy(p.wachstum)} r={r(p.umsatz)} fill={BCG_KLASSEN[p.klasse].farbe} opacity=".55" stroke={BCG_KLASSEN[p.klasse].farbe} />
          <text x={sx(p.marktanteil)} y={sy(p.wachstum) + 3} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--ink)">{p.gruppe}</text>
        </g>
      ))}
    </svg>
  )
}

export default function ControllingInstrumente({ werte }) {
  const daten = bcgPortfolio(MOCK.portfolio)
  const be = breakEven(werte)
  const dbRang = [...MOCK.portfolio].sort((a, b) => b.db - a.db)
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 18 }}>
      <div style={card}>
        <h2 style={{ fontSize: 18 }}>Controlling-Instrumente</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Portfolio-, Break-even- und Deckungsbeitragsanalyse auf dem aktuellen Datenbestand.</p>
      </div>

      {/* BCG-Portfolio */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18, alignItems: 'start' }}>
        <div style={card}>
          <h3 style={{ fontSize: 15, marginBottom: 8 }}>BCG-Portfolio (Marktwachstum × Marktanteil)</h3>
          <BcgMatrix daten={daten} />
        </div>
        <div style={card}>
          <h3 style={{ fontSize: 15, marginBottom: 8 }}>Klassifizierung & Strategie</h3>
          {daten.map((p) => (
            <div key={p.gruppe} style={{ borderTop: '1px solid var(--line)', padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b style={{ fontSize: 13.5 }}>{p.gruppe}</b>
                <span style={{ fontSize: 11, fontWeight: 600, color: BCG_KLASSEN[p.klasse].farbe }}>{p.klasse}</span>
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>Umsatz {formatWert(p.umsatz, 'eur_mio')} · Wachstum {p.wachstum}% · Anteil {p.marktanteil}× · DB {p.db}%</div>
              <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>{BCG_KLASSEN[p.klasse].empfehlung}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Break-even + DB-Ranking */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div style={card}>
          <h3 style={{ fontSize: 15, marginBottom: 8 }}>Break-even-Analyse</h3>
          {be ? (
            <div style={{ display: 'grid', gap: 6, fontSize: 13.5 }}>
              <Row k="Fixkosten" v={formatWert(be.fixkosten, 'eur_mio')} />
              <Row k="DB-Quote" v={formatWert(be.dbQuote, 'percent')} />
              <Row k="Break-even-Umsatz" v={formatWert(be.breakEvenUmsatz, 'eur_mio')} stark />
              <Row k="Ist-Nettoumsatz" v={formatWert(be.nettoumsatz, 'eur_mio')} />
              <Row k="Sicherheitsstrecke" v={formatWert(be.sicherheitsstrecke, 'percent')}
                badge={be.sicherheitsstrecke >= 10 ? 'g' : be.sicherheitsstrecke >= 0 ? 'a' : 'r'} />
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                Ab {formatWert(be.breakEvenUmsatz, 'eur_mio')} Umsatz wird die Gewinnschwelle erreicht; darüber liegt die Sicherheitsstrecke.
              </p>
            </div>
          ) : <div style={{ color: 'var(--muted)' }}>Daten unvollständig.</div>}
        </div>
        <div style={card}>
          <h3 style={{ fontSize: 15, marginBottom: 8 }}>Deckungsbeitrags-Ranking</h3>
          {dbRang.map((p, i) => (
            <div key={p.gruppe} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderTop: i ? '1px solid var(--line)' : 'none' }}>
              <span className="mono" style={{ width: 18, color: 'var(--muted)' }}>{i + 1}</span>
              <span style={{ flex: 1, fontSize: 13.5 }}>{p.gruppe}</span>
              <div style={{ width: 140, height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${(p.db / 50) * 100}%`, height: '100%', background: 'var(--accent)' }} />
              </div>
              <span className="mono" style={{ width: 44, textAlign: 'right', fontSize: 12 }}>{p.db}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Row({ k, v, stark, badge }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', padding: '4px 0' }}>
      <span style={{ color: 'var(--muted)' }}>{k}</span>
      <span className="mono" style={{ fontWeight: stark ? 700 : 500 }}>
        {badge ? <Badge status={badge}>{v}</Badge> : v}
      </span>
    </div>
  )
}
