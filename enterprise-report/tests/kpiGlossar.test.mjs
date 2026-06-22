import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { glossarFuer, ausfuehrlich, GLOSSAR } from '../src/core/kpiGlossar.js'

test('Glossar liefert Vollname + Kurzerläuterung je Kürzel', () => {
  const g = glossarFuer('lbVerf')
  assert.equal(g.name, 'Verfügbarer Lagerbestand')
  assert.ok(g.kurz.length > 10)
  assert.ok(g.formelText.includes('LB Eff'))
})

test('Unbekannte Spalte -> kein Glossareintrag', () => {
  assert.equal(glossarFuer('gibtsnicht'), null)
})

test('Ausführliche Beschreibung verknüpft KPI-Definition', () => {
  const a = ausfuehrlich('margePct')
  assert.ok(a.lang.length > 20)
  assert.ok(a.kpi, 'margePct sollte mit einer KPI-Definition verknüpft sein')
  assert.equal(a.kpi.id, 'dbQuote')
  assert.ok(a.kpi.beschreibung)
})

test('Eintrag ohne KPI-Verknüpfung liefert kpi=null', () => {
  const a = ausfuehrlich('gesp')
  assert.equal(a.kpi, null)
  assert.ok(a.name && a.lang)
})
