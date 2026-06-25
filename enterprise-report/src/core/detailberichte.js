// =========================================================================
//  DETAILBERICHTE — granulare Listen (SKU/Auftrag/…) zum Validieren im
//  Einzelfall: Falscheingaben und unplausible Datenvorgänge finden.
//  Jede Zeile wird gegen Plausibilitätsregeln geprüft (Befunde), Summen je
//  Spalte werden gebildet. Mock-Daten mit absichtlich auffälligen Sätzen.
// =========================================================================

// Legende der Kürzel (wie im Business Report).
export const LEGENDE = [
  ['AE', 'Auftragseingang'], ['STOR', 'Storniert'], ['AEB', 'Auftragseingang bereinigt'],
  ['AB', 'Auftragsbestand'], ['GEL', 'Geliefert'], ['OFF ANGE', 'offene Angebote'],
  ['RET', 'Retoure'], ['AET', 'Auftragseingang tatsächlich'],
  ['ABS', 'Absatz'], ['BE', 'Bestellmenge'], ['FC', 'Forecast'],
  ['LB', 'Lagerbestand'], ['GESP', 'Gesperrt'], ['KOM', 'Kommissioniert'],
  ['RES', 'Reserviert'], ['VK', 'Verkaufspreis'], ['UVP', 'unverb. Preisempf.'],
  ['EK', 'Einkaufspreis'], ['UE', 'Umsatzerlös'], ['VERB', 'Warenverbrauch'], ['MARGE', 'Marge']
]

const r2 = (x) => Math.round(x * 100) / 100
const norm = (s) => String(s || '').toLowerCase()

// ---- Artikelliste (SKU) --------------------------------------------------
// lbVerf = verfügbarer Lagerbestand; gesp = gesperrt; vk/uvp/ek = € je Stück.
export const ARTIKEL = [
  { sku: 'ART-1001', artikel: 'E-Bike 22 Sneak Plus EQ MidStep Testbike (B-Ware) (all black / M)', status: 'Ausgelaufen intern', gruppe: 'E-Bikes', lbEff: 0, gesp: 0, kom: 0, res: 0, lbVerf: 0, ae: 1, aeb: 1, ab: 0, fc: 0, vk: 1176.47, uvp: 0, ek: 1378.24, einkaeufer: 'DEMO.EINKAUF1', aktiv: true },
  { sku: 'ART-1002', artikel: 'Gravel 23 HOBO GRX 810 (pine green / S)', status: 'Ausgelaufen intern', gruppe: 'Fahrräder', lbEff: 2, gesp: 1, kom: 1, res: 0, lbVerf: 1, ae: 1, aeb: 1, ab: 0, fc: 0, vk: 1007.56, uvp: 0, ek: 777.47, einkaeufer: 'DEMO.EINKAUF2', aktiv: true },
  { sku: 'ART-1003', artikel: 'E-GRAVEL 21 BACKROAD+ GRX RX810 Di2 (matt-black / M)', status: 'Ausgelaufen intern', gruppe: 'E-Bikes', lbEff: 3, gesp: 0, kom: 3, res: 0, lbVerf: 25, ae: 0, aeb: 0, ab: 0, fc: 22, vk: 4200.84, uvp: 0, ek: 2454.48, einkaeufer: 'DEMO.EINKAUF2', aktiv: true },
  { sku: 'ART-1004', artikel: 'E-Bike 21 Backroad+ Flatbar E-Urban Herren (matt-black / M)', status: 'Ausgelaufen intern', gruppe: 'E-Bikes', lbEff: 5, gesp: 2, kom: 3, res: 0, lbVerf: 0, ae: 0, aeb: 0, ab: 0, fc: 0, vk: 3696.64, uvp: 0, ek: 1991.50, einkaeufer: 'DEMO.EINKAUF2', aktiv: true },
  { sku: 'ART-1005', artikel: 'RR 22 REVEAL SIX DISC Ultegra (Matt Carbon / 61cm)', status: 'Ausgelaufen intern', gruppe: 'Fahrräder', lbEff: 1, gesp: 0, kom: 1, res: 0, lbVerf: -1, ae: 0, aeb: 0, ab: 0, fc: 0, vk: 2940.34, uvp: 0, ek: 1561.24, einkaeufer: 'DEMO.EINKAUF2', aktiv: true },
  { sku: 'ART-1006', artikel: 'GRAVEL 21 BACKROAD GRX RX810 Di2 Limited 1X11 (midnight laser grey / 59cm)', status: 'Ausgelaufen intern', gruppe: 'Fahrräder', lbEff: 1, gesp: 0, kom: 1, res: 0, lbVerf: 1, ae: 0, aeb: 0, ab: 0, fc: 0, vk: 3528.57, uvp: 0, ek: 2056.28, einkaeufer: 'DEMO.EINKAUF2', aktiv: true },
  { sku: 'ART-1007', artikel: 'Fitness 21 Backroad Multicross GRX 810 (evil pepper green / 57cm)', status: 'Ausgelaufen intern', gruppe: 'Fahrräder', lbEff: 1, gesp: 0, kom: 1, res: 0, lbVerf: 1, ae: 0, aeb: 0, ab: 0, fc: 0, vk: 2015.97, uvp: 0, ek: 1594.42, einkaeufer: 'DEMO.EINKAUF2', aktiv: true },
  { sku: 'ART-1008', artikel: 'GRAVEL 22 BACKROAD AL GRX RX600 (roasted olive / 57cm)', status: 'Ausgelaufen intern', gruppe: 'Fahrräder', lbEff: 1, gesp: 0, kom: 1, res: 0, lbVerf: 1, ae: 0, aeb: 0, ab: 0, fc: 0, vk: 1679.83, uvp: 0, ek: 916.44, einkaeufer: 'DEMO.EINKAUF2', aktiv: true },
  { sku: 'ART-1009', artikel: 'HT 22, Bonero 1 (Sandy Taco / M)', status: 'Ausgelaufen intern', gruppe: 'Fahrräder', lbEff: 0, gesp: 0, kom: 0, res: 0, lbVerf: 0, ae: 1, aeb: 0, ab: 0, fc: 0, vk: 713.45, uvp: 0, ek: 749.68, einkaeufer: 'DEMO.EINKAUF2', aktiv: true },
  { sku: 'ART-1010', artikel: 'GRAVEL 22 BACKROAD Force eTap AXS 1X12 (blue haze / 55cm)', status: 'Ausgelaufen intern', gruppe: 'Fahrräder', lbEff: 0, gesp: 0, kom: 0, res: 0, lbVerf: 0, ae: 0, aeb: 0, ab: 0, fc: 0, vk: 0, uvp: 0, ek: 1757.95, einkaeufer: 'DEMO.EINKAUF2', aktiv: true },
  { sku: 'ART-1011', artikel: 'E-Bike 21 Xtra Watt Evo Plus 1 MidStep (matt silver-grey / 23")', status: 'Ausgelaufen intern', gruppe: 'E-Bikes', lbEff: 0, gesp: 0, kom: 0, res: 0, lbVerf: 0, ae: 0, aeb: 0, ab: 0, fc: 0, vk: 3696.64, uvp: 0, ek: 2044.37, einkaeufer: 'DEMO.EINKAUF2', aktiv: false },
  { sku: 'ART-1012', artikel: 'RR 22 REVEAL FOUR DISC Force eTap AXS (Shiny Aurora / 57cm)', status: 'Ausgelaufen intern', gruppe: 'Fahrräder', lbEff: 0, gesp: 0, kom: 0, res: 0, lbVerf: 0, ae: 0, aeb: 0, ab: 0, fc: 0, vk: 2772.27, uvp: 0, ek: 1839.95, einkaeufer: 'DEMO.EINKAUF2', aktiv: true }
]

/** Plausibilitätsprüfung einer Artikelzeile → Liste von Befunden. */
export function pruefeArtikel(a) {
  const b = []
  const marge = a.vk - a.ek
  if (a.lbVerf < 0) b.push({ feld: 'lbVerf', schwere: 'fehler', text: 'Negativer verfügbarer Bestand' })
  if (a.vk > 0 && marge < 0) b.push({ feld: 'marge', schwere: 'fehler', text: `Negative Marge (EK ${a.ek.toFixed(2)} > VK ${a.vk.toFixed(2)})` })
  if (a.ek > 0 && a.vk === 0) b.push({ feld: 'vk', schwere: 'warnung', text: 'EK vorhanden, aber kein VK gepflegt' })
  if (a.gesp > 0) b.push({ feld: 'gesp', schwere: 'warnung', text: `${a.gesp} Stück gesperrt` })
  if (!a.aktiv && (a.lbEff > 0 || a.lbVerf > 0)) b.push({ feld: 'aktiv', schwere: 'warnung', text: 'Inaktiver Artikel mit Restbestand' })
  if (a.kom > a.lbEff) b.push({ feld: 'kom', schwere: 'warnung', text: 'Kommissioniert größer als Lagerbestand' })
  return b
}

const SCHWERE_RANG = { fehler: 3, warnung: 2, hinweis: 1 }
const maxSchwere = (befunde) => befunde.reduce((m, x) => (SCHWERE_RANG[x.schwere] > (SCHWERE_RANG[m] || 0) ? x.schwere : m), null)

