// Rendert die 20 Designer-Seed-Berichte exakt wie die App-Vorschau
// (Lagebewertung · KPI-Zeilen mit Ampel · Text · Maßnahmen) in eine HTML-Datei.
import { writeFileSync } from 'node:fs'
import { MOCK } from '../src/data/mock.js'
import { KPI, berechneAlle } from '../src/core/kpiRegistry.js'
import { beispielReports } from '../src/core/designerSeed.js'
import { kpiInsight, knotenBewertung } from '../src/core/insights.js'
import { ladeMassnahmen } from '../src/core/massnahmen.js'
import { formatWert } from '../src/design/theme.js'

const periode = MOCK.aktuellePeriode
const werte = berechneAlle(MOCK.roheWerte[periode])
const AMP = { g: '#10b981', a: '#f59e0b', r: '#ef4444', n: '#94a3b8' }
const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
const reports = beispielReports()

// Maßnahmen: im Node ohne localStorage leer -> Demo-Maßnahmen einsetzen.
let massnahmen = []
try { massnahmen = ladeMassnahmen().filter((m) => m.status === 'offen' || m.status === 'in_arbeit') } catch { /* s.u. */ }
if (!massnahmen.length) massnahmen = [
  { titel: 'Online-Retouren senken (Größenberater)', owner: 'Vertrieb', frist: '2025-09', status: 'in_arbeit' },
  { titel: 'Bestandsabbau Teile/Bekleidung', owner: 'Logistik', frist: '2025-08', status: 'offen' },
  { titel: 'Einkaufskonditionen Antrieb nachverhandeln', owner: 'Einkauf', frist: '2025-10', status: 'offen' }
]

