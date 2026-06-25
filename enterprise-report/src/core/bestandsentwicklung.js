// =========================================================================
//  BESTANDSENTWICKLUNG + KI-GEGENSTEUERUNG — Verlauf je Warenbereich,
//  Reichweite (DIO), Zielbestand & Frist und ob das aktuelle Abverkaufstempo
//  reicht. Wenn nicht: konkrete KI-Maßnahmen zur Zielerreichung/Gegensteuerung.
//  Beträge in € (Bestandswert). Monatsabgang = Wertabgang/Monat.
// =========================================================================
export const MONATE = ['Nov', 'Dez', 'Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun']

const WB = [
  { id: 'ebike', name: 'E-Bikes', verlauf: [3000000, 3100000, 2900000, 2800000, 2700000, 2600000, 2550000, 2500000], ziel: 2400000, fristMonate: 3, monatsabgang: 1600000 },
  { id: 'city', name: 'City/Trekking', verlauf: [1700000, 1650000, 1600000, 1550000, 1500000, 1450000, 1420000, 1400000], ziel: 1100000, fristMonate: 4, monatsabgang: 420000 },
  { id: 'teile', name: 'Teile', verlauf: [1300000, 1200000, 1100000, 1050000, 1000000, 950000, 920000, 900000], ziel: 1050000, fristMonate: 2, monatsabgang: 500000 },
  { id: 'bekleidung', name: 'Bekleidung', verlauf: [1350000, 1340000, 1330000, 1300000, 1280000, 1250000, 1220000, 1200000], ziel: 500000, fristMonate: 6, monatsabgang: 60000 },
  { id: 'zubehoer', name: 'Zubehör', verlauf: [850000, 830000, 800000, 780000, 750000, 720000, 710000, 700000], ziel: 550000, fristMonate: 4, monatsabgang: 120000 }
]

function reichweiteTage(aktuell, monatsabgang) { return monatsabgang ? Math.round(aktuell / monatsabgang * 30) : 999 }
export function reichweiteStatus(tage) { return tage < 20 ? 'r' : tage <= 60 ? 'g' : tage <= 120 ? 'a' : 'r' } // <20 Unterbestand, >120 Überbestand

/** Prognose: reicht das aktuelle Abverkaufstempo, um den Zielbestand in der
 *  Frist zu erreichen? */
export function prognose(wb) {
  const aktuell = wb.verlauf[wb.verlauf.length - 1]
  if (aktuell <= wb.ziel) {
    // Unterbestand → Nachbestellung nötig
    return { typ: 'unter', aktuell, luecke: wb.ziel - aktuell, erreicht: false, benoetigterAbgang: 0, mehrBedarfPct: 0 }
  }
  const abzubauen = aktuell - wb.ziel
  const reduktionInFrist = wb.monatsabgang * wb.fristMonate
  const benoetigterAbgang = abzubauen / wb.fristMonate
  const erreicht = reduktionInFrist >= abzubauen
  const mehrBedarfPct = wb.monatsabgang ? Math.max(0, (benoetigterAbgang - wb.monatsabgang) / wb.monatsabgang * 100) : 0
  return { typ: 'ueber', aktuell, abzubauen, reduktionInFrist, benoetigterAbgang, erreicht, mehrBedarfPct }
}

/** Warenbereiche angereichert (aktuell, Reichweite, Trend, Prognose). */
export function warenbereiche() {
  return WB.map((wb) => {
    const aktuell = wb.verlauf[wb.verlauf.length - 1]
    const tage = reichweiteTage(aktuell, wb.monatsabgang)
    const trend = aktuell - wb.verlauf[0]
    return { ...wb, aktuell, reichweiteTage: tage, reichweiteStatus: reichweiteStatus(tage), trend, ueberbestand: Math.max(0, aktuell - wb.ziel), prognose: prognose(wb) }
  })
}

export function gesamt() {
  const w = warenbereiche()
  return {
    bestand: w.reduce((n, x) => n + x.aktuell, 0),
    ueberbestand: w.reduce((n, x) => n + x.ueberbestand, 0),
    oReichweite: Math.round(w.reduce((n, x) => n + x.reichweiteTage, 0) / w.length),
    kritisch: w.filter((x) => x.prognose.typ === 'ueber' && !x.prognose.erreicht).length
  }
}

/** KI-Maßnahmen je Warenbereich (Gegensteuerung), abhängig von der Lage. */
export function massnahmenFuer(wb) {
  const p = wb.prognose; const m = []
  if (p.typ === 'unter') {
    m.push({ titel: `${wb.name}: Nachbestellung auslösen (${eurK(wb.ziel - wb.aktuell)} bis Zielbestand)`, hebel: 'Beschaffung', erwartet: 'Lieferfähigkeit sichern', prio: 'hoch' })
    m.push({ titel: `${wb.name}: Melde-/Sicherheitsbestand anheben`, hebel: 'Disposition', erwartet: 'weniger Fehlmengen', prio: 'mittel' })
    return m
  }
  // Überbestand
  if (!p.erreicht) {
    m.push({ titel: `${wb.name}: Abverkaufs-Aktion (Bundle/Rabattstaffel)`, hebel: 'Vertrieb/Marketing', erwartet: `Abverkauf +${Math.round(p.mehrBedarfPct)} % nötig`, prio: 'hoch' })
    m.push({ titel: `${wb.name}: Nachbestellungen stoppen / Bestellmengen kürzen`, hebel: 'Disposition', erwartet: 'kein weiterer Aufbau', prio: 'hoch' })
    m.push({ titel: `${wb.name}: Outlet/Marktplatz & Cross-Selling platzieren`, hebel: 'Vertrieb', erwartet: 'zusätzlicher Abfluss', prio: 'mittel' })
    if (wb.reichweiteTage > 200) m.push({ titel: `${wb.name}: Lieferanten-Retoure/Sonderkondition prüfen`, hebel: 'Einkauf', erwartet: 'Kapital freisetzen', prio: 'mittel' })
  } else if (wb.reichweiteStatus === 'a') {
    m.push({ titel: `${wb.name}: Bestellmenge leicht senken, Reichweite beobachten`, hebel: 'Disposition', erwartet: 'Reichweite Richtung 60–90 Tg', prio: 'gering' })
  }
  return m
}
function eurK(n) { return Math.round(n / 1000).toLocaleString('de-DE') + ' T€' }
