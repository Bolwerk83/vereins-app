// =========================================================================
//  PROZESSKETTE Angebot → Umsatz (Vertriebs-Funnel).
//  Zeigt, wie aus dem Angebotseingang über mehrere Stufen die Umsatzerlöse
//  werden — mit den „Abgängen" (verlorene/offene Angebote, Stornos, noch nicht
//  fakturiert) je Stufe. Ab dem bereinigten Auftragseingang (AEB) wird die
//  Lieferkette angestoßen; die Wertschöpfungskette läuft bis zu den Umsatzerlösen.
//  Werte als in sich konsistenter Funnel (Demo).
// =========================================================================

const r1 = (x) => Math.round(x * 10) / 10

// Stufen des Funnels mit den Abgängen, die zur nächsten Stufe führen.
export const STUFEN = [
  { code: 'ANGE', name: 'Angebotseingang', wert: 6200000, kette: null,
    abgaenge: [
      { name: 'Verlorene Angebote (VANGE)', wert: 1300000 },
      { name: 'Offene Angebote (in Arbeit)', wert: 800000 }
    ] },
  { code: 'AE', name: 'Auftragseingang', wert: 4100000, kette: null,
    abgaenge: [{ name: 'Stornierte Aufträge (STORAE)', wert: 180000 }] },
  { code: 'AEB', name: 'Auftragseingang bereinigt', wert: 3920000, kette: 'Lieferkette ab hier angestoßen',
    abgaenge: [{ name: 'Noch nicht fakturiert / in Lieferung (NFA)', wert: 220000 }] },
  { code: 'AET', name: 'Auftragseingang tatsächlich (fakturiert)', wert: 3700000, kette: 'Wertschöpfungskette', abgaenge: [] },
  { code: 'UMS', name: 'Umsatzerlöse', wert: 3700000, kette: null, abgaenge: [] }
]

/** Funnel mit Konversion je Stufe (Anteil am Start) und Stufen-Konversion. */
export function funnel(stufen = STUFEN) {
  const start = stufen[0]?.wert || 1
  return stufen.map((s, i) => {
    const abgangSumme = (s.abgaenge || []).reduce((n, a) => n + a.wert, 0)
    const vorher = i > 0 ? stufen[i - 1].wert : s.wert
    return {
      ...s, abgangSumme,
      anteilStart: r1(s.wert / start * 100),                  // % vom Angebotseingang
      stufenKonversion: i > 0 ? r1(s.wert / vorher * 100) : 100 // % der Vorstufe
    }
  })
}

/** Gesamtkonversion Angebot → Umsatz (%). */
export function gesamtKonversion(stufen = STUFEN) {
  const start = stufen[0]?.wert || 1
  const ende = stufen[stufen.length - 1]?.wert || 0
  return r1(ende / start * 100)
}
