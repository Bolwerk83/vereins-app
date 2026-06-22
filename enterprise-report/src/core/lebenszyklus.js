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
// Klassisches 5-Phasen-Modell (Umsatzkurve): Einführung → Wachstum → Reife →
// Sättigung → Rückgang. `niveau` = Höhe der Umsatzkurve in dieser Phase (0..1),
// Peak in der Sättigung.
export const PRODUKT_PHASEN = [
  { id: 'einfuehrung', name: 'Einführung', farbe: '#7c3aed', niveau: 0.22, laie: 'Neu am Markt: hohes Wachstum, dünne Marge.', strategie: 'Investieren – Markt & Bekanntheit aufbauen' },
  { id: 'wachstum',    name: 'Wachstum',   farbe: '#2563eb', niveau: 0.6,  laie: 'Setzt sich durch: Umsatz und Marge steigen.', strategie: 'Investieren – Kapazität & Vertrieb skalieren' },
  { id: 'reife',       name: 'Reife',      farbe: '#10b981', niveau: 0.85, laie: 'Wächst noch, aber langsamer; höchste Marge.', strategie: 'Halten – Position & Marge sichern' },
  { id: 'saettigung',  name: 'Sättigung',  farbe: '#f59e0b', niveau: 1.0,  laie: 'Umsatz am Plateau, Wachstum ~0; Gewinn beginnt zu sinken.', strategie: 'Ausschöpfen & differenzieren – Relaunch/Nachfolge vorbereiten' },
  { id: 'rueckgang',   name: 'Rückgang',   farbe: '#ef4444', niveau: 0.4,  laie: 'Schrumpfend oder Margenverfall.', strategie: 'Bereinigen – Auslauf/Nachfolge, Abverkauf' }
]
export const produktPhaseInfo = (id) => PRODUKT_PHASEN.find((p) => p.id === id)

/** Produktphase aus Alter, Wachstum und Margentrend (DB-Punkte YoY).
 *  5 Phasen: hohes Wachstum=Einführung, kräftiges=Wachstum, moderates=Reife,
 *  Plateau (~0)=Sättigung, negatives bzw. Margenverfall=Rückgang. */
export function phaseProdukt({ alter = null, wachstum = 0, dbTrend = 0 }) {
  if (alter != null && alter <= 1) return 'einfuehrung'
  if (wachstum >= 20) return 'einfuehrung'
  if (wachstum >= 6) return 'wachstum'
  if (wachstum >= 2) return dbTrend <= -1.5 ? 'saettigung' : 'reife'
  if (wachstum >= -1) return dbTrend <= -1.5 ? 'rueckgang' : 'saettigung' // Plateau, Marge entscheidet
  return 'rueckgang'
}

