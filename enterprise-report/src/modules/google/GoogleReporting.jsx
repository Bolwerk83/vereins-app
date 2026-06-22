// =========================================================================
//  GOOGLE-REPORTING — Google Ads & Analytics, abgeglichen mit Echtdaten:
//  Marketing-Performance, GA4-Funnel, Cross-Selling und Attributions-Abgleich.
// =========================================================================
import React, { useState } from 'react'
import { adsKampagnen, adsSumme, funnelMitRaten, KANAELE, CROSS_SELLING, abgleich } from '../../core/googleDaten.js'
import { datenstandText } from '../../core/datenstand.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const chip = (a) => ({ padding: '6px 13px', borderRadius: 999, fontSize: 13, cursor: 'pointer', fontWeight: 600,
  border: `1px solid ${a ? 'var(--accent)' : 'var(--line)'}`, background: a ? 'var(--accent)' : 'var(--panel)', color: a ? '#fff' : 'var(--ink)' })
const eur = (n) => Math.round(n).toLocaleString('de-DE') + ' €'
const teur = (n) => Math.round(n / 1000).toLocaleString('de-DE') + ' T€'
const num = (n) => Math.round(n).toLocaleString('de-DE')
const pct = (n) => (n >= 0 ? '+' : '') + n.toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' %'

