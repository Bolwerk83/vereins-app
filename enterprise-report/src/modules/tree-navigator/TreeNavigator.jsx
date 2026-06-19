// =========================================================================
//  MODUL: Berichtsbaum-Navigator
//  Linke Baum-Navigation über die 5 Ebenen + rechte Knotenansicht.
//  Reagiert auf die Rolle (Bereichsfilter) und die Periode.
// =========================================================================
import React, { useState, useMemo, useEffect } from 'react'
import { BERICHTSBAUM, EBENEN, baumFuerRolle, findeKnoten, pfadZu } from '../../core/reportTree.js'
import { KPI } from '../../core/kpiRegistry.js'
import { darfBereich, darfKpi } from '../../core/rbac.js'
import { ladeDetail, ladeHistorie } from '../../core/dataProvider.js'
import { KpiCard, KpiGesperrt, DetailTabelle, Sparkline, Badge } from '../../components/ui.jsx'

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

export default function TreeNavigator({ rolle, werte, onOpenReport }) {
  const baum = useMemo(() => baumFuerRolle(BERICHTSBAUM, (b) => darfBereich(rolle, b)) || BERICHTSBAUM, [rolle])
  const [aktiv, setAktiv] = useState(baum.id)
  const knoten = findeKnoten(baum, aktiv) || baum
  const pfad = pfadZu(baum, aktiv) || [baum]
  const detailKey = knoten.detail

  const [detail, setDetail] = useState(null)
  useEffect(() => { if (detailKey) ladeDetail(detailKey).then(setDetail); else setDetail(null) }, [detailKey])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>
      {/* Baum */}
      <aside style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 10, position: 'sticky', top: 16 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', padding: '4px 8px', textTransform: 'uppercase' }}>Berichtsbaum</div>
        <Zweig knoten={baum} aktiv={aktiv} onSelect={setAktiv} />
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
            <div style={{ marginTop: 6 }}><EbeneTag stufe={knoten.ebene} /></div>
          </div>
          {knoten.bericht && (
            <button onClick={() => onOpenReport(knoten.bericht)} style={{ padding: '9px 14px', border: 'none',
              borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 600 }}>
              Management Report öffnen →
            </button>
          )}
        </div>

        {/* KPIs des Knotens (mit Object-Level-Security) */}
        {knoten.kpis?.length > 0 && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {knoten.kpis.map((id) => darfKpi(rolle, KPI[id])
              ? <KpiCard key={id} kpiId={id} wert={werte[id]} />
              : <KpiGesperrt key={id} kpiId={id} />)}
          </div>
        )}

        {/* Ebene 4: Detailtabelle */}
        {detailKey && <DetailTabelle daten={detail} />}

        {/* Ebene 5: Historisierung je KPI des Knotens */}
        {knoten.kpis?.length > 0 && (
          <div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', margin: '4px 0 8px' }}>Historisierung (Ebene 5)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {knoten.kpis.filter((id) => darfKpi(rolle, KPI[id])).map((id) => <HistorieBlock key={id} kpiId={id} />)}
            </div>
          </div>
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
