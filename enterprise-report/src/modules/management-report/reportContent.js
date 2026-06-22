// Redaktioneller Inhalt des Management-Reports (Analysetexte / roter Faden).
// Reine Texte — getrennt von Layout & Zahlen (Zahlen kommen aus der Datenschicht).
export const MGMT_REPORT = {
  titel: 'Konzern · Executive Summary',
  audienz: 'GF & Direktoren',
  kernaussage: 'Das Wachstum ist volumen-, nicht ertragsgetrieben — die Marge ist der Engpass.',
  kpis: ['nettoumsatz', 'ebitda', 'dbQuote', 'wareneinsatzquote', 'lagerbestand'],
  analyse: [
    ['Lagebewertung', 'Die Gruppe wächst zweistellig im Onlinekanal und im Fahrradgeschäft; der Konzernumsatz steigt um 8,1 % auf 52,0 Mio €. Das Ergebnis hält nicht Schritt: EBITDA-Marge 4,0 % und EBIT 1,4 Mio € liegen unter Vorjahr und Branchenniveau. Die Gruppe wächst über Volumen, nicht über Ertrag.'],
    ['Treiber der Ergebnislücke', 'Drei Faktoren erklären die Lücke: eine Wareneinsatzquote von 61,9 % aus Preisdruck im Einkauf und Ausschuss in der Produktion, Erlösschmälerungen von 3,8 Mio € vor allem aus Online-Retouren, und 0,35 Mio € vermeidbare externe Lagerkosten.'],
    ['Risiken', 'Bestände von 11,2 Mio € (64 Tage Reichweite) binden Kapital und verdecken ein Beschaffungsproblem. Hinzu kommen ein Klumpenrisiko bei Antriebskomponenten und das Restwertrisiko der wachsenden Leasingflotte.'],
    ['Empfehlung', 'Fokus des nächsten Quartals auf die zwei Hebel mit dem größten Effekt: Senkung der Wareneinsatzquote (Einkauf & Produktion) und Abbau der Überbestände (Logistik). Beide wirken doppelt — auf Marge und Liquidität.']
  ],
  // Quick Wins / Sofortmaßnahmen mit Bereichszuordnung & Hebel
  quickWins: [
    { t: 'Bestellmengen an Reichweite (40 Tg) koppeln', b: 'Einkauf · Logistik', hebel: 'Bestand', aufwand: 'gering' },
    { t: 'Online-Retouren auf 7 % senken (PIM + Größenberatung)', b: 'Verkauf · IT', hebel: '+0,8 Mio € Netto', aufwand: 'mittel' },
    { t: 'Preisgleitklausel & Zweitquelle Antrieb', b: 'Einkauf', hebel: '+0,5–0,8 Mio € DB', aufwand: 'mittel' },
    { t: 'Externes Reservelager Nord kündigen', b: 'Logistik', hebel: '−0,15 Mio €/J', aufwand: 'gering' },
    { t: 'Ausschuss & Nacharbeit auf Ziel', b: 'Produktion', hebel: 'Wareneinsatz', aufwand: 'mittel' }
  ]
}
