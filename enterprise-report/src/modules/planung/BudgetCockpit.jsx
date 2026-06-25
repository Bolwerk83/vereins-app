// =========================================================================
//  BUDGET-COCKPIT — Budget end-to-end: wenige Treiber → alle KPIs; danach
//  Gegenüberstellung Ist (Vorjahr) · Budget (Plan) · Forecast (rollierende
//  Landung) je KPI mit Abweichung, plus inverse Ziel-Rückwärtsrechnung
//  (Umsatz-/EBIT-Ziel → benötigte Treiber).
// =========================================================================
import React, { useState } from 'react'
import { TREIBER, vorschlagEingaben, budgetVergleich, zielRueckwaerts } from '../../core/planungEinfach.js'
import { formatWert } from '../../design/theme.js'
import { AmpelPunkt } from '../../components/ui.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const feld = { padding: '5px 7px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 12.5, background: 'var(--panel)', color: 'var(--ink)', width: 64, textAlign: 'right' }
const th = (al) => ({ textAlign: al, padding: '6px 10px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' })
const td = (al) => ({ textAlign: al, padding: '5px 10px', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap' })

// Ist günstig? Abweichung im Sinne der Kennzahlrichtung positiv?
function ampelVon(richtung, abw) {
  if (abw == null) return 'n'
  const gut = richtung === 'tief_gut' ? abw < 0 : abw > 0
  return Math.abs(abw) < 1e-9 ? 'g' : gut ? 'g' : 'r'
}

export default function BudgetCockpit() {
  const [eingaben, setEingaben] = useState(vorschlagEingaben())
  const [wachstum, setWachstum] = useState(4)
  const [zielKpi, setZielKpi] = useState('nettoumsatz')
  const [zielwert, setZielwert] = useState('60')

  const rows = budgetVergleich(eingaben, wachstum)
  const ziel = zielRueckwaerts(zielKpi, zielwert, eingaben)
  const setE = (id, v) => setEingaben((e) => ({ ...e, [id]: v }))

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {/* Treiber */}
      <div style={{ ...card, padding: 14 }}>
        <div style={{ ...cap, marginBottom: 8 }}>Treiber (Budget) — Vorsaison ± % · Vorschläge vorbelegt</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {TREIBER.map((t) => (
            <label key={t.id} title={t.hinweis} style={{ fontSize: 12, color: 'var(--muted)' }}>{t.name}<br />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                <input type="number" value={eingaben[t.id]} onChange={(e) => setE(t.id, e.target.value)} style={feld} />
                <span style={{ fontSize: 11 }}>%</span>
              </span>
            </label>
          ))}
          <label style={{ fontSize: 12, color: 'var(--muted)' }}>Forecast-Wachstum<br />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <input type="number" value={wachstum} onChange={(e) => setWachstum(e.target.value)} style={feld} /><span style={{ fontSize: 11 }}>%</span>
            </span>
          </label>
          <button onClick={() => { setEingaben(vorschlagEingaben()); setWachstum(4) }} style={{ alignSelf: 'flex-end', ...card, padding: '6px 11px', cursor: 'pointer', fontSize: 12.5 }}>↺ Vorschläge</button>
        </div>
      </div>

      {/* Vergleich */}
      <div style={{ ...card, overflowX: 'auto' }}>
        <div style={{ ...cap, padding: '10px 12px 0' }}>Ist (Vorjahr) · Budget (Plan) · Forecast (Landung)</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 720, marginTop: 6 }}>
          <thead><tr>{['Kennzahl', 'Ist (VJ)', 'Budget', 'Forecast', 'Abw. Budget−Ist', 'FC−Budget', ''].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : i === 6 ? 'center' : 'right')}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => {
              const amp = ampelVon(r.richtung, r.abw)
              return (
                <tr key={r.id}>
                  <td style={{ ...td('left'), fontWeight: 600 }}>{r.name}</td>
                  <td style={td('right')} className="mono">{formatWert(r.ist, r.einheit)}</td>
                  <td style={{ ...td('right'), fontWeight: 700 }} className="mono">{formatWert(r.budget, r.einheit)}</td>
                  <td style={td('right')} className="mono">{formatWert(r.forecast, r.einheit)}</td>
                  <td style={{ ...td('right'), color: amp === 'g' ? 'var(--amp-g)' : amp === 'r' ? 'var(--amp-r)' : 'var(--muted)' }} className="mono">
                    {r.abw == null ? '—' : `${r.abw >= 0 ? '+' : ''}${formatWert(r.abw, r.einheit)}`}{r.abwPct != null ? ` (${r.abwPct >= 0 ? '+' : ''}${r.abwPct.toFixed(1)} %)` : ''}
                  </td>
                  <td style={{ ...td('right'), color: 'var(--muted)' }} className="mono">{r.fcAbw == null ? '—' : `${r.fcAbw >= 0 ? '+' : ''}${formatWert(r.fcAbw, r.einheit)}`}</td>
                  <td style={td('center')}><AmpelPunkt status={amp} size={12} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', padding: '8px 12px' }}>Budget aus den Treibern über das Kausalmodell abgeleitet (alle KPIs). Forecast = rollierende Landung auf Ist × Wachstum. Ampel: Abweichung im Sinne der Kennzahlrichtung.</div>
      </div>

      {/* Inverse Zielrechnung */}
      <div style={{ ...card, padding: 14, borderLeft: '3px solid var(--accent)' }}>
        <div style={{ ...cap, marginBottom: 8 }}>🎯 Ziel-Rückwärtsrechnung — welcher Treiber ist nötig?</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
          <select value={zielKpi} onChange={(e) => setZielKpi(e.target.value)} style={{ ...feld, width: 'auto', textAlign: 'left' }}>
            <option value="nettoumsatz">Nettoumsatz-Ziel</option>
            <option value="ebit">EBIT-Ziel</option>
          </select>
          <input type="number" value={zielwert} onChange={(e) => setZielwert(e.target.value)} style={feld} />
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Mio €</span>
        </div>
        <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink)' }}>{ziel.text}</div>
      </div>
    </div>
  )
}
