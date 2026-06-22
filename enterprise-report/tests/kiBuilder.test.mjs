import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { KATALOG, vorschlag, generiereBericht, visFuer } from '../src/core/kiBuilder.js'
import { ladeKi, setzeKi, kiAktiv, datenStandort, MODI } from '../src/core/kiEinstellungen.js'
import {
  speichereBericht, eigeneBerichte, sichtbareBerichte, teileBericht, teileOrdner, aehnlicheBerichte,
  togglePrivat, entdeckbareBerichte, alsGlobalSpeichern, ladeGlobale
} from '../src/core/berichtOrdner.js'

test('KI-Vorschlag wählt passende Darstellung je Datenart', () => {
  assert.equal(vorschlag('umsatz').viz, visFuer('zeitreihe').viz)
  assert.equal(vorschlag('umsatz_kanal').viz, visFuer('anteil').viz)
  const b = generiereBericht(['umsatz', 'roce'])
  assert.equal(b.bloecke.length, 2)
  assert.ok(b.titel.startsWith('Bericht:'))
})

test('KI-Schalter & Datensouveränität', () => {
  localStorage.removeItem('er_ki')
  assert.equal(kiAktiv(), true)
  assert.equal(ladeKi().modus, 'lokal')
  setzeKi({ aktiv: false })
  assert.equal(kiAktiv(), false)
  assert.match(datenStandort(), /deaktiviert/)
  setzeKi({ aktiv: true, modus: 'extern' })
  assert.ok(MODI.find((m) => m.id === 'extern'))
})

test('Benutzerordner: speichern, eigene vs. sichtbare', () => {
  localStorage.removeItem('er_benutzerberichte')
  speichereBericht('user:Max', { titel: 'Umsatzbericht', items: ['umsatz', 'db'], summary: 's' })
  assert.equal(eigeneBerichte('user:Max').length, 1)
  assert.equal(sichtbareBerichte('user:Erika').length, 0) // sieht fremde (noch) nicht
})

test('Teilen: einzelner Bericht und ganzer Ordner', () => {
  localStorage.removeItem('er_benutzerberichte')
  const b = speichereBericht('user:Max', { titel: 'A', items: ['umsatz'], summary: 's' })
  teileBericht('user:Max', b.id, 'user:Erika')
  assert.equal(sichtbareBerichte('user:Erika').length, 1)
  speichereBericht('user:Max', { titel: 'B', items: ['roce'], summary: 's' })
  teileOrdner('user:Max', 'user:Tom')
  assert.equal(sichtbareBerichte('user:Tom').length, 2)
})

test('Privat-Flag steuert Entdeckbarkeit', () => {
  localStorage.removeItem('er_benutzerberichte')
  speichereBericht('user:Max', { titel: 'Öffentlich', items: ['umsatz'], summary: 's', privat: false })
  const priv = speichereBericht('user:Max', { titel: 'Geheim', items: ['db'], summary: 's', privat: true })
  const ent = entdeckbareBerichte('user:Erika')
  assert.equal(ent.length, 1)
  assert.equal(ent[0].titel, 'Öffentlich')
  togglePrivat('user:Max', priv.id) // jetzt entdeckbar
  assert.equal(entdeckbareBerichte('user:Erika').length, 2)
})

test('Duplikat-Check schlägt ähnliche Berichte vor', () => {
  localStorage.removeItem('er_benutzerberichte')
  speichereBericht('user:Max', { titel: 'Finanzlage', items: ['roce', 'ekquote', 'liquiditaet'], summary: 's' })
  const sim = aehnlicheBerichte(['roce', 'ekquote'], 'user:Max')
  assert.ok(sim.length >= 1 && sim[0].score > 0.3)
})

test('Admin promotet Bericht zu global (dedupliziert)', () => {
  localStorage.removeItem('er_globale_berichte')
  alsGlobalSpeichern({ titel: 'Standard-Cockpit', items: ['umsatz', 'roce'], summary: 's' })
  alsGlobalSpeichern({ titel: 'Standard-Cockpit', items: ['umsatz', 'roce'], summary: 's' }) // Duplikat
  assert.equal(ladeGlobale().length, 1)
})
