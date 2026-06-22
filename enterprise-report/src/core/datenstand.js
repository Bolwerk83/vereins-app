// =========================================================================
//  DATENSTAND — Frische/Stand der Daten je Quelle und gesamt. Soll in den
//  Berichten IMMER angezeigt werden (Vertrauen/Nachvollziehbarkeit). Mock;
//  später echte Import-Zeitstempel je Quelle.
// =========================================================================
export const QUELLEN_STAND = [
  { quelle: 'FiBu (Buchungen)', stand: '2026-06-22 06:15', status: 'ok' },
  { quelle: 'Vertrieb / WaWi', stand: '2026-06-22 06:40', status: 'ok' },
  { quelle: 'Versand / Carrier', stand: '2026-06-21 23:50', status: 'ok' },
  { quelle: 'Marktdaten (ZIV)', stand: '2026-06-15 00:00', status: 'ok' }
]
/** Gesamt-Datenstand = ältester relevanter Import (so „alt" ist der Bericht
 *  mindestens). */
export function gesamtStand() {
  return QUELLEN_STAND.map((q) => q.stand).sort()[0]
}
export const datenstandText = () => `Datenstand: ${gesamtStand()}`
export const alleAktuell = () => QUELLEN_STAND.every((q) => q.status === 'ok')
