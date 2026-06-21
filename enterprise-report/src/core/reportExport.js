// =========================================================================
//  BERICHTS-EXPORT — Designer-Reports sauber als PDF und Excel.
//
//  PDF  : eigenständiges Druckfenster mit dem fertig gerenderten Bericht
//         (Titel, Lagebewertung, KPI-Zeilen mit Ampel, Text, Tabellen,
//         Maßnahmen) + Druck-CSS -> Browser „Als PDF speichern".
//  Excel: Excel-kompatible Arbeitsmappe (HTML/.xls) mit KPI-Übersicht und
//         allen eingebetteten Datentabellen.
//
//  Tabellen-Blöcke werden quellenrein nachgeladen (Mock/MSSQL).
// =========================================================================
import { KPI } from './kpiRegistry.js'
import { kpiInsight, knotenBewertung } from './insights.js'
import { ladeMassnahmen } from './massnahmen.js'
import { ladeDatensatz } from './datensaetze.js'
import { formatWert } from '../design/theme.js'

const AMP = { g: '#10b981', a: '#f59e0b', r: '#ef4444', n: '#94a3b8' }
const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))

// Datentabellen der 'tabelle'-Blöcke vorab laden (Index -> Datensatz).
async function ladeTabellen(report) {
  const map = {}
  await Promise.all((report.bloecke || []).map(async (b, i) => {
    if (b.typ !== 'tabelle') return
    try { map[i] = await ladeDatensatz(b.kind, b.key) } catch { map[i] = null }
  }))
  return map
}

