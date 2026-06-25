// =========================================================================
//  WARENFLUSS / BESTANDSFORTSCHREIBUNG — generische Roll-Forward-Engine:
//     Anfangsbestand + Eingang − Ausgang = Endbestand
//  je Periode (Tag/Woche/Monat/Quartal), über Vergangenheit (Ist),
//  Gegenwart und Zukunft (Plan/Orderbuch). Derselbe Mechanismus für drei
//  Flüsse: Lager (Waren), Auftragsbestand und Liquidität (Zahlungsfluss).
//
//  Zusätzlich: Stichtags-Hochrechnung (Landepunkt zum 31.10.) — für die
//  Flüsse (fortgeschriebener Bestand) und für Plan-Kennzahlen (YTD-Ist +
//  hochgerechnetes Restjahr bis zum Stichtag), z. B. Umsatz und EBIT.
//
//  Deterministisch (seedbasiert, kein Zufall) — überall reproduzierbar.
// =========================================================================
export const JAHR = 2026
const TIM = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] // 2026 (kein Schaltjahr)
export const MONATSNAME = ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
export const TAGE_GESAMT = TIM.reduce((a, b) => a + b, 0)
const GRAN = ['tag', 'woche', 'monat', 'quartal']
export const GRANULARITAETEN = [['tag', 'Tag'], ['woche', 'Woche'], ['monat', 'Monat'], ['quartal', 'Quartal']]

function tagIndex(m, tag) { let s = 0; for (let i = 0; i < m; i++) s += TIM[i]; return s + tag - 1 }
export const HEUTE_IDX = tagIndex(5, 24)     // 24.06.2026
export const STICHTAG_IDX = tagIndex(9, 31)  // 31.10.2026
export const STICHTAG_LABEL = '31.10.'
export function monatVonTag(idx) { let m = 0, d = Math.max(0, Math.min(TAGE_GESAMT - 1, idx)); while (m < 11 && d >= TIM[m]) { d -= TIM[m]; m++ } return { m, tag: d + 1 } }
export function tagLabel(idx) { const { m, tag } = monatVonTag(idx); return `${String(tag).padStart(2, '0')}. ${MONATSNAME[m]}` }
const quartalVonMonat = (m) => Math.floor(m / 3) + 1

// seedbasiertes Rauschen (kein Math.random)
const rng = (n) => { const x = Math.sin(n * 9301 + 49297) * 233280; return x - Math.floor(x) }
const r3 = (x) => Math.round(x * 1000) / 1000
const wochentagFaktor = (idx) => [1, 1.05, 1.05, 1, 1.1, 0.5, 0.25][((idx % 7) + 7) % 7]
const saisonBike = (m) => [0.7, 0.72, 0.9, 1.2, 1.35, 1.3, 1.15, 1.0, 0.95, 0.9, 0.75, 0.7][m]
const saisonFlat = () => 1

export const FLOWS = {
  lager: { id: 'lager', name: 'Warenfluss (Lager)', bestandLabel: 'Lagerbestand', einLabel: 'Wareneingang (Einkauf, nach Lieferdatum)', ausLabel: 'Warenausgang (Vertrieb, nach Lieferdatum)', einheit: 'eur_mio', start: 11.2, basisAus: 32.2 / 365, basisEin: 32.6 / 365, saison: saisonBike, einLumpig: true, richtungGut: 'mitte' },
  auftrag: { id: 'auftrag', name: 'Auftragsbestand', bestandLabel: 'Auftragsbestand', einLabel: 'Auftragseingang (Vertrieb)', ausLabel: 'Auslieferung (nach Lieferdatum)', einheit: 'eur_mio', start: 6.8, basisEin: 56 / 365, basisAus: 55 / 365, saison: saisonBike, einLumpig: false, richtungGut: 'hoch' },
  liquiditaet: { id: 'liquiditaet', name: 'Liquidität (Zahlungsfluss)', bestandLabel: 'Liquidität', einLabel: 'Zahlungseingänge (Forderungen fällig)', ausLabel: 'Zahlungsausgänge (Verb./Löhne)', einheit: 'eur_mio', start: 6.3, basisEin: 55 / 365, basisAus: 54.6 / 365, saison: saisonFlat, einLumpig: true, richtungGut: 'hoch' },
}