// ---------- B) Kunde -----------------------------------------------------
// Beziehungswert über die Zeit: Peak im Bestand, Abfall bei gefährdet/verloren.
export const KUNDE_PHASEN = [
  { id: 'akquise',     name: 'Akquise',     farbe: '#7c3aed', niveau: 0.3,  laie: 'Neu gewonnen, erste Bestellungen.', empfehlung: 'Onboarding & Erstbindung' },
  { id: 'entwicklung', name: 'Entwicklung', farbe: '#2563eb', niveau: 0.7,  laie: 'Wachsende Beziehung, steigender Umsatz.', empfehlung: 'Up-/Cross-Selling, Potenzial heben' },
  { id: 'bestand',     name: 'Bestand',     farbe: '#10b981', niveau: 1.0,  laie: 'Stabiler Stammkunde.', empfehlung: 'Pflegen & binden' },
  { id: 'gefaehrdet',  name: 'Gefährdet',   farbe: '#f59e0b', niveau: 0.55, laie: 'Rückläufig oder länger inaktiv — Abwanderungsrisiko.', empfehlung: 'Rückgewinnung – aktiv ansprechen' },
  { id: 'verloren',    name: 'Verloren',    farbe: '#ef4444', niveau: 0.25, laie: 'Seit über einem Jahr keine Bestellung.', empfehlung: 'Reaktivieren oder bewusst abschließen' }
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
  { ebene: 'artikel', id: 'a-emtb',  name: 'E-MTB Trail Pro (2025)', parent: 'ebike', umsatz: 12.4, db: 38, wachstum: 12, dbTrend: 1.0, alter: 4, vorgaenger: 'a-emtb-g1' },
  { ebene: 'artikel', id: 'a-emtb-g1', name: 'E-MTB Trail Pro (2023)', parent: 'ebike', umsatz: 2.8, db: 34, wachstum: -34, dbTrend: -1.8, alter: 3 },
  { ebene: 'artikel', id: 'a-urban', name: 'E-Bike Urban 500', parent: 'ebike', umsatz: 10.2, db: 36, wachstum: 7, dbTrend: 0.5, alter: 5 },
  { ebene: 'artikel', id: 'a-etrek', name: 'E-Trekking 700', parent: 'ebike', umsatz: 7.5, db: 37, wachstum: 2, dbTrend: 0.0, alter: 6 },
  { ebene: 'artikel', id: 'a-city7', name: 'City 7',  parent: 'city', umsatz: 5.1, db: 34, wachstum: 3, dbTrend: -0.1, alter: 7 },
  { ebene: 'artikel', id: 'a-trek5', name: 'Trekking 5', parent: 'city', umsatz: 4.5, db: 33, wachstum: 5, dbTrend: -0.3, alter: 9 },
  { ebene: 'artikel', id: 'a-antrieb', name: 'Antriebseinheit M3', parent: 'teile', umsatz: 4.2, db: 40, wachstum: -1, dbTrend: -2.0, alter: 11 },
  { ebene: 'artikel', id: 'a-schalt', name: 'Schaltwerk 12s', parent: 'teile', umsatz: 2.6, db: 38, wachstum: -5, dbTrend: -1.5, alter: 12 },
  { ebene: 'artikel', id: 'a-akku', name: 'Akku 625Wh', parent: 'teile', umsatz: 2.0, db: 39, wachstum: 6, dbTrend: 0.6, alter: 3, vorgaenger: 'a-akku-g1' },
  { ebene: 'artikel', id: 'a-akku-g1', name: 'Akku 500Wh (Vorgänger)', parent: 'teile', umsatz: 0.6, db: 37, wachstum: -28, dbTrend: -1.2, alter: 5 },
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

// ---------- BCG-/Portfolio-Quadranten (Wachstum × DB) --------------------
// Die Portfolio-Matrix hat zwei Achsen: Wachstum (x, Schwelle 0 %) und
// Deckungsbeitrag (y, Schwelle = Median DB). Daraus vier Felder mit den
// klassischen BCG-Begriffen — als Einstieg/Filter über das Portfolio.
export const BCG_QUADRANTEN = [
  { id: 'star',     name: 'Stars',          kurz: 'Wachstumsträger',   farbe: '#2563eb', hochWachstum: true,  hochDb: true,
    these: 'Hohes Wachstum bei hoher Marge — Zugpferde des Portfolios.', strategie: 'Investieren – Kapazität & Vertrieb skalieren' },
  { id: 'cashcow',  name: 'Cash Cows',      kurz: 'Ertragsbringer',    farbe: '#10b981', hochWachstum: false, hochDb: true,
    these: 'Reife Melkkühe: wenig Wachstum, aber starke Marge.', strategie: 'Halten – Cash ernten, Effizienz sichern' },
  { id: 'question', name: 'Question Marks', kurz: 'Nachwuchs',         farbe: '#f59e0b', hochWachstum: true,  hochDb: false,
    these: 'Wachsen stark, verdienen aber (noch) wenig.', strategie: 'Selektiv investieren – Marge entwickeln oder einstellen' },
  { id: 'dog',      name: 'Poor Dogs',      kurz: 'Auslaufkandidaten', farbe: '#ef4444', hochWachstum: false, hochDb: false,
    these: 'Wenig Wachstum, schwache Marge — Ballast.', strategie: 'Bereinigen – Auslauf/Abverkauf prüfen' }
]
export const bcgQuadrantInfo = (id) => BCG_QUADRANTEN.find((q) => q.id === id)

function median(arr) {
  if (!arr.length) return 0
  const s = [...arr].sort((a, b) => a - b); const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
/** Achsenschwellen: Wachstum fix 0 %, DB als Median der Objekte. */
export function bcgSchwellen(objekte, { wachstum = 0 } = {}) {
  return { wachstum, db: +median(objekte.map((o) => o.db)).toFixed(1) }
}
/** Quadrant eines Objekts anhand der Achsenschwellen. */
export function quadrantVon(o, schwellen) {
  const hw = o.wachstum >= schwellen.wachstum, hd = o.db >= schwellen.db
  return (BCG_QUADRANTEN.find((q) => q.hochWachstum === hw && q.hochDb === hd) || {}).id
}
/** Verteilung je Quadrant aus einer beliebigen Objektliste. */
export function bcgFelder(objekte, opt = {}) {
  const schwellen = bcgSchwellen(objekte, opt)
  const ges = objekte.reduce((n, x) => n + x.umsatz, 0) || 1
  const felder = BCG_QUADRANTEN.map((q) => {
    const grp = objekte.filter((o) => quadrantVon(o, schwellen) === q.id)
    const umsatz = +grp.reduce((n, x) => n + x.umsatz, 0).toFixed(1)
    return { ...q, anzahl: grp.length, umsatz, anteil: +(umsatz / ges * 100).toFixed(1),
      dbSchnitt: grp.length ? +(grp.reduce((n, x) => n + x.db, 0) / grp.length).toFixed(1) : 0, objekte: grp }
  })
  return { schwellen, felder }
}
/** Verteilung je Quadrant für eine Produkt-Ebene (Default-Stammdaten). */
export function bcgVerteilung(ebene, opt = {}) { return bcgFelder(produkte(ebene), opt) }

// ---------- Lebenszyklus-Kurve (Phasenprofil + Objektpositionen) ---------
// Ordnet Objekte ihren Phasen zu und verteilt sie als Punkte entlang einer
// Lebenszyklus-Kurve (Aufstieg → Peak → Abfall). Rein für die grafische Sicht.
export function phasenKurve(phasen, objekte) {
  const n = phasen.length
  const peak = 0.58 // Fallback-Hochpunkt, falls eine Phase kein `niveau` trägt
  // Höhenprofil 0..1 je Phase: bevorzugt das fachliche `niveau` der Phase
  // (Umsatz-/Wertkurve), sonst eine generische Glockenform.
  const profil = phasen.map((p, i) => {
    if (p.niveau != null) return +Math.max(0.12, Math.min(1, p.niveau)).toFixed(3)
    const t = n <= 1 ? peak : i / (n - 1)
    const h = t <= peak ? 0.25 + 0.75 * (t / peak) : 1 - 0.72 * ((t - peak) / (1 - peak))
    return +Math.max(0.12, Math.min(1, h)).toFixed(3)
  })
  // Stützpunkte der Hüllkurve (x in [0,1]); Objekte sitzen interpoliert darauf.
  const stuetz = [[0, profil[0] * 0.55], ...profil.map((h, i) => [(i + 0.5) / n, h]), [1, profil[n - 1] * 0.8]]
  const hoeheBei = (t) => {
    for (let k = 1; k < stuetz.length; k++) {
      const [x0, h0] = stuetz[k - 1], [x1, h1] = stuetz[k]
      if (t <= x1) { const f = (t - x0) / (x1 - x0 || 1); return h0 + (h1 - h0) * f }
    }
    return stuetz[stuetz.length - 1][1]
  }
  const punkte = []
  phasen.forEach((p, i) => {
    // Innerhalb der Phase nach Reifegrad sortiert (früh → spät) und kontinuierlich
    // über das Band verteilt — die Objekte sitzen auf der Kurve statt in Spalten.
    const grp = objekte.filter((o) => o.phase === p.id).slice().sort((a, b) => b.wachstum - a.wachstum)
    const m = grp.length
    const lo = (i + 0.14) / n, hi = (i + 0.86) / n
    grp.forEach((o, j) => {
      const x = m === 1 ? (i + 0.5) / n : lo + (hi - lo) * (j / (m - 1))
      punkte.push({ id: o.id, name: o.name, umsatz: o.umsatz, gruppe: o.gruppe,
        phase: p.id, farbe: p.farbe, x: +x.toFixed(4), hoehe: +hoeheBei(x).toFixed(4), vy: 0 })
    })
  })
  return { profil, stuetz, punkte }
}
