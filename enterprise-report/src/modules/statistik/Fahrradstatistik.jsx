// =========================================================================
//  FAHRRADSTATISTIK — verkaufte Räder nach Kategorie, Antriebsart (E-Bike vs.
//  Bio) und Preisklasse, mit Vorjahresvergleich und Margins.
// =========================================================================
import React, { useState } from 'react'
import { kategorien, antrieb, preisklassen, kennzahlen } from '../../core/fahrradstatistik.js'
import { faktor, datumsartInfo, filterLabel } from '../../core/statistikFilter.js'
import StatistikFilter, { ladeFilter, speichereFilter } from './StatistikFilter.jsx'
import { useGlobalFilter } from '../../core/filterKontext.jsx'
import ExportButton from '../../components/ExportButton.jsx'
import ExecKopf, { ampelVon } from '../../components/ExecKopf.jsx'
import { datenstandText } from '../../core/datenstand.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const th = { padding: '8px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', color: 'var(--muted)', whiteSpace: 'nowrap' }
const td = { padding: '8px 12px', fontSize: 13 }
const mio = (n) => (n / 1e6).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Mio €'
const eur = (n) => Math.round(n).toLocaleString('de-DE') + ' €'
const stk = (n) => Math.round(n).toLocaleString('de-DE')
const Wachs = ({ v }) => <span style={{ color: v >= 0 ? 'var(--amp-g)' : 'var(--amp-r)', fontWeight: 600 }}>{v >= 0 ? '▲' : '▼'} {Math.abs(v)} %</span>

const DIMS = [
  { key: 'kategorie', name: 'Kategorie' },
  { key: 'preisklasse', name: 'Preisklasse' },
]

function DimChips({ aktiv, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, color: 'var(--muted)' }}>Dimension:</span>
      {DIMS.map((d) => (
        <button key={d.key} onClick={() => onChange(d.key)} style={{
          fontSize: 12, padding: '4px 10px', borderRadius: 999, cursor: 'pointer', fontWeight: 600,
          border: `1px solid ${aktiv === d.key ? 'var(--accent)' : 'var(--line)'}`,
          background: aktiv === d.key ? 'var(--accent-soft)' : 'var(--panel)',
          color: aktiv === d.key ? 'var(--accent)' : 'var(--muted)'
        }}>{d.name}</button>
      ))}
    </div>
  )
}

