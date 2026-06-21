// =========================================================================
//  CONTROLLING-STRUKTUR — Teilgebiete des Controllings, nachvollziehbar nach
//  Lehrbuch gegliedert und an die vorhandene KPI-Registry angedockt.
//
//   Gliederung A — nach Funktion (1.2.3):
//     Produktions-, Marketing-/Absatz-, Logistik-, F&E-Controlling
//   Gliederung B — nach Faktoraspekt (1.2.4):
//     Personal-, Investitions-/Anlagen-, Vorratscontrolling
//
//  Je Teilgebiet: Beschreibung, Aufgaben, Instrumente (operativ/strategisch)
//  und zugeordnete Kennzahlen (Referenzen auf KPI.id). Quelle: Controlling-
//  Lehrbuch, Kap. 1.2.3/1.2.4 sowie Instrumente Abb. 1.9 / Abb. 1.10.
// =========================================================================

export const GLIEDERUNGEN = [
  { id: 'funktional', name: 'Nach Funktion', hinweis: 'Teilgebiete entlang der Wertschöpfung (1.2.3)' },
  { id: 'faktor',     name: 'Nach Faktoraspekt', hinweis: 'Teilgebiete nach Produktionsfaktor (1.2.4)' }
]

export const TEILGEBIETE = [
  // ---- Gliederung A: nach Funktion --------------------------------------
  {
    id: 'produktion', name: 'Produktionscontrolling', kurz: 'Produktion',
    gliederung: 'funktional', bereich: 'PR', icon: '🏭',
    beschreibung: 'Steuert die Leistungserstellung. Basis ist die Produktionsdatenbank; sie mündet in das Produktionsplanungs- und Steuerungssystem (PPS) und das Budgetierungssystem.',
    aufgaben: [
      'Angebots- und Auftragsverwaltung',
      'Produktdatenverwaltung (Stücklisten, Arbeitspläne)',
      'Fertigungs- und Auftragsplanung',
      'Fertigungssteuerung',
      'Betriebsdatenerfassung (BDE)',
      'Erzeugnisbewertung / Herstellkostenermittlung'
    ],
    instrumente: {
      operativ: ['PPS-System', 'Betriebsdatenerfassung', 'Plan/Ist-Vergleich Produktion', 'Kapazitätsauslastung', 'Ausschuss-/Nacharbeitsanalyse'],
      strategisch: ['Kapazitätsstrategie', 'Make-or-Buy', 'Standort-/Fertigungstiefe']
    },
    kpis: ['produktionsmenge', 'produktionsplan', 'planErfuellungProduktion', 'kapazitaet', 'kapazitaetsauslastung', 'schichtauslastung', 'auslastung', 'ausschuss', 'firstPassYield', 'nacharbeitsquote', 'herstellkosten', 'herstellkostenJeRad']
  },
  {
    id: 'marketing', name: 'Marketing- und Absatzcontrolling', kurz: 'Marketing/Absatz',
    gliederung: 'funktional', bereich: 'VK', icon: '📣',
    beschreibung: 'Begleitet die Marketingführung und steuert Absatz, Erlöse und Vertriebserfolg. Operativ ergebnis-, strategisch markt- und kundenorientiert.',
    aufgaben: [
      'Absatz- und Erlösplanung',
      'Vertriebserfolgs- und Kundenerfolgsrechnung',
      'Produkt- und Deckungsbeitragsrechnung',
      'Abweichungsanalysen (Deckungsbeitrag/Erlös)',
      'Profitcenter-Ergebnisrechnung',
      'Kommunikations-/Kampagnencontrolling'
    ],
    instrumente: {
      operativ: ['ABC-Analyse', 'Kunden-/Vertriebserfolgsrechnung', 'Deckungsbeitragsrechnung', 'Deckungsbeitrags-/Erlösabweichungsanalyse', 'Profitcenter-Ergebnisrechnung'],
      strategisch: ['Marketing-Informationssystem', 'Kundenresonanzanalyse', 'Portfolioanalyse', 'Konkurrenzanalyse', 'Lebenszyklusanalyse']
    },
    kpis: ['nettoumsatz', 'bruttoumsatz', 'onlineAnteil', 'dbQuote', 'db1', 'retourenquote', 'rabattquote', 'marketingkosten', 'marketingkostenquote', 'roas', 'cac', 'conversionRate', 'neukundenanteil', 'vertriebskosten', 'vertriebskostenquote']
  },
  {
    id: 'logistik', name: 'Logistikcontrolling', kurz: 'Logistik',
    gliederung: 'funktional', bereich: 'LOG', icon: '🚛',
    beschreibung: 'Erfasst und steuert Kosten und Leistungen der gesamten Supply Chain. Ziele: höhere Flexibilität, kürzere Durchlaufzeiten, hohe Lieferbereitschaft bei optimaler Kapitalbindung.',
    aufgaben: [
      'Logistikkosten- und -leistungsrechnung',
      'Steigerung der Lieferbereitschaft/Flexibilität',
      'Reduktion von Durchlauf- und Lieferzeiten',
      'Optimierung von Beständen und Kapitalbindung',
      'Make-or-Buy in der Logistik (Eigen-/Fremdbezug)'
    ],
    instrumente: {
      operativ: ['Logistikkosten-/Leistungsrechnung', 'Lieferbereitschaftsgrad', 'Durchlaufzeitanalyse', 'Bestands-/Reichweitensteuerung'],
      strategisch: ['Supply-Chain-Strategie', 'Netzwerk-/Standortplanung', 'Logistik-Benchmarking']
    },
    kpis: ['liefertreue', 'liefertermintreue', 'lieferfaehigkeit', 'lagerumschlag', 'reichweite', 'ueberbestand', 'lagerbestand']
  },
  {
    id: 'fue', name: 'Forschungs- und Entwicklungscontrolling', kurz: 'F&E',
    gliederung: 'funktional', bereich: 'FUE', icon: '🔬',
    beschreibung: 'Sichert Wirtschaftlichkeit und Rechtmäßigkeit von F&E, koordiniert zwischen Abteilungen und stärkt die Innovationsfähigkeit — wegen langer Bindung und hoher Unsicherheit besonders anspruchsvoll.',
    aufgaben: [
      'Planungs- und Kontrollrechnungen für F&E',
      'Steuerung und Wirtschaftlichkeitssicherung der F&E',
      'Koordination zwischen den beteiligten Bereichen',
      'Sicherung/Steigerung der Innovationsfähigkeit'
    ],
    instrumente: {
      operativ: ['Projekt-/Budgetcontrolling F&E', 'Meilenstein-/Soll-Ist-Kontrolle', 'Entwicklungskostenrechnung'],
      strategisch: ['Innovationsportfolio', 'Technologie-Roadmap', 'Szenario-/Lebenszyklusanalyse']
    },
    kpis: ['fuekosten', 'fueQuote', 'neuproduktumsatzanteil', 'entwicklungsprojekte', 'timeToMarket']
  },

  // ---- Gliederung B: nach Faktoraspekt ----------------------------------
  {
    id: 'personal', name: 'Personalcontrolling', kurz: 'Personal',
    gliederung: 'faktor', bereich: 'HR', icon: '👥',
    beschreibung: 'Instrumente, Daten und Verfahren zur Planung, Steuerung und Kontrolle des Faktors Personal — bei optimalem Personalaufwand (Menge, Zeit, Qualität).',
    aufgaben: [
      'Personalbestands- und -bedarfsanalyse',
      'Personalkosten- und Arbeitszeit-/Fehlzeitenanalyse',
      'Personalentwicklung steuern',
      'Personalrisiken erkennen und begrenzen'
    ],
    instrumente: {
      operativ: ['Personalkostenrechnung', 'Fehlzeiten-/Kapazitätsanalyse', 'Kennzahlen je Mitarbeitergruppe'],
      strategisch: ['Personalbedarfsplanung', 'Nachfolge-/Kompetenzplanung', 'Demografie-/Risikoanalyse']
    },
    kpis: ['mitarbeiterFTE', 'fluktuation', 'krankenstand', 'ueberstundenquote', 'umsatzJeFTE', 'personalkosten', 'personalkostenquote']
  },
  {
    id: 'investition', name: 'Investitions- und Anlagencontrolling', kurz: 'Investition/Anlagen',
    gliederung: 'faktor', bereich: 'FIN', icon: '🏗️',
    beschreibung: 'Initiiert Investitionsentscheidungen, koordiniert Volumen und Planung und überwacht die Wirtschaftlichkeit über den gesamten Lebenszyklus (Investitionskontrolle).',
    aufgaben: [
      'Investitionsentscheidungen initiieren',
      'Investitionsvolumen und -planung koordinieren',
      'Wirtschaftlichkeitsrechnung durchführen',
      'Investitionskontrolle (Soll/Ist über Laufzeit)'
    ],
    instrumente: {
      operativ: ['Soll/Ist je Projekt', 'CapEx-Budgetüberwachung', 'Freigabe-Workflow'],
      strategisch: ['Investitionsrechnung (Kapitalwert, interner Zinsfuß, Annuität)', 'Nutzwertanalyse', 'Amortisations-/Wirtschaftlichkeitsrechnung']
    },
    kpis: ['investitionsvolumen', 'investitionsbudget', 'investBudgettreue', 'roce']
  },
  {
    id: 'vorrat', name: 'Vorratscontrolling', kurz: 'Vorräte',
    gliederung: 'faktor', bereich: 'LOG', icon: '📦',
    beschreibung: 'Steuert Vorräte und Bestände auf ausreichende Produktionsbereitschaft bei minimaler Kapitalbindung — optimale Lagerhaltung und Bestellmengen.',
    aufgaben: [
      'Bestands- und Reichweitensteuerung',
      'Optimale Bestellmengen / Lagerhaltung',
      'Abbau von Überbeständen und Langsamdrehern',
      'Kapitalbindung minimieren'
    ],
    instrumente: {
      operativ: ['ABC-/XYZ-Analyse', 'Reichweiten-/Umschlagsanalyse', 'Bestellmengenoptimierung'],
      strategisch: ['Sortiments-/Bevorratungsstrategie', 'Lieferantenanbindung (VMI/JIT)']
    },
    kpis: ['lagerbestand', 'reichweite', 'lagerumschlag', 'ueberbestand']
  }
]

