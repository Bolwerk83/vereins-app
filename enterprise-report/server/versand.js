// =========================================================================
//  VERSAND — baut aus einem Verteiler das reproduzierbare Paket (Stempel,
//  Link, Anhänge) und verschickt es. Anhänge: Excel via exceljs
//  (optionalDependency); PDF nur wenn konfiguriert (sonst Live-Link).
// =========================================================================
import { sendeMail } from './mailer.js'
import { protokolliere } from './verteiler.store.js'

const BERICHT_NAME = {
  'management-report': 'Management Report', 'versionsvergleich': 'Versionsvergleich',
  'berichtsbaum': 'Berichtsbaum', 'alerts': 'Alerts-Übersicht'
}

export function stempel() {
  return `Stand ${new Date().toLocaleString('de-DE')}`
}

function appUrl() {
  return process.env.APP_URL || 'http://localhost:5180'
}

async function baueAnhaenge(v, paket) {
  const anhaenge = []
  const willPdf = paket.anhaenge.includes('pdf')
  const willExcel = paket.anhaenge.includes('excel')
  const basis = (v.inhalt?.reportTitel || v.bericht || 'bericht').replace(/[^\w\d]+/g, '_')

  // 1) Echter Report-Inhalt aus dem Client-Schnappschuss (reproduzierbar).
  if (v.inhalt?.html && willPdf) {
    // HTML-Report (im Browser/Word öffenbar; druckbar als PDF). Echter Inhalt
    // statt Platzhalter — true-PDF nur mit Headless-Chrome (optional).
    anhaenge.push({ filename: `${basis}.html`, content: v.inhalt.html })
  }
  if (v.inhalt?.excelHtml && willExcel) {
    anhaenge.push({ filename: `${basis}.xls`, content: '﻿' + v.inhalt.excelHtml })
  }

  // 2) Fallback ohne Inhalts-Schnappschuss: schlanke Excel-Übersicht (exceljs).
  if (!v.inhalt && willExcel) {
    try {
      const ExcelJS = (await import('exceljs')).default
      const wb = new ExcelJS.Workbook()
      const ws = wb.addWorksheet('Bericht')
      ws.addRow(['Bericht', BERICHT_NAME[v.bericht] || v.bericht])
      ws.addRow(['Datenstand', paket.stempel])
      ws.addRow(['Live-Link', `${appUrl()}/#${v.bericht}`])
      ws.addRow([])
      ws.addRow(['Hinweis', 'Reproduzierbarer Stand. Detail/Drill-down über den Live-Link.'])
      anhaenge.push({ filename: `${v.bericht}.xlsx`, content: Buffer.from(await wb.xlsx.writeBuffer()) })
    } catch { /* exceljs fehlt -> ohne Excel weiter */ }
  }
  return anhaenge
}

export function paketBauen(v) {
  const s = stempel()
  return {
    an: v.empfaenger || [],
    betreff: `${BERICHT_NAME[v.bericht] || v.bericht} — ${s}`,
    modus: v.modus,
    anhaenge: v.modus === 'live' ? [] : (v.formate || []).filter((f) => f !== 'link'),
    link: (v.formate || []).includes('link') || v.modus !== 'snapshot',
    stempel: s
  }
}

export async function versende(v, anlass = 'manuell') {
  const paket = paketBauen(v)
  const link = `${appUrl()}/#${v.bericht}`
  const html = `<p><b>${paket.betreff}</b></p>
    <p>Datenstand: <code>${paket.stempel}</code></p>
    ${paket.link ? `<p>Live-Bericht (Drill-down): <a href="${link}">${link}</a></p>` : ''}
    <p style="color:#64748b;font-size:12px">Automatischer Versand · Anlass: ${anlass}</p>`
  const text = `${paket.betreff}\nDatenstand: ${paket.stempel}\n${paket.link ? 'Live-Link: ' + link : ''}`
  const anhaenge = await baueAnhaenge(v, paket)
  const ergebnis = await sendeMail({ an: paket.an, betreff: paket.betreff, text, html, anhaenge })
  protokolliere(v.id, anlass, ergebnis)
  return { paket, anhaenge: anhaenge.map((a) => a.filename), ergebnis }
}
