// =========================================================================
//  VERKAUFSSTATISTIK — schneller Verkaufsüberblick: KPI-Band, Umsatz nach
//  Warengruppe (mit VJ & DB), Top-Artikel, Vertriebskanal, Monatsverlauf.
// =========================================================================
import React, { useState } from 'react'
import { warengruppen, topArtikel, verlauf, kennzahlen } from '../../core/verkaufsstatistik.js'
import { monateVon, faktor, pcFaktor, datumsartInfo, filterLabel, pcBaum } from '../../core/statistikFilter.js'
import StatistikFilter, { ladeFilter, speichereFilter } from './StatistikFilter.jsx'
import { datenstandText } from '../../core/datenstand.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const th = { padding: '8px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', color: 'var(--muted)', whiteSpace: 'nowrap' }
const td = { padding: '8px 12px', fontSize: 13 }
const mio = (n) => (n / 1e6).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Mio €'
const eur = (n) => Math.round(n).toLocaleString('de-DE') + ' €'
const stk = (n) => Math.round(n).toLocaleString('de-DE')
const Wachs = ({ v }) => <span style={{ color: v >= 0 ? 'var(--amp-g)' : 'var(--amp-r)', fontWeight: 600 }}>{v >= 0 ? '▲' : '▼'} {Math.abs(v)} %</span>

const ACC_BAR = 'linear-gradient(180deg, var(--accent), color-mix(in srgb, var(--accent) 42%, transparent))'
const ACC_PEAK = 'linear-gradient(180deg, color-mix(in srgb, var(--accent) 80%, #000), var(--accent))'

function Verlauf({ daten }) {
  const H = 132
  const max = Math.max(...daten.flatMap((d) => [d.ist, d.vorjahr])) || 1
  const peak = Math.max(...daten.map((d) => d.ist))
  const gl = [0.25, 0.5, 0.75]
  return (
    <div style={{ position: 'relative', paddingLeft: 4 }}>
      <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>max {mio(max)}</div>
      {/* Gitterlinien */}
      <div style={{ position: 'absolute', left: 4, right: 0, top: 16, height: H, pointerEvents: 'none' }}>
        {gl.map((g) => <div key={g} style={{ position: 'absolute', left: 0, right: 0, bottom: g * H, borderTop: '1px dashed var(--line)', opacity: 0.6 }} />)}
      </div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 8, height: H, borderBottom: '1px solid var(--line)' }}>
        {daten.map((d) => {
          const istH = Math.max(2, d.ist / max * H)
          const vjH = Math.max(2, d.vorjahr / max * H)
          const isPeak = d.ist === peak && d.ist > 0
          return (
            <div key={d.monat} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3, height: H, minWidth: 0 }}>
              <div title={'Vorjahr ' + mio(d.vorjahr)} style={{ width: '38%', maxWidth: 13, height: vjH, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '3px 3px 0 0' }} />
              <div title={'Ist ' + mio(d.ist)} style={{ position: 'relative', width: '38%', maxWidth: 13, height: istH, borderRadius: '3px 3px 0 0', background: isPeak ? ACC_PEAK : ACC_BAR, boxShadow: isPeak ? '0 0 0 1.5px color-mix(in srgb, var(--accent) 35%, transparent)' : 'none' }}>
                {isPeak && <span className="mono" style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 3, fontSize: 9.5, fontWeight: 700, color: 'var(--accent)', whiteSpace: 'nowrap' }}>{(d.ist / 1e6).toLocaleString('de-DE', { maximumFractionDigits: 1 })}</span>}
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 5 }}>
        {daten.map((d) => <div key={d.monat} style={{ flex: 1, textAlign: 'center', fontSize: 9.5, color: 'var(--muted)' }}>{d.monat}</div>)}
      </div>
    </div>
  )
}

// Anteil-Zelle: Balken + Prozent (umbruchsicher), für Tabellen.
function AnteilZelle({ pct, w = 56 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
      <div style={{ width: w, height: 8, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: Math.min(100, pct) + '%', height: '100%', background: ACC_BAR, borderRadius: 999 }} />
      </div>
      <span className="mono" style={{ minWidth: 46, textAlign: 'right', whiteSpace: 'nowrap' }}>{pct} %</span>
    </div>
  )
}

