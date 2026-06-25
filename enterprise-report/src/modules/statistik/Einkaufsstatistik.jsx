// =========================================================================
//  EINKAUFSSTATISTIK — Beschaffungsüberblick: Volumen nach Lieferant &
//  Warengruppe, ABC-Analyse, Liefertreue/Qualität, Bestellungen, Konditionen.
// =========================================================================
import React, { useState } from 'react'
import { lieferanten, warengruppen, abcAnalyse, kennzahlen } from '../../core/einkaufsstatistik.js'
import { faktor, datumsartInfo, filterLabel } from '../../core/statistikFilter.js'
import StatistikFilter, { ladeFilter, speichereFilter } from './StatistikFilter.jsx'
import { useGlobalFilter } from '../../core/filterKontext.jsx'
import ExportButton from '../../components/ExportButton.jsx'
import ExecKopf, { ampelVon } from '../../components/ExecKopf.jsx'
import { AmpelPunkt } from '../../components/ui.jsx'
import { datenstandText } from '../../core/datenstand.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const th = { padding: '8px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', color: 'var(--muted)', whiteSpace: 'nowrap' }
const td = { padding: '8px 12px', fontSize: 13 }
const AMP = { g: 'var(--amp-g)', a: 'var(--amp-a)', r: 'var(--amp-r)' }
const ABC = { A: 'var(--accent)', B: 'var(--amp-a)', C: 'var(--muted)' }
const mio = (n) => (n / 1e6).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Mio €'
const eur = (n) => Math.round(n).toLocaleString('de-DE') + ' €'
const Wachs = ({ v }) => <span style={{ color: v >= 0 ? 'var(--amp-r)' : 'var(--amp-g)', fontWeight: 600 }}>{v >= 0 ? '▲' : '▼'} {Math.abs(v)} %</span>

