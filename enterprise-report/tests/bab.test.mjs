import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { gewichte, schluessel } from '../src/core/verteilung.js'
import { bab, FM, FL } from '../src/core/babVoll.js'

test('Gewichte eines Schlüssels summieren auf 1', () => {
  for (const id of ['flaeche', 'gehaltsliste', 'verwaltungslast', 'direkt_vertrieb']) {
    const sum = Object.values(gewichte(schluessel(id))).reduce((n, v) => n + v, 0)
    assert.ok(Math.abs(sum - 1) < 1e-9, id + ' Summe ' + sum)
  }
})

test('Verteilung je Kostenart = Summe (über alle Bereiche)', () => {
  for (const k of bab().kostenarten) {
    const verteilt = Object.values(k.verteilung).reduce((n, v) => n + v, 0)
    assert.ok(Math.abs(verteilt - k.summe) <= 0.05, k.id + ': ' + verteilt + ' vs ' + k.summe)
  }
})

test('Umlage verteilt den Allgemein-Bereich vollständig', () => {
  const b = bab()
  const umlageSum = Object.values(b.umlage).reduce((n, v) => n + v, 0)
  assert.ok(Math.abs(umlageSum - b.primaer.allgemein) <= 0.05)
})

test('Zuschlagssätze: Material auf FM, Fertigung auf FL', () => {
  const b = bab()
  assert.equal(b.zuschlag.material, +(b.nachUmlage.material / FM * 100).toFixed(1))
  assert.equal(b.zuschlag.fertigung, +(b.nachUmlage.fertigung / FL * 100).toFixed(1))
})
