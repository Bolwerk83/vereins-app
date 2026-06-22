// =========================================================================
//  VERSAND-COCKPIT — Versanderlöse (vom Kunden berechnet) gegen die
//  TATSÄCHLICHEN Versandkosten (Carrier). Zeigt Über-/Unterdeckung je
//  Gewichtsklasse, Carrier und Region sowie die Retouren-Versandkosten.
//
//  Kernbefund (Demo): Pakete (Teile/Zubehör) sind leicht überdeckt, der
//  Gratis-Bike-Versand und Gratis-Retouren reißen die Deckung tief ins Minus.
//  Beträge in €.
// =========================================================================

// Sendungssegmente: typ (Versand/Retoure), Carrier, Gewichtsklasse, Region,
// Anzahl, Erlös/Sendung (Kunde zahlt), Kosten/Sendung (wir zahlen).
const SEGMENTE = [
  { typ: 'Versand', carrier: 'DHL', klasse: 'Paket S', region: 'DE', anzahl: 42000, erloesProSdg: 3.95, kostenProSdg: 3.20 },
  { typ: 'Versand', carrier: 'DHL', klasse: 'Paket M', region: 'DE', anzahl: 26000, erloesProSdg: 4.95, kostenProSdg: 4.55 },
  { typ: 'Versand', carrier: 'DPD', klasse: 'Paket M', region: 'DE', anzahl: 14000, erloesProSdg: 4.95, kostenProSdg: 4.25 },
  { typ: 'Versand', carrier: 'GLS', klasse: 'Paket L', region: 'DE', anzahl: 9000, erloesProSdg: 6.95, kostenProSdg: 7.80 },
  { typ: 'Versand', carrier: 'DHL', klasse: 'Paket M', region: 'AT', anzahl: 5200, erloesProSdg: 7.90, kostenProSdg: 8.60 },
  { typ: 'Versand', carrier: 'UPS', klasse: 'Paket M', region: 'EU', anzahl: 6500, erloesProSdg: 9.90, kostenProSdg: 11.40 },
  { typ: 'Versand', carrier: 'UPS', klasse: 'Paket S', region: 'CH', anzahl: 3000, erloesProSdg: 12.90, kostenProSdg: 14.20 },
  { typ: 'Versand', carrier: 'Spedition', klasse: 'Sperrgut/Bike', region: 'DE', anzahl: 11000, erloesProSdg: 0.00, kostenProSdg: 38.00 },
  { typ: 'Versand', carrier: 'Spedition', klasse: 'Sperrgut/Bike', region: 'AT', anzahl: 1800, erloesProSdg: 49.00, kostenProSdg: 64.00 },
  { typ: 'Versand', carrier: 'Spedition', klasse: 'Sperrgut/Bike', region: 'CH', anzahl: 1400, erloesProSdg: 59.00, kostenProSdg: 82.00 },
  // Retouren (Versandkosten zurück, meist kostenfrei für den Kunden)
  { typ: 'Retoure', carrier: 'DHL', klasse: 'Paket', region: 'DE', anzahl: 17000, erloesProSdg: 0.00, kostenProSdg: 3.60 },
  { typ: 'Retoure', carrier: 'DPD', klasse: 'Paket', region: 'DE', anzahl: 6000, erloesProSdg: 0.00, kostenProSdg: 3.40 },
  { typ: 'Retoure', carrier: 'UPS', klasse: 'Paket', region: 'EU', anzahl: 1500, erloesProSdg: 0.00, kostenProSdg: 9.80 },
  { typ: 'Retoure', carrier: 'Spedition', klasse: 'Bike', region: 'DE', anzahl: 1100, erloesProSdg: 0.00, kostenProSdg: 41.00 }
]

function mit(s) {
  const erloes = s.anzahl * s.erloesProSdg
  const kosten = s.anzahl * s.kostenProSdg
  return { ...s, erloes, kosten, deckung: erloes - kosten, deckungsquote: kosten ? erloes / kosten * 100 : 0 }
}
export function segmente(typ) { return SEGMENTE.filter((s) => !typ || s.typ === typ).map(mit) }

/** Aggregat über einen beliebigen Schlüssel (carrier/klasse/region), optional je typ. */
export function aggregiere(dimKey, typ) {
  const map = new Map()
  for (const s of segmente(typ)) {
    const k = s[dimKey]
    const a = map.get(k) || { [dimKey]: k, anzahl: 0, erloes: 0, kosten: 0 }
    a.anzahl += s.anzahl; a.erloes += s.erloes; a.kosten += s.kosten
    map.set(k, a)
  }
  return [...map.values()].map((a) => ({ ...a, deckung: a.erloes - a.kosten, deckungsquote: a.kosten ? a.erloes / a.kosten * 100 : 0 }))
    .sort((x, y) => y.kosten - x.kosten)
}

export function summe(typ) {
  const s = segmente(typ)
  const erloes = s.reduce((n, x) => n + x.erloes, 0)
  const kosten = s.reduce((n, x) => n + x.kosten, 0)
  const anzahl = s.reduce((n, x) => n + x.anzahl, 0)
  return { erloes, kosten, anzahl, deckung: erloes - kosten, deckungsquote: kosten ? erloes / kosten * 100 : 0 }
}

/** Überblick: Versand, Retouren und Netto (alles zusammen). */
export function ueberblick() {
  const versand = summe('Versand')
  const retoure = summe('Retoure')
  const netto = { erloes: versand.erloes, kosten: versand.kosten + retoure.kosten }
  netto.deckung = netto.erloes - netto.kosten
  netto.deckungsquote = netto.kosten ? netto.erloes / netto.kosten * 100 : 0
  // Gratis-Versand-Kosten = Versandsegmente ohne Erlös
  const gratis = segmente('Versand').filter((s) => s.erloesProSdg === 0).reduce((n, s) => n + s.kosten, 0)
  return { versand, retoure, netto, gratisVersandKosten: gratis }
}
