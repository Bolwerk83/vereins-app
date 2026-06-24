// =========================================================================
//  DECKUNGSBEITRAGSRECHNUNG (Teilkostenrechnung).
//
//   Einstufig (Direct Costing):  DB = Umsatz − variable Kosten
//   Mehrstufig (stufenweise Fixkostendeckung):
//     Umsatz − variable Kosten        = DB I   (je Produkt)
//     − Produktfixkosten              = DB II  (je Produkt)
//     Σ DB II − Bereichsfixkosten     = DB III (je Bereich/Produktgruppe)
//     Σ DB III − Unternehmensfixkosten = Betriebsergebnis
//
//  Plus Typologie der Kostenrechnungssysteme (Voll-/Teilkosten) als Kontext.
// =========================================================================

// Normierung auf operative Unternehmensgröße (~52 Mio € Umsatz), damit die
// Summen berichtsübergreifend stimmig sind. DB-Quoten bleiben unverändert.
const SKALA = 52 / 57.9
const sM = (x) => Math.round(x * SKALA * 10) / 10

export const BEREICHE = [
  { id: 'raeder',    name: 'Räder',            bereichsfix: sM(1.5) },
  { id: 'teile_zub', name: 'Teile & Zubehör',  bereichsfix: sM(0.8) },
  { id: 'bekleidung', name: 'Bekleidung',      bereichsfix: sM(0.4) }
]
export const UNTERNEHMENSFIX = sM(6.0)

// Produkte (Mio €): Umsatz, variable Kosten, Produktfixkosten.
export const PRODUKTE = [
  { id: 'ebike', name: 'E-Bikes',       bereich: 'raeder',     umsatz: 30.1, varKosten: 19.0, produktfix: 2.5 },
  { id: 'city',  name: 'City/Trekking', bereich: 'raeder',     umsatz: 9.6,  varKosten: 6.3,  produktfix: 1.2 },
  { id: 'teile', name: 'Teile',         bereich: 'teile_zub',  umsatz: 8.8,  varKosten: 5.4,  produktfix: 0.9 },
  { id: 'zubehoer', name: 'Zubehör',    bereich: 'teile_zub',  umsatz: 5.7,  varKosten: 3.2,  produktfix: 0.5 },
  { id: 'bekleidung', name: 'Bekleidung', bereich: 'bekleidung', umsatz: 3.7, varKosten: 2.5, produktfix: 0.6 }
].map((p) => ({ ...p, umsatz: sM(p.umsatz), varKosten: sM(p.varKosten), produktfix: sM(p.produktfix) }))

const r2 = (x) => Math.round(x * 100) / 100
const pct = (z, n) => (n ? r2(z / n * 100) : 0)

/** Einstufige DB-Rechnung je Produkt (Direct Costing). faktor = Profit-Center-
 *  Anteil (skaliert absolute Werte; DB-Quoten bleiben unverändert). */
export function direktCosting(produkte = PRODUKTE, faktor = 1) {
  const rows = produkte.map((p) => {
    const umsatz = r2(p.umsatz * faktor), varKosten = r2(p.varKosten * faktor)
    const db1 = r2(umsatz - varKosten)
    return { ...p, umsatz, varKosten, db1, db1Quote: pct(db1, umsatz) }
  })
  const umsatz = r2(rows.reduce((n, p) => n + p.umsatz, 0))
  const db1 = r2(rows.reduce((n, p) => n + p.db1, 0))
  return { rows, umsatz, db1, db1Quote: pct(db1, umsatz) }
}

