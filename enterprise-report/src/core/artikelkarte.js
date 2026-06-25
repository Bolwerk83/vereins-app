// =========================================================================
//  ARTIKEL-JOURNEY (Datenmodul) — bündelt ALLES, was wir über einen Artikel
//  wissen, in einer „Artikelkarte" (Mini-ERP): Stammdaten + Bild, Preis-,
//  Absatz-, Lager-, Plan-Entwicklung, Bestellungen, Produktion, Stückliste,
//  Marketing/Aktionen, Bewertungen, Probefahrten, Kaufquote, Lieferzeit,
//  Verkaufsorte/Kanäle, Sponsoring-/Leasing-Anteil, Folgeartikel, Lebenszyklus
//  — plus eine Journey-Timeline (roter Faden) der wichtigsten Ereignisse.
//
//  Verankert an den realen artikelscharfen Perspektiven aus mock.js; die
//  Zeitreihen und Zusatzdimensionen sind deterministisch (seedbar je Artikel)
//  erzeugt, damit die Karte reproduzierbar und summenkonsistent ist.
// =========================================================================

const MON = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

// Deterministischer PRNG (mulberry32) je Artikel — reproduzierbar, kein Math.random.
function prng(seed) {
  let s = seed >>> 0
  return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }

// --- Kuratierter Artikel-Katalog (verankert an den mock.js-Perspektiven) ---
// kennzahlen: Jahreswerte (umsatz €, menge Stk, db %, einstand €, bestand Stk,
//   reichweiteTage, ausschuss %, linie). lebenszyklus: phase + Markteintritt.
export const KATALOG = [
  {
    nr: '10042', name: 'E-Bike Urban 500', gruppe: 'E-Bikes', marke: 'VeloWerk', bild: null, eBike: true,
    einfuehrung: '2022-03', lebenszyklus: 'Wachstum', nachfolgerNr: null, ersatzNr: '10088',
    listenpreis: 2699, kennzahlen: { umsatz: 3348000, menge: 1240, db: 38, einstand: 1180, bestand: 310, reichweiteTage: 42, ausschuss: 2.1, linie: 'Endmontage E-Bike' },
    kanaele: [['Onlineshop', 54], ['Filiale Köln', 19], ['Filiale München', 15], ['B2B/Leasing', 12]],
    sponsoringAnteil: 3, leasingAnteil: 22, lieferzeitTage: 21,
    bewertung: { schnitt: 4.5, anzahl: 312, sterne: [4, 6, 18, 96, 188] }, probefahrten: 540, kaufquoteProbefahrt: 31,
    shopAufrufe: 184000, kaufquoteShop: 2.6,
  },
  {
    nr: '10088', name: 'E-MTB Trail Pro', gruppe: 'E-Bikes', marke: 'VeloWerk', bild: null, eBike: true,
    einfuehrung: '2023-02', lebenszyklus: 'Wachstum', nachfolgerNr: null, ersatzNr: '10042',
    listenpreis: 4399, kennzahlen: { umsatz: 2992000, menge: 680, db: 41, einstand: 1840, bestand: 140, reichweiteTage: 28, ausschuss: 2.6, linie: 'Endmontage E-Bike' },
    kanaele: [['Onlineshop', 48], ['Filiale München', 24], ['Filiale Köln', 16], ['B2B/Leasing', 12]],
    sponsoringAnteil: 6, leasingAnteil: 18, lieferzeitTage: 28,
    bewertung: { schnitt: 4.7, anzahl: 204, sterne: [2, 3, 9, 52, 138] }, probefahrten: 410, kaufquoteProbefahrt: 38,
    shopAufrufe: 132000, kaufquoteShop: 2.1,
  },
  {
    nr: '20155', name: 'Trekking City 7', gruppe: 'City/Trekking', marke: 'VeloWerk', bild: null, eBike: false,
    einfuehrung: '2019-04', lebenszyklus: 'Reife', nachfolgerNr: '20180', ersatzNr: null,
    listenpreis: 1599, kennzahlen: { umsatz: 1456000, menge: 910, db: 34, einstand: 720, bestand: 280, reichweiteTage: 58, ausschuss: 1.7, linie: 'Endmontage City' },
    kanaele: [['Filiale Köln', 34], ['Onlineshop', 31], ['Filiale München', 23], ['B2B/Leasing', 12]],
    sponsoringAnteil: 2, leasingAnteil: 9, lieferzeitTage: 18,
    bewertung: { schnitt: 4.2, anzahl: 167, sterne: [4, 9, 22, 68, 64] }, probefahrten: 220, kaufquoteProbefahrt: 27,
    shopAufrufe: 96000, kaufquoteShop: 1.9,
  },
  {
    nr: '40310', name: 'Helm Air Pro', gruppe: 'Zubehör', marke: 'VeloWerk', bild: null, eBike: false,
    einfuehrung: '2021-09', lebenszyklus: 'Reife', nachfolgerNr: null, ersatzNr: null,
    listenpreis: 129, kennzahlen: { umsatz: 312000, menge: 3120, db: 52, einstand: 48, bestand: 1800, reichweiteTage: 64, ausschuss: 0.4, linie: '—' },
    kanaele: [['Onlineshop', 62], ['Filiale Köln', 16], ['Filiale München', 14], ['B2B/Leasing', 8]],
    sponsoringAnteil: 1, leasingAnteil: 0, lieferzeitTage: 12,
    bewertung: { schnitt: 4.4, anzahl: 421, sterne: [6, 12, 38, 142, 223] }, probefahrten: 0, kaufquoteProbefahrt: 0,
    shopAufrufe: 240000, kaufquoteShop: 3.1,
  },
  {
    nr: '20180', name: 'Trekking City 8 (Nachfolger)', gruppe: 'City/Trekking', marke: 'VeloWerk', bild: null, eBike: false,
    einfuehrung: '2025-03', lebenszyklus: 'Einführung', nachfolgerNr: null, ersatzNr: '20155',
    listenpreis: 1799, kennzahlen: { umsatz: 410000, menge: 240, db: 36, einstand: 760, bestand: 95, reichweiteTage: 31, ausschuss: 1.9, linie: 'Endmontage City' },
    kanaele: [['Onlineshop', 44], ['Filiale Köln', 28], ['Filiale München', 20], ['B2B/Leasing', 8]],
    sponsoringAnteil: 4, leasingAnteil: 12, lieferzeitTage: 24,
    bewertung: { schnitt: 4.6, anzahl: 38, sterne: [0, 1, 3, 11, 23] }, probefahrten: 86, kaufquoteProbefahrt: 34,
    shopAufrufe: 41000, kaufquoteShop: 2.3,
  },
]

