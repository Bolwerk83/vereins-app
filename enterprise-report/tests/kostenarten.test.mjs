import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { STAMM, summe, verteilung, kreuztabelle, strukturKennzahlen } from '../src/core/kostenarten.js'

test('Summe = Summe der Positionen', () => {
  const manuell = +STAMM.reduce((n, p) => n + p.betrag, 0).toFixed(2)
  assert.equal(summe(), manuell)
})

test('Verteilung: Anteile summieren ~100 % und sind absteigend', () => {
  const v = verteilung('art')
  const sum = +v.reduce((n, x) => n + x.anteil, 0).toFixed(0)
  assert.ok(Math.abs(sum - 100) <= 1, 'Anteile ~100%: ' + sum)
  for (let i = 1; i < v.length; i++) assert.ok(v[i - 1].betrag >= v[i].betrag)
})

test('Kreuztabelle: Zeilensummen = Summe der Zellen', () => {
  const kt = kreuztabelle('art', 'fixvar')
  for (const z of kt.zeilen) {
    const zellen = kt.spalten.reduce((n, s) => n + (z.zellen[s.key] || 0), 0)
    assert.equal(+zellen.toFixed(2), z.summe)
  }
})

test('Strukturkennzahlen: fix + variabel ~ 100 %', () => {
  const k = strukturKennzahlen()
  assert.ok(Math.abs(k.fixquote + k.variabelquote - 100) <= 1)
  assert.ok(k.kalkquote > 0)
})
