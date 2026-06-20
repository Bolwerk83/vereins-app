// =========================================================================
//  MODUL: Alerts — Frühwarnung über alle Bereiche.
// =========================================================================
import React from 'react'
import { sammleAlerts } from '../../core/alerts.js'
import { formatWert } from '../../design/theme.js'
import { AmpelPunkt, Badge } from '../../components/ui.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }
const head = { padding: '10px 14px', borderBottom: '1px solid var(--line)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }

export default function Alerts({ werte, rolle, periode }) {
  const a = sammleAlerts(werte, rolle)
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gap: 16 }}>
      <div style={{ ...card, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ fontSize: 18 }}>Alerts · Frühwarnung <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>· {periode}</span></h2>
          <div style={{ display: 'flex', gap: 6 }}>
            <Badge status="r">{a.kritisch} kritisch</Badge>
            <Badge status="a">{a.gesamt} gesamt</Badge>
          </div>
        </div>
      </div>

      {/* KPI-Alerts */}
      <div style={card}>
        <div style={head}><span>Kennzahlen außerhalb des Ziels</span><Badge status="n">{a.kpis.length}</Badge></div>
        {a.kpis.map((i) => (
          <div key={i.id} style={{ display: 'flex', gap: 10, alignItems: 'baseline', padding: '9px 14px', borderTop: '1px solid var(--line)' }}>
            <AmpelPunkt status={i.status} />
            <span style={{ width: 56, fontSize: 11, color: 'var(--muted)' }} className="mono">{i.k.bereich}</span>
            <span style={{ flex: 1, fontSize: 13 }}>{i.aussage}</span>
          </div>
        ))}
        {!a.kpis.length && <div style={{ padding: 14, color: 'var(--muted)', fontSize: 13 }}>Keine KPI-Auffälligkeiten.</div>}
      </div>

      {/* Quercheck-Alerts */}
      <div style={card}>
        <div style={head}><span>Querchecks (Abstimmung & Plausibilität)</span><Badge status="n">{a.querchecks.length}</Badge></div>
        {a.querchecks.map((q) => (
          <div key={q.id} style={{ display: 'flex', gap: 10, alignItems: 'baseline', padding: '9px 14px', borderTop: '1px solid var(--line)' }}>
            <AmpelPunkt status={q.status === 'fehler' ? 'r' : 'a'} />
            <span style={{ flex: 1, fontSize: 13 }}>{q.titel} <span style={{ color: 'var(--muted)' }}>— Ist {q.ist} · Soll {q.soll}</span></span>
            <span style={{ fontSize: 11, fontWeight: 600, color: q.status === 'fehler' ? 'var(--amp-r)' : 'var(--amp-a)' }}>{q.status === 'fehler' ? 'Abstimmfehler' : 'Plausibilität'}</span>
          </div>
        ))}
        {!a.querchecks.length && <div style={{ padding: 14, color: 'var(--muted)', fontSize: 13 }}>Alle Querchecks ok.</div>}
      </div>

      {/* Maßnahmen-Alerts */}
      <div style={card}>
        <div style={head}><span>Überfällige Maßnahmen</span><Badge status="n">{a.massnahmen.length}</Badge></div>
        {a.massnahmen.map((m) => (
          <div key={m.id} style={{ display: 'flex', gap: 10, alignItems: 'baseline', padding: '9px 14px', borderTop: '1px solid var(--line)' }}>
            <AmpelPunkt status="r" />
            <span style={{ flex: 1, fontSize: 13 }}>{m.titel}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--amp-r)' }}>fällig {m.faelligkeit} · {m.owner || 'ohne Owner'}</span>
          </div>
        ))}
        {!a.massnahmen.length && <div style={{ padding: 14, color: 'var(--muted)', fontSize: 13 }}>Keine überfälligen Maßnahmen.</div>}
      </div>
    </div>
  )
}