export const katalog = () => KATALOG.map((a) => ({ nr: a.nr, name: a.name, gruppe: a.gruppe, lebenszyklus: a.lebenszyklus, eBike: a.eBike }))
export const artikelStamm = (nr) => KATALOG.find((a) => a.nr === nr) || null

// Summenerhaltende Monatsverteilung eines Jahreswerts mit Saisonkurve + Rauschen.
function monatsreihe(jahr, seed, saison) {
  const r = prng(seed)
  const roh = saison.map((s) => s * (0.9 + r() * 0.2))
  const summe = roh.reduce((a, b) => a + b, 0)
  const skal = roh.map((x) => (x / summe) * jahr)
  // kaufmännisch runden, Rest auf den größten Monat (summenerhaltend)
  const ger = skal.map((x) => Math.round(x))
  const diff = Math.round(jahr) - ger.reduce((a, b) => a + b, 0)
  if (diff !== 0) { const i = skal.indexOf(Math.max(...skal)); ger[i] += diff }
  return ger
}
// Fahrrad-Saison: Frühjahr/Sommer stark, Winter schwach.
const SAISON_RAD = [0.5, 0.6, 0.95, 1.25, 1.4, 1.3, 1.1, 1.0, 1.05, 0.9, 0.7, 0.6]
const SAISON_FLACH = Array(12).fill(1)

/** Preisentwicklung (Listenpreis je Monat) — leichte Anhebungen + Aktionssenkungen. */
function preisentwicklung(a) {
  const r = prng(hash(a.nr) ^ 0x9e3779b9)
  const start = Math.round(a.listenpreis * 0.94)
  let p = start
  return MON.map((m, i) => {
    if (i === 3) p = Math.round(p * 1.03)            // Frühjahrs-Anhebung
    if (i === 6) p = Math.round(p * (0.92 + r() * 0.03)) // Sommer-Aktion (Rabatt)
    if (i === 9) p = a.listenpreis                    // Rückkehr Listenpreis
    return { monat: m, preis: p }
  })
}

/** Lagerentwicklung (Monatsendbestand) — startet beim aktuellen Bestand, Zu-/Abgänge. */
function lagerentwicklung(a, absatz) {
  const r = prng(hash(a.nr) ^ 0x51ed270b)
  let b = Math.round(a.kennzahlen.bestand * 1.15)
  return MON.map((m, i) => {
    const zugang = Math.round(absatz[i] * (0.85 + r() * 0.4)) // Nachschub ~ Absatz
    b = Math.max(0, b + zugang - absatz[i])
    return { monat: m, bestand: b }
  })
}

/**
 * Vollständige Artikelkarte / Journey für eine Artikel-Nr.
 * @returns null, wenn unbekannt.
 */
