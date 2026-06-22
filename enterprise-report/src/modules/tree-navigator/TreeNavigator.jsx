// =========================================================================
//  MODUL: Berichtsbaum-Navigator
//  Linke Baum-Navigation über die 5 Ebenen + rechte Knotenansicht.
//  Reagiert auf die Rolle (Bereichsfilter) und die Periode.
// =========================================================================
import React, { useState, useMemo, useEffect } from 'react'
import { BERICHTSBAUM, EBENEN, baumFuerRolle, findeKnoten, pfadZu } from '../../core/reportTree.js'
import { gruppiereNachCluster } from '../../core/bereiche.js'
import { KPI } from '../../core/kpiRegistry.js'
import { darfBereich, darfKpi } from '../../core/rbac.js'
import { ladeDetail, ladeHistorie } from '../../core/dataProvider.js'
import { downloadCsv, druckePdf, knotenAlsCsv } from '../../core/export.js'
import { detailFuerBereich } from '../../core/detailberichte.js'
import { KpiCard, KpiGesperrt, DetailTabelle, Sparkline, Badge } from '../../components/ui.jsx'
import KnotenBewertung from './KnotenBewertung.jsx'
import DetailPerspektiven from './DetailPerspektiven.jsx'

function EbeneTag({ stufe }) {
  const e = EBENEN.find((x) => x.stufe === stufe)
  return <Badge status="n">E{stufe} · {e?.name}</Badge>
}

function Zweig({ knoten, aktiv, onSelect, tiefe = 0 }) {
  const [offen, setOffen] = useState(tiefe < 1)
  const hatKinder = knoten.kinder?.length > 0
  return (
    <div>
      <div onClick={() => { onSelect(knoten.id); if (hatKinder) setOffen(!offen) }}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', paddingLeft: 8 + tiefe * 14,
          cursor: 'pointer', borderRadius: 'var(--radius-sm)', fontSize: 13,
          background: aktiv === knoten.id ? 'var(--accent-soft)' : 'transparent',
          color: aktiv === knoten.id ? 'var(--accent)' : 'var(--ink)', fontWeight: aktiv === knoten.id ? 600 : 400 }}>
        <span className="mono" style={{ width: 12, color: 'var(--muted)' }}>{hatKinder ? (offen ? '▾' : '▸') : '·'}</span>
        <span style={{ flex: 1 }}>{knoten.titel}</span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>E{knoten.ebene}</span>
      </div>
      {offen && hatKinder && knoten.kinder.map((k) => (
        <Zweig key={k.id} knoten={k} aktiv={aktiv} onSelect={onSelect} tiefe={tiefe + 1} />
      ))}
    </div>
  )
}

function HistorieBlock({ kpiId }) {
  const k = KPI[kpiId]
  const [reihe, setReihe] = useState(null)
  useEffect(() => { ladeHistorie(kpiId).then(setReihe) }, [kpiId])
  if (!reihe) return null
  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600 }}>{k.name}</span>
        <Badge status="n">E5 · Historisierung</Badge>
      </div>
      <div style={{ marginTop: 8 }}><Sparkline reihe={reihe} richtung={k.richtung} /></div>
      <div className="mono" style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
        {reihe.map((r) => <span key={r.periode}>{r.periode}</span>)}
      </div>
    </div>
  )
}

