// =========================================================================
//  KOSTEN- UND LEISTUNGSRECHNUNG (KLR) — Modell nach Lehrbuch (Kap. 2.2),
//  laienverständlich erklärt und an die vorhandenen Datensätze/KPIs angedockt.
//
//  Grundgedanke (für Nicht-Kaufleute):
//    Kosten   = bewerteter, leistungsbedingter Güterverbrauch (Menge × Preis)
//    Leistung = bewertetes Ergebnis der betrieblichen Tätigkeit
//    Ergebnis = Leistung − Kosten  (kalkulatorisches Betriebsergebnis)
//
//  Modulschema (Abb. 2.3):
//    Kostenartenrechnung -> Kostenstellenrechnung -> Kostenträgerrechnung
//      (Stückrechnung = Selbstkosten/Kalkulation, Zeitrechnung = Erfolg)
//    + Leistungsrechnung  =>  kalkulatorisches Ergebnis (Betriebsergebnis)
// =========================================================================

// Was sind „Kosten"? — die drei Bedingungen (Kap. 2.2.3), einfach erklärt.
export const KOSTEN_BEGRIFF = [
  { titel: 'Güterverbrauch', laie: 'Es wird etwas verbraucht — Material, Arbeitszeit, Maschinennutzung.' },
  { titel: 'leistungsbedingt', laie: 'Der Verbrauch dient dem eigentlichen Geschäft (Produkte/Leistungen herstellen) — nicht privat oder betriebsfremd.' },
  { titel: 'bewertet', laie: 'Der Verbrauch wird in Euro bewertet: Menge × Preis. Erst dann sind es „Kosten".' }
]

// Abgrenzung Aufwand ↔ Kosten (Kap. 2.3) — warum GuV-Aufwand ≠ Kosten ist.
//   Aufwand   = neutraler Aufwand + Zweckaufwand(= Grundkosten)
//   Kosten    = Grundkosten + kalkulatorische Kosten (Anders- + Zusatzkosten)
export const ABGRENZUNG = {
  einleitung: 'Nicht jeder Aufwand aus der Buchhaltung (GuV) ist ein „Kosten" der KLR — und nicht jede Kostenart hat einen Aufwand. Die Abgrenzung trennt das sauber, damit das Betriebsergebnis das echte operative Geschäft zeigt.',
  // Aufwandsseite: was fällt RAUS (neutral), was ist zugleich Kosten (Grund).
  aufwand: [
    { id: 'neutral', name: 'Neutraler Aufwand', kosten: false,
      laie: 'Aufwand, der NICHT zu den Kosten zählt — fällt für die KLR heraus.',
      arten: [
        { name: 'betriebsfremd', laie: 'Hat nichts mit dem eigentlichen Geschäft zu tun (z. B. Spende, Kursverlust auf Wertpapiere).' },
        { name: 'periodenfremd', laie: 'Gehört in eine andere Periode (z. B. Steuernachzahlung fürs Vorjahr).' },
        { name: 'außerordentlich', laie: 'Einmalig/ungewöhnlich (z. B. Schaden, Verlust aus Anlagenabgang).' }
      ] },
    { id: 'grund', name: 'Zweckaufwand = Grundkosten', kosten: true,
      laie: 'Aufwand, der zugleich Kosten ist — der Normalfall („aufwandsgleiche Kosten").', arten: [] }
  ],
  // Kostenseite: Kosten ohne (gleichen) Aufwand = kalkulatorische Kosten.
  kalkulatorisch: [
    { id: 'anders', name: 'Anderskosten', laie: 'Es gibt zwar Aufwand, aber die KLR bewertet ihn ANDERS.',
      beispiele: ['Kalkulatorische Abschreibungen (Wiederbeschaffungswert statt Anschaffung)', 'Kalkulatorische Zinsen auf das Eigenkapital', 'Kalkulatorische Wagnisse'] },
    { id: 'zusatz', name: 'Zusatzkosten', laie: 'Es gibt GAR keinen Aufwand gegenüber — nur in der KLR angesetzt.',
      beispiele: ['Kalkulatorischer Unternehmerlohn', 'Kalkulatorische Miete für eigene Räume'] }
  ],
  // Ergebnis-/Leistungsseite analog (kurz).
  leistung: 'Spiegelbildlich beim Ertrag: neutraler Ertrag (betriebsfremd/periodenfremd/außerordentlich) zählt nicht zur Leistung; Zweckertrag = Grundleistung, dazu kalkulatorische (Anders-/Zusatz-)Leistungen.',
  datensatz: { kind: 'detail', key: 'abgrenzungsrechnung' }
}

