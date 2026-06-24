// =========================================================================
//  VEREINFACHTE PLANUNG — wenige Treiber erfassen, ALLE KPIs ableiten.
//  Jeder Treiber kommt mit Vorsaison-Basis + Prozent-Vorschlag. Daraus:
//    AEB  = Auftragseingang × (1 − Stornoquote)        (bereinigt)
//    Umsatz(Plan) = AEB × Ø-Verkaufspreis              (Rückwärtsbrücke)
//  Umsatz + Kostentreiber laufen durch die Szenario-Engine (Kausalmodell)
//  und erzeugen den vollständigen KPI-Plan (DB, Marge, EBIT, Cashflow …).
//
//  NACHKOMMASTELLEN: intern wird IMMER mit voller Genauigkeit gerechnet
//  (keine Fehler-Akkumulation); gerundet wird erst bei der Ausgabe — Mengen
//  kaufmännisch auf ganze Stück (rundeStk), Werte auf 2, Quoten auf 1 Stelle.
// =========================================================================
import { MOCK } from '../data/mock.js'
import { simuliereSzenario } from './szenarioEngine.js'

const VORSAISON = MOCK.roheWerte['2025']
export const rundeStk = (x) => Math.round(x)              // kaufmännisch auf ganze Stück
const r2 = (x) => Math.round(x * 100) / 100

// Wenige Treiber. basis = Vorsaison, vorschlagPct = Default-Vorschlag (%).
export const TREIBER = [
  { id: 'auftragseingangMenge', name: 'Auftragseingang', einheit: 'stk', basis: 16000, vorschlagPct: 3, istMenge: true, hinweis: 'Bestellte Menge (brutto).' },
  { id: 'stornoquote', name: 'Stornoquote', einheit: 'percent', basis: 8, vorschlagPct: 0, istQuote: true, hinweis: 'Anteil stornierter Aufträge → AEB.' },
  { id: 'durchschnittspreis', name: 'Ø Verkaufspreis', einheit: 'eur', basis: 3550, vorschlagPct: 2, hinweis: 'Netto je Stück.' },
  { id: 'wareneinsatzquote', name: 'Wareneinsatzquote', einheit: 'percent', basis: 61.9, vorschlagPct: -2, istQuote: true, hinweis: 'Material in % vom Umsatz.' },
  { id: 'gemeinkosten', name: 'Gemeinkosten', einheit: 'eur_mio', basis: 14.6, vorschlagPct: 2 },
  { id: 'personalkosten', name: 'Personalkosten', einheit: 'eur_mio', basis: 10.5, vorschlagPct: 3 },
  { id: 'marketingkosten', name: 'Marketingkosten', einheit: 'eur_mio', basis: 2.6, vorschlagPct: 10 },
]

/** Standard-Eingaben = die Vorschläge (Vorsaison ± Vorschlag-%). */
export function vorschlagEingaben() {
  return Object.fromEntries(TREIBER.map((t) => [t.id, t.vorschlagPct]))
}

/** Aufgelöster Planwert eines Treibers aus dem %-Delta (volle Genauigkeit). */
export function planwert(t, pct) {
  return t.basis * (1 + (Number(pct) || 0) / 100)
}

/**
 * Vollständige Planung aus den Treiber-%-Eingaben.
 * @param {object} eingaben { treiberId: deltaPct }
 */
export function plane(eingaben = {}) {
  const w = Object.fromEntries(TREIBER.map((t) => [t.id, planwert(t, eingaben[t.id] ?? t.vorschlagPct)]))
  // Rückwärtsbrücke (volle Genauigkeit)
  const aebGenau = w.auftragseingangMenge * (1 - w.stornoquote / 100)
  const umsatzPlanMio = aebGenau * w.durchschnittspreis / 1e6
  const wareneinsatzMio = w.wareneinsatzquote / 100 * umsatzPlanMio
  // Vollständigen KPI-Plan über die Szenario-Engine ableiten (abs. Overrides).
  const overrides = {
    nettoumsatz: { modus: 'abs', wert: r2(umsatzPlanMio) },
    wareneinsatz: { modus: 'abs', wert: r2(wareneinsatzMio) },
    gemeinkosten: { modus: 'abs', wert: r2(w.gemeinkosten) },
    personalkosten: { modus: 'abs', wert: r2(w.personalkosten) },
    marketingkosten: { modus: 'abs', wert: r2(w.marketingkosten) },
  }
  const { basis, sim } = simuliereSzenario(VORSAISON, overrides)
  return {
    treiber: TREIBER.map((t) => ({ ...t, pct: eingaben[t.id] ?? t.vorschlagPct, plan: w[t.id], planGerundet: t.istMenge ? rundeStk(w[t.id]) : r2(w[t.id]) })),
    aebGenau, aeb: rundeStk(aebGenau), umsatzPlanMio: r2(umsatzPlanMio), wareneinsatzMio: r2(wareneinsatzMio),
    vorsaison: basis, plan: sim,
  }
}

// KPIs, die im Planergebnis gezeigt werden (Plan vs. Vorsaison).
export const PLAN_KPIS = ['nettoumsatz', 'db1', 'dbQuote', 'wareneinsatzquote', 'ebit', 'ebitda', 'operativerCashflow', 'roce']
