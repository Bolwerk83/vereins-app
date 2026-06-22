// =========================================================================
//  Knoten-Bewertung — macht jeden Berichtsknoten aussagekräftig:
//  Lagebewertung (Kernaussage + Ampel-Verteilung + Top-Handlungsbedarf)
//  und je KPI eine Karte mit Ist, Ziel-Abweichung, VJ-Veränderung, Trend
//  und Controller-Aussage.
// =========================================================================
import React, { useEffect, useState } from 'react'
import { KPI } from '../../core/kpiRegistry.js'
import { darfKpi } from '../../core/rbac.js'
import { ladeHistorie } from '../../core/dataProvider.js'
import { kpiInsight, knotenBewertung } from '../../core/insights.js'
import { formatWert, AMPEL_FARBE, TREND_ICON, kpiSymbol } from '../../design/theme.js'
import { AmpelPunkt, KpiGesperrt, Sparkline, KpiDrillModal } from '../../components/ui.jsx'

export default function KnotenBewertung({ kpiIds, werte, rolle }) {
  const sichtbar = kpiIds.filter((id) => KPI[id] && darfKpi(rolle, KPI[id]))
  const gesperrt = kpiIds.filter((id) => KPI[id] && !darfKpi(rolle, KPI[id]))
  const [hist, setHist] = useState({})
  const [drill, setDrill] = useState(null)

  useEffect(() => {
    let ab = false
    Promise.all(sichtbar.map((id) => ladeHistorie(id).then((r) => [id, r])))
      .then((paare) => { if (!ab) setHist(Object.fromEntries(paare)) })
    return () => { ab = true }
  }, [kpiIds.join(',')]) // eslint-disable-line

  const insights = sichtbar.map((id) => kpiInsight(id, werte[id], hist[id] || []))
  const bewertung = knotenBewertung(insights)
  const v = bewertung.verteilung
  const total = Math.max(1, v.g + v.a + v.r + v.n)

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Lagebewertung */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 16, boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>Lagebewertung (automatisch)</div>
          {/* Ampel-Verteilung */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', width: 160, height: 8, borderRadius: 4, overflow: 'hidden', border: '1px solid var(--line)' }}>
              {['g', 'a', 'r', 'n'].map((s) => v[s] ? <div key={s} style={{ width: `${(v[s] / total) * 100}%`, background: AMPEL_FARBE[s] }} /> : null)}
            </div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{v.g}/{v.a}/{v.r}</span>
          </div>
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, marginTop: 8,
          color: v.r ? 'var(--amp-r)' : v.a ? 'var(--amp-a)' : 'var(--amp-g)' }}>
          {bewertung.kernaussage}
        </div>
        {bewertung.topHandlungsbedarf.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Top-Handlungsbedarf</div>
            {bewertung.topHandlungsbedarf.map((i) => (
              <div key={i.id} style={{ display: 'flex', gap: 8, alignItems: 'baseline', padding: '3px 0', fontSize: 13 }}>
                <AmpelPunkt status={i.status} />
                <span style={{ flex: 1 }}>{i.aussage}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Angereicherte KPI-Karten */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {insights.map((i) => {
          const reihe = hist[i.id] || []
          return (
            <div key={i.id} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderLeft: `3px solid ${AMPEL_FARBE[i.status]}`, borderRadius: 'var(--radius)', padding: 14, boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>{i.k.name}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span role="button" title="Logik & Herkunft (Drill durch die Ebenen)" onClick={() => setDrill(i.id)}
                    style={{ cursor: 'pointer', color: 'var(--accent)', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>⛓</span>
                  <AmpelPunkt status={i.status} />
                </span>
              </div>
              <div className="mono" style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>
                {kpiSymbol(i.k.einheit) && <span style={{ color: 'var(--muted)', fontWeight: 500, marginRight: 5 }}>{kpiSymbol(i.k.einheit)}</span>}{formatWert(i.wert, i.k.einheit)}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 11, flexWrap: 'wrap' }}>
                {i.k.ziel != null && i.abwZielPct != null
                  ? <span title={`Budget/Ziel ${formatWert(i.k.ziel, i.k.einheit)}`} style={{ color: i.status === 'r' ? 'var(--amp-r)' : i.status === 'a' ? 'var(--amp-a)' : 'var(--amp-g)' }}>
                      Budget {i.abwZielPct >= 0 ? '+' : ''}{i.abwZielPct.toFixed(1)} %
                    </span>
                  : <span style={{ color: 'var(--muted)' }}>kein Budget</span>}
                {i.deltaVjPct != null && <span className="mono" style={{ color: i.istGutTrend ? 'var(--amp-g)' : 'var(--amp-r)' }}>
                  VJ {i.deltaVjPct >= 0 ? '+' : ''}{i.deltaVjPct.toFixed(1)} % {TREND_ICON[i.trend.trend]}</span>}
              </div>
              {reihe.length >= 2 && <div style={{ marginTop: 6 }}><Sparkline reihe={reihe} richtung={i.k.richtung} w={210} h={40} /></div>}
              <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 6, lineHeight: 1.4 }}>{i.aussage}</div>
            </div>
          )
        })}
        {gesperrt.map((id) => <KpiGesperrt key={id} kpiId={id} />)}
      </div>
      {drill && <KpiDrillModal startId={drill} werte={werte} onClose={() => setDrill(null)} />}
    </div>
  )
}
