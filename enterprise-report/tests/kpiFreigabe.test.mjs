import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  statusVon, setzeStatus, darfFreigeben, kpiAnzeige, FREIGABE_STATUS, NICHT_VERFUEGBAR
} from '../src/core/kpiFreigabe.js'

const admin = { id: 'g-gf', bereiche: '*', kontext: ['GF', 'HR', 'FIN'] }
const controller = { id: 'g-controlling', bereiche: '*', kontext: ['FIN'] }
const vertrieb = { id: 'g-vertrieb', bereiche: ['VK', 'MKT'], kontext: [] }

test('Default-Status ist freigegeben', () => {
  assert.equal(statusVon('irgendeine_kpi'), 'freigegeben')
})

test('Status setzen & lesen; freigegeben wird nicht persistiert', () => {
  setzeStatus('umsatz', 'entwurf')
  assert.equal(statusVon('umsatz'), 'entwurf')
  setzeStatus('umsatz', 'deaktiviert')
  assert.equal(statusVon('umsatz'), 'deaktiviert')
  setzeStatus('umsatz', 'freigegeben')
  assert.equal(statusVon('umsatz'), 'freigegeben')
  const roh = JSON.parse(localStorage.getItem('er_kpi_freigabe') || '{}')
  assert.ok(!('umsatz' in roh), 'freigegeben = Default, nicht gespeichert')
})

test('Ungültiger Status wird ignoriert', () => {
  setzeStatus('db', 'quatsch')
  assert.equal(statusVon('db'), 'freigegeben')
})

test('Nur Controlling und Admin dürfen freigeben', () => {
  assert.ok(darfFreigeben(admin))
  assert.ok(darfFreigeben(controller))
  assert.ok(!darfFreigeben(vertrieb))
  assert.ok(!darfFreigeben(null))
})

test('Anzeige: freigegeben → Wert für alle', () => {
  setzeStatus('a1', 'freigegeben')
  assert.equal(kpiAnzeige('a1', vertrieb).modus, 'wert')
  assert.equal(kpiAnzeige('a1', controller).modus, 'wert')
})

test('Anzeige: entwurf → nur Befugte sehen Wert, andere versteckt', () => {
  setzeStatus('a2', 'entwurf')
  assert.equal(kpiAnzeige('a2', controller).modus, 'entwurf')
  assert.equal(kpiAnzeige('a2', admin).modus, 'entwurf')
  assert.equal(kpiAnzeige('a2', vertrieb).modus, 'versteckt')
})

test('Anzeige: deaktiviert → für alle "nicht verfügbar"', () => {
  setzeStatus('a3', 'deaktiviert')
  assert.equal(kpiAnzeige('a3', controller).modus, 'nichtVerfuegbar')
  assert.equal(kpiAnzeige('a3', vertrieb).modus, 'nichtVerfuegbar')
  assert.ok(NICHT_VERFUEGBAR.length < 30) // kurz & verständlich
})

test('FREIGABE_STATUS deckt die drei Zustände ab', () => {
  assert.deepEqual([...FREIGABE_STATUS].sort(), ['deaktiviert', 'entwurf', 'freigegeben'])
})
