// =========================================================================
//  LEBENSZYKLUS → STRATEGIE & MASSNAHMEN — leitet aus den Phasen von
//  Produkten und Kunden automatisch konkrete, priorisierte Empfehlungen ab
//  und liefert je Empfehlung eine fertige (SMART-)Maßnahme, die per
//  addMassnahme übernommen werden kann (quelle-Tag für die Nachverfolgung).
//
//  Priorität:  1 = dringend (Risiko)  ·  2 = Chance  ·  3 = Halten/Pflege
//  Art:        'risiko' | 'chance' | 'halten'
// =========================================================================
import { produkte, kunden, produktPhaseInfo, kundePhaseInfo } from './lebenszyklus.js'

const r1 = (x) => Math.round(x * 10) / 10

// Phasen-Regeln Produkt: was tun, welcher Hebel, Priorität, Art.
const PRODUKT_REGEL = {
  einfuehrung: { art: 'chance', prio: 2, hebel: 'Wachstum', frist: 'Q2–Q4',
    titelFn: (o) => `${o.name}: Markteinführung pushen`, weg: 'Bekanntheit & Distribution aufbauen, Erstkäufer gewinnen, Kapazität sichern.', wirkung: 'Umsatzaufbau' },
  wachstum: { art: 'chance', prio: 2, hebel: 'Wachstum', frist: 'Q2–Q4',
    titelFn: (o) => `${o.name}: Wachstum skalieren`, weg: 'Vertrieb & Kapazität ausbauen, Lieferfähigkeit sichern, Sortiment vertiefen.', wirkung: 'Umsatz & DB ↑' },
  reife: { art: 'halten', prio: 3, hebel: 'Effizienz', frist: 'laufend',
    titelFn: (o) => `${o.name}: Position halten & Cash ernten`, weg: 'Effizienz sichern, Preis-/Konditionenpflege, selektive Pflegeinvestitionen.', wirkung: 'DB stabil halten' },
  rueckgang: { art: 'risiko', prio: 1, hebel: 'Portfolio-Bereinigung', frist: 'sofort–Q3',
    titelFn: (o) => `${o.name}: Auslauf/Abverkauf einleiten`, weg: 'Nachfolge/Relaunch prüfen, Restbestände abverkaufen, Komplexität reduzieren.', wirkung: 'Kapital & Marge schützen' }
}

// Phasen-Regeln Kunde.
const KUNDE_REGEL = {
  akquise: { art: 'halten', prio: 3, hebel: 'Onboarding', frist: 'Q2',
    titelFn: (o) => `${o.name}: Onboarding & Erstbindung`, weg: 'Willkommensstrecke, schnelle erste Wiederbestellung, Ansprechpartner zuteilen.', wirkung: 'Bindung aufbauen' },
  entwicklung: { art: 'chance', prio: 2, hebel: 'Up-/Cross-Selling', frist: 'Q2–Q3',
    titelFn: (o) => `${o.name}: Potenzial heben (Up-/Cross-Selling)`, weg: 'Bedarfsanalyse, passende Bundles, Rahmenvertrag/Staffelkonditionen anbieten.', wirkung: 'Umsatz je Kunde ↑' },
  bestand: { art: 'halten', prio: 3, hebel: 'Kundenbindung', frist: 'laufend',
    titelFn: (o) => `${o.name}: Stammkunde pflegen & binden`, weg: 'Regelmäßiger Kontakt, Servicequalität, frühzeitige Vertragsverlängerung.', wirkung: 'Stabiler Umsatz' },
  gefaehrdet: { art: 'risiko', prio: 1, hebel: 'Rückgewinnung', frist: 'sofort',
    titelFn: (o) => `${o.name}: Abwanderung verhindern`, weg: 'Aktiv ansprechen, Ursachen klären, Rückgewinnungsangebot, Eskalation an Vertrieb.', wirkung: 'Umsatz sichern' },
  verloren: { art: 'risiko', prio: 2, hebel: 'Reaktivierung', frist: 'Q2–Q3',
    titelFn: (o) => `${o.name}: Reaktivieren oder bewusst abschließen`, weg: 'Reaktivierungskampagne; wenn aussichtslos, Ressourcen bewusst umlenken.', wirkung: 'Reaktivierung/Klärung' }
}

function baueMassnahme(e) {
  return {
    titel: e.titel,
    hebel: e.hebel,
    relevanz: `${e.typLabel} in Phase „${e.phaseName}" (${r1(e.umsatz)} Mio € Umsatz).`,
    erreichbarkeit: e.weg,
    frist: e.frist,
    wirkungErgebnis: e.wirkung,
    wirkungLiquiditaet: e.art === 'risiko' ? 'Kapital/Forderungen schützen' : 'neutral',
    aufwand: e.prio === 1 ? 'mittel' : 'gering',
    quelle: e.quelle
  }
}

function ausObjekt(o, typ) {
  const istProdukt = typ === 'produkt'
  const regel = (istProdukt ? PRODUKT_REGEL : KUNDE_REGEL)[o.phase]
  if (!regel) return null
  const info = istProdukt ? produktPhaseInfo(o.phase) : kundePhaseInfo(o.phase)
  const e = {
    id: `${typ}:${o.id}`, typ, typLabel: istProdukt ? 'Produkt' : 'Kunde',
    objektId: o.id, name: o.name, umsatz: o.umsatz, db: o.db, wachstum: o.wachstum,
    phase: o.phase, phaseName: info?.name || o.phase, farbe: info?.farbe,
    art: regel.art, prio: regel.prio, hebel: regel.hebel, frist: regel.frist,
    weg: regel.weg, wirkung: regel.wirkung, titel: regel.titelFn(o),
    strategie: istProdukt ? produktPhaseInfo(o.phase)?.strategie : kundePhaseInfo(o.phase)?.empfehlung,
    quelle: `lebenszyklus:${typ}`
  }
  e.massnahme = baueMassnahme(e)
  return e
}

/**
 * Alle Empfehlungen aus Produkt- (Ebene) und Kunden-Lebenszyklus,
 * sortiert nach Priorität, dann Umsatz.
 */
export function empfehlungen({ ebene = 'produkt' } = {}) {
  const p = produkte(ebene).map((o) => ausObjekt(o, 'produkt')).filter(Boolean)
  const k = kunden().map((o) => ausObjekt(o, 'kunde')).filter(Boolean)
  return [...p, ...k].sort((a, b) => a.prio - b.prio || b.umsatz - a.umsatz)
}

/** Kennzahlen über die Empfehlungen (Risiko-/Chancen-Umsatz, Anzahl je Prio). */
export function zusammenfassung(liste = empfehlungen()) {
  const sumU = (pred) => r1(liste.filter(pred).reduce((n, e) => n + e.umsatz, 0))
  return {
    gesamt: liste.length,
    dringend: liste.filter((e) => e.prio === 1).length,
    chancen: liste.filter((e) => e.art === 'chance').length,
    risikoUmsatz: sumU((e) => e.art === 'risiko'),
    chancenUmsatz: sumU((e) => e.art === 'chance')
  }
}
