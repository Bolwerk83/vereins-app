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

export const BEREICHE = [
  { id: 'raeder',    name: 'Räder',            bereichsfix: 1.5 },
  { id: 'teile_zub', name: 'Teile & Zubehör',  bereichsfix: 0.8 },
  { id: 'bekleidung', name: 'Bekleidung',      bereichsfix: 0.4 }
]
export const UNTERNEHMENSFIX = 6.0

// Produkte (Mio €): Umsatz, variable Kosten, Produktfixkosten.
export const PRODUKTE = [
  { id: 'ebike', name: 'E-Bikes',       bereich: 'raeder',     umsatz: 30.1, varKosten: 19.0, produktfix: 2.5 },
  { id: 'city',  name: 'City/Trekking', bereich: 'raeder',     umsatz: 9.6,  varKosten: 6.3,  produktfix: 1.2 },
  { id: 'teile', name: 'Teile',         bereich: 'teile_zub',  umsatz: 8.8,  varKosten: 5.4,  produktfix: 0.9 },
  { id: 'zubehoer', name: 'Zubehör',    bereich: 'teile_zub',  umsatz: 5.7,  varKosten: 3.2,  produktfix: 0.5 },
  { id: 'bekleidung', name: 'Bekleidung', bereich: 'bekleidung', umsatz: 3.7, varKosten: 2.5, produktfix: 0.6 }
]

const r2 = (x) => Math.round(x * 100) / 100
const pct = (z, n) => (n ? r2(z / n * 100) : 0)

/** Einstufige DB-Rechnung je Produkt (Direct Costing). */
export function direktCosting(produkte = PRODUKTE) {
  const rows = produkte.map((p) => {
    const db1 = r2(p.umsatz - p.varKosten)
    return { ...p, db1, db1Quote: pct(db1, p.umsatz) }
  })
  const umsatz = r2(rows.reduce((n, p) => n + p.umsatz, 0))
  const db1 = r2(rows.reduce((n, p) => n + p.db1, 0))
  return { rows, umsatz, db1, db1Quote: pct(db1, umsatz) }
}

/** Mehrstufige DB-Rechnung (stufenweise Fixkostendeckung). */
export function stufenweise(produkte = PRODUKTE, bereiche = BEREICHE, unternehmensfix = UNTERNEHMENSFIX) {
  const prod = produkte.map((p) => {
    const db1 = r2(p.umsatz - p.varKosten)
    const db2 = r2(db1 - p.produktfix)
    return { ...p, db1, db2 }
  })
  const bereicheErg = bereiche.map((b) => {
    const ps = prod.filter((p) => p.bereich === b.id)
    const summeDB2 = r2(ps.reduce((n, p) => n + p.db2, 0))
    const db3 = r2(summeDB2 - b.bereichsfix)
    return { ...b, produkte: ps, summeDB2, db3 }
  })
  const summeDB3 = r2(bereicheErg.reduce((n, b) => n + b.db3, 0))
  const betriebsergebnis = r2(summeDB3 - unternehmensfix)
  const umsatz = r2(prod.reduce((n, p) => n + p.umsatz, 0))
  return { bereiche: bereicheErg, summeDB3, unternehmensfix, betriebsergebnis, umsatz }
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
