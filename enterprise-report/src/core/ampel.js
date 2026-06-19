// =========================================================================
//  Ampel- & Trendlogik — zentral und EINHEITLICH für alle KPIs.
//  Eine KPI bestimmt ihren Status NICHT selbst; sie liefert nur Wert + Ziel
//  + Schwellen + Richtung, und diese Funktion entscheidet die Farbe.
// =========================================================================

/**
 * richtung: 'hoch_gut'  -> höher ist besser (z. B. Umsatz, Liefertreue)
 *           'tief_gut'  -> tiefer ist besser (z. B. Lagerbestand, Retouren)
 * schwellen: { warn, schlecht } als ABSTAND zum Ziel in Prozent ODER absolut –
 *            wir interpretieren sie als Zielerreichungs-Schwellen (s. u.).
 *
 * Logik (zielbezogen):
 *   erfuellung = wert / ziel (bei 'hoch_gut') bzw. ziel / wert (bei 'tief_gut')
 *   >= 1.0  -> g (grün)   |   >= warn -> a (amber)   |   sonst r (rot)
 */
export function ampelStatus({ wert, ziel, richtung = 'hoch_gut', warn = 0.95 }) {
  if (wert == null || ziel == null) return 'n'
  const erfuellung = richtung === 'tief_gut' ? ziel / wert : wert / ziel
  if (erfuellung >= 1.0) return 'g'
  if (erfuellung >= warn) return 'a'
  return 'r'
}

/** Trend aus Historie (Zeitreihe, ältester -> neuester). */
export function trendAusHistorie(reihe = [], richtung = 'hoch_gut') {
  if (reihe.length < 2) return { trend: 'flat', delta: 0, deltaPct: 0 }
  const neu = reihe[reihe.length - 1]
  const alt = reihe[reihe.length - 2]
  const delta = neu - alt
  const deltaPct = alt !== 0 ? (delta / Math.abs(alt)) * 100 : 0
  let trend = 'flat'
  if (Math.abs(deltaPct) >= 0.5) trend = delta > 0 ? 'up' : 'down'
  // "gut?" interpretiert die Richtung — nur informativ, Farbe macht ampelStatus.
  const istGut = richtung === 'tief_gut' ? delta < 0 : delta > 0
  return { trend, delta, deltaPct, istGut }
}