// =========================================================================
//  FAIRE DB / SONDERFÄLLE — Sponsoring (100 %), Aktionen (≥50 %), Muster/
//  Garantie, Personal/IC verzerren den Durchschnitts-DB: voller Wareneinsatz
//  (COGS), aber kein/wenig Erlös -> negativer DB. Fürs Pricing braucht es
//  einen BEREINIGTEN DB (Kerngeschäft), ohne dass die Sonderfälle versteckt
//  werden -> dafür die "Brücke" (Effekt je Typ) und ein Ausgeblendet-Hinweis.
//
//  Die Sonderfälle sind eine TEILMENGE der Gesamttotale (PRODUKTE), daher
//  bleibt der Brutto-DB exakt wie bisher; bereinigt = brutto − ausgeschlossen.
// =========================================================================
export const KONDITIONSARTEN = [
  { id: 'sponsoring', name: 'Sponsoring (100 %)', kurz: 'Sponsoring', hinweis: 'Kostenlose Abgabe an Sponsoring-/Teampartner — voller Wareneinsatz, kein Erlös.' },
  { id: 'aktion', name: 'Aktion/Rabatt (≥50 %)', kurz: 'Aktion', hinweis: 'Stark rabattierte Sonderkonditionen (Abverkauf, Messe-Deals).' },
  { id: 'muster', name: 'Muster/Freiware & Garantie', kurz: 'Muster/Garantie', hinweis: 'Muster, Vorführräder, Garantie/Kulanz — voller Wareneinsatz, kaum Erlös.' },
  { id: 'personal', name: 'Personalkauf & Intern/IC', kurz: 'Personal/IC', hinweis: 'Mitarbeiterkäufe und konzerninterne Lieferungen (nahe Selbstkosten).' },
]

// Sonderfälle als Teilmenge der Totale (Mio €): umsatz = tatsächlicher Erlös,
// varKosten = voller Wareneinsatz, listenumsatz = Wert zu Listenpreis, belege = Anzahl.
export const SONDERFAELLE = [
  { typ: 'sponsoring', name: 'Race-Team & Vereins-Sponsoring', umsatz: sM(0.0), varKosten: sM(0.45), listenumsatz: sM(0.6), belege: 180, bereich: 'raeder' },
  { typ: 'aktion', name: 'Saison-/Abverkaufsaktionen ≥50 %', umsatz: sM(1.0), varKosten: sM(1.2), listenumsatz: sM(2.1), belege: 640, bereich: 'raeder' },
  { typ: 'muster', name: 'Muster, Vorführräder, Garantie/Kulanz', umsatz: sM(0.1), varKosten: sM(0.6), listenumsatz: sM(0.8), belege: 320, bereich: 'teile_zub' },
  { typ: 'personal', name: 'Personalkauf & Intercompany', umsatz: sM(1.5), varKosten: sM(1.4), listenumsatz: sM(1.9), belege: 410, bereich: 'raeder' },
]

/**
 * DB-Sichten für faire Margen:
 *   brutto     – alles inkl. Sonderfälle (ökonomische Wahrheit, unverändert)
 *   bereinigt  – ohne die ausgeschlossenen Konditionsarten (Pricing-Basis)
 *   bruecke    – Effekt je Sonderfall-Typ (Transparenz statt Verstecken)
 * @param {string[]} ausgeschlossen  Typen, die rausgerechnet werden
 * @param {number}   faktor          Profit-Center-Anteil
 * @param {boolean}  reklassSponsoring  Sponsoring-Wareneinsatz ins Marketing umbuchen
 */
