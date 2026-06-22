import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { funnel, kanaele, kampagnen, marketingKpis, webKennzahlen } from '../src/core/marketing.js'

test('Funnel ist monoton fallend; Conversion in %', () => {
  const f = funnel()
  for (let i = 1; i < f.length; i++) assert.ok(f[i].anzahl <= f[i - 1].anzahl)
  assert.equal(f[0].abGesamt, 100)
  assert.ok(f[f.length - 1].abGesamt < 100)
})

test('Kanäle: ROAS = Umsatz / Spend (nur mit Spend)', () => {
  for (const k of kanaele()) {
    if (k.spendMio > 0) assert.equal(k.roas, Math.round(k.umsatzMio / k.spendMio * 10) / 10)
    else assert.equal(k.roas, null)
  }
})

test('Kampagnen: ROAS und CAC berechnet', () => {
  for (const c of kampagnen()) {
    assert.equal(c.roas, Math.round(c.umsatzMio / c.spendMio * 10) / 10)
    assert.equal(c.cac, Math.round(c.spendMio * 1e6 / c.conversions))
  }
})

test('AOV = Umsatz / Transaktionen; KPIs vorhanden', () => {
  const w = webKennzahlen()
  assert.equal(w.aov, Math.round(w.umsatzMio * 1e6 / w.transaktionen))
  assert.ok(marketingKpis().roasGesamt > 0)
})
