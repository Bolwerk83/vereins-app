// =========================================================================
//  ABGLEICH Absatzmenge (Rechnungspositionen) ↔ Auftragseingang tatsächlich
//  (AET, WaWi). Wo laufen fakturierter Absatz und tatsächlicher Auftragseingang
//  auseinander? Differenz (abs/%) je Produkt + wahrscheinliche Ursache.
// =========================================================================

const r1 = (x) => Math.round(x * 10) / 10
export const TOLERANZ_PCT = 3 // |Abweichung| innerhalb → im Rahmen

// absatz = Summe Menge aus Rechnungspositionen; aet = Auftragseingang
// tatsächlich (WaWi) in Stück. ursache = plausibler Grund für die Differenz.
export const ZEILEN = [
  { id: 'ebike',      name: 'E-Bikes',       absatz: 22650, aet: 24000, ursache: 'Teillieferungen offen (Auftragsbestand)' },
  { id: 'akku',       name: 'Akkus 625Wh',   absatz: 30880, aet: 31000, ursache: '' },
  { id: 'rahmen',     name: 'Rahmen',        absatz: 26400, aet: 26000, ursache: 'Nachfakturierung Vorperiode' },
  { id: 'antrieb',    name: 'Antriebsteile', absatz: 57600, aet: 60000, ursache: 'Stornos nach Auftragseingang' },
  { id: 'bekleidung', name: 'Bekleidung',    absatz: 39200, aet: 40000, ursache: 'Verschiebung in Folgemonat' }
]

/** Abgleich je Produkt mit Differenz, %-Abweichung und Status. */
export function abgleich(zeilen = ZEILEN) {
  const rows = zeilen.map((z) => {
    const diff = z.absatz - z.aet
    const diffPct = z.aet ? r1(diff / z.aet * 100) : 0
    const imRahmen = Math.abs(diffPct) <= TOLERANZ_PCT
    return { ...z, diff, diffPct, imRahmen, status: imRahmen ? 'im Rahmen' : 'auffällig' }
  })
  return rows.sort((a, b) => Math.abs(b.diffPct) - Math.abs(a.diffPct))
}

/** Summen + wie viele Produkte außerhalb der Toleranz. */
export function gesamt(zeilen = ZEILEN) {
  const rows = abgleich(zeilen)
  const absatz = rows.reduce((n, r) => n + r.absatz, 0)
  const aet = rows.reduce((n, r) => n + r.aet, 0)
  const diff = absatz - aet
  return { absatz, aet, diff, diffPct: aet ? r1(diff / aet * 100) : 0, auffaellig: rows.filter((r) => !r.imRahmen).length }
}
