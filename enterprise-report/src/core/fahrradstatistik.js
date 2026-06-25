// =========================================================================
//  FAHRRADSTATISTIK — fahrradspezifische Auswertung: verkaufte Räder nach
//  Kategorie (E-MTB, E-Trekking, …), Antriebsart (E-Bike vs. Bio), Preisklasse
//  und Ø-Verkaufspreis/Marge. Mit E-Bike-Anteil und Vorjahresvergleich.
//  Nur komplette Räder (kein Zubehör/Teile). Stück = Räder, Beträge in €.
// =========================================================================
const r0 = (x) => Math.round(x)
const r1 = (x) => Math.round(x * 10) / 10

// Kategorien: stueck/vorjahrStueck = verkaufte Räder, umsatz €, marge %, eBike true/false.
// Normierung auf den Rad-Anteil der operativen Unternehmensgröße (~36,7 Mio €
// Komplettrad-Umsatz, konsistent mit der Verkaufsstatistik). Quoten/Ø-Preise
// bleiben unverändert.
const SKALA = 36.7 / 34.8
const sM = (v) => Math.round(v * SKALA)

const KATEGORIEN = [
  { id: 'emtb', name: 'E-Mountainbike', eBike: true, stueck: 2100, vorjahrStueck: 1700, umsatz: 9450000, marge: 35 },
  { id: 'etrek', name: 'E-Trekking', eBike: true, stueck: 2600, vorjahrStueck: 2300, umsatz: 9620000, marge: 33 },
  { id: 'ecity', name: 'E-City / Urban', eBike: true, stueck: 2400, vorjahrStueck: 2050, umsatz: 6720000, marge: 31 },
  { id: 'mtb', name: 'Mountainbike', eBike: false, stueck: 1800, vorjahrStueck: 2000, umsatz: 2520000, marge: 30 },
  { id: 'gravel', name: 'Gravel / Rennrad', eBike: false, stueck: 1500, vorjahrStueck: 1450, umsatz: 2700000, marge: 32 },
  { id: 'trek', name: 'Trekking / City', eBike: false, stueck: 3900, vorjahrStueck: 4200, umsatz: 2730000, marge: 28 },
  { id: 'kinder', name: 'Kinder & Jugend', eBike: false, stueck: 2600, vorjahrStueck: 2500, umsatz: 1040000, marge: 27 }
].map((k) => ({ ...k, stueck: sM(k.stueck), vorjahrStueck: sM(k.vorjahrStueck), umsatz: sM(k.umsatz) }))

// Preisklassen (€): verkaufte Räder je Spanne.
const PREISKLASSEN = [
  { id: 'p1', name: 'bis 1.000 €', von: 0, bis: 1000, stueck: 4200 },
  { id: 'p2', name: '1.000–2.000 €', von: 1000, bis: 2000, stueck: 5100 },
  { id: 'p3', name: '2.000–3.500 €', von: 2000, bis: 3500, stueck: 5400 },
  { id: 'p4', name: '3.500–5.000 €', von: 3500, bis: 5000, stueck: 1700 },
  { id: 'p5', name: 'über 5.000 €', von: 5000, bis: 99999, stueck: 500 }
].map((p) => ({ ...p, stueck: sM(p.stueck) }))

const wachstum = (ist, vj) => (vj ? r1((ist - vj) / vj * 100) : 0)

export function kategorien(faktor = 1) {
  const ges = KATEGORIEN.reduce((n, k) => n + k.stueck, 0)
  const gesU = KATEGORIEN.reduce((n, k) => n + k.umsatz, 0)
  return KATEGORIEN.map((k) => ({
    ...k, stueck: r0(k.stueck * faktor), vorjahrStueck: r0(k.vorjahrStueck * faktor), umsatz: r0(k.umsatz * faktor),
    avgPreis: k.stueck ? r0(k.umsatz / k.stueck) : 0, anteilPct: r1(k.stueck / ges * 100),
    umsatzAnteilPct: r1(k.umsatz / gesU * 100), wachstumPct: wachstum(k.stueck, k.vorjahrStueck),
    db: r0(k.umsatz * faktor * k.marge / 100)
  })).sort((a, b) => b.umsatz - a.umsatz)
}

/** Antriebsart-Split: E-Bike vs. Bio (ohne Motor). */
export function antrieb(faktor = 1) {
  const split = (flag) => {
    const ks = KATEGORIEN.filter((k) => k.eBike === flag)
    const stueck = r0(ks.reduce((n, k) => n + k.stueck, 0) * faktor)
    const umsatz = r0(ks.reduce((n, k) => n + k.umsatz, 0) * faktor)
    const vj = ks.reduce((n, k) => n + k.vorjahrStueck, 0) * faktor
    return { stueck, umsatz, avgPreis: stueck ? r0(umsatz / stueck) : 0, wachstumPct: wachstum(stueck, vj) }
  }
  const e = split(true), b = split(false)
  const ges = e.stueck + b.stueck
  return {
    eBike: { ...e, anteilPct: r1(e.stueck / ges * 100) },
    bio: { ...b, anteilPct: r1(b.stueck / ges * 100) }
  }
}

export function preisklassen(faktor = 1) {
  const ges = PREISKLASSEN.reduce((n, p) => n + p.stueck, 0)
  return PREISKLASSEN.map((p) => ({ ...p, stueck: r0(p.stueck * faktor), anteilPct: r1(p.stueck / ges * 100) }))
}

export function kennzahlen(faktor = 1) {
  const ks = kategorien(faktor)
  const a = antrieb(faktor)
  const stueck = ks.reduce((n, k) => n + k.stueck, 0)
  const vj = ks.reduce((n, k) => n + k.vorjahrStueck, 0)
  const umsatz = ks.reduce((n, k) => n + k.umsatz, 0)
  const db = ks.reduce((n, k) => n + k.db, 0)
  return {
    stueck, wachstumPct: wachstum(stueck, vj), umsatz, avgPreis: stueck ? r0(umsatz / stueck) : 0,
    eBikeAnteilPct: a.eBike.anteilPct, avgPreisEbike: a.eBike.avgPreis,
    margeProzent: umsatz ? r1(db / umsatz * 100) : 0, topKategorie: ks[0]?.name
  }
}
