// =========================================================================
//  REPORTING-ÜBERSICHT — "So sieht mein Reporting jetzt aus."
//  Erzeugt eine eigenständige HTML-Datei mit mehreren echten Beispiel-
//  berichten. Alle Zahlen kommen aus den ECHTEN Core-Modulen der App
//  (keine erfundenen Werte) — Management-Cockpit, GuV, Profitcenter,
//  Deckungsbeitrag, Abweichungsanalyse, Segment-/Konzern, Marketing,
//  Forderungs-Aging, Bestands-Gängigkeit.
// =========================================================================
import { writeFileSync } from 'node:fs'
import { MOCK } from '../src/data/mock.js'
import { KPI, berechneAlle } from '../src/core/kpiRegistry.js'
import { formatWert } from '../src/design/theme.js'
import { ampelStatus } from '../src/core/ampel.js'
import { ergebnis, tKonto } from '../src/core/ergebnis.js'
import { auswertung as pcAuswertung } from '../src/core/profitcenter.js'
import { stufenweise } from '../src/core/deckungsbeitrag.js'
import { analyse as abwAnalyse } from '../src/core/abweichung.js'
import { segmentbericht } from '../src/core/segment.js'
import { webKennzahlen, funnel, kanaele, kampagnen, marketingKpis } from '../src/core/marketing.js'
import { aging } from '../src/core/forderungen.js'
import { auswertung as bestandAuswertung } from '../src/core/bestand.js'

const periode = MOCK.aktuellePeriode
const werte = berechneAlle(MOCK.roheWerte[periode])
const AMP = { g: '#16a34a', a: '#d97706', r: '#dc2626', n: '#94a3b8' }
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
const mio = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const tsd = (v) => Math.round(v).toLocaleString('de-DE')
const eur = (v) => Math.round(v).toLocaleString('de-DE') + ' €'

// ---------------------------------------------------------------- KPI-Kachel
function kachel(id) {
  const k = KPI[id]; if (!k) return ''
  const w = werte[id]
  const status = ampelStatus({ wert: w, ziel: k.ziel, richtung: k.richtung })
  const ziel = k.ziel != null ? `Ziel ${formatWert(k.ziel, k.einheit)}` : 'kein Ziel'
  return `<div class="kpi"><div class="kpi-top"><span class="dot" style="background:${AMP[status]}"></span>
    <span class="kpi-name">${esc(k.name)}</span></div>
    <div class="kpi-wert">${esc(formatWert(w, k.einheit))}</div>
    <div class="kpi-ziel">${esc(ziel)}</div></div>`
}

// ----------------------------------------------------------- Bericht-Rahmen
function bericht({ nr, titel, sub, gruppe, klass, body }) {
  return `<section class="report">
    <div class="rhead">
      <div><div class="pfad">${esc(gruppe)}</div>
        <h2><span class="nr">${esc(nr)}</span> ${esc(titel)}</h2>
        <div class="rsub">${sub}</div></div>
      ${klass ? `<div class="tags">${klass.map((t) => `<span class="tag ${t.k || ''}">${esc(t.l)}</span>`).join('')}</div>` : ''}
    </div>
    ${body}
    <div class="fuss">Datenstand ${esc(periode)} · erstellt mit dem <b>Business Controller</b></div>
  </section>`
}

function balken(pct, farbe) {
  return `<div class="bar"><div class="barfill" style="width:${Math.max(0, Math.min(100, pct))}%;background:${farbe}"></div></div>`
}

// ======================================================== 1) MANAGEMENT-COCKPIT
const cockpitKpis = ['nettoumsatz', 'ebit', 'dbQuote', 'roce', 'eigenkapitalquote', 'lieferfaehigkeit']
  .filter((id) => KPI[id])
const cockpit = bericht({
  nr: 'B-01', gruppe: 'Berichte › Management', titel: 'Management-Cockpit',
  sub: 'Die wichtigsten Steuerungs-KPI auf einen Blick — mit Ampel und Zielwert.',
  klass: [{ l: 'strategisch', k: 'strat' }, { l: 'monetär', k: 'mon' }],
  body: `<div class="kpis">${cockpitKpis.map(kachel).join('')}</div>`
})

