// =========================================================================
//  MARKETING & DIGITAL-ANALYTICS — Übersicht/Funnel, Kanäle, Kampagnen,
//  Cross-Selling. Web-Analytics-Kennzahlen für den Onlineshop.
// =========================================================================
import React, { useState } from 'react'
import { webKennzahlen, funnel, kanaele, kampagnen, PRODUKTPAARE, CROSS, marketingKpis } from '../../core/marketing.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const tsd = (v) => v.toLocaleString('de-DE')
const eur = (v) => v.toLocaleString('de-DE') + ' €'
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })

export default function Marketing() {
  const [tab, setTab] = useState('uebersicht')
  const chip = (aktiv) => ({ padding: '6px 12px', borderRadius: 999, fontSize: 13, cursor: 'pointer', fontWeight: 600,
    border: `1px solid ${aktiv ? 'var(--accent)' : 'var(--line)'}`, background: aktiv ? 'var(--accent)' : 'var(--panel)', color: aktiv ? '#fff' : 'var(--ink)' })

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Marketing &amp; Digital-Analytics</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 740 }}>
          Web-Analytics, Conversion-Funnel, Traffic-Kanäle, Kampagnen-ROAS und Cross-Selling — die digitale
          Vertriebssicht auf einen Blick.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {[['uebersicht', 'Übersicht & Funnel'], ['kanaele', 'Kanäle'], ['kampagnen', 'Kampagnen'], ['cross', 'Cross-Selling']].map(([id, n]) => (
          <button key={id} style={chip(tab === id)} onClick={() => setTab(id)}>{n}</button>
        ))}
      </div>
      {tab === 'uebersicht' && <Uebersicht />}
      {tab === 'kanaele' && <Kanaele />}
      {tab === 'kampagnen' && <Kampagnen />}
      {tab === 'cross' && <Cross />}
    </div>
  )
}

function kachel(label, wert, hint) {
  return (
    <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 150 }}>
      <div style={cap}>{label}</div>
      <div style={{ fontSize: 21, fontWeight: 700, marginTop: 2 }}>{wert}</div>
      {hint && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{hint}</div>}
    </div>
  )
}

function Uebersicht() {
  const w = webKennzahlen()
  const f = funnel()
  const k = marketingKpis()
  const max = f[0].anzahl
  return (
    <>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {kachel('Sessions', tsd(w.sessions), tsd(w.nutzer) + ' Nutzer')}
        {kachel('Conversion Rate', w.conversionRate + ' %', tsd(w.transaktionen) + ' Käufe')}
        {kachel('Ø Bestellwert (AOV)', eur(w.aov))}
        {kachel('ROAS gesamt', (k.roasGesamt ?? '–') + '×', 'Marketingquote ' + k.marketingquote + ' %')}
        {kachel('Cross-Sell-Quote', k.crossSellQuote + ' %')}
      </div>
      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Conversion-Funnel</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {f.map((s) => (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '170px 1fr 200px', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</span>
              <div style={{ background: 'var(--bg)', borderRadius: 6, height: 20, overflow: 'hidden' }}>
                <div style={{ width: `${s.anzahl / max * 100}%`, height: '100%', background: 'var(--accent)' }} />
              </div>
              <span className="mono" style={{ fontSize: 12.5, textAlign: 'right' }}>{tsd(s.anzahl)} · {s.abGesamt}% ges. · {s.abVorstufe}% Stufe</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Größter Abbruch zwischen den Stufen mit der niedrigsten „% Stufe" — dort lohnt Optimierung am meisten.</div>
      </div>
    </>
  )
}

function Kanaele() {
  const rows = kanaele()
  return (
    <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
      <div style={{ ...cap, marginBottom: 10 }}>Traffic-Kanäle</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 640 }}>
        <thead><tr>{['Kanal', 'Sessions', 'Conversion', 'Umsatz', 'Spend', 'ROAS'].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((k) => (
            <tr key={k.id}>
              <td style={td('left', true)}>{k.name}</td>
              <td className="mono" style={td('right')}>{tsd(k.sessions)}</td>
              <td className="mono" style={{ ...td('right'), color: k.cvr >= 3 ? 'var(--amp-g)' : k.cvr < 2 ? 'var(--amp-a)' : 'var(--ink)' }}>{k.cvr} %</td>
              <td className="mono" style={td('right')}>{k.umsatzMio.toFixed(1)} Mio</td>
              <td className="mono" style={{ ...td('right'), color: 'var(--muted)' }}>{k.spendMio ? k.spendMio.toFixed(1) + ' Mio' : '–'}</td>
              <td className="mono" style={{ ...td('right', true), color: k.roas == null ? 'var(--muted)' : k.roas >= 4 ? 'var(--amp-g)' : 'var(--amp-a)' }}>{k.roas != null ? k.roas + '×' : '–'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>E-Mail/CRM mit der höchsten Conversion, SEA/Social über ROAS steuerbar. Organic & Direct ohne direkten Spend.</div>
    </div>
  )
}

function Kampagnen() {
  const rows = kampagnen()
  return (
    <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
      <div style={{ ...cap, marginBottom: 10 }}>Kampagnen</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 620 }}>
        <thead><tr>{['Kampagne', 'Spend', 'Umsatz', 'Conversions', 'ROAS', 'CAC'].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id}>
              <td style={td('left', true)}>{c.name}</td>
              <td className="mono" style={td('right')}>{c.spendMio.toFixed(2)} Mio</td>
              <td className="mono" style={td('right')}>{c.umsatzMio.toFixed(1)} Mio</td>
              <td className="mono" style={td('right')}>{tsd(c.conversions)}</td>
              <td className="mono" style={{ ...td('right', true), color: c.roas >= 5 ? 'var(--amp-g)' : 'var(--amp-a)' }}>{c.roas}×</td>
              <td className="mono" style={td('right')}>{eur(c.cac)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>ROAS = Umsatz ÷ Spend · CAC = Spend ÷ gewonnene Kunden. B2B-Leasing teurer (CAC), aber höherer Kundenwert.</div>
    </div>
  )
}

function Cross() {
  return (
    <>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {kachel('Cross-Sell-Quote', CROSS.crossSellQuote + ' %', 'Bestellungen mit >1 Warengruppe')}
        {kachel('Artikel/Bestellung', CROSS.itemsProBestellung)}
      </div>
      <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
        <div style={{ ...cap, marginBottom: 10 }}>Häufig zusammen gekauft</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
          <thead><tr>{['Produkt A', 'Produkt B', 'gem. Kaufrate', 'Lift'].map((h, i) => <th key={i} style={th(i < 2 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
          <tbody>
            {PRODUKTPAARE.map((p, i) => (
              <tr key={i}>
                <td style={td('left', true)}>{p.a}</td>
                <td style={td('left')}>{p.b}</td>
                <td className="mono" style={td('right')}>{p.anteil} %</td>
                <td className="mono" style={{ ...td('right', true), color: p.lift >= 2 ? 'var(--amp-g)' : 'var(--ink)' }}>{p.lift}×</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 10, padding: '8px 11px', background: 'var(--accent-soft)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>💡 {CROSS.empfehlung}</div>
      </div>
    </>
  )
}
