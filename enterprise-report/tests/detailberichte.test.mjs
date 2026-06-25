import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { artikelliste, auftragsliste, pruefeArtikel, pruefeAuftrag, ARTIKEL, LISTEN, historie, warenverbrauchliste, pruefeWarenverbrauch, WARENVERBRAUCH, leasingliste, fuehrenderBeleg, LEASING, retourenliste, rechnungsliste, kundenliste, detailFuerBereich, produktliste, rechnungsposliste, bestellkanalliste, chargenliste, auftragsbestandliste, sammelBefunde, befundStatistik, REGISTRY, verknuepfungenFuer, lieferantenliste, bestellliste, offenepostenliste, inventurliste, kontenliste } from '../src/core/detailberichte.js'

test('Negativer Verfügbarbestand wird als Fehler erkannt', () => {
  const a = ARTIKEL.find((x) => x.sku === 'ART-1005') // lbVerf -1
  const b = pruefeArtikel(a)
  assert.ok(b.some((x) => x.feld === 'lbVerf' && x.schwere === 'fehler'))
})

test('Negative Marge (EK > VK) wird als Fehler erkannt', () => {
  const a = ARTIKEL.find((x) => x.sku === 'ART-1001') // vk<ek
  const b = pruefeArtikel(a)
  assert.ok(b.some((x) => x.feld === 'marge' && x.schwere === 'fehler'))
})

test('Gesperrter Bestand und EK-ohne-VK werden gemeldet', () => {
  const gesp = pruefeArtikel(ARTIKEL.find((x) => x.sku === 'ART-1004'))
  assert.ok(gesp.some((x) => x.feld === 'gesp'))
  const ohneVk = pruefeArtikel(ARTIKEL.find((x) => x.sku === 'ART-1010'))
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
  assert.equal(artikelliste({ suche: 'ART-1001' }).rows.length, 1)
  assert.ok(artikelliste({ suche: 'demo.einkauf' }).rows.length >= 1)
})

test('Auftragsliste: negativer MEK und negativer UE bei Geliefert', () => {
  const skarics = pruefeAuftrag(auftragsliste().rows.find((o) => o.auftrag === 'AUF-1002'))
  assert.ok(skarics.some((x) => x.feld === 'mek' && x.schwere === 'fehler'))
  const birkner = pruefeAuftrag(auftragsliste().rows.find((o) => o.auftrag === 'AUF-1001'))
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
  assert.ok(kundenliste().rows.find((k) => k.kundennr === 'KD-1004').befunde.some((b) => b.text.includes('Kreditlimit')))
})

test('Drill E3→E4: Fachbereich → passende Detailliste', () => {
  assert.equal(detailFuerBereich('VK').id, 'auftrag')
  assert.equal(detailFuerBereich('KLR').id, 'plausiwv')
  assert.equal(detailFuerBereich('KON').id, 'leasing')
  assert.equal(detailFuerBereich('IT'), null)       // kein Mapping
  assert.equal(detailFuerBereich(undefined), null)
  // erweiterte Mappings (Transparenz-Drill für mehr Bereiche)
  assert.equal(detailFuerBereich('LIQ').id, 'offeneposten')
  assert.equal(detailFuerBereich('PR').id, 'charge')
  assert.equal(detailFuerBereich('QM').id, 'retoure')
  assert.equal(detailFuerBereich('EK').id, 'bestellung')
})

test('Drill-Abdeckung: jede KPI-Kennzahl erreicht eine Detailebene (außer HR/IT/PC)', async () => {
  const { KPI } = await import('../src/core/kpiRegistry.js')
  const ohneListe = new Set(['HR', 'IT', 'PC'])   // keine personenbezogene Belegliste im Demo
  const fehlend = new Set()
  for (const k of Object.values(KPI)) {
    if (!k.bereich || ohneListe.has(k.bereich)) continue
    if (!detailFuerBereich(k.bereich)) fehlend.add(k.bereich)
  }
  assert.deepEqual([...fehlend], [], `Bereiche ohne Drill-Ziel: ${[...fehlend].join(', ')}`)
})

test('Produktliste: Plausi (kein VK-Preis, EAN, gesperrt)', () => {
  const rows = produktliste().rows
  assert.ok(rows.find((p) => p.sku === 'ART-2003').befunde.some((b) => b.text.includes('Kein VK-Preis')))
  assert.ok(rows.find((p) => p.sku === 'ART-2002').befunde.some((b) => b.feld === 'ean'))
  assert.ok(rows.find((p) => p.sku === 'ART-2005').befunde.some((b) => b.text.includes('Gesperrt')))
})