// ============================================================ 2) ERGEBNISRECHNUNG (GuV)
const e = ergebnis('ist')
const tk = tKonto('ist')
const guvRows = [
  ...e.ertraege.map((p) => ({ name: p.name, wert: p.wert, typ: 'e' })),
  { name: 'Summe Erträge', wert: e.summeErtrag, sum: true },
  ...e.aufwendungen.map((p) => ({ name: p.name, wert: -p.wert, typ: 'a' })),
  { name: 'Summe Aufwendungen', wert: -e.summeAufwand, sum: true }
]
const guv = bericht({
  nr: 'B-02', gruppe: 'Berichte › Jahresabschluss', titel: 'Ergebnisrechnung (GuV, Gesamtkostenverfahren)',
  sub: 'Erträge − Aufwendungen = Betriebsergebnis. Alle Werte in Mio €.',
  klass: [{ l: 'operativ', k: 'op' }, { l: 'monetär', k: 'mon' }],
  body: `<div class="cols2">
    <table><tbody>
      ${guvRows.map((r) => `<tr class="${r.sum ? 'tsum' : ''}"><td>${esc(r.name)}</td>
        <td class="r mono" style="color:${r.wert < 0 ? AMP.r : (r.typ === 'e' ? AMP.g : 'inherit')}">${mio(r.wert)}</td></tr>`).join('')}
      <tr class="terg"><td>= Betriebsergebnis</td><td class="r mono">${mio(e.betriebsergebnis)}</td></tr>
    </tbody></table>
    <div>
      <div class="ksub">Ergebniskonto (T-Konto)</div>
      <table class="tkonto"><thead><tr><th>Soll (Aufwand)</th><th class="r">€ Mio</th><th>Haben (Ertrag)</th><th class="r">€ Mio</th></tr></thead>
      <tbody>${Array.from({ length: Math.max(tk.soll.length, tk.haben.length) }).map((_, i) => {
        const s = tk.soll[i], h = tk.haben[i]
        return `<tr><td>${s ? esc(s.name) : ''}</td><td class="r mono">${s ? mio(s.wert) : ''}</td>
          <td>${h ? esc(h.name) : ''}</td><td class="r mono">${h ? mio(h.wert) : ''}</td></tr>`
      }).join('')}
      <tr class="tsum"><td>Summe</td><td class="r mono">${mio(tk.summe)}</td><td>Summe</td><td class="r mono">${mio(tk.summe)}</td></tr>
      </tbody></table>
    </div>
  </div>`
})

// ============================================================ 3) PROFITCENTER
const pc = pcAuswertung()
const maxPcU = Math.max(...pc.rows.map((r) => r.umsatz), 1)
const profitcenter = bericht({
  nr: 'B-03', gruppe: 'Steuerung › Profitcenter', titel: 'Profitcenter-Ergebnisrechnung',
  sub: `Ergebnis je Center (Umsatz − var. Kosten − Fixkosten). Gesamtergebnis ${mio(pc.gesamt)} Mio €.`,
  klass: [{ l: 'operativ', k: 'op' }, { l: 'monetär', k: 'mon' }],
  body: `<table>
    <thead><tr><th>Center</th><th>Typ</th><th class="r">Umsatz</th><th></th><th class="r">DB</th><th class="r">Ergebnis</th><th class="r">ROCE</th></tr></thead>
    <tbody>${pc.rows.map((r) => `<tr>
      <td><b>${esc(r.name)}</b></td><td><span class="chip">${esc(r.typ)}</span></td>
      <td class="r mono">${mio(r.umsatz)}</td>
      <td style="width:80px">${balken(r.umsatz / maxPcU * 100, '#2563eb')}</td>
      <td class="r mono">${mio(r.db)}</td>
      <td class="r mono" style="color:${r.ergebnis < 0 ? AMP.r : AMP.g}">${mio(r.ergebnis)}</td>
      <td class="r mono">${r.roce != null ? r.roce + ' %' : '—'}</td></tr>`).join('')}
      <tr class="terg"><td colspan="5">= Summe Profitcenter-Ergebnis</td><td class="r mono">${mio(pc.gesamt)}</td><td></td></tr>
    </tbody></table>`
})

