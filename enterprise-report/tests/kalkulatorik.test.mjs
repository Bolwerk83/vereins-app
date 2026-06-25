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

import { felderVon as fJ, setFelder as sJ, wertVon as wJ, kopiereJahr, verfuegbareJahre, monatsVerteilung, DEFAULT_JAHR } from '../src/core/kalkulatorik.js'

test('Jahres-Versionierung: Werte je Jahr getrennt', () => {
  localStorage.removeItem('er_kalkulatorik')
  sJ('zinsen', { kapital: 10, satz: 5 }, 2026)   // 0,5
  sJ('zinsen', { kapital: 20, satz: 5 }, 2027)   // 1,0
  assert.equal(wJ('zinsen', 2026), 0.5)
  assert.equal(wJ('zinsen', 2027), 1.0)
})

test('Vorjahr kopieren übernimmt die Konfiguration', () => {
  localStorage.removeItem('er_kalkulatorik')
  sJ('zinsen', { kapital: 15, satz: 4 }, 2026)
  kopiereJahr(2027, 2026)
  assert.deepEqual(fJ('zinsen', 2027), fJ('zinsen', 2026))
  assert.equal(wJ('zinsen', 2027), wJ('zinsen', 2026))
})

test('Monatsverteilung: 12 Monate, Summe = Jahreswert', () => {
  localStorage.removeItem('er_kalkulatorik')
  sJ('zinsen', { kapital: 12, satz: 5 }, 2026) // 0,6
  const mv = monatsVerteilung('zinsen', 2026, 'gleich')
  assert.equal(mv.length, 12)
  assert.ok(Math.abs(mv.reduce((a, b) => a + b, 0) - wJ('zinsen', 2026)) < 0.01)
})

test('Legacy-Migration: altes flaches Format landet unter DEFAULT_JAHR', () => {
  localStorage.setItem('er_kalkulatorik', JSON.stringify({ zinsen: { kapital: 8, satz: 5 } }))
  assert.equal(wJ('zinsen', DEFAULT_JAHR), 0.4)
  assert.ok(verfuegbareJahre().includes(DEFAULT_JAHR))
})
