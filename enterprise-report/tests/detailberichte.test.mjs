import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { artikelliste, auftragsliste, pruefeArtikel, pruefeAuftrag, ARTIKEL, LISTEN, historie, warenverbrauchliste, pruefeWarenverbrauch, WARENVERBRAUCH, leasingliste, fuehrenderBeleg, LEASING, retourenliste, rechnungsliste, kundenliste, detailFuerBereich } from '../src/core/detailberichte.js'

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

test('Ebene 5: Historie je Datensatz (Artikel-Chart, Auftrags-Zeitstrahl)', () => {
  const h = historie('artikel', ARTIKEL[0])
  assert.equal(h.kind, 'chart')
  assert.equal(h.punkte.length, 6)
  assert.ok(h.punkte.every((x) => typeof x.wert === 'number'))
  const o = auftragsliste().rows.find((x) => x.status === 'Geliefert')
  const ho = historie('auftrag', o)
  assert.equal(ho.kind, 'timeline')
  assert.ok(ho.punkte.some((x) => x.label === 'Geliefert'))
})

test('Plausi Warenverbrauch: Bestandsgleichung, negativer Verbrauch, Abgang ohne Umsatz', () => {
  // akku: 40+30-50=20 ≠ 18 → Gleichung verletzt
  const akku = pruefeWarenverbrauch(WARENVERBRAUCH.find((w) => w.artikel === 'Akku 625Wh'))
  assert.ok(akku.some((x) => x.feld === 'endbestand' && x.schwere === 'fehler'))
  // jacke: abgang -5 → negativer Verbrauch
  const jacke = pruefeWarenverbrauch(WARENVERBRAUCH.find((w) => w.gruppe === 'Bekleidung'))
  assert.ok(jacke.some((x) => x.feld === 'verbrauch' && x.schwere === 'fehler'))
  // REVEAL: endbestand -1 → negativer Endbestand
  const reveal = pruefeWarenverbrauch(WARENVERBRAUCH.find((w) => w.endbestand === -1))
  assert.ok(reveal.some((x) => x.text === 'Negativer Endbestand'))
  const l = warenverbrauchliste({ nurAuffaellig: true })
  assert.ok(l.rows.length > 0 && l.rows.every((r) => r.befunde.length))
})

test('Leasing-Entdopplung: führender Beleg je Sicht', () => {
  const voll = LEASING.find((r) => r.vorgang === 'LS-1001') // alle 3 Belege
  assert.equal(fuehrenderBeleg(voll, 'auftrag').feld, 'kundeL')        // Auftrag: Kundenleasing führt
  assert.equal(fuehrenderBeleg(voll, 'rechnung').feld, 'gesellschaft') // Rechnung: Leasinggesellschaft führt
  const nurAngebot = LEASING.find((r) => r.vorgang === 'LS-1003')
  assert.equal(fuehrenderBeleg(nurAngebot, 'auftrag').feld, 'angebot') // Fallback Angebot
  const keinBeleg = LEASING.find((r) => r.vorgang === 'LS-1005')
  assert.equal(fuehrenderBeleg(keinBeleg, 'auftrag'), null)
})

test('Leasing: Summe zählt nur den Anzeigewert (kein Doppel/Dreifach)', () => {
  const auf = leasingliste({ sicht: 'auftrag' })
  // Erwartung: Summe der führenden Werte, NICHT Summe aller 3 Belege je Vorgang.
  const erwartet = LEASING.reduce((n, r) => { const f = fuehrenderBeleg(r, 'auftrag'); return n + (f ? f.wert : 0) }, 0)
  assert.equal(auf.summe.anzeigeWert, Math.round(erwartet * 100) / 100)
  // nicht-führende Belege sind zum Dimmen markiert
  const ls1001 = auf.rows.find((r) => r.vorgang === 'LS-1001')
  assert.ok(ls1001._dim.includes('gesellW') && ls1001._dim.includes('angebotW'))
})

test('Leasing: kein Beleg = Fehler, abweichende Werte = Warnung', () => {
  const rows = leasingliste().rows
  assert.ok(rows.find((r) => r.vorgang === 'LS-1005').befunde.some((b) => b.schwere === 'fehler'))
  assert.ok(rows.find((r) => r.vorgang === 'LS-1004').befunde.some((b) => b.schwere === 'warnung'))
})

test('Retouren/Rechnungen/Kunden: Plausi-Befunde', () => {
  assert.ok(retourenliste().rows.find((r) => r.retoure === 'RET-5003').befunde.some((b) => b.text.includes('Originalwert')))
  assert.ok(rechnungsliste().rows.find((r) => r.rechnung === 'RE-9004').befunde.some((b) => b.text === 'Rechnung ohne Positionen'))
  assert.ok(kundenliste().rows.find((k) => k.kundennr === '2200111').befunde.some((b) => b.text.includes('Kreditlimit')))
})

test('Drill E3→E4: Fachbereich → passende Detailliste', () => {
  assert.equal(detailFuerBereich('VK').id, 'auftrag')
  assert.equal(detailFuerBereich('KLR').id, 'plausiwv')
  assert.equal(detailFuerBereich('KON').id, 'leasing')
  assert.equal(detailFuerBereich('IT'), null)       // kein Mapping
  assert.equal(detailFuerBereich(undefined), null)
})

test('LISTEN-Katalog hat verfügbare und geplante Listen', () => {
  assert.ok(LISTEN.find((l) => l.id === 'artikel').verfuegbar)
  assert.ok(LISTEN.some((l) => !l.verfuegbar))
})
