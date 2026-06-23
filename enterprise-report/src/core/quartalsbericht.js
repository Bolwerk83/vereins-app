// =========================================================================
//  QUARTALSBERICHT — Management-Report (Ist / Plan / Vorjahr) für den
//  Fahrrad-Handel: Umsatz gesamt, Fahrräder und Teile/Bekleidung/Zubehör,
//  dazu Durchschnittspreise und Auftragseingang. Wirtschaftsjahr Nov–Okt.
//
//  Liefert reine Daten + Kennzahlen (YTD/Quartal, Abweichung, kumuliert) und
//  die persistente Verwaltung der Bemerkungen. Kein UI hier.
// =========================================================================

export const MONATE = ['Nov', 'Dez', 'Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt']
export const QUARTALE = [
  { id: 'Q1', name: 'Q1 · Nov–Jan', monate: [0, 1, 2] },
  { id: 'Q2', name: 'Q2 · Feb–Apr', monate: [3, 4, 5] },
  { id: 'Q3', name: 'Q3 · Mai–Jul', monate: [6, 7, 8] },
  { id: 'Q4', name: 'Q4 · Aug–Okt', monate: [9, 10, 11] }
]

// --- Umsatzserien (€). Ist nur bis Stand April (danach 0 = Zukunft). --------
// Normierung auf die operative Unternehmensgröße (~52 Mio € Jahresplan), damit
// die Summen berichtsübergreifend stimmig sind. SKALA ändert nur die Absolut-
// beträge; Anteile, Abweichungen und Quoten bleiben unverändert.
const SKALA = 52 / 217.1
const skalaSerie = (s) => ({
  ist: s.ist.map((v) => Math.round(v * SKALA)),
  plan: s.plan.map((v) => Math.round(v * SKALA)),
  vj: s.vj.map((v) => Math.round(v * SKALA))
})
const FAHRRAEDER = skalaSerie({
  ist:  [9420000, 6560000, 7310000, 9620000, 15550000, 20050000, 0, 0, 0, 0, 0, 0],
  plan: [9420000, 7840000, 9420000, 15590000, 15550000, 16990000, 16980000, 14800000, 13040000, 11270000, 9500000, 7050000],
  vj:   [8940000, 7300000, 7840000, 14060000, 15550000, 17200000, 16500000, 14000000, 12500000, 10800000, 9000000, 6800000]
})
const TBZ = skalaSerie({
  ist:  [4360000, 4410000, 3710000, 4490000, 6120000, 8000000, 0, 0, 0, 0, 0, 0],
  plan: [4720000, 4170000, 4720000, 6310000, 7320000, 6750000, 6750000, 7860000, 7000000, 5000000, 4500000, 4520000],
  vj:   [4500000, 4000000, 4400000, 5800000, 6500000, 6400000, 6400000, 7500000, 6800000, 4800000, 4300000, 4300000]
})
const add = (a, b) => a.map((x, i) => x + b[i])
const GESAMT = { ist: add(FAHRRAEDER.ist, TBZ.ist), plan: add(FAHRRAEDER.plan, TBZ.plan), vj: add(FAHRRAEDER.vj, TBZ.vj) }

export const SERIEN = {
  gesamt:     { id: 'gesamt', titel: 'Umsatz gesamt', kurz: 'Gesamt', ...GESAMT },
  fahrraeder: { id: 'fahrraeder', titel: 'Umsatz Fahrräder', kurz: 'Fahrräder', ...FAHRRAEDER },
  tbz:        { id: 'tbz', titel: 'Umsatz Teile · Bekleidung · Zubehör', kurz: 'Teile/Bekl./Zub.', ...TBZ }
}
export const SERIEN_IDS = ['gesamt', 'fahrraeder', 'tbz']

// Arbeitstage je Monat (Nov–Okt) — um kurze/lange Monate vergleichbar zu machen
// (Umsatz je Arbeitstag statt absolut).
export const ARBEITSTAGE = [20, 18, 21, 20, 21, 21, 22, 20, 23, 21, 22, 23]
export const arbeitstage = (monate) => monate.reduce((n, i) => n + ARBEITSTAGE[i], 0)