export default function TreeNavigator({ rolle, werte, periode, onOpenReport, onDetail, startId }) {
  const baum = useMemo(() => baumFuerRolle(BERICHTSBAUM, (b) => darfBereich(rolle, b)) || BERICHTSBAUM, [rolle])
  const [aktiv, setAktiv] = useState(baum.id)
  const knoten = findeKnoten(baum, aktiv) || baum
  const pfad = pfadZu(baum, aktiv) || [baum]
  const detailKey = knoten.detail

  const [detail, setDetail] = useState(null)
  const [zu, setZu] = useState({}) // eingeklappte Cluster
  useEffect(() => { if (startId && findeKnoten(baum, startId)) setAktiv(startId) }, [startId]) // eslint-disable-line
  useEffect(() => { if (detailKey) ladeDetail(detailKey).then(setDetail); else setDetail(null) }, [detailKey])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>
      {/* Baum — Wurzel + nach Clustern gruppierte Fachbereiche */}
      <aside className="no-print" style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 10, position: 'sticky', top: 16, maxHeight: 'calc(100vh - 90px)', overflow: 'auto' }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', padding: '4px 8px', textTransform: 'uppercase' }}>Berichtsbaum</div>
        {/* Wurzel (GF / Konzern) */}
        <div onClick={() => setAktiv(baum.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', cursor: 'pointer',
          borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: aktiv === baum.id ? 600 : 600,
          background: aktiv === baum.id ? 'var(--accent-soft)' : 'transparent', color: aktiv === baum.id ? 'var(--accent)' : 'var(--ink)' }}>
          <span className="mono" style={{ width: 12, color: 'var(--muted)' }}>★</span>
          <span style={{ flex: 1 }}>{baum.titel}</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>E1</span>
        </div>
        {/* Cluster */}
        {gruppiereNachCluster(baum.kinder).map((g) => (
          <div key={g.cluster.id} style={{ marginTop: 6 }}>
            <div onClick={() => setZu((s) => ({ ...s, [g.cluster.id]: !s[g.cluster.id] }))}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', cursor: 'pointer',
                fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em' }}>
              <span className="mono" style={{ width: 12 }}>{zu[g.cluster.id] ? '▸' : '▾'}</span>
              <span style={{ flex: 1 }}>{g.cluster.name}</span>
              <span className="mono" style={{ fontSize: 10 }}>{g.knoten.length}</span>
            </div>
            {!zu[g.cluster.id] && g.knoten.map((k) => (
              <Zweig key={k.id} knoten={k} aktiv={aktiv} onSelect={setAktiv} tiefe={1} />
            ))}
          </div>
        ))}
      </aside>

      {/* Knotenansicht */}
      <section style={{ display: 'grid', gap: 16 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {pfad.map((p, i) => (
            <span key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {i > 0 && <span style={{ color: 'var(--muted)' }}>/</span>}
              <a onClick={() => setAktiv(p.id)} style={{ cursor: 'pointer', fontWeight: p.id === aktiv ? 600 : 400 }}>{p.titel}</a>
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 20 }}>{knoten.titel}</h2>
            <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
              {knoten.nummer && <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-soft)', padding: '2px 8px', borderRadius: 999 }}>{knoten.nummer}</span>}
              <EbeneTag stufe={knoten.ebene} />
            </div>
          </div>
          <div className="no-print" style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => downloadCsv(`${knoten.id}_${periode}`,
              knotenAlsCsv({ titel: knoten.titel, periode, kpiIds: (knoten.kpis || []).filter((id) => darfKpi(rolle, KPI[id])), werte, rolle, detail }))}
              style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--panel)' }}>⤓ Excel/CSV</button>
            <button onClick={druckePdf} style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--panel)' }}>🖨 PDF</button>
            {onDetail && (() => { const d = detailFuerBereich(knoten.bereich); return d ? (
              <button onClick={() => onDetail(d.id)} title={`Einzelfälle prüfen: ${d.name} (Ebene 4)`}
                style={{ padding: '9px 14px', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)', background: 'var(--panel)', color: 'var(--accent)', fontWeight: 600 }}>
                🔬 {d.name} (E4) →
              </button>
            ) : null })()}
            {knoten.bericht && (
              <button onClick={() => onOpenReport(knoten.bericht)} style={{ padding: '9px 14px', border: 'none',
                borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 600 }}>
                Management Report →
              </button>
            )}
          </div>
        </div>

        {/* KPIs des Knotens: Lagebewertung + angereicherte Karten (Object-Level-Security) */}
        {knoten.kpis?.length > 0 && (
          <KnotenBewertung kpiIds={knoten.kpis} werte={werte} rolle={rolle} />
        )}

        {/* Ebene 4: Detailtabelle */}
        {detailKey && <DetailTabelle daten={detail} spaltenWahl />}

        {/* Ebene 4: mehrere Detail-Perspektiven (kontextabhängig) + Filtermaske */}
        {knoten.perspektiven?.length > 0 && (
          <DetailPerspektiven bereich={knoten.bereich} perspektiven={knoten.perspektiven} />
        )}

        {/* Hinweis Drill-down */}
        {knoten.kinder?.length > 0 && (
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            ↳ {knoten.kinder.length} Unterknoten — im Baum aufklappen oder hier wählen:&nbsp;
            {knoten.kinder.map((k, i) => (
              <a key={k.id} onClick={() => setAktiv(k.id)} style={{ cursor: 'pointer' }}>{i > 0 ? ' · ' : ''}{k.titel}</a>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
