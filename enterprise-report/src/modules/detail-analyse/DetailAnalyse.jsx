// =========================================================================
//  DETAILANALYSE — Granularansicht für operative Erfasser:innen.
//  Tabs: Trend (Mini-Zeitreihen + Deltas) · Änderungen · Anomalien ·
//        Qualität · Pivot-Kreuztabelle.
// =========================================================================
import React, { useState } from 'react'
import { trendDaten, AENDERUNGEN, anomalien, QUALITAET_ERFASSER, pivotDaten } from '../../core/detailAnalyse.js'
import ExecKopf, { ampelVon } from '../../components/ExecKopf.jsx'
import { Sparkline } from '../../components/ui.jsx'
import ExportButton from '../../components/ExportButton.jsx'

const card = { background:'var(--panel)', border:'1px solid var(--line)', borderRadius:'var(--radius)', boxShadow:'var(--shadow)' }
const th   = { padding:'8px 12px', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.03em', color:'var(--muted)', whiteSpace:'nowrap' }
const td   = { padding:'8px 12px', fontSize:13 }
const cap  = { fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.04em', fontWeight:700 }
const eur  = (n) => Math.round(n).toLocaleString('de-DE') + ' €'
const num  = (n) => Math.round(n).toLocaleString('de-DE')
const pct  = (n) => (n >= 0 ? '+' : '') + n + ' %'

const TABS = [
  { key:'trend',   name:'Trend & Deltas' },
  { key:'aend',    name:'Änderungen' },
  { key:'anom',    name:'Anomalien' },
  { key:'qual',    name:'Qualität' },
  { key:'pivot',   name:'Pivot' },
]

const AMPEL = { g:'var(--amp-g)', a:'var(--amp-a)', r:'var(--amp-r)', n:'var(--muted)' }
const AMPEL_SOFT = { g:'color-mix(in srgb,var(--amp-g) 12%,transparent)', a:'color-mix(in srgb,var(--amp-a) 12%,transparent)', r:'color-mix(in srgb,var(--amp-r) 12%,transparent)', n:'var(--bg)' }

function Chip({ aktiv, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      fontSize:12, padding:'5px 13px', borderRadius:999, cursor:'pointer', fontWeight:600,
      border:`1px solid ${aktiv ? 'var(--accent)' : 'var(--line)'}`,
      background: aktiv ? 'var(--accent-soft)' : 'var(--panel)',
      color: aktiv ? 'var(--accent)' : 'var(--muted)'
    }}>{children}</button>
  )
}

function Delta({ v }) {
  if (v === 0) return <span style={{ color:'var(--muted)' }}>—</span>
  const col = v > 0 ? 'var(--amp-g)' : 'var(--amp-r)'
  return <span style={{ color:col, fontWeight:700 }}>{v > 0 ? '▲' : '▼'} {Math.abs(v)} Stk.</span>
}

function DeltaPct({ v }) {
  if (v === 0) return <span style={{ color:'var(--muted)', fontSize:11 }}>—</span>
  const col = v > 0 ? 'var(--amp-g)' : 'var(--amp-r)'
  return <span style={{ color:col, fontWeight:700, fontSize:11 }}>{pct(v)}</span>
}

function StatusBadge({ s, text }) {
  return (
    <span style={{
      display:'inline-block', padding:'2px 8px', borderRadius:999, fontSize:11, fontWeight:700,
      background: AMPEL_SOFT[s] || AMPEL_SOFT.n, color: AMPEL[s] || AMPEL.n,
      border:`1px solid ${AMPEL[s] || AMPEL.n}`
    }}>{text}</span>
  )
}