// Berichtstypen: aus denselben Monatsdaten Monats-, Quartals- oder Jahresbericht.
export const BERICHTSTYPEN = [
  { id: 'monat',    name: 'Monatsbericht' },
  { id: 'quartal',  name: 'Quartalsbericht' },
  { id: 'jahr',     name: 'Jahresbericht' }
]
/** Perioden eines Berichtstyps: {id, name, kurz, monate}. */
export function perioden(typ) {
  if (typ === 'jahr') return [{ id: 'jahr', name: `Jahr · ${MONATE[0]}–${MONATE[11]}`, kurz: 'Jahr', monate: MONATE.map((_, i) => i) }]
  if (typ === 'monat') return MONATE.map((m, i) => ({ id: 'M' + i, name: `Monat · ${m}`, kurz: m, monate: [i] }))
  return QUARTALE.map((q) => ({ id: q.id, name: q.name, kurz: q.id, monate: q.monate }))
}

/** Höchster Monatsindex mit Ist-Wert (= aktueller Stand). */
export function letzterIstMonat(serieId = 'gesamt') {
  const s = SERIEN[serieId]; let idx = -1
  s.ist.forEach((v, i) => { if (v > 0) idx = i })
  return idx
}

const summe = (arr, bis) => arr.slice(0, bis + 1).reduce((n, x) => n + x, 0)

/** YTD-Kennzahlen bis einschließlich `bisMonat`. */
export function kennzahlen(serieId, bisMonat = letzterIstMonat()) {
  const s = SERIEN[serieId]
  const ist = summe(s.ist, bisMonat), plan = summe(s.plan, bisMonat), vj = summe(s.vj, bisMonat)
  return { ist, plan, vj, abw: ist - plan, abwPct: plan ? (ist - plan) / plan * 100 : 0, abwVj: ist - vj, abwVjPct: vj ? (ist - vj) / vj * 100 : 0 }
}

/** Kennzahlen über eine beliebige Monatsliste; optional je Arbeitstag normiert
 *  und auf einen Faktor (z. B. Profit-Center-Anteil) skaliert. */
export function kennzahlenMonate(serieId, monate, { jeArbeitstag = false, faktor = 1 } = {}) {
  const s = SERIEN[serieId]
  // Ist nur für bereits abgeschlossene Monate (Ist > 0) berücksichtigen.
  const istMon = monate.filter((i) => s.ist[i] > 0)
  const pick = (arr, mon) => mon.reduce((n, i) => n + arr[i], 0) * faktor
  let ist = pick(s.ist, istMon), plan = pick(s.plan, istMon), vj = pick(s.vj, istMon)
  if (jeArbeitstag) {
    const at = arbeitstage(istMon) || 1
    ist /= at; plan /= at; vj /= at
  }
  return { ist, plan, vj, abw: ist - plan, abwPct: plan ? (ist - plan) / plan * 100 : 0, abwVj: ist - vj, abwVjPct: vj ? (ist - vj) / vj * 100 : 0, monate, istMonate: istMon, arbeitstage: arbeitstage(istMon) }
}

/** Kennzahlen für genau ein Quartal (nur dessen Monate). */
export function quartalKennzahlen(serieId, quartalId) {
  const q = QUARTALE.find((x) => x.id === quartalId) || QUARTALE[0]
  return { ...kennzahlenMonate(serieId, q.monate), monate: q.monate }
}

export function kumuliert(arr, bis = arr.length - 1) {
  const out = []; let s = 0
  for (let i = 0; i < arr.length; i++) { s += arr[i]; out.push(i <= bis ? s : null) }
  return out
}

/** Kernaussage „X,X Mio € unter/über Plan". */
export function headline(serieId, bisMonat = letzterIstMonat()) {
  const k = kennzahlen(serieId, bisMonat)
  const mio = Math.abs(k.abw) / 1e6
  const txt = mio.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  return `${txt} Mio € ${k.abw < 0 ? 'unter' : 'über'} Plan`
}

