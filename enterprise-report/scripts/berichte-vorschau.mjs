// Erzeugt eine eigenständige HTML-Vorschau: 20 mit Daten gefüllte Berichte.
// Nutzt die ECHTE KPI-Engine (berechneAlle) + Mock-Daten + App-Formatierung.
import { writeFileSync } from 'node:fs'
import { MOCK } from '../src/data/mock.js'
import { KPI, berechneAlle } from '../src/core/kpiRegistry.js'
import { BERICHTSBAUM, EBENEN } from '../src/core/reportTree.js'
import { formatWert } from '../src/design/theme.js'
import { ampelStatus } from '../src/core/ampel.js'

const periode = MOCK.aktuellePeriode
const werte = berechneAlle(MOCK.roheWerte[periode])
const AMP = { g: '#10b981', a: '#f59e0b', r: '#ef4444', n: '#94a3b8' }
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))

// --- Berichte einsammeln: Baumknoten mit Inhalt, auf 20 aufgefüllt ---------
const reports = []
;(function sammle(n, pfad = []) {
  const titelPfad = [...pfad, n.titel]
  if ((n.kpis && n.kpis.length) || n.detail) {
    reports.push({
      nummer: n.nummer || null, titel: n.titel, ebene: n.ebene,
      pfad: titelPfad.slice(0, -1).join(' › '),
      kpis: (n.kpis || []).filter((id) => KPI[id]),
      tabelle: n.detail ? MOCK.details[n.detail] : null
    })
  }
  ;(n.kinder || []).forEach((k) => sammle(k, titelPfad))
})(BERICHTSBAUM)

// Falls Knoten ohne eigene Tabelle: eine passende Detail-/Perspektivtabelle anhängen.
const tabellenPool = [...Object.values(MOCK.details), ...Object.values(MOCK.perspektiven || {})]
let pi = 0
for (const r of reports) if (!r.tabelle) r.tabelle = tabellenPool[pi++ % tabellenPool.length]

const top20 = reports.slice(0, 20)

// --- KPI-Kachel ------------------------------------------------------------
function kachel(id) {
  const k = KPI[id]
  const w = werte[id]
  const status = ampelStatus({ wert: w, ziel: k.ziel, richtung: k.richtung })
  const ziel = k.ziel != null ? `Ziel ${formatWert(k.ziel, k.einheit)}` : 'kein Ziel'
  return `<div class="kpi">
    <div class="kpi-top"><span class="dot" style="background:${AMP[status]}"></span><span class="kpi-name">${esc(k.name)}</span></div>
    <div class="kpi-wert">${esc(formatWert(w, k.einheit))}</div>
    <div class="kpi-ziel">${esc(ziel)}</div>
  </div>`
}

// --- Datentabelle ----------------------------------------------------------
function tabelle(t) {
  if (!t) return ''
  const zeilen = t.zeilen.slice(0, 8)
  return `<table>
    <thead><tr>${t.spalten.map((s, i) => `<th class="${i ? 'r' : ''}">${esc(s)}</th>`).join('')}</tr></thead>
    <tbody>${zeilen.map((z) => `<tr>${z.map((c, i) => `<td class="${i ? 'r mono' : ''}">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>${t.zeilen.length > 8 ? `<div class="mehr">… und ${t.zeilen.length - 8} weitere Zeile(n)</div>` : ''}`
}

// --- Bericht-Karte ---------------------------------------------------------
function karte(r, i) {
  const ebene = EBENEN.find((e) => e.stufe === r.ebene)
  return `<section class="report">
    <div class="rhead">
      <div>
        ${r.pfad ? `<div class="pfad">${esc(r.pfad)}</div>` : ''}
        <h2>${r.nummer ? `<span class="nr">${esc(r.nummer)}</span> ` : ''}${esc(r.titel)}</h2>
      </div>
      <span class="ebene">E${r.ebene} · ${esc(ebene?.name || '')}</span>
    </div>
    ${r.kpis.length ? `<div class="kpis">${r.kpis.map(kachel).join('')}</div>` : ''}
    ${tabelle(r.tabelle)}
    <div class="fuss">Datenstand ${periode} · Bericht ${i + 1} von 20</div>
  </section>`
}

const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>20 Berichte – datengefüllte Vorschau</title>
<style>
  :root{--ink:#0f172a;--muted:#64748b;--line:#e2e8f0;--panel:#fff;--bg:#f1f5f9;--accent:#2563eb;--accent-soft:#eff6ff}
  *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--ink);
    font:14px/1.5 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
  .mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
  header.top{position:sticky;top:0;background:var(--panel);border-bottom:1px solid var(--line);
    padding:16px 28px;display:flex;justify-content:space-between;align-items:center;z-index:5}
  header.top h1{font-size:18px;margin:0} header.top .sub{color:var(--muted);font-size:12px;margin-top:2px}
  .badge{font-size:11px;font-weight:700;color:#fff;background:var(--accent);padding:3px 10px;border-radius:999px}
  main{max-width:1100px;margin:0 auto;padding:24px;
    display:grid;grid-template-columns:1fr 1fr;gap:18px}
  .report{background:var(--panel);border:1px solid var(--line);border-radius:14px;
    padding:18px;box-shadow:0 1px 2px rgba(0,0,0,.04);display:flex;flex-direction:column}
  .rhead{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:12px}
  .pfad{font-size:11px;color:var(--muted);margin-bottom:2px}
  .rhead h2{font-size:16px;margin:0} .nr{font-family:ui-monospace,monospace;font-size:11px;font-weight:700;
    color:var(--accent);background:var(--accent-soft);padding:2px 7px;border-radius:999px}
  .ebene{font-size:10px;color:var(--muted);white-space:nowrap;border:1px solid var(--line);
    border-radius:999px;padding:2px 8px}
  .kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:12px}
  .kpi{border:1px solid var(--line);border-radius:10px;padding:9px 11px;background:#fcfcfd}
  .kpi-top{display:flex;align-items:center;gap:6px} .dot{width:9px;height:9px;border-radius:50%}
  .kpi-name{font-size:11px;color:var(--muted)} .kpi-wert{font-size:18px;font-weight:700;margin-top:3px}
  .kpi-ziel{font-size:10px;color:var(--muted)}
  table{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:auto}
  th{font-size:10px;text-transform:uppercase;color:var(--muted);font-weight:600;
    text-align:left;padding:6px 8px;border-bottom:1px solid var(--line)}
  td{padding:6px 8px;border-bottom:1px solid var(--line)} .r{text-align:right} .mono{font-variant-numeric:tabular-nums}
  .mehr{font-size:11px;color:var(--muted);margin-top:6px}
  .fuss{font-size:10px;color:var(--muted);margin-top:12px;border-top:1px dashed var(--line);padding-top:8px}
  @media(max-width:760px){main{grid-template-columns:1fr}}
</style></head><body>
<header class="top">
  <div><h1>20 Berichte – datengefüllte Vorschau</h1>
    <div class="sub">Aus der echten KPI-Engine (berechneAlle) + Beispiel-Daten · Datenstand ${periode}</div></div>
  <span class="badge">DEMO-DATEN</span>
</header>
<main>${top20.map(karte).join('')}</main>
</body></html>`

writeFileSync(new URL('../berichte-vorschau.html', import.meta.url), html)
console.log(`OK – ${top20.length} Berichte, ${top20.reduce((n, r) => n + r.kpis.length, 0)} KPI-Kacheln.`)
