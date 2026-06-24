// =========================================================================
//  PRODUKTIONSSTATISTIK — Output je Produkt & Werk, Monatsverlauf, Ausschuss/
//  FPY und Stückkosten. Kompakte Statistik aus dem Produktionscontrolling.
// =========================================================================
import React, { useState } from 'react'
import { produkte, monatsOutput, werke, kennzahlen } from '../../core/produktionsstatistik.js'
import { monateVon, pcFaktor, datumsartInfo, filterLabel } from '../../core/statistikFilter.js'
import StatistikFilter, { ladeFilter, speichereFilter } from './StatistikFilter.jsx'
import { useGlobalFilter } from '../../core/filterKontext.jsx'
import { BalkenChart } from '../../components/charts.jsx'
import ExportButton from '../../components/ExportButton.jsx'
import ExecKopf, { ampelVon } from '../../components/ExecKopf.jsx'
import { datenstandText } from '../../core/datenstand.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const th = { padding: '8px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', color: 'var(--muted)', whiteSpace: 'nowrap' }
const td = { padding: '8px 12px', fontSize: 13 }
const mio = (n) => (n / 1e6).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Mio €'
const stk = (n) => Math.round(n).toLocaleString('de-DE')
const ampAus = (v) => v <= 2 ? 'var(--amp-g)' : v <= 3.5 ? 'var(--amp-a)' : 'var(--amp-r)'
const Trend = ({ v }) => <span style={{ color: v >= 0 ? 'var(--amp-g)' : 'var(--amp-r)', fontWeight: 600 }}>{v >= 0 ? '▲' : '▼'} {Math.abs(v)} %</span>

