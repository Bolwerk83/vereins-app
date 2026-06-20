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

export { WACHSTUM_SCHWELLE, ANTEIL_SCHWELLE }
