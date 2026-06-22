// =========================================================================
//  FINANZ- & RISIKO-COCKPIT — Bilanz-, Liquiditäts-, Rentabilitäts- und
//  Risikokennzahlen, konsistent aus EINER Datenbasis (Bilanz/GuV/Cashflow)
//  abgeleitet. Ausgerichtet an deutschen/europäischen Standards: HGB-Bilanz-
//  analyse, IFRS-Kennzahlen (ROCE, EBITDA-Marge), Working-Capital-Management
//  und Risiko-Frühaufklärung (KonTraG/§ 91 AktG).
//
//  Beträge in Mio € (Geschäftsjahr). Alle Kennzahlen lassen sich auf die
//  Basiszahlen zurückführen (Formel je Kennzahl mitgegeben).
// =========================================================================

// --- Datenbasis (Geschäftsjahr, Mio €) -------------------------------------
export const BILANZ = {
  // Aktiva
  anlagevermoegen: 78.0,        // Sachanlagen 60, immateriell 8, Finanzanlagen 10
  vorraete: 48.0,
  forderungen: 28.0,
  sonstigesUV: 4.0,
  liquideMittel: 12.0,
  // Passiva
  eigenkapital: 59.5,
  langfristFK: 55.0,            // Bankdarlehen 45, Pensionsrückstellungen 10
  kurzfristFK: 55.5,            // Verb. LuL 30, kurzfr. Bank 12, sonstige 13.5
  verbindlLuL: 30.0,
  verzinslichesFK: 57.0         // 45 langfr. Bank + 12 kurzfr. Bank
}
BILANZ.umlaufvermoegen = +(BILANZ.vorraete + BILANZ.forderungen + BILANZ.sonstigesUV + BILANZ.liquideMittel).toFixed(2)
BILANZ.summe = +(BILANZ.anlagevermoegen + BILANZ.umlaufvermoegen).toFixed(2)
BILANZ.fremdkapital = +(BILANZ.langfristFK + BILANZ.kurzfristFK).toFixed(2)
BILANZ.nettofinanzschulden = +(BILANZ.verzinslichesFK - BILANZ.liquideMittel).toFixed(2)

export const GUV = {
  umsatz: 205.0,
  materialaufwand: 120.0,
  personalaufwand: 45.0,
  abschreibungen: 9.0,
  sonstigerAufwand: 20.0,
  zinsaufwand: 3.2,
  steuersatz: 0.30
}
GUV.ebit = +(GUV.umsatz - GUV.materialaufwand - GUV.personalaufwand - GUV.abschreibungen - GUV.sonstigerAufwand).toFixed(2)
GUV.ebitda = +(GUV.ebit + GUV.abschreibungen).toFixed(2)
GUV.ebt = +(GUV.ebit - GUV.zinsaufwand).toFixed(2)
GUV.steuern = +(GUV.ebt * GUV.steuersatz).toFixed(2)
GUV.jahresueberschuss = +(GUV.ebt - GUV.steuern).toFixed(2)

export const CASHFLOW = {
  operativ: 18.0,
  investition: -10.0
}
CASHFLOW.freeCashflow = +(CASHFLOW.operativ + CASHFLOW.investition).toFixed(2)

// Working-Capital-Tage
export const TAGE = {
  dso: +(BILANZ.forderungen / GUV.umsatz * 365).toFixed(0),
  dio: +(BILANZ.vorraete / GUV.materialaufwand * 365).toFixed(0),
  dpo: +(BILANZ.verbindlLuL / GUV.materialaufwand * 365).toFixed(0)
}
TAGE.ccc = TAGE.dio + TAGE.dso - TAGE.dpo
export const workingCapital = +(BILANZ.umlaufvermoegen - BILANZ.kurzfristFK).toFixed(1)

export const GRUPPEN = [
  { id: 'bilanz', name: 'Vermögens- & Kapitalstruktur', icon: '🏛' },
  { id: 'liquiditaet', name: 'Liquidität', icon: '💧' },
  { id: 'rentabilitaet', name: 'Rentabilität', icon: '📈' },
  { id: 'risk', name: 'Risiko & Stabilität', icon: '🛡' }
]

