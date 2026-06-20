// =========================================================================
//  MODUL: Management Report (Executive-Bericht, Ebene 1 / GF)
//  Layout: Kopf → Kernaussage → KPI-Leiste → Analyse (4 Rubriken) →
//          Sofortmaßnahmen. Druckfreundlich (A4) über @media print im CSS.
// =========================================================================
import React from 'react'
import { MGMT_REPORT } from './reportContent.js'
import { KPI } from '../../core/kpiRegistry.js'
import { darfKpi } from '../../core/rbac.js'
import { KpiCard, KpiGesperrt, Badge } from '../../components/ui.jsx'

export default function ManagementReport({ rolle, werte, periode, onClose, onEmpfehlung }) {
  const r = MGMT_REPORT
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', background: 'var(--panel)', border: '1px solid var(--line)',
      borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
      {/* Kopf */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px',
        borderBottom: '2px solid var(--accent)' }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>VeloWerk Gruppe · Management Report · {periode}</div>
          <h1 style={{ fontSize: 22, marginTop: 2 }}>{r.titel}</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Badge status="n">{r.audienz}</Badge>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {onEmpfehlung && <button onClick={() => onEmpfehlung(`${r.titel} · ${periode}`)}
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontWeight: 600 }}>
              🎯 Controller-Auswertung (SMART)</button>}
            <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)', padding: '6px 12px' }}>← Zurück</button>
          </div>
        </div>
      </div>

      <div style={{ padding: 24, display: 'grid', gap: 20 }}>
        {/* Kernaussage */}
        <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--accent)', borderLeft: '3px solid var(--accent)', paddingLeft: 12 }}>
          {r.kernaussage}
        </div>

        {/* KPI-Leiste */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {r.kpis.map((id) => darfKpi(rolle, KPI[id])
            ? <KpiCard key={id} kpiId={id} wert={werte[id]} />
            : <KpiGesperrt key={id} kpiId={id} />)}
        </div>

        {/* Analyse: 4 Rubriken */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {r.analyse.map(([titel, text]) => (
            <div key={titel}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>{titel}</div>
              <p style={{ margin: 0, color: 'var(--slate)', fontSize: 13.5, lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}
        </div>

        {/* Sofortmaßnahmen / Quick Wins */}
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Sofortmaßnahmen — priorisiert nach Aufwand/Wirkung</div>
          <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            {r.quickWins.map((q, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 140px 90px', gap: 10, alignItems: 'center',
                padding: '10px 14px', borderTop: i ? '1px solid var(--line)' : 'none', fontSize: 13 }}>
                <span>{q.t}</span>
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>{q.b}</span>
                <span className="mono" style={{ fontSize: 12 }}>{q.hebel}</span>
                <Badge status={q.aufwand === 'gering' ? 'g' : 'a'}>{q.aufwand}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--muted)', borderTop: '1px solid var(--line)', paddingTop: 10 }}>
          Vertraulich · konsolidiert in EUR · CHF zum Stichtagskurs · Quelle: Reporting-Engine (Mock-Daten)
        </div>
      </div>
    </div>
  )
}