export function dbSichten(ausgeschlossen = [], faktor = 1, reklassSponsoring = false) {
  const dc = direktCosting(undefined, faktor)
  const brutto = { umsatz: dc.umsatz, varKosten: r2(dc.umsatz - dc.db1), db: dc.db1, dbQuote: dc.db1Quote }
  const aus = new Set(reklassSponsoring ? [...ausgeschlossen, 'sponsoring'] : ausgeschlossen)
  const skaliert = SONDERFAELLE.map((s) => {
    const umsatz = r2(s.umsatz * faktor), varKosten = r2(s.varKosten * faktor)
    return { ...s, umsatz, varKosten, listenumsatz: r2(s.listenumsatz * faktor), db: r2(umsatz - varKosten), dbQuote: pct(r2(umsatz - varKosten), umsatz) }
  })
  const bruecke = skaliert.map((s) => ({ ...s, ausgeschlossen: aus.has(s.typ), umgebucht: reklassSponsoring && s.typ === 'sponsoring' }))
  const entfernt = skaliert.filter((s) => aus.has(s.typ))
  const sumU = r2(entfernt.reduce((n, s) => n + s.umsatz, 0))
  const sumK = r2(entfernt.reduce((n, s) => n + s.varKosten, 0))
  const bUmsatz = r2(brutto.umsatz - sumU), bVar = r2(brutto.varKosten - sumK), bDB = r2(bUmsatz - bVar)
  const bereinigt = { umsatz: bUmsatz, varKosten: bVar, db: bDB, dbQuote: pct(bDB, bUmsatz) }
  return {
    brutto, bereinigt, bruecke,
    effekt: r2(bereinigt.db - brutto.db),            // +€ DB durch Bereinigung
    quoteEffekt: r2(bereinigt.dbQuote - brutto.dbQuote),
    ausgeblendet: { umsatz: sumU, varKosten: sumK, db: r2(entfernt.reduce((n, s) => n + s.db, 0)), belege: entfernt.reduce((n, s) => n + s.belege, 0) },
    marketingUmbuchung: reklassSponsoring ? r2((skaliert.find((s) => s.typ === 'sponsoring')?.varKosten) || 0) : 0,
  }
}

/** Mehrstufige DB-Rechnung (stufenweise Fixkostendeckung). */
export function stufenweise(produkte = PRODUKTE, bereiche = BEREICHE, unternehmensfix = UNTERNEHMENSFIX, faktor = 1) {
  const prod = produkte.map((p) => {
    const umsatz = r2(p.umsatz * faktor), varKosten = r2(p.varKosten * faktor), produktfix = r2(p.produktfix * faktor)
    const db1 = r2(umsatz - varKosten)
    const db2 = r2(db1 - produktfix)
    return { ...p, umsatz, varKosten, produktfix, db1, db2 }
  })
  const bereicheErg = bereiche.map((b) => {
    const ps = prod.filter((p) => p.bereich === b.id)
    const summeDB2 = r2(ps.reduce((n, p) => n + p.db2, 0))
    const db3 = r2(summeDB2 - r2(b.bereichsfix * faktor))
    return { ...b, bereichsfix: r2(b.bereichsfix * faktor), produkte: ps, summeDB2, db3 }
  })
  const summeDB3 = r2(bereicheErg.reduce((n, b) => n + b.db3, 0))
  const ufix = r2(unternehmensfix * faktor)
  const betriebsergebnis = r2(summeDB3 - ufix)
  const umsatz = r2(prod.reduce((n, p) => n + p.umsatz, 0))
  return { bereiche: bereicheErg, summeDB3, unternehmensfix: ufix, betriebsergebnis, umsatz }
}

// Typologie der Kostenrechnungssysteme (Abb. 2.12) — für Kontext/Lernen.
export const SYSTEME = {
  vollkosten: {
    name: 'Vollkostenbasis', laie: 'Alle Kosten (auch fixe) werden auf die Produkte verrechnet.',
    arten: ['Istkostenrechnung (Grundform, feste Verrechnungspreise, Istwerte)', 'Normalkostenrechnung (starr/flexibel → Standard-, Budgetkosten)', 'Plankostenrechnung (starr/flexibel)']
  },
  teilkosten: {
    name: 'Teilkostenbasis', laie: 'Nur variable Kosten werden zugerechnet; Fixkosten werden als Block gedeckt.',
    arten: ['Direct Costing (einstufige DB-Rechnung)', 'Relative Einzelkosten (Riebel)', 'Grenzplankostenrechnung', 'Stufenweise Fixkostendeckung (mehrstufige DB-Rechnung)']
  }
}
