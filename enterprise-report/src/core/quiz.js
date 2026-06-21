// =========================================================================
//  WISSENS-CHECK / QUIZ — kleine Verständnisfragen je Lektion des Lernpfads.
//  Reine Logik hier (testbar); Status der bestandenen Checks in localStorage.
// =========================================================================

// QUIZ[lektionId] = [{ frage, optionen[], richtig (Index), erklaerung }]
export const QUIZ = {
  'l-was-controlling': [
    { frage: 'Was beschreibt Controlling am besten?', optionen: ['Kontrolle der Mitarbeiter', 'Steuerung mit Informationen', 'Die Buchhaltung'], richtig: 1,
      erklaerung: 'Controlling kommt von „to control" = steuern: es liefert Informationen für Entscheidungen.' }
  ],
  'l-teilgebiete': [
    { frage: 'Wonach lässt sich Controlling gliedern?', optionen: ['Nur nach Abteilungen', 'Nach Funktion und Faktoraspekt', 'Nur nach Monaten'], richtig: 1,
      erklaerung: 'Z. B. funktional (Produktion, Marketing) und nach Faktoren (Personal, Investition, Vorräte).' }
  ],
  'l-was-kosten': [
    { frage: 'Was sind Kosten?', optionen: ['Jede Auszahlung', 'Bewerteter, leistungsbedingter Güterverbrauch', 'Nur Materialeinkäufe'], richtig: 1,
      erklaerung: 'Verbrauch, fürs Geschäft, in Euro bewertet — erst dann sind es Kosten.' }
  ],
  'l-abgrenzung': [
    { frage: 'Welcher Aufwand zählt NICHT zu den Kosten?', optionen: ['Materialaufwand', 'Spende an einen Verein (betriebsfremd)', 'Fertigungslöhne'], richtig: 1,
      erklaerung: 'Betriebsfremder Aufwand ist neutral und wird abgegrenzt — er ist kein Kosten der KLR.' }
  ],
  'l-kalkulatorik': [
    { frage: 'Worauf wird die kalkulatorische Abschreibung gerechnet?', optionen: ['Anschaffungswert', 'Wiederbeschaffungswert', 'Restbuchwert'], richtig: 1,
      erklaerung: 'Kalkulatorisch wird auf den Wiederbeschaffungswert abgeschrieben — substanzerhaltend.' }
  ],
  'l-kostenarten': [
    { frage: 'Was unterscheidet Einzel- von Gemeinkosten?', optionen: ['Die Höhe', 'Die direkte Zurechenbarkeit zum Produkt', 'Ob sie fix sind'], richtig: 1,
      erklaerung: 'Einzelkosten sind direkt zurechenbar, Gemeinkosten nur über einen Schlüssel.' }
  ],
  'l-einzelgemein': [
    { frage: 'Wie werden Gemeinkosten auf Produkte verrechnet?', optionen: ['Gleichmäßig pro Stück', 'Über Zuschlagssätze', 'Gar nicht'], richtig: 1,
      erklaerung: 'Zuschlagssätze verteilen Gemeinkosten anteilig auf die Einzelkosten.' }
  ],
  'l-bab': [
    { frage: 'Was liefert der BAB am Ende für die Kalkulation?', optionen: ['Den Verkaufspreis', 'Zuschlagssätze je Endkostenstelle', 'Die Bilanz'], richtig: 1,
      erklaerung: 'Aus dem BAB ergeben sich die Zuschlagssätze für die Zuschlagskalkulation.' }
  ],
  'l-kostentraeger': [
    { frage: 'Wann passt die Divisionskalkulation?', optionen: ['Bei sehr vielen verschiedenen Produkten', 'Bei einem einzigen, gleichartigen Produkt', 'Bei Kuppelproduktion'], richtig: 1,
      erklaerung: 'Division = Gesamtkosten ÷ Menge — ideal im Einproduktbetrieb.' }
  ],
  'l-ergebnis': [
    { frage: 'Wo steht der Gewinn im Ergebniskonto (T-Konto)?', optionen: ['Im Haben', 'Im Soll (als Saldo)', 'Gar nicht'], richtig: 1,
      erklaerung: 'Bei Gewinn steht der Saldo im Soll, damit beide Seiten gleich groß sind.' }
  ],
  'l-deckungsbeitrag': [
    { frage: 'Wie berechnet sich der Deckungsbeitrag?', optionen: ['Umsatz − Fixkosten', 'Umsatz − variable Kosten', 'Umsatz − Steuern'], richtig: 1,
      erklaerung: 'DB = Umsatz − variable Kosten; er deckt zuerst die Fixkosten.' }
  ],
  'l-lebenszyklus': [
    { frage: 'Was bestimmt die passende Produktstrategie?', optionen: ['Der Preis', 'Die Lebenszyklus-Phase', 'Die Farbe'], richtig: 1,
      erklaerung: 'Einführung, Wachstum, Reife, Rückgang — je Phase eine Normstrategie.' }
  ],
  'l-o2c': [
    { frage: 'Wann fließt im Order-to-Cash das Geld?', optionen: ['Beim Angebot', 'Erst am Ende (nach Zahlung)', 'Bei Auftragseingang'], richtig: 1,
      erklaerung: 'Cash kommt zuletzt — deshalb ist die DSO ein typischer Engpass.' }
  ],
  'l-massnahmen': [
    { frage: 'Wo endet gutes Controlling?', optionen: ['Beim Bericht', 'Bei der umgesetzten Maßnahme', 'Bei der Zahl'], richtig: 1,
      erklaerung: 'Aus Abweichungen werden Maßnahmen mit Owner und Frist — bis erledigt.' }
  ]
}

export const quizVon = (lektionId) => QUIZ[lektionId] || []
export const hatQuiz = (lektionId) => quizVon(lektionId).length > 0

export function bewerte(frage, antwortIndex) {
  return !!frage && antwortIndex === frage.richtig
}

/** Ergebnis eines Lektions-Quiz aus den gegebenen Antworten (Index-Array). */
export function quizErgebnis(lektionId, antworten = []) {
  const fragen = quizVon(lektionId)
  const richtig = fragen.reduce((n, f, i) => n + (antworten[i] === f.richtig ? 1 : 0), 0)
  return { richtig, gesamt: fragen.length, bestanden: fragen.length > 0 && richtig === fragen.length }
}

const KEY = 'er_quiz'
function ladeBestanden() { try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')) } catch { return new Set() } }
function speichere(set) { localStorage.setItem(KEY, JSON.stringify([...set])) }

export const quizBestanden = (lektionId) => ladeBestanden().has(lektionId)
export function markiereQuiz(lektionId, bestanden = true) {
  const s = ladeBestanden(); bestanden ? s.add(lektionId) : s.delete(lektionId); speichere(s); return s
}

/** Gesamtfortschritt über alle verfügbaren Wissens-Checks. */
export function quizFortschritt() {
  const s = ladeBestanden()
  const ids = Object.keys(QUIZ)
  const fertig = ids.filter((id) => s.has(id)).length
  return { fertig, gesamt: ids.length, prozent: ids.length ? Math.round(fertig / ids.length * 100) : 0 }
}