export default function Produktionsstatistik() {
  const g = useGlobalFilter()
  const [datumsart, setDatumsart] = useState(() => ladeFilter('produktion', 'fertig').datumsart)
  const setD = (d) => { setDatumsart(d); speichereFilter('produktion', { datumsart: d }) }
  const f = { zeitraum: g.zeitraum, pc: g.pc, datumsart }
  const dat = datumsartInfo('produktion', datumsart)
  const opts = { monate: monateVon(f.zeitraum), faktor: pcFaktor(f.pc) * dat.mag, shift: dat.shift }
  const k = kennzahlen(opts); const pr = produkte(opts); const mo = monatsOutput(opts); const wk = werke(opts)
  const leer = k.stueck === 0
  // Exec-Kopf: Lage aus Ausschussquote (kleiner ist besser → invert), Empfehlung aus schwächstem Produkt.
  const prNachAusschuss = [...pr].sort((a, b) => b.ausschussPct - a.ausschussPct)
  const schwach = prNachAusschuss[0]
  const execStatus = leer ? 'a' : ampelVon(k.ausschussPct, { gut: 2, schlecht: 3.5, invert: true })
  const execAussage = leer
    ? 'Für den gewählten Zeitraum liegen noch keine Produktions-Ist-Daten vor — bitte ein Halbjahr/Quartal aus H1 wählen.'
    : `Output ${stk(k.stueck)} Stk (Wert ${mio(k.wert)}) · Ø OEE ${k.oee} % · Ausschuss ${k.ausschussPct} % · FPY ${k.fpy} %.`
  const execEmpf = leer
    ? 'Zeitraum mit Ist-Daten (H1) wählen, um Output und Qualität zu bewerten.'
    : schwach
      ? `Höchster Ausschuss bei „${schwach.name}" (${schwach.ausschussPct} %, FPY ${schwach.fpy} %) — Linie priorisiert stabilisieren. Ø OEE ${k.oee} % bietet Auslastungsspielraum.`
      : `Ø OEE ${k.oee} % bietet Auslastungsspielraum — Engpasslinien priorisieren.`
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={cap}>Produktion · Output-Statistik</div>
          <h2 style={{ margin: '4px 0 0' }}>Produktionsstatistik</h2>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>📅 {datenstandText()} · 🗓 Periode nach <b>{dat.name}</b> · {filterLabel(f.zeitraum, f.pc)}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ExportButton filename="Produktionsstatistik" rows={[['Produkt', 'Menge', 'Ø/Monat', 'Trend %', 'Ausschuss %', 'FPY %', 'Stückkosten (€)', 'Wert (€)'], ...pr.map((p) => [p.name, p.summe, p.schnitt, p.trendPct, p.ausschussPct, p.fpy, p.stueckkosten, p.produzierterWert])]} />
          <button className="no-print" onClick={() => window.print()} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>🖨 Drucken / PDF</button>
        </div>
      </div>
      <StatistikFilter bereich="produktion" datumsart={datumsart} onDatumsart={setD} />
      {leer && (
        <div style={{ ...card, padding: '16px 18px', borderLeft: '3px solid var(--amp-a)', marginBottom: 14, fontSize: 13 }}>
          ⚠ Für den gewählten Zeitraum liegen noch keine Produktions-Ist-Daten vor (Output-Historie reicht bis Juni). Bitte ein Halbjahr/Quartal aus H1 wählen.
        </div>
      )}

      <ExecKopf status={execStatus} kennzahl={stk(k.stueck) + ' Stk'} kennzahlLabel="Produzierte Menge" kernaussage={execAussage} empfehlung={execEmpf} />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {[['Produzierte Menge', stk(k.stueck) + ' Stk'], ['Ø / Monat', stk(k.schnittMonat) + ' Stk'], ['Produktionswert', mio(k.wert)], ['Ø OEE', k.oee + ' %', k.oee >= 75 ? 'var(--amp-g)' : 'var(--amp-a)'], ['Ausschuss', k.ausschussPct + ' %', ampAus(k.ausschussPct)], ['Ø First-Pass-Yield', k.fpy + ' %']].map(([l, v, c]) => (
          <div key={l} style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 140, borderTop: `3px solid ${c || 'var(--accent)'}` }}>
            <div style={{ ...cap, marginBottom: 3 }}>{l}</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: c || 'var(--ink)' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Monatsverlauf */}
      {mo.length > 0 && (
        <div style={{ ...card, padding: 14, marginBottom: 14 }}>
          <div style={{ ...cap, marginBottom: 10 }}>Gesamt-Output je Monat (Stück)</div>
          <BalkenChart daten={mo.map((m) => ({ label: m.monat, wert: m.stueck }))} fmt={stk} />
        </div>
      )}

      {/* Produkte */}
      <div style={{ ...card, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ ...cap, padding: '12px 14px 0' }}>Output nach Produkt</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--line)' }}>
              <th style={{ ...th, textAlign: 'left' }}>Produkt</th><th style={{ ...th, textAlign: 'right' }}>Menge</th><th style={{ ...th, textAlign: 'right' }}>Ø / Monat</th><th style={{ ...th, textAlign: 'right' }}>Trend</th><th style={{ ...th, textAlign: 'right' }}>Ausschuss</th><th style={{ ...th, textAlign: 'right' }}>FPY</th><th style={{ ...th, textAlign: 'right' }}>Wert</th>
            </tr></thead>
            <tbody>
              {pr.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ ...td, fontWeight: 600 }}>{p.name}</td>
                  <td style={{ ...td, textAlign: 'right' }} className="mono">{stk(p.summe)}</td>
                  <td style={{ ...td, textAlign: 'right' }} className="mono">{stk(p.schnitt)}</td>
                  <td style={{ ...td, textAlign: 'right' }}><Trend v={p.trendPct} /></td>
                  <td style={{ ...td, textAlign: 'right', color: ampAus(p.ausschussPct), fontWeight: 600 }} className="mono">{p.ausschussPct} %</td>
                  <td style={{ ...td, textAlign: 'right' }} className="mono">{p.fpy} %</td>
                  <td style={{ ...td, textAlign: 'right' }} className="mono">{mio(p.produzierterWert)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Werke */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ ...cap, padding: '12px 14px 6px' }}>Output nach Werk</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {wk.map((w) => (
              <tr key={w.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ ...td }}><div style={{ fontWeight: 600 }}>{w.name}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{w.ort} · OEE {w.oee} % · Auslastung {w.auslastung} %</div></td>
                <td style={{ ...td, textAlign: 'right' }} className="mono">{stk(w.stueck)} Stk</td>
                <td style={{ ...td, textAlign: 'right', width: 110 }} className="mono">{mio(w.wert)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '14px 0 20px' }}>Demo-Daten (Mock). FPY = First-Pass-Yield; Produktionswert = Menge × Stückkosten.</div>
    </div>
  )
}
