import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { empfehlungen, zusammenfassung } from '../src/core/lebenszyklusEmpfehlung.js'

test('Empfehlungen für Produkte und Kunden vorhanden', () => {
  const l = empfehlungen()
  assert.ok(l.some((e) => e.typ === 'produkt'))
  assert.ok(l.some((e) => e.typ === 'kunde'))
})

test('Sortierung: dringend (Prio 1) zuerst', () => {
  const l = empfehlungen()
  for (let i = 1; i < l.length; i++) assert.ok(l[i - 1].prio <= l[i].prio)
})

test('Jede Empfehlung hat eine übernehmbare Maßnahme mit quelle-Tag', () => {
  for (const e of empfehlungen()) {
    assert.ok(e.massnahme && e.massnahme.titel)
    assert.match(e.massnahme.quelle, /^lebenszyklus:(produkt|kunde)$/)
    assert.ok(['risiko', 'chance', 'halten'].includes(e.art))
  }
})

test('Rückgang-Produkt erzeugt Risiko-Empfehlung', () => {
  // Bekleidung (wachstum -6) ist im Rückgang.
  const e = empfehlungen().find((x) => x.objektId === 'bekleidung')
  assert.equal(e.art, 'risiko')
  assert.equal(e.prio, 1)
})

test('Gefährdeter Kunde wird dringend', () => {
  // Radhaus Müller: letzteBestellung 95 Tage + wachstum -18 → gefährdet
  const e = empfehlungen().find((x) => x.objektId === 'k-radhaus')
  assert.equal(e.art, 'risiko')
})

test('Zusammenfassung zählt dringende und Risiko-Umsatz', () => {
  const z = zusammenfassung()
  assert.ok(z.dringend >= 1)
  assert.ok(z.risikoUmsatz > 0)
  assert.equal(z.gesamt, empfehlungen().length)
})
