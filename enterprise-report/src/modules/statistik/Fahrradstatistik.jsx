// =========================================================================
//  FAHRRADSTATISTIK — verkaufte Räder nach Kategorie, Antriebsart (E-Bike vs.
//  Bio), Preisklasse und Ø-Verkaufspreis/Marge mit Vorjahresvergleich.
// =========================================================================
import React, { useState } from 'react'
import { kategorien, antrieb, preisklassen, kennzahlen } from '../../core/fahrradstatistik.js'
import { faktor, datumsartInfo, filterLabel } from '../../core/statistikFilter.js'
import StatistikFilter, { ladeFilter, speichereFilter } from './StatistikFilter.jsx'
import { BalkenChart } from '../../components/charts.jsx'
import ExportButton from '../../components/ExportButton.jsx'
import { datenstandText } from '../../core/datenstand.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const th = { padding: '8px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', color: 'var(--muted)', whiteSpace: 'nowrap' }
const td = { padding: '8px 12px', fontSize: 13 }
const mio = (n) => (n / 1e6).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Mio €'
const eur = (n) => Math.round(n).toLocaleString('de-DE') + ' €'
const stk = (n) => Math.round(n).toLocaleString('de-DE')
const Wachs = ({ v }) => <span style={{ color: v >= 0 ? 'var(--amp-g)' : 'var(--amp-r)', fontWeight: 600 }}>{v >= 0 ? '▲' : '▼'} {Math.abs(v)} %</span>

export default function Fahrradstatistik() {
  const [f, setF] = useState(() => ladeFilter('fahrrad', 'beleg'))
  const aendern = (v) => { setF(v); speichereFilter('fahrrad', v) }
  const dat = datumsartInfo('verkauf', f.datumsart)
  const fk = faktor(f.zeitraum, f.pc, dat)
  const k = kennzahlen(fk); const kat = kategorien(fk); const a = antrieb(fk); const pk = preisklassen(fk)
  const maxKat = Math.max(...kat.map((x) => x.stueck))
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={cap}>Vertrieb · Komplette Räder</div>
          <h2 style={{ margin: '4px 0 0' }}>Fahrradstatistik</h2>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>📅 {datenstandText()} · 🗓 Periode nach <b>{dat.name}</b> · {filterLabel(f.zeitraum, f.pc)} · nur Kompletträder</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ExportButton filename="Fahrradstatistik" rows={[['Kategorie', 'Antrieb', 'Räder', 'Anteil %', 'Umsatz (€)', 'Ø Preis (€)', 'Marge %', 'vs VJ %'], ...kat.map((c) => [c.name, c.eBike ? 'E-Bike' : 'Bio', c.stueck, c.anteilPct, Math.round(c.umsatz), c.avgPreis, c.marge, c.wachstumPct])]} />
          <button className="no-print" onClick={() => window.print()} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>🖨 Drucken / PDF</button>
        </div>
      </div>
      <StatistikFilter bereich="verkauf" wert={f} onChange={aendern} />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {[['Verkaufte Räder', stk(k.stueck) + ' Stk'], ['Wachstum z. Vorjahr', (k.wachstumPct >= 0 ? '+' : '') + k.wachstumPct + ' %', k.wachstumPct >= 0 ? 'var(--amp-g)' : 'var(--amp-r)'], ['Umsatz', mio(k.umsatz)], ['Ø Verkaufspreis', eur(k.avgPreis)], ['E-Bike-Anteil', k.eBikeAnteilPct + ' %', 'var(--accent)'], ['Ø Marge', k.margeProzent + ' %']].map(([l, v, c]) => (
          <div key={l} style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 140, borderTop: `3px solid ${c || 'var(--accent)'}` }}>
            <div style={{ ...cap, marginBottom: 3 }}>{l}</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: c || 'var(--ink)' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Antriebsart-Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {[['🔋 E-Bike', a.eBike, 'var(--accent)'], ['🚲 Ohne Motor (Bio)', a.bio, 'var(--muted)']].map(([l, d, c]) => (
          <div key={l} style={{ ...card, padding: 14, borderTop: `3px solid ${c}` }}>
            <div style={{ ...cap }}>{l}</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, margin: '4px 0' }}>{d.anteilPct} %</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{stk(d.stueck)} Räder · {mio(d.umsatz)} · Ø {eur(d.avgPreis)} · <Wachs v={d.wachstumPct} /></div>
          </div>
        ))}
      </div>

      {/* Kategorien */}
      <div style={{ ...card, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ ...cap, padding: '12px 14px 0' }}>Verkaufte Räder nach Kategorie</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--line)' }}>
              <th style={{ ...th, textAlign: 'left' }}>Kategorie</th><th style={{ ...th, textAlign: 'right' }}>Räder</th><th style={{ ...th, textAlign: 'left' }}>Anteil</th><th style={{ ...th, textAlign: 'right' }}>Umsatz</th><th style={{ ...th, textAlign: 'right' }}>Ø Preis</th><th style={{ ...th, textAlign: 'right' }}>Marge</th><th style={{ ...th, textAlign: 'right' }}>vs. VJ</th>
            </tr></thead>
            <tbody>
              {kat.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ ...td, fontWeight: 600 }}>{c.eBike ? '🔋 ' : ''}{c.name}</td>
                  <td style={{ ...td, textAlign: 'right' }} className="mono">{stk(c.stueck)}</td>
                  <td style={{ ...td, minWidth: 120 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 8, background: 'var(--line)', borderRadius: 999, overflow: 'hidden' }}><div style={{ width: c.stueck / maxKat * 100 + '%', height: '100%', background: c.eBike ? 'var(--accent)' : 'var(--muted)' }} /></div>
                      <span className="mono" style={{ width: 38, textAlign: 'right', fontSize: 12 }}>{c.anteilPct} %</span>
                    </div>
                  </td>
                  <td style={{ ...td, textAlign: 'right' }} className="mono">{mio(c.umsatz)}</td>
                  <td style={{ ...td, textAlign: 'right' }} className="mono">{eur(c.avgPreis)}</td>
                  <td style={{ ...td, textAlign: 'right' }} className="mono">{c.marge} %</td>
                  <td style={{ ...td, textAlign: 'right' }}><Wachs v={c.wachstumPct} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preisklassen */}
      <div style={{ ...card, padding: 14 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Verteilung nach Preisklasse</div>
        <BalkenChart daten={pk.map((p) => ({ label: p.name, wert: p.stueck, sub: p.anteilPct + ' %' }))} fmt={stk} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '14px 0 20px' }}>Demo-Daten (Mock). „Bio" = Fahrrad ohne elektrischen Antrieb.</div>
    </div>
  )
}
