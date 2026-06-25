import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { ladeFavoriten, istFavorit, toggleFavorit, entferneFavorit, fuegeFavoritHinzu } from '../src/core/favoriten.js'
import { bereichVon, VIEW_BEREICH } from '../src/core/navMeta.js'

test('Favorit anpinnen und lösen (Reihenfolge bleibt)', () => {
  localStorage.removeItem('er_favoriten')
  toggleFavorit('marketing'); toggleFavorit('forderungen')
  assert.deepEqual(ladeFavoriten(), ['marketing', 'forderungen'])
  assert.equal(istFavorit('marketing'), true)
  toggleFavorit('marketing')
  assert.deepEqual(ladeFavoriten(), ['forderungen'])
})

test('entferneFavorit', () => {
  localStorage.removeItem('er_favoriten')
  toggleFavorit('bestand'); entferneFavorit('bestand')
  assert.equal(istFavorit('bestand'), false)
})

test('leere View wird ignoriert', () => {
  localStorage.removeItem('er_favoriten')
  toggleFavorit('')
  assert.equal(ladeFavoriten().length, 0)
})

test('Favoriten pro Benutzer getrennt', () => {
  localStorage.removeItem('er_favoriten')
  localStorage.removeItem('er_favoriten:Anna')
  toggleFavorit('kennzahlen', 'Anna'); toggleFavorit('planung', 'Anna')
  assert.deepEqual(ladeFavoriten('Anna'), ['kennzahlen', 'planung'])
  assert.deepEqual(ladeFavoriten('Bob'), [])   // anderer Benutzer leer
  assert.deepEqual(ladeFavoriten(), [])        // Gast unberührt
})

test('fuegeFavoritHinzu ist idempotent (je Benutzer)', () => {
  localStorage.removeItem('er_favoriten:Anna')
  fuegeFavoritHinzu('lager', 'Anna'); fuegeFavoritHinzu('lager', 'Anna')
  assert.deepEqual(ladeFavoriten('Anna'), ['lager'])
  assert.equal(istFavorit('lager', 'Anna'), true)
})

test('bereichVon: bekannte und übergreifende Views', () => {
  assert.equal(bereichVon('forderungen'), 'RIS')
  assert.equal(bereichVon('klr'), 'KLR')
  assert.equal(bereichVon('baum'), null)
  assert.equal(bereichVon('gibtsnicht'), null)
})

test('Alle Bereichscodes sind plausibel (Großbuchstaben oder null)', () => {
  for (const v of Object.values(VIEW_BEREICH)) assert.ok(v === null || /^[A-Z]{2,4}$/.test(v))
})
