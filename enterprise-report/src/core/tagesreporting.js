// =========================================================================
//  TAGESREPORTING — der tägliche Blick: was ist heute passiert, wie steht es
//  gegen gestern? Operative Kernkennzahlen mit „seit gestern"-Delta und dem
//  Verlauf der letzten 14 Tage. Bewusst eigener, klar auffindbarer Einstieg.
// =========================================================================

const r0 = (x) => Math.round(x)
const r1 = (x) => Math.round(x * 10) / 10
export const HEUTE = '2026-06-22'

// Letzte 14 Tage je Kennzahl (Index 13 = heute). einheit: eur | stk | pct.
// richtung: 'hoch' = mehr ist besser, 'runter' = weniger ist besser.
export const KPIS = [
  { id: 'umsatz', name: 'Umsatz (Tag)', einheit: 'eur', richtung: 'hoch',
    reihe: [142000, 138500, 151000, 162000, 119000, 88000, 134000, 147500, 156000, 149000, 161000, 128000, 95000, 168500] },
  { id: 'auftragseingang', name: 'Auftragseingang (Tag)', einheit: 'eur', richtung: 'hoch',
    reihe: [158000, 149000, 167000, 171000, 132000, 96000, 145000, 159000, 172000, 165000, 158000, 141000, 102000, 181000] },
  { id: 'absatz', name: 'Absatzmenge (Stk)', einheit: 'stk', richtung: 'hoch',
    reihe: [320, 305, 348, 366, 270, 190, 300, 332, 351, 338, 360, 290, 205, 372] },
  { id: 'retouren', name: 'Retouren (Tag)', einheit: 'eur', richtung: 'runter',
    reihe: [8200, 7600, 9100, 11200, 6400, 3200, 7000, 8800, 9600, 7400, 8100, 9900, 4200, 13400] },
  { id: 'auftragsbestand', name: 'Offener Auftragsbestand', einheit: 'eur', richtung: 'hoch',
    reihe: [1410000, 1418000, 1432000, 1447000, 1452000, 1449000, 1455000, 1462000, 1471000, 1468000, 1474000, 1480000, 1485000, 1450000] }
]

/** Tageskennzahlen: heute, gestern, Delta abs/% und Bewertung (gut/schlecht). */
export function tageskennzahlen(kpis = KPIS) {
  return kpis.map((k) => {
    const n = k.reihe.length
    const heute = k.reihe[n - 1]
    const gestern = k.reihe[n - 2]
    const delta = heute - gestern
    const deltaPct = gestern ? r1(delta / Math.abs(gestern) * 100) : 0
    // gut = in die gewünschte Richtung
    const gut = k.richtung === 'runter' ? delta <= 0 : delta >= 0
    const schnitt = r0(k.reihe.reduce((a, b) => a + b, 0) / n)
    return { ...k, heute, gestern, delta, deltaPct, gut, schnitt, ueberSchnitt: heute >= schnitt }
  })
}

/** Knappe „Was ist heute passiert"-Zusammenfassung (auffällige Bewegungen). */
export function tagesHighlights(kpis = KPIS) {
  return tageskennzahlen(kpis)
    .map((k) => ({ id: k.id, name: k.name, deltaPct: k.deltaPct, gut: k.gut }))
    .filter((k) => Math.abs(k.deltaPct) >= 5)
    .sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct))
}
