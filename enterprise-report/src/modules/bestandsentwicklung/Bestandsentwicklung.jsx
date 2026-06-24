// =========================================================================
//  BESTANDSENTWICKLUNG — Verlauf je Warenbereich, Reichweite, Zielbestand &
//  Frist; KI-Maßnahmen zur Gegensteuerung (per Klick als Maßnahme übernehmbar).
// =========================================================================
import React, { useState } from 'react'
import { MONATE, warenbereiche, gesamt, massnahmenFuer } from '../../core/bestandsentwicklung.js'
import { addMassnahme, ladeMassnahmen } from '../../core/massnahmen.js'
import { datenstandText } from '../../core/datenstand.js'
import ExecKopf, { ampelVon } from '../../components/ExecKopf.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const AMP = { g: 'var(--amp-g)', a: 'var(--amp-a)', r: 'var(--amp-r)' }
const mio = (n) => (n / 1e6).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Mio €'
const teur = (n) => Math.round(n / 1000).toLocaleString('de-DE') + ' T€'

function Spark({ reihe, w = 150, h = 38 }) {
  const min = Math.min(...reihe), max = Math.max(...reihe), sp = max - min || 1
  const x = (i) => i / (reihe.length - 1) * (w - 4) + 2
  const y = (v) => h - 3 - (v - min) / sp * (h - 6)
  const d = reihe.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const fallend = reihe[reihe.length - 1] <= reihe[0]
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: w, height: h }}>
      <path d={d} fill="none" stroke={fallend ? 'var(--amp-g)' : 'var(--amp-r)'} strokeWidth="2" />
      <circle cx={x(reihe.length - 1)} cy={y(reihe[reihe.length - 1])} r="2.5" fill={fallend ? 'var(--amp-g)' : 'var(--amp-r)'} />
    </svg>
  )
}

export default function Bestandsentwicklung() {
  const [, setTick] = useState(0)
  const wb = warenbereiche(); const g = gesamt()
  const massn = ladeMassnahmen()
  const hat = (titel) => massn.some((m) => m.titel === titel)
  const uebernehmen = (m, bereich) => { addMassnahme({ titel: m.titel, owner: 'Disposition', quelle: 'bestandsentwicklung', bereich, hebel: m.hebel, relevanz: m.erwartet }); setTick((t) => t + 1) }

  // Exec-Kopf: Lage aus Anzahl kritischer Warenbereiche, Empfehlung aus Trend-Richtung des Gesamtbestands.
  const trendGesamt = wb.reduce((n, x) => n + (x.trend || 0), 0)   // < 0 = Bestand fällt (gut)
  const startGesamt = wb.reduce((n, x) => n + (x.verlauf?.[0] || 0), 0)
  const trendPct = startGesamt ? Math.round(trendGesamt / startGesamt * 1000) / 10 : 0
  const execStatus = ampelVon(g.kritisch, { gut: 0, schlecht: 2, invert: true })
  const execAussage = `Gesamtbestand ${mio(g.bestand)} bei ${trendGesamt <= 0 ? '' : '+'}${trendPct} % seit ${MONATE[0]} · Überbestand ${mio(g.ueberbestand)} · ${g.kritisch} kritische${g.kritisch === 1 ? 'r' : ''} Warenbereich${g.kritisch === 1 ? '' : 'e'}.`
  const execEmpf = trendGesamt <= 0
    ? (g.kritisch > 0
      ? `Bestand sinkt, aber ${g.kritisch} Warenbereich${g.kritisch === 1 ? ' verfehlt' : 'e verfehlen'} die Frist — dort Abverkauf forcieren und Nachbestellungen kürzen (Überbestand ${mio(g.ueberbestand)}).`
      : `Abbau-Trend (${trendPct} %) auf Kurs — Bestellmengen weiter an der Reichweite ausrichten und Ziele halten.`)
    : `Bestand steigt (+${trendPct} %) trotz Zielvorgaben — Bestellstopp prüfen und Überbestand ${mio(g.ueberbestand)} aktiv abbauen.`

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={cap}>Bestand · Entwicklung & Gegensteuerung</div>
          <h2 style={{ margin: '4px 0 0' }}>Lagerbestandsentwicklung</h2>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>📅 {datenstandText()} · Verlauf {MONATE[0]}–{MONATE[MONATE.length - 1]}</div>
        </div>
        <button className="no-print" onClick={() => window.print()} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>🖨 Drucken / PDF</button>
      </div>

      <ExecKopf status={execStatus} kennzahl={mio(g.bestand)} kennzahlLabel="Gesamtbestand" kernaussage={execAussage} empfehlung={execEmpf} />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {[['Gesamtbestand', mio(g.bestand)], ['Überbestand (über Ziel)', mio(g.ueberbestand), '#f59e0b'], ['Ø Reichweite', g.oReichweite + ' Tage'], ['Kritische Warenbereiche', g.kritisch, g.kritisch ? 'var(--amp-r)' : 'var(--amp-g)']].map(([l, v, c]) => (
          <div key={l} style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 150, borderTop: `3px solid ${c || 'var(--accent)'}` }}>
            <div style={{ ...cap, marginBottom: 3 }}>{l}</div>
            <div className="mono" style={{ fontSize: 19, fontWeight: 700, color: c || 'var(--ink)' }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {wb.map((w) => {
          const p = w.prognose; const ms = massnahmenFuer(w)
          const status = p.typ === 'unter' ? 'r' : !p.erreicht ? 'r' : w.reichweiteStatus
          const prognoseTxt = p.typ === 'unter' ? `Unterbestand – Nachbestellung um ${teur(p.luecke)} nötig`
            : p.erreicht ? `Ziel ${teur(w.ziel)} in ${w.fristMonate} Mon. erreichbar`
              : `Frist verfehlt – Abverkauf +${Math.round(p.mehrBedarfPct)} % nötig (Ziel ${teur(w.ziel)} in ${w.fristMonate} Mon.)`
          return (
            <div key={w.id} style={{ ...card, padding: 16, borderLeft: `3px solid ${AMP[status]}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{w.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>Bestand <b className="mono">{mio(w.aktuell)}</b> · Ziel <b className="mono">{teur(w.ziel)}</b></div>
                  </div>
                  <Spark reihe={w.verlauf} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: AMP[w.reichweiteStatus] }}>{w.reichweiteTage} Tg</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Reichweite (DIO)</div>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: AMP[status], marginTop: 8 }}>
                {status === 'r' ? '⚠ ' : '✓ '}{prognoseTxt}
              </div>
              {ms.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ ...cap, marginBottom: 6 }}>🤖 KI-Maßnahmen zur Gegensteuerung</div>
                  {ms.map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#fff', background: m.prio === 'hoch' ? 'var(--amp-r)' : m.prio === 'mittel' ? 'var(--amp-a)' : 'var(--muted)', borderRadius: 999, padding: '1px 7px' }}>{m.prio}</span>
                      <span style={{ flex: 1 }}>{m.titel} <span style={{ color: 'var(--muted)', fontSize: 11.5 }}>· {m.hebel} · {m.erwartet}</span></span>
                      {hat(m.titel)
                        ? <span style={{ fontSize: 12, color: 'var(--amp-g)' }}>✓ übernommen</span>
                        : <button onClick={() => uebernehmen(m, w.name)} style={{ fontSize: 11.5, cursor: 'pointer', border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--panel)', borderRadius: 999, padding: '2px 10px', fontWeight: 600 }}>→ als Maßnahme</button>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '14px 0 20px' }}>Reichweite (DIO) = Bestandswert ÷ Monatsabgang × 30. Demo-Daten (Mock).</div>
    </div>
  )
}
