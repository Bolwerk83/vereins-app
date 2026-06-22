// =========================================================================
//  AUFTRAGS-LEBENSZYKLUS (Order-to-Cash) — der Weg vom Angebot bis zum Geld.
//
//   Angebot → Auftrag → Fertigung → Lieferung → Rechnung → Bezahlt
//
//  Zeigt die Pipeline (was steckt wo), die Durchlaufzeiten je Übergang
//  (Ist vs. Ziel) und den Engpass (größte Ziel-Überschreitung).
// =========================================================================

export const PHASEN = [
  { id: 'angebot',   name: 'Angebot',   laie: 'Angebot erstellt, noch nicht beauftragt.' },
  { id: 'auftrag',   name: 'Auftrag',   laie: 'Bestellung liegt vor (Auftragseingang).' },
  { id: 'fertigung', name: 'Fertigung', laie: 'In Produktion / Kommissionierung.' },
  { id: 'lieferung', name: 'Lieferung', laie: 'Versandt bzw. geliefert.' },
  { id: 'rechnung',  name: 'Rechnung',  laie: 'Fakturiert, Zahlung noch offen.' },
  { id: 'zahlung',   name: 'Bezahlt',   laie: 'Zahlung eingegangen — Cash.' }
]
export const phaseInfo = (id) => PHASEN.find((p) => p.id === id)

// Pipeline-Schnappschuss: offene Vorgänge je Phase (Anzahl, Wert Mio €).
export const PIPELINE = [
  { phase: 'angebot',   anzahl: 120, wert: 8.4 },
  { phase: 'auftrag',   anzahl: 64,  wert: 5.2 },
  { phase: 'fertigung', anzahl: 48,  wert: 4.1 },
  { phase: 'lieferung', anzahl: 22,  wert: 1.9 },
  { phase: 'rechnung',  anzahl: 31,  wert: 2.6 },
  { phase: 'zahlung',   anzahl: 540, wert: 46.0 }
]

// Durchlaufzeiten je Übergang (Ø Tage), mit Ziel.
export const DURCHLAUF = [
  { id: 'a2b', von: 'Angebot', nach: 'Auftrag',   ist: 9,  ziel: 7,  hinweis: 'Angebotsbearbeitung & Entscheidung' },
  { id: 'b2c', von: 'Auftrag', nach: 'Fertigung', ist: 3,  ziel: 2,  hinweis: 'Einplanung / Materialbereitstellung' },
  { id: 'c2d', von: 'Fertigung', nach: 'Lieferung', ist: 8, ziel: 7, hinweis: 'Fertigungsdurchlaufzeit' },
  { id: 'd2e', von: 'Lieferung', nach: 'Rechnung', ist: 2,  ziel: 1,  hinweis: 'Fakturalauf' },
  { id: 'e2f', von: 'Rechnung', nach: 'Bezahlt',  ist: 41, ziel: 30, hinweis: 'Zahlungseingang (DSO)' }
]

// Offene Aufträge (Beispielvorgänge) mit aktueller Phase und Alter.
export const VORGAENGE = [
  { nr: 'SO-88231', kunde: 'Stadtwerke Leasing', wert: 0.047, phase: 'fertigung', alter: 11 },
  { nr: 'SO-88245', kunde: 'Velo Schweiz AG',    wert: 0.059, phase: 'lieferung', alter: 6 },
  { nr: 'SO-88260', kunde: 'Stadtflotte NL',     wert: 0.031, phase: 'auftrag',   alter: 3 },
  { nr: 'SO-88277', kunde: 'Radhaus Müller',     wert: 0.012, phase: 'rechnung',  alter: 48 },
  { nr: 'SO-88290', kunde: 'B2B-Händler B',      wert: 0.084, phase: 'angebot',   alter: 14 },
  { nr: 'SO-88301', kunde: 'Filialkette C',      wert: 0.026, phase: 'rechnung',  alter: 63 }
]

// Ampel für Zeiten (tief = gut).
export function zeitAmpel(ist, ziel) {
  if (ist <= ziel) return 'g'
  if (ist <= ziel * 1.2) return 'a'
  return 'r'
}

/** Gesamt-Durchlaufzeit Angebot→Bezahlt (Ist & Ziel). */
export function gesamtDurchlauf() {
  return {
    ist: DURCHLAUF.reduce((n, d) => n + d.ist, 0),
    ziel: DURCHLAUF.reduce((n, d) => n + d.ziel, 0)
  }
}

/** Engpass = Übergang mit den meisten absolut verlorenen Tagen (Hebel). */
export function engpass() {
  return [...DURCHLAUF].sort((a, b) => (b.ist - b.ziel) - (a.ist - a.ziel))[0]
}

/** Kernkennzahlen O2C. */
export function kennzahlen() {
  const g = gesamtDurchlauf()
  const angebote = PIPELINE.find((p) => p.phase === 'angebot')
  const auftraege = PIPELINE.find((p) => p.phase === 'auftrag')
  const auftragsbestand = +(PIPELINE.filter((p) => ['auftrag', 'fertigung', 'lieferung'].includes(p.phase)).reduce((n, p) => n + p.wert, 0)).toFixed(1)
  const offeneForderungen = PIPELINE.find((p) => p.phase === 'rechnung')
  return {
    gesamtIst: g.ist, gesamtZiel: g.ziel,
    auftragsquote: +(auftraege.anzahl / angebote.anzahl * 100).toFixed(0), // Angebot→Auftrag
    dso: DURCHLAUF.find((d) => d.id === 'e2f').ist,
    auftragsbestand,
    offeneForderungen: offeneForderungen.wert
  }
}

/** Status eines Vorgangs (verzögert, wenn Alter die Phasen-Zielzeit klar reißt). */
export function vorgangStatus(v) {
  const grenze = { angebot: 7, auftrag: 2, fertigung: 8, lieferung: 2, rechnung: 30 }[v.phase] || 30
  return v.alter > grenze * 1.2 ? 'verzögert' : 'im Plan'
}
