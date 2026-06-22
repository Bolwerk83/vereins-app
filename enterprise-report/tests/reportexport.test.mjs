import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { renderReportHtml, renderReportExcelHtml } from '../src/core/reportExport.js'
import { berechneAlle } from '../src/core/kpiRegistry.js'
import { MOCK } from '../src/data/mock.js'

const werte = berechneAlle(MOCK.roheWerte['2025'])
const report = {
  titel: 'Test-Report', beschreibung: 'Kernaussage',
  bloecke: [
    { typ: 'text', titel: 'Kontext', text: 'Hallo' },
    { typ: 'kpi', kpiId: 'nettoumsatz' },
    { typ: 'tabelle', titel: 'Kanäle', kind: 'detail', key: 'kanaele' },
    { typ: 'massnahmen' }
  ]
}
const tabellen = { 2: { titel: 'Kanäle', spalten: ['Kanal', 'Umsatz'], zeilen: [['Online', '23,4']] } }

test('renderReportHtml: Titel, KPI-Wert und Tabelle enthalten', () => {
  const html = renderReportHtml(report, werte, { tabellen, massnahmen: [], periode: '2025' })
  assert.match(html, /Test-Report/)
  assert.match(html, /Nettoumsatz/)
  assert.match(html, /Online/)          // Tabelleninhalt
  assert.match(html, /Datenstand 2025/)
  assert.ok(!html.includes('window.print'), 'ohne druck-Flag kein Print-Script')
})

test('renderReportHtml: druck-Flag fügt Print-Script ein', () => {
  const html = renderReportHtml(report, werte, { tabellen, druck: true })
  assert.match(html, /window\.print/)
})

test('renderReportExcelHtml: KPI-Übersicht + Tabellenabschnitt', () => {
  const xls = renderReportExcelHtml(report, werte, { tabellen, periode: '2025' })
  assert.match(xls, /Kennzahlen/)
  assert.match(xls, /Nettoumsatz/)
  assert.match(xls, /Kanäle/)
})
