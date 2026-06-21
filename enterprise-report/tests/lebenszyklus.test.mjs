import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { phaseVon, daten, kinder, phaseVerteilung } from '../src/core/lebenszyklus.js'

test('phaseVon leitet aus Wachstum ab', () => {
  assert.equal(phaseVon(35), 'einfuehrung')
  assert.equal(phaseVon(9), 'wachstum')
  assert.equal(phaseVon(-2), 'reife')
  assert.equal(phaseVon(-6), 'rueckgang')
})

test('drei Ebenen liefern Objekte mit Phase', () => {
  for (const e of ['artikel', 'produkt', 'kunde']) {
    const d = daten(e)
    assert.ok(d.length > 0)
    assert.ok(d.every((o) => o.phase))
  }
})

test('Drill-down: Artikel hängen an Produktgruppen', () => {
  const ebike = kinder('ebike')
  assert.ok(ebike.length >= 2)
  assert.ok(ebike.every((a) => a.parent === 'ebike'))
})

test('Phasenverteilung: Umsatzanteile ~100 %', () => {
  const v = phaseVerteilung('produkt')
  const sum = v.reduce((n, x) => n + x.anteil, 0)
  assert.ok(Math.abs(sum - 100) <= 1.5, 'Summe Anteile: ' + sum)
})