// Kostenarten nach Art des verbrauchten Guts (Kap. 2.2.3).
export const KOSTENARTEN = [
  { id: 'stoff',    name: 'Stoffkosten',        laie: 'Material und Rohstoffe, die ins Produkt gehen.' },
  { id: 'arbeit',   name: 'Arbeitskosten',      laie: 'Löhne und Gehälter für geleistete Arbeit.' },
  { id: 'fremd',    name: 'Fremddienste/-rechte', laie: 'Zugekaufte Leistungen und Lizenzen (z. B. Logistik, Software).' },
  { id: 'abschr',   name: 'Abschreibungen',     laie: 'Wertverzehr von Maschinen/Anlagen über die Nutzungsdauer.' },
  { id: 'wagnis',   name: 'Wagniskosten',       laie: 'Kalkulatorische Risiken (Ausschuss, Garantie, Forderungsausfall).' },
  { id: 'zins',     name: 'Zinskosten',         laie: 'Kosten für das eingesetzte Kapital (Zinsen).' },
  { id: 'kapital',  name: 'Steuern/Gebühren/Beiträge', laie: 'Sonstige betriebsbedingte Abgaben.' }
]

// Aufgaben der KLR (Kap. 2.2.2) — und wo man sie im Reporting wiederfindet.
export const AUFGABEN = [
  { aufgabe: 'Güterverzehre erfassen', erklaerung: 'Welche Kosten sind angefallen?', modul: 'kostenarten' },
  { aufgabe: 'Erstellte Leistungen erfassen', erklaerung: 'Welche Leistungen wurden erbracht?', modul: 'leistung' },
  { aufgabe: 'Verursachungsgerecht zurechnen', erklaerung: 'Wo (Stelle) und wofür (Träger) sind die Kosten entstanden?', modul: 'kostenstellen' }
]

// Wozu dient die Kostenrechnung? (Einsatzgebiete, Kap. 2.2.2) — einfach erklärt.
export const ZWECKE = [
  { titel: 'Erfolg ermitteln', laie: 'Kurzfristig (z. B. monatlich) sehen, ob sich das Geschäft rechnet.' },
  { titel: 'Wirtschaftlichkeit kontrollieren', laie: 'Soll/Ist vergleichen: Wo wird zu viel ausgegeben?' },
  { titel: 'Preise festlegen', laie: 'Preisuntergrenzen und Angebote sauber kalkulieren.' },
  { titel: 'Programm entscheiden', laie: 'Welche Produkte lohnen sich, welche nicht?' },
  { titel: 'Bestände bewerten', laie: 'Lager und Halbfertiges korrekt mit Kosten bewerten.' }
]

// Module/Stufen der KLR (Abb. 2.3) — die Reporting-Stationen.
export const STUFEN = [
  {
    id: 'kostenarten', nr: 1, name: 'Kostenartenrechnung', frage: 'Welche Kosten entstehen?',
    laie: 'Sortiert alle Kosten nach Art — Material, Personal, Abschreibungen, Fremdleistungen. Das „Was".',
    datensatz: { kind: 'detail', key: 'kostenarten' },
    kpis: ['gesamtkosten', 'herstellkosten', 'gemeinkosten', 'personalkosten', 'wareneinsatz', 'gemeinkostenquote']
  },
  {
    id: 'kostenstellen', nr: 2, name: 'Kostenstellenrechnung', frage: 'Wo entstehen die Kosten?',
    laie: 'Verteilt die Kosten auf Bereiche/Abteilungen (Betriebsabrechnungsbogen, BAB). Das „Wo".',
    datensatz: { kind: 'detail', key: 'kostenstellen' },
    kpis: ['gemeinkostenquote', 'kostendisziplin', 'kapazitaetsauslastung']
  },
  {
    id: 'kostentraeger', nr: 3, name: 'Kostenträgerrechnung', frage: 'Wofür entstehen die Kosten?',
    laie: 'Rechnet die Kosten auf Produkte/Aufträge. Stückrechnung = Selbstkosten je Stück (Kalkulation), Zeitrechnung = Erfolg je Periode. Das „Wofür".',
    untermodule: [
      { name: 'Kostenträgerstückrechnung', laie: 'Was kostet ein Stück? (Kalkulation, Selbstkosten)' },
      { name: 'Kostenträgerzeitrechnung', laie: 'Welchen Erfolg bringt ein Produkt je Periode?' }
    ],
    datensatz: { kind: 'perspektive', key: 'klr_produkt' },
    kpis: ['db1', 'dbQuote', 'herstellkostenJeRad', 'wareneinsatzquote']
  },
  {
    id: 'leistung', nr: 4, name: 'Leistungsrechnung', frage: 'Welche Leistungen entstehen?',
    laie: 'Erfasst und bewertet, was das Unternehmen hervorbringt (Umsatz, produzierte Menge). Das „Gegenstück" zu den Kosten.',
    datensatz: { kind: 'detail', key: 'kanaele' },
    kpis: ['nettoumsatz', 'bruttoumsatz', 'produktionsmenge']
  },
  {
    id: 'ergebnis', nr: 5, name: 'Kalkulatorisches Ergebnis', frage: 'Was bleibt übrig?',
    laie: 'Leistung minus Kosten = Betriebsergebnis. Zeigt, ob das operative Geschäft verdient.',
    datensatz: { kind: 'detail', key: 'guv' },
    kpis: ['db1', 'ebitda', 'ebit', 'betrieblichesErgebnis']
  }
]

export const stufe = (id) => STUFEN.find((s) => s.id === id)