// ============================================================ 4) DECKUNGSBEITRAG (mehrstufig)
const db = stufenweise()
const dbRows = []
for (const b of db.bereiche) {
  for (const p of b.produkte) dbRows.push({ name: '  ' + p.name, umsatz: p.umsatz, db1: p.db1, db2: p.db2 })
  dbRows.push({ name: `Σ ${b.name} · DB III nach Bereichsfix`, db3: b.db3, bsum: true })
}
const deckungsbeitrag = bericht({
  nr: 'B-04', gruppe: 'Steuerung › Kostenrechnung', titel: 'Deckungsbeitragsrechnung (mehrstufig)',
  sub: `Stufenweise Fixkostendeckung bis zum Betriebsergebnis von ${mio(db.betriebsergebnis)} Mio €.`,
  klass: [{ l: 'operativ', k: 'op' }, { l: 'monetär', k: 'mon' }],
  body: `<table>
    <thead><tr><th>Produkt / Bereich</th><th class="r">Umsatz</th><th class="r">DB I</th><th class="r">DB II</th><th class="r">DB III</th></tr></thead>
    <tbody>${dbRows.map((r) => `<tr class="${r.bsum ? 'tsum' : ''}">
      <td>${esc(r.name)}</td>
      <td class="r mono">${r.umsatz != null ? mio(r.umsatz) : ''}</td>
      <td class="r mono">${r.db1 != null ? mio(r.db1) : ''}</td>
      <td class="r mono">${r.db2 != null ? mio(r.db2) : ''}</td>
      <td class="r mono">${r.db3 != null ? mio(r.db3) : ''}</td></tr>`).join('')}
      <tr class="tsum"><td colspan="4">Σ DB III</td><td class="r mono">${mio(db.summeDB3)}</td></tr>
      <tr><td colspan="4">− Unternehmensfixkosten</td><td class="r mono" style="color:${AMP.r}">${mio(db.unternehmensfix)}</td></tr>
      <tr class="terg"><td colspan="4">= Betriebsergebnis</td><td class="r mono">${mio(db.betriebsergebnis)}</td></tr>
    </tbody></table>`
})

// ============================================================ 5) ABWEICHUNGSANALYSE
const ab = abwAnalyse()
const abweichung = bericht({
  nr: 'B-05', gruppe: 'Analyse › Plan/Ist', titel: 'Abweichungsanalyse (Preis/Menge)',
  sub: 'Gesamtabweichung Ist gegen Plan, aufgespalten in Preis- und Mengeneffekt.',
  klass: [{ l: 'operativ', k: 'op' }, { l: 'monetär', k: 'mon' }],
  body: `<table>
    <thead><tr><th>Position</th><th class="r">Plan</th><th class="r">Ist</th><th class="r">Gesamt</th><th class="r">Preis</th><th class="r">Menge</th></tr></thead>
    <tbody>${ab.rows.map((r) => `<tr>
      <td><b>${esc(r.name)}</b></td>
      <td class="r mono">${mio(r.planMio)}</td><td class="r mono">${mio(r.istMio)}</td>
      <td class="r mono" style="color:${r.guenstig ? AMP.g : AMP.r}">${r.gesamt >= 0 ? '+' : ''}${mio(r.gesamt)}</td>
      <td class="r mono">${r.preisAbw >= 0 ? '+' : ''}${mio(r.preisAbw)}</td>
      <td class="r mono">${r.mengenAbw >= 0 ? '+' : ''}${mio(r.mengenAbw)}</td></tr>`).join('')}
      <tr class="tsum"><td>Σ Erlöse</td><td colspan="2"></td>
        <td class="r mono" style="color:${ab.erloes.gesamt >= 0 ? AMP.g : AMP.r}">${ab.erloes.gesamt >= 0 ? '+' : ''}${mio(ab.erloes.gesamt)}</td>
        <td class="r mono">${ab.erloes.preis >= 0 ? '+' : ''}${mio(ab.erloes.preis)}</td>
        <td class="r mono">${ab.erloes.menge >= 0 ? '+' : ''}${mio(ab.erloes.menge)}</td></tr>
      <tr class="tsum"><td>Σ Kosten</td><td colspan="2"></td>
        <td class="r mono">${ab.kosten.gesamt >= 0 ? '+' : ''}${mio(ab.kosten.gesamt)}</td>
        <td class="r mono">${ab.kosten.preis >= 0 ? '+' : ''}${mio(ab.kosten.preis)}</td>
        <td class="r mono">${ab.kosten.menge >= 0 ? '+' : ''}${mio(ab.kosten.menge)}</td></tr>
    </tbody></table>`
})

