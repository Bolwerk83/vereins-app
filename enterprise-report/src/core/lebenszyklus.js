// =========================================================================
//  LEBENSZYKLUS — zwei fachlich getrennte Modelle:
//
//   A) PRODUKT-Lebenszyklus (Artikel/Produktgruppe):
//        Einführung → Wachstum → Reife → Rückgang
//        Phase aus Wachstum UND Margentrend (DB-Punkte YoY) bzw. Alter.
//        Je Phase eine Normstrategie (Investieren/Halten/Ernten/Auslaufen).
//
//   B) KUNDEN-Lebenszyklus (Geschäftsbeziehung):
//        Akquise → Entwicklung → Bestand → gefährdet → verloren
//        Phase aus Beziehungsalter, Wachstum und Letzter Bestellung.
//        Je Phase eine Handlungsempfehlung.
//
//  Bewusst getrennt: ein Kunde durchläuft KEINEN Produkt-Lebenszyklus.
// =========================================================================

// ---------- A) Produkt ---------------------------------------------------
export const PRODUKT_PHASEN = [
  { id: 'einfuehrung', name: 'Einführung', farbe: '#7c3aed', laie: 'Neu am Markt: hohes Wachstum, dünne Marge.', strategie: 'Investieren – Markt & Bekanntheit aufbauen' },
  { id: 'wachstum',    name: 'Wachstum',   farbe: '#2563eb', laie: 'Setzt sich durch: Umsatz und Marge steigen.', strategie: 'Investieren – Kapazität & Vertrieb skalieren' },
  { id: 'reife',       name: 'Reife',      farbe: '#10b981', laie: 'Stabil & ertragsstark: geringes Wachstum, hohe Marge.', strategie: 'Halten – Effizienz sichern, Cash ernten' },
  { id: 'rueckgang',   name: 'Rückgang',   farbe: '#ef4444', laie: 'Schrumpfend oder Margenverfall.', strategie: 'Bereinigen – Auslauf/Nachfolge, Abverkauf' }
]
export const produktPhaseInfo = (id) => PRODUKT_PHASEN.find((p) => p.id === id)

/** Produktphase aus Alter, Wachstum und Margentrend (DB-Punkte YoY). */
export function phaseProdukt({ alter = null, wachstum = 0, dbTrend = 0 }) {
  if (alter != null && alter <= 1) return 'einfuehrung'
  if (wachstum >= 20) return 'einfuehrung'
  if (wachstum >= 6) return 'wachstum'
  if (wachstum >= -3) return dbTrend <= -1.5 ? 'rueckgang' : 'reife' // Margenverfall = faktischer Rückgang
  return 'rueckgang'
}

// ---------- B) Kunde -----------------------------------------------------
export const KUNDE_PHASEN = [
  { id: 'akquise',     name: 'Akquise',     farbe: '#7c3aed', laie: 'Neu gewonnen, erste Bestellungen.', empfehlung: 'Onboarding & Erstbindung' },
  { id: 'entwicklung', name: 'Entwicklung', farbe: '#2563eb', laie: 'Wachsende Beziehung, steigender Umsatz.', empfehlung: 'Up-/Cross-Selling, Potenzial heben' },
  { id: 'bestand',     name: 'Bestand',     farbe: '#10b981', laie: 'Stabiler Stammkunde.', empfehlung: 'Pflegen & binden' },
  { id: 'gefaehrdet',  name: 'Gefährdet',   farbe: '#f59e0b', laie: 'Rückläufig oder länger inaktiv — Abwanderungsrisiko.', empfehlung: 'Rückgewinnung – aktiv ansprechen' },
  { id: 'verloren',    name: 'Verloren',    farbe: '#ef4444', laie: 'Seit über einem Jahr keine Bestellung.', empfehlung: 'Reaktivieren oder bewusst abschließen' }
]
export const kundePhaseInfo = (id) => KUNDE_PHASEN.find((p) => p.id === id)

