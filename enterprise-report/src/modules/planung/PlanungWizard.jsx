// =========================================================================
//  PLANUNGS-WIZARD — vereinfachte Planung Step für Step: wenige Treiber mit
//  Vorsaison-Vorschlägen erfassen → alle KPIs werden abgeleitet. Mit AEB-
//  Rückwärtsbrücke (Auftragseingang → AEB → Umsatz) und sauberem Runden.
// =========================================================================
import React, { useState } from 'react'
import { TREIBER, vorschlagEingaben, plane, PLAN_KPIS } from '../../core/planungEinfach.js'
import { KPI } from '../../core/kpiRegistry.js'
import { formatWert } from '../../design/theme.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }

const STEPS = [
  { titel: 'Absatz & Auftragseingang', ids: ['auftragseingangMenge', 'stornoquote'], info: 'Bestellte Menge und Stornoquote planen → daraus der bereinigte Auftragseingang (AEB).' },
  { titel: 'Preis & Umsatz', ids: ['durchschnittspreis'], info: 'Der Ø-Verkaufspreis ergibt zusammen mit dem AEB den geplanten Umsatz (Rückwärtsbrücke).' },
  { titel: 'Kosten', ids: ['wareneinsatzquote', 'gemeinkosten', 'personalkosten', 'marketingkosten'], info: 'Kostentreiber bestimmen Deckungsbeitrag, Marge und Ergebnis.' },
  { titel: 'Ergebnis-Plan', ids: [], info: 'Alle Kennzahlen werden automatisch abgeleitet — Plan gegen Vorsaison.' },
]

const fmtMenge = (n) => Math.round(n).toLocaleString('de-DE') + ' Stk'
function fmtTreiber(t, wert) {
  if (t.einheit === 'stk') return fmtMenge(wert)
  if (t.einheit === 'eur') return Math.round(wert).toLocaleString('de-DE') + ' €'
  if (t.einheit === 'eur_mio') return wert.toFixed(2) + ' Mio €'
  if (t.einheit === 'percent') return wert.toFixed(1) + ' %'
  return String(wert)
}

