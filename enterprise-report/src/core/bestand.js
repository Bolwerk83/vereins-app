// =========================================================================
//  BESTANDS-/ARTIKEL-GÄNGIGKEIT — Vorratscontrolling: Renner/Penner,
//  ABC (Wert) und XYZ (Umschlag), Reichweite und Ladenhüter mit Abverkauf.
// =========================================================================

export const GAENGIGKEIT = [
  { id: 'renner',        name: 'Renner',         farbe: '#10b981', laie: 'Hoher Umschlag — gut bevorraten.' },
  { id: 'normal',        name: 'Normaldreher',   farbe: '#2563eb', laie: 'Solider Umschlag.' },
  { id: 'langsamdreher', name: 'Langsamdreher',  farbe: '#f59e0b', laie: 'Niedriger Umschlag — Bestände senken.' },
  { id: 'ladenhueter',   name: 'Ladenhüter',     farbe: '#ef4444', laie: 'Lange keine Bewegung — abverkaufen.' }
]
export const gaengigkeitInfo = (id) => GAENGIGKEIT.find((g) => g.id === id)

export function gaengigkeitVon(umschlag, letzteBewegungTage) {
  if (letzteBewegungTage > 180) return 'ladenhueter'
  if (umschlag >= 6) return 'renner'
  if (umschlag >= 3) return 'normal'
  return 'langsamdreher'
}
export const xyzVon = (umschlag) => (umschlag >= 6 ? 'X' : umschlag >= 3 ? 'Y' : 'Z')

// Artikel/Warengruppen: Bestand (Mio €), Umschlag (×/Jahr), Reichweite (Tage),
// letzte Bewegung (Tage her).
export const ARTIKEL = [
  { id: 'ebike',     name: 'E-Bikes',      bestand: 5.4, umschlag: 8.0, reichweite: 42,  letzteBewegung: 3 },
  { id: 'teile',     name: 'Teile',        bestand: 3.1, umschlag: 3.8, reichweite: 96,  letzteBewegung: 12 },
  { id: 'zubehoer',  name: 'Zubehör',      bestand: 1.3, umschlag: 6.2, reichweite: 58,  letzteBewegung: 5 },
  { id: 'bekleidung', name: 'Bekleidung',  bestand: 1.4, umschlag: 3.3, reichweite: 110, letzteBewegung: 40 },
  { id: 'auslauf',   name: 'Auslaufmodell 2023', bestand: 0.6, umschlag: 0.8, reichweite: 320, letzteBewegung: 210 }
]

const r1 = (x) => Math.round(x * 10) / 10

/** ABC nach Bestandswert (A bis 80 %, B bis 95 %, C Rest – kumuliert). */
function abcKlassen(rows) {
  const ges = rows.reduce((n, r) => n + r.bestand, 0) || 1
  const sortiert = [...rows].sort((a, b) => b.bestand - a.bestand)
  let kum = 0; const map = {}
  for (const r of sortiert) {
    kum += r.bestand / ges * 100
    map[r.id] = kum <= 80 ? 'A' : kum <= 95 ? 'B' : 'C'
  }
  return map
}

export function auswertung(artikel = ARTIKEL) {
  const abc = abcKlassen(artikel)
  const rows = artikel.map((a) => ({
    ...a, abc: abc[a.id], xyz: xyzVon(a.umschlag), gaengigkeit: gaengigkeitVon(a.umschlag, a.letzteBewegung)
  }))
  const ges = r1(rows.reduce((n, r) => n + r.bestand, 0))
  const ladenhueterWert = r1(rows.filter((r) => r.gaengigkeit === 'ladenhueter').reduce((n, r) => n + r.bestand, 0))
  const rennerWert = r1(rows.filter((r) => r.gaengigkeit === 'renner').reduce((n, r) => n + r.bestand, 0))
  const reichweiteSchnitt = Math.round(rows.reduce((n, r) => n + r.reichweite, 0) / rows.length)
  return { rows, gesamt: ges, ladenhueterWert, rennerWert, reichweiteSchnitt }
}