const p1 = (x) => +x.toFixed(1)
// Kennzahl-Helfer: richtung 'hoch' = höher besser, 'tief' = niedriger besser.
function K(gruppe, name, wert, einheit, formel, ziel, richtung, standard, deutung) {
  return { gruppe, name, wert: p1(wert), einheit, formel, ziel, richtung, standard, deutung }
}

/** Alle Kennzahlen aus der Datenbasis. */
export function kennzahlen() {
  const B = BILANZ, G = GUV, C = CASHFLOW
  const capEmployed = B.eigenkapital + B.langfristFK
  return [
    // --- Vermögens-/Kapitalstruktur ---
    K('bilanz', 'Eigenkapitalquote', B.eigenkapital / B.summe * 100, '%',
      'Eigenkapital ÷ Bilanzsumme', { gut: 30, ok: 20 }, 'hoch', 'HGB',
      'Solides Risikopolster; > 30 % gilt als gut finanziert.'),
    K('bilanz', 'Verschuldungsgrad (Gearing)', B.fremdkapital / B.eigenkapital * 100, '%',
      'Fremdkapital ÷ Eigenkapital', { gut: 150, ok: 200 }, 'tief', 'HGB',
      'Hebel der Kapitalstruktur; niedriger = unabhängiger von Gläubigern.'),
    K('bilanz', 'Anlagendeckung II', (B.eigenkapital + B.langfristFK) / B.anlagevermoegen * 100, '%',
      '(EK + langfr. FK) ÷ Anlagevermögen', { gut: 110, ok: 100 }, 'hoch', 'HGB · Goldene Bilanzregel',
      'Langfristiges Vermögen ist langfristig finanziert (Fristenkongruenz).'),
    K('bilanz', 'Anlagenintensität', B.anlagevermoegen / B.summe * 100, '%',
      'Anlagevermögen ÷ Bilanzsumme', { gut: 50, ok: 60 }, 'tief', 'HGB',
      'Kapitalbindung im Anlagevermögen; beeinflusst die Flexibilität.'),
    K('bilanz', 'Working Capital', workingCapital, 'Mio €',
      'Umlaufvermögen − kurzfristiges FK', { gut: 20, ok: 0 }, 'hoch', 'Working-Capital-Mgmt',
      'Positiver Puffer für das laufende Geschäft.'),

    // --- Liquidität ---
    K('liquiditaet', 'Liquidität 1. Grades', B.liquideMittel / B.kurzfristFK * 100, '%',
      'Liquide Mittel ÷ kurzfr. Verbindlichkeiten', { gut: 20, ok: 10 }, 'hoch', 'HGB',
      'Sofortige Zahlungsfähigkeit (Cash Ratio).'),
    K('liquiditaet', 'Liquidität 2. Grades', (B.liquideMittel + B.forderungen + B.sonstigesUV) / B.kurzfristFK * 100, '%',
      '(Liquide + Forderungen) ÷ kurzfr. FK', { gut: 100, ok: 90 }, 'hoch', 'HGB · Quick Ratio',
      'Quick Ratio; ≥ 100 % deckt kurzfristige Schulden ohne Vorräte.'),
    K('liquiditaet', 'Liquidität 3. Grades', B.umlaufvermoegen / B.kurzfristFK * 100, '%',
      'Umlaufvermögen ÷ kurzfr. FK', { gut: 150, ok: 120 }, 'hoch', 'HGB · Current Ratio',
      'Current Ratio; Spielraum für das Umlaufgeschäft.'),
    K('liquiditaet', 'Cash Conversion Cycle', TAGE.ccc, 'Tage',
      'DIO + DSO − DPO', { gut: 80, ok: 110 }, 'tief', 'Working-Capital-Mgmt',
      `Kapitalbindungsdauer (DIO ${TAGE.dio} + DSO ${TAGE.dso} − DPO ${TAGE.dpo}); kürzer = weniger gebundenes Kapital.`),
    K('liquiditaet', 'Free Cashflow', C.freeCashflow, 'Mio €',
      'operativer CF + Investitions-CF', { gut: 5, ok: 0 }, 'hoch', 'IFRS · IAS 7',
      'Frei verfügbarer Mittelzufluss nach Investitionen.'),

    // --- Rentabilität ---
    K('rentabilitaet', 'Umsatzrendite (netto)', G.jahresueberschuss / G.umsatz * 100, '%',
      'Jahresüberschuss ÷ Umsatz', { gut: 5, ok: 2 }, 'hoch', 'HGB/IFRS',
      'Wie viel vom Umsatz unterm Strich bleibt.'),
    K('rentabilitaet', 'EBIT-Marge', G.ebit / G.umsatz * 100, '%',
      'EBIT ÷ Umsatz', { gut: 8, ok: 4 }, 'hoch', 'IFRS',
      'Operative Marge vor Zinsen & Steuern.'),
    K('rentabilitaet', 'EBITDA-Marge', G.ebitda / G.umsatz * 100, '%',
      'EBITDA ÷ Umsatz', { gut: 12, ok: 7 }, 'hoch', 'IFRS',
      'Operative Ertragskraft vor Abschreibungen.'),
    K('rentabilitaet', 'Eigenkapitalrendite (ROE)', G.jahresueberschuss / B.eigenkapital * 100, '%',
      'Jahresüberschuss ÷ Eigenkapital', { gut: 12, ok: 8 }, 'hoch', 'IFRS',
      'Verzinsung des eingesetzten Eigenkapitals.'),
    K('rentabilitaet', 'Gesamtkapitalrendite (ROA)', (G.ebit) / B.summe * 100, '%',
      'EBIT ÷ Bilanzsumme', { gut: 8, ok: 5 }, 'hoch', 'IFRS',
      'Verzinsung des gesamten eingesetzten Kapitals.'),
    K('rentabilitaet', 'ROCE', G.ebit / capEmployed * 100, '%',
      'EBIT ÷ Capital Employed (EK + langfr. FK)', { gut: 12, ok: 8 }, 'hoch', 'IFRS · Investor-KPI',
      'Verzinsung des langfristig gebundenen Kapitals; > WACC schafft Wert.'),

    // --- Risiko & Stabilität ---
    K('risk', 'Zinsdeckungsgrad', G.ebit / G.zinsaufwand, '×',
      'EBIT ÷ Zinsaufwand', { gut: 5, ok: 3 }, 'hoch', 'Covenant · Risk',
      'Wie oft die Zinsen aus dem operativen Ergebnis verdient werden.'),
    K('risk', 'Dyn. Verschuldungsgrad', B.nettofinanzschulden / G.ebitda, '×',
      'Nettofinanzschulden ÷ EBITDA', { gut: 3, ok: 4 }, 'tief', 'Covenant · IFRS',
      'Jahre zur Schuldentilgung aus dem EBITDA; < 3 gilt als solide.'),
    K('risk', 'Cashflow-Marge', C.operativ / G.umsatz * 100, '%',
      'operativer Cashflow ÷ Umsatz', { gut: 8, ok: 5 }, 'hoch', 'IFRS · IAS 7',
      'Innenfinanzierungskraft aus dem laufenden Geschäft.'),
    K('risk', 'Anlagendeckung I', B.eigenkapital / B.anlagevermoegen * 100, '%',
      'Eigenkapital ÷ Anlagevermögen', { gut: 70, ok: 50 }, 'hoch', 'HGB',
      'Anteil des Anlagevermögens, der durch EK gedeckt ist.')
  ]
}

/** Ampel einer Kennzahl aus Zielband + Richtung. */
export function ampelKennzahl(k) {
  const { wert, ziel, richtung } = k
  if (richtung === 'tief') return wert <= ziel.gut ? 'g' : wert <= ziel.ok ? 'a' : 'r'
  return wert >= ziel.gut ? 'g' : wert >= ziel.ok ? 'a' : 'r'
}

export function kennzahlenGruppe(gruppeId) { return kennzahlen().filter((k) => k.gruppe === gruppeId) }

/** Risiko-Score: Anteil grün/gelb/rot über alle Kennzahlen. */
export function risikoBild() {
  const alle = kennzahlen()
  const z = { g: 0, a: 0, r: 0 }
  alle.forEach((k) => { z[ampelKennzahl(k)]++ })
  return { ...z, total: alle.length }
}