/** Kundenphase aus Beziehungsalter (Monate), Wachstum und Letzter Bestellung (Tage). */
export function phaseKunde({ alterMonate = 99, wachstum = 0, letzteBestellungTage = 0 }) {
  if (letzteBestellungTage > 365) return 'verloren'
  if (alterMonate <= 6) return 'akquise'
  if (letzteBestellungTage > 180 || wachstum <= -10) return 'gefaehrdet'
  if (wachstum >= 10) return 'entwicklung'
  return 'bestand'
}

// ---------- Stammdaten ---------------------------------------------------
// Produkt: umsatz (Mio €), db (%), wachstum (% YoY), dbTrend (DB-Punkte YoY), alter (Jahre).
const PRODUKT_ROH = [
  { ebene: 'produkt', id: 'ebike',     name: 'E-Bikes',       umsatz: 30.1, db: 37, wachstum: 9,  dbTrend: 0.8,  alter: 6 },
  { ebene: 'produkt', id: 'city',      name: 'City/Trekking', umsatz: 9.6,  db: 34, wachstum: 4,  dbTrend: -0.2, alter: 10 },
  { ebene: 'produkt', id: 'teile',     name: 'Teile',         umsatz: 8.8,  db: 39, wachstum: -2, dbTrend: -1.8, alter: 12 },
  { ebene: 'produkt', id: 'zubehoer',  name: 'Zubehör',       umsatz: 5.7,  db: 44, wachstum: 1,  dbTrend: 0.3,  alter: 8 },
  { ebene: 'produkt', id: 'bekleidung', name: 'Bekleidung',   umsatz: 3.7,  db: 32, wachstum: -6, dbTrend: -1.0, alter: 9 },
  { ebene: 'produkt', id: 'cargo',     name: 'E-Cargo',       umsatz: 1.2,  db: 20, wachstum: 35, dbTrend: 2.0,  alter: 1 },
  // Artikel (parent = Produktgruppe)
  { ebene: 'artikel', id: 'a-emtb',  name: 'E-MTB Trail Pro', parent: 'ebike', umsatz: 12.4, db: 38, wachstum: 12, dbTrend: 1.0, alter: 4 },
  { ebene: 'artikel', id: 'a-urban', name: 'E-Bike Urban 500', parent: 'ebike', umsatz: 10.2, db: 36, wachstum: 7, dbTrend: 0.5, alter: 5 },
  { ebene: 'artikel', id: 'a-etrek', name: 'E-Trekking 700', parent: 'ebike', umsatz: 7.5, db: 37, wachstum: 2, dbTrend: 0.0, alter: 6 },
  { ebene: 'artikel', id: 'a-city7', name: 'City 7',  parent: 'city', umsatz: 5.1, db: 34, wachstum: 3, dbTrend: -0.1, alter: 7 },
  { ebene: 'artikel', id: 'a-trek5', name: 'Trekking 5', parent: 'city', umsatz: 4.5, db: 33, wachstum: 5, dbTrend: -0.3, alter: 9 },
  { ebene: 'artikel', id: 'a-antrieb', name: 'Antriebseinheit M3', parent: 'teile', umsatz: 4.2, db: 40, wachstum: -1, dbTrend: -2.0, alter: 11 },
  { ebene: 'artikel', id: 'a-schalt', name: 'Schaltwerk 12s', parent: 'teile', umsatz: 2.6, db: 38, wachstum: -5, dbTrend: -1.5, alter: 12 },
  { ebene: 'artikel', id: 'a-akku', name: 'Akku 625Wh', parent: 'teile', umsatz: 2.0, db: 39, wachstum: 6, dbTrend: 0.6, alter: 3 },
  { ebene: 'artikel', id: 'a-helm', name: 'Helme', parent: 'zubehoer', umsatz: 2.1, db: 46, wachstum: 2, dbTrend: 0.2, alter: 8 },
  { ebene: 'artikel', id: 'a-tasche', name: 'Taschen', parent: 'zubehoer', umsatz: 1.8, db: 43, wachstum: 0, dbTrend: 0.1, alter: 8 },
  { ebene: 'artikel', id: 'a-lampe', name: 'Lampen', parent: 'zubehoer', umsatz: 1.8, db: 42, wachstum: 1, dbTrend: 0.0, alter: 7 },
  { ebene: 'artikel', id: 'a-jacke', name: 'Jacken', parent: 'bekleidung', umsatz: 1.6, db: 33, wachstum: -5, dbTrend: -0.8, alter: 9 },
  { ebene: 'artikel', id: 'a-hose', name: 'Hosen', parent: 'bekleidung', umsatz: 1.2, db: 31, wachstum: -7, dbTrend: -1.2, alter: 9 },
  { ebene: 'artikel', id: 'a-trikot', name: 'Trikots', parent: 'bekleidung', umsatz: 0.9, db: 32, wachstum: -6, dbTrend: -1.0, alter: 8 },
  { ebene: 'artikel', id: 'a-cargof', name: 'Cargo Family', parent: 'cargo', umsatz: 0.7, db: 21, wachstum: 40, dbTrend: 2.5, alter: 1 },
  { ebene: 'artikel', id: 'a-cargol', name: 'Cargo Load', parent: 'cargo', umsatz: 0.5, db: 18, wachstum: 30, dbTrend: 1.5, alter: 1 }
]

