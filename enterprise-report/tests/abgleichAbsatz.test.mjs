import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { abgleich, gesamt, ZEILEN, TOLERANZ_PCT } from '../src/core/abgleichAbsatz.js'

test('Abgleich: Differenz und %-Abweichung je Produkt', () => {
  const rows = abgleich()
  const ebike = rows.find((r) => r.id === 'ebike')
  assert.equal(ebike.diff, 22650 - 24000)
  assert.equal(ebike.diffPct, Math.round((ebike.diff / 24000 * 100) * 10) / 10)
})

test('Status: innerhalb Toleranz = im Rahmen, sonst auffällig', () => {
  const rows = abgleich()
  for (const r of rows) assert.equal(r.imRahmen, Math.abs(r.diffPct) <= TOLERANZ_PCT)
  // Akku ist sehr nah dran → im Rahmen; Antrieb (-4%) auffällig
  assert.ok(rows.find((r) => r.id === 'akku').imRahmen)
  assert.ok(!rows.find((r) => r.id === 'antrieb').imRahmen)
})

test('Abgleich nach Betrag der Abweichung sortiert', () => {
  const rows = abgleich()
  for (let i = 1; i < rows.length; i++) assert.ok(Math.abs(rows[i - 1].diffPct) >= Math.abs(rows[i].diffPct))
})

test('Gesamt summiert Absatz/AET und zählt Auffällige', () => {
  const g = gesamt()
  assert.equal(g.absatz, ZEILEN.reduce((n, z) => n + z.absatz, 0))
  assert.equal(g.aet, ZEILEN.reduce((n, z) => n + z.aet, 0))
  assert.ok(g.auffaellig >= 1)
})