export function ampel(abwPct) { return abwPct >= 0 ? 'g' : abwPct >= -5 ? 'a' : 'r' }

// --- Durchschnittliche Verkaufspreise (Quelle ZIV) --------------------------
export const PREIS_JAHRE = ['2021', '2022', '2023', '2024', '2025']
export const PREISE = {
  fahrrad: { name: 'Fahrräder', farbe: '#1e3a8a', werte: [466, 500, 470, 500, 500] },
  ebike:   { name: 'E-Bikes',   farbe: '#38bdf8', werte: [2650, 2800, 2800, 2550, 2550] },
  gesamt:  { name: 'Gesamt',    farbe: '#94a3b8', werte: [1395, 1602, 1788, 1645, 1581] }
}
export const PREIS_BEMERKUNG_DEFAULT = [
  'Durchschnittspreise bei E-Bikes sinken um 3,8 % auf 2.550 €; Fahrradpreise bleiben stabil bei ~500 €.',
  'Rabattaktionen drücken die Preise in fast allen Modellgruppen.',
  'Hochpreisige Renn- und Gravelräder stabilisieren den Ø-Verkaufspreis bei den Fahrrädern.'
]

// --- Auftragseingang Bikes --------------------------------------------------
export const AUFTRAG = {
  wert: 1013221,
  anzahl: 709,
  kategorien: [
    { name: 'Gravel', pct: 40 },
    { name: 'Urban & Trekking', pct: 28 },
    { name: 'Rennrad', pct: 22 },
    { name: 'MTB', pct: 10 }
  ],
  tage: [
    { tag: 'Mittwoch', n: 157 },
    { tag: 'Donnerstag', n: 332 },
    { tag: 'Freitag', n: 133 },
    { tag: 'Samstag', n: 87 }
  ]
}
export const avgWertProBike = () => Math.round(AUFTRAG.wert / AUFTRAG.anzahl)

// --- Filter: Vertriebskanal-Split (Online ↔ Stationär) ---------------------
// Hinweis: Der Profit-Center-Filter wird zentral über den PC-Baum
// (core/statistikFilter.js → pcBaum/pcFaktor) geführt; Kanäle sind dort
// PC-Knoten. Die frühere flache PROFITCENTER-Liste entfällt.

// Kanal-Split (YTD): Online wächst & liegt über Plan, stationär bricht ein.
// Beträge mit derselben SKALA wie die Umsatzserien normiert.
const sk = (x) => Math.round(x * SKALA)
export const KANAELE = [
  { id: 'gesamt',     name: 'Alle Kanäle' },
  { id: 'online',     name: 'Online (E-Commerce)', ist: sk(58400000), plan: sk(55000000), vj: sk(53500000), farbe: '#2563eb' },
  { id: 'stationaer', name: 'Stationär (Store)',   ist: sk(41200000), plan: sk(53800000), vj: sk(42600000), farbe: '#f59e0b' }
]
export const kanalSplit = () => KANAELE.filter((k) => k.id !== 'gesamt').map((k) => {
  const ges = KANAELE.filter((x) => x.ist).reduce((n, x) => n + x.ist, 0)
  return { ...k, abw: k.ist - k.plan, abwPct: (k.ist - k.plan) / k.plan * 100, abwVj: k.ist - k.vj, abwVjPct: (k.ist - k.vj) / k.vj * 100, anteil: +(k.ist / ges * 100).toFixed(1) }
})

