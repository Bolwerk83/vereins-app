// =========================================================================
//  MARKTPOTENZIAL — Geomarketing je PLZ-Gebiet: aus Einwohnerzahl und einem
//  Pro-Kopf-Marktvolumen (Fahrrad/E-Bike, Quelle ZIV/Destatis) wird das
//  adressierbare Marktpotenzial geschätzt und dem eigenen Ist-Umsatz
//  gegenübergestellt. Daraus: Ausschöpfung (lokaler Marktanteil), Kaufkraft-
//  Dichte (Ew/km²) und die „White Spots" — Gebiete mit viel Potenzial, aber
//  schwacher eigener Durchdringung. Plus Potenzialreserve gegen einen
//  Zielanteil (was wäre drin, wenn jede Region den Benchmark erreicht?).
//
//  Datenbasis: PLZ × Einwohner/Fläche aus Geo-Quellen (suche-postleitzahl.org,
//  Destatis, BKG) – siehe „Datenquellen & Links". Beträge in Tsd € (T€).
// =========================================================================

const KEY = 'er_marktpotenzial'
const r0 = (x) => Math.round(x)
const r1 = (x) => Math.round(x * 10) / 10

// Adressierbares Fahrrad-/E-Bike-Marktvolumen je Einwohner und Jahr (€).
// Ableitbar aus Branchenumsatz (ZIV) ÷ Bevölkerung (Destatis).
export const PRO_KOPF_DEFAULT = 80
// Zielanteil = angestrebter lokaler Marktanteil (%) als Benchmark/Reserve-Basis.
export const ZIEL_ANTEIL_DEFAULT = 6

// PLZ-Gebiete (Leitregion). einwohner = Bevölkerung im Gebiet, flaecheKm2 =
// Fläche, istUmsatz = eigener Jahresumsatz dort (T€). kaufkraftIdx = 100 ≙ Bund.
const SEED = [
  { id: '80', plz: '80–81', ort: 'München', land: 'BY', einwohner: 1488000, flaecheKm2: 310, istUmsatz: 11900, kaufkraftIdx: 137, typ: 'standort' },
  { id: '85', plz: '85', ort: 'Oberbayern (Ingolstadt/Freising)', land: 'BY', einwohner: 620000, flaecheKm2: 2900, istUmsatz: 4500, kaufkraftIdx: 121 },
  { id: '90', plz: '90', ort: 'Nürnberg/Fürth', land: 'BY', einwohner: 790000, flaecheKm2: 540, istUmsatz: 3800, kaufkraftIdx: 104 },
  { id: '70', plz: '70', ort: 'Stuttgart', land: 'BW', einwohner: 635000, flaecheKm2: 210, istUmsatz: 2900, kaufkraftIdx: 118 },
  { id: '60', plz: '60', ort: 'Frankfurt a. M.', land: 'HE', einwohner: 760000, flaecheKm2: 250, istUmsatz: 2100, kaufkraftIdx: 112 },
  { id: '50', plz: '50–51', ort: 'Köln', land: 'NW', einwohner: 1080000, flaecheKm2: 405, istUmsatz: 2600, kaufkraftIdx: 106 },
  { id: '40', plz: '40', ort: 'Düsseldorf', land: 'NW', einwohner: 620000, flaecheKm2: 217, istUmsatz: 1500, kaufkraftIdx: 113 },
  { id: '10', plz: '10–12', ort: 'Berlin', land: 'BE', einwohner: 1900000, flaecheKm2: 410, istUmsatz: 2200, kaufkraftIdx: 95 },
  { id: '20', plz: '20–22', ort: 'Hamburg', land: 'HH', einwohner: 1900000, flaecheKm2: 755, istUmsatz: 1900, kaufkraftIdx: 110 },
  { id: '30', plz: '30', ort: 'Hannover', land: 'NI', einwohner: 540000, flaecheKm2: 204, istUmsatz: 950, kaufkraftIdx: 99 },
  { id: '04', plz: '04', ort: 'Leipzig', land: 'SN', einwohner: 600000, flaecheKm2: 297, istUmsatz: 480, kaufkraftIdx: 90 },
  { id: '01', plz: '01', ort: 'Dresden', land: 'SN', einwohner: 560000, flaecheKm2: 328, istUmsatz: 520, kaufkraftIdx: 92 }
]

function defaults() { return { proKopf: PRO_KOPF_DEFAULT, zielAnteil: ZIEL_ANTEIL_DEFAULT, regionen: SEED.map((r) => ({ ...r })) } }

