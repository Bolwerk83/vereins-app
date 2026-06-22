// =========================================================================
//  TAGESREPORTING — täglicher Blick: heute vs. gestern + Verlauf (14 Tage).
// =========================================================================
import React from 'react'
import { tageskennzahlen, tagesHighlights, HEUTE } from '../../core/tagesreporting.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const fmt = (v, e) => e === 'pct' ? `${v} %` : e === 'stk' ? `${Math.round(v).toLocaleString('de-DE')} Stk` : `${Math.round(v).toLocaleString('de-DE')} €`

function Spark({ reihe, gut }) {
  const min = Math.min(...reihe), max = Math.max(...reihe), spanne = max - min || 1
  const w = 150, h = 34
  const pts = reihe.map((v, i) => `${(i / (reihe.length - 1)) * w},${h - ((v - min) / spanne) * h}`).join(' ')
  const farbe = gut ? 'var(--amp-g)' : 'var(--amp-r)'
  return <svg width={w} height={h} style={{ display: 'block' }}><polyline points={pts} fill="none" stroke={farbe} strokeWidth="1.6" />
    <circle cx={w} cy={h - ((reihe[reihe.length - 1] - min) / spanne) * h} r="2.6" fill={farbe} /></svg>
}

export default function Tagesreporting({ onGeh }) {
  const k = tageskennzahlen()
  const hl = tagesHighlights()

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Tagesreporting <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>· {HEUTE}</span></h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 760 }}>
          Der tägliche Blick: was ist <b>heute</b> passiert, wie steht es gegen <b>gestern</b> — mit dem Verlauf der letzten
          14 Tage. Für den schnellen Start in den Tag.
        </div>
      </div>

      {/* Highlights */}
      {hl.length > 0 && (
        <div style={{ ...card, padding: 12, marginBottom: 14 }}>
          <div style={{ ...cap, marginBottom: 6 }}>Was sticht heute heraus?</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {hl.map((h) => (
              <span key={h.id} style={{ fontSize: 12.5, padding: '3px 10px', borderRadius: 999, border: `1px solid ${h.gut ? 'var(--amp-g)' : 'var(--amp-r)'}`, color: h.gut ? 'var(--amp-g)' : 'var(--amp-r)' }}>
                {h.gut ? '▲' : '▼'} {h.name}: {h.deltaPct >= 0 ? '+' : ''}{h.deltaPct} %
              </span>
            ))}
          </div>
        </div>
      )}

      {/* KPI-Karten */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {k.map((x) => (
          <div key={x.id} style={{ ...card, padding: 14, borderLeft: `3px solid ${x.gut ? 'var(--amp-g)' : 'var(--amp-r)'}` }}>
            <div style={cap}>{x.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10, marginTop: 4 }}>
              <div>
                <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{fmt(x.heute, x.einheit)}</div>
                <div style={{ fontSize: 11.5, color: x.gut ? 'var(--amp-g)' : 'var(--amp-r)', fontWeight: 600 }}>
                  {x.delta >= 0 ? '▲ +' : '▼ '}{fmt(x.delta, x.einheit)} ({x.deltaPct >= 0 ? '+' : ''}{x.deltaPct} %) vs. gestern
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Ø 14 Tg {fmt(x.schnitt, x.einheit)}{x.ueberSchnitt ? ' · über Ø' : ' · unter Ø'}</div>
              </div>
              <Spark reihe={x.reihe} gut={x.gut} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>
        Bewertung in Richtung der Kennzahl (bei Retouren ist weniger besser).
        {onGeh && <> Tiefer einsteigen über <a style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => onGeh('detailberichte')}>Detailberichte</a> oder die <a style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => onGeh('vertriebkpi')}>Vertriebskennzahlen</a>.</>}
      </div>
    </div>
  )
}
