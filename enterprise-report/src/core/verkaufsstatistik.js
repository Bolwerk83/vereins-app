// =========================================================================
//  VERKAUFSSTATISTIK — schneller Verkaufsüberblick: Umsatz & Absatz nach
//  Warengruppe, Top-Artikel, Vertriebskanal und Monatsverlauf, jeweils mit
//  Vorjahresvergleich und Deckungsbeitrag. Bewusst kompakt als „auf einen
//  Blick"-Bericht für Vertrieb und Leitung. Beträge in € (Tsd, intern voll).
// =========================================================================
const r0 = (x) => Math.round(x)
const r1 = (x) => Math.round(x * 10) / 10

export const MONATE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

// Normierung auf operative Unternehmensgröße (~52 Mio € Umsatz), damit die
// Summen berichtsübergreifend stimmig sind. Anteile/Quoten bleiben unverändert.
const SKALA = 52 / 35.4
const sM = (v) => Math.round(v * SKALA)

// Warengruppen: umsatz/vorjahr in €, menge in Stück, dbProzent = DB-Marge %.
const WARENGRUPPEN = [
  { id: 'ebike', name: 'E-Bikes', umsatz: 18600000, vorjahr: 16100000, menge: 7100, dbProzent: 32 },
  { id: 'fahrraeder', name: 'Fahrräder (ohne Motor)', umsatz: 6400000, vorjahr: 6700000, menge: 9800, dbProzent: 30 },
  { id: 'zubehoer', name: 'Zubehör', umsatz: 4200000, vorjahr: 3600000, menge: 84000, dbProzent: 45 },
  { id: 'bekleidung', name: 'Bekleidung', umsatz: 2700000, vorjahr: 2500000, menge: 41000, dbProzent: 40 },
  { id: 'teile', name: 'Teile & Ersatzteile', umsatz: 2350000, vorjahr: 2050000, menge: 96000, dbProzent: 38 },
  { id: 'service', name: 'Werkstatt & Service', umsatz: 1150000, vorjahr: 980000, menge: 19000, dbProzent: 58 }
].map((w) => ({ ...w, umsatz: sM(w.umsatz), vorjahr: sM(w.vorjahr), menge: sM(w.menge) }))

// Top-Artikel: umsatz €, menge Stück, dbProzent.
const TOP_ARTIKEL = [
  { id: 'a1', name: 'E-Trekking Pro 625', gruppe: 'E-Bikes', umsatz: 4350000, menge: 1160, dbProzent: 33 },
  { id: 'a2', name: 'E-City Comfort 500', gruppe: 'E-Bikes', umsatz: 3120000, menge: 1240, dbProzent: 31 },
  { id: 'a3', name: 'E-MTB Trail 750', gruppe: 'E-Bikes', umsatz: 2980000, menge: 660, dbProzent: 35 },
  { id: 'a4', name: 'Gravel One Carbon', gruppe: 'Fahrräder', umsatz: 1450000, menge: 720, dbProzent: 34 },
  { id: 'a5', name: 'City Lite 7', gruppe: 'Fahrräder', umsatz: 980000, menge: 1900, dbProzent: 29 },
  { id: 'a6', name: 'Helm Aero MIPS', gruppe: 'Zubehör', umsatz: 620000, menge: 8200, dbProzent: 48 },
  { id: 'a7', name: 'Pendler-Tasche 25L', gruppe: 'Zubehör', umsatz: 410000, menge: 13600, dbProzent: 46 }
].map((a) => ({ ...a, umsatz: sM(a.umsatz), menge: sM(a.menge) }))

// Kanal: umsatz/vorjahr €, auftraege = Anzahl.
const KANAELE = [
  { id: 'filiale', name: 'Filiale / stationär', umsatz: 20300000, vorjahr: 19200000, auftraege: 41000 },
  { id: 'online', name: 'Online-Shop', umsatz: 11800000, vorjahr: 9100000, auftraege: 58000 },
  { id: 'grosshandel', name: 'Groß-/Fachhandel (B2B)', umsatz: 3300000, vorjahr: 3640000, auftraege: 2100 }
].map((k) => ({ ...k, umsatz: sM(k.umsatz), vorjahr: sM(k.vorjahr), auftraege: sM(k.auftraege) }))

