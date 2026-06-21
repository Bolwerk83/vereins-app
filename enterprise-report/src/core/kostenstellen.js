// =========================================================================
//  KOSTENSTELLENRECHNUNG (Betriebsabrechnungsbogen, BAB) — „Wo entstehen
//  die Kosten?" Verteilt die Gemeinkosten verursachungsgerecht auf Stellen
//  und ermittelt je Endkostenstelle einen Zuschlagssatz.
//
//   Vorkostenstellen (Hilfs/Allgemein)  --Umlage-->  Endkostenstellen (Haupt)
//   Endstelle: Primärkosten + Umlage = Gesamt-GK  ->  Zuschlagssatz
//
//  Center-Typen nach Verantwortung: Cost / Profit / Investment Center.
// =========================================================================
import { BLOECKE } from './einzelGemein.js'

const mek = BLOECKE.find((b) => b.id === 'mek').betrag   // Materialeinzelkosten (Bezugsbasis)
const fek = BLOECKE.find((b) => b.id === 'fek').betrag   // Fertigungseinzelkosten (Bezugsbasis)

export const CENTER_TYPEN = [
  { id: 'cost',       name: 'Cost Center',       laie: 'Verantwortet nur Kosten (Budget einhalten).' },
  { id: 'profit',     name: 'Profit Center',     laie: 'Verantwortet Kosten UND Erlöse — also das Ergebnis.' },
  { id: 'investment', name: 'Investment Center', laie: 'Zusätzlich Kapital/Investitionen — gemessen an der Rendite (ROCE).' }
]
export const centerTypInfo = (id) => CENTER_TYPEN.find((c) => c.id === id)

// Vorkostenstellen: werden über einen Schlüssel auf Endstellen umgelegt.
export const VORSTELLEN = [
  { id: 'allgemein', name: 'Allgemeine Stelle (Gebäude/Energie)', primaerPlan: 1.8, primaerIst: 1.9, schluessel: { material: 0.10, fertigung: 0.40, verwaltung: 0.25, vertrieb: 0.25 }, schluesselText: 'nach Fläche' },
  { id: 'fhilfe',    name: 'Fertigungshilfsstelle (Instandhaltung)', primaerPlan: 0.9, primaerIst: 1.0, schluessel: { fertigung: 1.0 }, schluesselText: 'auf Fertigung' }
]

// Endkostenstellen (Hauptstellen): erhalten Umlage und tragen Zuschlagssätze.
export const ENDSTELLEN = [
  { id: 'material',   name: 'Materialstelle',   centerTyp: 'cost',   primaerPlan: 1.2, primaerIst: 1.3, bezug: 'mek' },
  { id: 'fertigung',  name: 'Fertigungsstelle', centerTyp: 'cost',   primaerPlan: 2.4, primaerIst: 2.6, bezug: 'fek' },
  { id: 'verwaltung', name: 'Verwaltungsstelle', centerTyp: 'cost',  primaerPlan: 6.5, primaerIst: 6.7, bezug: 'hk' },
  { id: 'vertrieb',   name: 'Vertriebsstelle',  centerTyp: 'profit', primaerPlan: 6.6, primaerIst: 6.8, bezug: 'hk' }
]

const r2 = (x) => Math.round(x * 100) / 100
const r1 = (x) => Math.round(x * 10) / 10

/** Umlage einer Vorkostenstelle auf eine Endstelle (Ist). */
function umlageAuf(endId) {
  return r2(VORSTELLEN.reduce((n, v) => n + (v.schluessel[endId] || 0) * v.primaerIst, 0))
}

/**
 * Betriebsabrechnungsbogen: je Endstelle Primär + Umlage = Gesamt-GK,
 * Bezugsbasis und Zuschlagssatz. Plus Herstellkosten als Bezug für Verw/Vertr.
 */
export function bab() {
  const primaer = (e) => e.primaerIst
  const gesamt = {}
  for (const e of ENDSTELLEN) gesamt[e.id] = r2(primaer(e) + umlageAuf(e.id))
  // Herstellkosten = Material(EK+GK) + Fertigung(EK+GK)
  const hk = r2(mek + gesamt.material + fek + gesamt.fertigung)
  const bezugWert = { mek, fek, hk }
  const bezugLabel = { mek: 'Materialeinzelkosten', fek: 'Fertigungseinzelkosten', hk: 'Herstellkosten' }

  const rows = ENDSTELLEN.map((e) => ({
    id: e.id, name: e.name, centerTyp: e.centerTyp,
    primaer: r2(primaer(e)), umlage: umlageAuf(e.id), gesamt: gesamt[e.id],
    bezug: e.bezug, bezugLabel: bezugLabel[e.bezug], bezugWert: bezugWert[e.bezug],
    zuschlag: r1(gesamt[e.id] / bezugWert[e.bezug] * 100)
  }))
  const vorRows = VORSTELLEN.map((v) => ({ id: v.id, name: v.name, primaer: v.primaerIst, schluesselText: v.schluesselText, verteilt: v.primaerIst }))
  return { rows, vorRows, hk, gemeinSumme: r2(rows.reduce((n, r) => n + r.gesamt, 0)) }
}

/** Wirtschaftlichkeitskontrolle: Plan/Ist je Stelle (Primärkosten). */
export function wirtschaftlichkeit() {
  const alle = [...VORSTELLEN, ...ENDSTELLEN]
  return alle.map((s) => ({
    id: s.id, name: s.name,
    plan: s.primaerPlan, ist: s.primaerIst,
    abw: r2(s.primaerIst - s.primaerPlan),
    abwPct: r1((s.primaerIst / s.primaerPlan - 1) * 100)
  }))
}
