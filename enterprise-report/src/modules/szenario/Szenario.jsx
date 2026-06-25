// =========================================================================
//  SZENARIO-SIMULATOR (What-if) — Treiber ±% / absolut ändern, Wirkung auf
//  abgeleitete KPIs live sehen. Nutzt den KPI-Abhängigkeitsgraph der Registry.
// =========================================================================
import React, { useState } from 'react'
import { stellhebel, simuliereSzenario, effekte } from '../../core/szenarioEngine.js'
import { MOCK } from '../../data/mock.js'
import { formatWert } from '../../design/theme.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const inp = { padding: '6px 8px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', fontSize: 13 }
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '7px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })

// Kuratierte Stellhebel über mehrere Domänen — alle wirken jetzt über das
// dichte Kausalmodell bis ins Ergebnis (EINE Engine: szenarioEngine).
const LEVER_IDS = ['nettoumsatz', 'wareneinsatz', 'gemeinkosten', 'personalkosten', 'marketingkosten', 'retourenquote', 'dso', 'ausschuss']

export default function Szenario({ periode = '2025' }) {
  const roh = MOCK.roheWerte[periode] || MOCK.roheWerte['2025']
  const alleHebel = stellhebel(roh)
  const lever = LEVER_IDS.map((id) => alleHebel.find((t) => t.id === id)).filter(Boolean)
  const [ov, setOv] = useState({})   // { id: { modus, wert } }

  const setLever = (id, patch) => setOv((o) => ({ ...o, [id]: { modus: 'pct', wert: 0, ...o[id], ...patch } }))
  const reset = () => setOv({})
  const aktiv = Object.values(ov).some((o) => o && Number(o.wert) !== 0)
  const { basis, sim, fixiert } = simuliereSzenario(roh, ov)
  const geaendert = aktiv ? effekte(basis, sim, { fixiert }) : []

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Szenario-Simulator (What-if)</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 820 }}>
          Treiber-Kennzahlen <b>prozentual oder absolut</b> verändern und sofort sehen, wie sich die abgeleiteten Kennzahlen
          (DB, Margen, Ergebnis …) mitbewegen — über den Abhängigkeitsgraph der KPI-Engine.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(320px, 1.3fr)', gap: 14 }}>
        {/* Stellhebel */}
        <div style={{ ...card, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={cap}>Stellhebel</div>
            {aktiv && <button onClick={reset} style={{ ...inp, cursor: 'pointer', fontSize: 12 }}>Zurücksetzen</button>}
          </div>
          {lever.map((t) => {
            const o = ov[t.id] || { modus: 'pct', wert: 0 }
            return (
              <div key={t.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{t.name}</span>
                  <span className="mono" style={{ color: 'var(--muted)' }}>{formatWert(t.basis, t.einheit)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    {['pct', 'abs'].map((mo) => (
                      <button key={mo} onClick={() => setLever(t.id, { modus: mo, wert: 0 })}
                        style={{ padding: '4px 9px', border: 'none', fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                          background: o.modus === mo ? 'var(--accent)' : 'var(--panel)', color: o.modus === mo ? '#fff' : 'var(--muted)' }}>{mo === 'pct' ? '±%' : 'absolut'}</button>
                    ))}
                  </div>
                  {o.modus === 'pct' ? (
                    <>
                      <input type="range" min="-50" max="50" step="1" value={o.wert} onChange={(e) => setLever(t.id, { wert: Number(e.target.value) })} style={{ flex: 1 }} />
                      <span className="mono" style={{ width: 54, textAlign: 'right', fontWeight: 700, color: o.wert > 0 ? 'var(--amp-g)' : o.wert < 0 ? 'var(--amp-r)' : 'var(--ink)' }}>{o.wert > 0 ? '+' : ''}{o.wert} %</span>
                    </>
                  ) : (
                    <input type="number" value={o.wert} onChange={(e) => setLever(t.id, { wert: Number(e.target.value) })} style={{ ...inp, flex: 1 }} placeholder={`${t.basis}`} />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Wirkung */}
        <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
          <div style={{ ...cap, marginBottom: 10 }}>Wirkung auf Kennzahlen {aktiv ? `(${geaendert.length} betroffen)` : ''}</div>
          {!aktiv
            ? <div style={{ fontSize: 13, color: 'var(--muted)' }}>Links einen Stellhebel bewegen — hier erscheint live, welche Kennzahlen sich wie verändern (bis ins Ergebnis).</div>
            : geaendert.length === 0
              ? <div style={{ fontSize: 13, color: 'var(--muted)' }}>Keine messbare Wirkung — Stellhebel stärker bewegen.</div>
              : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead><tr>{['Kennzahl', 'Basis', 'Szenario', 'Δ'].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
                <tbody>
                  {geaendert.slice(0, 20).map((w) => (
                    <tr key={w.id} style={{ background: w.flip ? 'var(--accent-soft)' : 'transparent' }}>
                      <td style={td('left', true)}>{w.name}</td>
                      <td className="mono" style={td('right')}>{formatWert(w.vor, w.einheit)}</td>
                      <td className="mono" style={td('right', true)}>{formatWert(w.nach, w.einheit)}</td>
                      <td className="mono" style={{ ...td('right'), color: w.delta >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' }}>
                        {w.delta >= 0 ? '+' : ''}{w.deltaPct} %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>
        Die Wirkung wird über das dichte Kausalmodell + den KPI-Abhängigkeitsgraph berechnet (z. B. Retouren → Erlös →
        Umsatz → EBIT). Ampel-Wechsel sind hervorgehoben. Szenario ist rein explorativ und ändert keine gespeicherten Werte.
      </div>
    </div>
  )
}
