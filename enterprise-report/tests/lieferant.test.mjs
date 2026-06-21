import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { phaseVon, lieferanten, phaseVerteilung } from '../src/core/lieferantenLebenszyklus.js'

test('Phase aus Alter, Wachstum, Liefertreue, Risiko', () => {
  assert.equal(phaseVon({ alterMonate: 4, volumenWachstum: 30 }), 'qualifizierung')
  assert.equal(phaseVon({ alterMonate: 40, liefertreue: 80 }), 'risiko')
  assert.equal(phaseVon({ alterMonate: 40, risiko: 'hoch', liefertreue: 95 }), 'risiko')
  assert.equal(phaseVon({ alterMonate: 40, volumenWachstum: -35, liefertreue: 95 }), 'phaseout')
  assert.equal(phaseVon({ alterMonate: 40, volumenWachstum: 20, liefertreue: 95 }), 'aufbau')
  assert.equal(phaseVon({ alterMonate: 40, volumenWachstum: 3, liefertreue: 95 }), 'stamm')
})

test('Lieferanten haben Phase; Verteilungsanteile ~100 %', () => {
  assert.ok(lieferanten().every((l) => l.phase))
  const sum = phaseVerteilung().reduce((n, p) => n + p.anteil, 0)
  assert.ok(Math.abs(sum - 100) <= 1.5)
})