export default function Verkaufsstatistik() {
  const [f, setF] = useState(() => ladeFilter('verkauf', 'beleg'))
  const aendern = (v) => { setF(v); speichereFilter('verkauf', v) }
  const dat = datumsartInfo('verkauf', f.datumsart)
  const fk = faktor(f.zeitraum, f.pc, dat)
  const vlFaktor = pcFaktor(f.pc) * dat.mag
  const k = kennzahlen(fk); const wg = warengruppen(fk); const art = topArtikel(7, fk); const vl = verlauf(monateVon(f.zeitraum), vlFaktor)
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={cap}>Vertrieb · Schneller Verkaufsüberblick</div>
          <h2 style={{ margin: '4px 0 0' }}>Verkaufsstatistik</h2>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>📅 {datenstandText()} · 🗓 Periode nach <b>{dat.name}</b> · {filterLabel(f.zeitraum, f.pc)} · vs. Vorjahr</div>
        </div>
        <button className="no-print" onClick={() => window.print()} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>🖨 Drucken / PDF</button>
      </div>
      <StatistikFilter bereich="verkauf" wert={f} onChange={aendern} />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {[['Umsatz', mio(k.umsatz)], ['Wachstum z. Vorjahr', (k.wachstumPct >= 0 ? '+' : '') + k.wachstumPct + ' %', k.wachstumPct >= 0 ? 'var(--amp-g)' : 'var(--amp-r)'], ['Absatzmenge', stk(k.menge) + ' Stk'], ['Ø Auftragswert', eur(k.avgBon)], ['DB-Marge', k.dbProzent + ' %'], ['Online-Anteil', k.onlineAnteilPct + ' %']].map(([l, v, c]) => (
          <div key={l} style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 140, borderTop: `3px solid ${c || 'var(--accent)'}` }}>
            <div style={{ ...cap, marginBottom: 3 }}>{l}</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: c || 'var(--ink)' }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, padding: '12px 14px', marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 8 }}>Umsatzverlauf je Monat — <span style={{ color: 'var(--accent)' }}>■ Ist</span> · <span style={{ color: 'var(--muted)' }}>■ Vorjahr</span></div>
        <Verlauf daten={vl} />
      </div>

      <div style={{ ...card, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ ...cap, padding: '12px 14px 0' }}>Umsatz nach Warengruppe</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--line)' }}>
              <th style={{ ...th, textAlign: 'left' }}>Warengruppe</th><th style={{ ...th, textAlign: 'right' }}>Umsatz</th><th style={{ ...th, textAlign: 'right' }}>Anteil</th><th style={{ ...th, textAlign: 'right' }}>Menge</th><th style={{ ...th, textAlign: 'right' }}>Ø Preis</th><th style={{ ...th, textAlign: 'right' }}>vs. VJ</th><th style={{ ...th, textAlign: 'right' }}>DB %</th>
            </tr></thead>
            <tbody>
              {wg.map((w) => (
                <tr key={w.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ ...td, fontWeight: 600 }}>{w.name}</td>
                  <td style={{ ...td, textAlign: 'right' }} className="mono">{mio(w.umsatz)}</td>
                  <td style={{ ...td, textAlign: 'right' }}><AnteilZelle pct={w.anteilPct} /></td>
                  <td style={{ ...td, textAlign: 'right' }} className="mono">{stk(w.menge)}</td>
                  <td style={{ ...td, textAlign: 'right' }} className="mono">{eur(w.avgPreis)}</td>
                  <td style={{ ...td, textAlign: 'right' }}><Wachs v={w.wachstumPct} /></td>
                  <td style={{ ...td, textAlign: 'right' }} className="mono">{w.dbProzent} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 14 }}>
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ ...cap, padding: '12px 14px 6px' }}>Top-Artikel nach Umsatz</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {art.map((a, i) => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ ...td, width: 22, color: 'var(--muted)' }} className="mono">{i + 1}</td>
                  <td style={{ ...td }}><div style={{ fontWeight: 600 }}>{a.name}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{a.gruppe} · {stk(a.menge)} Stk · Ø {eur(a.avgPreis)}</div></td>
                  <td style={{ ...td, textAlign: 'right' }} className="mono">{mio(a.umsatz)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ ...cap, padding: '12px 14px 6px' }}>Profit-Center · Geschäftsbereich & Kanal</div>
          {pcBaum().filter((g) => g.id === 'geschaeftsbereich' || g.id === 'kanal').map((g) => (
            <div key={g.id}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', padding: '8px 14px 2px', textTransform: 'uppercase', letterSpacing: '.03em' }}>{g.id === 'kanal' ? 'Vertriebskanal' : 'Geschäftsbereich'}</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {g.knoten.map((kn) => (
                    <tr key={kn.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ ...td }}>{kn.name}</td>
                      <td style={{ ...td, textAlign: 'right' }} className="mono">{mio(k.umsatz * kn.faktor)}</td>
                      <td style={{ ...td, textAlign: 'right' }}><AnteilZelle pct={Math.round(kn.faktor * 1000) / 10} w={44} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <div style={{ fontSize: 10.5, color: 'var(--muted)', padding: '8px 14px 12px' }}>Kanäle sind Teil des Profit-Center-Baums — derselbe Filter oben deckt beide Sichten ab.</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '14px 0 20px' }}>Demo-Daten (Mock). Umsatz netto; DB-Marge = Deckungsbeitrag I.</div>
    </div>
  )
}