// Umsatzverlauf gesamt (€) Ist / Vorjahr, Monat Jan–Dez.
const VERLAUF_IST = [2100000, 2050000, 2600000, 3050000, 3550000, 3700000, 3450000, 3100000, 3050000, 2800000, 4200000, 2700000].map(sM)
const VERLAUF_VJ = [1900000, 1850000, 2400000, 2700000, 3150000, 3300000, 3050000, 2800000, 2750000, 2600000, 3650000, 2450000].map(sM)

const wachstum = (ist, vj) => (vj ? r1((ist - vj) / vj * 100) : 0)

export function warengruppen(faktor = 1) {
  const ges = WARENGRUPPEN.reduce((n, w) => n + w.umsatz, 0)
  return WARENGRUPPEN.map((w) => ({
    ...w, umsatz: r0(w.umsatz * faktor), vorjahr: r0(w.vorjahr * faktor), menge: r0(w.menge * faktor),
    anteilPct: r1(w.umsatz / ges * 100), wachstumPct: wachstum(w.umsatz, w.vorjahr),
    db: r0(w.umsatz * faktor * w.dbProzent / 100), avgPreis: w.menge ? r0(w.umsatz / w.menge) : 0
  })).sort((a, b) => b.umsatz - a.umsatz)
}

export function topArtikel(n = 7, faktor = 1) {
  return TOP_ARTIKEL.map((a) => ({ ...a, umsatz: r0(a.umsatz * faktor), menge: r0(a.menge * faktor), avgPreis: a.menge ? r0(a.umsatz / a.menge) : 0, db: r0(a.umsatz * faktor * a.dbProzent / 100) }))
    .sort((a, b) => b.umsatz - a.umsatz).slice(0, n)
}

export function kanaele(faktor = 1) {
  const ges = KANAELE.reduce((n, k) => n + k.umsatz, 0)
  return KANAELE.map((k) => ({
    ...k, umsatz: r0(k.umsatz * faktor), vorjahr: r0(k.vorjahr * faktor), auftraege: r0(k.auftraege * faktor),
    anteilPct: r1(k.umsatz / ges * 100), wachstumPct: wachstum(k.umsatz, k.vorjahr),
    avgBon: k.auftraege ? r0(k.umsatz / k.auftraege) : 0
  })).sort((a, b) => b.umsatz - a.umsatz)
}

/** Monatsverlauf, optional auf ausgewählte Monatsindizes beschränkt und skaliert. */
export function verlauf(monate = null, faktor = 1) {
  const idx = monate || MONATE.map((_, i) => i)
  return idx.map((i) => ({ monat: MONATE[i], ist: r0(VERLAUF_IST[i] * faktor), vorjahr: r0(VERLAUF_VJ[i] * faktor) }))
}

export function kennzahlen(faktor = 1) {
  const wg = warengruppen(faktor)
  const k = kanaele(faktor)
  const umsatz = wg.reduce((n, w) => n + w.umsatz, 0)
  const vorjahr = wg.reduce((n, w) => n + w.vorjahr, 0)
  const menge = wg.reduce((n, w) => n + w.menge, 0)
  const db = wg.reduce((n, w) => n + w.db, 0)
  const auftraege = k.reduce((n, x) => n + x.auftraege, 0)
  return {
    umsatz, vorjahr, wachstumPct: wachstum(umsatz, vorjahr), menge, auftraege,
    avgBon: auftraege ? r0(umsatz / auftraege) : 0, db, dbProzent: umsatz ? r1(db / umsatz * 100) : 0,
    onlineAnteilPct: r1((k.find((x) => x.id === 'online')?.umsatz || 0) / umsatz * 100),
    topGruppe: wg[0]?.name, topKanal: k[0]?.name
  }
}
