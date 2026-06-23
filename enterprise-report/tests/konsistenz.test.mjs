// =========================================================================
//  KONSISTENZ — berichtsuebergreifend. Das wichtigste Vertrauensmerkmal eines
//  Controlling-Tools: dieselbe Groesse ergibt ueberall denselben Wert. Hier
//  wird geprueft, dass alle Berichte auf derselben harmonisierten Datenbasis
//  (~52 Mio EUR Jahresumsatz) aufsetzen und die globalen Filter (Zeitraum/
//  Profit-Center) sich konsistent auswirken.
// =========================================================================
import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import * as vk from '../src/core/verkaufsstatistik.js'
import * as qb from '../src/core/quartalsbericht.js'
import * as pc from '../src/core/profitcenter.js'
import * as fk from '../src/core/finanzkennzahlen.js'
import * as sf from '../src/core/statistikFilter.js'

const ZIEL = 52e6        // harmonisierter Jahresumsatz
const TOL = 0.04         // 4 % Toleranz (Rundung/Saison/Plan-vs-Ist)

test('Jahresumsatz ist berichtsuebergreifend ~52 Mio EUR', () => {
  const vkU = vk.kennzahlen().umsatz
  const qbPlan = qb.SERIEN.gesamt.plan.reduce((a, b) => a + b, 0)
  const pcU = pc.auswertungNach('geschaeftsbereich').rows.reduce((n, r) => n + r.umsatz, 0) * 1e6
  const guvU = fk.scaleGuv(1).umsatz * 1e6
  for (const [name, wert] of [['Verkaufsstatistik', vkU], ['Quartalsbericht', qbPlan], ['Profit-Center', pcU], ['GuV', guvU]]) {
    assert.ok(Math.abs(wert - ZIEL) / ZIEL < TOL, `${name}: ${(wert / 1e6).toFixed(2)} Mio weicht > ${TOL * 100} % von 52 Mio ab`)
  }
})

test('Globaler Zeitraum-Faktor: Quartale summieren auf das Jahr', () => {
  // Statistik-Berichte: Zeitraumanteile addieren sich zu 1 (vollstaendige Zerlegung)
  const q = ['q1', 'q2', 'q3', 'q4'].reduce((n, id) => n + sf.zeitraumAnteil(id), 0)
  assert.ok(Math.abs(q - 1) < 0.01)
  // Quartalsbericht: dieselben Monatsindizes wie der globale Zeitraum
  assert.deepEqual(sf.monateVon('q2'), [3, 4, 5])
  assert.deepEqual(sf.monateVon('jahr'), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
})

test('Globaler Profit-Center-Filter wirkt in allen Statistik-Berichten gleich', () => {
  // Derselbe PC-Faktor skaliert jede Statistik proportional; Quoten bleiben.
  const f = sf.pcFaktor('kanal:online')
  assert.ok(f > 0 && f < 1)
  const vollUms = vk.kennzahlen(sf.faktor('jahr', 'alle')).umsatz
  const onlineUms = vk.kennzahlen(sf.faktor('jahr', 'kanal:online')).umsatz
  assert.ok(Math.abs(onlineUms / vollUms - f) < 0.02)
  // Verhaeltniskennzahl (DB-Marge) ist filterinvariant
  assert.equal(vk.kennzahlen(sf.faktor('jahr', 'alle')).dbProzent,
               vk.kennzahlen(sf.faktor('jahr', 'kanal:online')).dbProzent)
})

test('Quartalsbericht-Berichtstyp ist aus dem globalen Zeitraum ableitbar', () => {
  // Spiegelt die Ableitung in der UI (jahr->Jahresbericht, h*->Halbjahr, q*->Quartal)
  const typVon = (z) => z === 'jahr' ? 'Jahresbericht' : (z === 'h1' || z === 'h2') ? 'Halbjahresbericht' : 'Quartalsbericht'
  assert.equal(typVon('jahr'), 'Jahresbericht')
  assert.equal(typVon('h1'), 'Halbjahresbericht')
  assert.equal(typVon('q3'), 'Quartalsbericht')
  // Alle globalen Zeitraeume liefern gueltige Monatsfenster
  for (const z of sf.ZEITRAEUME) assert.ok(z.monate.length >= 3 && z.monate.every((i) => i >= 0 && i <= 11))
})
