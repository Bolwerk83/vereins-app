import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PLAN_PRODUKTE, produktVon, rechneZeile, rechnePlan, topDownVerteilung,
  mengeAusBetrag, liquiditaet, neuerPlan, kopierePlan, planVon, ladePlaene,
  loeschePlan, speicherePlan, AE_UMSATZ_FAKTOR
} from '../src/core/planung.js'

function reset() { localStorage.removeItem('er_plaene') }

test('rechneZeile: Umsatz=Menge×VK, Wareneinsatz inkl. Schwund + ohne-Umsatz', () => {
  reset()
  const z = rechneZeile('ebike', { menge: 1000, ohneUmsatz: 50 }, 3)
  const p = produktVon('ebike')
  assert.equal(z.umsatz, 1000 * p.vkPreis)
  // Beschaffung = 1000*1.03 + 50 = 1080
  assert.equal(z.beschaffungsmenge, Math.round(1000 * 1.03 + 50))
  assert.equal(z.wareneinsatz, z.beschaffungsmenge * p.ekPreis)
  assert.equal(z.db, z.umsatz - z.wareneinsatz)
})

test('ohne-Umsatz erzeugt Kosten aber keinen Umsatz', () => {
  const ohne = rechneZeile('ebike', { menge: 0, ohneUmsatz: 10 }, 0)
  assert.equal(ohne.umsatz, 0)
  assert.ok(ohne.wareneinsatz > 0)
  assert.ok(ohne.db < 0)
})

test('rechnePlan: Bottom-Up-Rollup + DB-Quote + AE-Hochrechnung', () => {
  reset()
  const plan = { id: 't', name: 'T', typ: 'budget', jahr: 2026, schwundPct: 0,
    zeilen: { ebike: { menge: 100, ohneUmsatz: 0 }, akku: { menge: 0, ohneUmsatz: 0 },
      zubehoer: { menge: 0, ohneUmsatz: 0 }, bekleidung: { menge: 0, ohneUmsatz: 0 } } }
  const r = rechnePlan(plan)
  assert.equal(r.umsatz, 100 * produktVon('ebike').vkPreis)
  assert.equal(r.db, r.umsatz - r.wareneinsatz)
  assert.equal(r.ae, Math.round(r.umsatz / AE_UMSATZ_FAKTOR))
  assert.ok(r.ae >= r.umsatz) // AE ist größer als Umsatz (Faktor < 1)
})

test('Top-Down: Ziel-Umsatz wird über Anteile verteilt und ungefähr getroffen', () => {
  reset()
  const plan = { id: 't', name: 'T', typ: 'budget', jahr: 2026, schwundPct: 0,
    zeilen: { ebike: { menge: 100, ohneUmsatz: 0 }, akku: { menge: 200, ohneUmsatz: 0 },
      zubehoer: { menge: 1000, ohneUmsatz: 0 }, bekleidung: { menge: 500, ohneUmsatz: 0 } } }
  const ziel = 5_000_000
  const neu = topDownVerteilung(plan, ziel)
  const r = rechnePlan(neu)
  // Rundung je Produkt → Toleranz
  assert.ok(Math.abs(r.umsatz - ziel) / ziel < 0.02)
})

test('mengeAusBetrag: Betrag → Menge über VK-Preis', () => {
  const p = produktVon('akku')
  assert.equal(mengeAusBetrag('akku', p.vkPreis * 42), 42)
})

test('Liquidität: 12 Monate, Zahlungsziele verschieben Einzahlungen', () => {
  reset()
  const plan = { id: 't', name: 'T', typ: 'budget', jahr: 2026, schwundPct: 0,
    zeilen: { ebike: { menge: 1200, ohneUmsatz: 0 }, akku: { menge: 0, ohneUmsatz: 0 },
      zubehoer: { menge: 0, ohneUmsatz: 0 }, bekleidung: { menge: 0, ohneUmsatz: 0 } } }
  const liq = liquiditaet(plan)
  assert.equal(liq.length, 12)
  // E-Bike VK-Zahlungsziel 30 Tg → Monat 0 hat noch keine Einzahlung
  assert.equal(liq[0].ein, 0)
  assert.ok(liq[1].ein > 0)
  // kumuliert ist monoton-konsistent
  assert.equal(liq[11].kumuliert, liq.reduce((n, m) => n + m.netto, 0))
})

test('Plan-CRUD: anlegen, kopieren, löschen', () => {
  reset()
  const a = neuerPlan('Mein Plan', 'forecast', 2027)
  assert.ok(planVon(a.id))
  const b = kopierePlan(a.id, 'Kopie X')
  assert.ok(planVon(b.id))
  assert.equal(planVon(b.id).name, 'Kopie X')
  assert.notEqual(a.id, b.id)
  loeschePlan(a.id)
  assert.equal(planVon(a.id), null)
  assert.ok(planVon(b.id)) // Kopie bleibt
})

test('Seed-Plan vorhanden, wenn noch keine Pläne existieren', () => {
  reset()
  const plaene = ladePlaene()
  assert.ok(plaene.length >= 1)
  assert.ok(plaene[0].zeilen)
})