export function ladeMarktpotenzial() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw == null) return defaults()
    const o = JSON.parse(raw)
    return { proKopf: o.proKopf ?? PRO_KOPF_DEFAULT, zielAnteil: o.zielAnteil ?? ZIEL_ANTEIL_DEFAULT, regionen: Array.isArray(o.regionen) ? o.regionen : SEED.map((r) => ({ ...r })) }
  } catch { return defaults() }
}
function speichere(state) { localStorage.setItem(KEY, JSON.stringify(state)); return state }
export function setzeParameter({ proKopf, zielAnteil }) {
  const s = ladeMarktpotenzial()
  if (proKopf != null) s.proKopf = proKopf
  if (zielAnteil != null) s.zielAnteil = zielAnteil
  return speichere(s)
}
export function setzeZurueck() { localStorage.removeItem(KEY); return ladeMarktpotenzial() }

/** Eine Region anreichern: Potenzial, Ausschöpfung (Marktanteil), Dichte,
 *  Potenzialreserve gegen den Zielanteil. */
function reichere(r, proKopf, zielAnteil) {
  const potenzial = r0(r.einwohner * proKopf / 1000)            // T€
  const ausschoepfungPct = potenzial ? r1(r.istUmsatz / potenzial * 100) : 0
  const dichte = r.flaecheKm2 ? r0(r.einwohner / r.flaecheKm2) : 0  // Ew/km²
  const zielUmsatz = r0(potenzial * zielAnteil / 100)
  const reserve = Math.max(0, zielUmsatz - r.istUmsatz)         // T€ noch holbar
  const status = ausschoepfungPct >= zielAnteil ? 'g' : ausschoepfungPct >= zielAnteil / 2 ? 'a' : 'r'
  return { ...r, potenzial, ausschoepfungPct, dichte, zielUmsatz, reserve, status }
}

/** Alle Regionen, nach Potenzialreserve absteigend (größte Chance zuerst).
 *  whiteSpot = überdurchschnittliches Potenzial bei schwacher Ausschöpfung. */
export function regionen(state = ladeMarktpotenzial()) {
  const liste = state.regionen.map((r) => reichere(r, state.proKopf, state.zielAnteil))
  const potSorted = [...liste].map((x) => x.potenzial).sort((a, b) => a - b)
  const medianPot = potSorted[Math.floor(potSorted.length / 2)] || 0
  liste.forEach((x) => { x.whiteSpot = x.potenzial >= medianPot && x.ausschoepfungPct < state.zielAnteil / 2 })
  return liste.sort((a, b) => b.reserve - a.reserve)
}

export function gesamt(state = ladeMarktpotenzial()) {
  const liste = regionen(state)
  const potenzial = liste.reduce((n, x) => n + x.potenzial, 0)
  const ist = liste.reduce((n, x) => n + x.istUmsatz, 0)
  const reserve = liste.reduce((n, x) => n + x.reserve, 0)
  const einwohner = liste.reduce((n, x) => n + x.einwohner, 0)
  return {
    potenzial, ist, reserve, einwohner,
    ausschoepfungPct: potenzial ? r1(ist / potenzial * 100) : 0,
    whiteSpots: liste.filter((x) => x.whiteSpot).length,
    proKopf: state.proKopf, zielAnteil: state.zielAnteil
  }
}

/** KI-Empfehlung je Region, abhängig von der Lage. */
export function empfehlungFuer(r) {
  if (r.whiteSpot) return { titel: `${r.ort}: White Spot erschließen`, text: `Großes Potenzial (${eurT(r.potenzial)}), nur ${r.ausschoepfungPct}% ausgeschöpft. Geo-Kampagne + lokaler Partner/Shop-in-Shop prüfen; Reserve ${eurT(r.reserve)}.`, prio: 'hoch' }
  if (r.status === 'a') return { titel: `${r.ort}: Durchdringung steigern`, text: `Ausschöpfung ${r.ausschoepfungPct}% unter Ziel ${r.reserve ? '(Reserve ' + eurT(r.reserve) + ')' : ''}. Online-Targeting & Cross-Selling auf das Gebiet lenken.`, prio: 'mittel' }
  return { titel: `${r.ort}: Position halten`, text: `Ausschöpfung ${r.ausschoepfungPct}% – Benchmark erreicht. Bestandskunden binden, Marge sichern.`, prio: 'gering' }
}
function eurT(n) { return Math.round(n).toLocaleString('de-DE') + ' T€' }
