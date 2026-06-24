import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { memo, leereCache, cacheStatus } from '../server/cache.js'

test('memo cacht den Wert innerhalb der TTL (fn nur einmal)', async () => {
  leereCache()
  let calls = 0
  const fn = async () => { calls++; return 42 }
  const a = await memo('k1', 1000, fn, 0)
  const b = await memo('k1', 1000, fn, 500) // innerhalb TTL
  assert.equal(a, 42)
  assert.equal(b, 42)
  assert.equal(calls, 1) // zweiter Aufruf kam aus dem Cache
})

test('memo berechnet nach TTL-Ablauf neu', async () => {
  leereCache()
  let calls = 0
  const fn = async () => { calls++; return calls }
  const a = await memo('k2', 1000, fn, 0)
  const b = await memo('k2', 1000, fn, 1500) // nach Ablauf (bis=1000 < 1500)
  assert.equal(a, 1)
  assert.equal(b, 2)
  assert.equal(calls, 2)
})

test('Single-Flight: gleichzeitige Misses lösen nur EINE Berechnung aus', async () => {
  leereCache()
  let calls = 0
  const fn = () => new Promise((r) => { calls++; setTimeout(() => r('x'), 10) })
  const [a, b, c] = await Promise.all([memo('k3', 1000, fn, 0), memo('k3', 1000, fn, 0), memo('k3', 1000, fn, 0)])
  assert.equal(a, 'x'); assert.equal(b, 'x'); assert.equal(c, 'x')
  assert.equal(calls, 1) // alle drei teilten sich eine Promise
})

test('leereCache(praefix) entfernt nur passende Schlüssel', async () => {
  leereCache()
  await memo('kpi:2025', 1000, async () => 1, 0)
  await memo('kpi:2024', 1000, async () => 2, 0)
  await memo('detail:x', 1000, async () => 3, 0)
  leereCache('kpi:')
  const s = cacheStatus(0)
  const keys = s.eintraege.map((e) => e.key)
  assert.ok(!keys.includes('kpi:2025'))
  assert.ok(!keys.includes('kpi:2024'))
  assert.ok(keys.includes('detail:x'))
})

test('TTL 0 cacht effektiv nicht (sofort abgelaufen)', async () => {
  leereCache()
  let calls = 0
  const fn = async () => { calls++; return calls }
  await memo('k4', 0, fn, 100)
  await memo('k4', 0, fn, 100) // bis=100, now=100 -> 100>100 false -> Miss
  assert.equal(calls, 2)
})