// Kunde: umsatz (Mio €), db (%), wachstum (% YoY), alterMonate, letzteBestellungTage.
const KUNDE_ROH = [
  { id: 'k-online',  name: 'Onlineshop (Privat)', umsatz: 23.4, db: 39, wachstum: 8,   alterMonate: 60, letzteBestellungTage: 2 },
  { id: 'k-leasing', name: 'Leasing-Partner A',   umsatz: 7.8,  db: 32, wachstum: 15,  alterMonate: 30, letzteBestellungTage: 20 },
  { id: 'k-veloch',  name: 'Velo Schweiz AG',     umsatz: 6.2,  db: 40, wachstum: 2,   alterMonate: 84, letzteBestellungTage: 25 },
  { id: 'k-b2b',     name: 'B2B-Händler B',       umsatz: 5.2,  db: 30, wachstum: 4,   alterMonate: 48, letzteBestellungTage: 35 },
  { id: 'k-filiale', name: 'Filialkette C',       umsatz: 4.7,  db: 28, wachstum: -3,  alterMonate: 90, letzteBestellungTage: 210 },
  { id: 'k-nl',      name: 'Stadtflotte NL',      umsatz: 4.2,  db: 31, wachstum: 22,  alterMonate: 4,  letzteBestellungTage: 12 },
  { id: 'k-werk',    name: 'Werksverkehr GmbH',   umsatz: 1.1,  db: 30, wachstum: -40, alterMonate: 52, letzteBestellungTage: 420 },
  { id: 'k-radhaus', name: 'Radhaus Müller e.K.', umsatz: 0.9,  db: 34, wachstum: -18, alterMonate: 36, letzteBestellungTage: 95 }
]

const mitProduktPhase = (o) => ({ ...o, phase: phaseProdukt(o) })
const mitKundePhase = (o) => ({ ...o, phase: phaseKunde(o) })

export function produkte(ebene) { return PRODUKT_ROH.filter((o) => o.ebene === ebene).map(mitProduktPhase) }
export function kinderProdukt(parentId) { return PRODUKT_ROH.filter((o) => o.ebene === 'artikel' && o.parent === parentId).map(mitProduktPhase) }
export function kunden() { return KUNDE_ROH.map(mitKundePhase) }

function verteilung(objekte, phasen) {
  const ges = objekte.reduce((n, x) => n + x.umsatz, 0) || 1
  return phasen.map((p) => {
    const grp = objekte.filter((x) => x.phase === p.id)
    const umsatz = +grp.reduce((n, x) => n + x.umsatz, 0).toFixed(1)
    return { ...p, anzahl: grp.length, umsatz, anteil: +(umsatz / ges * 100).toFixed(1) }
  })
}
export function produktPhaseVerteilung(ebene) { return verteilung(produkte(ebene), PRODUKT_PHASEN) }
export function kundePhaseVerteilung() { return verteilung(kunden(), KUNDE_PHASEN) }
