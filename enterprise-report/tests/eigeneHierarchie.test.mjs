import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { baueEigeneHierarchie, sichtbareZeilen, alleIds, DIMENSIONEN } from '../src/core/eigeneHierarchie.js'
import { kostenstellen } from '../src/core/pcKostenstellen.js'

const r2 = (x) => Math.round(x * 100) / 100
const summe = (f) => kostenstellen().reduce((s, r) => s + f(r), 0)

test('Frei wählbare Reihenfolge: Region → Funktion', () => {
  const root = baueEigeneHierarchie(['land', 'funktion'], 'ergebnis')
  assert.ok(root.kinder.length >= 2) // mehrere Regionen
  assert.equal(root.kinder[0].ebene, 1)
  assert.ok(root.kinder[0].kinder.every((k) => k.ebene === 2))
})

test('Roll-up exakt: Wurzel = Summe aller Zeilen', () => {
  const root = baueEigeneHierarchie(['pc', 'gruppe'], 'ergebnis')
  assert.equal(r2(root.erloes), r2(summe((r) => r.erloes)))
  assert.equal(r2(root.kosten), r2(summe((r) => r.kosten)))
  assert.equal(r2(root.ergebnis), r2(root.erloes - root.kosten))
})

test('Andere Reihenfolge → andere Baumform, gleiche Summe', () => {
  const a = baueEigeneHierarchie(['pc', 'land'], 'ergebnis')
  const b = baueEigeneHierarchie(['land', 'pc'], 'ergebnis')
  assert.equal(r2(a.ergebnis), r2(b.ergebnis)) // Summe gleich
  // erste Ebene unterschiedlich benannt
  assert.notDeepEqual(a.kinder.map((k) => k.name).sort(), b.kinder.map((k) => k.name).sort())
})

test('Kinder nach Maß sortiert (absteigend nach Betrag)', () => {
  const root = baueEigeneHierarchie(['pc'], 'erloes')
  for (let i = 1; i < root.kinder.length; i++) assert.ok(Math.abs(root.kinder[i - 1].erloes) >= Math.abs(root.kinder[i].erloes))
})

test('sichtbareZeilen + alleIds: aufklappen zeigt tiefere Ebenen', () => {
  const root = baueEigeneHierarchie(['pc', 'funktion', 'gruppe'], 'ergebnis')
  const zu = sichtbareZeilen(root, new Set())
  assert.ok(zu.every((z) => z.ebene === 1))
  const auf = sichtbareZeilen(root, new Set(alleIds(root)))
  assert.ok(auf.some((z) => z.ebene === 3))
})

test('Leere Dimensionsliste → nur Wurzelsumme, keine Kinder', () => {
  const root = baueEigeneHierarchie([], 'ergebnis')
  assert.equal(root.kinder.length, 0)
  assert.equal(r2(root.erloes), r2(summe((r) => r.erloes)))
})
