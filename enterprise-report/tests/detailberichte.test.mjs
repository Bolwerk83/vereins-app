import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { artikelliste, auftragsliste, pruefeArtikel, pruefeAuftrag, ARTIKEL, LISTEN, historie } from '../src/core/detailberichte.js'

test('Negativer Verfügbarbestand wird als Fehler erkannt', () => {
  const a = ARTIKEL.find((x) => x.sku === '231052006') // lbVerf -1
  const b = pruefeArtikel(a)
  assert.ok(b.some((x) => x.feld === 'lbVerf' && x.schwere === 'fehler'))
})

test('Negative Marge (EK > VK) wird als Fehler erkannt', () => {
  const a = ARTIKEL.find((x) => x.sku === '1650590001') // vk<ek
  const b = pruefeArtikel(a)
  assert.ok(b.some((x) => x.feld === 'marge' && x.schwere === 'fehler'))
})

test('Gesperrter Bestand und EK-ohne-VK werden gemeldet', () => {
  const gesp = pruefeArtikel(ARTIKEL.find((x) => x.sku === '230591702'))
  assert.ok(gesp.some((x) => x.feld === 'gesp'))
  const ohneVk = pruefeArtikel(ARTIKEL.find((x) => x.sku === '231058204'))
  assert.ok(ohneVk.some((x) => x.feld === 'vk' && x.schwere === 'warnung'))
})

test('artikelliste: Filter „nur Auffällige" und Summen', () => {
  const alle = artikelliste()
  const auff = artikelliste({ nurAuffaellig: true })
  assert.ok(auff.rows.length < alle.rows.length)
  assert.ok(auff.rows.every((r) => r.befunde.length > 0))
  assert.equal(alle.gesamt, ARTIKEL.length)
  assert.ok(alle.auffaellig > 0)
})

test('artikelliste: Suche nach SKU/Einkäufer', () => {
  assert.equal(artikelliste({ suche: '1650590001' }).rows.length, 1)
  assert.ok(artikelliste({ suche: 'janne' }).rows.length >= 1)
})

test('Auftragsliste: negativer MEK und negativer UE bei Geliefert', () => {
  const skarics = pruefeAuftrag(auftragsliste().rows.find((o) => o.auftrag === '2654583388'))
  assert.ok(skarics.some((x) => x.feld === 'mek' && x.schwere === 'fehler'))
  const birkner = pruefeAuftrag(auftragsliste().rows.find((o) => o.auftrag === '2654484814'))
  assert.ok(birkner.some((x) => x.feld === 'ue'))
})

test('Ebene 5: Historie je Datensatz (Artikel-Verlauf, Auftrags-Zeitstrahl)', () => {
  const h = historie('artikel', ARTIKEL[0])
  assert.equal(h.length, 6)
  assert.ok(h.every((x) => typeof x.bestand === 'number'))
  const o = auftragsliste().rows.find((x) => x.status === 'Geliefert')
  const ho = historie('auftrag', o)
  assert.ok(ho.some((x) => x.label === 'Geliefert'))
})

test('LISTEN-Katalog hat verfügbare und geplante Listen', () => {
  assert.ok(LISTEN.find((l) => l.id === 'artikel').verfuegbar)
  assert.ok(LISTEN.some((l) => !l.verfuegbar))
})