test('Rechnungspositionsliste: Positionsnetto & Menge', () => {
  const rows = rechnungsposliste().rows
  assert.ok(rows.find((p) => p.rechnung === 'RE-9003').befunde.some((b) => b.text === 'Menge ≤ 0'))
  assert.ok(rows.find((p) => p.rechnung === 'RE-9005').befunde.some((b) => b.text.includes('hoher Rabatt')))
  // korrekte Position erzeugt keinen Netto-Fehler
  assert.ok(!rows.find((p) => p.rechnung === 'RE-9001').befunde.some((b) => b.feld === 'netto'))
})

test('Bestellkanalliste: hohe Quoten & leerer Kanal', () => {
  const rows = bestellkanalliste().rows
  assert.ok(rows.find((k) => k.kanal === 'Amazon').befunde.some((b) => b.text.includes('Retourenquote')))
  assert.ok(rows.find((k) => k.kanal === 'eBay').befunde.some((b) => b.text.includes('Stornoquote')))
  assert.ok(rows.find((k) => k.kanal === 'B2B Direkt').befunde.some((b) => b.schwere === 'hinweis'))
})

test('Chargenliste: MHD überschritten/bald & QS-Sperre', () => {
  const rows = chargenliste().rows
  assert.ok(rows.find((c) => c.charge === 'CH-2025-221').befunde.some((b) => b.text.includes('überschritten')))
  assert.ok(rows.find((c) => c.charge === 'CH-2026-009').befunde.some((b) => b.text.includes('bald')))
  assert.ok(rows.find((c) => c.charge === 'CH-2026-040').befunde.some((b) => b.text.includes('gesperrt')))
})

test('Auftragsbestandsliste: Inkonsistenz & Übermenge', () => {
  const rows = auftragsbestandliste().rows
  assert.ok(rows.find((a) => a.auftrag === 'AUF-1010').befunde.some((b) => b.text.includes('Übermenge')))
  assert.ok(rows.find((a) => a.auftrag === 'AUF-1009').befunde.some((b) => b.text.includes('Liefertermin')))
  assert.ok(!rows.find((a) => a.auftrag === 'AUF-1005').befunde.length) // sauber
})

test('Alle Katalog-Listen sind jetzt verfügbar', () => {
  assert.ok(LISTEN.every((l) => l.verfuegbar), 'es sollten alle Listen verfügbar sein')
})

test('Sammel-Plausi: Befunde aller Listen gebündelt & sortiert', () => {
  const items = sammelBefunde()
  assert.ok(items.length > 10)
  // jede verfügbare Katalog-Liste ist in der Registry abgebildet (Registry darf
  // zusätzlich genestete Sub-Listen wie 'rechnungpos' für Cross-Drill enthalten)
  assert.ok(LISTEN.filter((l) => l.verfuegbar).every((l) => REGISTRY.some((r) => r.id === l.id)))
  assert.ok(REGISTRY.length >= LISTEN.filter((l) => l.verfuegbar).length)
  // Sortierung: Fehler stehen vor Hinweisen
  const ersteHinweis = items.findIndex((i) => i.schwere === 'hinweis')
  const letzterFehler = items.map((i) => i.schwere).lastIndexOf('fehler')
  if (ersteHinweis >= 0 && letzterFehler >= 0) assert.ok(letzterFehler < ersteHinweis)
  // Einträge tragen Liste + Datensatzbezug
  assert.ok(items.every((i) => i.listId && i.id != null && i.text))
})

test('Befund-Statistik: Summen je Schwere und je Liste', () => {
  const s = befundStatistik()
  assert.equal(s.gesamt, s.proSchwere.fehler + s.proSchwere.warnung + s.proSchwere.hinweis)
  assert.ok(s.proListe.length > 0)
  assert.equal(s.proListe.reduce((n, l) => n + l.gesamt, 0), s.gesamt)
})

test('Cross-Drill: Rechnung verlinkt auf ihre Positionen', () => {
  const re = rechnungsliste().rows.find((r) => r.rechnung === 'RE-9002')
  const links = verknuepfungenFuer('rechnung', re)
  const pos = links.find((l) => l.ziel === 'rechnungpos')
  assert.ok(pos, 'Positionen-Verknüpfung sollte existieren')
  assert.equal(pos.suche, 'RE-9002')
  assert.equal(pos.anzahl, 2) // RE-9002 hat 2 Positionen
})

