// =========================================================================
//  QUARTALSBERICHT — professioneller Management-Report mit Ist/Plan/Vorjahr,
//  kumulierten Charts, Durchschnittspreisen, Auftragseingang und editierbaren
//  Bemerkungen (persistent). Druckbar.
// =========================================================================
import React, { useState } from 'react'
import {
  MONATE, QUARTALE, SERIEN, SERIEN_IDS, letzterIstMonat, kennzahlen, quartalKennzahlen,
  kennzahlenMonate, kumuliert, headline, ampel, PREIS_JAHRE, PREISE, PREIS_BEMERKUNG_DEFAULT,
  AUFTRAG, avgWertProBike, ladeBemerkungen, speichereBemerkung, bemerkungVorschlag,
  arbeitstage, kanalSplit, LAENDER, inlandAusland, MARKT
} from '../../core/quartalsbericht.js'
import { pcFaktor, pcName, zeitraumVon } from '../../core/statistikFilter.js'
import { useGlobalFilter, GlobalFilterLeiste } from '../../core/filterKontext.jsx'
import AutoSummary from '../../components/AutoSummary.jsx'
import { AmpelPunkt } from '../../components/ui.jsx'
import { forecastBruecke, FORECAST_METHODEN } from '../../core/forecast.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const AMP = { g: 'var(--amp-g)', a: 'var(--amp-a)', r: 'var(--amp-r)' }
const FARBE = { ist: '#2563eb', plan: '#f5b301', vj: '#9ca3af' }

const eur = (n) => Math.round(n).toLocaleString('de-DE') + ' €'
const mio = (n) => (n / 1e6).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' Mio €'
const pct = (n) => (n >= 0 ? '+' : '') + n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %'

