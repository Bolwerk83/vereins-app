import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { QUIZ, quizVon, bewerte, quizErgebnis, markiereQuiz, quizBestanden, quizFortschritt, hatQuiz } from '../src/core/quiz.js'
import { LEKTIONEN } from '../src/core/lernpfad.js'

test('Jede Frage hat gültige Optionen und korrekten Index', () => {
  for (const fragen of Object.values(QUIZ)) {
    for (const f of fragen) {
      assert.ok(f.frage && f.erklaerung)
      assert.ok(Array.isArray(f.optionen) && f.optionen.length >= 2)
      assert.ok(f.richtig >= 0 && f.richtig < f.optionen.length)
    }
  }
})

test('Quiz-IDs verweisen auf existierende Lektionen', () => {
  const ids = new Set(LEKTIONEN.map((l) => l.id))
  for (const id of Object.keys(QUIZ)) assert.ok(ids.has(id), `unbekannte Lektion: ${id}`)
})

test('bewerte erkennt richtige Antwort', () => {
  const f = quizVon('l-deckungsbeitrag')[0]
  assert.equal(bewerte(f, f.richtig), true)
  assert.equal(bewerte(f, (f.richtig + 1) % f.optionen.length), false)
})

test('quizErgebnis: alle richtig = bestanden', () => {
  const id = 'l-was-kosten'
  const richtig = quizVon(id).map((f) => f.richtig)
  const erg = quizErgebnis(id, richtig)
  assert.equal(erg.bestanden, true)
  assert.equal(erg.richtig, erg.gesamt)
})

test('Bestandener Check wird gespeichert und zählt im Fortschritt', () => {
  localStorage.removeItem('er_quiz')
  assert.equal(quizBestanden('l-bab'), false)
  markiereQuiz('l-bab')
  assert.equal(quizBestanden('l-bab'), true)
  assert.equal(quizFortschritt().fertig, 1)
})

test('hatQuiz für Lektion mit Frage', () => {
  assert.equal(hatQuiz('l-ergebnis'), true)
})
