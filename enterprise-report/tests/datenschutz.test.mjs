import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  klasseVon, setzeKlasse, istGeschuetzt, maskiere, umgebung, setzeUmgebung,
  darfMeasure, setzeOls, rlsVon, setzeRls, complianceScore, toggleCheck, CHECKLISTE
} from '../src/core/datenschutz.js'

test('Personenbezogene Felder werden in dev/test maskiert, in prod nicht', () => {
  assert.equal(klasseVon('DimKunde.Name'), 'personenbezogen')
  assert.ok(istGeschuetzt('personenbezogen'))
  const real = 'Anna Schmidt'
  assert.notEqual(maskiere(real, 'personenbezogen', 'dev'), real)
  assert.notEqual(maskiere(real, 'personenbezogen', 'test'), real)
  assert.equal(maskiere(real, 'personenbezogen', 'prod'), real)
  // interne Felder bleiben unmaskiert
  assert.equal(maskiere('DE', 'intern', 'dev'), 'DE')
})

test('Pseudonymisierung ist deterministisch', () => {
  assert.equal(maskiere('Anna Schmidt', 'personenbezogen', 'dev'), maskiere('Anna Schmidt', 'personenbezogen', 'dev'))
})

test('Umgebung umschaltbar; istGeschuetzt-Klassen', () => {
  setzeUmgebung('test'); assert.equal(umgebung(), 'test')
  setzeUmgebung('prod'); assert.equal(umgebung(), 'prod')
  setzeUmgebung('dev')
  assert.equal(istGeschuetzt('intern'), false)
  assert.equal(istGeschuetzt('sensibel'), true)
})

test('Klassifizierung änderbar', () => {
  setzeKlasse('DimArtikel.SKU', 'oeffentlich')
  assert.equal(klasseVon('DimArtikel.SKU'), 'oeffentlich')
})

test('OLS: Measure für Rolle sperren/freigeben', () => {
  // Seed: Umsatzrendite nur GF/Controlling/Finanzen
  assert.equal(darfMeasure('m-umsatzrendite', 'Vertrieb'), false)
  assert.equal(darfMeasure('m-umsatzrendite', 'Controlling'), true)
  setzeOls('m-umsatzrendite', 'Vertrieb', true)
  assert.equal(darfMeasure('m-umsatzrendite', 'Vertrieb'), true)
  // Measure ohne Regel = alle dürfen
  assert.equal(darfMeasure('m-irgendwas', 'Mitarbeiter'), true)
})

test('RLS-Regel je Dimension', () => {
  assert.equal(rlsVon('DimProfitcenter'), 'eigenerBereich')
  setzeRls('DimProfitcenter', 'alle')
  assert.equal(rlsVon('DimProfitcenter'), 'alle')
})

test('DSGVO-Compliance-Score', () => {
  localStorage.removeItem('er_dsgvo_check')
  assert.equal(complianceScore().erledigt, 0)
  toggleCheck(CHECKLISTE[0].id)
  assert.equal(complianceScore().erledigt, 1)
  assert.ok(complianceScore().prozent > 0)
})
