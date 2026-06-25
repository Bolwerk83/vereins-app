// =========================================================================
//  BCG-PORTFOLIOS — mehrere Boston-Consulting-Matrizen über verschiedene
//  Objekte (Produkte, Kunden, Kanäle, Regionen, Lieferanten).
//
//  Achsen je Portfolio: x = Wachstum/Dynamik, y = Attraktivität (DB/Marge bzw.
//  Performance), Blasengröße = Volumen (Umsatz/Beschaffung). Die vier Felder
//  (Stars / Cash Cows / Question Marks / Poor Dogs) werden über die generische
//  Logik in lebenszyklus.js (bcgFelder/quadrantVon) berechnet — hier kommen nur
//  die Daten, die Achsenbeschriftung und die fachliche Lesart/Mehrwert dazu.
//
//  Damit dieselbe Quadranten-Logik greift, tragen alle Objekte die Felder
//  `wachstum` (x) und `db` (y); was sie inhaltlich bedeuten, sagt das Label.
// =========================================================================
import { bcgFelder, quadrantVon, kunden, produkte } from './lebenszyklus.js'

const KANAELE = [
  { id: 'k-online',  name: 'Onlineshop (Privat)', umsatz: 23.4, wachstum: 8,   db: 39 },
  { id: 'k-b2b',     name: 'B2B-Fachhandel',      umsatz: 12.0, wachstum: 4,   db: 30 },
  { id: 'k-leasing', name: 'Dienstrad-Leasing',   umsatz: 9.0,  wachstum: 22,  db: 32 },
  { id: 'k-export',  name: 'Export / Flotten',    umsatz: 5.0,  wachstum: 18,  db: 34 },
  { id: 'k-filiale', name: 'Stationär / Filiale',  umsatz: 7.0,  wachstum: -3,  db: 28 },
  { id: 'k-direkt',  name: 'Werks-/Direktverkauf', umsatz: 1.5,  wachstum: -18, db: 26 }
]

const REGIONEN = [
  { id: 'r-de',  name: 'Deutschland',  umsatz: 38.0, wachstum: 5,   db: 35 },
  { id: 'r-ch',  name: 'Schweiz',      umsatz: 9.0,  wachstum: 2,   db: 41 },
  { id: 'r-at',  name: 'Österreich',   umsatz: 6.0,  wachstum: 7,   db: 34 },
  { id: 'r-nl',  name: 'Niederlande',  umsatz: 5.0,  wachstum: 20,  db: 33 },
  { id: 'r-sca', name: 'Skandinavien', umsatz: 3.5,  wachstum: 25,  db: 31 },
  { id: 'r-fr',  name: 'Frankreich',   umsatz: 2.5,  wachstum: -8,  db: 28 }
]

// Lieferanten: x = Volumenentwicklung, y = Performance-Score (Qualität/Termin),
// Blase = Beschaffungsvolumen.
const LIEFERANTEN = [
  { id: 'l-antrieb', name: 'AntriebsTechnik AG', umsatz: 14.0, wachstum: 6,   db: 88 },
  { id: 'l-rahmen',  name: 'AluFrame GmbH',      umsatz: 9.0,  wachstum: 3,   db: 72 },
  { id: 'l-akku',    name: 'PowerCell Energy',   umsatz: 7.0,  wachstum: 15,  db: 80 },
  { id: 'l-schalt',  name: 'ShiftPro Components', umsatz: 5.0, wachstum: -4,  db: 64 },
  { id: 'l-bremse',  name: 'StopTech Brakes',    umsatz: 3.0,  wachstum: 2,   db: 90 },
  { id: 'l-reifen',  name: 'RollerRubber',       umsatz: 2.0,  wachstum: -10, db: 56 }
]

