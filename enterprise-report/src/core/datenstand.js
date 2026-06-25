// =========================================================================
//  DATENSTAND — Frische/Stand der Daten je Quelle, Import-Jobs und
//  Fehler/Warnungen. Soll auf der Startseite und in den Berichten (immer)
//  angezeigt werden. Mock; später echte Import-Zeitstempel je Quelle.
// =========================================================================
export const QUELLEN_STAND = [
  { quelle: 'FiBu (Buchungen)',   stand: '2026-06-24 06:07', status: 'ok' },
  { quelle: 'Vertrieb / WaWi',   stand: '2026-06-24 06:22', status: 'ok' },
  { quelle: 'Versand / Carrier', stand: '2026-06-23 23:08', status: 'ok' },
  { quelle: 'Marktdaten (ZIV)',  stand: '2026-06-15 00:12', status: 'veraltet' }
]

export function gesamtStand() {
  return QUELLEN_STAND.map((q) => q.stand).sort()[0]
}
export const datenstandText = () => `Datenstand: ${gesamtStand()}`
export const alleAktuell = () => QUELLEN_STAND.every((q) => q.status === 'ok')

export const IMPORT_JOBS = [
  { id: 'fibu',    quelle: 'FiBu (Buchungen)',   zeitplan: 'täglich 06:00 Uhr',        letzterLauf: '2026-06-24 06:07', naechsterLauf: '2026-06-25 06:00', status: 'ok',       dauerSek: 43,  datensaetze: 12840 },
  { id: 'wawi',    quelle: 'Vertrieb / WaWi',    zeitplan: 'täglich 06:15 Uhr',        letzterLauf: '2026-06-24 06:22', naechsterLauf: '2026-06-25 06:15', status: 'ok',       dauerSek: 78,  datensaetze:  5320 },
  { id: 'carrier', quelle: 'Versand / Carrier',  zeitplan: 'täglich 23:00 Uhr',        letzterLauf: '2026-06-23 23:08', naechsterLauf: '2026-06-24 23:00', status: 'ok',       dauerSek: 21,  datensaetze:   890 },
  { id: 'ziv',     quelle: 'Marktdaten (ZIV)',   zeitplan: 'wöchentlich Mo 00:00 Uhr', letzterLauf: '2026-06-15 00:12', naechsterLauf: '2026-06-29 00:00', status: 'veraltet', dauerSek: 310, datensaetze:  4200 },
]

export const problemJobs = () => IMPORT_JOBS.filter((j) => j.status !== 'ok')

export function gesamtStatus() {
  const p = problemJobs()
  if (!p.length) return 'ok'
  if (p.some((j) => j.status === 'fehler')) return 'fehler'
  return 'warnung'
}

export const IMPORT_FEHLER = [
  { job: 'ziv', typ: 'warnung', meldung: 'Marktdaten älter als 7 Tage (letzter Stand: 2026-06-15). Nächster regulärer Import: Mo, 29.06.' }
]