/** Artikelliste mit Befunden + Summen; optional gefiltert/nur Auffällige. */
export function artikelliste({ suche = '', nurAuffaellig = false } = {}) {
  const q = norm(suche)
  let rows = ARTIKEL.map((a) => {
    const befunde = pruefeArtikel(a)
    return { ...a, marge: r2(a.vk - a.ek), margePct: a.vk > 0 ? r2((a.vk - a.ek) / a.vk * 100) : null, befunde, schwere: maxSchwere(befunde) }
  })
  if (q) rows = rows.filter((a) => norm(a.sku).includes(q) || norm(a.artikel).includes(q) || norm(a.einkaeufer).includes(q) || norm(a.gruppe).includes(q))
  if (nurAuffaellig) rows = rows.filter((a) => a.befunde.length)
  const sum = (k) => r2(rows.reduce((n, a) => n + (a[k] || 0), 0))
  return {
    rows,
    summe: { lbEff: sum('lbEff'), gesp: sum('gesp'), kom: sum('kom'), lbVerf: sum('lbVerf'), ae: sum('ae'), aeb: sum('aeb'), fc: sum('fc') },
    auffaellig: ARTIKEL.filter((a) => pruefeArtikel(a).length).length,
    gesamt: ARTIKEL.length
  }
}

// ---- Auftragsliste -------------------------------------------------------
export const AUFTRAEGE = [
  { datum: '2026-05-17', kunde: 'Max Mustermann (KD-1001)', art: 'Auftrag', unterart: 'Bestellung', auftrag: 'AUF-1001', status: 'Geliefert', waehrung: 'EUR', ab: 0, vk: 0, ae: 0, aeb: 0, ret: 1, aet: 0, mek: 0, abs: -1, ue: -117.61 },
  { datum: '2026-06-06', kunde: 'Erika Musterfrau (KD-1002)', art: 'Auftrag', unterart: 'Bestellung', auftrag: 'AUF-1002', status: 'Geliefert', waehrung: 'EUR', ab: 0, vk: 118, ae: 118, aeb: 118, ret: 0, aet: 118, mek: -84, abs: 1, ue: 117.67 },
  { datum: '2026-06-04', kunde: 'Tom Beispiel (KD-1003)', art: 'Auftrag', unterart: 'Bestellung', auftrag: 'AUF-1003', status: 'Offen', waehrung: 'EUR', ab: 320, vk: 320, ae: 320, aeb: 320, ret: 0, aet: 0, mek: 140, abs: 0, ue: 0 },
  { datum: '2026-06-02', kunde: 'Beispiel Onlineshop (Gast)', art: 'Auftrag', unterart: 'Sofortkauf', auftrag: 'AUF-1009', status: 'Geliefert', waehrung: 'EUR', ab: 0, vk: 890, ae: 890, aeb: 890, ret: 0, aet: 890, mek: 410, abs: 1, ue: 890.0 }
]

/** Plausibilitätsprüfung einer Auftragszeile. */
export function pruefeAuftrag(o) {
  const b = []
  if (o.mek < 0) b.push({ feld: 'mek', schwere: 'fehler', text: 'Negativer Mindesteinkaufs-/Margenbeitrag (MEK)' })
  if (o.status === 'Geliefert' && o.ue < 0) b.push({ feld: 'ue', schwere: 'warnung', text: 'Geliefert, aber negativer Umsatzerlös (Retoure prüfen)' })
  if (o.aet > o.ae) b.push({ feld: 'aet', schwere: 'warnung', text: 'AET größer als AE' })
  if (o.ret > 0 && o.abs >= 0) b.push({ feld: 'ret', schwere: 'hinweis', text: 'Retoure ohne negativen Absatz' })
  return b
}

export function auftragsliste({ suche = '', nurAuffaellig = false } = {}) {
  const q = norm(suche)
  let rows = AUFTRAEGE.map((o) => { const befunde = pruefeAuftrag(o); return { ...o, befunde, schwere: maxSchwere(befunde) } })
  if (q) rows = rows.filter((o) => norm(o.kunde).includes(q) || norm(o.auftrag).includes(q) || norm(o.status).includes(q))
  if (nurAuffaellig) rows = rows.filter((o) => o.befunde.length)
  const sum = (k) => r2(rows.reduce((n, o) => n + (o[k] || 0), 0))
  return {
    rows,
    summe: { ab: sum('ab'), vk: sum('vk'), ae: sum('ae'), aeb: sum('aeb'), ret: sum('ret'), aet: sum('aet'), mek: sum('mek'), abs: sum('abs'), ue: sum('ue') },
    auffaellig: AUFTRAEGE.filter((o) => pruefeAuftrag(o).length).length,
    gesamt: AUFTRAEGE.length
  }
}

// ---- Ebene 5: Historisierung je Datensatz --------------------------------
function addTage(iso, tage) { const d = new Date(iso); d.setDate(d.getDate() + tage); return d.toISOString().slice(0, 10) }

const MON = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun']
const offset = (s) => String(s || '').length

/**
 * Historisierung eines Detail-Datensatzes (E5).
 * @returns { kind:'chart', einheit, punkte:[{label,wert}] }  ODER
 *          { kind:'timeline', punkte:[{label,datum,warn}] }
 */
export function historie(typ, row) {
  if (typ === 'artikel') {
    const base = (row.lbEff || 0) + (row.kom || 0) + 4, o = offset(row.sku)
    return { kind: 'chart', einheit: 'Bestand (Stk)', punkte: MON.map((m, i) => ({ label: m, wert: Math.max(0, Math.round(base - i * 0.5 + Math.sin(i + o) * 2)) })) }
  }
  if (typ === 'warenverbrauch') {
    const o = offset(row.sku)
    return { kind: 'chart', einheit: 'Verbrauch (Stk)', punkte: MON.map((m, i) => ({ label: m, wert: Math.max(0, Math.round((row.verbrauch || 12) / 6 + Math.sin(i + o) * 3)) })) }
  }
  if (typ === 'kunde') {
    const o = offset(row.kundennr || row.name)
    return { kind: 'chart', einheit: 'Umsatz (T€)', punkte: MON.map((m, i) => ({ label: m, wert: Math.max(0, Math.round((row.umsatzJahr || 60) / 6 + Math.cos(i + o) * 8)) })) }
  }
  if (typ === 'rechnung') {
    return { kind: 'timeline', punkte: [
      { label: 'Erstellt', datum: addTage(row.datum, 0) }, { label: 'Versendet', datum: addTage(row.datum, 1) },
      row.bezahlt ? { label: 'Bezahlt', datum: addTage(row.datum, 12) } : { label: 'offen', datum: addTage(row.datum, 30), warn: true }
    ] }
  }
  if (typ === 'retoure') {
    return { kind: 'timeline', punkte: [
      { label: 'Eingegangen', datum: addTage(row.datum, 0) }, { label: 'Geprüft', datum: addTage(row.datum, 2) }, { label: 'Erstattet', datum: addTage(row.datum, 5) }
    ] }
  }
  if (typ === 'leasing') {
    const src = row._row || row
    const pts = [['angebot', 'Angebot Leasing'], ['kundeL', 'Kundenleasing'], ['gesellschaft', 'Leasinggesellschaft']]
      .filter(([k]) => src[k]).map(([k, label]) => ({ label, datum: src[k].datum }))
      .sort((a, b) => (a.datum < b.datum ? -1 : 1))
    return { kind: 'timeline', punkte: pts.length ? pts : [{ label: 'kein Beleg', datum: '', warn: true }] }
  }
  if (typ === 'charge') {
    return { kind: 'timeline', punkte: [
      { label: 'Wareneingang', datum: row.wareneingang },
      { label: 'MHD', datum: row.mhd, warn: tageBis(row.mhd) < 0 }
    ] }
  }
  if (typ === 'auftragsbestand') {
    return { kind: 'timeline', punkte: [
      { label: 'Bestellt', datum: row.datum },
      { label: row.offen <= 0 ? 'Komplett geliefert' : `noch ${row.offen} offen`, datum: row.liefertermin, warn: row.offen > 0 && tageBis(row.liefertermin) < 0 }
    ] }
  }
  if (typ === 'bestellkanal') {
    const o = offset(row.kanal)
    return { kind: 'chart', einheit: 'Umsatz (T€)', punkte: MON.map((m, i) => ({ label: m, wert: Math.max(0, Math.round((row.umsatz || 0) / 6000 + Math.sin(i + o) * 5)) })) }
  }
  if (typ === 'produkt') {
    const o = offset(row.sku)
    return { kind: 'chart', einheit: 'Absatz (Stk)', punkte: MON.map((m, i) => ({ label: m, wert: Math.max(0, Math.round(20 + Math.sin(i + o) * 10)) })) }
  }
  if (typ === 'rechnungpos') {
    const o = offset(row.sku)
    return { kind: 'chart', einheit: 'Menge (Stk)', punkte: MON.map((m, i) => ({ label: m, wert: Math.max(0, Math.round((row.menge || 1) + Math.cos(i + o) * 3)) })) }
  }
  if (typ === 'lieferant') {
    const o = offset(row.lieferantNr || row.name)
    return { kind: 'chart', einheit: 'Liefertreue (%)', punkte: MON.map((m, i) => ({ label: m, wert: Math.min(100, Math.max(60, Math.round(95 - row.reklamationsQuote + Math.sin(i + o) * 4))) })) }
  }
  if (typ === 'bestellung') {
    return { kind: 'timeline', punkte: [
      { label: 'Bestellt', datum: row.datum },
      { label: row.status === 'geliefert' ? 'Geliefert' : 'erwartet', datum: row.liefertermin, warn: row.status === 'offen' && tageBis(row.liefertermin) < 0 }
    ] }
  }
  if (typ === 'offeneposten') {
    return { kind: 'timeline', punkte: [
      { label: 'Fällig', datum: row.faellig, warn: !row.bezahltAm && tageBis(row.faellig) < 0 },
      row.bezahltAm ? { label: 'Bezahlt', datum: row.bezahltAm } : { label: `offen (Mahnstufe ${row.mahnstufe})`, datum: row.faellig, warn: row.mahnstufe >= 3 }
    ] }
  }
  if (typ === 'inventur') {
    const o = offset(row.sku)
    return { kind: 'chart', einheit: 'Buchbestand (Stk)', punkte: MON.map((m, i) => ({ label: m, wert: Math.max(0, Math.round((row.buchbestand || 0) + Math.sin(i + o) * 3)) })) }
  }
  if (typ === 'konto') {
    const o = offset(row.kontoNr); const basis = Math.abs(row.saldo || 0) / 1000
    return { kind: 'chart', einheit: 'Saldo (T€)', punkte: MON.map((m, i) => ({ label: m, wert: Math.max(0, Math.round(basis + Math.sin(i + o) * basis * 0.06)) })) }
  }
  // Auftrag: Status-Zeitstrahl bis zum aktuellen Stand.
  let stufen = row.status === 'Offen' ? ['Angelegt', 'Bestätigt'] : ['Angelegt', 'Bestätigt', 'Kommissioniert', 'Geliefert']
  if (row.ret > 0 || row.ue < 0) stufen = [...stufen, 'Retoure']
  return { kind: 'timeline', punkte: stufen.map((s, i) => ({ label: s, datum: addTage(row.datum, i * 2), warn: s === 'Retoure' })) }
}

