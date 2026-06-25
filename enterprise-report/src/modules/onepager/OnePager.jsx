// =========================================================================
//  ONEPAGER — eine einheitliche Seite je Ebene (1–5). Breadcrumb (hoch),
//  Exec-Kopf + Kommentar (je Knoten), KPI-Kacheln mit Verlauf (E5),
//  Qualitätskennzahlen, Drill in die nächste Ebene. Bindet die
//  Konsolidierungsbausteine zu einer runden Seite zusammen.
// =========================================================================
import React, { useState, useEffect } from 'react'
import { onepager, kernaussage, empfehlung, findeKnoten } from '../../core/onepager.js'
import { BERICHTSBAUM } from '../../core/reportTree.js'
import { ladeHistorie } from '../../core/dataProvider.js'
import { formatWert } from '../../design/theme.js'
import ExecKopf from '../../components/ExecKopf.jsx'
import { AmpelPunkt } from '../../components/ui.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const AMP = { g: 'var(--amp-g)', a: 'var(--amp-a)', r: 'var(--amp-r)', n: 'var(--line)' }
// Statuspunkt zentral über AmpelPunkt — trägt das Symbol (✓/!/✕), einheitlich.
const Punkt = ({ status, s = 13 }) => <AmpelPunkt status={status} size={Math.max(12, s)} />

function Spark({ kpiId, einheit, status }) {
  const [r, setR] = useState(null)
  useEffect(() => { let ok = true; ladeHistorie(kpiId).then((h) => ok && setR((h || []).map((x) => x.wert).filter((v) => v != null))).catch(() => {}); return () => { ok = false } }, [kpiId])
  if (!r || r.length < 2) return null
  const W = 130, H = 30, min = Math.min(...r), max = Math.max(...r), sp = max - min || 1
  const x = (i) => 2 + i / (r.length - 1) * (W - 4), y = (v) => H - 2 - (v - min) / sp * (H - 4)
  const d = r.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  return <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}><path d={d} fill="none" stroke={AMP[status]} strokeWidth="1.8" /><circle cx={x(r.length - 1)} cy={y(r[r.length - 1])} r="2.4" fill={AMP[status]} /></svg>
}

function KpiKachel({ k, verlauf }) {
  return (
    <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 180, borderTop: `3px solid ${AMP[k.status]}` }}>
      <div style={{ ...cap, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}><Punkt status={k.status} /> {k.name}</div>
      <div className="mono" style={{ fontSize: 19, fontWeight: 800 }}>{formatWert(k.wert, k.einheit)}</div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 1 }}>{k.ziel != null ? `Ziel ${formatWert(k.ziel, k.einheit)} · ${k.zielText}` : 'kein Ziel'}</div>
      {verlauf && <Spark kpiId={k.id} einheit={k.einheit} status={k.status} />}
    </div>
  )
}

export default function OnePager({ rolle, werte = {}, onGeh, onKpi, startId }) {
  const [nodeId, setNodeId] = useState(startId || BERICHTSBAUM.id)
  useEffect(() => { if (startId) setNodeId(startId) }, [startId])
  const op = onepager(nodeId, werte, rolle)
  if (!op) return <div style={{ padding: 20 }}>Knoten nicht gefunden.</div>

  const drill = (k) => {
    if (k.hatKinder || (k.kpis && k.kpis.length)) return setNodeId(k.id)
    if (k.detail && onGeh) return onGeh('detailberichte')
    if (onKpi && op.leit) return onKpi(op.leit.id)
    setNodeId(k.id)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 14 }}>
      {/* Breadcrumb + Ebene */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 12.5, color: 'var(--muted)', marginBottom: 4 }}>
          {op.pfad.map((p, i) => (
            <React.Fragment key={p.id}>
              {i > 0 && <span>›</span>}
              <button onClick={() => setNodeId(p.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: p.id === nodeId ? 'var(--ink)' : 'var(--accent)', fontWeight: p.id === nodeId ? 700 : 500, padding: 0, fontSize: 12.5 }}>{p.titel.replace(/^.*?·\s*/, '')}</button>
            </React.Fragment>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
          <div>
            <div style={cap}>{op.ebene.icon} Ebene {op.ebene.stufe} · {op.ebene.name} — OnePager</div>
            <h2 style={{ margin: '4px 0 0' }}>{op.node.titel}</h2>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{op.ebene.frage}</div>
          </div>
          <button className="no-print" onClick={() => window.print()} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>🖨 Drucken / PDF</button>
        </div>
      </div>

      {/* Exec-Kopf (mit Kommentar je Knoten) */}
      <ExecKopf status={op.status} kennzahl={op.leit ? formatWert(op.leit.wert, op.leit.einheit) : undefined} kennzahlLabel={op.leit?.name}
        kernaussage={kernaussage(op)} empfehlung={empfehlung(op)} kommentar={'op:' + op.node.id} />

      {/* KPIs des Knotens */}
      {op.kpis.length > 0 && (
        <div>
          <div style={{ ...cap, marginBottom: 8 }}>Leitkennzahlen dieser Ebene <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none' }}>· mit Verlauf (E5)</span></div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {op.kpis.map((k) => <KpiKachel key={k.id} k={k} verlauf />)}
          </div>
        </div>
      )}

      {/* Qualitätskennzahlen */}
      {op.qualitaet.length > 0 && (
        <div>
          <div style={{ ...cap, marginBottom: 8 }}>Qualitätskennzahlen <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none' }}>· Querschnitt, auf jeder Ebene</span></div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {op.qualitaet.map((k) => (
              <div key={k.id} style={{ ...card, padding: '9px 12px', flex: 1, minWidth: 140, borderLeft: `3px solid ${AMP[k.status]}` }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}><Punkt status={k.status} s={8} /> {k.name}</div>
                <div className="mono" style={{ fontSize: 16, fontWeight: 700 }}>{formatWert(k.wert, k.einheit)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drill in die nächste Ebene */}
      {op.kinder.length > 0 && (
        <div>
          <div style={{ ...cap, marginBottom: 8 }}>Tiefer — Ebene {op.node.ebene + 1}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {op.kinder.map((c) => (
              <button key={c.id} onClick={() => drill(c)} style={{ ...card, padding: '12px 14px', textAlign: 'left', cursor: 'pointer', borderLeft: `4px solid ${AMP[c.status]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13.5 }}>{c.titel.replace(/^.*?·\s*/, '')}</span>
                  <Punkt status={c.status} />
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>{c.detail ? '🔍 Detailbericht' : c.hatKinder ? 'weiter aufklappen →' : 'Knoten öffnen →'}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {op.leit && onKpi && <button onClick={() => onKpi(op.leit.id)} style={{ fontSize: 12.5, padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>🔎 {op.leit.name} im Baum öffnen</button>}
        {op.node.ebene === 1 && onGeh && <button onClick={() => onGeh('management-report')} style={{ fontSize: 12.5, padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', fontWeight: 600, cursor: 'pointer' }}>📊 Management-Report</button>}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', textAlign: 'center' }}>
        Einheitliche OnePager-Vorlage je Ebene — Lage, Leitkennzahlen mit Verlauf, Qualität, Kommentar und Drill bis Ebene 5. Breadcrumb führt zurück nach oben.
      </div>
    </div>
  )
}
