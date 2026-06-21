import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { bruecken, abstimmZusammenfassung, setNotiz, ladeNotiz } from '../src/core/abstimmung.js'
import { berechneAlle } from '../src/core/kpiRegistry.js'
import { MOCK } from '../src/data/mock.js'

const w = berechneAlle(MOCK.roheWerte['2025'])

test('Differenz = Ist − Buchhaltung, Toleranz bestimmt imRahmen', () => {
  const b = bruecken(w, '2025')
  const wa = b.find((x) => x.id === 'wareneinsatz')
  assert.equal(+(wa.ist - wa.buchhaltung).toFixed(2), wa.diff)
  assert.equal(wa.imRahmen, Math.abs(wa.diff) <= wa.toleranz)
})

test('Auto-Status: im Rahmen = abgestimmt, sonst klärung', () => {
  const b = bruecken(w, '2025')
  const um = b.find((x) => x.id === 'umsatz')      // delta 0
  const wa = b.find((x) => x.id === 'wareneinsatz') // delta über Toleranz
  assert.equal(um.status, 'abgestimmt')
  assert.equal(wa.status, 'klaerung')
})

test('Zusammenfassung zählt offen/abgestimmt korrekt', () => {
  const z = abstimmZusammenfassung(w, '2025')
  assert.equal(z.gesamt, 10)
  assert.equal(z.offen + z.abgestimmt, z.gesamt)
  assert.ok(z.diffSumme > 0)
})

test('Hauptbuch (absolute Salden) überschreibt das Mock-Delta', () => {
  const hb = { umsatz: 50.0 } // bewusste Differenz zum Ist (52.0)
  const b = bruecken(w, '2025', hb)
  const um = b.find((x) => x.id === 'umsatz')
  assert.equal(um.buchhaltung, 50.0)
  assert.equal(um.diff, +(um.ist - 50.0).toFixed(2))
  // Positionen ohne Hauptbuch-Wert fallen auf das Delta zurück
  const wa = b.find((x) => x.id === 'wareneinsatz')
  assert.equal(wa.buchhaltung, +(wa.ist + wa.delta).toFixed(2))
})

test('Notiz wird je Periode persistiert und überschreibt Auto-Status', () => {
  setNotiz('2025-TEST', 'wareneinsatz', { status: 'abgestimmt', kommentar: 'geklärt' })
  const n = ladeNotiz('2025-TEST', 'wareneinsatz')
  assert.equal(n.status, 'abgestimmt')
  assert.equal(n.kommentar, 'geklärt')
  const b = bruecken(w, '2025-TEST')
  assert.equal(b.find((x) => x.id === 'wareneinsatz').status, 'abgestimmt')
})