function Tile({ label, value, sub, color }) {
  return (
    <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 140, borderTop: `3px solid ${color || 'var(--accent)'}` }}>
      <div style={{ ...cap, marginBottom: 3 }}>{label}</div>
      <div className="mono" style={{ fontSize: 19, fontWeight: 700, color: color || 'var(--ink)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function Ads() {
  const k = adsKampagnen(); const s = adsSumme()
  const maxRoas = Math.max(...k.map((x) => x.roas), 1)
  return (
    <>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <Tile label="Werbekosten" value={teur(s.kosten)} sub={`${num(s.klicks)} Klicks`} color="#ef4444" />
        <Tile label="Conversions (Google)" value={num(s.conversions)} />
        <Tile label="Conversion-Wert" value={teur(s.conversionWert)} />
        <Tile label="ROAS" value={s.roas.toLocaleString('de-DE', { maximumFractionDigits: 1 }) + '×'} sub="Umsatz je € Werbung" color="var(--amp-g)" />
      </div>
      <div style={{ ...card, padding: 16, marginBottom: 14, overflowX: 'auto' }}>
        <div style={{ ...cap, marginBottom: 8 }}>Kampagnen</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead><tr>{['Kampagne', 'Typ', 'Impr.', 'Klicks', 'CTR', 'CPC', 'Kosten', 'Conv.', 'CPA', 'ROAS'].map((h, i) => (
            <th key={i} style={{ textAlign: i >= 2 ? 'right' : 'left', padding: '6px 8px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {k.map((x) => (
              <tr key={x.id}>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{x.kampagne}</td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', color: 'var(--muted)' }}>{x.typ}</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{num(x.impressionen)}</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{num(x.klicks)}</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{x.ctr.toFixed(1)} %</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{x.cpc.toFixed(2)} €</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{teur(x.kosten)}</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{num(x.conversions)}</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{x.cpa.toFixed(0)} €</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right', fontWeight: 700, color: x.roas >= 10 ? 'var(--amp-g)' : x.roas >= 4 ? 'var(--amp-a)' : 'var(--amp-r)' }}>{x.roas.toFixed(1)}×</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 8 }}>ROAS je Kampagne</div>
        <div style={{ display: 'grid', gap: 7 }}>
          {k.map((x) => (
            <div key={x.id} style={{ display: 'grid', gridTemplateColumns: '170px 1fr 54px', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{x.kampagne}</span>
              <div style={{ background: 'var(--bg)', borderRadius: 4, height: 16, border: '1px solid var(--line)', overflow: 'hidden' }}>
                <div style={{ width: `${x.roas / maxRoas * 100}%`, height: '100%', background: x.roas >= 10 ? 'var(--amp-g)' : x.roas >= 4 ? 'var(--amp-a)' : 'var(--amp-r)' }} />
              </div>
              <span className="mono" style={{ fontSize: 12, textAlign: 'right' }}>{x.roas.toFixed(1)}×</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function Funnel() {
  const f = funnelMitRaten(); const max = f[0].wert
  return (
    <>
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 10 }}>GA4-Conversion-Funnel</div>
        <div style={{ display: 'grid', gap: 8 }}>
          {f.map((s, i) => (
            <div key={s.stufe} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 150px', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{s.stufe}</span>
              <div style={{ background: 'var(--bg)', borderRadius: 6, height: 22, border: '1px solid var(--line)', overflow: 'hidden' }}>
                <div style={{ width: `${s.wert / max * 100}%`, height: '100%', background: 'var(--accent)', display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                  <span className="mono" style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>{num(s.wert)}</span>
                </div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{s.anteil} % der Sitzungen{i > 0 && ` · ${s.schritt} % vom Schritt`}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 10 }}>Gesamt-Conversion-Rate Sitzung → Kauf: <b>{f[f.length - 1].anteil} %</b>.</div>
      </div>
      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 8 }}>Sitzungen nach Kanal</div>
        <div style={{ display: 'grid', gap: 7 }}>
          {KANAELE.map((c) => (
            <div key={c.kanal} style={{ display: 'grid', gridTemplateColumns: '170px 1fr 46px', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{c.kanal}</span>
              <div style={{ background: 'var(--bg)', borderRadius: 4, height: 16, border: '1px solid var(--line)', overflow: 'hidden' }}><div style={{ width: `${c.anteil * 2.6}%`, height: '100%', background: 'var(--accent)' }} /></div>
              <span className="mono" style={{ fontSize: 12, textAlign: 'right' }}>{c.anteil} %</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function Abgleich() {
  const rows = abgleich(); const s = adsSumme()
  return (
    <>
      <div style={{ ...card, padding: 16, marginBottom: 14, borderLeft: '4px solid var(--amp-a)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Google überzeichnet den Umsatz um {pct(s.ueberzeichnungPct)} ggü. den Echtdaten</div>
        <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.5 }}>
          Google meldet {teur(s.conversionWert)} Conversion-Wert, im WaWi/Vertrieb kommen real {teur(s.echtumsatz)} an
          (Differenz {teur(s.ueberzeichnung)}). Ursachen: Attributionsfenster, View-Through, Stornos/Retouren.
          Steuerung deshalb auf <b>Echtumsatz</b>, nicht auf die Google-Zahl.
        </div>
      </div>
      <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead><tr>{['Kampagne', 'Google-Wert', 'Echtumsatz (WaWi)', 'Differenz', '%'].map((h, i) => (
            <th key={i} style={{ textAlign: i ? 'right' : 'left', padding: '6px 8px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{r.kampagne}</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{teur(r.google)}</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{teur(r.echt)}</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right', color: 'var(--amp-r)' }}>−{teur(r.differenz)}</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right', color: 'var(--amp-a)' }}>{pct(r.differenzPct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function CrossSelling() {
  const max = Math.max(...CROSS_SELLING.map((c) => c.quote), 1)
  return (
    <div style={{ ...card, padding: 16 }}>
      <div style={{ ...cap, marginBottom: 8 }}>Cross-Selling — oft zusammen gekauft (Echtdaten × Google-Verhalten)</div>
      <div style={{ display: 'grid', gap: 8 }}>
        {CROSS_SELLING.map((c, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '260px 1fr 46px', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13 }}><b>{c.wenn}</b> <span style={{ color: 'var(--muted)' }}>→</span> {c.dann}</span>
            <div style={{ background: 'var(--bg)', borderRadius: 4, height: 16, border: '1px solid var(--line)', overflow: 'hidden' }}><div style={{ width: `${c.quote / max * 100}%`, height: '100%', background: 'var(--accent)' }} /></div>
            <span className="mono" style={{ fontSize: 12, textAlign: 'right' }}>{c.quote} %</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 10 }}>Empfehlung: Bundles & Add-on-Vorschläge im Shop und in den Shopping-Anzeigen (z. B. E-Bike + Helm + Schloss).</div>
    </div>
  )
}

const VIEWS = [
  { id: 'ads', name: 'Google Ads' },
  { id: 'funnel', name: 'Analytics-Funnel' },
  { id: 'abgleich', name: 'Abgleich ↔ Echtdaten' },
  { id: 'cross', name: 'Cross-Selling' }
]

export default function GoogleReporting() {
  const [view, setView] = useState('ads')
  return (
    <div style={{ maxWidth: 1060, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={cap}>Marketing · Google Ads &amp; Analytics</div>
          <h2 style={{ margin: '4px 0 0' }}>Google-Reporting</h2>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>📅 {datenstandText()} · Quelle: Google Ads/GA4 (Drittland USA — SCC, Art. 44 ff. DSGVO)</div>
        </div>
        <button className="no-print" onClick={() => window.print()} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>🖨 Drucken / PDF</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {VIEWS.map((v) => <button key={v.id} style={chip(view === v.id)} onClick={() => setView(v.id)}>{v.name}</button>)}
      </div>
      {view === 'ads' && <Ads />}
      {view === 'funnel' && <Funnel />}
      {view === 'abgleich' && <Abgleich />}
      {view === 'cross' && <CrossSelling />}
      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '14px 0 20px' }}>Demo-Daten (Mock) · Google-Werte sind attribuiert; maßgeblich ist der Echtumsatz.</div>
    </div>
  )
}
