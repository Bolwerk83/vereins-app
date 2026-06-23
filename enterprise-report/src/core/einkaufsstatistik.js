// =========================================================================
//  EINKAUFSSTATISTIK — Beschaffungsüberblick: Einkaufsvolumen nach Lieferant
//  und Warengruppe, ABC-Analyse, Liefertreue/Qualität, Bestellungen und
//  Konditionen (Zahlungsziel/Skonto). Für Einkauf/Controlling. Beträge in €.
// =========================================================================
const r0 = (x) => Math.round(x)
const r1 = (x) => Math.round(x * 10) / 10

// Lieferanten (an lieferantenLebenszyklus angelehnt). volumen/vorjahr €,
// liefertreue/qualitaet %, zahlungsziel Tage, skonto %, bestellungen Anzahl.
const LIEFERANTEN = [
  { id: 'antrieb', name: 'Antrieb & Schaltung AG', warengruppe: 'Antrieb/Schaltung', volumen: 9800000, vorjahr: 9200000, liefertreue: 91, qualitaet: 96, zahlungsziel: 30, skonto: 2.0, bestellungen: 420 },
  { id: 'handel', name: 'Handelsware Süd', warengruppe: 'Zubehör/Handelsware', volumen: 7200000, vorjahr: 6100000, liefertreue: 96, qualitaet: 95, zahlungsziel: 45, skonto: 3.0, bestellungen: 1340 },
  { id: 'rahmen', name: 'RahmenStahl GmbH', warengruppe: 'Rahmen', volumen: 6400000, vorjahr: 6150000, liefertreue: 94, qualitaet: 98, zahlungsziel: 30, skonto: 2.5, bestellungen: 380 },
  { id: 'zubehoer', name: 'Zubehör Import', warengruppe: 'Zubehör/Handelsware', volumen: 4800000, vorjahr: 5050000, liefertreue: 89, qualitaet: 91, zahlungsziel: 60, skonto: 0, bestellungen: 760 },
  { id: 'akku', name: 'Akku-Zellen Asia', warengruppe: 'Akku/Motor', volumen: 4100000, vorjahr: 3150000, liefertreue: 88, qualitaet: 90, zahlungsziel: 14, skonto: 1.0, bestellungen: 210 },
  { id: 'textil', name: 'Bike-Textil Europa', warengruppe: 'Bekleidung', volumen: 2600000, vorjahr: 2450000, liefertreue: 93, qualitaet: 94, zahlungsziel: 45, skonto: 2.0, bestellungen: 540 },
  { id: 'laufrad', name: 'Laufrad-Manufaktur', warengruppe: 'Laufräder', volumen: 1900000, vorjahr: 1700000, liefertreue: 92, qualitaet: 97, zahlungsziel: 30, skonto: 2.0, bestellungen: 290 },
  { id: 'alt', name: 'Alt-Lieferant Y', warengruppe: 'Teile', volumen: 520000, vorjahr: 800000, liefertreue: 87, qualitaet: 88, zahlungsziel: 30, skonto: 1.5, bestellungen: 95 }
]

const wachstum = (ist, vj) => (vj ? r1((ist - vj) / vj * 100) : 0)

/** Lieferanten angereichert (Anteil, Wachstum, Skonto-Potenzial), nach Volumen. */
export function lieferanten() {
  const ges = LIEFERANTEN.reduce((n, l) => n + l.volumen, 0)
  return LIEFERANTEN.map((l) => ({
    ...l, anteilPct: r1(l.volumen / ges * 100), wachstumPct: wachstum(l.volumen, l.vorjahr),
    skontoPotenzial: r0(l.volumen * l.skonto / 100),
    risiko: l.liefertreue < 90 || l.qualitaet < 92 ? (l.liefertreue < 89 ? 'r' : 'a') : 'g'
  })).sort((a, b) => b.volumen - a.volumen)
}

/** Einkaufsvolumen je Warengruppe. */
export function warengruppen() {
  const map = {}
  for (const l of LIEFERANTEN) {
    const g = (map[l.warengruppe] ||= { name: l.warengruppe, volumen: 0, vorjahr: 0, lieferanten: 0, bestellungen: 0 })
    g.volumen += l.volumen; g.vorjahr += l.vorjahr; g.lieferanten += 1; g.bestellungen += l.bestellungen
  }
  const ges = Object.values(map).reduce((n, g) => n + g.volumen, 0)
  return Object.values(map).map((g) => ({
    ...g, anteilPct: r1(g.volumen / ges * 100), wachstumPct: wachstum(g.volumen, g.vorjahr)
  })).sort((a, b) => b.volumen - a.volumen)
}

/** ABC-Analyse: A bis 80 % kumuliert, B bis 95 %, sonst C. */
export function abcAnalyse() {
  const sorted = lieferanten()
  const ges = sorted.reduce((n, l) => n + l.volumen, 0)
  let kum = 0
  const rows = sorted.map((l) => {
    kum += l.volumen
    const kumPct = r1(kum / ges * 100)
    const klasse = kumPct <= 80 ? 'A' : kumPct <= 95 ? 'B' : 'C'
    return { ...l, kumPct, klasse }
  })
  const klassen = ['A', 'B', 'C'].map((kl) => {
    const grp = rows.filter((r) => r.klasse === kl)
    return { klasse: kl, anzahl: grp.length, volumen: grp.reduce((n, r) => n + r.volumen, 0), anteilPct: r1(grp.reduce((n, r) => n + r.volumen, 0) / ges * 100) }
  })
  return { rows, klassen }
}

export function kennzahlen() {
  const l = lieferanten()
  const volumen = l.reduce((n, x) => n + x.volumen, 0)
  const vorjahr = LIEFERANTEN.reduce((n, x) => n + x.vorjahr, 0)
  const bestellungen = l.reduce((n, x) => n + x.bestellungen, 0)
  const skontoPot = l.reduce((n, x) => n + x.skontoPotenzial, 0)
  const wAvg = (sel) => r1(l.reduce((n, x) => n + sel(x) * x.volumen, 0) / volumen)
  return {
    volumen, vorjahr, wachstumPct: wachstum(volumen, vorjahr), lieferantenN: l.length,
    bestellungen, avgBestellwert: bestellungen ? r0(volumen / bestellungen) : 0,
    liefertreue: wAvg((x) => x.liefertreue), qualitaet: wAvg((x) => x.qualitaet),
    skontoPotenzial: skontoPot, topLieferant: l[0]?.name,
    klumpenPct: l[0] ? l[0].anteilPct : 0, risikoLieferanten: l.filter((x) => x.risiko !== 'g').length
  }
}