// ============================================================ 6) SEGMENT / KONZERN
const sg = segmentbericht()
const maxSgU = Math.max(...sg.rows.map((r) => r.umsatz), 1)
const segment = bericht({
  nr: 'B-06', gruppe: 'Analyse › Konzern', titel: 'Segment- & Konzernbericht',
  sub: `Konzernumsatz (konsolidiert) ${mio(sg.konzernUmsatz)} Mio € · EBIT ${mio(sg.konzernEbit)} Mio € · Marge ${sg.konzernMarge} %.`,
  klass: [{ l: 'strategisch', k: 'strat' }, { l: 'monetär', k: 'mon' }],
  body: `<table>
    <thead><tr><th>Gesellschaft</th><th class="r">Umsatz</th><th></th><th class="r">EBIT</th><th class="r">Marge</th><th class="r">davon IC</th></tr></thead>
    <tbody>${sg.rows.map((r) => `<tr>
      <td><b>${esc(r.name)}</b></td>
      <td class="r mono">${mio(r.umsatz)}</td>
      <td style="width:80px">${balken(r.umsatz / maxSgU * 100, '#7c3aed')}</td>
      <td class="r mono">${mio(r.ebit)}</td>
      <td class="r mono" style="color:${r.marge >= 4 ? AMP.g : AMP.a}">${r.marge} %</td>
      <td class="r mono" style="color:var(--muted)">${mio(r.ic)}</td></tr>`).join('')}
      <tr class="tsum"><td>Summe Gesellschaften</td><td class="r mono">${mio(sg.summeUmsatz)}</td><td></td>
        <td class="r mono">${mio(sg.konzernEbit)}</td><td></td><td class="r mono">${mio(sg.summeIc)}</td></tr>
      <tr><td style="color:var(--accent)">− Intercompany-Eliminierung</td>
        <td class="r mono" style="color:var(--accent)">− ${mio(sg.summeIc)}</td><td colspan="4"></td></tr>
      <tr class="terg"><td>= Konzern (konsolidiert)</td><td class="r mono">${mio(sg.konzernUmsatz)}</td><td></td>
        <td class="r mono">${mio(sg.konzernEbit)}</td><td class="r mono">${sg.konzernMarge} %</td><td></td></tr>
    </tbody></table>`
})

// ============================================================ 7) MARKETING & ANALYTICS
const w = webKennzahlen()
const mk = marketingKpis()
const fn = funnel()
const kn = kanaele()
const marketing = bericht({
  nr: 'B-07', gruppe: 'Analyse › Marketing', titel: 'Marketing & Digital-Analytics',
  sub: `Conversion-Rate ${w.conversionRate} % · Ø Bestellwert ${eur(w.aov)} · Gesamt-ROAS ${mk.roasGesamt}×.`,
  klass: [{ l: 'operativ', k: 'op' }, { l: 'nicht-monetär', k: 'nm' }],
  body: `<div class="kpis">
      <div class="kpi"><div class="kpi-name">Sessions</div><div class="kpi-wert">${tsd(w.sessions)}</div><div class="kpi-ziel">${tsd(w.nutzer)} Nutzer</div></div>
      <div class="kpi"><div class="kpi-name">Conversion-Rate</div><div class="kpi-wert">${w.conversionRate} %</div><div class="kpi-ziel">${tsd(w.transaktionen)} Käufe</div></div>
      <div class="kpi"><div class="kpi-name">Ø Bestellwert (AOV)</div><div class="kpi-wert">${eur(w.aov)}</div><div class="kpi-ziel">Umsatz ${mio(w.umsatzMio)} Mio</div></div>
      <div class="kpi"><div class="kpi-name">ROAS gesamt</div><div class="kpi-wert">${mk.roasGesamt}×</div><div class="kpi-ziel">Marketingquote ${mk.marketingquote} %</div></div>
    </div>
    <div class="cols2">
      <div><div class="ksub">Conversion-Funnel</div>
        ${fn.map((s) => `<div class="funnelrow"><span>${esc(s.name)}</span><span class="mono">${tsd(s.anzahl)} · ${s.abGesamt}%</span></div>${balken(s.abGesamt, '#2563eb')}`).join('')}
      </div>
      <div><div class="ksub">Traffic-Kanäle</div>
        <table><thead><tr><th>Kanal</th><th class="r">CVR</th><th class="r">Umsatz</th><th class="r">ROAS</th></tr></thead>
        <tbody>${kn.map((k) => `<tr><td>${esc(k.name)}</td><td class="r mono">${k.cvr} %</td>
          <td class="r mono">${mio(k.umsatzMio)}</td><td class="r mono">${k.roas != null ? k.roas + '×' : '—'}</td></tr>`).join('')}</tbody></table>
      </div>
    </div>`
})

