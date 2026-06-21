// =========================================================================
//  LERNPFAD — modularer Lernweg durch Controlling & Kostenrechnung.
//  Lektionen in Kapiteln, jede erklärt eine Logik/einen Zusammenhang,
//  verlinkt zum Ausprobieren im Tool und ist beliebig wiederholbar.
//  Fortschritt (abgeschlossene Lektionen) in localStorage.
// =========================================================================

export const KAPITEL = [
  { id: 'grundlagen', name: '1 · Grundlagen Controlling' },
  { id: 'klr',        name: '2 · Kosten- & Leistungsrechnung' },
  { id: 'verrechnung', name: '3 · Kostenarten, -stellen, -träger' },
  { id: 'ergebnis',   name: '4 · Ergebnis & Deckungsbeitrag' },
  { id: 'steuerung',  name: '5 · Steuerung & Lebenszyklen' }
]

// Lektion: { id, kapitel, titel, dauer (min), intro, punkte[], merksatz, ziel }
export const LEKTIONEN = [
  // --- Kapitel 1 ---
  { id: 'l-was-controlling', kapitel: 'grundlagen', titel: 'Was ist Controlling?', dauer: 4,
    intro: 'Controlling versorgt die Steuerung des Unternehmens mit Informationen — Planung, Kontrolle und Koordination, damit Entscheidungen auf Zahlen basieren.',
    punkte: ['Planung: Ziele und Budgets setzen', 'Kontrolle: Soll/Ist vergleichen', 'Koordination: Bereiche aufeinander abstimmen', 'Information: die richtige Zahl zur richtigen Zeit'],
    merksatz: 'Controlling ≠ Kontrolle — es ist Steuerung mit Informationen.', ziel: { view: 'controlling', label: 'Controlling-Struktur ansehen' } },
  { id: 'l-teilgebiete', kapitel: 'grundlagen', titel: 'Teilgebiete des Controllings', dauer: 5,
    intro: 'Controlling gliedert sich nach Funktion (Produktion, Marketing, Logistik, F&E) und nach Faktoraspekt (Personal, Investition, Vorräte).',
    punkte: ['Je Teilgebiet eigene Aufgaben und Instrumente', 'Operative vs. strategische Instrumente', 'Jedes Gebiet hat passende Kennzahlen'],
    merksatz: 'Jeder Bereich hat sein eigenes Controlling — mit denselben Grundprinzipien.', ziel: { view: 'controlling', label: 'Teilgebiete erkunden' } },
  // --- Kapitel 2 ---
  { id: 'l-was-kosten', kapitel: 'klr', titel: 'Was sind Kosten?', dauer: 4,
    intro: 'Kosten = bewerteter, leistungsbedingter Güterverbrauch. Erst wenn etwas verbraucht wird, dem Geschäft dient und in Euro bewertet ist, sind es „Kosten".',
    punkte: ['Güterverbrauch (Material, Arbeit, Maschinen)', 'leistungsbedingt (fürs eigentliche Geschäft)', 'bewertet (Menge × Preis)'],
    merksatz: 'Leistung − Kosten = Betriebsergebnis.', ziel: { view: 'klr', label: 'KLR-Grundlagen öffnen' } },
  { id: 'l-abgrenzung', kapitel: 'klr', titel: 'Aufwand ≠ Kosten (Abgrenzung)', dauer: 6,
    intro: 'Nicht jeder Aufwand der Buchhaltung ist ein Kosten der KLR. Neutraler Aufwand fällt raus, kalkulatorische Kosten kommen dazu.',
    punkte: ['Neutral: betriebsfremd, periodenfremd, außerordentlich', 'Grundkosten = aufwandsgleich (Normalfall)', 'Anderskosten = anders bewertet', 'Zusatzkosten = ohne Aufwand'],
    merksatz: 'Kosten = Grundkosten + kalkulatorische Kosten.', ziel: { view: 'klr', label: 'Abgrenzung im Tool' } },
  { id: 'l-kalkulatorik', kapitel: 'klr', titel: 'Kalkulatorische Kosten', dauer: 6,
    intro: 'Kalkulatorische Abschreibung, Zinsen, Wagnisse, Miete und Unternehmerlohn machen das Ergebnis betriebswirtschaftlich „ehrlich".',
    punkte: ['Abschreibung auf Wiederbeschaffungswert', 'Zinsen auf das betriebsnotwendige Kapital', 'Wagnisse planmäßig statt zufällig', 'Unternehmerlohn als Zusatzkosten'],
    merksatz: 'Kalkulatorik zeigt die wahren Kosten — auch ohne Rechnung.', ziel: { view: 'kalkulatorik', label: 'Kalkulatorik aufbauen' } },
  // --- Kapitel 3 ---
  { id: 'l-kostenarten', kapitel: 'verrechnung', titel: 'Kostenartenrechnung', dauer: 5,
    intro: 'Welche Kosten entstehen? Sortiert nach Art, Funktion, fix/variabel, Einzel-/Gemeinkosten.',
    punkte: ['Nach Art: Material, Personal, Abschreibung …', 'fix vs. variabel (Beschäftigung)', 'Einzel- vs. Gemeinkosten (Zurechenbarkeit)'],
    merksatz: 'Das „Was" der Kosten.', ziel: { view: 'kostenarten', label: 'Kostenarten mehrdimensional' } },
  { id: 'l-einzelgemein', kapitel: 'verrechnung', titel: 'Einzel- & Gemeinkosten', dauer: 5,
    intro: 'Einzelkosten sind direkt zurechenbar, Gemeinkosten nur über einen Schlüssel. Daraus folgt die Zuschlagskalkulation.',
    punkte: ['Einzel: Material, Fertigungslohn', 'Gemein: Miete, Verwaltung (echt/unecht)', 'Zuschlagssätze verrechnen Gemeinkosten'],
    merksatz: 'Gemeinkosten brauchen einen Schlüssel.', ziel: { view: 'einzelgemein', label: 'Zuschlagskalkulation' } },
  { id: 'l-bab', kapitel: 'verrechnung', titel: 'Kostenstellen & BAB', dauer: 7,
    intro: 'Wo entstehen die Kosten? Der Betriebsabrechnungsbogen verteilt Gemeinkosten auf Stellen, legt Vorkostenstellen um und liefert Zuschlagssätze.',
    punkte: ['Verteilung über Verteilungsschlüssel', 'Umlage Vor- → Endkostenstellen', 'Zuschlagssatz je Endstelle', 'Plan/Ist je Stelle (Wirtschaftlichkeit)'],
    merksatz: 'Das „Wo" der Kosten.', ziel: { view: 'bab', label: 'BAB der ganzen Firma' } },
  { id: 'l-kostentraeger', kapitel: 'verrechnung', titel: 'Kostenträger & Kalkulation', dauer: 7,
    intro: 'Wofür entstehen die Kosten? Selbstkosten je Produkt — per Division, Äquivalenzziffern oder Zuschlagskalkulation.',
    punkte: ['Division: Kosten ÷ Menge', 'Äquivalenzziffern: Sorten vergleichbar machen', 'Zuschlag: Einzelkosten + Zuschläge', 'Selbstkosten → Produktergebnis'],
    merksatz: 'Das „Wofür" der Kosten.', ziel: { view: 'kalkulation', label: 'Kalkulationsverfahren' } },
  // --- Kapitel 4 ---
  { id: 'l-ergebnis', kapitel: 'ergebnis', titel: 'Ergebnisrechnung (GKV)', dauer: 6,
    intro: 'Erträge − Aufwendungen = Betriebsergebnis. Als Staffel und als Ergebniskonto (T-Konto).',
    punkte: ['Gesamtkostenverfahren', 'T-Konto: Soll/Haben, Saldo gleicht aus', 'Gewinn steht im Soll'],
    merksatz: 'Das Ergebniskonto fasst alles zusammen.', ziel: { view: 'ergebnis', label: 'Ergebniskonto ansehen' } },
  { id: 'l-deckungsbeitrag', kapitel: 'ergebnis', titel: 'Deckungsbeitrag & Teilkosten', dauer: 7,
    intro: 'Teilkostensicht: Umsatz − variable Kosten = Deckungsbeitrag, der die Fixkosten deckt. Mehrstufig nach Produkt/Bereich.',
    punkte: ['Direct Costing (einstufig)', 'Stufenweise Fixkostendeckung', 'Voll- vs. Teilkostensysteme'],
    merksatz: 'Der DB deckt zuerst die Fixkosten, dann kommt der Gewinn.', ziel: { view: 'deckungsbeitrag', label: 'DB-Rechnung öffnen' } },
  // --- Kapitel 5 ---
  { id: 'l-lebenszyklus', kapitel: 'steuerung', titel: 'Lebenszyklus & Portfolio', dauer: 5,
    intro: 'Produkte und Kunden durchlaufen Phasen. Je Phase gibt es eine passende Strategie.',
    punkte: ['Produkt: Einführung→Wachstum→Reife→Rückgang', 'Kunde: Akquise→Bestand→gefährdet', 'Normstrategie je Phase'],
    merksatz: 'Die richtige Strategie hängt von der Phase ab.', ziel: { view: 'lebenszyklus', label: 'Lebenszyklus öffnen' } },
  { id: 'l-o2c', kapitel: 'steuerung', titel: 'Order-to-Cash & Engpässe', dauer: 5,
    intro: 'Der Auftrag fließt vom Angebot bis zum Geld. Durchlaufzeiten zeigen den Engpass.',
    punkte: ['Angebot → Auftrag → … → Bezahlt', 'DSO als typischer Engpass', 'Jeder Tag weniger = Liquidität frei'],
    merksatz: 'Cash kommt erst am Ende des Prozesses.', ziel: { view: 'auftrag', label: 'Order-to-Cash öffnen' } },
  { id: 'l-massnahmen', kapitel: 'steuerung', titel: 'Von der Abweichung zur Maßnahme', dauer: 4,
    intro: 'Abweichungen und Differenzen werden zu konkreten Maßnahmen mit Verantwortlichem und Frist.',
    punkte: ['Abstimmbrücken zeigen Differenzen', 'Maßnahme mit Owner/Frist', 'Nachverfolgung bis erledigt'],
    merksatz: 'Controlling endet nicht beim Bericht, sondern bei der Maßnahme.', ziel: { view: 'massnahmen', label: 'Maßnahmen öffnen' } }
]

export const lektionenVon = (kapitelId) => LEKTIONEN.filter((l) => l.kapitel === kapitelId)

const KEY = 'er_lernpfad'
function ladeStatus() { try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')) } catch { return new Set() } }
function speichere(set) { localStorage.setItem(KEY, JSON.stringify([...set])) }

export const istAbgeschlossen = (id) => ladeStatus().has(id)
export function markiere(id, fertig = true) {
  const s = ladeStatus(); fertig ? s.add(id) : s.delete(id); speichere(s); return s
}
export function fortschritt() {
  const s = ladeStatus()
  const fertig = LEKTIONEN.filter((l) => s.has(l.id)).length
  return { fertig, gesamt: LEKTIONEN.length, prozent: Math.round(fertig / LEKTIONEN.length * 100) }
}
