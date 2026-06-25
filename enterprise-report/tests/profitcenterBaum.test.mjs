import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { baueBaum, sichtbareZeilen, alleIds, EBENEN, MAX_EBENE } from '../src/core/profitcenterBaum.js'
import { kostenstellen } from '../src/core/pcKostenstellen.js'

const r2 = (x) => Math.round(x * 100) / 100

test('Baum hat 8 Ebenen-Namen und Wurzel Konzern', () => {
  assert.equal(MAX_EBENE, 8)
  assert.equal(EBENEN[7], 'Beleg')
  const root = baueBaum()
  assert.equal(root.ebene, 1)
  assert.ok(root.kinder.length >= 4) // Geschäftsbereiche
})

test('Tiefe erreicht Ebene 8 (Beleg)', () => {
  const root = baueBaum()
  let max = 0
  const lauf = (n) => { max = Math.max(max, n.ebene); n.kinder.forEach(lauf) }
  lauf(root)
  assert.equal(max, 8)
})

test('Roll-up exakt: Wurzel = Summe aller Kostenstellen', () => {
  const root = baueBaum()
  const ks = kostenstellen()
  assert.equal(r2(root.erloes), r2(ks.reduce((s, k) => s + k.erloes, 0)))
  assert.equal(r2(root.kosten), r2(ks.reduce((s, k) => s + k.kosten, 0)))
})

test('Roll-up-Invariante: jeder Elternknoten = eigen + Summe Kinder', () => {
  const root = baueBaum()
  const pruefe = (n) => {
    if (n.kinder.length) {
      const e = r2(n.eigenErloes + n.kinder.reduce((s, c) => s + c.erloes, 0))
      const k = r2(n.eigenKosten + n.kinder.reduce((s, c) => s + c.kosten, 0))
      assert.equal(r2(n.erloes), e, `erloes ${n.id}`)
      assert.equal(r2(n.kosten), k, `kosten ${n.id}`)
      n.kinder.forEach(pruefe)
    }
  }
  pruefe(root)
})

test('Ergebnis = Erlös − Kosten; Ampel g/a/r/n plausibel', () => {
  const root = baueBaum()
  assert.equal(r2(root.ergebnis), r2(root.erloes - root.kosten))
  assert.ok(['g', 'a', 'r', 'n'].includes(root.ampel))
})

test('sichtbareZeilen: nur Wurzel-Kinder ohne offene Knoten', () => {
  const root = baueBaum()
  const z0 = sichtbareZeilen(root, new Set())
  assert.equal(z0.length, root.kinder.length) // nur Ebene 2 sichtbar
  assert.ok(z0.every((r) => r.ebene === 2))
})

test('alleIds aufgeklappt zeigt mehr Zeilen, begrenzt durch maxEbene', () => {
  const root = baueBaum()
  const offen = new Set(alleIds(root, 5)) // bis Kostenstelle
  const z = sichtbareZeilen(root, offen, 5)
  assert.ok(z.length > root.kinder.length)
  assert.ok(z.every((r) => r.ebene <= 5))
})
