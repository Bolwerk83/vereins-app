// =========================================================================
//  KAUSALMODELL — Wirkungsketten für die Was-wäre-wenn-Simulation.
//
//  WICHTIG: rein DELTA-basiert. Jede Kante berechnet den NEUEN Wert einer
//  Ziel-Kennzahl als Basiswert + (Änderung des Treibers · Wirkung). Dadurch
//  bleiben die angezeigten Ist-Werte der App vollkommen unangetastet — das
//  Modell wirkt ausschließlich in der Simulation. Buchhalterische Identitäten
//  (z. B. EBIT = Nettoumsatz − Gesamtkosten) sind exakt; verhaltensbasierte
//  Kanten (z. B. Retouren → Erlösschmälerung) sind dokumentierte Annahmen.
//
//  Die abgeleiteten Quoten/Ratios (DB-Quote, Zielerreichungen, ROCE-naher
//  Kram …) rechnet bereits der berechne()-Graph der KPI-Registry nach; hier
//  stehen nur die Verkettungen ZWISCHEN den Roh-Kennzahlen.
//
//  Kante: { id, von:[treiber…], f:(sim, basis)=>neuerWert, erklaerung }
// =========================================================================
export const KAUSAL = [
  // --- Umsatz-/Erlöskette ------------------------------------------------
  {
    id: 'erloesschmaelerung', von: ['retourenquote'],
    f: (s, b) => b.erloesschmaelerung + (s.retourenquote - b.retourenquote) / 100 * ((b.bruttoumsatz || 0) * ((b.onlineAnteil || 0) / 100)),
    erklaerung: 'Mehr Retouren erhöhen die Erlösschmälerung (bezogen auf den Online-Umsatz).',
  },
  {
    id: 'nettoumsatz', von: ['erloesschmaelerung'],
    f: (s, b) => b.nettoumsatz - (s.erloesschmaelerung - b.erloesschmaelerung),
    erklaerung: 'Nettoumsatz = Bruttoumsatz − Erlösschmälerung.',
  },
  // --- Kosten-/Ergebniskette --------------------------------------------
  {
    id: 'gesamtkosten', von: ['wareneinsatz', 'gemeinkosten'],
    f: (s, b) => b.gesamtkosten + (s.wareneinsatz - b.wareneinsatz) + (s.gemeinkosten - b.gemeinkosten),
    erklaerung: 'Wareneinsatz und Gemeinkosten sind Bestandteile der Gesamtkosten.',
  },
  {
    id: 'ebit', von: ['nettoumsatz', 'gesamtkosten'],
    f: (s, b) => b.ebit + (s.nettoumsatz - b.nettoumsatz) - (s.gesamtkosten - b.gesamtkosten),
    erklaerung: 'EBIT = Nettoumsatz − Gesamtkosten.',
  },
  {
    id: 'ebitda', von: ['ebit'],
    f: (s, b) => b.ebitda + (s.ebit - b.ebit),
    erklaerung: 'EBITDA bewegt sich mit dem EBIT (Abschreibungen konstant gehalten).',
  },
  {
    id: 'handelsrechtlichesErgebnis', von: ['ebit', 'neutralesErgebnis'],
    f: (s, b) => b.handelsrechtlichesErgebnis + (s.ebit - b.ebit) + (s.neutralesErgebnis - b.neutralesErgebnis),
    erklaerung: 'HGB-Ergebnis = EBIT + neutrales Ergebnis.',
  },
  {
    id: 'operativerCashflow', von: ['ebit'],
    f: (s, b) => b.operativerCashflow + 0.7 * (s.ebit - b.ebit),
    erklaerung: 'Rund 70 % einer Ergebnisänderung schlagen in den operativen Cashflow durch.',
  },
  {
    id: 'roce', von: ['ebit'],
    f: (s, b) => b.roce + (s.ebit - b.ebit) * 100 / (b.bilanzsumme || 1),
    erklaerung: 'ROCE = EBIT bezogen auf das eingesetzte Kapital (≈ Bilanzsumme).',
  },
  // --- Working Capital ---------------------------------------------------
  {
    id: 'offeneForderungen', von: ['dso'],
    f: (s, b) => b.offeneForderungen + (s.dso - b.dso) * ((b.nettoumsatz || 0) / 365),
    erklaerung: 'Jeder zusätzliche DSO-Tag bindet rund einen Tagesumsatz in Forderungen.',
  },
  {
    id: 'ueberfaelligeForderungen', von: ['offeneForderungen'],
    f: (s, b) => b.ueberfaelligeForderungen * (s.offeneForderungen / (b.offeneForderungen || 1)),
    erklaerung: 'Überfällige Forderungen bewegen sich proportional zum offenen Bestand.',
  },
  {
    id: 'cashConversion', von: ['dso'],
    f: (s, b) => b.cashConversion + (s.dso - b.dso),
    erklaerung: 'Eine kürzere Forderungslaufzeit verkürzt den Cash-Conversion-Cycle Tag für Tag.',
  },
]
