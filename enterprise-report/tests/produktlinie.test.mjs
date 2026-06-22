import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { produkte } from '../src/core/lebenszyklus.js'
import {
  kandidaten, ladeMatches, bestaetigeMatch, loeseMatch, offeneVorschlaege, produktLinien, mitLinien
} from '../src/core/produktlinie.js'

test('Nachfolge-Kandidaten stammen aus den Stammdaten (vorgaenger-Feld)', () => {
  const k = kandidaten()
  assert.ok(k.length >= 2)
  assert.ok(k.every((x) => x.vorgaenger && x.nachfolger && x.vorgaenger !== x.nachfolger))
})

test('Default: erster Kandidat ist validiert, Rest bleibt offen', () => {
  localStorage.removeItem('er_artikel_matches')
  const m = ladeMatches()
  assert.equal(m.length, 1)
  assert.equal(m[0].validiert, true)
  assert.ok(offeneVorschlaege().length >= 1)
})

test('Match bestätigen ist persistent & idempotent, lösen entfernt', () => {
  localStorage.removeItem('er_artikel_matches')
  const offen = offeneVorschlaege()[0]
  bestaetigeMatch({ vorgaenger: offen.vorgaenger, nachfolger: offen.nachfolger, von: 'Tester' })
  bestaetigeMatch({ vorgaenger: offen.vorgaenger, nachfolger: offen.nachfolger, von: 'Tester' }) // idempotent
  const nach = ladeMatches()
  assert.equal(nach.filter((m) => m.nachfolger === offen.nachfolger).length, 1)
  const id = nach.find((m) => m.nachfolger === offen.nachfolger).id
  loeseMatch(id)
  assert.ok(!ladeMatches().some((m) => m.id === id))
})

test('Produktlinie summiert Umsatz aller Generationen, Phase folgt dem aktuellen Artikel', () => {
  localStorage.removeItem('er_artikel_matches')
  const m = ladeMatches() // ein validierter Match
  const linien = produktLinien(m)
  const komb = linien.find((l) => l.kombiniert)
  assert.ok(komb, 'es gibt mindestens eine kombinierte Linie')
  const arts = produkte('artikel')
  const summe = +komb.members.reduce((n, x) => n + x.umsatz, 0).toFixed(1)
  assert.equal(komb.umsatz, summe)
  // Phase/Wachstum = neueste Generation (letztes Member)
  const neu = komb.members[komb.members.length - 1]
  assert.equal(komb.phase, neu.phase)
  assert.equal(komb.wachstum, neu.wachstum)
  // Linienzahl = Artikelzahl minus verkettete Glieder
  assert.equal(linien.length, arts.length - m.length)
})

test('mitLinien deckt den Gesamtumsatz der Artikel ab (nichts verloren)', () => {
  localStorage.removeItem('er_artikel_matches')
  const ges = +produkte('artikel').reduce((n, a) => n + a.umsatz, 0).toFixed(1)
  const summe = +mitLinien().reduce((n, l) => n + l.umsatz, 0).toFixed(1)
  assert.ok(Math.abs(ges - summe) <= 0.2)
})

test('Ohne validierte Matches bleibt jeder Artikel eine eigene Linie', () => {
  localStorage.setItem('er_artikel_matches', '[]')
  const linien = produktLinien()
  assert.equal(linien.length, produkte('artikel').length)
  assert.ok(linien.every((l) => !l.kombiniert))
})