function KpiTile({ label, value, sub, status }) {
  return (
    <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 150, borderTop: status ? `3px solid ${AMP[status]}` : '3px solid var(--accent)' }}>
      <div style={{ ...cap, marginBottom: 3 }}>{label}</div>
      <div className="mono" style={{ fontSize: 21, fontWeight: 700, color: status ? AMP[status] : 'var(--ink)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function Bemerkung({ sk, vorschlag }) {
  const [txt, setTxt] = useState(() => ladeBemerkungen()[sk] ?? '')
  const set = (v) => { setTxt(v); speichereBemerkung(sk, v) }
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={cap}>✍ Bemerkung des Controllings</div>
        {!txt && vorschlag && <button className="no-print" onClick={() => set(vorschlag)} style={{ fontSize: 11, cursor: 'pointer', border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--panel)', borderRadius: 999, padding: '2px 10px', fontWeight: 600 }}>Vorschlag übernehmen</button>}
      </div>
      <textarea value={txt} onChange={(e) => set(e.target.value)} rows={2} placeholder="Einordnung, Ursachen, Gegenmaßnahmen …"
        style={{ width: '100%', marginTop: 5, padding: '9px 11px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 13, lineHeight: 1.5, resize: 'vertical', background: 'var(--bg)' }} />
    </div>
  )
}

// Kumulierte Linien Ist/Plan/VJ
function LinienChart({ serie }) {
  const bis = letzterIstMonat(serie.id)
  const W = 580, H = 230, padL = 50, padB = 26, padT = 12
  const ist = kumuliert(serie.ist, bis), plan = kumuliert(serie.plan), vj = kumuliert(serie.vj)
  const maxV = Math.max(...plan, ...vj, ...ist.filter((v) => v != null), 1)
  const x = (i) => padL + i / (MONATE.length - 1) * (W - padL - 12)
  const y = (v) => H - padB - (v / maxV) * (H - padB - padT)
  const path = (arr) => arr.map((v, i) => (v == null ? null : `${i && arr[i - 1] != null ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)).filter(Boolean).join(' ')
  const linien = [['Plan', plan, FARBE.plan], ['Vorjahr', vj, FARBE.vj], ['Ist', ist, FARBE.ist]]
  const ticks = [0, 0.5, 1].map((f) => f * maxV)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={y(t)} x2={W - 12} y2={y(t)} stroke="var(--line)" strokeDasharray="2 4" />
          <text x={padL - 6} y={y(t) + 3} textAnchor="end" fontSize="9" fill="var(--muted)">{(t / 1e6).toLocaleString('de-DE', { maximumFractionDigits: 0 })}</text>
        </g>
      ))}
      {MONATE.map((m, i) => (i % 2 === 0 ? <text key={m} x={x(i)} y={H - padB + 14} textAnchor="middle" fontSize="9" fill="var(--muted)">{m}</text> : null))}
      {linien.map(([n, arr, c]) => <path key={n} d={path(arr)} fill="none" stroke={c} strokeWidth={n === 'Ist' ? 2.6 : 1.8} />)}
      <text x={padL - 6} y={padT + 2} textAnchor="end" fontSize="8.5" fill="var(--muted)">Mio €</text>
    </svg>
  )
}

function Legende() {
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 4 }}>
      {[['Ist', FARBE.ist], ['Plan', FARBE.plan], ['Vorjahr', FARBE.vj]].map(([n, c]) => (
        <span key={n} style={{ fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--muted)' }}>
          <span style={{ width: 16, height: 3, background: c, borderRadius: 2 }} />{n}
        </span>
      ))}
    </div>
  )
}

// Kumulierter YTD-Vergleich als Balken
function BalkenKum({ serie }) {
  const bis = letzterIstMonat(serie.id)
  const k = kennzahlen(serie.id, bis)
  const reihen = [['Ist', k.ist, FARBE.ist], ['Plan', k.plan, FARBE.plan], ['Vorjahr', k.vj, FARBE.vj]]
  const maxV = Math.max(k.ist, k.plan, k.vj, 1)
  const W = 220, H = 230, padB = 28, padT = 22, bw = 44, gap = 24, x0 = 24
  const y = (v) => H - padB - (v / maxV) * (H - padB - padT)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      <line x1={10} y1={H - padB} x2={W - 6} y2={H - padB} stroke="var(--line)" />
      {reihen.map(([n, v, c], i) => {
        const bx = x0 + i * (bw + gap)
        return (
          <g key={n}>
            <rect x={bx} y={y(v)} width={bw} height={H - padB - y(v)} rx="3" fill={c} />
            <text x={bx + bw / 2} y={y(v) - 5} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="var(--ink)">{(v / 1e6).toLocaleString('de-DE', { maximumFractionDigits: 1 })}</text>
            <text x={bx + bw / 2} y={H - padB + 14} textAnchor="middle" fontSize="9.5" fill="var(--muted)">{n}</text>
          </g>
        )
      })}
    </svg>
  )
}

// Ist/Plan/Abw/VJ-Tabelle über alle Monate + YTD-Summe
function UmsatzTabelle({ serie, hervor }) {
  const bis = letzterIstMonat(serie.id)
  const istV = (i) => (i <= bis ? serie.ist[i] : null)
  const abw = (i) => (i <= bis ? serie.ist[i] - serie.plan[i] : null)
  const sumIst = serie.ist.slice(0, bis + 1).reduce((n, x) => n + x, 0)
  const sumPlan = serie.plan.slice(0, bis + 1).reduce((n, x) => n + x, 0)
  const sumVj = serie.vj.slice(0, bis + 1).reduce((n, x) => n + x, 0)
  const z = (n) => (n == null ? '—' : Math.round(n / 1000).toLocaleString('de-DE'))
  const num = (v, extra) => ({ textAlign: 'right', padding: '5px 9px', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap', ...extra })
  const Zeile = ({ label, get, sum, farbe, fett }) => (
    <tr>
      <td style={{ padding: '5px 9px', borderBottom: '1px solid var(--line)', fontWeight: fett ? 700 : 600, position: 'sticky', left: 0, background: 'var(--panel)', color: farbe || 'var(--ink)' }}>{label}</td>
      {MONATE.map((m, i) => <td key={m} className="mono" style={num(0, { color: farbe, background: hervor?.includes(i) ? 'var(--bg)' : undefined })}>{z(get(i))}</td>)}
      <td className="mono" style={num(0, { fontWeight: 700, borderLeft: '2px solid var(--line)' })}>{z(sum)}</td>
    </tr>
  )
  return (
    <div style={{ overflowX: 'auto', marginTop: 4 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 9px', borderBottom: '2px solid var(--line)', position: 'sticky', left: 0, background: 'var(--panel)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>TEUR</th>
            {MONATE.map((m, i) => <th key={m} style={{ textAlign: 'right', padding: '6px 9px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', background: hervor?.includes(i) ? 'var(--bg)' : undefined }}>{m}</th>)}
            <th style={{ textAlign: 'right', padding: '6px 9px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', borderLeft: '2px solid var(--line)' }}>Σ YTD</th>
          </tr>
        </thead>
        <tbody>
          <Zeile label="Umsatz Ist" get={istV} sum={sumIst} fett />
          <Zeile label="Umsatz Plan" get={(i) => serie.plan[i]} sum={sumPlan} farbe="#b58200" />
          <Zeile label="Abweichung" get={abw} sum={sumIst - sumPlan} farbe={AMP[ampel((sumIst - sumPlan) / sumPlan * 100)]} fett />
          <Zeile label="Vorjahr" get={(i) => serie.vj[i]} sum={sumVj} farbe="var(--muted)" />
        </tbody>
      </table>
    </div>
  )
}

function UmsatzSektion({ serie, ctx }) {
  const { monate, jeArbeitstag, faktor, periodeName } = ctx
  const kAbs = kennzahlenMonate(serie.id, monate, { faktor })            // absolut (für Kernaussage)
  const k = kennzahlenMonate(serie.id, monate, { faktor, jeArbeitstag }) // ggf. je Arbeitstag (KPIs)
  const st = ampel(k.abwPct)
  const wert = jeArbeitstag ? (n) => eur(n) : (n) => mio(n)
  const headTxt = `${(Math.abs(kAbs.abw) / 1e6).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mio € ${kAbs.abw < 0 ? 'unter' : 'über'} Plan`
  const suffix = jeArbeitstag ? ' / Arbeitstag' : ''
  return (
    <section style={{ ...card, padding: 18, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <AmpelPunkt status={st} size={13} />
        <h3 style={{ margin: 0, fontSize: 17 }}>{serie.titel}</h3>
        <span style={{ fontSize: 14, fontWeight: 700, color: AMP[st] }}>{headTxt}</span>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>· {periodeName}{jeArbeitstag ? ` · ${k.arbeitstage} Arbeitstage` : ''}</span>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '12px 0' }}>
        <KpiTile label={'Ist' + suffix} value={wert(k.ist)} />
        <KpiTile label={'Plan' + suffix} value={wert(k.plan)} />
        <KpiTile label="Abweichung Plan" value={wert(k.abw)} sub={pct(k.abwPct)} status={st} />
        <KpiTile label="vs. Vorjahr" value={wert(k.abwVj)} sub={pct(k.abwVjPct)} status={ampel(k.abwVjPct)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2.3fr) minmax(0,1fr)', gap: 14, alignItems: 'start' }}>
        <div>
          <div style={cap}>Umsatzverlauf kumuliert</div>
          <LinienChart serie={serie} />
          <Legende />
        </div>
        <div>
          <div style={cap}>Kum. Umsatz YTD (Mio €)</div>
          <BalkenKum serie={serie} />
        </div>
      </div>
      <UmsatzTabelle serie={serie} hervor={monate} />
      <Bemerkung sk={`umsatz.${serie.id}`} vorschlag={bemerkungVorschlag(serie.id)} />
    </section>
  )
}

// Durchschnittspreise: gruppierte Balken (5 Jahre × 3 Reihen)
function PreisChart() {
  const reihen = [PREISE.fahrrad, PREISE.ebike, PREISE.gesamt]
  const maxV = Math.max(...reihen.flatMap((r) => r.werte), 1)
  const W = 620, H = 260, padB = 28, padT = 26, padL = 12
  const gruppeB = (W - padL - 12) / PREIS_JAHRE.length
  const bw = gruppeB / (reihen.length + 1)
  const y = (v) => H - padB - (v / maxV) * (H - padB - padT)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      <line x1={padL} y1={H - padB} x2={W - 10} y2={H - padB} stroke="var(--line)" />
      {PREIS_JAHRE.map((jahr, gi) => {
        const gx = padL + gi * gruppeB
        return (
          <g key={jahr}>
            {reihen.map((r, ri) => {
              const bx = gx + bw * 0.5 + ri * bw
              return (
                <g key={r.name}>
                  <rect x={bx} y={y(r.werte[gi])} width={bw * 0.86} height={H - padB - y(r.werte[gi])} rx="2" fill={r.farbe} />
                  <text x={bx + bw * 0.43} y={y(r.werte[gi]) - 4} textAnchor="middle" fontSize="8.5" fontWeight="600" fill="var(--ink)">{r.werte[gi].toLocaleString('de-DE')}</text>
                </g>
              )
            })}
            <text x={gx + gruppeB / 2} y={H - padB + 14} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--muted)">{jahr}</text>
          </g>
        )
      })}
    </svg>
  )
}

function PreisSektion() {
  return (
    <section style={{ ...card, padding: 18, marginBottom: 16 }}>
      <h3 style={{ margin: '0 0 2px', fontSize: 17 }}>Durchschnittliche Verkaufspreise Fahrräder / E-Bikes</h3>
      <div style={{ fontSize: 13, color: 'var(--amp-a)', fontWeight: 600, marginBottom: 10 }}>Preisniveau sinkt weiter — vor allem durch Preisnachlässe</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.7fr) minmax(0,1fr)', gap: 16, alignItems: 'center' }}>
        <div>
          <PreisChart />
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 2 }}>
            {[PREISE.fahrrad, PREISE.ebike, PREISE.gesamt].map((r) => (
              <span key={r.name} style={{ fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--muted)' }}>
                <span style={{ width: 12, height: 12, background: r.farbe, borderRadius: 3 }} />{r.name}
              </span>
            ))}
            <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>Quelle: ZIV · in €</span>
          </div>
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6, color: 'var(--slate)' }}>
          {PREIS_BEMERKUNG_DEFAULT.map((b, i) => <li key={i} style={{ marginBottom: 6 }}>{b}</li>)}
        </ul>
      </div>
      <Bemerkung sk="preise" vorschlag="Preisstrategie und Rabattsteuerung überprüfen; margenstarke Renn-/Gravelräder gezielt bewerben." />
    </section>
  )
}

function MiniBars({ daten, label, wert, max, farbe }) {
  return (
    <div style={{ display: 'grid', gap: 7 }}>
      {daten.map((d) => (
        <div key={label(d)} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 54px', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>{label(d)}</span>
          <div style={{ background: 'var(--bg)', borderRadius: 4, height: 16, overflow: 'hidden', border: '1px solid var(--line)' }}>
            <div style={{ width: `${(wert(d) / max) * 100}%`, height: '100%', background: farbe }} />
          </div>
          <span className="mono" style={{ fontSize: 12, textAlign: 'right', color: 'var(--muted)' }}>{wert(d).toLocaleString('de-DE')}{typeof wert(d) === 'number' && daten[0].pct != null ? ' %' : ''}</span>
        </div>
      ))}
    </div>
  )
}

function AuftragSektion() {
  const maxKat = Math.max(...AUFTRAG.kategorien.map((k) => k.pct))
  const maxTag = Math.max(...AUFTRAG.tage.map((t) => t.n))
  return (
    <section style={{ ...card, padding: 18, marginBottom: 16 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 17 }}>Auftragseingang Bikes</h3>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <KpiTile label="Auftragseingang Wert" value={eur(AUFTRAG.wert)} />
        <KpiTile label="Anzahl Bikes" value={AUFTRAG.anzahl.toLocaleString('de-DE')} />
        <KpiTile label="Ø Wert / Bike" value={eur(avgWertProBike())} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        <div>
          <div style={{ ...cap, marginBottom: 8 }}>Kategorie-Verteilung (nach Absatz)</div>
          <MiniBars daten={AUFTRAG.kategorien} label={(d) => d.name} wert={(d) => d.pct} max={maxKat} farbe="var(--accent)" />
        </div>
        <div>
          <div style={{ ...cap, marginBottom: 8 }}>Bike-Verkäufe nach Tagen</div>
          <MiniBars daten={AUFTRAG.tage} label={(d) => d.tag} wert={(d) => d.n} max={maxTag} farbe="#10b981" />
        </div>
      </div>
      <Bemerkung sk="auftrag" vorschlag={`Auftragseingang ${eur(AUFTRAG.wert)} (${AUFTRAG.anzahl} Bikes, Ø ${eur(avgWertProBike())}). Gravel trägt 40 % des Absatzes; Spitzentag Donnerstag — Personal-/Logistikplanung darauf ausrichten.`} />
    </section>
  )
}

// Online ↔ Stationär (Verhältnis Online/Offline)
function KanalSektion() {
  const split = kanalSplit()
  const max = Math.max(...split.map((k) => k.ist), 1)
  return (
    <section style={{ ...card, padding: 18, marginBottom: 16 }}>
      <h3 style={{ margin: '0 0 2px', fontSize: 17 }}>Online ↔ Stationär (Vertriebskanal)</h3>
      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>Verschiebung zum Online-Geschäft: Online wächst und liegt über Plan, der stationäre Handel verliert. <span style={{ fontStyle: 'italic' }}>Einzelne Kanäle lassen sich oben im Profit-Center-Filter (Zweig „Vertriebskanal") für den ganzen Bericht auswählen.</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {split.map((k) => (
          <div key={k.id} style={{ ...card, padding: 14, borderTop: `3px solid ${k.farbe}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: k.farbe }}>{k.name}</span>
              <span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{k.anteil} %</span>
            </div>
            <div className="mono" style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{mio(k.ist)}</div>
            <div style={{ background: 'var(--bg)', borderRadius: 4, height: 8, overflow: 'hidden', border: '1px solid var(--line)', margin: '8px 0' }}>
              <div style={{ width: `${(k.ist / max) * 100}%`, height: '100%', background: k.farbe }} />
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
              <span style={{ color: AMP[ampel(k.abwPct)] }}>Plan {pct(k.abwPct)}</span>
              <span style={{ color: AMP[ampel(k.abwVjPct)] }}>VJ {pct(k.abwVjPct)}</span>
            </div>
          </div>
        ))}
      </div>
      <Bemerkung sk="kanal" vorschlag={`Online-Anteil bei ${split[0].anteil} % (${pct(split[0].abwVjPct)} ggü. VJ), stationär ${pct(split[1].abwVjPct)}. Flächen-/Filialstrategie und Omnichannel (Click&Collect) prüfen.`} />
    </section>
  )
}

// Internationalisierung — Wachstum & Länderentwicklung
function InternationalSektion() {
  const max = Math.max(...LAENDER.map((l) => l.umsatz), 1)
  const ia = inlandAusland()
  return (
    <section style={{ ...card, padding: 18, marginBottom: 16 }}>
      <h3 style={{ margin: '0 0 2px', fontSize: 17 }}>Internationalisierung — Länder &amp; Wachstum</h3>
      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>Das Auslandsgeschäft wächst deutlich schneller als der Heimatmarkt — Treiber sind NL und Skandinavien.</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <KpiTile label="Inland (DE)" value={mio(ia.inland.umsatz)} sub={`${ia.inland.anteil} % · Wachstum ${pct(ia.inland.wachstum)}`} />
        <KpiTile label="Ausland" value={mio(ia.ausland.umsatz)} sub={`${ia.ausland.anteil} % · Wachstum ${pct(ia.ausland.wachstum)}`} status={ampel(ia.ausland.wachstum)} />
      </div>
      <div style={{ ...cap, marginBottom: 8 }}>Umsatz &amp; Wachstum je Land</div>
      <div style={{ display: 'grid', gap: 7 }}>
        {LAENDER.map((l) => (
          <div key={l.code} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 92px 72px', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>{l.land}</span>
            <div style={{ background: 'var(--bg)', borderRadius: 4, height: 16, overflow: 'hidden', border: '1px solid var(--line)' }}>
              <div style={{ width: `${(l.umsatz / max) * 100}%`, height: '100%', background: 'var(--accent)' }} />
            </div>
            <span className="mono" style={{ fontSize: 12, textAlign: 'right', color: 'var(--muted)' }}>{mio(l.umsatz)}</span>
            <span className="mono" style={{ fontSize: 12, textAlign: 'right', fontWeight: 600, color: AMP[ampel(l.wachstum)] }}>{pct(l.wachstum)}</span>
          </div>
        ))}
      </div>
      <Bemerkung sk="international" vorschlag={`Auslandsanteil ${ia.ausland.anteil} % mit ${pct(ia.ausland.wachstum)} Wachstum vs. Inland ${pct(ia.inland.wachstum)}. Expansion in NL/Skandinavien forcieren; FR mit Rückgang prüfen.`} />
    </section>
  )
}

// Benchmark & Marktanteil
function BenchmarkSektion() {
  const ms = MARKT.marktanteil
  const max = Math.max(...ms.map((m) => m.pct), 1)
  return (
    <section style={{ ...card, padding: 18, marginBottom: 16 }}>
      <h3 style={{ margin: '0 0 2px', fontSize: 17 }}>Benchmark &amp; Marktanteil</h3>
      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>Einordnung gegen den Wettbewerb: Marktanteil und Kennzahlen gegen den Branchenschnitt.</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        <div>
          <div style={{ ...cap, marginBottom: 8 }}>Marktanteile (Absatz)</div>
          <div style={{ display: 'grid', gap: 7 }}>
            {ms.map((m) => (
              <div key={m.name} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 46px', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: m.eigen ? 700 : 500, color: m.eigen ? 'var(--accent)' : 'var(--ink)' }}>{m.name}</span>
                <div style={{ background: 'var(--bg)', borderRadius: 4, height: 16, overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <div style={{ width: `${(m.pct / max) * 100}%`, height: '100%', background: m.eigen ? 'var(--accent)' : 'var(--muted)' }} />
                </div>
                <span className="mono" style={{ fontSize: 12, textAlign: 'right' }}>{m.pct} %</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ ...cap, marginBottom: 8 }}>Kennzahlen vs. Markt</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead><tr>{['Kennzahl', 'Wir', 'Markt', 'Δ'].map((h, i) => (
              <th key={i} style={{ textAlign: i ? 'right' : 'left', padding: '5px 8px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {MARKT.benchmark.map((b) => {
                const delta = b.wir - b.markt
                const gut = b.grossGut ? delta >= 0 : delta <= 0
                return (
                  <tr key={b.kpi}>
                    <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{b.kpi}</td>
                    <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{b.wir.toLocaleString('de-DE')}{b.einheit === '%' ? ' %' : ' ' + b.einheit}</td>
                    <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right', color: 'var(--muted)' }}>{b.markt.toLocaleString('de-DE')}{b.einheit === '%' ? ' %' : ' ' + b.einheit}</td>
                    <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right', fontWeight: 700, color: gut ? 'var(--amp-g)' : 'var(--amp-r)' }}>{delta >= 0 ? '+' : ''}{(+delta.toFixed(1)).toLocaleString('de-DE')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10 }}>{MARKT.quelle}</div>
      <Bemerkung sk="benchmark" vorschlag="Marktanteil 14 % (Rang 3). E-Bike- und Online-Anteil über Markt — als Stärke ausspielen; Ø-Preis unter Markt (Premiumpotenzial)." />
    </section>
  )
}

// Forecast Jahresende mit Forecast-Bruecke (Wasserfall) Plan -> YTD -> Rest -> FC.
function ForecastSektion({ faktor, pcLabel }) {
  const [methode, setMethode] = useState('runrate')
  const b = forecastBruecke('gesamt', { faktor, methode })
  const H = 150
  const maxV = Math.max(b.jahresplan, b.forecast) * 1.12 || 1
  const yH = (v) => Math.abs(v) / maxV * H
  const r1 = b.jahresplan, r2 = b.jahresplan + b.ytdAbw, r3 = b.forecast
  const saeulen = [
    { label: 'Jahresplan', wert: b.jahresplan, bottom: 0, h: yH(b.jahresplan), farbe: 'var(--muted)', typ: 'basis' },
    { label: `YTD-Abw. (bis ${b.monatName})`, wert: b.ytdAbw, bottom: Math.min(r1, r2) / maxV * H, h: yH(b.ytdAbw), farbe: b.ytdAbw >= 0 ? 'var(--amp-g)' : 'var(--amp-r)', typ: 'delta' },
    { label: 'Restjahr-Abw.', wert: b.restAbw, bottom: Math.min(r2, r3) / maxV * H, h: yH(b.restAbw), farbe: b.restAbw >= 0 ? 'var(--amp-g)' : 'var(--amp-r)', typ: 'delta' },
    { label: 'Forecast', wert: b.forecast, bottom: 0, h: yH(b.forecast), farbe: AMP[b.status], typ: 'summe' }
  ]
  const chip = (aktiv) => ({ padding: '4px 10px', borderRadius: 999, fontSize: 12, cursor: 'pointer', fontWeight: 600, border: `1px solid ${aktiv ? 'var(--accent)' : 'var(--line)'}`, background: aktiv ? 'var(--accent)' : 'var(--panel)', color: aktiv ? '#fff' : 'var(--ink)' })
  return (
    <section style={{ ...card, padding: 18, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: 17 }}>Forecast Jahresende — Hochrechnung{pcLabel ? ` · ${pcLabel}` : ''}</h3>
        <span style={{ display: 'inline-flex', gap: 6 }}>
          {FORECAST_METHODEN.map((m) => <button key={m.id} onClick={() => setMethode(m.id)} style={chip(methode === m.id)} title={m.beschreibung}>{m.name}</button>)}
        </span>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--muted)', margin: '4px 0 12px' }}>
        Stand {b.monatName} · Restjahr {methode === 'plantreu' ? 'plan-treu (trifft den Plan)' : `mit YTD-Leistungsindex ${b.leistungsindex.toLocaleString('de-DE')} fortgeschrieben`}.
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <KpiTile label="Jahresplan" value={mio(b.jahresplan)} />
        <KpiTile label="Forecast Jahresende" value={mio(b.forecast)} sub={`Erreichungsgrad ${b.erreichungPct.toLocaleString('de-DE')} %`} status={b.status} />
        <KpiTile label="Abweichung z. Plan" value={mio(b.abwForecast)} sub={pct(b.abwForecastPct)} status={b.status} />
        <KpiTile label="vs. Vorjahr" value={pct(b.vsVjPct)} status={ampel(b.vsVjPct)} />
      </div>
      <div style={cap}>Forecast-Brücke · Plan → YTD → Restjahr → Forecast</div>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', height: H + 26, marginTop: 22 }}>
        {saeulen.map((s, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
            <div style={{ position: 'relative', width: '100%', height: H }}>
              <div style={{ position: 'absolute', bottom: s.bottom, left: '50%', transform: 'translateX(-50%)', width: '62%', maxWidth: 84, height: Math.max(2, s.h), background: s.farbe, borderRadius: 4, opacity: s.typ === 'delta' ? 0.9 : 1 }}>
                <span className="mono" style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 3, fontSize: 10.5, fontWeight: 700, whiteSpace: 'nowrap', color: s.typ === 'delta' ? s.farbe : 'var(--ink)' }}>
                  {s.typ === 'delta' ? (s.wert >= 0 ? '+' : '') + mio(s.wert) : mio(s.wert)}
                </span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, textAlign: 'center', lineHeight: 1.2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <Bemerkung sk="forecast" vorschlag={`Hochrechnung Jahresende ${mio(b.forecast)} (${b.erreichungPct.toLocaleString('de-DE')} % des Plans, ${pct(b.abwForecastPct)}). ${b.abwForecast < 0 ? 'Gegensteuern erforderlich, um die Planlücke zu schließen.' : 'Plan voraussichtlich erreicht — Kurs halten.'}`} />
    </section>
  )
}

export default function Quartalsbericht() {
  const g = useGlobalFilter()
  const [jeAt, setJeAt] = useState(false)
  const zr = zeitraumVon(g.zeitraum)
  const pc = g.pc
  const ctx = { monate: zr.monate, jeArbeitstag: jeAt, faktor: pcFaktor(pc), periodeName: zr.name }
  const kGes = kennzahlenMonate('gesamt', zr.monate, { faktor: ctx.faktor })
  const [summe, setSumme] = useState(() => ladeBemerkungen()['summary'] ?? '')
  // Berichtstyp-Titel aus dem globalen Zeitraum ableiten
  const typName = g.zeitraum === 'jahr' ? 'Jahresbericht' : (g.zeitraum === 'h1' || g.zeitraum === 'h2') ? 'Halbjahresbericht' : 'Quartalsbericht'
  const pcLabel = pcName(pc)

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      {/* Kopf */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={cap}>Management-Report · Wirtschaftsjahr {MONATE[0]}–{MONATE[11]}</div>
          <h2 style={{ margin: '4px 0 0' }}>{typName} <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 16 }}>· {zr.name}</span></h2>
        </div>
        <button className="no-print" onClick={() => window.print()} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>🖨 Drucken / PDF</button>
      </div>

      {/* Globaler Filter (Zeitraum + Profit-Center) — gilt für alle Berichte */}
      <GlobalFilterLeiste />

      {/* Berichtsspezifische Option */}
      <div className="no-print" style={{ ...card, padding: '8px 14px', marginBottom: 14, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, cursor: 'pointer' }} title="Umsatz je Arbeitstag — macht kurze/lange Monate vergleichbar">
          <input type="checkbox" checked={jeAt} onChange={(e) => setJeAt(e.target.checked)} />
          <span style={{ fontWeight: 600 }}>je Arbeitstag normieren</span>
        </label>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>Macht kurze/lange Monate vergleichbar (Umsatz ÷ Arbeitstage).</span>
      </div>

      {/* Kernaussage / Hero */}
      <div style={{ ...card, padding: 18, marginBottom: 16, borderLeft: `4px solid ${AMP[ampel(kGes.abwPct)]}`, background: 'linear-gradient(90deg, var(--bg), var(--panel))' }}>
        <div style={cap}>Kernaussage · {zr.name}{pc !== 'alle' ? ` · ${pcLabel}` : ''}</div>
        <div style={{ fontSize: 23, fontWeight: 700, margin: '4px 0 2px' }}>
          Wir liegen {(Math.abs(kGes.abw) / 1e6).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mio € {kGes.abw < 0 ? 'unter' : 'über'} dem Umsatzplan
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--muted)' }}>
          Ist {mio(kGes.ist)} vs. Plan {mio(kGes.plan)} ({pct(kGes.abwPct)}) · Vorjahr {pct(kGes.abwVjPct)}
          {pc !== 'alle' && <span> · gefiltert auf <b>{pcLabel}</b></span>}
          {jeAt && <span> · Normierung je Arbeitstag aktiv</span>}
        </div>
        <div style={{ marginTop: 12 }}>
          <AutoSummary monate={zr.monate} faktor={ctx.faktor} periodeName={zr.name} pcLabel={pc !== 'alle' ? pcLabel : ''}
            onUebernehmen={(txt) => { setSumme(txt); speichereBemerkung('summary', txt) }} />
          <div style={cap}>Management-Summary <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--muted)' }}>· frei editierbar</span></div>
          <textarea value={summe} onChange={(e) => { setSumme(e.target.value); speichereBemerkung('summary', e.target.value) }} rows={3}
            placeholder="Zusammenfassende Einordnung für die Geschäftsführung … (oder oben eine Vorlage übernehmen)"
            style={{ width: '100%', marginTop: 5, padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 13.5, lineHeight: 1.55, resize: 'vertical', background: 'var(--panel)' }} />
        </div>
      </div>

      <ForecastSektion faktor={ctx.faktor} pcLabel={pc !== 'alle' ? pcLabel : ''} />

      {SERIEN_IDS.map((id) => <UmsatzSektion key={id} serie={SERIEN[id]} ctx={ctx} />)}
      <KanalSektion />
      <InternationalSektion />
      <BenchmarkSektion />
      <PreisSektion />
      <AuftragSektion />

      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '6px 0 20px' }}>
        Enterprise Report · {typName} · Demo-Daten (Mock). Bemerkungen werden lokal gespeichert.
      </div>
    </div>
  )
}