// ---- Plausi: Warenverbrauch ---------------------------------------------
// Bestandsgleichung: Anfangsbestand + Zugang − Abgang = Endbestand.
export const WARENVERBRAUCH = [
  { sku: 'ART-1003', artikel: 'E-GRAVEL 21 BACKROAD+ GRX RX810 Di2', gruppe: 'E-Bikes', anfangsbestand: 10, zugang: 20, abgang: 25, endbestand: 5, verbrauch: 25, umsatzMenge: 25, einkaeufer: 'DEMO.EINKAUF2' },
  { sku: 'ART-1001', artikel: 'Akku 625Wh', gruppe: 'Teile', anfangsbestand: 40, zugang: 30, abgang: 50, endbestand: 18, verbrauch: 50, umsatzMenge: 48, einkaeufer: 'DEMO.EINKAUF1' },
  { sku: 'ART-1008', artikel: 'GRAVEL 22 BACKROAD AL GRX RX600', gruppe: 'Fahrräder', anfangsbestand: 60, zugang: 10, abgang: 70, endbestand: 0, verbrauch: 70, umsatzMenge: 0, einkaeufer: 'DEMO.EINKAUF2' },
  { sku: 'ART-1010', artikel: 'Zubehör-Set Gravel', gruppe: 'Zubehör', anfangsbestand: 100, zugang: 50, abgang: 40, endbestand: 110, verbrauch: 35, umsatzMenge: 40, einkaeufer: 'DEMO.EINKAUF2' },
  { sku: 'ART-1004', artikel: 'Bekleidung Jacke', gruppe: 'Bekleidung', anfangsbestand: 30, zugang: 0, abgang: -5, endbestand: 35, verbrauch: -5, umsatzMenge: 0, einkaeufer: 'DEMO.EINKAUF1' },
  { sku: 'ART-1005', artikel: 'RR 22 REVEAL SIX DISC Ultegra', gruppe: 'Fahrräder', anfangsbestand: 8, zugang: 0, abgang: 9, endbestand: -1, verbrauch: 9, umsatzMenge: 9, einkaeufer: 'DEMO.EINKAUF2' },
  { sku: 'ART-1007', artikel: 'Fitness 21 Backroad Multicross', gruppe: 'Fahrräder', anfangsbestand: 12, zugang: 6, abgang: 8, endbestand: 10, verbrauch: 8, umsatzMenge: 8, einkaeufer: 'DEMO.EINKAUF2' }
]

export function pruefeWarenverbrauch(w) {
  const b = []
  const soll = w.anfangsbestand + w.zugang - w.abgang
  if (soll !== w.endbestand) b.push({ feld: 'endbestand', schwere: 'fehler', text: `Bestandsgleichung verletzt (Soll ${soll}, Ist ${w.endbestand})` })
  if (w.endbestand < 0) b.push({ feld: 'endbestand', schwere: 'fehler', text: 'Negativer Endbestand' })
  if (w.verbrauch < 0) b.push({ feld: 'verbrauch', schwere: 'fehler', text: 'Negativer Warenverbrauch' })
  if (w.abgang > 0 && w.umsatzMenge === 0) b.push({ feld: 'umsatzMenge', schwere: 'warnung', text: 'Abgang ohne Umsatz (Schwund/Korrektur prüfen)' })
  if (w.umsatzMenge > w.abgang) b.push({ feld: 'umsatzMenge', schwere: 'warnung', text: 'Umsatzmenge größer als Abgang' })
  if (w.verbrauch !== w.abgang) b.push({ feld: 'verbrauch', schwere: 'hinweis', text: 'Verbrauch ≠ Abgang' })
  return b
}

export function warenverbrauchliste({ suche = '', nurAuffaellig = false } = {}) {
  const q = norm(suche)
  let rows = WARENVERBRAUCH.map((w) => { const befunde = pruefeWarenverbrauch(w); return { ...w, befunde, schwere: maxSchwere(befunde) } })
  if (q) rows = rows.filter((w) => norm(w.sku).includes(q) || norm(w.artikel).includes(q) || norm(w.einkaeufer).includes(q) || norm(w.gruppe).includes(q))
  if (nurAuffaellig) rows = rows.filter((w) => w.befunde.length)
  const sum = (k) => r2(rows.reduce((n, w) => n + (w[k] || 0), 0))
  return {
    rows,
    summe: { anfangsbestand: sum('anfangsbestand'), zugang: sum('zugang'), abgang: sum('abgang'), endbestand: sum('endbestand'), verbrauch: sum('verbrauch'), umsatzMenge: sum('umsatzMenge') },
    auffaellig: WARENVERBRAUCH.filter((w) => pruefeWarenverbrauch(w).length).length,
    gesamt: WARENVERBRAUCH.length
  }
}

// ---- Leasingliste (Entdopplung der 3 Belegtypen) ------------------------
// Je Vorgang bis zu 3 Belege: Angebot Leasing, Kundenleasing, Leasinggesellschaft.
// Damit Werte NICHT doppelt/dreifach zählen, wird je Sicht genau EIN führender
// Beleg gewählt:
//   Auftragssicht:  Kundenleasing → (sonst) Leasinggesellschaft → Angebot
//   Rechnungssicht: Leasinggesellschaft → (sonst) Kundenleasing → Angebot
// So ist immer ein Wert sichtbar, aber nie mehrfach.
export const BELEG_NAME = { angebot: 'Angebot Leasing', kundeL: 'Kundenleasing', gesellschaft: 'Leasinggesellschaft' }

export const LEASING = [
  { vorgang: 'LS-1001', kunde: 'Muster Stadtwerke', auftrag: 'AUF-1004', angebot: { wert: 3200, datum: '2026-05-20' }, kundeL: { wert: 3200, datum: '2026-05-28' }, gesellschaft: { wert: 3200, datum: '2026-06-02' } },
  { vorgang: 'LS-1002', kunde: 'Beispiel Lieferdienst', auftrag: 'AUF-1005', angebot: { wert: 1850, datum: '2026-06-01' }, kundeL: { wert: 1850, datum: '2026-06-05' }, gesellschaft: null },
  { vorgang: 'LS-1003', kunde: 'Hotel Beispielsee', auftrag: 'AUF-1006', angebot: { wert: 990, datum: '2026-06-10' }, kundeL: null, gesellschaft: null },
  { vorgang: 'LS-1004', kunde: 'Demo Logistik AG', auftrag: 'AUF-1007', angebot: { wert: 4200, datum: '2026-05-15' }, kundeL: { wert: 4500, datum: '2026-05-22' }, gesellschaft: { wert: 4200, datum: '2026-05-30' } },
  { vorgang: 'LS-1005', kunde: 'Muster Reha-Zentrum', auftrag: 'AUF-1008', angebot: null, kundeL: null, gesellschaft: null }
]

const BELEGE = ['angebot', 'kundeL', 'gesellschaft']

/** Führenden Beleg je Sicht ermitteln (Entdopplung). */
export function fuehrenderBeleg(row, sicht = 'auftrag') {
  const reihenfolge = sicht === 'rechnung' ? ['gesellschaft', 'kundeL', 'angebot'] : ['kundeL', 'gesellschaft', 'angebot']
  for (const k of reihenfolge) if (row[k]) return { feld: k, wert: row[k].wert, datum: row[k].datum }
  return null
}