// ── Trend-Tab ────────────────────────────────────────────────────────────
function TrendTab({ daten }) {
  const [suche, setSuche] = useState('')
  const rows = suche ? daten.filter((r) => r.name.toLowerCase().includes(suche.toLowerCase()) || r.kat.toLowerCase().includes(suche.toLowerCase())) : daten

  const exportRows = [
    ['Artikel', 'Kategorie', 'Gestern', 'Heute', 'Delta', 'Delta %', 'Bestand', 'Ø/Tag'],
    ...rows.map((r) => [r.name, r.kat, r.gestern, r.heute, r.delta, r.deltaPct, r.bst, r.avg])
  ]

  return (
    <div>
      <div style={{ display:'flex', gap:10, marginBottom:12, flexWrap:'wrap', alignItems:'center' }}>
        <input value={suche} onChange={(e) => setSuche(e.target.value)}
          placeholder="Artikel oder Kategorie filtern …"
          style={{ padding:'7px 12px', border:'1px solid var(--line)', borderRadius:'var(--radius-sm)', fontSize:13, flex:'1 1 200px', maxWidth:320 }} />
        <span style={{ fontSize:12, color:'var(--muted)' }}>{rows.length} Artikel · 14-Tage-Verlauf · sortiert nach stärkstem Delta</span>
        <div style={{ marginLeft:'auto' }}>
          <ExportButton label="Export Trend" csvRows={exportRows} dateiname="trend" />
        </div>
      </div>
      <div style={{ ...card, overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'2px solid var(--line)' }}>
              <th style={th}>Artikel</th>
              <th style={th}>Kat.</th>
              <th style={{ ...th, textAlign:'right' }}>14-Tage-Trend</th>
              <th style={{ ...th, textAlign:'right' }}>Gestern</th>
              <th style={{ ...th, textAlign:'right' }}>Heute</th>
              <th style={{ ...th, textAlign:'right' }}>Delta</th>
              <th style={{ ...th, textAlign:'right' }}>vs. VT</th>
              <th style={{ ...th, textAlign:'right' }}>Bestand</th>
              <th style={{ ...th, textAlign:'right' }}>Ø/Tag</th>
              <th style={th}>Erfasser</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const rowBg = r.bstAlarm ? AMPEL_SOFT.r : r.spike ? AMPEL_SOFT.a : 'transparent'
              return (
                <tr key={r.id} style={{ borderBottom:'1px solid var(--line)', background:rowBg }}>
                  <td style={td}>
                    <div style={{ fontWeight:600, fontSize:13 }}>{r.name}</div>
                    {r.bstAlarm && <div style={{ fontSize:11, color:'var(--amp-r)', fontWeight:700 }}>Bestand-Alarm</div>}
                    {r.spike    && <div style={{ fontSize:11, color:'var(--amp-a)', fontWeight:700 }}>Spike</div>}
                  </td>
                  <td style={{ ...td, color:'var(--muted)', fontSize:12 }}>{r.kat}</td>
                  <td style={{ ...td, textAlign:'right' }}>
                    <Sparkline reihe={r.reihe} w={100} h={32} />
                  </td>
                  <td style={{ ...td, textAlign:'right' }} className="mono">{num(r.gestern)}</td>
                  <td style={{ ...td, textAlign:'right', fontWeight:700 }} className="mono">{num(r.heute)}</td>
                  <td style={{ ...td, textAlign:'right' }}><Delta v={r.delta} /></td>
                  <td style={{ ...td, textAlign:'right' }}><DeltaPct v={r.deltaPct} /></td>
                  <td style={{ ...td, textAlign:'right' }} className="mono">
                    <span style={{ color: r.bstAlarm ? 'var(--amp-r)' : 'inherit', fontWeight: r.bstAlarm ? 700 : 400 }}>{num(r.bst)}</span>
                    <span style={{ fontSize:10, color:'var(--muted)', marginLeft:3 }}>/ min {r.minBst}</span>
                  </td>
                  <td style={{ ...td, textAlign:'right', color:'var(--muted)', fontSize:12 }} className="mono">{r.avg}</td>
                  <td style={{ ...td, fontSize:12, color:'var(--muted)' }}>{r.erf}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Änderungen-Tab ───────────────────────────────────────────────────────
function AendTab() {
  const TYP_FARBE = {
    'Neueing.':'var(--amp-g)', 'Korrekt.':'var(--amp-a)', 'Storno':'var(--amp-r)',
    'Fehler':'var(--amp-r)', 'Bestand':'var(--accent)', 'Preis':'var(--amp-a)'
  }
  return (
    <div style={{ ...card }}>
      <div style={{ padding:'12px 16px 8px', borderBottom:'1px solid var(--line)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={cap}>Änderungslog — letzte 72 Stunden ({AENDERUNGEN.length} Einträge)</span>
        <span style={{ fontSize:11, color:'var(--muted)' }}>Typ-Farbe: grün = Neueingang, gelb = Korrektur, rot = Storno/Fehler</span>
      </div>
      <div>
        {AENDERUNGEN.map((a, i) => (
          <div key={i} style={{ padding:'10px 16px', borderBottom: i < AENDERUNGEN.length - 1 ? '1px solid var(--line)' : 'none',
            display:'grid', gridTemplateColumns:'110px 90px 1fr 110px', gap:12, alignItems:'start' }}>
            <span className="mono" style={{ fontSize:12, color:'var(--muted)', paddingTop:1 }}>{a.ts}</span>
            <span style={{
              display:'inline-block', padding:'2px 9px', borderRadius:999, fontSize:11, fontWeight:700,
              background: `color-mix(in srgb,${TYP_FARBE[a.typ] || 'var(--muted)'} 13%,transparent)`,
              color: TYP_FARBE[a.typ] || 'var(--muted)', border:`1px solid ${TYP_FARBE[a.typ] || 'var(--line)'}`,
              whiteSpace:'nowrap', textAlign:'center', height:'fit-content'
            }}>{a.typ}</span>
            <div>
              <div style={{ fontWeight:600, fontSize:13 }}>{a.obj}</div>
              <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{a.detail}</div>
            </div>
            <span style={{ fontSize:12, color:'var(--muted)', textAlign:'right' }}>{a.erf}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Anomalien-Tab ────────────────────────────────────────────────────────
function AnomTab() {
  const anom = anomalien()
  const SCHW = { hoch:'r', mittel:'a', gering:'n' }
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ fontSize:13, color:'var(--muted)' }}>
        {anom.length} Anomalien erkannt · Algorithmus: Tagesabsatz &gt; μ + 2σ (Spike), Bestand &lt; Minimum, Absatz-Δ &lt; −40 %, Preisabweichung.
      </div>
      {anom.map((a, i) => (
        <div key={i} style={{ ...card, padding:'14px 18px', borderLeft:`4px solid ${AMPEL[SCHW[a.schwere]]}` }}>
          <div style={{ display:'flex', gap:10, alignItems:'flex-start', flexWrap:'wrap' }}>
            <StatusBadge s={SCHW[a.schwere]} text={a.art} />
            <span style={{ fontSize:11, color:'var(--muted)', marginLeft:'auto' }}>Schwere: {a.schwere}</span>
          </div>
          <div style={{ fontSize:13, marginTop:8, lineHeight:1.5 }}>{a.text}</div>
          <div style={{ fontSize:12, color:'var(--accent)', marginTop:6, fontWeight:600 }}>➜ {a.aktion}</div>
        </div>
      ))}
    </div>
  )
}

// ── Qualität-Tab ─────────────────────────────────────────────────────────
function QualTab() {
  const gesamt = QUALITAET_ERFASSER.reduce((s, e) => ({ eintr: s.eintr + e.eintr, korr: s.korr + e.korr, fehler: s.fehler + e.fehler }), { eintr:0, korr:0, fehler:0 })
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10, marginBottom:14 }}>
        {[
          { l:'Erfassungen gesamt', v: num(gesamt.eintr) },
          { l:'Korrekturen', v: num(gesamt.korr), sub: Math.round(gesamt.korr / gesamt.eintr * 1000) / 10 + ' %' },
          { l:'Fehler (kritisch)', v: num(gesamt.fehler), sub: Math.round(gesamt.fehler / gesamt.eintr * 1000) / 10 + ' %' },
          { l:'Aktive Erfasser:innen', v: QUALITAET_ERFASSER.length },
        ].map((k) => (
          <div key={k.l} style={{ ...card, padding:'12px 16px' }}>
            <div style={cap}>{k.l}</div>
            <div style={{ fontSize:22, fontWeight:700, marginTop:4 }}>{k.v}</div>
            {k.sub && <div style={{ fontSize:11, color:'var(--muted)' }}>{k.sub}</div>}
          </div>
        ))}
      </div>
      <div style={{ ...card, overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'2px solid var(--line)' }}>
              <th style={th}>Erfasser:in</th>
              <th style={{ ...th, textAlign:'right' }}>Erfassungen</th>
              <th style={{ ...th, textAlign:'right' }}>Korrekturen</th>
              <th style={{ ...th, textAlign:'right' }}>Korr.-Quote</th>
              <th style={{ ...th, textAlign:'right' }}>Fehler</th>
              <th style={{ ...th, textAlign:'right' }}>Vollst. %</th>
              <th style={{ ...th, textAlign:'right' }}>Ø Zeit (Min)</th>
              <th style={th}>Letzte Akt.</th>
            </tr>
          </thead>
          <tbody>
            {QUALITAET_ERFASSER.map((e) => {
              const korrQ = Math.round(e.korr / e.eintr * 1000) / 10
              const korrS = korrQ > 10 ? 'r' : korrQ > 5 ? 'a' : 'g'
              const vollS = e.vollst >= 97 ? 'g' : e.vollst >= 93 ? 'a' : 'r'
              return (
                <tr key={e.name} style={{ borderBottom:'1px solid var(--line)' }}>
                  <td style={{ ...td, fontWeight:600 }}>{e.name}</td>
                  <td style={{ ...td, textAlign:'right' }} className="mono">{num(e.eintr)}</td>
                  <td style={{ ...td, textAlign:'right' }} className="mono">{e.korr}</td>
                  <td style={{ ...td, textAlign:'right' }}>
                    <StatusBadge s={korrS} text={korrQ + ' %'} />
                  </td>
                  <td style={{ ...td, textAlign:'right', color: e.fehler > 2 ? 'var(--amp-r)' : 'inherit', fontWeight: e.fehler > 2 ? 700 : 400 }} className="mono">{e.fehler}</td>
                  <td style={{ ...td, textAlign:'right' }}>
                    <StatusBadge s={vollS} text={e.vollst + ' %'} />
                  </td>
                  <td style={{ ...td, textAlign:'right', color:'var(--muted)' }} className="mono">{e.avgMin}</td>
                  <td style={{ ...td, fontSize:12, color:'var(--muted)' }} className="mono">{e.letzt}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Pivot-Tab ────────────────────────────────────────────────────────────
const DIMS  = [{ id:'kat', name:'Kategorie' }, { id:'erf', name:'Erfasser:in' }]
const MASSE = [{ id:'umsatz', name:'Umsatz (€)', fmt: eur }, { id:'menge', name:'Menge (Stk.)', fmt: num }, { id:'bst', name:'Bestand (Stk.)', fmt: num }]

function PivotTab() {
  const [dim,  setDim]  = useState('kat')
  const [mass, setMass] = useState('umsatz')
  const rows = pivotDaten(dim, mass)
  const massDef = MASSE.find((m) => m.id === mass) || MASSE[0]
  const maxWert = Math.max(...rows.map((r) => r.wert), 1)

  return (
    <div>
      <div style={{ display:'flex', gap:20, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <span style={{ fontSize:12, color:'var(--muted)' }}>Dimension:</span>
          {DIMS.map((d) => <Chip key={d.id} aktiv={dim === d.id} onClick={() => setDim(d.id)}>{d.name}</Chip>)}
        </div>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <span style={{ fontSize:12, color:'var(--muted)' }}>Maß:</span>
          {MASSE.map((m) => <Chip key={m.id} aktiv={mass === m.id} onClick={() => setMass(m.id)}>{m.name}</Chip>)}
        </div>
      </div>
      <div style={{ ...card, overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'2px solid var(--line)' }}>
              <th style={th}>{DIMS.find((d) => d.id === dim)?.name || 'Gruppe'}</th>
              <th style={{ ...th, textAlign:'right' }}>Artikel</th>
              <th style={{ ...th, width:180 }}>{massDef.name}</th>
              <th style={{ ...th, textAlign:'right' }}>Anteil (Umsatz)</th>
              <th style={{ ...th, textAlign:'right' }}>Menge Heute</th>
              <th style={{ ...th, textAlign:'right' }}>Mengenanteil</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const barW = Math.round(r.wert / maxWert * 140)
              return (
                <tr key={r.key} style={{ borderBottom:'1px solid var(--line)' }}>
                  <td style={{ ...td, fontWeight:600 }}>{r.key}</td>
                  <td style={{ ...td, textAlign:'right', color:'var(--muted)' }} className="mono">{r.anzahl}</td>
                  <td style={td}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ flex:1, height:8, background:'var(--bg)', border:'1px solid var(--line)', borderRadius:999, overflow:'hidden', maxWidth:140 }}>
                        <div style={{ width:barW, height:'100%', background:'var(--accent)', borderRadius:999 }} />
                      </div>
                      <span className="mono" style={{ minWidth:90, textAlign:'right' }}>{massDef.fmt(r.wert)}</span>
                    </div>
                  </td>
                  <td style={{ ...td, textAlign:'right', color:'var(--muted)' }} className="mono">{r.anteilPct} %</td>
                  <td style={{ ...td, textAlign:'right' }} className="mono">{num(r.menge)}</td>
                  <td style={{ ...td, textAlign:'right', color:'var(--muted)' }} className="mono">{r.mengePct} %</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Haupt-Komponente ─────────────────────────────────────────────────────
export default function DetailAnalyse() {
  const [tab, setTab] = useState('trend')
  const trend = trendDaten()
  const anom  = anomalien()

  const spikes   = trend.filter((r) => r.spike).length
  const alarms   = trend.filter((r) => r.bstAlarm).length
  const kritAnom = anom.filter((a) => a.schwere === 'hoch').length

  const execStatus = kritAnom > 0 ? 'r' : alarms > 0 ? 'a' : 'g'
  const execAussage = `${trend.length} Artikel · ${AENDERUNGEN.length} Änderungen in 72 h · ${anom.length} Anomalien (${kritAnom} kritisch) · ${spikes} Umsatz-Spikes · ${alarms} Bestandsalarme.`
  const execEmpf = alarms > 0
    ? `${alarms} Artikel unter Mindestbestand — Nachbestellung prüfen. ${spikes > 0 ? spikes + ' Absatz-Spike(s) auf Ursache prüfen.' : ''}`
    : spikes > 0
    ? `${spikes} Absatz-Spike(s) — ungewöhnliche Nachfrage, Verfügbarkeit sicherstellen.`
    : 'Alle Bestände im Zielbereich. Änderungslog auf offene Punkte prüfen.'

  return (
    <div style={{ maxWidth:1300, margin:'0 auto' }}>
      <ExecKopf
        titel="Detailanalyse (operativ)"
        status={execStatus}
        aussage={execAussage}
        empfehlung={execEmpf}
        ansicht="detailanalyse"
      />

      {/* Kennzahlen-Band */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:10, marginBottom:14 }}>
        {[
          { l:'Artikel gesamt', v: trend.length },
          { l:'Umsatz heute (Σ)', v: eur(trend.reduce((s, r) => s + r.heute * r.preis, 0)) },
          { l:'Absatz heute (Σ)', v: num(trend.reduce((s, r) => s + r.heute, 0)) + ' Stk.' },
          { l:'Spikes',           v: spikes,   s: spikes  > 0 ? 'a' : 'g' },
          { l:'Bestandsalarme',   v: alarms,   s: alarms  > 0 ? 'r' : 'g' },
          { l:'Krit. Anomalien',  v: kritAnom, s: kritAnom> 0 ? 'r' : 'g' },
          { l:'Änderungen (72h)', v: AENDERUNGEN.length },
        ].map((k) => (
          <div key={k.l} style={{ ...card, padding:'10px 14px', borderTop: k.s ? `3px solid ${AMPEL[k.s]}` : '3px solid transparent' }}>
            <div style={cap}>{k.l}</div>
            <div style={{ fontSize:20, fontWeight:700, marginTop:3, color: k.s && k.v > 0 ? AMPEL[k.s] : 'inherit' }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        {TABS.map((t) => <Chip key={t.key} aktiv={tab === t.key} onClick={() => setTab(t.key)}>{t.name}</Chip>)}
      </div>

      {tab === 'trend' && <TrendTab daten={trend} />}
      {tab === 'aend'  && <AendTab />}
      {tab === 'anom'  && <AnomTab />}
      {tab === 'qual'  && <QualTab />}
      {tab === 'pivot' && <PivotTab />}
    </div>
  )
}