// ============================================================ 8) FORDERUNGS-AGING
const ag = aging()
const agColor = { kein: AMP.g, gering: AMP.g, mittel: AMP.a, hoch: AMP.r, kritisch: AMP.r }
const forderungen = bericht({
  nr: 'B-08', gruppe: 'Steuerung › Working Capital', titel: 'Forderungs-Aging',
  sub: `Offene Forderungen ${mio(ag.gesamt)} Mio € · DSO ${ag.dso} Tage · erwarteter Ausfall ${mio(ag.erwarteterAusfall)} Mio € (${ag.ausfallquote} %).`,
  klass: [{ l: 'operativ', k: 'op' }, { l: 'monetär', k: 'mon' }],
  body: `<table>
    <thead><tr><th>Altersklasse</th><th class="r">Betrag</th><th class="r">Anteil</th><th>Mahnstufe</th><th class="r">WB %</th><th class="r">Ausfall</th></tr></thead>
    <tbody>${ag.rows.map((r) => `<tr>
      <td><span class="dot" style="background:${agColor[r.risiko]}"></span> ${esc(r.name)}</td>
      <td class="r mono">${mio(r.betrag)}</td><td class="r mono">${r.anteil} %</td>
      <td>${esc(r.mahnstufe)}</td><td class="r mono">${r.wbSatz} %</td>
      <td class="r mono" style="color:${r.ausfall > 0 ? AMP.r : 'inherit'}">${mio(r.ausfall)}</td></tr>`).join('')}
      <tr class="terg"><td>Gesamt / überfällig ${mio(ag.ueberfaellig)} (${ag.ueberfaelligkeitsquote} %)</td>
        <td class="r mono">${mio(ag.gesamt)}</td><td colspan="3"></td><td class="r mono">${mio(ag.erwarteterAusfall)}</td></tr>
    </tbody></table>`
})

// ============================================================ 9) BESTANDS-GÄNGIGKEIT
const bs = bestandAuswertung()
const gColor = { renner: '#16a34a', normal: '#2563eb', langsamdreher: '#d97706', ladenhueter: '#dc2626' }
const gName = { renner: 'Renner', normal: 'Normaldreher', langsamdreher: 'Langsamdreher', ladenhueter: 'Ladenhüter' }
const bestand = bericht({
  nr: 'B-09', gruppe: 'Steuerung › Bestand', titel: 'Bestands-Gängigkeit (ABC/XYZ)',
  sub: `Bestand ${mio(bs.gesamt)} Mio € · Ø Reichweite ${bs.reichweiteSchnitt} Tage · Ladenhüter ${mio(bs.ladenhueterWert)} Mio €.`,
  klass: [{ l: 'operativ', k: 'op' }, { l: 'monetär', k: 'mon' }],
  body: `<table>
    <thead><tr><th>Artikel/Gruppe</th><th class="r">Bestand</th><th class="r">Umschlag</th><th class="r">Reichw.</th><th>ABC</th><th>XYZ</th><th>Gängigkeit</th></tr></thead>
    <tbody>${bs.rows.map((r) => `<tr>
      <td><b>${esc(r.name)}</b></td>
      <td class="r mono">${mio(r.bestand)}</td><td class="r mono">${r.umschlag}×</td><td class="r mono">${r.reichweite} T</td>
      <td><span class="chip">${r.abc}</span></td><td><span class="chip">${r.xyz}</span></td>
      <td><span class="dot" style="background:${gColor[r.gaengigkeit]}"></span> ${gName[r.gaengigkeit]}</td></tr>`).join('')}
    </tbody></table>`
})

// =================================================================== ZUSAMMENBAU
const reports = [cockpit, guv, profitcenter, deckungsbeitrag, abweichung, segment, marketing, forderungen, bestand]

