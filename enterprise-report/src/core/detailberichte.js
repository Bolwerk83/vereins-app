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
  ['AEW', 'Auftragseingang wirksam'], ['RET', 'Retoure'], ['AET', 'Auftragseingang tatsächlich'],
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
  { sku: '1650590001', artikel: 'E-Bike 22 Sneak Plus EQ MidStep Testbike (B-Ware) (all black / M)', status: 'Ausgelaufen intern', gruppe: 'E-Bikes', lbEff: 0, gesp: 0, kom: 0, res: 0, lbVerf: 0, ae: 1, aeb: 1, ab: 0, fc: 0, vk: 1176.47, uvp: 0, ek: 1378.24, einkaeufer: 'JANNE.DITTERS', aktiv: true },
  { sku: '232538401', artikel: 'Gravel 23 HOBO GRX 810 (pine green / S)', status: 'Ausgelaufen intern', gruppe: 'Fahrräder', lbEff: 2, gesp: 1, kom: 1, res: 0, lbVerf: 1, ae: 1, aeb: 1, ab: 0, fc: 0, vk: 1007.56, uvp: 0, ek: 777.47, einkaeufer: 'FELIX.METTERNICH', aktiv: true },
  { sku: '230543002', artikel: 'E-GRAVEL 21 BACKROAD+ GRX RX810 Di2 (matt-black / M)', status: 'Ausgelaufen intern', gruppe: 'E-Bikes', lbEff: 3, gesp: 0, kom: 3, res: 0, lbVerf: 25, ae: 0, aeb: 0, ab: 0, fc: 22, vk: 4200.84, uvp: 0, ek: 2454.48, einkaeufer: 'FELIX.METTERNICH', aktiv: true },
  { sku: '230591702', artikel: 'E-Bike 21 Backroad+ Flatbar E-Urban Herren (matt-black / M)', status: 'Ausgelaufen intern', gruppe: 'E-Bikes', lbEff: 5, gesp: 2, kom: 3, res: 0, lbVerf: 0, ae: 0, aeb: 0, ab: 0, fc: 0, vk: 3696.64, uvp: 0, ek: 1991.50, einkaeufer: 'FELIX.METTERNICH', aktiv: true },
  { sku: '231052006', artikel: 'RR 22 REVEAL SIX DISC Ultegra (Matt Carbon / 61cm)', status: 'Ausgelaufen intern', gruppe: 'Fahrräder', lbEff: 1, gesp: 0, kom: 1, res: 0, lbVerf: -1, ae: 0, aeb: 0, ab: 0, fc: 0, vk: 2940.34, uvp: 0, ek: 1561.24, einkaeufer: 'FELIX.METTERNICH', aktiv: true },
  { sku: '230467505', artikel: 'GRAVEL 21 BACKROAD GRX RX810 Di2 Limited 1X11 (midnight laser grey / 59cm)', status: 'Ausgelaufen intern', gruppe: 'Fahrräder', lbEff: 1, gesp: 0, kom: 1, res: 0, lbVerf: 1, ae: 0, aeb: 0, ab: 0, fc: 0, vk: 3528.57, uvp: 0, ek: 2056.28, einkaeufer: 'FELIX.METTERNICH', aktiv: true },
  { sku: '230762904', artikel: 'Fitness 21 Backroad Multicross GRX 810 (evil pepper green / 57cm)', status: 'Ausgelaufen intern', gruppe: 'Fahrräder', lbEff: 1, gesp: 0, kom: 1, res: 0, lbVerf: 1, ae: 0, aeb: 0, ab: 0, fc: 0, vk: 2015.97, uvp: 0, ek: 1594.42, einkaeufer: 'FELIX.METTERNICH', aktiv: true },
  { sku: '231047806', artikel: 'GRAVEL 22 BACKROAD AL GRX RX600 (roasted olive / 57cm)', status: 'Ausgelaufen intern', gruppe: 'Fahrräder', lbEff: 1, gesp: 0, kom: 1, res: 0, lbVerf: 1, ae: 0, aeb: 0, ab: 0, fc: 0, vk: 1679.83, uvp: 0, ek: 916.44, einkaeufer: 'FELIX.METTERNICH', aktiv: true },
  { sku: '230612603', artikel: 'HT 22, Bonero 1 (Sandy Taco / M)', status: 'Ausgelaufen intern', gruppe: 'Fahrräder', lbEff: 0, gesp: 0, kom: 0, res: 0, lbVerf: 0, ae: 1, aeb: 0, ab: 0, fc: 0, vk: 713.45, uvp: 0, ek: 749.68, einkaeufer: 'FELIX.METTERNICH', aktiv: true },
  { sku: '231058204', artikel: 'GRAVEL 22 BACKROAD Force eTap AXS 1X12 (blue haze / 55cm)', status: 'Ausgelaufen intern', gruppe: 'Fahrräder', lbEff: 0, gesp: 0, kom: 0, res: 0, lbVerf: 0, ae: 0, aeb: 0, ab: 0, fc: 0, vk: 0, uvp: 0, ek: 1757.95, einkaeufer: 'FELIX.METTERNICH', aktiv: true },
  { sku: '230599604', artikel: 'E-Bike 21 Xtra Watt Evo Plus 1 MidStep (matt silver-grey / 23")', status: 'Ausgelaufen intern', gruppe: 'E-Bikes', lbEff: 0, gesp: 0, kom: 0, res: 0, lbVerf: 0, ae: 0, aeb: 0, ab: 0, fc: 0, vk: 3696.64, uvp: 0, ek: 2044.37, einkaeufer: 'FELIX.METTERNICH', aktiv: false },
  { sku: '231051704', artikel: 'RR 22 REVEAL FOUR DISC Force eTap AXS (Shiny Aurora / 57cm)', status: 'Ausgelaufen intern', gruppe: 'Fahrräder', lbEff: 0, gesp: 0, kom: 0, res: 0, lbVerf: 0, ae: 0, aeb: 0, ab: 0, fc: 0, vk: 2772.27, uvp: 0, ek: 1839.95, einkaeufer: 'FELIX.METTERNICH', aktiv: true }
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
const maxSchwere = (befunde) => befunde.reduce((m, x) => (SCHWERE_RANG[x.schwere] > SCHWERE_RANG[m] ? x.schwere : m), null)

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
  { datum: '2026-05-17', kunde: 'Markus Birkner (1300256)', art: 'Auftrag', unterart: 'Bestellung', auftrag: '2654484814', status: 'Geliefert', waehrung: 'EUR', ab: 0, vk: 0, ae: 0, aeb: 0, ret: 1, aet: 0, mek: 0, abs: -1, ue: -117.61 },
  { datum: '2026-06-06', kunde: 'Markus Skarics (8758017)', art: 'Auftrag', unterart: 'Bestellung', auftrag: '2654583388', status: 'Geliefert', waehrung: 'EUR', ab: 0, vk: 118, ae: 118, aeb: 118, ret: 0, aet: 118, mek: -84, abs: 1, ue: 117.67 },
  { datum: '2026-06-04', kunde: 'Lena Vogt (4412009)', art: 'Auftrag', unterart: 'Bestellung', auftrag: '2654511990', status: 'Offen', waehrung: 'EUR', ab: 320, vk: 320, ae: 320, aeb: 320, ret: 0, aet: 0, mek: 140, abs: 0, ue: 0 },
  { datum: '2026-06-02', kunde: 'Onlineshop (Gast)', art: 'Auftrag', unterart: 'Sofortkauf', auftrag: '2654500771', status: 'Geliefert', waehrung: 'EUR', ab: 0, vk: 890, ae: 890, aeb: 890, ret: 0, aet: 890, mek: 410, abs: 1, ue: 890.0 }
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
  // Auftrag: Status-Zeitstrahl bis zum aktuellen Stand.
  let stufen = row.status === 'Offen' ? ['Angelegt', 'Bestätigt'] : ['Angelegt', 'Bestätigt', 'Kommissioniert', 'Geliefert']
  if (row.ret > 0 || row.ue < 0) stufen = [...stufen, 'Retoure']
  return { kind: 'timeline', punkte: stufen.map((s, i) => ({ label: s, datum: addTage(row.datum, i * 2), warn: s === 'Retoure' })) }
}