function vorschau(r, idx) {
  const kpiBloecke = r.bloecke.filter((b) => b.typ === 'kpi' && KPI[b.kpiId])
  const insights = kpiBloecke.map((b) => kpiInsight(b.kpiId, werte[b.kpiId]))
  const bw = knotenBewertung(insights)
  const v = bw.verteilung, total = Math.max(1, v.g + v.a + v.r + v.n)
  const kernfarbe = v.r ? AMP.r : v.a ? AMP.a : AMP.g

  const lage = `<div class="lage">
    <div class="lage-top"><span class="cap">Lagebewertung</span>
      <div class="bar">${['g', 'a', 'r', 'n'].map((s) => v[s] ? `<span style="width:${(v[s] / total) * 100}%;background:${AMP[s]}"></span>` : '').join('')}</div>
    </div>
    <div class="kern" style="color:${kernfarbe}">${esc(bw.kernaussage)}</div>
  </div>`

  const bloecke = r.bloecke.map((b) => {
    if (b.typ === 'kpi') {
      const k = KPI[b.kpiId]; if (!k) return ''
      const ins = kpiInsight(b.kpiId, werte[b.kpiId])
      return `<div class="kpi" style="border-left:3px solid ${AMP[ins.status]}">
        <span class="dot" style="background:${AMP[ins.status]}"></span>
        <span class="kpi-name">${esc(k.name)}</span>
        <span class="kpi-wert">${esc(formatWert(werte[b.kpiId], k.einheit))}</span>
        <span class="kpi-aus">${esc(ins.aussage)}</span>
      </div>`
    }
    if (b.typ === 'tabelle') {
      const ds = b.kind === 'detail' ? MOCK.details?.[b.key] : MOCK.perspektiven?.[b.key]
      if (!ds) return ''
      const zeilen = ds.zeilen.slice(0, 8)
      return `<div class="text"><div class="cap">${esc(b.titel)}</div>
        <table><thead><tr>${ds.spalten.map((s, i) => `<th class="${i ? 'r' : ''}">${esc(s)}</th>`).join('')}</tr></thead>
        <tbody>${zeilen.map((z) => `<tr>${z.map((c, i) => `<td class="${i ? 'r mono' : ''}">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>
        ${ds.zeilen.length > 8 ? `<div class="mehr">… und ${ds.zeilen.length - 8} weitere Zeile(n)${ds.zeilen.length > 60 ? ' · in der App virtualisiert' : ''}</div>` : ''}</div>`
    }
    if (b.typ === 'text') return `<div class="text"><div class="cap accent">${esc(b.titel)}</div><p>${esc(b.text)}</p></div>`
    if (b.typ === 'massnahmen') return `<div class="text"><div class="cap">Maßnahmen (offen / in Arbeit)</div>
      ${massnahmen.map((m) => `<div class="mn"><span>${esc(m.titel)}</span><span class="mn-meta">${esc(m.owner || '—')} · ${esc(m.frist || '—')} · ${esc(m.status)}</span></div>`).join('')}</div>`
    return ''
  }).join('')

  return `<article class="report">
    <div class="rhead">
      <div class="cap">Management Report · Bericht ${idx + 1} / 20</div>
      <h1>${esc(r.titel)}</h1>
      ${r.beschreibung ? `<div class="sub">${esc(r.beschreibung)}</div>` : ''}
    </div>
    <div class="rbody">${lage}${bloecke}</div>
  </article>`
}

const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>20 Designer-Berichte – Vorschau</title>
<style>
  :root{--ink:#0f172a;--muted:#64748b;--line:#e2e8f0;--accent:#2563eb;--bg:#f1f5f9}
  *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--ink);
    font:14px/1.55 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
  header.top{position:sticky;top:0;z-index:5;background:#fff;border-bottom:1px solid var(--line);
    padding:14px 24px;display:flex;justify-content:space-between;align-items:center}
  header.top h2{margin:0;font-size:17px} header.top .s{color:var(--muted);font-size:12px}
  nav{padding:14px 24px 0;max-width:880px;margin:0 auto;display:flex;flex-wrap:wrap;gap:6px}
  nav a{font-size:11.5px;color:var(--accent);text-decoration:none;border:1px solid var(--line);
    background:#fff;border-radius:999px;padding:3px 9px}
  main{max-width:880px;margin:0 auto;padding:18px 24px 60px;display:flex;flex-direction:column;gap:20px}
  .report{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;
    box-shadow:0 1px 3px rgba(0,0,0,.05)}
  .rhead{padding:18px 24px;border-bottom:2px solid var(--accent)}
  .cap{font-family:ui-monospace,Menlo,monospace;font-size:10.5px;text-transform:uppercase;color:var(--muted);letter-spacing:.04em}
  .cap.accent{color:var(--accent)} .rhead h1{font-size:21px;margin:3px 0 0}
  .rhead .sub{color:var(--accent);font-weight:600;margin-top:6px;border-left:3px solid var(--accent);padding-left:10px}
  .rbody{padding:22px 24px;display:flex;flex-direction:column;gap:16px}
  .lage{border:1px solid var(--line);border-radius:12px;padding:12px;background:var(--bg)}
  .lage-top{display:flex;justify-content:space-between;align-items:center}
  .bar{display:flex;width:150px;height:8px;border-radius:4px;overflow:hidden;border:1px solid var(--line)}
  .bar span{display:block} .kern{font-weight:600;font-size:13.5px;margin-top:5px}
  .kpi{display:flex;align-items:center;gap:12px;border:1px solid var(--line);border-radius:12px;padding:11px 13px}
  .dot{width:10px;height:10px;border-radius:50%;flex:none}
  .kpi-name{font-weight:600;flex:1} .kpi-wert{font-family:ui-monospace,monospace;font-size:18px;font-weight:700}
  .kpi-aus{font-size:12px;color:var(--muted);width:46%;min-width:200px}
  .text p{margin:4px 0 0;font-size:14px;line-height:1.55}
  .text table{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:8px}
  .text th{font-size:10px;text-transform:uppercase;color:var(--muted);font-weight:600;text-align:left;padding:6px 8px;border-bottom:1px solid var(--line)}
  .text td{padding:6px 8px;border-bottom:1px solid var(--line)} .r{text-align:right}
  .mono{font-variant-numeric:tabular-nums} .mehr{font-size:11px;color:var(--muted);margin-top:6px}
  .mn{display:flex;justify-content:space-between;gap:10px;font-size:13px;padding:5px 0;border-top:1px solid var(--line)}
  .mn-meta{color:var(--muted);font-size:12px;white-space:nowrap}
  @media(max-width:620px){.kpi{flex-wrap:wrap}.kpi-aus{width:100%}}
</style></head><body>
<header class="top"><div><h2>20 Designer-Berichte</h2><div class="s">Gerendert wie die App-Vorschau · Datenstand ${periode}</div></div>
  <span class="cap">echte KPI-Engine</span></header>
<nav>${reports.map((r, i) => `<a href="#r${i}">${i + 1}. ${esc(r.titel)}</a>`).join('')}</nav>
<main>${reports.map((r, i) => `<div id="r${i}">${vorschau(r, i)}</div>`).join('')}</main>
</body></html>`

writeFileSync(new URL('../designer-berichte.html', import.meta.url), html)
console.log(`OK – ${reports.length} Berichte gerendert.`)