export function pruefeLeasing(row) {
  const b = []
  const vorhanden = BELEGE.filter((k) => row[k])
  if (vorhanden.length === 0) { b.push({ feld: 'anzeigeWert', schwere: 'fehler', text: 'Kein Leasingbeleg vorhanden' }); return b }
  const werte = vorhanden.map((k) => row[k].wert)
  const max = Math.max(...werte), min = Math.min(...werte)
  if (max > 0 && (max - min) / max > 0.02) b.push({ feld: 'anzeigeWert', schwere: 'warnung', text: 'Belegwerte weichen ab (Dublette/Erfassung prüfen)' })
  if (!row.gesellschaft && (row.kundeL || row.angebot)) b.push({ feld: 'gesellW', schwere: 'hinweis', text: 'Leasinggesellschaft fehlt (Rechnungspartner noch offen)' })
  if (row.angebot && !row.kundeL && !row.gesellschaft) b.push({ feld: 'angebotW', schwere: 'hinweis', text: 'Nur Angebot vorhanden (Zeitversatz – noch nicht final)' })
  return b
}

export function leasingliste({ suche = '', nurAuffaellig = false, sicht = 'auftrag' } = {}) {
  const q = norm(suche)
  let rows = LEASING.map((row) => {
    const f = fuehrenderBeleg(row, sicht)
    const dimFelder = { angebot: 'angebotW', kundeL: 'kundeW', gesellschaft: 'gesellW' }
    const _dim = BELEGE.filter((k) => row[k] && k !== f?.feld).map((k) => dimFelder[k]) // nicht-führende Belege dimmen
    const befunde = pruefeLeasing(row)
    return {
      vorgang: row.vorgang, kunde: row.kunde, auftrag: row.auftrag,
      angebotW: row.angebot?.wert ?? null, kundeW: row.kundeL?.wert ?? null, gesellW: row.gesellschaft?.wert ?? null,
      anzeigeWert: f?.wert ?? null, fuehrend: f ? BELEG_NAME[f.feld] : '—',
      _row: row, _dim, befunde, schwere: maxSchwere(befunde)
    }
  })
  if (q) rows = rows.filter((r) => norm(r.vorgang).includes(q) || norm(r.kunde).includes(q) || norm(r.auftrag).includes(q))
  if (nurAuffaellig) rows = rows.filter((r) => r.befunde.length)
  return {
    rows,
    // Summe NUR über den Anzeigewert -> kein Doppel-/Dreifachzählen.
    summe: { anzeigeWert: r2(rows.reduce((n, r) => n + (r.anzeigeWert || 0), 0)) },
    auffaellig: LEASING.filter((r) => pruefeLeasing(r).length).length,
    gesamt: LEASING.length
  }
}

// ---- Retouren-, Rechnungs-, Kundenliste ---------------------------------
export const RETOUREN = [
  { retoure: 'RET-5001', datum: '2026-06-03', kunde: 'Max Mustermann', auftrag: 'AUF-1001', artikel: 'GRAVEL 22 BACKROAD', menge: 1, wert: 117.61, originalWert: 117.61, grund: 'Nichtgefallen' },
  { retoure: 'RET-5002', datum: '2026-06-07', kunde: 'Tom Beispiel', auftrag: '', artikel: 'Helm M', menge: 1, wert: 49.0, originalWert: 49.0, grund: '' },
  { retoure: 'RET-5003', datum: '2026-06-09', kunde: 'Beispiel Onlineshop', auftrag: 'AUF-1009', artikel: 'Jacke L', menge: 1, wert: 145.0, originalWert: 120.0, grund: 'Defekt' },
  { retoure: 'RET-5004', datum: '2026-06-10', kunde: 'Demo B2B Handel', auftrag: 'AUF-1010', artikel: 'Akku 625Wh', menge: 0, wert: 0, originalWert: 210.0, grund: 'Storno' }
]
export function pruefeRetoure(r) {
  const b = []
  if (!r.grund) b.push({ feld: 'grund', schwere: 'warnung', text: 'Retourengrund fehlt' })
  if (r.wert > r.originalWert) b.push({ feld: 'wert', schwere: 'fehler', text: 'Retourenwert größer als Originalwert' })
  if (r.menge <= 0) b.push({ feld: 'menge', schwere: 'fehler', text: 'Menge ≤ 0' })
  if (!r.auftrag) b.push({ feld: 'auftrag', schwere: 'warnung', text: 'Retoure ohne Originalauftrag' })
  return b
}
export function retourenliste(o = {}) { return generischListe(RETOUREN, pruefeRetoure, o, ['wert', 'originalWert', 'menge'], (r, q) => norm(r.retoure).includes(q) || norm(r.kunde).includes(q) || norm(r.artikel).includes(q)) }

export const RECHNUNGEN = [
  { rechnung: 'RE-9001', datum: '2026-06-05', kunde: 'Erika Musterfrau', auftrag: 'AUF-1002', netto: 99.0, mwst: 18.81, brutto: 117.81, positionen: 1, bezahlt: true, status: 'Abgeschlossen' },
  { rechnung: 'RE-9002', datum: '2026-06-06', kunde: 'Muster Stadtwerke', auftrag: 'AUF-1004', netto: 2689.08, mwst: 510.92, brutto: 3200.0, positionen: 3, bezahlt: false, status: 'Offen' },
  { rechnung: 'RE-9003', datum: '2026-06-07', kunde: 'Hotel Beispielsee', auftrag: 'AUF-1006', netto: 990.0, mwst: 158.40, brutto: 1100.0, positionen: 1, bezahlt: false, status: 'Abgeschlossen' },
  { rechnung: 'RE-9004', datum: '2026-06-08', kunde: 'Muster Reha-Zentrum', auftrag: 'AUF-1008', netto: 500.0, mwst: 95.0, brutto: 595.0, positionen: 0, bezahlt: true, status: 'Abgeschlossen' },
  { rechnung: 'RE-9005', datum: '2026-06-09', kunde: 'Demo B2B Handel', auftrag: 'AUF-1010', netto: -210.0, mwst: -39.90, brutto: -249.90, positionen: 1, bezahlt: true, status: 'Gutschrift' }
]
export function pruefeRechnung(r) {
  const b = []
  if (Math.round((r.netto + r.mwst) * 100) / 100 !== r.brutto) b.push({ feld: 'brutto', schwere: 'fehler', text: `Brutto ≠ Netto + MwSt (${(r.netto + r.mwst).toFixed(2)})` })
  if (r.positionen === 0) b.push({ feld: 'positionen', schwere: 'fehler', text: 'Rechnung ohne Positionen' })
  if (r.netto < 0 && r.status !== 'Gutschrift') b.push({ feld: 'netto', schwere: 'warnung', text: 'Negativer Betrag ohne Gutschrift-Status' })
  if (!r.bezahlt && r.status === 'Abgeschlossen') b.push({ feld: 'bezahlt', schwere: 'warnung', text: 'Abgeschlossen, aber unbezahlt' })
  const satz = r.netto ? Math.round(r.mwst / r.netto * 100) : 0
  if (r.netto > 0 && satz !== 19 && satz !== 7) b.push({ feld: 'mwst', schwere: 'hinweis', text: `Ungewöhnlicher Steuersatz (${satz} %)` })
  return b
}
export function rechnungsliste(o = {}) { return generischListe(RECHNUNGEN, pruefeRechnung, o, ['netto', 'mwst', 'brutto'], (r, q) => norm(r.rechnung).includes(q) || norm(r.kunde).includes(q) || norm(r.auftrag).includes(q)) }

export const KUNDEN = [
  { kundennr: 'KD-1001', name: 'Max Mustermann', email: 'm.birkner@example.com', land: 'DE', umsatzJahr: 1240, offeneForderung: 0, kreditlimit: 2000, status: 'aktiv' },
  { kundennr: 'KD-1002', name: 'Erika Musterfrau', email: 'skarics(at)example.com', land: 'AT', umsatzJahr: 8900, offeneForderung: 1200, kreditlimit: 5000, status: 'aktiv' },
  { kundennr: 'KD-1003', name: 'Tom Beispiel', email: 'l.vogt@example.com', land: 'DE', umsatzJahr: 0, offeneForderung: 0, kreditlimit: 1000, status: 'aktiv' },
  { kundennr: 'KD-1004', name: 'Demo Logistik AG', email: 'einkauf@logistik-ag.de', land: 'DE', umsatzJahr: 64000, offeneForderung: 9800, kreditlimit: 8000, status: 'aktiv' },
  { kundennr: 'KD-1005', name: 'Muster Inaktiv-Konto', email: '', land: 'DE', umsatzJahr: 0, offeneForderung: 0, kreditlimit: 0, status: 'inaktiv' }
]
export function pruefeKunde(k) {
  const b = []
  if (k.offeneForderung > k.kreditlimit) b.push({ feld: 'offeneForderung', schwere: 'fehler', text: `Kreditlimit überschritten (Limit ${k.kreditlimit})` })
  if (!k.email.includes('@')) b.push({ feld: 'email', schwere: 'warnung', text: 'E-Mail ungültig/fehlt' })
  if (k.umsatzJahr === 0 && k.status === 'aktiv') b.push({ feld: 'umsatzJahr', schwere: 'hinweis', text: 'Aktiver Kunde ohne Jahresumsatz' })
  return b
}
export function kundenliste(o = {}) { return generischListe(KUNDEN, pruefeKunde, o, ['umsatzJahr', 'offeneForderung', 'kreditlimit'], (k, q) => norm(k.kundennr).includes(q) || norm(k.name).includes(q) || norm(k.email).includes(q)) }