// Registry der Portfolios. `objekte` ist eine Funktion (Stammdaten ggf. abgeleitet).
const REGISTRY = [
  {
    id: 'produkte', titel: 'Produktgruppen-Portfolio', kurz: 'Produktgruppen',
    xLabel: 'Wachstum %', yLabel: 'Deckungsbeitrag %', blase: 'Umsatz (Mio €)',
    objekte: () => produkte('produkt'),
    mehrwert: 'Zeigt das gesamte Sortiment auf einen Blick: wohin Investitionen lenken, was den Cashflow trägt und was bereinigt gehört. Verhindert das „Gießkannen-Prinzip" über alle Produkte.',
    fragen: ['Welche Produktgruppen tragen heute den Gewinn (Cash Cows)?', 'Welche Wachstumsträger brauchen jetzt Kapazität (Stars)?', 'Welche Question Marks lohnen gezielte Investition – und welche nicht?', 'Wo droht Wertvernichtung (Poor Dogs)?'],
    quadrant: {
      star: 'Wachstumsträger – Kapazität & Vertrieb ausbauen, Marktführerschaft sichern.',
      cashcow: 'Ertragsbringer – Cash abschöpfen, Effizienz halten, überschaubar investieren.',
      question: 'Nachwuchs – selektiv fördern: Marge entwickeln oder konsequent einstellen.',
      dog: 'Auslaufkandidaten – Komplexität & Kapital prüfen, Abverkauf/Nachfolge.'
    }
  },
  {
    id: 'kunden', titel: 'Kunden-Portfolio', kurz: 'Kunden',
    xLabel: 'Wachstum %', yLabel: 'Deckungsbeitrag %', blase: 'Umsatz (Mio €)',
    objekte: () => kunden(),
    mehrwert: 'Steuert die Vertriebsenergie: Welche Kunden bekommen Ausbau-Betreuung, welche werden effizient gepflegt, welche entwickelt und bei welchen lohnt der Aufwand nicht mehr. Macht „Lieblingskunden nach Bauchgefühl" überflüssig.',
    fragen: ['Bei welchen Kunden investieren wir aktiv in Wachstum (Stars)?', 'Welche Stammkunden tragen die Marge und müssen gehalten werden (Cash Cows)?', 'Welche kleinen Wachstumskunden haben Potenzial (Question Marks)?', 'Welche Kunden kosten mehr als sie bringen (Poor Dogs)?'],
    quadrant: {
      star: 'Schlüsselkunden mit Dynamik – aktiv betreuen, Cross-/Up-Selling, Rahmenverträge.',
      cashcow: 'Stabile Ertragskunden – binden, Servicequalität sichern, Konditionen pflegen.',
      question: 'Entwicklungskunden – Potenzial heben, Bedarf analysieren, gezielt ausbauen.',
      dog: 'Aufwand-Kunden – Betreuungskosten/Konditionen prüfen, ggf. auf Self-Service.'
    }
  },
  {
    id: 'kanaele', titel: 'Vertriebskanal-Portfolio', kurz: 'Kanäle',
    xLabel: 'Wachstum %', yLabel: 'Deckungsbeitrag %', blase: 'Umsatz (Mio €)',
    objekte: () => KANAELE,
    mehrwert: 'Lenkt Marketing- und Vertriebsbudget auf die Kanäle mit dem besten Wachstums-Margen-Mix statt nach Umsatz allein. Zeigt, welche Kanäle skalieren und welche teuer und rückläufig sind.',
    fragen: ['Welcher Kanal verdient zusätzliches Budget (Star)?', 'Welcher Kanal finanziert das Geschäft (Cash Cow)?', 'Welcher neue Kanal ist eine Wette wert (Question Mark)?', 'Welcher Kanal lohnt den Aufwand nicht mehr (Poor Dog)?'],
    quadrant: {
      star: 'Skalieren – Budget & Kapazität rein, Reichweite und Conversion ausbauen.',
      cashcow: 'Melken – effizient betreiben, Marge sichern, nicht überinvestieren.',
      question: 'Testen – gezielt ausbauen oder mit klarem Kriterium wieder einstellen.',
      dog: 'Hinterfragen – Kosten senken, bündeln oder geordnet zurückfahren.'
    }
  },
  {
    id: 'regionen', titel: 'Regionen-/Markt-Portfolio', kurz: 'Regionen',
    xLabel: 'Wachstum %', yLabel: 'Deckungsbeitrag %', blase: 'Umsatz (Mio €)',
    objekte: () => REGIONEN,
    mehrwert: 'Priorisiert Expansion vs. Konsolidierung geografisch: wo sich Markteintritt/Ausbau lohnt, wo der Heimatmarkt die Marge trägt und wo man sich besser zurückzieht. Grundlage für die Internationalisierungsstrategie.',
    fragen: ['In welche Märkte expandieren (Stars)?', 'Welcher Markt ist das margenstarke Fundament (Cash Cow)?', 'Welcher junge Markt ist eine Wachstumswette (Question Mark)?', 'Aus welchem Markt geordnet zurückziehen (Poor Dog)?'],
    quadrant: {
      star: 'Ausbauen – Vertrieb/Marketing vor Ort verstärken, Marktanteil sichern.',
      cashcow: 'Halten – Kernmarkt effizient bedienen, Marge schützen.',
      question: 'Beobachten/investieren – Markteintritt vertiefen oder begrenzen.',
      dog: 'Konsolidieren – Aufwand reduzieren oder Markt geordnet aufgeben.'
    }
  },
  {
    id: 'lieferanten', titel: 'Lieferanten-Portfolio', kurz: 'Lieferanten',
    xLabel: 'Volumenentwicklung %', yLabel: 'Performance-Score', blase: 'Beschaffungsvolumen (Mio €)',
    objekte: () => LIEFERANTEN,
    mehrwert: 'Bewertet Lieferanten nach Mengenentwicklung und Performance (Qualität/Termintreue) statt nur nach Preis. Zeigt strategische Partner zum Ausbau, verlässliche Stützen, Wackelkandidaten zur Qualifizierung und abzulösende Risiken – Basis fürs Lieferanten- und Risikomanagement.',
    fragen: ['Welche Lieferanten strategisch ausbauen (Stars)?', 'Welche sind das verlässliche Rückgrat (Cash Cows)?', 'Wer muss in der Performance entwickelt werden (Question Marks)?', 'Wen sollten wir ablösen/zweitquellen (Poor Dogs)?'],
    quadrant: {
      star: 'Strategische Partner – ausbauen, gemeinsam entwickeln, langfristig binden.',
      cashcow: 'Verlässliches Rückgrat – Konditionen sichern, Performance halten.',
      question: 'Entwickeln – Qualität/Termintreue verbessern oder Volumen umlenken.',
      dog: 'Risiko – Zweitquelle aufbauen, ablösen, Abhängigkeit reduzieren.'
    }
  }
]

export function portfolioListe() {
  return REGISTRY.map((p) => ({ id: p.id, titel: p.titel, kurz: p.kurz }))
}

/** Ein Portfolio inkl. berechneter Quadranten-Felder und Achsenschwellen. */
export function portfolio(id) {
  const def = REGISTRY.find((p) => p.id === id) || REGISTRY[0]
  const objekte = def.objekte()
  const { schwellen, felder } = bcgFelder(objekte)
  // Jedes Objekt mit seinem Quadranten anreichern (für Tabelle/Drill).
  const mitQuadrant = objekte.map((o) => ({ ...o, quadrant: quadrantVon(o, schwellen) }))
  return { ...def, objekte: mitQuadrant, schwellen, felder }
}
