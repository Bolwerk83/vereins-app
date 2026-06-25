import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { budgetVergleich, zielRueckwaerts, BUDGET_KPIS, plane } from '../src/core/planungEinfach.js'

test('budgetVergleich: alle Budget-KPIs mit Ist/Budget/Forecast', () => {
  const rows = budgetVergleich({}, 4)
  assert.equal(rows.length, BUDGET_KPIS.length)
  const u = rows.find((r) => r.id === 'nettoumsatz')
  assert.ok(u.ist > 0 && u.budget > 0 && u.forecast > 0)
  assert.equal(u.abw, u.budget - u.ist)
})

test('Forecast reagiert auf Wachstums-%', () => {
  const a = budgetVergleich({}, 0).find((r) => r.id === 'nettoumsatz').forecast
  const b = budgetVergleich({}, 10).find((r) => r.id === 'nettoumsatz').forecast
  assert.ok(b > a) // höheres Wachstum → höherer Forecast-Umsatz
})

test('Inverse Umsatz-Zielrechnung ist konsistent (Roundtrip)', () => {
  const z = zielRueckwaerts('nettoumsatz', 60, {})
  // AEB × Ø-Preis / 1e6 ≈ Ziel
  const zurueck = z.aeb * z.durchschnittspreis / 1e6
  assert.ok(Math.abs(zurueck - 60) < 0.05, `roundtrip ${zurueck}`)
  assert.ok(z.auftragseingang >= z.aeb) // brutto >= bereinigt
})

test('Inverse EBIT-Zielrechnung liefert benötigten Umsatz', () => {
  const z = zielRueckwaerts('ebit', 3, {})
  assert.ok(z.benoetigterUmsatz > 0)
  assert.ok(z.text.includes('EBIT'))
})

test('Unbekannte KPI: Hinweis statt Rechnung', () => {
  const z = zielRueckwaerts('roce', 12, {})
  assert.ok(/keine direkte/.test(z.text))
})
