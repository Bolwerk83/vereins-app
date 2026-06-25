// =========================================================================
//  MARKETING-LANDKARTEN — Choropleth-Kachelkarte mit Drilldown
//  Welt → Kontinent → Land → Bundesland → PLZ. Metrik wählbar.
// =========================================================================
import React, { useState } from 'react'
import { karte, pfadVon, hatKinder, regionVon, METRIKEN, EBENEN, ebeneVon } from '../../core/marketingKarte.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const fmt = (v, e) => e === 'pct' ? `${v} %` : `${Math.round(v).toLocaleString('de-DE')} Tsd €`
// Akzentfarbe mit variabler Deckkraft (Choropleth-Skala).
const mischung = (t) => `color-mix(in srgb, var(--accent) ${Math.round(18 + t * 72)}%, var(--panel))`

export default function MarketingKarte() {
  const [ort, setOrt] = useState('welt')      // aktuelle Region (Drill-Ebene)
  const [metrik, setMetrik] = useState('umsatz')
  const m = METRIKEN.find((x) => x.key === metrik)
  const pfad = pfadVon(ort)
  const zellen = karte(ort, metrik)
  const aktuelle = regionVon(ort)

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Marketing-Landkarten</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 820 }}>
          Geografische Verteilung mit Drilldown: <b>Welt → Europa → Deutschland → Bundesland → PLZ-Gebiet</b>.
          Farbintensität = gewählte Metrik. Klick auf eine Region geht eine Ebene tiefer.
        </div>
      </div>

      {/* Breadcrumb + Metrik-Auswahl */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', fontSize: 13 }}>
          {pfad.map((r, i) => (
            <span key={r.id}>
              <a onClick={() => setOrt(r.id)} style={{ cursor: 'pointer', color: i === pfad.length - 1 ? 'var(--ink)' : 'var(--accent)', fontWeight: i === pfad.length - 1 ? 700 : 500 }}>{r.name}</a>
              {i < pfad.length - 1 && <span style={{ color: 'var(--muted)' }}> › </span>}
            </span>
          ))}
          <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>(Ebene: {EBENEN[ebeneVon(ort)]})</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Metrik:</span>
          {METRIKEN.map((x) => (
            <button key={x.key} onClick={() => setMetrik(x.key)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, cursor: 'pointer', fontWeight: 600,
              border: `1px solid ${metrik === x.key ? 'var(--accent)' : 'var(--line)'}`, background: metrik === x.key ? 'var(--accent-soft)' : 'var(--panel)', color: metrik === x.key ? 'var(--accent)' : 'var(--muted)' }}>{x.name}</button>
          ))}
        </div>
      </div>

      {/* Kachelkarte (Choropleth) */}
      <div style={{ ...card, padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
          {zellen.map((z) => (
            <button key={z.id} onClick={() => z.drillbar && setOrt(z.id)} title={z.drillbar ? 'Tiefer drillen' : 'unterste Ebene'}
              style={{ textAlign: 'left', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 12, cursor: z.drillbar ? 'pointer' : 'default',
                background: mischung(z.intensitaet) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{z.name}</span>
                {z.drillbar && <span style={{ fontSize: 12, color: 'var(--muted)' }}>›</span>}
              </div>
              <div className="mono" style={{ fontSize: 19, fontWeight: 700, marginTop: 4 }}>{fmt(z.wert, m.einheit)}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{z.umsatzAnteil} % vom Umsatz · DB {z.db} %</div>
              {/* Warenbereiche-Split */}
              <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 8 }}>
                <span title={`Fahrräder ${z.wb.Fahrräder} %`} style={{ width: `${z.wb.Fahrräder}%`, background: 'var(--accent)' }} />
                <span title={`Zubehör ${z.wb.Zubehör} %`} style={{ width: `${z.wb.Zubehör}%`, background: 'var(--amp-a)' }} />
                <span title={`Bekleidung ${z.wb.Bekleidung} %`} style={{ width: `${z.wb.Bekleidung}%`, background: 'var(--amp-g)' }} />
              </div>
            </button>
          ))}
        </div>
        {zellen.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13, padding: 12 }}>Unterste Ebene erreicht — {aktuelle?.name} hat keine weitere Untergliederung.</div>}
        {/* Legende */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 14, fontSize: 11.5, color: 'var(--muted)' }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--accent)', borderRadius: 2, marginRight: 4 }} />Fahrräder</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--amp-a)', borderRadius: 2, marginRight: 4 }} />Zubehör</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--amp-g)', borderRadius: 2, marginRight: 4 }} />Bekleidung</span>
          <span style={{ marginLeft: 'auto' }}>Farbintensität der Kachel = {m.name} (dunkler = höher)</span>
        </div>
      </div>
    </div>
  )
}
