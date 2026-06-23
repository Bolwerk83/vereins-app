// =========================================================================
//  MARKTPOTENZIAL — Geomarketing je PLZ-Gebiet: Potenzial (Einwohner ×
//  Pro-Kopf-Volumen) vs. Ist-Umsatz, Ausschöpfung/Marktanteil, Kaufkraft-
//  Dichte und White Spots mit KI-Empfehlung und Potenzialreserve.
// =========================================================================
import React, { useState } from 'react'
import { ladeMarktpotenzial, regionen, gesamt, empfehlungFuer, setzeParameter, setzeZurueck } from '../../core/marktpotenzial.js'
import { addMassnahme, ladeMassnahmen } from '../../core/massnahmen.js'
import { datenstandText } from '../../core/datenstand.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const AMP = { g: 'var(--amp-g)', a: 'var(--amp-a)', r: 'var(--amp-r)' }
const mio = (n) => (n / 1000).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Mio €'
const teur = (n) => Math.round(n).toLocaleString('de-DE') + ' T€'
const PRIO_F = { hoch: 'var(--amp-r)', mittel: 'var(--amp-a)', gering: 'var(--muted)' }

function Balken({ pct, ziel, status }) {
  const w = Math.min(100, pct / Math.max(ziel * 2, pct, 1) * 100)
  const zielX = Math.min(100, ziel / Math.max(ziel * 2, pct, 1) * 100)
  return (
    <div style={{ position: 'relative', height: 10, background: 'var(--line)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, width: w + '%', background: AMP[status], borderRadius: 999 }} />
      <div title="Zielanteil" style={{ position: 'absolute', top: -2, bottom: -2, left: zielX + '%', width: 2, background: 'var(--ink)', opacity: .55 }} />
    </div>
  )
}

export default function Marktpotenzial() {
  const [, setTick] = useState(0)
  const refresh = () => setTick((t) => t + 1)
  const state = ladeMarktpotenzial()
  const liste = regionen(state)
  const g = gesamt(state)
  const massn = ladeMassnahmen()
  const hat = (titel) => massn.some((m) => m.titel === titel)
  const uebernehmen = (e, ort) => { addMassnahme({ titel: e.titel, owner: 'Vertrieb/Marketing', quelle: 'marktpotenzial', bereich: ort, hebel: 'Geomarketing', relevanz: e.text }); refresh() }

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={cap}>Geomarketing · Potenzial & White Spots</div>
          <h2 style={{ margin: '4px 0 0' }}>Marktpotenzial je PLZ-Gebiet</h2>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>📅 {datenstandText()} · Geobasis: PLZ × Einwohner/Fläche (suche-postleitzahl.org · Destatis · BKG)</div>
        </div>
        <button className="no-print" onClick={() => window.print()} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>🖨 Drucken / PDF</button>
      </div>

      {/* Parameter */}
      <div className="no-print" style={{ ...card, padding: '10px 14px', display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
        <label style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={cap}>Marktvolumen €/Einwohner·Jahr</span>
          <input type="number" value={state.proKopf} min={1} onChange={(e) => { setzeParameter({ proKopf: Number(e.target.value) || 0 }); refresh() }}
            style={{ width: 70, padding: '4px 7px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--panel)', color: 'var(--ink)' }} />
        </label>
        <label style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={cap}>Zielanteil %</span>
          <input type="number" value={state.zielAnteil} min={0} step={0.5} onChange={(e) => { setzeParameter({ zielAnteil: Number(e.target.value) || 0 }); refresh() }}
            style={{ width: 60, padding: '4px 7px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--panel)', color: 'var(--ink)' }} />
        </label>
        <button onClick={() => { setzeZurueck(); refresh() }} style={{ fontSize: 11.5, cursor: 'pointer', border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--muted)', borderRadius: 999, padding: '3px 11px' }}>↺ Standard</button>
        <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Potenzial = Einwohner × Marktvolumen/Kopf. Ausschöpfung = eigener Umsatz ÷ Potenzial (= lokaler Marktanteil).</span>
      </div>

      {/* KPI-Band */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {[
          ['Marktpotenzial gesamt', mio(g.potenzial)],
          ['Eigener Ist-Umsatz', mio(g.ist)],
          ['Ø Ausschöpfung', g.ausschoepfungPct + ' %', g.ausschoepfungPct >= g.zielAnteil ? 'var(--amp-g)' : 'var(--amp-a)'],
          ['Potenzialreserve (zum Ziel)', mio(g.reserve), '#f59e0b'],
          ['White Spots', g.whiteSpots, g.whiteSpots ? 'var(--amp-r)' : 'var(--amp-g)']
        ].map(([l, v, c]) => (
          <div key={l} style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 150, borderTop: `3px solid ${c || 'var(--accent)'}` }}>
            <div style={{ ...cap, marginBottom: 3 }}>{l}</div>
            <div className="mono" style={{ fontSize: 19, fontWeight: 700, color: c || 'var(--ink)' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Regionen-Tabelle */}
      <div style={{ ...card, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'right', color: 'var(--muted)', borderBottom: '1px solid var(--line)' }}>
                {['PLZ', 'Gebiet', 'Einwohner', 'Dichte', 'KK-Idx', 'Potenzial', 'Ist-Umsatz', 'Ausschöpfung', 'Reserve'].map((h, i) => (
                  <th key={h} style={{ padding: '9px 12px', textAlign: i < 2 ? 'left' : 'right', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liste.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td className="mono" style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>{r.plz}</td>
                  <td style={{ padding: '9px 12px' }}>
                    <span style={{ fontWeight: 600 }}>{r.ort}</span> <span style={{ color: 'var(--muted)', fontSize: 11 }}>{r.land}</span>
                    {r.typ === 'standort' && <span title="Eigener Standort" style={{ marginLeft: 6 }}>🏠</span>}
                    {r.whiteSpot && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: '#fff', background: 'var(--amp-r)', borderRadius: 999, padding: '1px 7px' }}>White Spot</span>}
                  </td>
                  <td className="mono" style={{ padding: '9px 12px', textAlign: 'right' }}>{(r.einwohner / 1000).toLocaleString('de-DE')} Tsd</td>
                  <td className="mono" style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r.dichte.toLocaleString('de-DE')}/km²</td>
                  <td className="mono" style={{ padding: '9px 12px', textAlign: 'right', color: r.kaufkraftIdx >= 110 ? 'var(--amp-g)' : 'var(--muted)' }}>{r.kaufkraftIdx}</td>
                  <td className="mono" style={{ padding: '9px 12px', textAlign: 'right' }}>{teur(r.potenzial)}</td>
                  <td className="mono" style={{ padding: '9px 12px', textAlign: 'right' }}>{teur(r.istUmsatz)}</td>
                  <td style={{ padding: '9px 12px', minWidth: 130 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="mono" style={{ width: 44, textAlign: 'right', fontWeight: 700, color: AMP[r.status] }}>{r.ausschoepfungPct}%</span>
                      <div style={{ flex: 1 }}><Balken pct={r.ausschoepfungPct} ziel={state.zielAnteil} status={r.status} /></div>
                    </div>
                  </td>
                  <td className="mono" style={{ padding: '9px 12px', textAlign: 'right', color: r.reserve ? '#f59e0b' : 'var(--muted)', fontWeight: r.reserve ? 700 : 400 }}>{r.reserve ? teur(r.reserve) : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KI-Empfehlungen für die größten Chancen */}
      <div style={{ ...cap, marginBottom: 8 }}>🤖 KI-Empfehlungen — größte Chancen zuerst</div>
      <div style={{ display: 'grid', gap: 10 }}>
        {liste.filter((r) => r.reserve > 0).slice(0, 5).map((r) => {
          const e = empfehlungFuer(r)
          return (
            <div key={r.id} style={{ ...card, padding: 14, borderLeft: `3px solid ${AMP[r.status]}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: '#fff', background: PRIO_F[e.prio], borderRadius: 999, padding: '1px 8px' }}>{e.prio}</span>
                <span style={{ fontWeight: 700 }}>{e.titel}</span>
                <span style={{ marginLeft: 'auto' }}>
                  {hat(e.titel)
                    ? <span style={{ fontSize: 12, color: 'var(--amp-g)' }}>✓ übernommen</span>
                    : <button onClick={() => uebernehmen(e, r.ort)} style={{ fontSize: 11.5, cursor: 'pointer', border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--panel)', borderRadius: 999, padding: '2px 10px', fontWeight: 600 }}>→ als Maßnahme</button>}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 5 }}>{e.text}</div>
            </div>
          )
        })}
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '14px 0 20px' }}>
        White Spot = überdurchschnittliches Marktpotenzial bei Ausschöpfung unter dem halben Zielanteil. Demo-Daten (Mock); Geobasis siehe „Datenquellen & Links".
      </div>
    </div>
  )
}