// ---- Produkt-, Rechnungspos-, Bestellkanal-, Chargen-, Auftragsbestand ---
const HEUTE = '2026-06-22'
const tageBis = (d) => Math.round((new Date(d) - new Date(HEUTE)) / 86400000)

export const PRODUKTE = [
  { sku: 'ART-2001', name: 'GRAVEL 22 BACKROAD', gruppe: 'Fahrrad', marke: 'DemoBike', ean: '4000000000017', status: 'aktiv', vkBrutto: 1499.0, steuersatz: 19, gewicht: 11.2 },
  { sku: 'ART-2002', name: 'E-Bike Akku 625Wh', gruppe: 'Zubehör', marke: 'DemoPower', ean: '', status: 'aktiv', vkBrutto: 749.0, steuersatz: 19, gewicht: 3.5 },
  { sku: 'ART-2003', name: 'Trikot Pro M', gruppe: 'Bekleidung', marke: 'DemoWear', ean: '4000000000031', status: 'auslauf', vkBrutto: 0, steuersatz: 19, gewicht: 0.2 },
  { sku: 'ART-2004', name: 'Energieriegel Box', gruppe: 'Nahrung', marke: 'DemoFood', ean: '4000000000048', status: 'aktiv', vkBrutto: 24.9, steuersatz: 7, gewicht: 0.6 },
  { sku: 'ART-2005', name: 'Vintage Rahmen XL', gruppe: 'Fahrrad', marke: 'Eigen', ean: '4000000000055', status: 'gesperrt', vkBrutto: 299.0, steuersatz: 19, gewicht: 0 }
]
export function pruefeProdukt(p) {
  const b = []
  if (p.vkBrutto <= 0) b.push({ feld: 'vkBrutto', schwere: 'fehler', text: 'Kein VK-Preis hinterlegt' })
  if (!p.ean || p.ean.length !== 13) b.push({ feld: 'ean', schwere: 'warnung', text: 'EAN fehlt oder ungültig (13 Stellen)' })
  if (p.status === 'gesperrt') b.push({ feld: 'status', schwere: 'hinweis', text: 'Gesperrtes Produkt (nicht verkaufbar)' })
  if (p.gewicht <= 0) b.push({ feld: 'gewicht', schwere: 'hinweis', text: 'Gewicht fehlt (Versandberechnung)' })
  return b
}
export function produktliste(o = {}) { return generischListe(PRODUKTE, pruefeProdukt, o, ['vkBrutto', 'gewicht'], (p, q) => norm(p.sku).includes(q) || norm(p.name).includes(q) || norm(p.marke).includes(q)) }

export const RECHNUNGSPOS = [
  { rechnung: 'RE-9001', pos: 1, sku: 'ART-2006', artikel: 'GIANT TCR', menge: 1, einzelpreis: 99.0, rabattPct: 0, netto: 99.0, mwst: 18.81 },
  { rechnung: 'RE-9002', pos: 1, sku: 'ART-2001', artikel: 'GRAVEL 22', menge: 2, einzelpreis: 1259.66, rabattPct: 0, netto: 2519.32, mwst: 478.67 },
  { rechnung: 'RE-9002', pos: 2, sku: 'ART-2004', artikel: 'Energieriegel', menge: 10, einzelpreis: 18.93, rabattPct: 10, netto: 200.0, mwst: 14.0 },
  { rechnung: 'RE-9003', pos: 1, sku: 'ART-2003', artikel: 'Trikot Pro M', menge: 0, einzelpreis: 79.0, rabattPct: 0, netto: 0, mwst: 0 },
  { rechnung: 'RE-9005', pos: 1, sku: 'ART-2002', artikel: 'Akku 625Wh', menge: 1, einzelpreis: 210.0, rabattPct: 60, netto: 84.0, mwst: 15.96 }
]
export function pruefeRechnungpos(p) {
  const b = []
  const soll = r2(p.menge * p.einzelpreis * (1 - p.rabattPct / 100))
  if (p.menge <= 0) b.push({ feld: 'menge', schwere: 'fehler', text: 'Menge ≤ 0' })
  else if (Math.abs(soll - p.netto) > 0.02) b.push({ feld: 'netto', schwere: 'fehler', text: `Positionsnetto stimmt nicht (Soll ${soll.toFixed(2)})` })
  if (p.rabattPct > 50) b.push({ feld: 'rabattPct', schwere: 'warnung', text: 'Sehr hoher Rabatt (> 50 %)' })
  return b
}
export function rechnungsposliste(o = {}) { return generischListe(RECHNUNGSPOS, pruefeRechnungpos, o, ['menge', 'netto', 'mwst'], (p, q) => norm(p.rechnung).includes(q) || norm(p.sku).includes(q) || norm(p.artikel).includes(q)) }

export const BESTELLKANAELE = [
  { kanal: 'Beispiel Onlineshop', bestellungen: 1284, umsatz: 312400, retourenQuote: 12.4, stornoQuote: 3.1, avgWarenkorb: 243.3 },
  { kanal: 'Amazon', bestellungen: 842, umsatz: 168200, retourenQuote: 34.8, stornoQuote: 5.2, avgWarenkorb: 199.8 },
  { kanal: 'eBay', bestellungen: 311, umsatz: 54800, retourenQuote: 18.0, stornoQuote: 18.5, avgWarenkorb: 176.2 },
  { kanal: 'Filiale', bestellungen: 2050, umsatz: 487300, retourenQuote: 4.1, stornoQuote: 0.8, avgWarenkorb: 237.7 },
  { kanal: 'B2B Direkt', bestellungen: 0, umsatz: 0, retourenQuote: 0, stornoQuote: 0, avgWarenkorb: 0 }
]
export function pruefeBestellkanal(k) {
  const b = []
  if (k.retourenQuote > 30) b.push({ feld: 'retourenQuote', schwere: 'warnung', text: 'Hohe Retourenquote (> 30 %)' })
  if (k.stornoQuote > 15) b.push({ feld: 'stornoQuote', schwere: 'warnung', text: 'Hohe Stornoquote (> 15 %)' })
  if (k.bestellungen === 0) b.push({ feld: 'bestellungen', schwere: 'hinweis', text: 'Kanal ohne Bestellungen' })
  return b
}
export function bestellkanalliste(o = {}) { return generischListe(BESTELLKANAELE, pruefeBestellkanal, o, ['bestellungen', 'umsatz'], (k, q) => norm(k.kanal).includes(q)) }

export const CHARGEN = [
  { charge: 'CH-2026-014', sku: 'ART-2004', artikel: 'Energieriegel Box', menge: 240, mhd: '2026-12-01', wareneingang: '2026-03-10', lieferant: 'Muster Riegel GmbH', gesperrt: false },
  { charge: 'CH-2026-009', sku: 'ART-2004', artikel: 'Energieriegel Box', menge: 60, mhd: '2026-07-05', wareneingang: '2025-12-02', lieferant: 'Muster Riegel GmbH', gesperrt: false },
  { charge: 'CH-2025-221', sku: 'ART-2004', artikel: 'Energieriegel Box', menge: 30, mhd: '2026-05-30', wareneingang: '2025-09-15', lieferant: 'Muster Riegel GmbH', gesperrt: false },
  { charge: 'CH-2026-031', sku: 'ART-2002', artikel: 'E-Bike Akku 625Wh', menge: 0, mhd: '2028-01-01', wareneingang: '2026-04-01', lieferant: 'Demo Akku AG', gesperrt: false },
  { charge: 'CH-2026-040', sku: 'ART-2002', artikel: 'E-Bike Akku 625Wh', menge: 12, mhd: '2027-06-01', wareneingang: '2026-05-20', lieferant: 'Demo Akku AG', gesperrt: true }
]
export function pruefeCharge(c) {
  const b = []
  const rest = tageBis(c.mhd)
  if (rest < 0) b.push({ feld: 'mhd', schwere: 'fehler', text: `MHD überschritten (${-rest} Tage)` })
  else if (rest <= 45) b.push({ feld: 'mhd', schwere: 'warnung', text: `MHD bald erreicht (${rest} Tage)` })
  if (c.gesperrt) b.push({ feld: 'gesperrt', schwere: 'hinweis', text: 'Charge gesperrt (Qualitätssicherung)' })
  if (c.menge <= 0) b.push({ feld: 'menge', schwere: 'hinweis', text: 'Charge ohne Bestand' })
  return b
}
export function chargenliste(o = {}) { return generischListe(CHARGEN, pruefeCharge, o, ['menge'], (c, q) => norm(c.charge).includes(q) || norm(c.sku).includes(q) || norm(c.artikel).includes(q) || norm(c.lieferant).includes(q)) }

