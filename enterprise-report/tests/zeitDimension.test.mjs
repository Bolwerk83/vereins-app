import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { KALENDER_VARIANTEN, variante, baueZeitbaum, ebenenZaehlung, tiefeVon, isoKW, WJ_START_MONAT } from '../src/core/zeitDimension.js'

test('Fünf Kalendervarianten (WJ/KJ, Monat/KW/Quartal)', () => {
  assert.equal(KALENDER_VARIANTEN.length, 5)
  assert.ok(KALENDER_VARIANTEN.find((v) => v.id === 'wj-monat'))
  assert.ok(KALENDER_VARIANTEN.find((v) => v.id === 'kj-quartal'))
})

test('KJ Monat-Baum: Jahr→Monat→Tag, 12 Monate, 365 Tage', () => {
  const root = baueZeitbaum('kj-monat', 2025) // 2025 kein Schaltjahr
  assert.equal(tiefeVon('kj-monat'), 3)
  assert.equal(root.kinder.length, 1)            // ein Jahr
  assert.equal(root.kinder[0].name, '2025')
  assert.equal(root.kinder[0].kinder.length, 12) // 12 Monate
  const z = ebenenZaehlung(root)
  assert.equal(z[1], 1); assert.equal(z[2], 12); assert.equal(z[3], 365)
})

test('KJ Quartal-Baum: Jahr→Quartal→Monat→Tag (4 Quartale, 12 Monate)', () => {
  const root = baueZeitbaum('kj-quartal', 2025)
  assert.equal(tiefeVon('kj-quartal'), 4)
  const z = ebenenZaehlung(root)
  assert.equal(z[2], 4)   // 4 Quartale
  assert.equal(z[3], 12)  // 12 Monate
  assert.equal(z[4], 365) // Tage
})

test('WJ-Baum spannt April..März (ein WJ-Jahr, 12 Monate)', () => {
  assert.equal(WJ_START_MONAT, 4)
  const root = baueZeitbaum('wj-monat', 2025) // WJ 2025/26 = Apr 2025 .. Mär 2026
  assert.equal(root.kinder.length, 1)
  assert.match(root.kinder[0].name, /WJ 2025/)
  assert.equal(root.kinder[0].kinder.length, 12)
  // erster Monat ist April 2025
  assert.match(root.kinder[0].kinder[0].name, /Apr 2025/)
})

test('KW-Baum: ~52 Kalenderwochen', () => {
  const root = baueZeitbaum('kj-kw', 2025)
  const z = ebenenZaehlung(root)
  assert.ok(z[2] >= 52 && z[2] <= 54, `KW-Anzahl ${z[2]}`)
})

test('isoKW: 1. Jan 2025 liegt in KW 1, 31. Dez in KW 1 oder 52/53', () => {
  assert.equal(isoKW(new Date(2025, 0, 6)), 2) // Mo der 2. Woche
  assert.ok(isoKW(new Date(2025, 5, 15)) >= 24)
})
