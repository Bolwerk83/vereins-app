import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { ladeMarktpotenzial, regionen, gesamt, empfehlungFuer, setzeParameter, setzeZurueck, PRO_KOPF_DEFAULT, ZIEL_ANTEIL_DEFAULT } from '../src/core/marktpotenzial.js'

test('Potenzial = Einwohner × Marktvolumen/Kopf; Ausschöpfung = Ist ÷ Potenzial', () => {
  setzeZurueck()
  const r = regionen().find((x) => x.ort === 'München')
  // 1.488.000 × 80 / 1000 = 119.040 T€
  assert.equal(r.potenzial, Math.round(1488000 * PRO_KOPF_DEFAULT / 1000))
  assert.equal(r.ausschoepfungPct, Math.round(r.istUmsatz / r.potenzial * 1000) / 10)
  assert.ok(r.dichte > 0)
})

test('Berlin & Hamburg sind White Spots (viel Potenzial, schwache Ausschöpfung)', () => {
  setzeZurueck()
  const liste = regionen()
  const berlin = liste.find((x) => x.ort === 'Berlin')
  assert.equal(berlin.whiteSpot, true)
  assert.ok(berlin.ausschoepfungPct < ZIEL_ANTEIL_DEFAULT / 2)
  const g = gesamt()
  assert.ok(g.whiteSpots >= 2)
})

test('Sortierung nach Reserve absteigend; Standort München ist kein White Spot', () => {
  setzeZurueck()
  const liste = regionen()
  for (let i = 1; i < liste.length; i++) assert.ok(liste[i - 1].reserve >= liste[i].reserve)
  const muc = liste.find((x) => x.ort === 'München')
  assert.equal(muc.whiteSpot, false) // hohe Ausschöpfung
})

test('Parameter änderbar und persistent', () => {
  setzeZurueck()
  setzeParameter({ proKopf: 100, zielAnteil: 8 })
  const s = ladeMarktpotenzial()
  assert.equal(s.proKopf, 100)
  assert.equal(s.zielAnteil, 8)
  const r = regionen().find((x) => x.ort === 'München')
  assert.equal(r.potenzial, Math.round(1488000 * 100 / 1000))
  setzeZurueck()
})

test('Empfehlung für White Spot hat Priorität hoch', () => {
  setzeZurueck()
  const berlin = regionen().find((x) => x.ort === 'Berlin')
  assert.equal(empfehlungFuer(berlin).prio, 'hoch')
})

test('Gesamtsummen plausibel', () => {
  setzeZurueck()
  const g = gesamt()
  assert.ok(g.potenzial > g.ist)
  assert.ok(g.reserve > 0)
  assert.ok(g.ausschoepfungPct > 0 && g.ausschoepfungPct < 100)
})