test('Cross-Drill: Auftragsbestand ↔ Leasing über Auftragsnummer', () => {
  const ab = auftragsbestandliste().rows.find((a) => a.auftrag === 'AUF-1004')
  const links = verknuepfungenFuer('auftragsbestand', ab)
  assert.ok(links.find((l) => l.ziel === 'leasing'), 'Leasing-Verknüpfung erwartet')
})

test('Cross-Drill: nur Ziele mit Treffern werden zurückgegeben', () => {
  // Produkt ART-2005 existiert nicht in Chargen -> keine Chargen-Verknüpfung
  const p = produktliste().rows.find((x) => x.sku === 'ART-2005')
  const links = verknuepfungenFuer('produkt', p)
  assert.ok(!links.some((l) => l.ziel === 'charge'))
  assert.ok(links.every((l) => l.anzahl > 0))
})

test('Lieferantenliste: Reklamation/Lieferzeit/Sperre', () => {
  const rows = lieferantenliste().rows
  assert.ok(rows.find((l) => l.lieferantNr === 'L-300').befunde.some((b) => b.text.includes('Reklamationsquote')))
  assert.ok(rows.find((l) => l.lieferantNr === 'L-500').befunde.some((b) => b.text.includes('gesperrt')))
})

test('Bestellliste: Menge/Bestellwert/Liefertermin', () => {
  const rows = bestellliste().rows
  assert.ok(rows.find((o) => o.bestellung === 'B-7003').befunde.some((b) => b.text.includes('Bestellmenge')))
  assert.ok(rows.find((o) => o.bestellung === 'B-7005').befunde.some((b) => b.text.includes('Bestellwert')))
  assert.ok(rows.find((o) => o.bestellung === 'B-7002').befunde.some((b) => b.text.includes('Liefertermin')))
})

test('Offene-Posten-Liste: Mahnstufe/überfällig/Gutschrift', () => {
  const rows = offenepostenliste().rows
  assert.ok(rows.find((p) => p.beleg === 'OP-4').befunde.some((b) => b.text.includes('Mahnstufe')))
  assert.ok(rows.find((p) => p.beleg === 'OP-1').befunde.some((b) => b.text.includes('Überfällig')))
  assert.ok(rows.find((p) => p.beleg === 'OP-5').befunde.some((b) => b.text.includes('Gutschrift')))
})

test('Inventurliste: negativer Buchbestand & Differenz', () => {
  const rows = inventurliste().rows
  assert.ok(rows.find((i) => i.zaehlung === 'INV-05').befunde.some((b) => b.text.includes('Negativer Buchbestand')))
  assert.ok(rows.find((i) => i.zaehlung === 'INV-02').befunde.some((b) => b.text.includes('Inventurdifferenz')))
  assert.ok(!rows.find((i) => i.zaehlung === 'INV-01').befunde.length)
})

test('Cross-Drill: Rechnung → Offene Posten, Lieferant → Bestellungen', () => {
  const re = rechnungsliste().rows.find((r) => r.rechnung === 'RE-9002')
  assert.ok(verknuepfungenFuer('rechnung', re).some((l) => l.ziel === 'offeneposten'))
  const lf = lieferantenliste().rows.find((l) => l.name === 'Muster Riegel GmbH')
  assert.ok(verknuepfungenFuer('lieferant', lf).some((l) => l.ziel === 'bestellung'))
})

test('Kontenliste (DimKonto): Zuweisungen + Plausi', () => {
  const rows = kontenliste().rows
  // Klassenkonflikt: Eigenkapital (Klasse 2) als GuV markiert
  assert.ok(rows.find((k) => k.kontoNr === '2000').befunde.some((b) => b.text.includes('Klassenkonflikt')))
  // Aufwandskonto ohne Kostenart-Zuordnung
  assert.ok(rows.find((k) => k.kontoNr === '4100').befunde.some((b) => b.text.includes('Kostenart')))
  // gesperrtes Konto mit Saldo
  assert.ok(rows.find((k) => k.kontoNr === '8500').befunde.some((b) => b.text.includes('Gesperrtes Konto')))
  // sauberes Erlöskonto ohne Befund
  assert.ok(!rows.find((k) => k.kontoNr === '8400').befunde.length)
})

test('LISTEN-Katalog enthält die Kernlisten', () => {
  assert.ok(LISTEN.find((l) => l.id === 'artikel').verfuegbar)
  assert.ok(LISTEN.length >= 12)
})