// --- Internationalisierung (YTD je Land) -----------------------------------
// Umsätze mit derselben SKALA wie die Umsatzserien normiert.
export const LAENDER = [
  { land: 'Deutschland',  code: 'DE',  umsatz: sk(62000000), wachstum: 3,  marktanteil: 14 },
  { land: 'Niederlande',  code: 'NL',  umsatz: sk(9500000),  wachstum: 20, marktanteil: 8 },
  { land: 'Schweiz',      code: 'CH',  umsatz: sk(8500000),  wachstum: 2,  marktanteil: 11 },
  { land: 'Österreich',   code: 'AT',  umsatz: sk(7000000),  wachstum: 7,  marktanteil: 9 },
  { land: 'Skandinavien', code: 'SCA', umsatz: sk(5000000),  wachstum: 25, marktanteil: 5 },
  { land: 'Frankreich',   code: 'FR',  umsatz: sk(4000000),  wachstum: -8, marktanteil: 3 },
  { land: 'Übrige EU',    code: 'EU',  umsatz: sk(3600000),  wachstum: 12, marktanteil: 2 }
]
export function inlandAusland() {
  const inland = LAENDER.find((l) => l.code === 'DE')
  const ausland = LAENDER.filter((l) => l.code !== 'DE')
  const aUms = ausland.reduce((n, l) => n + l.umsatz, 0)
  const aWg = ausland.reduce((n, l) => n + l.umsatz * l.wachstum, 0) / (aUms || 1)
  const ges = inland.umsatz + aUms
  return {
    inland: { umsatz: inland.umsatz, anteil: +(inland.umsatz / ges * 100).toFixed(1), wachstum: inland.wachstum },
    ausland: { umsatz: aUms, anteil: +(aUms / ges * 100).toFixed(1), wachstum: +aWg.toFixed(1) }
  }
}

// --- Benchmark & Marktanteil -----------------------------------------------
export const MARKT = {
  marktanteil: [
    { name: 'Wettbewerber A', pct: 22 },
    { name: 'Wettbewerber B', pct: 18 },
    { name: 'Wir', pct: 14, eigen: true },
    { name: 'Wettbewerber C', pct: 11 },
    { name: 'Übrige Anbieter', pct: 35 }
  ],
  benchmark: [
    { kpi: 'Umsatzwachstum YoY', wir: -7.7, markt: -5.0, einheit: '%', grossGut: true },
    { kpi: 'Ø-Verkaufspreis Bike', wir: 1581, markt: 1650, einheit: '€', grossGut: true },
    { kpi: 'E-Bike-Anteil', wir: 62, markt: 53, einheit: '%', grossGut: true },
    { kpi: 'Online-Anteil', wir: 59, markt: 42, einheit: '%', grossGut: true },
    { kpi: 'Retourenquote', wir: 7.5, markt: 9.0, einheit: '%', grossGut: false }
  ],
  quelle: 'Marktdaten: ZIV (Branchenabsatz & -preise), bevh (Online-Anteil), GfK/Statista (Marktanteile) — teils zugekauft/geschätzt.'
}

// --- Bemerkungen (persistent) ----------------------------------------------
const KEY = 'er_quartalsbericht'
export function ladeBemerkungen() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}
export function speichereBemerkung(schluessel, text) {
  const o = ladeBemerkungen(); o[schluessel] = text
  localStorage.setItem(KEY, JSON.stringify(o)); return o
}

/** Vorgeschlagene Bemerkung je Umsatz-Sektion (auto, editierbar). */
export function bemerkungVorschlag(serieId) {
  const k = kennzahlen(serieId)
  const rich = k.abw < 0 ? 'unter' : 'über'
  const mio = (Math.abs(k.abw) / 1e6).toLocaleString('de-DE', { maximumFractionDigits: 1 })
  const vj = k.abwVj < 0 ? 'unter' : 'über'
  const vjPct = Math.abs(k.abwVjPct).toLocaleString('de-DE', { maximumFractionDigits: 1 })
  return `Stand ${MONATE[letzterIstMonat()]}: ${mio} Mio € ${rich} Plan (${k.abwPct.toFixed(1)} %), `
    + `${vjPct} % ${vj} Vorjahr. Ursachen: Nachfrageschwäche und Preisnachlässe; Gegenmaßnahmen im Vertrieb eingeleitet.`
}