// ---- Plausi: Warenverbrauch ---------------------------------------------
// Bestandsgleichung: Anfangsbestand + Zugang − Abgang = Endbestand.
export const WARENVERBRAUCH = [
  { sku: '230543002', artikel: 'E-GRAVEL 21 BACKROAD+ GRX RX810 Di2', gruppe: 'E-Bikes', anfangsbestand: 10, zugang: 20, abgang: 25, endbestand: 5, verbrauch: 25, umsatzMenge: 25, einkaeufer: 'FELIX.METTERNICH' },
  { sku: '1650590001', artikel: 'Akku 625Wh', gruppe: 'Teile', anfangsbestand: 40, zugang: 30, abgang: 50, endbestand: 18, verbrauch: 50, umsatzMenge: 48, einkaeufer: 'JANNE.DITTERS' },
  { sku: '231047806', artikel: 'GRAVEL 22 BACKROAD AL GRX RX600', gruppe: 'Fahrräder', anfangsbestand: 60, zugang: 10, abgang: 70, endbestand: 0, verbrauch: 70, umsatzMenge: 0, einkaeufer: 'FELIX.METTERNICH' },
  { sku: '231058204', artikel: 'Zubehör-Set Gravel', gruppe: 'Zubehör', anfangsbestand: 100, zugang: 50, abgang: 40, endbestand: 110, verbrauch: 35, umsatzMenge: 40, einkaeufer: 'FELIX.METTERNICH' },
  { sku: '230591702', artikel: 'Bekleidung Jacke', gruppe: 'Bekleidung', anfangsbestand: 30, zugang: 0, abgang: -5, endbestand: 35, verbrauch: -5, umsatzMenge: 0, einkaeufer: 'JANNE.DITTERS' },
  { sku: '231052006', artikel: 'RR 22 REVEAL SIX DISC Ultegra', gruppe: 'Fahrräder', anfangsbestand: 8, zugang: 0, abgang: 9, endbestand: -1, verbrauch: 9, umsatzMenge: 9, einkaeufer: 'FELIX.METTERNICH' },
  { sku: '230762904', artikel: 'Fitness 21 Backroad Multicross', gruppe: 'Fahrräder', anfangsbestand: 12, zugang: 6, abgang: 8, endbestand: 10, verbrauch: 8, umsatzMenge: 8, einkaeufer: 'FELIX.METTERNICH' }
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
  { vorgang: 'LS-1001', kunde: 'Stadtwerke Köln', auftrag: '2654500001', angebot: { wert: 3200, datum: '2026-05-20' }, kundeL: { wert: 3200, datum: '2026-05-28' }, gesellschaft: { wert: 3200, datum: '2026-06-02' } },
  { vorgang: 'LS-1002', kunde: 'Lieferdienst Bonn', auftrag: '2654500002', angebot: { wert: 1850, datum: '2026-06-01' }, kundeL: { wert: 1850, datum: '2026-06-05' }, gesellschaft: null },
  { vorgang: 'LS-1003', kunde: 'Hotel Seeblick', auftrag: '2654500003', angebot: { wert: 990, datum: '2026-06-10' }, kundeL: null, gesellschaft: null },
  { vorgang: 'LS-1004', kunde: 'Logistik AG', auftrag: '2654500004', angebot: { wert: 4200, datum: '2026-05-15' }, kundeL: { wert: 4500, datum: '2026-05-22' }, gesellschaft: { wert: 4200, datum: '2026-05-30' } },
  { vorgang: 'LS-1005', kunde: 'Reha-Zentrum', auftrag: '2654500005', angebot: null, kundeL: null, gesellschaft: null }
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
  { retoure: 'RET-5001', datum: '2026-06-03', kunde: 'Markus Birkner', auftrag: '2654484814', artikel: 'GRAVEL 22 BACKROAD', menge: 1, wert: 117.61, originalWert: 117.61, grund: 'Nichtgefallen' },
  { retoure: 'RET-5002', datum: '2026-06-07', kunde: 'Lena Vogt', auftrag: '', artikel: 'Helm M', menge: 1, wert: 49.0, originalWert: 49.0, grund: '' },
  { retoure: 'RET-5003', datum: '2026-06-09', kunde: 'Onlineshop', auftrag: '2654500771', artikel: 'Jacke L', menge: 1, wert: 145.0, originalWert: 120.0, grund: 'Defekt' },
  { retoure: 'RET-5004', datum: '2026-06-10', kunde: 'B2B Händler', auftrag: '2654499002', artikel: 'Akku 625Wh', menge: 0, wert: 0, originalWert: 210.0, grund: 'Storno' }
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
  { rechnung: 'RE-9001', datum: '2026-06-05', kunde: 'Markus Skarics', auftrag: '2654583388', netto: 99.0, mwst: 18.81, brutto: 117.81, positionen: 1, bezahlt: true, status: 'Abgeschlossen' },
  { rechnung: 'RE-9002', datum: '2026-06-06', kunde: 'Stadtwerke Köln', auftrag: '2654500001', netto: 2689.08, mwst: 510.92, brutto: 3200.0, positionen: 3, bezahlt: false, status: 'Offen' },
  { rechnung: 'RE-9003', datum: '2026-06-07', kunde: 'Hotel Seeblick', auftrag: '2654500003', netto: 990.0, mwst: 158.40, brutto: 1100.0, positionen: 1, bezahlt: false, status: 'Abgeschlossen' },
  { rechnung: 'RE-9004', datum: '2026-06-08', kunde: 'Reha-Zentrum', auftrag: '2654500005', netto: 500.0, mwst: 95.0, brutto: 595.0, positionen: 0, bezahlt: true, status: 'Abgeschlossen' },
  { rechnung: 'RE-9005', datum: '2026-06-09', kunde: 'B2B Händler', auftrag: '2654499002', netto: -210.0, mwst: -39.90, brutto: -249.90, positionen: 1, bezahlt: true, status: 'Gutschrift' }
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
  { kundennr: '1300256', name: 'Markus Birkner', email: 'm.birkner@example.com', land: 'DE', umsatzJahr: 1240, offeneForderung: 0, kreditlimit: 2000, status: 'aktiv' },
  { kundennr: '8758017', name: 'Markus Skarics', email: 'skarics(at)example.com', land: 'AT', umsatzJahr: 8900, offeneForderung: 1200, kreditlimit: 5000, status: 'aktiv' },
  { kundennr: '4412009', name: 'Lena Vogt', email: 'l.vogt@example.com', land: 'DE', umsatzJahr: 0, offeneForderung: 0, kreditlimit: 1000, status: 'aktiv' },
  { kundennr: '2200111', name: 'Logistik AG', email: 'einkauf@logistik-ag.de', land: 'DE', umsatzJahr: 64000, offeneForderung: 9800, kreditlimit: 8000, status: 'aktiv' },
  { kundennr: '9900222', name: 'Alt-Konto', email: '', land: 'DE', umsatzJahr: 0, offeneForderung: 0, kreditlimit: 0, status: 'inaktiv' }
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
  { sku: '1453766', name: 'GRAVEL 22 BACKROAD', gruppe: 'Fahrrad', marke: 'Cube', ean: '4054571012345', status: 'aktiv', vkBrutto: 1499.0, steuersatz: 19, gewicht: 11.2 },
  { sku: '2087431', name: 'E-Bike Akku 625Wh', gruppe: 'Zubehör', marke: 'Bosch', ean: '', status: 'aktiv', vkBrutto: 749.0, steuersatz: 19, gewicht: 3.5 },
  { sku: '3312900', name: 'Trikot Pro M', gruppe: 'Bekleidung', marke: 'Castelli', ean: '8059654712345', status: 'auslauf', vkBrutto: 0, steuersatz: 19, gewicht: 0.2 },
  { sku: '4456712', name: 'Energieriegel Box', gruppe: 'Nahrung', marke: 'PowerBar', ean: '4017934112345', status: 'aktiv', vkBrutto: 24.9, steuersatz: 7, gewicht: 0.6 },
  { sku: '5590018', name: 'Vintage Rahmen XL', gruppe: 'Fahrrad', marke: 'Eigen', ean: '4054571099999', status: 'gesperrt', vkBrutto: 299.0, steuersatz: 19, gewicht: 0 }
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
  { rechnung: 'RE-9001', pos: 1, sku: '8758017', artikel: 'GIANT TCR', menge: 1, einzelpreis: 99.0, rabattPct: 0, netto: 99.0, mwst: 18.81 },
  { rechnung: 'RE-9002', pos: 1, sku: '1453766', artikel: 'GRAVEL 22', menge: 2, einzelpreis: 1259.66, rabattPct: 0, netto: 2519.32, mwst: 478.67 },
  { rechnung: 'RE-9002', pos: 2, sku: '4456712', artikel: 'Energieriegel', menge: 10, einzelpreis: 18.93, rabattPct: 10, netto: 200.0, mwst: 14.0 },
  { rechnung: 'RE-9003', pos: 1, sku: '3312900', artikel: 'Trikot Pro M', menge: 0, einzelpreis: 79.0, rabattPct: 0, netto: 0, mwst: 0 },
  { rechnung: 'RE-9005', pos: 1, sku: '2087431', artikel: 'Akku 625Wh', menge: 1, einzelpreis: 210.0, rabattPct: 60, netto: 84.0, mwst: 15.96 }
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
  { kanal: 'Onlineshop', bestellungen: 1284, umsatz: 312400, retourenQuote: 12.4, stornoQuote: 3.1, avgWarenkorb: 243.3 },
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
  { charge: 'CH-2026-014', sku: '4456712', artikel: 'Energieriegel Box', menge: 240, mhd: '2026-12-01', wareneingang: '2026-03-10', lieferant: 'PowerBar GmbH', gesperrt: false },
  { charge: 'CH-2026-009', sku: '4456712', artikel: 'Energieriegel Box', menge: 60, mhd: '2026-07-05', wareneingang: '2025-12-02', lieferant: 'PowerBar GmbH', gesperrt: false },
  { charge: 'CH-2025-221', sku: '4456712', artikel: 'Energieriegel Box', menge: 30, mhd: '2026-05-30', wareneingang: '2025-09-15', lieferant: 'PowerBar GmbH', gesperrt: false },
  { charge: 'CH-2026-031', sku: '2087431', artikel: 'E-Bike Akku 625Wh', menge: 0, mhd: '2028-01-01', wareneingang: '2026-04-01', lieferant: 'Bosch AG', gesperrt: false },
  { charge: 'CH-2026-040', sku: '2087431', artikel: 'E-Bike Akku 625Wh', menge: 12, mhd: '2027-06-01', wareneingang: '2026-05-20', lieferant: 'Bosch AG', gesperrt: true }
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
  { auftrag: '2654500001', kunde: 'Stadtwerke Köln', datum: '2026-05-28', sku: '1453766', artikel: 'GRAVEL 22', bestellt: 5, geliefert: 2, offen: 3, wert: 3779.0, liefertermin: '2026-07-10' },
  { auftrag: '2654500002', kunde: 'Lieferdienst Bonn', datum: '2026-06-05', sku: '2087431', artikel: 'Akku 625Wh', bestellt: 10, geliefert: 10, offen: 0, wert: 0, liefertermin: '2026-06-20' },
  { auftrag: '2654500771', kunde: 'Onlineshop', datum: '2026-05-30', sku: '4456712', artikel: 'Energieriegel', bestellt: 100, geliefert: 40, offen: 60, wert: 1494.0, liefertermin: '2026-06-10' },
  { auftrag: '2654499002', kunde: 'B2B Händler', datum: '2026-06-08', sku: '3312900', artikel: 'Trikot Pro M', bestellt: 20, geliefert: 25, offen: -5, wert: -395.0, liefertermin: '2026-07-01' },
  { auftrag: '2654500004', kunde: 'Logistik AG', datum: '2026-05-22', sku: '1453766', artikel: 'GRAVEL 22', bestellt: 8, geliefert: 3, offen: 4, wert: 5036.0, liefertermin: '2026-08-15' }
]
export function pruefeAuftragsbestand(a) {
  const b = []
  if (a.offen < 0) b.push({ feld: 'offen', schwere: 'fehler', text: 'Übermenge geliefert (offen < 0)' })
  else if (a.offen !== a.bestellt - a.geliefert) b.push({ feld: 'offen', schwere: 'fehler', text: `Offene Menge inkonsistent (Soll ${a.bestellt - a.geliefert})` })
  if (a.offen > 0 && tageBis(a.liefertermin) < 0) b.push({ feld: 'liefertermin', schwere: 'warnung', text: `Liefertermin überschritten (${-tageBis(a.liefertermin)} Tage)` })
  return b
}
export function auftragsbestandliste(o = {}) { return generischListe(AUFTRAGSBESTAND, pruefeAuftragsbestand, o, ['bestellt', 'geliefert', 'offen', 'wert'], (a, q) => norm(a.auftrag).includes(q) || norm(a.kunde).includes(q) || norm(a.artikel).includes(q)) }

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
  { id: 'rechnung', name: 'Rechnungsliste', verfuegbar: true },
  { id: 'rechnungpos', name: 'Rechnungspositionsliste', verfuegbar: true },
  { id: 'bestellkanal', name: 'Bestellkanalliste', verfuegbar: true },
  { id: 'leasing', name: 'Leasingliste', verfuegbar: true },
  { id: 'charge', name: 'Chargenliste', verfuegbar: true },
  { id: 'kunde', name: 'Kundenliste', verfuegbar: true },
  { id: 'plausiwv', name: 'Plausi: Warenverbrauch', verfuegbar: true },
  { id: 'retoure', name: 'Retourenliste', verfuegbar: true },
  { id: 'auftragsbestand', name: 'Auftragsbestandsliste', verfuegbar: true }
]

// Drill-Down E3 → E4: welcher Fachbereich (E2-Code) führt in welche Detailliste?
export const BEREICH_DETAIL = {
  VK: 'auftrag', VC: 'kunde', MKT: 'kunde', SVC: 'retoure',
  RIS: 'rechnung', FIN: 'rechnung', FIBU: 'rechnung', KON: 'leasing',
  LOG: 'artikel', SCC: 'artikel', EK: 'artikel', KLR: 'plausiwv'
}
/** Passende, verfügbare Detailliste zu einem Fachbereich (oder null). */
export function detailFuerBereich(bereich) {
  const id = BEREICH_DETAIL[bereich]
  const l = id && LISTEN.find((x) => x.id === id && x.verfuegbar)
  return l ? { id: l.id, name: l.name } : null
}
