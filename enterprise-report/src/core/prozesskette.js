// =========================================================================
//  PROZESSKETTE Angebot → Umsatz. Ab AEB Verzweigung in:
//    - Lieferkette (physischer Fluss: Produktion → Lager → Versand)
//    - Wertschöpfungskette (Geldfluss: Fakturierung → Umsatz)
//  (Backlog #7)
// =========================================================================

const r1 = (x) => Math.round(x * 10) / 10

export const STUFEN = [
  { code: 'ANGE', name: 'Angebotseingang',          wert: 6200000, kette: null,
    abgaenge: [{ name: 'Verlorene Angebote (VANGE)', wert: 1300000 }, { name: 'Offene Angebote (in Arbeit)', wert: 800000 }] },
  { code: 'AE',  name: 'Auftragseingang',            wert: 4100000, kette: null,
    abgaenge: [{ name: 'Stornierte Aufträge (STORAE)', wert: 180000 }] },
  { code: 'AEB', name: 'Auftragseingang bereinigt',  wert: 3920000,
    kette: 'Verzweigung: Lieferkette & Wertschöpfungskette', abgaenge: [] },
]

export const LIEFERKETTE = [
  { code: 'AEB',   name: 'AEB → Produktionsauftrag',  wert: 3920000, abgaenge: [{ name: 'Noch nicht eingelastet (Rückstand)', wert: 70000 }] },
  { code: 'PROD',  name: 'Produktion freigegeben',     wert: 3850000, abgaenge: [{ name: 'Ausschuss / Nacharbeit',              wert: 30000 }] },
  { code: 'LAGER', name: 'Fertigware / Lager',         wert: 3820000, abgaenge: [{ name: 'Noch nicht versandt',                 wert: 70000 }] },
  { code: 'VERS',  name: 'Versand / Auslieferung',     wert: 3750000, abgaenge: [] },
]

export const WERTSCHOEPFUNG = [
  { code: 'AEB', name: 'AEB → Fakturierungsbereit',    wert: 3920000, abgaenge: [{ name: 'Noch nicht fakturiert / NFA', wert: 220000 }] },
  { code: 'AET', name: 'AE tatsächlich (fakturiert)',  wert: 3700000, abgaenge: [] },
  { code: 'UMS', name: 'Umsatzerlöse',                 wert: 3700000, abgaenge: [] },
]

export function funnel(stufen = STUFEN) {
  const start = stufen[0]?.wert || 1
  return stufen.map((s, i) => {
    const vorher = i > 0 ? stufen[i - 1].wert : s.wert
    return { ...s, anteilStart: r1(s.wert / start * 100), stufenKonversion: i > 0 ? r1(s.wert / vorher * 100) : 100 }
  })
}

export function lieferkette() {
  const start = LIEFERKETTE[0]?.wert || 1
  return LIEFERKETTE.map((s, i) => {
    const vorher = i > 0 ? LIEFERKETTE[i - 1].wert : s.wert
    return { ...s, anteilStart: r1(s.wert / start * 100), stufenKonversion: i > 0 ? r1(s.wert / vorher * 100) : 100 }
  })
}

export function wertschoepfung() {
  const start = WERTSCHOEPFUNG[0]?.wert || 1
  return WERTSCHOEPFUNG.map((s, i) => {
    const vorher = i > 0 ? WERTSCHOEPFUNG[i - 1].wert : s.wert
    return { ...s, anteilStart: r1(s.wert / start * 100), stufenKonversion: i > 0 ? r1(s.wert / vorher * 100) : 100 }
  })
}

export function gesamtKonversion(stufen = STUFEN) {
  const ums   = WERTSCHOEPFUNG[WERTSCHOEPFUNG.length - 1]?.wert || 0
  const start = stufen[0]?.wert || 1
  return r1(ums / start * 100)
}
