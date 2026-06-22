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

// ---- Katalog der Detailberichte -----------------------------------------
export const LISTEN = [
  { id: 'auftrag', name: 'Auftragsliste', verfuegbar: true },
  { id: 'artikel', name: 'Artikelliste', verfuegbar: true },
  { id: 'produkt', name: 'Produktliste', verfuegbar: false },
  { id: 'rechnung', name: 'Rechnungsliste', verfuegbar: false },
  { id: 'rechnungpos', name: 'Rechnungspositionsliste', verfuegbar: false },
  { id: 'bestellkanal', name: 'Bestellkanalliste', verfuegbar: false },
  { id: 'leasing', name: 'Leasingliste', verfuegbar: false },
  { id: 'charge', name: 'Chargenliste', verfuegbar: false },
  { id: 'kunde', name: 'Kundenliste', verfuegbar: false },
  { id: 'plausiwv', name: 'Plausi: Warenverbrauch', verfuegbar: false },
  { id: 'retoure', name: 'Retourenliste', verfuegbar: false },
  { id: 'auftragsbestand', name: 'Auftragsbestandsliste', verfuegbar: false }
]
