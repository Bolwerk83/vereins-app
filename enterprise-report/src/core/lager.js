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

// --- Lieferanten + schleichende Liefertreue/WBZ-Historie (für KI-Signale) ---
// Pro Lieferant die letzten 6 Perioden: Wiederbeschaffungszeit (Tage) und
// Liefertreue (%). lf-power verschlechtert sich schleichend — genau das soll
// die KI bemerken, „damit nichts mehr untergeht".
export const LIEFERANTEN = {
  'lf-bike':  { id: 'lf-bike',  name: 'DemoBike Manufacturing', land: 'DE' },
  'lf-power': { id: 'lf-power', name: 'DemoPower Cells',        land: 'CN' },
  'lf-parts': { id: 'lf-parts', name: 'Antrieb & Teile GmbH',  land: 'DE' },
  'lf-acc':   { id: 'lf-acc',   name: 'Zubehör Import Co',      land: 'PL' },
  'lf-wear':  { id: 'lf-wear',  name: 'TextilWear Ltd',         land: 'TR' }
}
export const PERIODEN = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']
export const LIEFERANT_HISTORIE = {
  'lf-bike':  { wbz: [21, 20, 21, 22, 21, 21], treue: [98, 97, 98, 97, 98, 97] },
  'lf-power': { wbz: [21, 23, 25, 28, 31, 34], treue: [97, 95, 93, 90, 86, 82] }, // schleichendes Problem
  'lf-parts': { wbz: [14, 14, 15, 14, 15, 14], treue: [96, 95, 96, 95, 94, 95] },
  'lf-acc':   { wbz: [10, 11, 10, 12, 11, 13], treue: [94, 93, 92, 92, 90, 89] }, // leichte Verschlechterung
  'lf-wear':  { wbz: [18, 18, 17, 18, 18, 18], treue: [95, 96, 95, 95, 96, 95] }
}