export default function Fahrradstatistik() {
  const g = useGlobalFilter()
  const [datumsart, setDatumsart] = useState(() => ladeFilter('fahrrad', 'beleg').datumsart)
  const [dim, setDim] = useState('kategorie')
  const setD = (d) => { setDatumsart(d); speichereFilter('fahrrad', { datumsart: d }) }
  const f = { zeitraum: g.zeitraum, pc: g.pc, datumsart }
  const dat = datumsartInfo('verkauf', datumsart)
  const fk = faktor(f.zeitraum, f.pc, dat)
  const k = kennzahlen(fk); const kat = kategorien(fk); const a = antrieb(fk); const pk = preisklassen(fk)
  const maxKat = Math.max(...kat.map((x) => x.stueck), 1)
  const maxPk = Math.max(...pk.map((x) => x.stueck), 1)
  // Exec-Kopf
  const katNachWachstum = [...kat].sort((a, b) => b.wachstumPct - a.wachstumPct)
  const stark = katNachWachstum[0], schwach = katNachWachstum[katNachWachstum.length - 1]
  const execStatus = ampelVon(k.wachstumPct, { gut: 3, schlecht: 0 })
  const execAussage = `${stk(k.stueck)} Räder (${k.wachstumPct >= 0 ? '+' : ''}${k.wachstumPct} % z. VJ) · Umsatz ${mio(k.umsatz)} · E-Bike-Anteil ${k.eBikeAnteilPct} % · Ø Marge ${k.margeProzent} %.`
  const execEmpf = stark && schwach && stark !== schwach
    ? `${stark.name} wächst am stärksten (▲ ${stark.wachstumPct} %); ${schwach.name} ${schwach.wachstumPct < 0 ? `verliert (▼ ${Math.abs(schwach.wachstumPct)} %)` : `wächst nur ${schwach.wachstumPct} %`} — Sortiment und Bestände dort prüfen. E-Bike-Segment (Ø Preis ${eur(a.eBike.avgPreis)}) als Margenhebel priorisieren.`
    : 'Kategorie-Mix und E-Bike-Hebel in der Tabelle prüfen.'

  const exportRows = dim === 'preisklasse'
    ? [['Preisklasse', 'von (€)', 'bis (€)', 'Räder', 'Anteil %', 'Umsatz (€)', 'Ø Preis (€)'],
        ...pk.map((p) => [p.name, p.von, p.bis, p.stueck, p.anteilPct, Math.round(p.umsatz), p.avgPreis])]
    : [['Kategorie', 'Antrieb', 'Räder', 'Anteil %', 'Umsatz (€)', 'Ø Preis (€)', 'Marge %', 'vs VJ %'],
        ...kat.map((c) => [c.name, c.eBike ? 'E-Bike' : 'Bio', c.stueck, c.anteilPct, Math.round(c.umsatz), c.avgPreis, c.marge, c.wachstumPct])]

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={cap}>Vertrieb · Komplette Räder</div>
          <h2 style={{ margin: '4px 0 0' }}>Fahrradstatistik</h2>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>📅 {datenstandText()} · 🗓 Periode nach <b>{dat.name}</b> · {filterLabel(f.zeitraum, f.pc)} · nur Kompletträder</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ExportButton filename="Fahrradstatistik" rows={exportRows} />
          <button className="no-print" onClick={() => window.print()} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>🖨 Drucken / PDF</button>
        </div>
      </div>
      <StatistikFilter bereich="verkauf" datumsart={datumsart} onDatumsart={setD} />

      <ExecKopf status={execStatus} kennzahl={mio(k.umsatz)} kennzahlLabel="Umsatz" kernaussage={execAussage} empfehlung={execEmpf} />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {[['Verkaufte Räder', stk(k.stueck) + ' Stk'], ['Wachstum z. Vorjahr', (k.wachstumPct >= 0 ? '+' : '') + k.wachstumPct + ' %', k.wachstumPct >= 0 ? 'var(--amp-g)' : 'var(--amp-r)'], ['Umsatz', mio(k.umsatz)], ['Ø Verkaufspreis', eur(k.avgPreis)], ['E-Bike-Anteil', k.eBikeAnteilPct + ' %', 'var(--accent)'], ['Ø Marge', k.margeProzent + ' %']].map(([l, v, c]) => (
          <div key={l} style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 140, borderTop: `3px solid ${c || 'var(--accent)'}` }}>
            <div style={{ ...cap, marginBottom: 3 }}>{l}</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: c || 'var(--ink)' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Antriebsart-Split — immer sichtbar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {[['🔋 E-Bike', a.eBike, 'var(--accent)'], ['🚲 Ohne Motor (Bio)', a.bio, 'var(--muted)']].map(([l, d, c]) => (
          <div key={l} style={{ ...card, padding: 14, borderTop: `3px solid ${c}` }}>
            <div style={{ ...cap }}>{l}</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, margin: '4px 0' }}>{d.anteilPct} %</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{stk(d.stueck)} Räder · {mio(d.umsatz)} · Ø {eur(d.avgPreis)} · <Wachs v={d.wachstumPct} /></div>
          </div>
        ))}
      </div>

      {/* Haupttabelle mit Dimension-Umschalter */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: '12px 14px 0' }}>
          <div style={cap}>Verkaufte Räder nach {dim === 'preisklasse' ? 'Preisklasse' : 'Kategorie'}</div>
          <DimChips aktiv={dim} onChange={setDim} />
        </div>
        <div style={{ overflowX: 'auto' }}>
          {dim === 'kategorie' && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--line)' }}>
                <th style={{ ...th, textAlign: 'left' }}>Kategorie</th>
                <th style={{ ...th, textAlign: 'right' }}>Räder</th>
                <th style={{ ...th, textAlign: 'left' }}>Anteil</th>
                <th style={{ ...th, textAlign: 'right' }}>Umsatz</th>
                <th style={{ ...th, textAlign: 'right' }}>Ø Preis</th>
                <th style={{ ...th, textAlign: 'right' }}>Marge</th>
                <th style={{ ...th, textAlign: 'right' }}>vs. VJ</th>
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
          )}
          {dim === 'preisklasse' && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--line)' }}>
                <th style={{ ...th, textAlign: 'left' }}>Preisklasse</th>
                <th style={{ ...th, textAlign: 'right' }}>von</th>
                <th style={{ ...th, textAlign: 'right' }}>bis</th>
                <th style={{ ...th, textAlign: 'right' }}>Räder</th>
                <th style={{ ...th, textAlign: 'left' }}>Anteil</th>
                <th style={{ ...th, textAlign: 'right' }}>Umsatz</th>
                <th style={{ ...th, textAlign: 'right' }}>Ø Preis</th>
              </tr></thead>
              <tbody>
                {pk.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ ...td, fontWeight: 600 }}>{p.name}</td>
                    <td style={{ ...td, textAlign: 'right', color: 'var(--muted)' }} className="mono">{eur(p.von)}</td>
                    <td style={{ ...td, textAlign: 'right', color: 'var(--muted)' }} className="mono">{p.bis ? eur(p.bis) : '–'}</td>
                    <td style={{ ...td, textAlign: 'right' }} className="mono">{stk(p.stueck)}</td>
                    <td style={{ ...td, minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 8, background: 'var(--line)', borderRadius: 999, overflow: 'hidden' }}><div style={{ width: p.stueck / maxPk * 100 + '%', height: '100%', background: 'var(--accent)' }} /></div>
                        <span className="mono" style={{ width: 38, textAlign: 'right', fontSize: 12 }}>{p.anteilPct} %</span>
                      </div>
                    </td>
                    <td style={{ ...td, textAlign: 'right' }} className="mono">{mio(p.umsatz)}</td>
                    <td style={{ ...td, textAlign: 'right' }} className="mono">{eur(p.avgPreis)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '14px 0 20px' }}>Demo-Daten (Mock). „Bio" = Fahrrad ohne elektrischen Antrieb. Dimension oben umschaltbar.</div>
    </div>
  )
}