function tabelleHtml(ds, klasse = '') {
  if (!ds?.spalten) return '<div class="leer">Datensatz nicht verfügbar.</div>'
  return `<table class="${klasse}">
    <thead><tr>${ds.spalten.map((s, i) => `<th class="${i ? 'r' : ''}">${esc(s)}</th>`).join('')}</tr></thead>
    <tbody>${ds.zeilen.map((z) => `<tr>${z.map((c, i) => `<td class="${i ? 'r' : ''}">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`
}

// --- Gemeinsames Bericht-HTML (für PDF) ----------------------------------
function berichtKoerper(report, werte, tabellen) {
  const kpiBloecke = (report.bloecke || []).filter((b) => b.typ === 'kpi' && KPI[b.kpiId])
  const bw = knotenBewertung(kpiBloecke.map((b) => kpiInsight(b.kpiId, werte[b.kpiId])))
  const v = bw.verteilung, total = Math.max(1, v.g + v.a + v.r + v.n)
  const kernfarbe = v.r ? AMP.r : v.a ? AMP.a : AMP.g
  const massnahmen = (() => { try { return ladeMassnahmen().filter((m) => m.status === 'offen' || m.status === 'in_arbeit') } catch { return [] } })()

  const lage = kpiBloecke.length ? `<div class="lage">
    <div class="lage-top"><span class="cap">Lagebewertung</span>
      <div class="bar">${['g', 'a', 'r', 'n'].map((s) => v[s] ? `<span style="width:${(v[s] / total) * 100}%;background:${AMP[s]}"></span>` : '').join('')}</div></div>
    <div class="kern" style="color:${kernfarbe}">${esc(bw.kernaussage)}</div></div>` : ''

  const bloecke = (report.bloecke || []).map((b, i) => {
    if (b.typ === 'kpi') {
      const k = KPI[b.kpiId]; if (!k) return ''
      const ins = kpiInsight(b.kpiId, werte[b.kpiId])
      return `<div class="kpi" style="border-left:3px solid ${AMP[ins.status]}">
        <span class="dot" style="background:${AMP[ins.status]}"></span>
        <span class="kpi-name">${esc(k.name)}</span>
        <span class="kpi-wert">${esc(formatWert(werte[b.kpiId], k.einheit))}</span>
        <span class="kpi-aus">${esc(ins.aussage)}</span></div>`
    }
    if (b.typ === 'text') return `<div class="text"><div class="cap accent">${esc(b.titel)}</div><p>${esc(b.text)}</p></div>`
    if (b.typ === 'tabelle') return `<div class="block"><div class="cap">${esc(b.titel)}</div>${tabelleHtml(tabellen[i])}</div>`
    if (b.typ === 'massnahmen') return `<div class="block"><div class="cap">Maßnahmen (offen / in Arbeit)</div>${
      massnahmen.length ? massnahmen.map((m) => `<div class="mn"><span>${esc(m.titel)}</span><span class="mn-meta">${esc(m.owner || '—')} · ${esc(m.frist || m.faelligkeit || '—')} · ${esc(m.status)}</span></div>`).join('') : '<div class="leer">Keine offenen Maßnahmen.</div>'}</div>`
    return ''
  }).join('')

  return { lage, bloecke }
}

const DRUCK_CSS = `
  *{box-sizing:border-box} body{margin:0;color:#0f172a;font:13px/1.5 -apple-system,Segoe UI,Roboto,Arial,sans-serif}
  .wrap{max-width:760px;margin:0 auto;padding:28px}
  .head{border-bottom:2px solid #2563eb;padding-bottom:12px;margin-bottom:18px}
  .cap{font-family:ui-monospace,Menlo,monospace;font-size:10px;text-transform:uppercase;color:#64748b;letter-spacing:.04em}
  .cap.accent{color:#2563eb} h1{font-size:22px;margin:3px 0 0}
  .sub{color:#2563eb;font-weight:600;margin-top:6px;border-left:3px solid #2563eb;padding-left:10px}
  .lage{border:1px solid #e2e8f0;border-radius:10px;padding:11px;background:#f8fafc;margin-bottom:14px}
  .lage-top{display:flex;justify-content:space-between;align-items:center}
  .bar{display:flex;width:150px;height:8px;border-radius:4px;overflow:hidden;border:1px solid #e2e8f0}
  .kern{font-weight:600;margin-top:5px} .block,.text{margin:14px 0}
  .kpi{display:flex;gap:10px;align-items:center;border:1px solid #e2e8f0;border-radius:10px;padding:9px 11px;margin:8px 0}
  .dot{width:9px;height:9px;border-radius:50%;flex:none} .kpi-name{font-weight:600;flex:1}
  .kpi-wert{font-family:ui-monospace,monospace;font-size:16px;font-weight:700} .kpi-aus{font-size:11px;color:#64748b;width:42%}
  .text p{margin:4px 0 0;white-space:pre-wrap}
  table{width:100%;border-collapse:collapse;font-size:12px;margin-top:6px}
  th{font-size:9.5px;text-transform:uppercase;color:#64748b;text-align:left;padding:5px 7px;border-bottom:1px solid #e2e8f0}
  td{padding:5px 7px;border-bottom:1px solid #e2e8f0} .r{text-align:right} .leer{color:#64748b;font-size:12px}
  .mn{display:flex;justify-content:space-between;gap:10px;padding:4px 0;border-top:1px solid #e2e8f0}
  .mn-meta{color:#64748b;font-size:11px;white-space:nowrap}
  @media print{ a{display:none} thead{display:table-header-group} }
`

/** Bericht als PDF: Druckfenster öffnen und drucken (Browser -> „Als PDF speichern"). */
export async function exportReportPdf(report, werte, periode = '') {
  const tabellen = await ladeTabellen(report)
  const { lage, bloecke } = berichtKoerper(report, werte, tabellen)
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${esc(report.titel)}</title>
    <style>${DRUCK_CSS}</style></head><body><div class="wrap">
    <div class="head"><div class="cap">Management Report${periode ? ` · Datenstand ${esc(periode)}` : ''}</div>
      <h1>${esc(report.titel)}</h1>${report.beschreibung ? `<div class="sub">${esc(report.beschreibung)}</div>` : ''}</div>
    ${lage}${bloecke}</div>
    <script>window.onload=function(){setTimeout(function(){window.print()},250)}<\/script>
    </body></html>`
  const w = window.open('', '_blank')
  if (!w) { alert('Bitte Pop-ups erlauben, um das PDF zu erzeugen.'); return }
  w.document.write(html); w.document.close()
}

/** Bericht als Excel (HTML/.xls): KPI-Übersicht + alle eingebetteten Tabellen. */
export async function exportReportExcel(report, werte, periode = '') {
  const tabellen = await ladeTabellen(report)
  const kpiRows = (report.bloecke || []).filter((b) => b.typ === 'kpi' && KPI[b.kpiId]).map((b) => {
    const k = KPI[b.kpiId], ins = kpiInsight(b.kpiId, werte[b.kpiId])
    return `<tr><td>${esc(k.name)}</td><td class="r">${esc(formatWert(werte[b.kpiId], k.einheit))}</td>
      <td class="r">${k.ziel != null ? esc(formatWert(k.ziel, k.einheit)) : '–'}</td><td>${esc(ins.aussage)}</td></tr>`
  }).join('')

  const tabSektionen = (report.bloecke || []).map((b, i) => b.typ === 'tabelle'
    ? `<h3>${esc(b.titel)}</h3>${tabelleHtml(tabellen[i])}` : '').join('')

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head><meta charset="utf-8">
    <style>table{border-collapse:collapse} th,td{border:1px solid #ccc;padding:4px 7px;font-size:12px} th{background:#eef2ff} .r{text-align:right} h1{font-size:16px} h3{font-size:13px;margin:14px 0 4px}</style>
    </head><body>
    <h1>${esc(report.titel)}</h1>
    <div>${esc(report.beschreibung || '')}${periode ? ` · Datenstand ${esc(periode)}` : ''}</div>
    ${kpiRows ? `<h3>Kennzahlen</h3><table><thead><tr><th>Kennzahl</th><th>Ist</th><th>Ziel</th><th>Bewertung</th></tr></thead><tbody>${kpiRows}</tbody></table>` : ''}
    ${tabSektionen}
    </body></html>`

  const blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = (report.titel || 'bericht').replace(/[^\w\d]+/g, '_') + '.xls'
  document.body.appendChild(a); a.click(); a.remove()
  URL.revokeObjectURL(a.href)
}
