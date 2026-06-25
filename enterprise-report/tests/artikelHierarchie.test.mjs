import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { EBENEN, HIERARCHIE, verteile, flach, ebenenSumme, blaetter } from '../src/core/artikelHierarchie.js'

test('7 Ebenen definiert', () => {
  assert.equal(EBENEN.length, 7)
  assert.equal(EBENEN[0], 'Warenbereich')
  assert.equal(EBENEN[6], 'Artikel (SKU)')
})

test('verteile: Gesamtwert wird über Anteile auf Warenbereiche gesplasht', () => {
  const v = verteile(1000000)
  // Fahrräder 70 / Zubehör 20 / Bekleidung 10 → normiert
  const rad = v.find((k) => k.id === 'wb-rad')
  assert.equal(rad.anteilPct, 70)
  assert.equal(rad.wert, 700000)
})

test('Jede Ebene summiert sich (fast) auf den Gesamtwert (top-down konsistent)', () => {
  const gesamt = 1000000
  const baum = verteile(gesamt)
  const tiefen = [...new Set(flach(baum).map((k) => k.tiefe))]
  for (const t of tiefen) {
    // Rundungstoleranz je Knoten
    assert.ok(Math.abs(ebenenSumme(baum, t) - gesamt) / gesamt < 0.01, `Ebene ${t} summiert nicht`)
  }
})

test('Blätter sind SKU-Knoten ohne Kinder', () => {
  const baum = verteile(1000000)
  const bl = blaetter(baum)
  assert.ok(bl.length >= 5)
  assert.ok(bl.every((k) => !k.hatKinder))
  // Blätter summieren sich auf den Gesamtwert
  assert.ok(Math.abs(bl.reduce((n, k) => n + k.wert, 0) - 1000000) / 1000000 < 0.01)
})

test('flach: Ebenen-Label korrekt je Tiefe', () => {
  const baum = verteile(1000)
  const f = flach(baum)
  assert.equal(f[0].ebene, 'Warenbereich')
  assert.ok(f.some((k) => k.ebene === 'Artikel (SKU)'))
})
