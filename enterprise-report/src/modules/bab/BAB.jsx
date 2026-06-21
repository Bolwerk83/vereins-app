// =========================================================================
//  BETRIEBSABRECHNUNGSBOGEN (ganze Firma) — Kostenarten × Bereiche mit
//  Verteilungsschlüssel (manuell/automatisch zuordenbar), Umlage des
//  Allgemein-Bereichs, Gemeinkosten nach Umlage und Zuschlagssätze.
// =========================================================================
import React, { useState } from 'react'
import { BEREICHE, ENDBEREICHE, ladeSchluessel, schluessel, setSchluessel, gewichte } from '../../core/verteilung.js'
import { bab, ladeKostenarten, setZuordnung } from '../../core/babVoll.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const m = (v) => (v == null ? '' : v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }))
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })

export default function BAB({ onGeh }) {
  const [, setTick] = useState(0)
  const refresh = () => setTick((t) => t + 1)
  const [editSchluessel, setEditSchluessel] = useState(null)
  const b = bab()
  const kostenarten = ladeKostenarten()
  const schluesselListe = ladeSchluessel()

  function aendereMenge(sid, bereich, val) {
    const s = schluessel(sid)
    if (s.art === 'manuell') setSchluessel(sid, { gewichte: { ...s.gewichte, [bereich]: val === '' ? 0 : Number(val) } })
    else setSchluessel(sid, { mengen: { ...s.mengen, [bereich]: val === '' ? 0 : Number(val) } })
    refresh()
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Betriebsabrechnungsbogen (ganze Firma)</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 760 }}>
            Jede Kostenart wird über einen <b>Verteilungsschlüssel</b> auf die Bereiche verteilt; der Allgemein-Bereich
            wird umgelegt; daraus ergeben sich die <b>Zuschlagssätze</b>. Schlüssel sind manuell oder automatisch zuordenbar.
          </div>
        </div>
        {onGeh && <button onClick={() => onGeh('kostenstellen')} style={{ ...card, padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← Kostenstellen</button>}
      </div>

      {/* BAB-Matrix */}
      <div style={{ ...card, padding: 14, marginBottom: 14, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 760 }}>
          <thead><tr>
            <th style={th('left')}>Kostenart</th>
            <th style={th('right')}>Summe</th>
            <th style={th('left')}>Verteilungsbasis</th>
            {BEREICHE.map((be) => <th key={be.id} style={th('right')}>{be.name}</th>)}
          </tr></thead>
          <tbody>
            {b.kostenarten.map((k) => (
              <tr key={k.id}>
                <td style={td('left', true)}>{k.name}</td>
                <td className="mono" style={td('right')}>{m(k.summe)}</td>
                <td style={td('left')}>
                  <select value={k.schluessel} onChange={(e) => { setZuordnung(k.id, e.target.value); refresh() }}
                    style={{ font: 'inherit', fontSize: 12, padding: '3px 6px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }}>
                    {schluesselListe.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.art === 'manuell' ? 'man.' : 'auto'})</option>)}
                  </select>
                </td>
                {BEREICHE.map((be) => <td key={be.id} className="mono" style={{ ...td('right'), color: k.verteilung[be.id] ? 'var(--ink)' : 'var(--line)' }}>{k.verteilung[be.id] ? m(k.verteilung[be.id]) : '–'}</td>)}
              </tr>
            ))}
            {/* Primärsummen */}
            <tr style={{ background: 'var(--bg)' }}>
              <td style={td('left', true)}>Σ Primärkosten</td><td /><td />
              {BEREICHE.map((be) => <td key={be.id} className="mono" style={td('right', true)}>{m(b.primaer[be.id])}</td>)}
            </tr>
            {/* Umlage */}
            <tr>
              <td style={{ ...td('left'), color: 'var(--accent)' }}>Umlage Allgemein →</td><td /><td />
              <td className="mono" style={{ ...td('right'), color: 'var(--accent)' }}>({m(b.primaer.allgemein)})</td>
              {ENDBEREICHE.map((e) => <td key={e} className="mono" style={{ ...td('right'), color: 'var(--accent)' }}>+{m(b.umlage[e])}</td>)}
            </tr>
            {/* Nach Umlage */}
            <tr style={{ background: 'var(--bg)' }}>
              <td style={td('left', true)}>Gemeinkosten n. Umlage</td><td /><td /><td />
              {ENDBEREICHE.map((e) => <td key={e} className="mono" style={td('right', true)}>{m(b.nachUmlage[e])}</td>)}
            </tr>
            {/* Zuschlagssätze */}
            <tr>
              <td style={{ ...td('left'), fontWeight: 700, color: 'var(--accent)' }}>Zuschlagssatz</td><td /><td /><td />
              {ENDBEREICHE.map((e) => (
                <td key={e} className="mono" style={{ ...td('right'), fontWeight: 700, color: 'var(--accent)' }}>
                  {b.zuschlag[e]} %<div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 400 }}>auf {b.bezug[e].label}</div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
          Bezug: Fertigungsmaterial {m(26.8)} · Fertigungslohn {m(5.2)} · Herstellkosten {m(b.hk)} Mio €. Die Sätze fließen in die Zuschlagskalkulation.
        </div>
      </div>

      {/* Verteilungsschlüssel verwalten */}
      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Verteilungstabellen (Schlüssel) — manuell oder automatisch</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {schluesselListe.map((s) => (
            <button key={s.id} onClick={() => setEditSchluessel(editSchluessel === s.id ? null : s.id)} style={{ padding: '6px 11px', borderRadius: 999, fontSize: 12.5, cursor: 'pointer',
              border: `1px solid ${editSchluessel === s.id ? 'var(--accent)' : 'var(--line)'}`, background: editSchluessel === s.id ? 'var(--accent-soft)' : 'var(--panel)' }}>
              {s.name} <span style={{ color: 'var(--muted)' }}>{s.art === 'manuell' ? '· manuell %' : '· automatisch'}</span>
            </button>
          ))}
        </div>
        {editSchluessel && (() => {
          const s = schluessel(editSchluessel); const g = gewichte(s)
          const werte = s.art === 'manuell' ? s.gewichte : s.mengen
          return (
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{s.name} <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: 12 }}>{s.art === 'manuell' ? 'Gewichte direkt setzen' : `Bezugsmengen (${s.bezug}) → Gewichte automatisch`}</span></div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {BEREICHE.map((be) => (
                  <label key={be.id} style={{ fontSize: 11, color: 'var(--muted)' }}>{be.name}<br />
                    <input type="number" value={werte?.[be.id] ?? ''} onChange={(e) => aendereMenge(s.id, be.id, e.target.value)}
                      style={{ marginTop: 3, width: 90, padding: '5px 7px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', fontSize: 12.5 }} />
                    <div className="mono" style={{ fontSize: 10, color: 'var(--accent)', marginTop: 2 }}>{((g[be.id] || 0) * 100).toFixed(1)} %</div>
                  </label>
                ))}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
