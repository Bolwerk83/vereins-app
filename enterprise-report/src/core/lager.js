// =========================================================================
//  LAGERVERWALTUNG (Controlling-Sicht) — nicht das operative WMS, sondern die
//  wirtschaftliche Steuerung des Lagers: Kapitalbindung, Lagerhaltungskosten
//  und -kostensatz, Standortkosten, Umschlag/Reichweite und die
//  Bestandsoptimierung (optimale Bestellmenge nach Andler, Melde-/Sicherheits-
//  /Höchstbestand). Beträge in Mio €, sofern nicht anders angegeben.
// =========================================================================

export const WARENEINSATZ_MIO = 32.2 // COGS p. a. (für Umschlag/Reichweite)
export const KALK_ZINS = 6.0         // kalkulatorischer Zinssatz % (Kapitalbindung)
export const SERVICEGRAD = 97        // Ziel-Servicegrad %
export const LAGERTAGE = 300         // Arbeitstage/Jahr für Tagesbedarf

const r2 = (x) => Math.round(x * 100) / 100
const r1 = (x) => Math.round(x * 10) / 10
const r0 = (x) => Math.round(x)

// --- Lagerstandorte (bestandswert Mio €, fixkosten/varkosten Tsd €/Jahr) ---
export const STANDORTE = [
  { id: 'zentral', name: 'Zentrallager Nürnberg', flaeche: 8000, bestandswert: 6.0, kapazitaetPlaetze: 9000, belegtPlaetze: 7400, fixkostenTsd: 820, varkostenTsd: 240 },
  { id: 'dach', name: 'Filiallager DACH', flaeche: 2400, bestandswert: 2.1, kapazitaetPlaetze: 2600, belegtPlaetze: 2200, fixkostenTsd: 290, varkostenTsd: 95 },
  { id: 'extern', name: 'Externes Läger (3PL)', flaeche: 3000, bestandswert: 1.3, kapazitaetPlaetze: 3500, belegtPlaetze: 1900, fixkostenTsd: 0, varkostenTsd: 210 }
]

// --- Lagerhaltungskostensatz (% vom durchschnittlichen Bestandswert) -------
export const KOSTENSATZ = [
  { id: 'kapital', name: 'Kapitalbindung (kalk. Zins)', satz: KALK_ZINS, laie: 'Zins auf das im Bestand gebundene Kapital.' },
  { id: 'raum', name: 'Raum- & Lagerkosten', satz: 3.5, laie: 'Miete/Abschreibung, Energie, Instandhaltung.' },
  { id: 'personal', name: 'Personal & Handling', satz: 2.8, laie: 'Ein-/Auslagern, Kommissionieren, Verwaltung.' },
  { id: 'versicherung', name: 'Versicherung', satz: 0.4, laie: 'Feuer/Diebstahl/Transport.' },
  { id: 'schwund', name: 'Schwund & Veralterung (Wagnis)', satz: 1.3, laie: 'Verderb, Bruch, Wertverlust, Ladenhüter.' }
]
export const lagerhaltungskostensatz = () => r1(KOSTENSATZ.reduce((n, k) => n + k.satz, 0))

// --- Artikel/Warengruppen für Bestandsoptimierung --------------------------
// jahresbedarf (Stück), einstandspreis (€), bestellkostenJe (€/Bestellung),
// wbzTage (Wiederbeschaffungszeit), sicherheitstage (Puffer in Tagen).
export const ARTIKEL = [
  { id: 'ebike', name: 'E-Bikes', jahresbedarf: 24000, einstandspreis: 980, bestellkostenJe: 140, wbzTage: 21, sicherheitstage: 7 },
  { id: 'akku', name: 'Akkus 625Wh', jahresbedarf: 31000, einstandspreis: 210, bestellkostenJe: 90, wbzTage: 28, sicherheitstage: 10 },
  { id: 'teile', name: 'Antriebsteile', jahresbedarf: 60000, einstandspreis: 75, bestellkostenJe: 60, wbzTage: 14, sicherheitstage: 6 },
  { id: 'zubehoer', name: 'Zubehör', jahresbedarf: 90000, einstandspreis: 28, bestellkostenJe: 45, wbzTage: 10, sicherheitstage: 5 },
  { id: 'bekleidung', name: 'Bekleidung', jahresbedarf: 40000, einstandspreis: 35, bestellkostenJe: 50, wbzTage: 18, sicherheitstage: 8 }
]