export const AUFTRAGSBESTAND = [
  { auftrag: 'AUF-1004', kunde: 'Muster Stadtwerke', datum: '2026-05-28', sku: 'ART-2001', artikel: 'GRAVEL 22', bestellt: 5, geliefert: 2, offen: 3, wert: 3779.0, liefertermin: '2026-07-10' },
  { auftrag: 'AUF-1005', kunde: 'Beispiel Lieferdienst', datum: '2026-06-05', sku: 'ART-2002', artikel: 'Akku 625Wh', bestellt: 10, geliefert: 10, offen: 0, wert: 0, liefertermin: '2026-06-20' },
  { auftrag: 'AUF-1009', kunde: 'Beispiel Onlineshop', datum: '2026-05-30', sku: 'ART-2004', artikel: 'Energieriegel', bestellt: 100, geliefert: 40, offen: 60, wert: 1494.0, liefertermin: '2026-06-10' },
  { auftrag: 'AUF-1010', kunde: 'Demo B2B Handel', datum: '2026-06-08', sku: 'ART-2003', artikel: 'Trikot Pro M', bestellt: 20, geliefert: 25, offen: -5, wert: -395.0, liefertermin: '2026-07-01' },
  { auftrag: 'AUF-1007', kunde: 'Demo Logistik AG', datum: '2026-05-22', sku: 'ART-2001', artikel: 'GRAVEL 22', bestellt: 8, geliefert: 3, offen: 4, wert: 5036.0, liefertermin: '2026-08-15' }
]
export function pruefeAuftragsbestand(a) {
  const b = []
  if (a.offen < 0) b.push({ feld: 'offen', schwere: 'fehler', text: 'Übermenge geliefert (offen < 0)' })
  else if (a.offen !== a.bestellt - a.geliefert) b.push({ feld: 'offen', schwere: 'fehler', text: `Offene Menge inkonsistent (Soll ${a.bestellt - a.geliefert})` })
  if (a.offen > 0 && tageBis(a.liefertermin) < 0) b.push({ feld: 'liefertermin', schwere: 'warnung', text: `Liefertermin überschritten (${-tageBis(a.liefertermin)} Tage)` })
  return b
}
export function auftragsbestandliste(o = {}) { return generischListe(AUFTRAGSBESTAND, pruefeAuftragsbestand, o, ['bestellt', 'geliefert', 'offen', 'wert'], (a, q) => norm(a.auftrag).includes(q) || norm(a.kunde).includes(q) || norm(a.artikel).includes(q)) }

// ---- Lieferanten-, Bestell- (Einkauf), Offene-Posten-, Inventurliste -----
export const LIEFERANTEN = [
  { lieferantNr: 'L-100', name: 'Muster Riegel GmbH', land: 'DE', lieferzeitTage: 7, reklamationsQuote: 2.1, offeneBestellungen: 1, bewertung: 'A', status: 'aktiv' },
  { lieferantNr: 'L-200', name: 'Demo Akku AG', land: 'DE', lieferzeitTage: 14, reklamationsQuote: 0.8, offeneBestellungen: 2, bewertung: 'A', status: 'aktiv' },
  { lieferantNr: 'L-300', name: 'Beispiel Textil GmbH', land: 'IT', lieferzeitTage: 24, reklamationsQuote: 9.5, offeneBestellungen: 1, bewertung: 'C', status: 'aktiv' },
  { lieferantNr: 'L-400', name: 'Eigenfertigung', land: 'DE', lieferzeitTage: 0, reklamationsQuote: 0, offeneBestellungen: 0, bewertung: 'B', status: 'aktiv' },
  { lieferantNr: 'L-500', name: 'Alt-Lieferant', land: 'DE', lieferzeitTage: 30, reklamationsQuote: 0, offeneBestellungen: 0, bewertung: 'C', status: 'gesperrt' }
]
export function pruefeLieferant(l) {
  const b = []
  if (l.reklamationsQuote > 5) b.push({ feld: 'reklamationsQuote', schwere: 'warnung', text: 'Hohe Reklamationsquote (> 5 %)' })
  if (l.lieferzeitTage > 21) b.push({ feld: 'lieferzeitTage', schwere: 'warnung', text: 'Lange Lieferzeit (> 21 Tage)' })
  if (l.status === 'gesperrt') b.push({ feld: 'status', schwere: 'hinweis', text: 'Lieferant gesperrt' })
  if (l.lieferzeitTage === 0 && l.status === 'aktiv') b.push({ feld: 'lieferzeitTage', schwere: 'hinweis', text: 'Keine Lieferzeit hinterlegt' })
  return b
}
export function lieferantenliste(o = {}) { return generischListe(LIEFERANTEN, pruefeLieferant, o, ['offeneBestellungen'], (l, q) => norm(l.lieferantNr).includes(q) || norm(l.name).includes(q) || norm(l.land).includes(q)) }

export const BESTELLUNGEN = [
  { bestellung: 'B-7001', datum: '2026-05-10', lieferant: 'Muster Riegel GmbH', sku: 'ART-2004', artikel: 'Energieriegel Box', menge: 240, ekPreis: 16.0, wert: 3840.0, status: 'geliefert', liefertermin: '2026-05-20' },
  { bestellung: 'B-7002', datum: '2026-06-01', lieferant: 'Demo Akku AG', sku: 'ART-2002', artikel: 'E-Bike Akku 625Wh', menge: 30, ekPreis: 520.0, wert: 15600.0, status: 'offen', liefertermin: '2026-06-15' },
  { bestellung: 'B-7003', datum: '2026-06-05', lieferant: 'Beispiel Textil GmbH', sku: 'ART-2003', artikel: 'Trikot Pro M', menge: 0, ekPreis: 79.0, wert: 0, status: 'offen', liefertermin: '2026-07-01' },
  { bestellung: 'B-7004', datum: '2026-06-08', lieferant: 'Muster Riegel GmbH', sku: 'ART-2004', artikel: 'Energieriegel Box', menge: 60, ekPreis: 17.5, wert: 1050.0, status: 'geliefert', liefertermin: '2026-06-12' },
  { bestellung: 'B-7005', datum: '2026-06-10', lieferant: 'Demo Akku AG', sku: 'ART-2002', artikel: 'E-Bike Akku 625Wh', menge: 12, ekPreis: 999.0, wert: 12000.0, status: 'offen', liefertermin: '2026-07-20' }
]
export function pruefeBestellung(o) {
  const b = []
  if (o.menge <= 0) b.push({ feld: 'menge', schwere: 'fehler', text: 'Bestellmenge ≤ 0' })
  else if (Math.abs(r2(o.menge * o.ekPreis) - o.wert) > 0.02) b.push({ feld: 'wert', schwere: 'fehler', text: `Bestellwert stimmt nicht (Soll ${r2(o.menge * o.ekPreis).toFixed(2)})` })
  if (o.status === 'offen' && tageBis(o.liefertermin) < 0) b.push({ feld: 'liefertermin', schwere: 'warnung', text: `Liefertermin überschritten (${-tageBis(o.liefertermin)} Tage)` })
  return b
}
export function bestellliste(o = {}) { return generischListe(BESTELLUNGEN, pruefeBestellung, o, ['menge', 'wert'], (x, q) => norm(x.bestellung).includes(q) || norm(x.lieferant).includes(q) || norm(x.sku).includes(q) || norm(x.artikel).includes(q)) }

export const OFFENEPOSTEN = [
  { beleg: 'OP-1', kunde: 'Muster Stadtwerke', rechnung: 'RE-9002', betrag: 3200.0, faellig: '2026-06-20', bezahltAm: '', mahnstufe: 1, status: 'offen' },
  { beleg: 'OP-2', kunde: 'Hotel Beispielsee', rechnung: 'RE-9003', betrag: 1100.0, faellig: '2026-06-25', bezahltAm: '', mahnstufe: 0, status: 'offen' },
  { beleg: 'OP-3', kunde: 'Erika Musterfrau', rechnung: 'RE-9001', betrag: 117.81, faellig: '2026-06-19', bezahltAm: '2026-06-15', mahnstufe: 0, status: 'bezahlt' },
  { beleg: 'OP-4', kunde: 'Demo Logistik AG', rechnung: 'RE-9009', betrag: 9800.0, faellig: '2026-05-01', bezahltAm: '', mahnstufe: 3, status: 'offen' },
  { beleg: 'OP-5', kunde: 'Demo B2B Handel', rechnung: 'RE-9005', betrag: -249.90, faellig: '2026-06-09', bezahltAm: '', mahnstufe: 0, status: 'offen' }
]
export function pruefeOffenerPosten(p) {
  const b = []
  if (p.mahnstufe >= 3) b.push({ feld: 'mahnstufe', schwere: 'fehler', text: 'Höchste Mahnstufe erreicht' })
  if (!p.bezahltAm && tageBis(p.faellig) < 0) b.push({ feld: 'faellig', schwere: 'warnung', text: `Überfällig (${-tageBis(p.faellig)} Tage)` })
  if (p.betrag < 0) b.push({ feld: 'betrag', schwere: 'hinweis', text: 'Negativer Posten (Gutschrift)' })
  return b
}
export function offenepostenliste(o = {}) { return generischListe(OFFENEPOSTEN, pruefeOffenerPosten, o, ['betrag'], (p, q) => norm(p.beleg).includes(q) || norm(p.kunde).includes(q) || norm(p.rechnung).includes(q)) }

