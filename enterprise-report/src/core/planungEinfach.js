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
import { berechneAlle, KPI } from './kpiRegistry.js'

const VORSAISON = MOCK.roheWerte['2025']
const IST = berechneAlle(VORSAISON) // Vorjahr-Ist als Vergleichsbasis
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

// KPIs für die Budget-/Ist-/Forecast-Gegenüberstellung.
export const BUDGET_KPIS = ['nettoumsatz', 'db1', 'dbQuote', 'wareneinsatz', 'gemeinkosten', 'personalkosten', 'marketingkosten', 'ebit', 'ebitda', 'operativerCashflow', 'roce']

/**
 * Budget (Plan) vs. Ist (Vorjahr) vs. Forecast (rollierende Landung) je KPI.
 * @param eingaben     Treiber-%-Eingaben (Budget)
 * @param wachstumPct  erwartetes Wachstum für den rollierenden Forecast (auf Ist)
 */
export function budgetVergleich(eingaben = {}, wachstumPct = 4) {
  const { plan } = plane(eingaben)
  const f = 1 + (Number(wachstumPct) || 0) / 100
  // Forecast = eigene Simulation: Ist-Treiber × Wachstum (rollierende Landung).
  const fcOverrides = {
    nettoumsatz: { modus: 'abs', wert: r2((IST.nettoumsatz || 0) * f) },
    wareneinsatz: { modus: 'abs', wert: r2((IST.wareneinsatz || 0) * f) },
    gemeinkosten: { modus: 'abs', wert: r2(IST.gemeinkosten || 0) },
    personalkosten: { modus: 'abs', wert: r2(IST.personalkosten || 0) },
    marketingkosten: { modus: 'abs', wert: r2(IST.marketingkosten || 0) },
  }
  const { sim: fc } = simuliereSzenario(VORSAISON, fcOverrides)
  return BUDGET_KPIS.map((id) => {
    const k = KPI[id] || { name: id }
    const ist = IST[id], budget = plan[id], forecast = fc[id]
    const abw = budget != null && ist != null ? budget - ist : null
    const abwPct = abw != null && ist ? abw / Math.abs(ist) * 100 : null
    const fcAbw = forecast != null && budget != null ? forecast - budget : null
    return { id, name: k.name, einheit: k.einheit, richtung: k.richtung, ziel: k.ziel,
      ist, budget, forecast, abw, abwPct, fcAbw }
  })
}

/**
 * Inverse Zielrechnung: welcher Treiber ist nötig, um ein KPI-Ziel zu treffen?
 * Unterstützt nettoumsatz (→ benötigte AEB/Auftragseingang) und ebit
 * (→ benötigter Umsatz bei aktueller Kostenstruktur).
 */
export function zielRueckwaerts(kpiId, zielwert, eingaben = {}) {
  const w = Object.fromEntries(TREIBER.map((t) => [t.id, planwert(t, eingaben[t.id] ?? t.vorschlagPct)]))
  const ziel = Number(zielwert)
  if (kpiId === 'nettoumsatz') {
    const aeb = ziel * 1e6 / w.durchschnittspreis            // benötigte bereinigte Menge
    const auftragseingang = aeb / (1 - w.stornoquote / 100)  // brutto (vor Storno)
    return { kpiId, ziel, durchschnittspreis: r2(w.durchschnittspreis), stornoquote: r2(w.stornoquote),
      aeb: rundeStk(aeb), auftragseingang: rundeStk(auftragseingang),
      text: `Für ${r2(ziel)} Mio € Umsatz: AEB ${rundeStk(aeb).toLocaleString('de-DE')} Stk (Auftragseingang ${rundeStk(auftragseingang).toLocaleString('de-DE')} Stk vor ${r2(w.stornoquote)} % Storno) bei Ø ${r2(w.durchschnittspreis)} €.` }
  }
  if (kpiId === 'ebit') {
    // EBIT = Umsatz − Wareneinsatz − Gemein − Personal − Marketing − sonstige.
    // sonstige Fixkosten aus dem aktuellen Plan ableiten (Rest).
    const { plan } = plane(eingaben)
    const fixSonstige = (plan.nettoumsatz - plan.wareneinsatz - w.gemeinkosten - w.personalkosten - w.marketingkosten) - plan.ebit
    // benötigter Umsatz: ziel = U·(1−WEQ) − Gemein − Pers − Mkt − fixSonstige
    const umsatz = (ziel + w.gemeinkosten + w.personalkosten + w.marketingkosten + fixSonstige) / (1 - w.wareneinsatzquote / 100)
    return { kpiId, ziel, benoetigterUmsatz: r2(umsatz), wareneinsatzquote: r2(w.wareneinsatzquote),
      text: `Für ${r2(ziel)} Mio € EBIT: Umsatz ≈ ${r2(umsatz)} Mio € nötig (bei ${r2(w.wareneinsatzquote)} % Wareneinsatz und aktuellen Fixkosten).` }
  }
  return { kpiId, ziel, text: 'Für diese Kennzahl ist keine direkte Rückwärtsrechnung hinterlegt.' }
}