/** Lager-Kennzahlen gesamt (Wert, Kapitalbindung, Kosten, Umschlag …). */
export function kennzahlen(standorte = STANDORTE) {
  const bestandswert = r2(standorte.reduce((n, s) => n + s.bestandswert, 0))
  const satz = lagerhaltungskostensatz()
  const lagerhaltungskosten = r2(bestandswert * satz / 100)
  const kapitalbindung = r2(bestandswert * KALK_ZINS / 100)
  const umschlag = bestandswert ? r1(WARENEINSATZ_MIO / bestandswert) : 0
  const reichweite = umschlag ? r0(365 / umschlag) : 0
  const flaeche = standorte.reduce((n, s) => n + s.flaeche, 0)
  const kapazitaet = standorte.reduce((n, s) => n + s.kapazitaetPlaetze, 0)
  const belegt = standorte.reduce((n, s) => n + s.belegtPlaetze, 0)
  return {
    bestandswert, satz, lagerhaltungskosten, kapitalbindung,
    umschlag, reichweite, flaeche, kapazitaet, belegt,
    auslastung: kapazitaet ? r1(belegt / kapazitaet * 100) : 0,
    servicegrad: SERVICEGRAD
  }
}

/** Standort-Auswertung: Kosten gesamt, je m², je € Bestand, Auslastung. */
export function standorteAuswertung(standorte = STANDORTE) {
  return standorte.map((s) => {
    const kostenTsd = s.fixkostenTsd + s.varkostenTsd
    return {
      ...s, kostenTsd,
      kostenJeM2: s.flaeche ? r0(kostenTsd * 1000 / s.flaeche) : 0,
      kostenQuote: s.bestandswert ? r1(kostenTsd / (s.bestandswert * 1000) * 100) : 0, // % vom Bestandswert
      auslastung: s.kapazitaetPlaetze ? r1(s.belegtPlaetze / s.kapazitaetPlaetze * 100) : 0
    }
  })
}

/** Optimale Bestellmenge (Andler): √(2·Bedarf·Bestellkosten / (Preis·Lagersatz)). */
export function eoq(jahresbedarf, bestellkostenJe, einstandspreis, lagersatzPct) {
  const nenner = einstandspreis * lagersatzPct / 100
  return nenner > 0 ? Math.sqrt(2 * jahresbedarf * bestellkostenJe / nenner) : 0
}

/** Bestandsoptimierung je Artikel: EOQ, Melde-/Sicherheits-/Höchstbestand, Kosten. */
export function optimierung(artikel = ARTIKEL) {
  const satz = lagerhaltungskostensatz()
  const rows = artikel.map((a) => {
    const eoqMenge = r0(eoq(a.jahresbedarf, a.bestellkostenJe, a.einstandspreis, satz))
    const tagesbedarf = a.jahresbedarf / LAGERTAGE
    const sicherheitsbestand = r0(tagesbedarf * a.sicherheitstage)
    const meldebestand = r0(tagesbedarf * a.wbzTage + sicherheitsbestand)
    const hoechstbestand = sicherheitsbestand + eoqMenge
    const oBestandMenge = sicherheitsbestand + eoqMenge / 2
    const oBestandWert = r0(oBestandMenge * a.einstandspreis)
    const bestellungenProJahr = eoqMenge ? r1(a.jahresbedarf / eoqMenge) : 0
    const bestellkostenJahr = r0(bestellungenProJahr * a.bestellkostenJe)
    const lagerkostenJahr = r0(oBestandWert * satz / 100)
    return {
      ...a, eoqMenge, sicherheitsbestand, meldebestand, hoechstbestand,
      oBestandWert, bestellungenProJahr, bestellkostenJahr, lagerkostenJahr,
      gesamtkostenJahr: bestellkostenJahr + lagerkostenJahr
    }
  })
  return {
    rows,
    gebundenWert: r0(rows.reduce((n, r) => n + r.oBestandWert, 0)),
    gesamtkosten: r0(rows.reduce((n, r) => n + r.gesamtkostenJahr, 0))
  }
}