export const INVENTUR = [
  { zaehlung: 'INV-01', sku: 'ART-2004', artikel: 'Energieriegel Box', lagerort: 'L1-A', buchbestand: 330, zaehlbestand: 330, differenz: 0, wertDifferenz: 0 },
  { zaehlung: 'INV-02', sku: 'ART-2002', artikel: 'E-Bike Akku 625Wh', lagerort: 'L2-C', buchbestand: 12, zaehlbestand: 9, differenz: -3, wertDifferenz: -1560 },
  { zaehlung: 'INV-03', sku: 'ART-2001', artikel: 'GRAVEL 22 BACKROAD', lagerort: 'L1-B', buchbestand: 5, zaehlbestand: 7, differenz: 2, wertDifferenz: 2519 },
  { zaehlung: 'INV-04', sku: 'ART-2003', artikel: 'Trikot Pro M', lagerort: 'L3-A', buchbestand: 20, zaehlbestand: 0, differenz: -20, wertDifferenz: -1580 },
  { zaehlung: 'INV-05', sku: 'ART-2005', artikel: 'Vintage Rahmen XL', lagerort: 'L4', buchbestand: -1, zaehlbestand: 0, differenz: 1, wertDifferenz: 299 }
]
export function pruefeInventur(i) {
  const b = []
  if (i.buchbestand < 0) b.push({ feld: 'buchbestand', schwere: 'fehler', text: 'Negativer Buchbestand' })
  if (i.differenz !== i.zaehlbestand - i.buchbestand) b.push({ feld: 'differenz', schwere: 'fehler', text: `Differenz inkonsistent (Soll ${i.zaehlbestand - i.buchbestand})` })
  else if (Math.abs(i.differenz) > 1) b.push({ feld: 'differenz', schwere: 'warnung', text: 'Inventurdifferenz' })
  else if (i.differenz !== 0) b.push({ feld: 'differenz', schwere: 'hinweis', text: 'Geringe Inventurdifferenz' })
  return b
}
export function inventurliste(o = {}) { return generischListe(INVENTUR, pruefeInventur, o, ['buchbestand', 'zaehlbestand', 'differenz', 'wertDifferenz'], (i, q) => norm(i.zaehlung).includes(q) || norm(i.sku).includes(q) || norm(i.artikel).includes(q) || norm(i.lagerort).includes(q)) }

// ---- Kontenliste (DimKonto): Kontenstamm + Zuweisungen je Spalte ---------
export const KONTEN = [
  { kontoNr: '8400', bezeichnung: 'Erlöse Inland 19%', klasse: 8, guvBilanz: 'GuV', kostenart: 'Umsatzerlöse', kostenstelle: '', abstimmposition: 'umsatz', steuerschluessel: 'USt19', status: 'aktiv', saldo: 52000000 },
  { kontoNr: '3400', bezeichnung: 'Wareneinsatz / Materialaufwand', klasse: 3, guvBilanz: 'GuV', kostenart: 'Materialaufwand', kostenstelle: 'KST-300', abstimmposition: 'wareneinsatz', steuerschluessel: 'VSt19', status: 'aktiv', saldo: 31200000 },
  { kontoNr: '4100', bezeichnung: 'Löhne und Gehälter', klasse: 4, guvBilanz: 'GuV', kostenart: '', kostenstelle: 'KST-400', abstimmposition: 'personal', steuerschluessel: '—', status: 'aktiv', saldo: 9800000 },
  { kontoNr: '1200', bezeichnung: 'Bank / Kasse', klasse: 1, guvBilanz: 'Bilanz-Aktiv', kostenart: '', kostenstelle: '', abstimmposition: 'liquide', steuerschluessel: '—', status: 'aktiv', saldo: 4100000 },
  { kontoNr: '2000', bezeichnung: 'Eigenkapital', klasse: 2, guvBilanz: 'GuV', kostenart: '', kostenstelle: '', abstimmposition: '', steuerschluessel: '—', status: 'aktiv', saldo: 12000000 },
  { kontoNr: '5900', bezeichnung: 'Sonstige betriebl. Aufwendungen', klasse: 5, guvBilanz: 'GuV', kostenart: 'Sonstige Kosten', kostenstelle: 'KST-500', abstimmposition: '', steuerschluessel: 'VSt19', status: 'aktiv', saldo: 2400000 },
  { kontoNr: '8500', bezeichnung: 'Alt-Erlöskonto (Migration)', klasse: 8, guvBilanz: 'GuV', kostenart: 'Umsatzerlöse', kostenstelle: '', abstimmposition: 'umsatz', steuerschluessel: '—', status: 'gesperrt', saldo: 1200 }
]
export function pruefeKonto(k) {
  const b = []
  if (k.guvBilanz === 'GuV' && k.klasse <= 2) b.push({ feld: 'guvBilanz', schwere: 'fehler', text: 'Klassenkonflikt: GuV-Konto in Bilanzklasse (0–2)' })
  if (k.guvBilanz.startsWith('Bilanz') && k.klasse >= 4) b.push({ feld: 'guvBilanz', schwere: 'fehler', text: 'Klassenkonflikt: Bilanzkonto in GuV-Klasse (4–8)' })
  if (k.status === 'gesperrt' && k.saldo !== 0) b.push({ feld: 'status', schwere: 'fehler', text: 'Gesperrtes Konto mit Saldo ≠ 0' })
  if (k.guvBilanz === 'GuV' && k.klasse >= 3 && !k.kostenart) b.push({ feld: 'kostenart', schwere: 'warnung', text: 'Keine Kostenart-Zuordnung' })
  if (k.guvBilanz === 'GuV' && !k.abstimmposition) b.push({ feld: 'abstimmposition', schwere: 'hinweis', text: 'Keine Abstimmposition zugeordnet' })
  if (k.klasse === 8 && k.steuerschluessel === '—') b.push({ feld: 'steuerschluessel', schwere: 'hinweis', text: 'Erlöskonto ohne Steuerschlüssel' })
  return b
}
export function kontenliste(o = {}) { return generischListe(KONTEN, pruefeKonto, o, ['saldo'], (k, q) => norm(k.kontoNr).includes(q) || norm(k.bezeichnung).includes(q) || norm(k.kostenart).includes(q) || norm(k.abstimmposition).includes(q)) }

// Generischer Listen-Helfer (Befunde + Filter + Summen).
function generischListe(daten, pruef, { suche = '', nurAuffaellig = false } = {}, sumKeys = [], match) {
  const q = norm(suche)
  let rows = daten.map((d) => { const befunde = pruef(d); return { ...d, befunde, schwere: maxSchwere(befunde) } })
  if (q && match) rows = rows.filter((d) => match(d, q))
  if (nurAuffaellig) rows = rows.filter((d) => d.befunde.length)
  const summe = {}; for (const k of sumKeys) summe[k] = r2(rows.reduce((n, d) => n + (d[k] || 0), 0))
  return { rows, summe, auffaellig: daten.filter((d) => pruef(d).length).length, gesamt: daten.length }
}

// ---- Katalog der Detailberichte -----------------------------------------
export const LISTEN = [
  { id: 'auftrag', name: 'Auftragsliste', verfuegbar: true },
  { id: 'artikel', name: 'Artikelliste', verfuegbar: true },
  { id: 'produkt', name: 'Produktliste', verfuegbar: true },
  { id: 'rechnung', name: 'Rechnungsliste (mit Positionen)', verfuegbar: true },
  { id: 'bestellkanal', name: 'Bestellkanalliste', verfuegbar: true },
  { id: 'leasing', name: 'Leasingliste', verfuegbar: true },
  { id: 'charge', name: 'Chargenliste', verfuegbar: true },
  { id: 'kunde', name: 'Kundenliste', verfuegbar: true },
  { id: 'plausiwv', name: 'Plausi: Warenverbrauch', verfuegbar: true },
  { id: 'retoure', name: 'Retourenliste', verfuegbar: true },
  { id: 'auftragsbestand', name: 'Auftragsbestandsliste', verfuegbar: true },
  { id: 'lieferant', name: 'Lieferantenliste', verfuegbar: true },
  { id: 'bestellung', name: 'Bestellliste (Einkauf)', verfuegbar: true },
  { id: 'offeneposten', name: 'Offene-Posten-Liste', verfuegbar: true },
  { id: 'inventur', name: 'Inventurliste', verfuegbar: true },
  { id: 'konto', name: 'Kontenliste (DimKonto)', verfuegbar: true }
]

// ---- Zentrale Registry + Sammel-Plausi (alle Listen gebündelt) ----------
// Map je Liste: Lade-Funktion + Schlüssel-/Titelfeld. Basis für Cockpit & Export.
export const REGISTRY = [
  { id: 'auftrag', name: 'Auftragsliste', lade: auftragsliste, idKey: 'auftrag', titelKey: 'kunde' },
  { id: 'artikel', name: 'Artikelliste', lade: artikelliste, idKey: 'sku', titelKey: 'artikel' },
  { id: 'produkt', name: 'Produktliste', lade: produktliste, idKey: 'sku', titelKey: 'name' },
  { id: 'rechnung', name: 'Rechnungsliste', lade: rechnungsliste, idKey: 'rechnung', titelKey: 'kunde' },
  { id: 'rechnungpos', name: 'Rechnungspositionsliste', lade: rechnungsposliste, idKey: 'rechnung', titelKey: 'artikel' },
  { id: 'bestellkanal', name: 'Bestellkanalliste', lade: bestellkanalliste, idKey: 'kanal', titelKey: 'kanal' },
  { id: 'leasing', name: 'Leasingliste', lade: leasingliste, idKey: 'vorgang', titelKey: 'kunde' },
  { id: 'charge', name: 'Chargenliste', lade: chargenliste, idKey: 'charge', titelKey: 'artikel' },
  { id: 'kunde', name: 'Kundenliste', lade: kundenliste, idKey: 'kundennr', titelKey: 'name' },
  { id: 'plausiwv', name: 'Plausi: Warenverbrauch', lade: warenverbrauchliste, idKey: 'sku', titelKey: 'artikel' },
  { id: 'retoure', name: 'Retourenliste', lade: retourenliste, idKey: 'retoure', titelKey: 'kunde' },
  { id: 'auftragsbestand', name: 'Auftragsbestandsliste', lade: auftragsbestandliste, idKey: 'auftrag', titelKey: 'kunde' },
  { id: 'lieferant', name: 'Lieferantenliste', lade: lieferantenliste, idKey: 'lieferantNr', titelKey: 'name' },
  { id: 'bestellung', name: 'Bestellliste (Einkauf)', lade: bestellliste, idKey: 'bestellung', titelKey: 'artikel' },
  { id: 'offeneposten', name: 'Offene-Posten-Liste', lade: offenepostenliste, idKey: 'beleg', titelKey: 'kunde' },
  { id: 'inventur', name: 'Inventurliste', lade: inventurliste, idKey: 'zaehlung', titelKey: 'artikel' },
  { id: 'konto', name: 'Kontenliste (DimKonto)', lade: kontenliste, idKey: 'kontoNr', titelKey: 'bezeichnung' }
]

