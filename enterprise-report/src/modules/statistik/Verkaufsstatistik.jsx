// =========================================================================
//  VERKAUFSSTATISTIK — schneller Verkaufsüberblick: KPI-Band, Umsatz nach
//  Warengruppe (mit VJ & DB), Top-Artikel, Vertriebskanal, Monatsverlauf.
// =========================================================================
import React from 'react'
import { warengruppen, topArtikel, kanaele, verlauf, kennzahlen } from '../../core/verkaufsstatistik.js'
import { datenstandText } from '../../core/datenstand.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const th = { padding: '8px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', color: 'var(--muted)', whiteSpace: 'nowrap' }
const td = { padding: '8px 12px', fontSize: 13 }
const mio = (n) => (n / 1e6).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Mio €'
const eur = (n) => Math.round(n).toLocaleString('de-DE') + ' €'
const stk = (n) => Math.round(n).toLocaleString('de-DE')
const Wachs = ({ v }) => <span style={{ color: v >= 0 ? 'var(--amp-g)' : 'var(--amp-r)', fontWeight: 600 }}>{v >= 0 ? '▲' : '▼'} {Math.abs(v)} %</span>

function Verlauf({ daten }) {
  const max = Math.max(...daten.flatMap((d) => [d.ist, d.vorjahr]))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 110, padding: '0 4px' }}>
      {daten.map((d) => (
        <div key={d.monat} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 90, width: '100%', justifyContent: 'center' }}>
            <div title={'Vorjahr ' + mio(d.vorjahr)} style={{ width: 7, height: d.vorjahr / max * 90, background: 'var(--line)', borderRadius: '2px 2px 0 0' }} />
            <div title={'Ist ' + mio(d.ist)} style={{ width: 7, height: d.ist / max * 90, background: 'var(--accent)', borderRadius: '2px 2px 0 0' }} />
          </div>
          <div style={{ fontSize: 9.5, color: 'var(--muted)' }}>{d.monat}</div>
        </div>
      ))}
    </div>
  )
}

export default function Verkaufsstatistik() {
  const k = kennzahlen(); const wg = warengruppen(); const art = topArtikel(); const kan = kanaele(); const vl = verlauf()
  return (
    <div style={{ maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={cap}>Vertrieb · Schneller Verkaufsüberblick</div>
          <h2 style={{ margin: '4px 0 0' }}>Verkaufsstatistik</h2>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>📅 {datenstandText()} · laufendes Jahr vs. Vorjahr</div>
        </div>
        <button className="no-print" onClick={() => window.print()} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>🖨 Drucken / PDF</button>
      </div>

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
                  <td style={{ ...td, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                      <div style={{ width: 50, height: 6, background: 'var(--line)', borderRadius: 999, overflow: 'hidden' }}><div style={{ width: w.anteilPct + '%', height: '100%', background: 'var(--accent)' }} /></div>
                      <span className="mono" style={{ width: 38, textAlign: 'right' }}>{w.anteilPct} %</span>
                    </div>
                  </td>
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
          <div style={{ ...cap, padding: '12px 14px 6px' }}>Vertriebskanäle</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {kan.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ ...td }}><div style={{ fontWeight: 600 }}>{c.name}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{stk(c.auftraege)} Aufträge · Ø Bon {eur(c.avgBon)}</div></td>
                  <td style={{ ...td, textAlign: 'right' }} className="mono">{mio(c.umsatz)}<div style={{ fontSize: 11 }}><Wachs v={c.wachstumPct} /></div></td>
                  <td style={{ ...td, textAlign: 'right', width: 52 }} className="mono">{c.anteilPct} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '14px 0 20px' }}>Demo-Daten (Mock). Umsatz netto; DB-Marge = Deckungsbeitrag I.</div>
    </div>
  )
}