// --- Artikel/Warengruppen für Bestandsoptimierung --------------------------
// jahresbedarf (Stück), einstandspreis (€), bestellkostenJe (€/Bestellung),
// wbzTage (Wiederbeschaffungszeit), sicherheitstage (Puffer in Tagen),
// lieferantId, istBestand (aktueller Bestand Stück), aktBestellmenge (heutige Losgröße).
export const ARTIKEL = [
  { id: 'ebike',      name: 'E-Bikes',       jahresbedarf: 24000, einstandspreis: 980, bestellkostenJe: 140, wbzTage: 21, sicherheitstage: 7,  lieferantId: 'lf-bike',  istBestand: 980,   aktBestellmenge: 500 },
  { id: 'akku',       name: 'Akkus 625Wh',   jahresbedarf: 31000, einstandspreis: 210, bestellkostenJe: 90,  wbzTage: 28, sicherheitstage: 10, lieferantId: 'lf-power', istBestand: 900,   aktBestellmenge: 1000 },
  { id: 'teile',      name: 'Antriebsteile', jahresbedarf: 60000, einstandspreis: 75,  bestellkostenJe: 60,  wbzTage: 14, sicherheitstage: 6,  lieferantId: 'lf-parts', istBestand: 1300,  aktBestellmenge: 2000 },
  { id: 'zubehoer',   name: 'Zubehör',       jahresbedarf: 90000, einstandspreis: 28,  bestellkostenJe: 45,  wbzTage: 10, sicherheitstage: 5,  lieferantId: 'lf-acc',   istBestand: 8200,  aktBestellmenge: 1500 },
  { id: 'bekleidung', name: 'Bekleidung',    jahresbedarf: 40000, einstandspreis: 35,  bestellkostenJe: 50,  wbzTage: 18, sicherheitstage: 8,  lieferantId: 'lf-wear',  istBestand: 900,   aktBestellmenge: 900 }
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

/** Jahres-Gesamtkosten einer Bestellpolitik mit Losgröße q (Bestell- + Lagerkosten). */
export function politikKosten(q, { jahresbedarf, bestellkostenJe, einstandspreis }, satz) {
  if (q <= 0) return Infinity
  const bestell = (jahresbedarf / q) * bestellkostenJe
  const lager = (q / 2) * einstandspreis * satz / 100
  return bestell + lager
}

/** Bestandsoptimierung je Artikel: EOQ, Melde-/Sicherheits-/Höchstbestand,
 *  Ist-Bestand, Reichweite, Status (Unterdeckung/Korridor/Überbestand),
 *  Einsparpotenzial der Losgröße und gebundenes Kapital. */
export function optimierung(artikel = ARTIKEL) {
  const satz = lagerhaltungskostensatz()
  const rows = artikel.map((a) => {
    const eoqMenge = r0(eoq(a.jahresbedarf, a.bestellkostenJe, a.einstandspreis, satz))
    const tagesbedarf = a.jahresbedarf / LAGERTAGE
    const sicherheitsbestand = r0(tagesbedarf * a.sicherheitstage)
    const meldebestand = r0(tagesbedarf * a.wbzTage + sicherheitsbestand)
    // Höchstbestand = Bestellpunkt + Losgröße (Order-up-to S = s + Q). Das hält
    // den Korridor [Meldebestand, Höchstbestand] auch dann gültig, wenn die
    // Laufzeit-Nachfrage (tagesbedarf·wbzTage) die Losgröße übersteigt — sonst
    // läge der Meldebestand über dem Höchstbestand und „Korridor" wäre nie erreichbar.
    const hoechstbestand = meldebestand + eoqMenge
    const oBestandMenge = sicherheitsbestand + eoqMenge / 2
    const oBestandWert = r0(oBestandMenge * a.einstandspreis)
    const bestellungenProJahr = eoqMenge ? r1(a.jahresbedarf / eoqMenge) : 0
    const bestellkostenJahr = r0(bestellungenProJahr * a.bestellkostenJe)
    const lagerkostenJahr = r0(oBestandWert * satz / 100)
    // Ist-Bestand-Bewertung
    const istBestand = a.istBestand ?? oBestandMenge
    const reichweiteTage = tagesbedarf ? r1(istBestand / tagesbedarf) : 0
    const kapitalGebunden = r0(istBestand * a.einstandspreis)
    const status = istBestand < meldebestand ? 'unterdeckung' : istBestand > hoechstbestand ? 'ueberbestand' : 'korridor'
    const ueberbestandWert = status === 'ueberbestand' ? r0((istBestand - hoechstbestand) * a.einstandspreis) : 0
    // Einsparpotenzial: heutige Losgröße vs. EOQ
    const aktBestellmenge = a.aktBestellmenge ?? eoqMenge
    const einsparpotenzial = Math.max(0, r0(politikKosten(aktBestellmenge, a, satz) - politikKosten(eoqMenge, a, satz)))
    const lieferant = LIEFERANTEN[a.lieferantId] || null
    return {
      ...a, eoqMenge, sicherheitsbestand, meldebestand, hoechstbestand,
      oBestandWert, bestellungenProJahr, bestellkostenJahr, lagerkostenJahr,
      gesamtkostenJahr: bestellkostenJahr + lagerkostenJahr,
      istBestand, reichweiteTage, kapitalGebunden, status, ueberbestandWert,
      aktBestellmenge, einsparpotenzial, lieferant
    }
  })
  return {
    rows,
    gebundenWert: r0(rows.reduce((n, r) => n + r.oBestandWert, 0)),
    gesamtkosten: r0(rows.reduce((n, r) => n + r.gesamtkostenJahr, 0)),
    kapitalGebunden: r0(rows.reduce((n, r) => n + r.kapitalGebunden, 0)),
    einsparpotenzial: r0(rows.reduce((n, r) => n + r.einsparpotenzial, 0)),
    ueberbestandWert: r0(rows.reduce((n, r) => n + r.ueberbestandWert, 0))
  }
}

// =========================================================================
//  KI-Signale: Empfehlungen je Artikel + schleichende Lieferanten-Trends
//  (Muster über mehrere Perioden, die sonst untergehen).
// =========================================================================
export const SCHWERE_RANG = { kritisch: 0, wichtig: 1, hinweis: 2 }
const trend = (reihe) => (reihe && reihe.length >= 2 ? r1(reihe[reihe.length - 1] - reihe[0]) : 0)

/** Schleichende Lieferanten-Verschlechterung über die Historie erkennen. */
export function lieferantenSignale(artikel = ARTIKEL) {
  const out = []
  for (const [id, h] of Object.entries(LIEFERANT_HISTORIE)) {
    const lf = LIEFERANTEN[id]; if (!lf) continue
    const wbzDelta = trend(h.wbz)        // + = langsamer geworden
    const treueDelta = trend(h.treue)    // - = unzuverlässiger geworden
    const betroffen = artikel.filter((a) => a.lieferantId === id)
    let schwere = null
    if (treueDelta <= -10 || wbzDelta >= 10) schwere = 'kritisch'
    else if (treueDelta <= -5 || wbzDelta >= 5) schwere = 'wichtig'
    else if (treueDelta <= -2 || wbzDelta >= 2) schwere = 'hinweis'
    if (!schwere) continue
    out.push({
      id: 'lf:' + id, typ: 'lieferant', schwere, lieferantId: id, lieferant: lf.name,
      wbzDelta, treueDelta, perioden: PERIODEN.length,
      artikel: betroffen.map((a) => ({ id: a.id, name: a.name })),
      titel: `Schleichendes Lieferproblem: ${lf.name}`,
      text: `Liefertreue ${h.treue[0]} % → ${h.treue[h.treue.length - 1]} % und Wiederbeschaffungszeit ${h.wbz[0]} → ${h.wbz[h.wbz.length - 1]} Tage über ${PERIODEN.length} Perioden. ` +
        `Keine einzelne Periode fällt auf — in Summe aber ein klarer Negativtrend, der ${betroffen.length} Artikel betrifft. Rückfrage beim Lieferanten / Zweitquelle prüfen.`
    })
  }
  return out.sort((a, b) => SCHWERE_RANG[a.schwere] - SCHWERE_RANG[b.schwere])
}

/** KI-Empfehlungen für einen optimierten Artikel-Datensatz. */
export function artikelEmpfehlungen(row, lieferantSignal = null) {
  const e = []
  if (row.status === 'unterdeckung') {
    e.push({ schwere: 'kritisch', titel: 'Jetzt nachbestellen', nutzen: 0,
      text: `Ist-Bestand ${row.istBestand.toLocaleString('de-DE')} liegt unter dem Meldebestand ${row.meldebestand.toLocaleString('de-DE')} — bei ${row.wbzTage} Tg Wiederbeschaffung droht eine Lücke. Optimal ${row.eoqMenge.toLocaleString('de-DE')} Stück bestellen.` })
  }
  if (row.status === 'ueberbestand') {
    e.push({ schwere: 'wichtig', titel: 'Überbestand abbauen', nutzen: row.ueberbestandWert,
      text: `${(row.istBestand - row.hoechstbestand).toLocaleString('de-DE')} Stück über Höchstbestand (Reichweite ${row.reichweiteTage} Tg) — rund ${row.ueberbestandWert.toLocaleString('de-DE')} € Kapital unnötig gebunden. Bestellpause / Abverkauf prüfen.` })
  }
  if (row.einsparpotenzial > 0 && Math.abs(row.aktBestellmenge - row.eoqMenge) / row.eoqMenge > 0.2) {
    e.push({ schwere: 'hinweis', titel: 'Losgröße optimieren', nutzen: row.einsparpotenzial,
      text: `Aktuelle Losgröße ${row.aktBestellmenge.toLocaleString('de-DE')} statt optimal ${row.eoqMenge.toLocaleString('de-DE')} Stück — Umstellung spart rund ${row.einsparpotenzial.toLocaleString('de-DE')} € pro Jahr.` })
  }
  if (lieferantSignal) {
    e.push({ schwere: lieferantSignal.schwere === 'kritisch' ? 'wichtig' : 'hinweis', titel: 'Lieferrisiko absichern', nutzen: 0,
      text: `Lieferant ${lieferantSignal.lieferant} verschlechtert sich schleichend (${lieferantSignal.text.split('.')[0]}). Sicherheitsbestand erhöhen oder Zweitquelle aufbauen.` })
  }
  if (!e.length) e.push({ schwere: 'hinweis', titel: 'Im Optimum', nutzen: 0, text: 'Bestellpolitik und Bestand liegen im wirtschaftlichen Korridor — keine Maßnahme nötig.' })
  return e.sort((a, b) => SCHWERE_RANG[a.schwere] - SCHWERE_RANG[b.schwere])
}

/** Gebündelte, sortierte Signal-/Maßnahmenliste (Lieferant + Artikel). */
export function signale(artikel = ARTIKEL) {
  const lfSig = lieferantenSignale(artikel)
  const lfMap = Object.fromEntries(lfSig.map((s) => [s.lieferantId, s]))
  const opt = optimierung(artikel)
  const artSig = []
  for (const row of opt.rows) {
    for (const emp of artikelEmpfehlungen(row, lfMap[row.lieferantId])) {
      if (emp.titel === 'Im Optimum' || emp.titel === 'Lieferrisiko absichern') continue
      artSig.push({
        id: `art:${row.id}:${emp.titel}`, typ: 'artikel', schwere: emp.schwere,
        artikelId: row.id, lieferantId: row.lieferantId,
        titel: `${row.name}: ${emp.titel}`, text: emp.text, nutzen: emp.nutzen || 0
      })
    }
  }
  return [...lfSig, ...artSig].sort((a, b) => SCHWERE_RANG[a.schwere] - SCHWERE_RANG[b.schwere])
}