/** Alle Befunde aller Listen als flache Liste (ein Eintrag je Befund). */
export function sammelBefunde() {
  const items = []
  for (const l of REGISTRY) {
    for (const r of l.lade().rows) {
      for (const b of (r.befunde || [])) {
        items.push({ listId: l.id, listName: l.name, id: r[l.idKey], titel: r[l.titelKey], schwere: b.schwere, text: b.text, feld: b.feld })
      }
    }
  }
  const rang = { fehler: 0, warnung: 1, hinweis: 2 }
  return items.sort((a, b) => rang[a.schwere] - rang[b.schwere] || a.listName.localeCompare(b.listName))
}

/** Kennzahlen: Anzahl je Schwere insgesamt und je Liste. */
export function befundStatistik() {
  const items = sammelBefunde()
  const proSchwere = { fehler: 0, warnung: 0, hinweis: 0 }
  const proListe = {}
  for (const it of items) {
    proSchwere[it.schwere]++
    proListe[it.listId] = proListe[it.listId] || { id: it.listId, name: it.listName, fehler: 0, warnung: 0, hinweis: 0, gesamt: 0 }
    proListe[it.listId][it.schwere]++
    proListe[it.listId].gesamt++
  }
  return { gesamt: items.length, proSchwere, proListe: Object.values(proListe).sort((a, b) => b.gesamt - a.gesamt) }
}

// ---- Referenzielle Verknüpfung (Cross-Drill zwischen Listen) -------------
// Je Liste: welche Felder verweisen in welche andere Liste? Der Feldwert wird
// als Filter (Suche) in die Zielliste übergeben. Verknüpfungen ohne Treffer
// werden zur Laufzeit ausgeblendet (anzahl > 0).
export const VERKNUEPFUNGEN = {
  rechnung: [{ ziel: 'rechnungpos', label: 'Positionen', feld: 'rechnung' }, { ziel: 'offeneposten', label: 'Offene Posten', feld: 'rechnung' }, { ziel: 'kunde', label: 'Kunde', feld: 'kunde' }],
  rechnungpos: [{ ziel: 'rechnung', label: 'Rechnung', feld: 'rechnung' }, { ziel: 'produkt', label: 'Produkt', feld: 'sku' }, { ziel: 'artikel', label: 'Artikel/Bestand', feld: 'sku' }, { ziel: 'charge', label: 'Chargen', feld: 'sku' }],
  produkt: [{ ziel: 'artikel', label: 'Artikel/Bestand', feld: 'sku' }, { ziel: 'charge', label: 'Chargen', feld: 'sku' }, { ziel: 'rechnungpos', label: 'Verkäufe', feld: 'sku' }, { ziel: 'bestellung', label: 'Bestellungen', feld: 'sku' }, { ziel: 'inventur', label: 'Inventur', feld: 'sku' }],
  artikel: [{ ziel: 'produkt', label: 'Produkt', feld: 'sku' }, { ziel: 'charge', label: 'Chargen', feld: 'sku' }, { ziel: 'auftragsbestand', label: 'Auftragsbestand', feld: 'sku' }, { ziel: 'bestellung', label: 'Bestellungen', feld: 'sku' }, { ziel: 'inventur', label: 'Inventur', feld: 'sku' }],
  charge: [{ ziel: 'produkt', label: 'Produkt', feld: 'sku' }, { ziel: 'artikel', label: 'Artikel/Bestand', feld: 'sku' }, { ziel: 'lieferant', label: 'Lieferant', feld: 'lieferant' }, { ziel: 'bestellung', label: 'Bestellungen', feld: 'sku' }],
  warenverbrauch: [{ ziel: 'produkt', label: 'Produkt', feld: 'sku' }, { ziel: 'charge', label: 'Chargen', feld: 'sku' }],
  leasing: [{ ziel: 'auftragsbestand', label: 'Auftragsbestand', feld: 'auftrag' }, { ziel: 'kunde', label: 'Kunde', feld: 'kunde' }, { ziel: 'auftrag', label: 'Auftrag', feld: 'auftrag' }],
  auftragsbestand: [{ ziel: 'leasing', label: 'Leasing', feld: 'auftrag' }, { ziel: 'produkt', label: 'Produkt', feld: 'sku' }, { ziel: 'charge', label: 'Chargen', feld: 'sku' }, { ziel: 'kunde', label: 'Kunde', feld: 'kunde' }],
  kunde: [{ ziel: 'rechnung', label: 'Rechnungen', feld: 'name' }, { ziel: 'offeneposten', label: 'Offene Posten', feld: 'name' }, { ziel: 'leasing', label: 'Leasing', feld: 'name' }, { ziel: 'auftragsbestand', label: 'Auftragsbestand', feld: 'name' }],
  retoure: [{ ziel: 'auftrag', label: 'Auftrag', feld: 'auftrag' }],
  auftrag: [{ ziel: 'leasing', label: 'Leasing', feld: 'auftrag' }, { ziel: 'auftragsbestand', label: 'Auftragsbestand', feld: 'auftrag' }, { ziel: 'retoure', label: 'Retouren', feld: 'auftrag' }],
  lieferant: [{ ziel: 'bestellung', label: 'Bestellungen', feld: 'name' }, { ziel: 'charge', label: 'Chargen', feld: 'name' }],
  bestellung: [{ ziel: 'lieferant', label: 'Lieferant', feld: 'lieferant' }, { ziel: 'produkt', label: 'Produkt', feld: 'sku' }, { ziel: 'artikel', label: 'Artikel/Bestand', feld: 'sku' }, { ziel: 'charge', label: 'Chargen', feld: 'sku' }],
  offeneposten: [{ ziel: 'rechnung', label: 'Rechnung', feld: 'rechnung' }, { ziel: 'rechnungpos', label: 'Positionen', feld: 'rechnung' }, { ziel: 'kunde', label: 'Kunde', feld: 'kunde' }],
  inventur: [{ ziel: 'produkt', label: 'Produkt', feld: 'sku' }, { ziel: 'artikel', label: 'Artikel/Bestand', feld: 'sku' }, { ziel: 'charge', label: 'Chargen', feld: 'sku' }]
}

/** Auflösbare Verknüpfungen eines Datensatzes (nur Ziele mit Treffern). */
export function verknuepfungenFuer(typ, row) {
  const out = []
  for (const d of (VERKNUEPFUNGEN[typ] || [])) {
    const wert = row[d.feld]
    if (wert == null || wert === '') continue
    const ziel = REGISTRY.find((r) => r.id === d.ziel)
    if (!ziel) continue
    const anzahl = ziel.lade({ suche: String(wert) }).rows.length
    if (anzahl > 0) out.push({ ziel: d.ziel, zielName: ziel.name, label: d.label, suche: String(wert), anzahl })
  }
  return out
}

// Drill-Down E3 → E4: welcher Fachbereich (E2-Code) führt in welche Detailliste?
// Ziel: JEDE Kennzahl soll auf eine verursachungsnahe, befüllte Belegliste
// drillen können (Transparenz-Herzstück). Bereiche ohne fachlich passende
// Detailliste (HR/IT/Personalcontrolling) bleiben offen und fallen auf die
// Detailbericht-Übersicht zurück.
export const BEREICH_DETAIL = {
  // Vertrieb / Markt / Kunde
  VK: 'auftrag', VC: 'kunde', MKT: 'kunde', SVC: 'retoure', QM: 'retoure',
  // Finanzen / Liquidität / Treasury / Forecast
  RIS: 'rechnung', FIN: 'rechnung', FIBU: 'rechnung', FC: 'rechnung', GF: 'rechnung',
  LIQ: 'offeneposten', TRE: 'offeneposten', KON: 'leasing',
  // Supply Chain / Produktion / Beschaffung
  LOG: 'artikel', SCC: 'artikel', EK: 'bestellung', PR: 'charge', PP: 'produkt',
  // Kostenrechnung / Planung / F&E / ESG
  KLR: 'plausiwv', PLAN: 'auftragsbestand', FE: 'produkt', ESG: 'lieferant'
}
/** Passende, verfügbare Detailliste zu einem Fachbereich (oder null). */
export function detailFuerBereich(bereich) {
  const id = BEREICH_DETAIL[bereich]
  const l = id && LISTEN.find((x) => x.id === id && x.verfuegbar)
  return l ? { id: l.id, name: l.name } : null
}