const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mein Reporting – Beispielberichte</title>
<style>
  :root{--ink:#0f172a;--muted:#64748b;--line:#e2e8f0;--panel:#fff;--bg:#f1f5f9;--accent:#2563eb}
  *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--ink);
    font:14px/1.55 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
  .mono{font-variant-numeric:tabular-nums;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
  header.top{background:linear-gradient(135deg,#1e293b,#334155);color:#fff;padding:26px 32px}
  header.top h1{font-size:22px;margin:0} header.top .sub{color:#cbd5e1;font-size:13px;margin-top:4px}
  header.top .meta{margin-top:12px;display:flex;gap:18px;flex-wrap:wrap;font-size:12px;color:#94a3b8}
  header.top .meta b{color:#fff}
  main{max-width:1080px;margin:0 auto;padding:24px;display:flex;flex-direction:column;gap:18px}
  .report{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:20px 22px;box-shadow:0 1px 3px rgba(0,0,0,.05)}
  .rhead{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:14px;border-bottom:1px solid var(--line);padding-bottom:12px}
  .pfad{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
  .rhead h2{font-size:17px;margin:3px 0 2px} .rsub{font-size:12.5px;color:var(--muted)}
  .nr{font-family:ui-monospace,monospace;font-size:11px;font-weight:700;color:#fff;background:var(--accent);padding:2px 8px;border-radius:6px}
  .tags{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end} .tag{font-size:10px;border-radius:999px;padding:3px 9px;font-weight:600;border:1px solid var(--line);color:var(--muted)}
  .tag.strat{background:#faf5ff;color:#7c3aed;border-color:#e9d5ff} .tag.op{background:#eff6ff;color:#2563eb;border-color:#bfdbfe}
  .tag.mon{background:#f0fdf4;color:#16a34a;border-color:#bbf7d0} .tag.nm{background:#fff7ed;color:#d97706;border-color:#fed7aa}
  .kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
  .kpi{border:1px solid var(--line);border-radius:10px;padding:11px 13px;background:#fcfcfd}
  .kpi-top{display:flex;align-items:center;gap:6px} .dot{width:9px;height:9px;border-radius:50%;display:inline-block}
  .kpi-name{font-size:11px;color:var(--muted)} .kpi-wert{font-size:20px;font-weight:700;margin-top:3px} .kpi-ziel{font-size:10.5px;color:var(--muted)}
  table{width:100%;border-collapse:collapse;font-size:12.5px} th{font-size:10px;text-transform:uppercase;color:var(--muted);font-weight:600;text-align:left;padding:6px 8px;border-bottom:2px solid var(--line)}
  td{padding:6px 8px;border-bottom:1px solid var(--line)} .r{text-align:right}
  tr.tsum td{font-weight:700;background:#f8fafc} tr.terg td{font-weight:700;background:#eff6ff;border-top:2px solid var(--accent)}
  .chip{font-size:10px;font-weight:700;background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:1px 7px}
  .cols2{display:grid;grid-template-columns:1fr 1fr;gap:22px} @media(max-width:760px){.cols2{grid-template-columns:1fr}}
  .ksub{font-size:11px;text-transform:uppercase;color:var(--muted);font-weight:700;margin-bottom:8px}
  .bar{height:8px;background:var(--bg);border-radius:4px;overflow:hidden;margin:2px 0 8px} .barfill{height:100%;border-radius:4px}
  .funnelrow{display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px}
  .tkonto th,.tkonto td{font-size:11.5px;padding:5px 7px}
  .fuss{font-size:10.5px;color:var(--muted);margin-top:14px;border-top:1px dashed var(--line);padding-top:9px}
  footer{text-align:center;color:var(--muted);font-size:11.5px;padding:8px 20px 40px}
</style></head><body>
<header class="top">
  <h1>Mein Reporting — Beispielberichte</h1>
  <div class="sub">So sieht das Reporting aktuell aus: ${reports.length} repräsentative Berichte aus den echten Modulen — mit echten Werten der KPI-/Kostenrechnungs-Engine.</div>
  <div class="meta"><span>Datenstand <b>${esc(periode)}</b></span><span>Umsatz <b>${mio(e.summeErtrag)} Mio €</b></span>
    <span>Betriebsergebnis <b>${mio(e.betriebsergebnis)} Mio €</b></span><span>Konzern-EBIT <b>${mio(sg.konzernEbit)} Mio €</b></span></div>
</header>
<main>${reports.join('')}</main>
<footer>Erstellt mit dem <b>Business Controller</b> · Konzeption &amp; Umsetzung: Business Controller</footer>
</body></html>`

writeFileSync(new URL('../reporting-uebersicht.html', import.meta.url), html)
console.log(`OK – ${reports.length} Beispielberichte erzeugt → reporting-uebersicht.html`)