export default function Einkaufsstatistik() {
  const g = useGlobalFilter()
  const [datumsart, setDatumsart] = useState(() => ladeFilter('einkauf', 'wareneingang').datumsart)
  const setD = (d) => { setDatumsart(d); speichereFilter('einkauf', { datumsart: d }) }
  const f = { zeitraum: g.zeitraum, pc: g.pc, datumsart }
  const dat = datumsartInfo('einkauf', datumsart)
  const fk = faktor(f.zeitraum, f.pc, dat)
  const k = kennzahlen(fk); const lf = lieferanten(fk); const wg = warengruppen(fk); const abc = abcAnalyse(fk)
  // Exec-Kopf: Lage aus Ø Liefertreue, Empfehlung aus Klumpenrisiko / schwächstem Lieferanten.
  const lfNachTreue = [...lf].sort((a, b) => a.liefertreue - b.liefertreue)
  const schwach = lfNachTreue[0]
  const execStatus = ampelVon(k.liefertreue, { gut: 92, schlecht: 88 })
  const execAussage = `Einkaufsvolumen ${mio(k.volumen)} bei ${k.wachstumPct >= 0 ? '+' : ''}${k.wachstumPct} % zum Vorjahr · Ø Liefertreue ${k.liefertreue} % · ${k.bestellungen.toLocaleString('de-DE')} Bestellungen.`
  const execEmpf = k.klumpenPct > 25
    ? `Klumpenrisiko: „${k.topLieferant}" bündelt ${k.klumpenPct} % des Volumens — Zweitquelle aufbauen.${schwach ? ` Zudem „${schwach.name}" mit nur ${schwach.liefertreue} % Liefertreue nachverhandeln.` : ''}`
    : schwach
      ? `„${schwach.name}" liefert mit nur ${schwach.liefertreue} % Liefertreue am schwächsten — Konditionen/Qualität nachverhandeln. Skonto-Potenzial ${eur(k.skontoPotenzial)} konsequent ziehen.`
      : `Skonto-Potenzial ${eur(k.skontoPotenzial)} konsequent ziehen.`
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={cap}>Einkauf · Beschaffungsüberblick</div>
          <h2 style={{ margin: '4px 0 0' }}>Einkaufsstatistik</h2>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>📅 {datenstandText()} · 🗓 Periode nach <b>{dat.name}</b> · {filterLabel(f.zeitraum, f.pc)} · vs. Vorjahr</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ExportButton filename="Einkaufsstatistik" rows={[['Lieferant', 'Warengruppe', 'Volumen (€)', 'Anteil %', 'vs VJ %', 'Liefertreue %', 'Qualität %', 'Zahlungsziel (Tage)', 'Skonto %', 'Bestellungen'], ...lf.map((l) => [l.name, l.warengruppe, Math.round(l.volumen), l.anteilPct, l.wachstumPct, l.liefertreue, l.qualitaet, l.zahlungsziel, l.skonto, l.bestellungen])]} />
          <button className="no-print" onClick={() => window.print()} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>🖨 Drucken / PDF</button>
        </div>
      </div>
      <StatistikFilter bereich="einkauf" datumsart={datumsart} onDatumsart={setD} />

      <ExecKopf status={execStatus} kennzahl={mio(k.volumen)} kennzahlLabel="Einkaufsvolumen" kernaussage={execAussage} empfehlung={execEmpf} />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {[['Einkaufsvolumen', mio(k.volumen)], ['vs. Vorjahr', (k.wachstumPct >= 0 ? '+' : '') + k.wachstumPct + ' %'], ['Bestellungen', k.bestellungen.toLocaleString('de-DE')], ['Ø Bestellwert', eur(k.avgBestellwert)], ['Ø Liefertreue', k.liefertreue + ' %', k.liefertreue >= 92 ? 'var(--amp-g)' : 'var(--amp-a)'], ['Skonto-Potenzial', eur(k.skontoPotenzial), 'var(--amp-g)']].map(([l, v, c]) => (
          <div key={l} style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 140, borderTop: `3px solid ${c || 'var(--accent)'}` }}>
            <div style={{ ...cap, marginBottom: 3 }}>{l}</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: c || 'var(--ink)' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Klumpenrisiko-Hinweis */}
      <div style={{ ...card, padding: '10px 14px', marginBottom: 14, borderLeft: `3px solid ${k.klumpenPct > 25 ? 'var(--amp-a)' : 'var(--amp-g)'}`, fontSize: 12.5 }}>
        <b>Lieferantenstruktur:</b> Top-Lieferant „{k.topLieferant}" = {k.klumpenPct} % des Volumens{k.klumpenPct > 25 ? ' — Klumpenrisiko, Zweitquelle prüfen.' : ' — kein kritisches Klumpenrisiko.'} {k.risikoLieferanten} Lieferant(en) mit schwacher Liefertreue/Qualität.
      </div>

      {/* Lieferanten */}
      <div style={{ ...card, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ ...cap, padding: '12px 14px 0' }}>Top-Lieferanten nach Volumen</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--line)' }}>
              <th style={{ ...th, textAlign: 'left' }}>Lieferant</th><th style={{ ...th, textAlign: 'left' }}>Warengruppe</th><th style={{ ...th, textAlign: 'right' }}>Volumen</th><th style={{ ...th, textAlign: 'right' }}>Anteil</th><th style={{ ...th, textAlign: 'right' }}>vs. VJ</th><th style={{ ...th, textAlign: 'right' }}>Liefertreue</th><th style={{ ...th, textAlign: 'right' }}>Konditionen</th>
            </tr></thead>
            <tbody>
              {lf.map((l) => (
                <tr key={l.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ ...td, fontWeight: 600 }}><span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: 7 }}><AmpelPunkt status={l.risiko} size={12} /></span>{l.name}</td>
                  <td style={{ ...td, color: 'var(--muted)' }}>{l.warengruppe}</td>
                  <td style={{ ...td, textAlign: 'right' }} className="mono">{mio(l.volumen)}</td>
                  <td style={{ ...td, textAlign: 'right' }} className="mono">{l.anteilPct} %</td>
                  <td style={{ ...td, textAlign: 'right' }}><Wachs v={l.wachstumPct} /></td>
                  <td style={{ ...td, textAlign: 'right' }} className="mono" >{l.liefertreue} % <span style={{ color: 'var(--muted)' }}>/ Q {l.qualitaet}</span></td>
                  <td style={{ ...td, textAlign: 'right', fontSize: 12 }} className="mono">{l.zahlungsziel} Tg{l.skonto ? ` · ${l.skonto} % Sk.` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 14 }}>
        {/* Warengruppen */}
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ ...cap, padding: '12px 14px 6px' }}>Volumen nach Warengruppe</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {wg.map((g) => (
                <tr key={g.name} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ ...td }}><div style={{ fontWeight: 600 }}>{g.name}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{g.lieferanten} Lief. · {g.bestellungen.toLocaleString('de-DE')} Best.</div></td>
                  <td style={{ ...td, textAlign: 'right' }} className="mono">{mio(g.volumen)}</td>
                  <td style={{ ...td, textAlign: 'right', width: 52 }} className="mono">{g.anteilPct} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* ABC */}
        <div style={{ ...card, padding: 14 }}>
          <div style={{ ...cap, marginBottom: 10 }}>ABC-Analyse (Pareto)</div>
          <div style={{ display: 'flex', height: 18, borderRadius: 999, overflow: 'hidden', marginBottom: 12 }}>
            {abc.klassen.map((c) => c.anteilPct > 0 && <div key={c.klasse} title={`${c.klasse}: ${c.anteilPct} %`} style={{ width: c.anteilPct + '%', background: ABC[c.klasse] }} />)}
          </div>
          {abc.klassen.map((c) => (
            <div key={c.klasse} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, padding: '4px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: ABC[c.klasse], color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12 }}>{c.klasse}</span>
              <span style={{ flex: 1 }}>{c.anzahl} Lieferant(en)</span>
              <span className="mono">{mio(c.volumen)}</span>
              <span className="mono" style={{ width: 48, textAlign: 'right', color: 'var(--muted)' }}>{c.anteilPct} %</span>
            </div>
          ))}
          <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 8 }}>A = bis 80 % kumuliertes Volumen, B = bis 95 %, C = Rest. A-Lieferanten strategisch steuern.</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '14px 0 20px' }}>Demo-Daten (Mock). Bei vs.-Vorjahr ist beim Einkauf ein Anstieg (▲) kostenseitig rot markiert.</div>
    </div>
  )
}