// Tageswerte (Ein-/Ausgang) eines Flusses; Vergangenheit mit Streuung (Ist),
// Zukunft glatt (Plan/Orderbuch).
function tagWerte(flow, idx) {
  const sa = flow.saison(monatVonTag(idx).m)
  let aus = flow.basisAus * sa * wochentagFaktor(idx)
  let ein = flow.einLumpig
    ? (idx % 7 === 2 ? flow.basisEin * 7 * sa : flow.basisEin * 0.1 * sa) // wöchentliche Lieferungen
    : flow.basisEin * sa * wochentagFaktor(idx)
  if (idx < HEUTE_IDX) { // Ist: realistische Streuung
    const seed = idx + (flow.id === 'lager' ? 0 : flow.id === 'auftrag' ? 1000 : 2000)
    aus *= 1 + (rng(seed) - 0.5) * 0.5
    ein *= 1 + (rng(seed + 7) - 0.5) * 0.4
  }
  return { ein: r3(ein), aus: r3(aus) }
}

// Tagesreihe + kumulierter Bestand (Prefix-Summen).
function tagesreihe(flow) {
  const tage = []
  let bestand = flow.start
  const bestandNach = new Array(TAGE_GESAMT)
  for (let i = 0; i < TAGE_GESAMT; i++) {
    const { ein, aus } = tagWerte(flow, i)
    bestand = r3(bestand + ein - aus)
    bestandNach[i] = bestand
    tage.push({ idx: i, ein, aus })
  }
  return { tage, bestandNach }
}

function bucketsFuer(gran) {
  // Liefert [{ von, bis, label }] je Granularität. Tag/Woche fenstern um heute.
  if (gran === 'monat') return MONATSNAME.map((n, m) => ({ von: tagIndex(m, 1), bis: tagIndex(m, TIM[m]), label: n }))
  if (gran === 'quartal') return [0, 1, 2, 3].map((q) => ({ von: tagIndex(q * 3, 1), bis: tagIndex(q * 3 + 2, TIM[q * 3 + 2]), label: `Q${q + 1}` }))
  const fensterVon = gran === 'tag' ? HEUTE_IDX - 14 : HEUTE_IDX - 7 * 6
  const fensterBis = STICHTAG_IDX + (gran === 'tag' ? 7 : 14)
  const buckets = []
  if (gran === 'tag') {
    for (let i = Math.max(0, fensterVon); i <= Math.min(TAGE_GESAMT - 1, fensterBis); i++) buckets.push({ von: i, bis: i, label: tagLabel(i) })
  } else { // woche
    for (let a = Math.max(0, fensterVon); a <= Math.min(TAGE_GESAMT - 1, fensterBis); a += 7) {
      const b = Math.min(a + 6, TAGE_GESAMT - 1)
      buckets.push({ von: a, bis: b, label: `KW ${Math.floor(a / 7) + 1}` })
    }
  }
  return buckets
}

const statusVon = (von, bis) => (bis < HEUTE_IDX ? 'ist' : von > HEUTE_IDX ? 'plan' : 'laufend')

/**
 * Fortschreibung eines Flusses je Periode.
 * @returns {{ flow, einheit, zeilen:[{label,anfang,ein,aus,ende,status}], heuteIdx, stichtagIdx }}
 */
export function fortschreibung(flowId, gran = 'monat') {
  const flow = FLOWS[flowId] || FLOWS.lager
  if (!GRAN.includes(gran)) gran = 'monat'
  const { tage, bestandNach } = tagesreihe(flow)
  const anfangVor = (von) => (von === 0 ? flow.start : bestandNach[von - 1])
  const zeilen = bucketsFuer(gran).map(({ von, bis, label }) => {
    let ein = 0, aus = 0
    for (let i = von; i <= bis; i++) { ein += tage[i].ein; aus += tage[i].aus }
    return { label, von, bis, anfang: r3(anfangVor(von)), ein: r3(ein), aus: r3(aus), ende: r3(bestandNach[bis]), status: statusVon(von, bis) }
  })
  return { flow, einheit: flow.einheit, zeilen, heuteIdx: HEUTE_IDX, stichtagIdx: STICHTAG_IDX }
}

