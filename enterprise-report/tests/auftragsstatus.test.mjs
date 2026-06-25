import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { journal, bestaende, kennzahlen, auftragHistorie } from '../src/core/auftragsstatus.js'

test('Beispiel A-1001: 2 Eingang → 1 geliefert + 1 storniert → 1 bezahlt', () => {
  const h = auftragHistorie('A-1001')
  assert.equal(h.length, 4)
  const b = bestaende() // Endbestände gesamt
  // A-1001 trägt: bezahlt 1, storniert 1, offen 0 bei
  assert.ok(b.bezahlt >= 1 && b.storniert >= 1)
})

test('Laufender Bestand: offen nach Storno+Lieferung wieder 0 (A-1001)', () => {
  const j = journal('2026-01-05')
  const a1001 = j.filter((x) => x.auftrag === 'A-1001')
  const letzte = a1001[a1001.length - 1]
  // nach 05.01: offen aus A-1001 ist 0 (2 rein, 1 geliefert, 1 storniert)
  // (Gesamtbestand kann durch andere Aufträge offen>0 sein — daher A-1001-spezifisch via Historie)
  const hist = auftragHistorie('A-1001').filter((x) => x.datum <= '2026-01-05')
  let offen = 0
  for (const m of hist) { if (m.nach === 'offen') offen += m.menge; if (m.von === 'offen') offen -= m.menge }
  assert.equal(offen, 0)
})

test('AEB = Auftragseingang − Storno (bereinigt)', () => {
  const k = kennzahlen()
  assert.equal(k.aeb, k.auftragseingang - k.storniert)
  assert.ok(k.auftragseingang > 0)
})

test('Stichtag begrenzt das Journal', () => {
  const vor = journal('2026-01-04').length
  const nach = journal('2026-01-31').length
  assert.ok(nach > vor)
})

test('Bezahlt-Bestand wächst monoton bis Monatsende', () => {
  assert.ok(bestaende('2026-01-31').bezahlt >= bestaende('2026-01-09').bezahlt)
})
