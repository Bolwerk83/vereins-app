// =========================================================================
//  CONTROLLING-INSTRUMENTE — klassische Werkzeuge auf den Datenbestand.
//   - BCG-Portfolio (Star / Cash Cow / Question Mark / Poor Dog)
//   - Break-even-Analyse (Fixkosten ÷ DB-Quote)
//  Reine Berechnung; Darstellung im Modul controlling-instrumente.
// =========================================================================

export const BCG_KLASSEN = {
  'Star':          { farbe: 'var(--amp-g)', empfehlung: 'Investieren — Wachstum sichern, Marktführerschaft ausbauen.' },
  'Cash Cow':      { farbe: 'var(--accent)', empfehlung: 'Ernten — Cashflow abschöpfen, Marge halten, wenig investieren.' },
  'Question Mark': { farbe: 'var(--amp-a)', empfehlung: 'Selektiv investieren oder desinvestieren — Potenzial prüfen.' },
  'Poor Dog':      { farbe: 'var(--amp-r)', empfehlung: 'Desinvestieren/abverkaufen — Mittel binden anderswo.' }
}

const WACHSTUM_SCHWELLE = 5   // % Marktwachstum: darüber = "hoch"
const ANTEIL_SCHWELLE = 1.0   // relativer Marktanteil: darüber = "hoch" (Marktführer)

export function bcgKlasse(wachstum, marktanteil) {
  const hw = wachstum >= WACHSTUM_SCHWELLE
  const hm = marktanteil >= ANTEIL_SCHWELLE
  return hw && hm ? 'Star' : hw && !hm ? 'Question Mark' : !hw && hm ? 'Cash Cow' : 'Poor Dog'
}

export function bcgPortfolio(portfolio = []) {
  return portfolio.map((p) => ({ ...p, klasse: bcgKlasse(p.wachstum, p.marktanteil) }))
}

/** Break-even aus den aktuellen Werten (vereinfachtes Modell). */
export function breakEven(werte) {
  if (werte.gesamtkosten == null || werte.wareneinsatz == null || werte.dbQuote == null || werte.nettoumsatz == null) return null
  const fixkosten = werte.gesamtkosten - werte.wareneinsatz   // variabel ≈ Wareneinsatz
  const dbQuote = werte.dbQuote / 100
  const breakEvenUmsatz = dbQuote > 0 ? fixkosten / dbQuote : null
  const sicherheitsstrecke = breakEvenUmsatz ? ((werte.nettoumsatz - breakEvenUmsatz) / werte.nettoumsatz) * 100 : null
  return { fixkosten, dbQuote: werte.dbQuote, breakEvenUmsatz, nettoumsatz: werte.nettoumsatz, sicherheitsstrecke }
}

// --- Investitionsrechnung: Kapitalwert (NPV), IRR, Amortisation ----------
/** Kapitalwert: −invest + Σ cf_t/(1+i)^t.  zins in % */
export function kapitalwert(invest, cashflows, zinsProzent) {
  const i = zinsProzent / 100
  return cashflows.reduce((npv, cf, t) => npv + cf / Math.pow(1 + i, t + 1), -invest)
}

/** Interner Zinsfuß (IRR) per Bisektion; gibt % oder null zurück. */
export function irr(invest, cashflows) {
  const f = (r) => kapitalwert(invest, cashflows, r)
  let lo = -0.9, hi = 100, flo = f(lo)
  if (flo * f(hi) > 0) return null            // kein Vorzeichenwechsel
  for (let k = 0; k < 100; k++) {
    const mid = (lo + hi) / 2, fm = f(mid)
    if (Math.abs(fm) < 1e-6) return mid
    if (flo * fm < 0) hi = mid; else { lo = mid; flo = fm }
  }
  return (lo + hi) / 2
}

/** Statische Amortisationsdauer in Jahren (kumulierte Cashflows decken Invest). */
export function amortisation(invest, cashflows) {
  let kum = 0
  for (let t = 0; t < cashflows.length; t++) {
    const vorher = kum; kum += cashflows[t]
    if (kum >= invest) return t + (invest - vorher) / cashflows[t]
  }
  return null
}

export function investitionsrechnung(projekte = [], wacc = 8) {
  return projekte.map((p) => {
    const npv = kapitalwert(p.invest, p.cashflows, wacc)
    return {
      ...p, npv, irr: irr(p.invest, p.cashflows), amortisation: amortisation(p.invest, p.cashflows),
      entscheidung: npv > 0 ? 'vorteilhaft' : 'unvorteilhaft'
    }
  }).sort((a, b) => b.npv - a.npv)
}

// --- Szenarioanalyse: EBIT bei Umsatz-/Wareneinsatz-Variation ------------
export function szenarioEbit(w, umsatzDeltaPct, wesDeltaPP) {
  const netto = w.nettoumsatz * (1 + umsatzDeltaPct / 100)
  const wesQuote = w.wareneinsatz / w.nettoumsatz + wesDeltaPP / 100
  const wareneinsatz = netto * wesQuote
  const fix = w.gesamtkosten - w.wareneinsatz       // Fixkosten ≈ konstant
  return netto - wareneinsatz - fix
}

export function szenarien(w) {
  if (w.nettoumsatz == null || w.wareneinsatz == null || w.gesamtkosten == null) return null
  const base = szenarioEbit(w, 0, 0)
  const defs = [
    { name: 'Best Case', u: 5, wes: -1.5, annahme: 'Umsatz +5 %, Wareneinsatzquote −1,5 Pp' },
    { name: 'Base Case', u: 0, wes: 0, annahme: 'Plan-Annahmen (Ist)' },
    { name: 'Worst Case', u: -5, wes: 1.5, annahme: 'Umsatz −5 %, Wareneinsatzquote +1,5 Pp' }
  ]
  return defs.map((d) => { const ebit = szenarioEbit(w, d.u, d.wes); return { ...d, ebit, delta: ebit - base } })
}

// --- Soll-Ist-Abweichungsbrücke (Plan-EBIT -> Ist-EBIT) ------------------
export function abweichungsbruecke(w) {
  if (w.ebitPlan == null || w.ebit == null || w.umsatzplan == null || w.nettoumsatz == null || w.dbQuote == null) return null
  const start = w.ebitPlan, end = w.ebit
  const umsatzeffekt = (w.nettoumsatz - w.umsatzplan) * (w.dbQuote / 100)   // Mengen-/Umsatzeffekt zur Plan-Marge
  const resteffekt = (end - start) - umsatzeffekt                          // Kosten-/Margeneffekt (Residuum)
  let lauf = start
  const komponenten = [
    { label: 'Plan-EBIT', wert: start, typ: 'start', lauf: (lauf) },
    { label: 'Umsatz/Menge', delta: umsatzeffekt, typ: 'delta', lauf: (lauf += umsatzeffekt) },
    { label: 'Kosten/Marge', delta: resteffekt, typ: 'delta', lauf: (lauf += resteffekt) },
    { label: 'Ist-EBIT', wert: end, typ: 'ende', lauf: end }
  ]
  return { start, end, komponenten }
}

export { WACHSTUM_SCHWELLE, ANTEIL_SCHWELLE }