/** Stichtags-Landepunkt eines Flusses (Bestand zum 31.10.). */
export function flussLandung(flowId) {
  const flow = FLOWS[flowId] || FLOWS.lager
  const { bestandNach } = tagesreihe(flow)
  const heute = HEUTE_IDX === 0 ? flow.start : bestandNach[HEUTE_IDX - 1]
  const stichtag = bestandNach[STICHTAG_IDX]
  return { flow, heute: r3(heute), stichtag: r3(stichtag), delta: r3(stichtag - heute), start: flow.start }
}

// =========================================================================
//  STICHTAGS-HOCHRECHNUNG für Plan-Kennzahlen (Umsatz, EBIT, …):
//  Landepunkt zum Stichtagsmonat = YTD-Ist + hochgerechnetes Restjahr.
// =========================================================================
import { SERIEN } from './quartalsbericht.js'

// Monatliche EBIT-Serie (Mio €) — Ist bis Jun, Plan ganzjährig (konsistent
// mit EBIT-Ziel ~2,0 und YTD-Lage). Ermöglicht die EBIT-Hochrechnung.
const EBIT_SERIE = {
  ist: [0.15, 0.05, 0.12, 0.22, 0.40, 0.49, 0, 0, 0, 0, 0, 0],
  plan: [0.16, 0.10, 0.15, 0.24, 0.34, 0.30, 0.20, 0.10, 0.08, 0.05, 0.03, 0.05],
}

export const STICHTAG_KPIS = [
  { id: 'umsatz', name: 'Umsatz (gesamt)', einheit: 'eur', serie: () => SERIEN.gesamt },
  { id: 'ebit', name: 'EBIT', einheit: 'eur_mio', serie: () => EBIT_SERIE },
]

/**
 * Hochrechnung einer Monatsserie auf den Stichtagsmonat (Default Okt = Index 9).
 * methode: 'runrate' (Restmonate mit YTD-Leistungsindex) | 'plantreu' (Plan).
 */
export function stichtagHochrechnung(kpiId, { bisMonat = 9, methode = 'runrate' } = {}) {
  const meta = STICHTAG_KPIS.find((k) => k.id === kpiId) || STICHTAG_KPIS[0]
  const s = meta.serie()
  const ist = s.ist, plan = s.plan
  const letzterIst = ist.reduce((acc, v, i) => (v > 0 ? i : acc), -1)
  const idxBis = (n) => Array.from({ length: n + 1 }, (_, i) => i)
  const sumTo = (arr, bis) => idxBis(bis).reduce((n, i) => n + (arr[i] || 0), 0)
  const restIdx = []
  for (let i = letzterIst + 1; i <= bisMonat; i++) restIdx.push(i)
  const ytdIst = sumTo(ist, letzterIst)
  const ytdPlan = sumTo(plan, letzterIst)
  const restPlan = restIdx.reduce((n, i) => n + (plan[i] || 0), 0)
  const leistungsindex = ytdPlan ? ytdIst / ytdPlan : 1
  const restFc = methode === 'plantreu' ? restPlan : restPlan * leistungsindex
  const landung = ytdIst + restFc
  const planStichtag = sumTo(plan, bisMonat)
  const abw = landung - planStichtag
  return {
    name: meta.name, einheit: meta.einheit, methode, bisMonat, monatName: MONATSNAME[bisMonat],
    letzterIstName: MONATSNAME[letzterIst < 0 ? 0 : letzterIst],
    ytdIst: r3(ytdIst), restPlan: r3(restPlan), restFc: r3(restFc), leistungsindex: +leistungsindex.toFixed(3),
    landung: r3(landung), planStichtag: r3(planStichtag), abw: r3(abw),
    abwPct: planStichtag ? +(abw / planStichtag * 100).toFixed(1) : 0,
    status: planStichtag ? (abw / planStichtag >= -0.02 ? 'g' : abw / planStichtag >= -0.08 ? 'a' : 'r') : 'g',
  }
}
