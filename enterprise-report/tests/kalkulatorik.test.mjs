import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { BAUSTEINE, baustein, felderVon, setFelder, wertVon, gesamt } from '../src/core/kalkulatorik.js'

test('Formeln rechnen korrekt', () => {
  assert.equal(baustein('abschreibung').berechne({ wbw: 5.0, nd: 8, rw: 0.5 }), 0.56)
  assert.equal(baustein('zinsen').berechne({ kapital: 12.8, satz: 6 }), 0.77)
  assert.equal(baustein('wagnis').berechne({ bezug: 52, satz: 1 }), 0.52)
  assert.equal(baustein('unternehmerlohn').berechne({ gehalt: 180000 }), 0.18)
})

test('Vorschlag leitet sich aus werten ab (Zinsen ~45 % der Bilanzsumme)', () => {
  const v = baustein('zinsen').vorschlag({ bilanzsumme: 28.5 })
  assert.ok(Math.abs(v.patch.kapital - 12.8) <= 0.2)
  assert.equal(v.patch.satz, 6)
  assert.match(v.text, /Bilanzsumme/)
})

test('Konfiguration persistiert und fließt in die Summe', () => {
  setFelder('zinsen', { kapital: 10, satz: 5 })
  assert.equal(wertVon('zinsen'), 0.5)
  const g = gesamt()
  assert.ok(g.zeilen.length === BAUSTEINE.length)
  assert.equal(+(g.anders + g.zusatz).toFixed(2), g.summe)
})
