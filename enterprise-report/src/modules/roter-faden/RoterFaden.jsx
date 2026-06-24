// =========================================================================
//  ROTER FADEN — geführte Erzählung durch das Reporting über alle 5 Ebenen.
//  Folgt automatisch dem kritischen Pfad (schlechteste Ampel je Ebene),
//  Zweig wählbar. Jede Station: Ebene, Frage, Kernaussage, KPIs, Sprung in
//  den passenden Bericht. Letzte Station: Verlauf (E5) der Leitkennzahl.
// =========================================================================
import React, { useState, useEffect } from 'react'
import { kritischerPfad, fachbereiche, kernaussage, pfadLeitKpi } from '../../core/roterFaden.js'
import { EBENEN } from '../../core/reportTree.js'
import { ladeHistorie } from '../../core/dataProvider.js'
import { formatWert } from '../../design/theme.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const AMP = { g: 'var(--amp-g)', a: 'var(--amp-a)', r: 'var(--amp-r)', n: 'var(--line)' }
const AMP_WORT = { g: 'auf Kurs', a: 'beobachten', r: 'Handlungsbedarf', n: '—' }

function Punkt({ status, size = 11 }) {
  return <span style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', background: AMP[status] || AMP.n }} />
}

function MiniVerlauf({ kpiId, einheit }) {
  const [reihe, setReihe] = useState(null)
  useEffect(() => { let ok = true; ladeHistorie(kpiId).then((h) => { if (ok) setReihe((h || []).map((x) => x.wert).filter((v) => v != null)) }).catch(() => {}); return () => { ok = false } }, [kpiId])
  if (!reihe || reihe.length < 2) return <span style={{ fontSize: 12, color: 'var(--muted)' }}>Verlauf wird geladen …</span>
  const W = 260, H = 50, min = Math.min(...reihe), max = Math.max(...reihe), sp = max - min || 1
  const x = (i) => 3 + i / (reihe.length - 1) * (W - 6)
  const y = (v) => H - 4 - (v - min) / sp * (H - 8)
  const d = reihe.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const steigt = reihe[reihe.length - 1] >= reihe[0]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, height: H }}>
        <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2" />
        <circle cx={x(reihe.length - 1)} cy={y(reihe[reihe.length - 1])} r="3" fill="var(--accent)" />
      </svg>
      <span className="mono" style={{ fontSize: 12.5 }}>{formatWert(reihe[0], einheit)} → <b>{formatWert(reihe[reihe.length - 1], einheit)}</b> <span style={{ color: steigt ? 'var(--amp-g)' : 'var(--amp-r)' }}>{steigt ? '▲' : '▼'}</span></span>
    </div>
  )
}

export default function RoterFaden({ rolle, werte = {}, onGeh, onKpi }) {
  const [zweig, setZweig] = useState(null) // null = automatischer kritischer Pfad
  const fb = fachbereiche(werte, rolle)
  const schritte = kritischerPfad(werte, rolle, zweig)
  const leit = pfadLeitKpi(schritte)

  const springe = (s) => {
    if (s.node.ebene === 1) return onGeh?.('management-report')
    if (s.leitKpi && onKpi) return onKpi(s.leitKpi.id)
    if (onGeh) onGeh('baum')
  }

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gap: 14 }}>
      <div>
        <div style={cap}>Geführte Sicht · Executive → Detail</div>
        <h2 style={{ margin: '4px 0 2px' }}>🧵 Roter Faden</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 760 }}>
          Eine durchgängige Erzählung durch alle fünf Ebenen — automatisch dem <b>kritischen Pfad</b> folgend
          (an jeder Ebene der schwächste Zweig), bis auf Detail- und Verlaufsebene. Jede Station springt in den passenden Bericht.
        </div>
      </div>

      {/* Zweig-Auswahl */}
      <div style={{ ...card, padding: 12 }}>
        <div style={{ ...cap, marginBottom: 8 }}>Zweig ab Ebene 2</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setZweig(null)} style={chip(zweig === null)}>🔴 Kritischer Pfad (auto)</button>
          {fb.map((b) => (
            <button key={b.id} onClick={() => setZweig(b.id)} style={chip(zweig === b.id)} title={kernaussage(b)}>
              <Punkt status={b.status} size={9} /> {b.titel.replace(/^.*?·\s*/, '')}
            </button>
          ))}
        </div>
      </div>

      {/* Faden */}
      <div style={{ position: 'relative', display: 'grid', gap: 0 }}>
        {schritte.map((s, i) => {
          const e = s.ebene || EBENEN[i] || {}
          const letzte = i === schritte.length - 1
          return (
            <div key={s.node.id} style={{ display: 'grid', gridTemplateColumns: '46px 1fr', gap: 12 }}>
              {/* Faden-Spur */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', border: `2px solid ${AMP[s.status]}`, display: 'grid', placeItems: 'center', fontSize: 16, background: 'var(--panel)', zIndex: 1 }}>{e.icon || '•'}</div>
                {!letzte && <div style={{ flex: 1, width: 2, background: 'var(--line)', minHeight: 18 }} />}
              </div>
              {/* Karte */}
              <div style={{ ...card, padding: 14, marginBottom: 14, borderLeft: `4px solid ${AMP[s.status]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ ...cap }}>Ebene {e.stufe} · {e.name}</div>
                    <div style={{ fontWeight: 700, fontSize: 15, margin: '2px 0' }}>{s.node.titel}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{e.frage}</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, background: AMP[s.status], color: '#fff', fontSize: 11.5, fontWeight: 700 }}>● {AMP_WORT[s.status]}</span>
                </div>

                <div style={{ fontSize: 13.5, lineHeight: 1.5, margin: '10px 0' }}>{kernaussage(s)}</div>

                {s.kpis.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {s.kpis.map((k) => (
                      <span key={k.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '4px 9px', borderRadius: 999, border: '1px solid var(--line)', background: 'var(--bg)' }}>
                        <Punkt status={k.status} size={8} /> {k.name} <b className="mono">{formatWert(k.wert, k.einheit)}</b>
                      </span>
                    ))}
                  </div>
                )}

                {letzte && leit && (
                  <div style={{ background: 'var(--bg)', border: '1px dashed var(--line)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginBottom: 10 }}>
                    <div style={{ ...cap, marginBottom: 6 }}>📈 Ebene 5 · Verlauf der Leitkennzahl — {leit.name}</div>
                    <MiniVerlauf kpiId={leit.id} einheit={leit.einheit} />
                  </div>
                )}

                <button onClick={() => springe(s)} style={{ fontSize: 12.5, padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>
                  {s.node.ebene === 1 ? '📊 Management-Report öffnen' : s.leitKpi ? `🔎 ${s.leitKpi.name} im Baum öffnen` : '🌳 Im Berichtsbaum öffnen'} →
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: 11.5, color: 'var(--muted)', textAlign: 'center' }}>
        Der Faden folgt der schwächsten Ampel je Ebene — so liest sich das Reporting von der Lage bis zur Ursache wie eine Geschichte. Zweig oben umschaltbar.
      </div>
    </div>
  )
}

function chip(aktiv) {
  return { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999, fontSize: 12.5, cursor: 'pointer', fontWeight: 600, border: `1px solid ${aktiv ? 'var(--accent)' : 'var(--line)'}`, background: aktiv ? 'var(--accent)' : 'var(--panel)', color: aktiv ? '#fff' : 'var(--ink)' }
}
