import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { tagesgewichte, verteilePlan, monatsHochrechnung, tageImMonat } from '../src/core/plankalender.js'

test('Fixkosten: Sonntage = 0, Mo–Sa = 1', () => {
  const tage = tagesgewichte('fixkosten', 8) // September 2026
  for (const t of tage) {
    if (t.dow === 0) assert.equal(t.gewicht, 0, `${t.tag}. (So) sollte 0 sein`)
    else if (!t.feiertag && !t.kurz) assert.equal(t.gewicht, 1)
  }
})

test('Feiertag wird auf 0 gesetzt (3. Oktober)', () => {
  const okt = tagesgewichte('fixkosten', 9)
  const tdE = okt.find((t) => t.tag === 3)
  assert.equal(tdE.gewicht, 0)
  assert.ok(tdE.feiertag)
})

test('Kurzer Tag = 0,5 (Heiligabend), Onlineshop ignoriert Feiertage', () => {
  const dezFix = tagesgewichte('fixkosten', 11)
  const hl = dezFix.find((t) => t.tag === 24)
  if (hl.dow !== 0) assert.equal(hl.gewicht, 0.5)
  // Onlineshop: 24/7, auch 1. Weihnachtstag = 1
  const dezOn = tagesgewichte('onlineshop', 11)
  assert.equal(dezOn.find((t) => t.tag === 25).gewicht, 1)
})

test('verteilePlan: Summe der Tagespläne = Monatsplan', () => {
  const v = verteilePlan('filiale', 9, 600000)
  const summe = v.tage.reduce((s, t) => s + t.plan, 0)
  assert.ok(Math.abs(summe - 600000) < 1, `Summe ${summe} != 600000`)
  assert.ok(v.summeGewicht > 0)
})

test('Geschlossene Tage bekommen 0 € Plan', () => {
  const v = verteilePlan('werktage', 9, 300000)
  for (const t of v.tage) if (t.gewicht === 0) assert.equal(t.plan, 0)
})

test('Monatshochrechnung skaliert mit Gewichtsfortschritt', () => {
  const hr = monatsHochrechnung('fixkosten', 9, 15, 300000)
  assert.ok(hr.gewichtBis > 0 && hr.gewichtGesamt >= hr.gewichtBis)
  assert.ok(hr.hochrechnung > 300000) // Rest des Monats kommt dazu
})

test('tageImMonat: Februar 2026 = 28 Tage', () => {
  assert.equal(tageImMonat(1), 28)
})
