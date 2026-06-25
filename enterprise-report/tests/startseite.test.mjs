import { strict as assert } from 'assert'
import { test } from 'node:test'
import {
  QUELLEN_STAND, IMPORT_JOBS, IMPORT_FEHLER,
  gesamtStand, gesamtStatus, problemJobs, alleAktuell
} from '../src/core/datenstand.js'

test('gesamtStand: ältester Stand', () => {
  const stände = QUELLEN_STAND.map((q) => q.stand).sort()
  assert.equal(gesamtStand(), stände[0])
})

test('alleAktuell: false wenn veraltet', () => {
  assert.equal(alleAktuell(), false, 'ZIV ist veraltet → nicht alle aktuell')
})

test('IMPORT_JOBS: mindestens 4 Jobs', () => {
  assert.ok(IMPORT_JOBS.length >= 4)
})

test('IMPORT_JOBS: alle haben Pflichtfelder', () => {
  for (const j of IMPORT_JOBS) {
    assert.ok(j.id,            `Job ohne id: ${JSON.stringify(j)}`)
    assert.ok(j.quelle,        `Job ohne quelle: ${j.id}`)
    assert.ok(j.letzterLauf,   `Job ohne letzterLauf: ${j.id}`)
    assert.ok(j.naechsterLauf, `Job ohne naechsterLauf: ${j.id}`)
    assert.ok(j.status,        `Job ohne status: ${j.id}`)
  }
})

test('problemJobs: veraltet-Jobs enthalten', () => {
  const p = problemJobs()
  assert.ok(p.length >= 1, 'Mindestens ein Job veraltet/fehlerhaft')
  assert.ok(p.some((j) => j.status === 'veraltet'))
})

test('gesamtStatus: warnung wegen veralteter Daten', () => {
  const s = gesamtStatus()
  assert.ok(['warnung', 'fehler'].includes(s), `Erwartet warnung/fehler, got: ${s}`)
})

test('IMPORT_FEHLER: Warnung für ZIV enthalten', () => {
  assert.ok(IMPORT_FEHLER.some((f) => f.job === 'ziv'), 'ZIV-Warnung fehlt')
})
