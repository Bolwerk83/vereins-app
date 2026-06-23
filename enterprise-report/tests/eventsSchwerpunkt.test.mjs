import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { ladeEvents, schwerpunktAbgleich, addSchwerpunkt, loescheSchwerpunkt, ZIELTYPEN } from '../src/core/events.js'

test('Schwerpunkt-Abgleich: Ist aus Wirksamkeit, Erreichung & Ampel', () => {
  localStorage.removeItem('er_events')
  const bw = ladeEvents().find((e) => e.id === 'blackweek25')
  const rows = schwerpunktAbgleich(bw)
  const ebike = rows.find((s) => s.fokus === 'E-Bikes')
  // Mehrumsatz E-Bikes = 1.480.000 − 900.000 = 580.000, Ziel 500.000 → > 100 %, grün
  assert.equal(ebike.ist, 580000)
  assert.ok(ebike.erreichungPct >= 100)
  assert.equal(ebike.ampel, 'g')
  const auslauf = rows.find((s) => s.zielTyp === 'abbau')
  // Abbau = 600.000 − 470.000 = 130.000, Ziel 150.000 → 87 %, gelb
  assert.equal(auslauf.ist, 130000)
  assert.equal(auslauf.ampel, 'a')
})

test('Schwerpunkt hinzufügen/löschen (persistent)', () => {
  localStorage.removeItem('er_events')
  addSchwerpunkt('weihnachten25', { fokus: 'gesamt', zielTyp: 'db', zielwert: 50000, frist: '2025-12-24' })
  let e = ladeEvents().find((x) => x.id === 'weihnachten25')
  const neu = e.schwerpunkte.find((s) => s.zielTyp === 'db')
  assert.ok(neu)
  const abg = schwerpunktAbgleich(e).find((s) => s.id === neu.id)
  assert.ok(abg.ist > 0)
  loescheSchwerpunkt('weihnachten25', neu.id)
  e = ladeEvents().find((x) => x.id === 'weihnachten25')
  assert.ok(!e.schwerpunkte.some((s) => s.id === neu.id))
})

test('Zieltypen vollständig', () => {
  assert.ok(ZIELTYPEN.length >= 4)
  assert.ok(ZIELTYPEN.every((z) => z.quelle && z.einheit))
})