export default function PlanungWizard() {
  const [schritt, setSchritt] = useState(0)
  const [eingaben, setEingaben] = useState(vorschlagEingaben)
  const p = plane(eingaben)
  const setPct = (id, pct) => setEingaben((e) => ({ ...e, [id]: pct }))
  const tw = (id) => p.treiber.find((x) => x.id === id)
  const step = STEPS[schritt]
  const letzte = schritt === STEPS.length - 1

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', display: 'grid', gap: 14 }}>
      {/* Stepper */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => setSchritt(i)} style={{ flex: 1, minWidth: 150, textAlign: 'left', padding: '8px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            border: `1px solid ${i === schritt ? 'var(--accent)' : 'var(--line)'}`, background: i === schritt ? 'var(--accent-soft)' : i < schritt ? 'var(--panel)' : 'var(--bg)' }}>
            <div style={{ fontSize: 10.5, color: i <= schritt ? 'var(--accent)' : 'var(--muted)', fontWeight: 700 }}>{i < schritt ? '✓' : ''} Schritt {i + 1}</div>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{s.titel}</div>
          </button>
        ))}
      </div>

      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 4 }}>Schritt {schritt + 1} von {STEPS.length} · {step.titel}</div>
        <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 14 }}>{step.info}</div>

        {/* Treiber-Eingaben */}
        {!letzte && step.ids.map((id) => {
          const t = tw(id)
          return (
            <div key={id} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                <div><span style={{ fontWeight: 600 }}>{t.name}</span> <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{t.hinweis || ''}</span></div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Vorsaison: <span className="mono">{fmtTreiber(t, t.basis)}</span></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <input type="range" min="-30" max="30" step="0.5" value={t.pct} onChange={(e) => setPct(id, Number(e.target.value))} style={{ flex: 1 }} />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <input type="number" value={t.pct} onChange={(e) => setPct(id, Number(e.target.value))} step="0.5" style={{ width: 64, padding: '5px 7px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 13, textAlign: 'right' }} />
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>%</span>
                </span>
                <span className="mono" style={{ minWidth: 130, textAlign: 'right', fontWeight: 700, color: 'var(--accent)' }}>{fmtTreiber(t, t.plan)}</span>
              </div>
            </div>
          )
        })}

        {/* Zwischenstand / Rückwärtsbrücke */}
        {schritt <= 1 && (
          <div style={{ marginTop: 14, background: 'var(--bg)', border: '1px dashed var(--line)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: 13 }}>
            <b>AEB-Rückwärtsbrücke:</b> Auftragseingang {fmtMenge(tw('auftragseingangMenge').plan)} − Storno {tw('stornoquote').plan.toFixed(1)} %
            = <b>AEB {fmtMenge(p.aeb)}</b>{schritt >= 1 ? <> × Ø-Preis {Math.round(tw('durchschnittspreis').plan).toLocaleString('de-DE')} € = <b>Umsatz {p.umsatzPlanMio.toFixed(2)} Mio €</b></> : ''}
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>Intern volle Genauigkeit (AEB genau {p.aebGenau.toLocaleString('de-DE', { maximumFractionDigits: 3 })}), Anzeige kaufmännisch gerundet.</div>
          </div>
        )}

        {/* Ergebnis */}
        {letzte && (
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[['Auftragseingang', fmtMenge(tw('auftragseingangMenge').plan)], ['AEB (bereinigt)', fmtMenge(p.aeb)], ['Umsatz (Plan)', p.umsatzPlanMio.toFixed(2) + ' Mio €']].map(([l, v]) => (
                <div key={l} style={{ ...card, padding: '11px 13px', flex: 1, minWidth: 150, borderTop: '3px solid var(--accent)' }}>
                  <div style={{ ...cap, marginBottom: 3 }}>{l}</div><div className="mono" style={{ fontSize: 17, fontWeight: 800 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ ...card, overflow: 'auto' }}>
              <div style={{ ...cap, padding: '10px 12px 0' }}>Abgeleiteter KPI-Plan — alle Kennzahlen aus den Treibern</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 8 }}>
                <thead><tr>{['Kennzahl', 'Vorsaison', 'Plan', 'Δ'].map((h, i) => <th key={i} style={{ textAlign: i ? 'right' : 'left', padding: '6px 10px', borderBottom: '2px solid var(--line)', fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {PLAN_KPIS.filter((id) => KPI[id]).map((id) => {
                    const k = KPI[id], vor = p.vorsaison[id], pl = p.plan[id]
                    const dPct = vor ? (pl - vor) / Math.abs(vor) * 100 : null
                    return (
                      <tr key={id}>
                        <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{k.name}</td>
                        <td className="mono" style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{formatWert(vor, k.einheit)}</td>
                        <td className="mono" style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', textAlign: 'right', fontWeight: 700 }}>{formatWert(pl, k.einheit)}</td>
                        <td className="mono" style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', textAlign: 'right', color: dPct == null ? 'var(--muted)' : dPct >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' }}>{dPct == null ? '—' : `${dPct >= 0 ? '+' : ''}${dPct.toFixed(1)} %`}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>Nachkommastellen: intern volle Genauigkeit, Mengen kaufmännisch auf ganze Stück, Werte 2 / Quoten 1 Stelle. Ableitung über das Kausalmodell (eine Engine).</div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <button onClick={() => setSchritt((s) => Math.max(0, s - 1))} disabled={schritt === 0} style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: schritt === 0 ? 'default' : 'pointer', opacity: schritt === 0 ? 0.5 : 1, fontWeight: 600 }}>← Zurück</button>
          {!letzte
            ? <button onClick={() => setSchritt((s) => Math.min(STEPS.length - 1, s + 1))} style={{ padding: '8px 18px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Weiter →</button>
            : <button onClick={() => setSchritt(0)} style={{ padding: '8px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontWeight: 600 }}>↻ Neu beginnen</button>}
        </div>
      </div>
    </div>
  )
}
