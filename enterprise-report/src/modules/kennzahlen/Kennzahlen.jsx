// =========================================================================
//  KENNZAHLEN-GLOSSAR — alle Definitionen an einem Ort, nach Bereich sortiert.
//  Respektiert Rechte: vertrauliche Kennzahlen ohne Berechtigung sind als
//  gesperrt markiert. ⓘ öffnet den vollständigen Steckbruck (Definition).
// =========================================================================
import React, { useState } from 'react'
import { KPI } from '../../core/kpiRegistry.js'
import { darfKpi } from '../../core/rbac.js'
import { formatWert } from '../../design/theme.js'
import { useKpiDef } from './KpiDefContext.jsx'

export default function Kennzahlen({ rolle, werte = {} }) {
  const def = useKpiDef()
  const [suche, setSuche] = useState('')
  const s = suche.trim().toLowerCase()

  const liste = Object.values(KPI).filter((k) => !s || k.name.toLowerCase().includes(s) || (k.beschreibung || '').toLowerCase().includes(s))
  const bereiche = [...new Set(liste.map((k) => k.bereich))]

  const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Kennzahlen-Definitionen</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>
          Nachschlagewerk aller Kennzahlen: Bedeutung, Formel, Ziel- und Ampel-Logik, Datenquelle.
          Über das <b>ⓘ</b> (auch direkt an jeder Kennzahl im Bericht) öffnest du den vollständigen Steckbrief.
        </div>
        <input value={suche} onChange={(e) => setSuche(e.target.value)} placeholder="Kennzahl suchen …"
          style={{ marginTop: 10, padding: '8px 11px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', width: 280 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {bereiche.map((b) => (
          <div key={b} style={{ ...card, padding: 14 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>{b}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {liste.filter((k) => k.bereich === b).map((k) => {
                const darf = darfKpi(rolle, k)
                return (
                  <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                    <button onClick={() => def?.oeffne(k.id)} title="Definition öffnen"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 15, fontWeight: 700 }}>ⓘ</button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{k.name} {k.security && <span title="vertraulich" style={{ fontSize: 11 }}>🔒</span>}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{k.beschreibung}</div>
                    </div>
                    <div className="mono" style={{ fontSize: 14, fontWeight: 600, minWidth: 90, textAlign: 'right' }}>
                      {darf ? formatWert(werte[k.id], k.einheit) : '🔒'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