export const teilgebiet = (id) => TEILGEBIETE.find((t) => t.id === id)

// --- Instrumente-Katalog (Abb. 1.9): dispositive Controlling-Einsatztechniken
export const INSTRUMENTE_KATALOG = [
  { gruppe: 'Operative Analysetechniken', items: ['ABC-Analyse', 'Wertanalyse', 'Kosten-Nutzen-Analyse', 'Break-Even-Analyse', 'Gemeinkostenanalyse', 'Kennzahlen- und Kennzahlensysteme'] },
  { gruppe: 'Strategische Analysetechniken', items: ['Stärken-Schwächen-Analyse', 'Lebenszyklus-Analyse', 'Portfolio-Analyse', 'Gap-Analyse', 'Szenario-Technik'] },
  { gruppe: 'Prognose- und Planungstechniken', items: ['Qualitative Prognoseverfahren (z. B. Delphi)', 'Quantitative Prognoseverfahren (Zeitreihen, kausal)', 'Simulationsmodelle', 'OR-/Optimierungsverfahren', 'EDV-gestützte Planung', 'Budgetierungstechnik', 'Netzplantechnik', 'Entscheidungsbaumverfahren'] },
  { gruppe: 'Kontrolltechniken', items: ['mitlaufende und nachträgliche Kontrolle', 'Eigen- und Fremdkontrolle', 'direkte und indirekte Kontrolle', 'interne und externe Kontrolle', 'Voll- oder Stichprobenkontrolle'] }
]

// --- Management-Rechnungswesen (Abb. 1.10): extern vs. intern
export const RECHNUNGSWESEN = {
  extern: { name: 'Externes Rechnungswesen', items: ['Bilanz', 'Gewinn- und Verlustrechnung', 'Anhang / Lagebericht', 'Kapitalflussrechnung', 'Segmentberichterstattung'] },
  intern: { name: 'Internes Rechnungswesen', items: ['Kostenarten-/-stellen-/-trägerrechnung', 'Deckungsbeitragsrechnung', 'Plan-/Budgetrechnung', 'Investitionsrechnung', 'Wirtschaftlichkeitsrechnung'] }
}
