// =========================================================================
//  AUFTRAGS-STATUS-JOURNAL — Statuswechsel als datierte Bewegungen (wie
//  Buchungen). Menge wandert von Status A nach Status B an einem Datum:
//     01.01 Eingang →offen 2 · 05.01 offen→geliefert 1 · offen→storniert 1 ·
//     10.01 geliefert→bezahlt 1 …
//  Daraus laufende Bestände je Status und die Kennzahlen Auftragseingang,
//  AEB (bereinigt = ohne Storno & verlorene Angebote), Auftragsbestand
//  (offen), Geliefert (Umsatzbasis), Storniert, Bezahlt (Liquidität).
// =========================================================================
export const STATUS = [
  { id: 'angebot', name: 'Angebot', farbe: 'var(--muted)' },
  { id: 'offen', name: 'Auftrag offen', farbe: 'var(--accent)' },
  { id: 'geliefert', name: 'Geliefert', farbe: 'var(--amp-g)' },
  { id: 'bezahlt', name: 'Bezahlt', farbe: '#16a34a' },
  { id: 'storniert', name: 'Storniert', farbe: 'var(--amp-r)' },
  { id: 'verloren', name: 'Verloren', farbe: '#92400e' },
]
export const STATUS_NAME = Object.fromEntries(STATUS.map((s) => [s.id, s.name]))

// Buchungsjournal (Demo): von=null → Neuzugang in den Zielstatus.
export const BEWEGUNGEN = [
  // Beispiel aus der Anforderung (A-1001: 2 Bikes)
  { datum: '2026-01-01', auftrag: 'A-1001', artikel: 'E-Bike City', von: null, nach: 'offen', menge: 2, art: 'Auftragseingang', wert: 7000 },
  { datum: '2026-01-05', auftrag: 'A-1001', artikel: 'E-Bike City', von: 'offen', nach: 'geliefert', menge: 1, art: 'Lieferung', wert: 3500 },
  { datum: '2026-01-05', auftrag: 'A-1001', artikel: 'E-Bike City', von: 'offen', nach: 'storniert', menge: 1, art: 'Storno', wert: 3500 },
  { datum: '2026-01-10', auftrag: 'A-1001', artikel: 'E-Bike City', von: 'geliefert', nach: 'bezahlt', menge: 1, art: 'Zahlungseingang', wert: 3500 },
  // Angebot mit Teil-Gewinn (für AEB / verlorene Angebote)
  { datum: '2026-01-03', auftrag: 'AN-2001', artikel: 'Trekking Pro', von: null, nach: 'angebot', menge: 3, art: 'Angebot', wert: 9000 },
  { datum: '2026-01-08', auftrag: 'AN-2001', artikel: 'Trekking Pro', von: 'angebot', nach: 'offen', menge: 2, art: 'Auftragseingang', wert: 6000 },
  { datum: '2026-01-08', auftrag: 'AN-2001', artikel: 'Trekking Pro', von: 'angebot', nach: 'verloren', menge: 1, art: 'Angebot verloren', wert: 3000 },
  { datum: '2026-01-12', auftrag: 'AN-2001', artikel: 'Trekking Pro', von: 'offen', nach: 'geliefert', menge: 2, art: 'Lieferung', wert: 6000 },
  { datum: '2026-01-15', auftrag: 'AN-2001', artikel: 'Trekking Pro', von: 'geliefert', nach: 'bezahlt', menge: 2, art: 'Zahlungseingang', wert: 6000 },
  // Direktauftrag, noch offen
  { datum: '2026-01-14', auftrag: 'A-1002', artikel: 'Lastenrad', von: null, nach: 'offen', menge: 4, art: 'Auftragseingang', wert: 16000 },
  { datum: '2026-01-20', auftrag: 'A-1002', artikel: 'Lastenrad', von: 'offen', nach: 'geliefert', menge: 1, art: 'Lieferung', wert: 4000 },
]

const r0 = (x) => Math.round(x)
export const fmtDatum = (d) => { const [, m, t] = d.split('-'); return `${t}.${m}.` }

/** Journal sortiert nach Datum, mit laufenden Beständen je Status (kumuliert). */
export function journal(bisDatum = null) {
  const bw = [...BEWEGUNGEN].filter((b) => !bisDatum || b.datum <= bisDatum).sort((a, b) => (a.datum < b.datum ? -1 : a.datum > b.datum ? 1 : 0))
  const bestand = Object.fromEntries(STATUS.map((s) => [s.id, 0]))
  return bw.map((b) => {
    if (b.von) bestand[b.von] -= b.menge
    if (b.nach) bestand[b.nach] += b.menge
    return { ...b, bestand: { ...bestand } }
  })
}

/** Bestände je Status zu einem Stichtag. */
export function bestaende(bisDatum = null) {
  const j = journal(bisDatum)
  return j.length ? j[j.length - 1].bestand : Object.fromEntries(STATUS.map((s) => [s.id, 0]))
}

/** Status-Kennzahlen (Mengen) zu einem Stichtag. */
export function kennzahlen(bisDatum = null) {
  const bw = BEWEGUNGEN.filter((b) => !bisDatum || b.datum <= bisDatum)
  const summe = (pred, feld = 'menge') => bw.filter(pred).reduce((n, b) => n + b[feld], 0)
  const auftragseingang = summe((b) => b.nach === 'offen' && (b.von === null || b.von === 'angebot'))
  const storniert = summe((b) => b.nach === 'storniert')
  const verloren = summe((b) => b.nach === 'verloren')
  const geliefert = summe((b) => b.nach === 'geliefert')
  const b = bestaende(bisDatum)
  const angeboteGesamt = summe((b2) => b2.nach === 'angebot')
  const gewonnen = summe((b2) => b2.von === 'angebot' && b2.nach === 'offen')
  return {
    auftragseingang, aeb: auftragseingang - storniert, storniert, verloren, geliefert,
    auftragsbestand: b.offen, bezahlt: b.bezahlt, offenAngebot: b.angebot,
    stornoquote: auftragseingang ? +(storniert / auftragseingang * 100).toFixed(1) : 0,
    angebotsErfolgsquote: angeboteGesamt ? +(gewonnen / angeboteGesamt * 100).toFixed(1) : 0,
    geliefertWert: r0(summe((b2) => b2.nach === 'geliefert', 'wert')),
    bezahltWert: r0(BEWEGUNGEN.filter((x) => (!bisDatum || x.datum <= bisDatum)).filter((x) => x.nach === 'bezahlt').reduce((n, x) => n + x.wert, 0)),
  }
}

/** Status-Verlauf EINES Auftrags (Datum je Statuswechsel — wie Buchungsdatum). */
export function auftragHistorie(auftragId) {
  return BEWEGUNGEN.filter((b) => b.auftrag === auftragId).sort((a, b) => (a.datum < b.datum ? -1 : 1))
}

/** Liste der Auftrags-/Angebots-IDs. */
export function auftragsIds() {
  return [...new Set(BEWEGUNGEN.map((b) => b.auftrag))]
}