export function artikelKarte(nr) {
  const a = artikelStamm(nr)
  if (!a) return null
  const k = a.kennzahlen
  const saison = a.gruppe === 'Zubehör' ? SAISON_FLACH : SAISON_RAD
  const absatz = monatsreihe(k.menge, hash(a.nr), saison)
  const umsatz = monatsreihe(k.umsatz, hash(a.nr) ^ 0xabcd, saison)
  const preis = preisentwicklung(a)
  const lager = lagerentwicklung(a, absatz)
  // Plan vs. Ist: Plan = +6 % Wachstumsziel auf den Absatz, geglättet.
  const plan = absatz.map((x) => Math.round(x * 1.06))
  const planErfuellung = Math.round((k.menge / plan.reduce((s, x) => s + x, 0)) * 100)

  const dbAbsolut = Math.round(k.umsatz * k.db / 100)
  const stueckUmsatz = Math.round(k.umsatz / Math.max(1, k.menge))
  const marge = stueckUmsatz - k.einstand

  return {
    stamm: a,
    kpis: {
      umsatz: k.umsatz, menge: k.menge, dbProzent: k.db, dbAbsolut,
      stueckUmsatz, einstand: k.einstand, margeStueck: marge,
      bestand: k.bestand, reichweiteTage: k.reichweiteTage, ausschuss: k.ausschuss,
      planErfuellung, bewertung: a.bewertung.schnitt, lieferzeitTage: a.lieferzeitTage,
    },
    preisentwicklung: preis,
    absatz: MON.map((m, i) => ({ monat: m, menge: absatz[i], umsatz: umsatz[i], plan: plan[i] })),
    lagerentwicklung: lager,
    produktion: { menge: k.menge, ausschuss: k.ausschuss, linie: k.linie, gutmenge: Math.round(k.menge * (1 - k.ausschuss / 100)) },
    marketing: marketing(a),
    bewertungen: a.bewertung,
    kunden: { probefahrten: a.probefahrten, kaufquoteProbefahrt: a.kaufquoteProbefahrt, shopAufrufe: a.shopAufrufe, kaufquoteShop: a.kaufquoteShop },
    verkaufsorte: a.kanaele.map(([ort, anteil]) => ({ ort, anteil, umsatz: Math.round(k.umsatz * anteil / 100) })),
    geschaeftsarten: { sponsoring: a.sponsoringAnteil, leasing: a.leasingAnteil, normal: 100 - a.sponsoringAnteil - a.leasingAnteil },
    folgeartikel: { nachfolger: a.nachfolgerNr ? artikelStamm(a.nachfolgerNr) : null, ersatz: a.ersatzNr ? artikelStamm(a.ersatzNr) : null },
    journey: journey(a, { preis, absatz, planErfuellung }),
  }
}

// Marketing-Beitrag des Artikels (anteilig aus der Kampagnen-Mechanik).
function marketing(a) {
  const r = prng(hash(a.nr) ^ 0x1234567)
  const aktionen = [
    { name: 'Frühjahrs-Kampagne E-Bike', monat: 'Mär', kanal: 'Search', spend: Math.round(a.kennzahlen.umsatz * 0.012), roas: a.eBike ? 5.5 : 3.4 },
    { name: 'Sommer-Aktion (Rabatt)', monat: 'Jul', kanal: 'Display/Retargeting', spend: Math.round(a.kennzahlen.umsatz * 0.008), roas: 6.5 },
  ]
  if (a.eBike) aktionen.push({ name: 'Probefahrt-Wochen', monat: 'Mai', kanal: 'Filiale/Lokal', spend: Math.round(a.kennzahlen.umsatz * 0.006), roas: 4.2 })
  return aktionen.map((x) => ({ ...x, mehrumsatz: Math.round(x.spend * x.roas) }))
}

// Journey-Timeline (roter Faden): chronologische Schlüsselereignisse.
function journey(a, { preis, planErfuellung }) {
  const ev = []
  ev.push({ datum: a.einfuehrung, typ: 'start', titel: 'Markteinführung', text: `${a.name} eingeführt (${a.lebenszyklus}).` })
  ev.push({ datum: '2025-03', typ: 'marketing', titel: 'Frühjahrs-Kampagne', text: 'Search-Kampagne gestartet; Absatzschub im Q2.' })
  const aktion = preis.find((p, i) => i > 0 && p.preis < preis[i - 1].preis)
  if (aktion) ev.push({ datum: '2025-07', typ: 'preis', titel: 'Sommer-Aktion', text: `Aktionspreis ${aktion.preis} € — Abverkauf/Lagerabbau.` })
  ev.push({ datum: '2025-09', typ: 'preis', titel: 'Rückkehr Listenpreis', text: `Preis zurück auf Listenpreis ${a.listenpreis} €.` })
  if (planErfuellung < 100) ev.push({ datum: '2025-10', typ: 'warnung', titel: 'Planabweichung', text: `Absatz ${planErfuellung}% des Plans — Nachfrage/Verfügbarkeit prüfen.` })
  if (a.nachfolgerNr) ev.push({ datum: '2025-03', typ: 'nachfolger', titel: 'Nachfolger gestartet', text: `Nachfolgeartikel ${a.nachfolgerNr} eingeführt — Auslauf planen.` })
  if (a.lebenszyklus === 'Einführung') ev.push({ datum: a.einfuehrung, typ: 'start', titel: 'Hochlauf', text: 'Frühe Phase — Bewertungen/Probefahrten als Frühindikator beobachten.' })
  return ev.sort((x, y) => (x.datum < y.datum ? -1 : x.datum > y.datum ? 1 : 0))
}
