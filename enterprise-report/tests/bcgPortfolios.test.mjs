import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { portfolioListe, portfolio } from '../src/core/bcgPortfolios.js'
import { quadrantVon } from '../src/core/lebenszyklus.js'

test('Portfolio-Liste enthält mehrere aussagekräftige Sichten', () => {
  const liste = portfolioListe()
  assert.ok(liste.length >= 5)
  for (const id of ['produkte', 'kunden', 'kanaele', 'regionen', 'lieferanten']) {
    assert.ok(liste.some((p) => p.id === id), `Portfolio ${id} vorhanden`)
  }
})

test('Jedes Portfolio: ≥4 Objekte, 4 Felder, Mehrwert + Quadranten-Lesart', () => {
  for (const { id } of portfolioListe()) {
    const p = portfolio(id)
    assert.ok(p.objekte.length >= 4, `${id} hat genug Objekte`)
    assert.equal(p.felder.length, 4)
    assert.ok(p.mehrwert && p.mehrwert.length > 30, `${id} hat Mehrwert-Text`)
    assert.ok(Array.isArray(p.fragen) && p.fragen.length >= 3)
    for (const f of ['star', 'cashcow', 'question', 'dog']) {
      assert.ok(p.quadrant[f] && p.quadrant[f].length > 10, `${id}/${f} Lesart vorhanden`)
    }
  }
})

test('Quadranten-Zuordnung ist konsistent und deckt alle Objekte ab', () => {
  for (const { id } of portfolioListe()) {
    const p = portfolio(id)
    // jedes Objekt trägt genau den Quadranten, den die Schwellen ergeben
    for (const o of p.objekte) assert.equal(o.quadrant, quadrantVon(o, p.schwellen))
    // Summe der Feld-Anzahlen = Objektzahl (Partition)
    assert.equal(p.felder.reduce((n, f) => n + f.anzahl, 0), p.objekte.length)
    // Umsatzsumme der Felder ≈ Objektsumme
    const ges = +p.objekte.reduce((n, o) => n + o.umsatz, 0).toFixed(1)
    assert.ok(Math.abs(p.felder.reduce((n, f) => n + f.umsatz, 0) - ges) <= 0.3)
  }
})

test('Unbekannte id fällt sicher auf das erste Portfolio zurück', () => {
  assert.equal(portfolio('gibtsnicht').id, portfolioListe()[0].id)
})
