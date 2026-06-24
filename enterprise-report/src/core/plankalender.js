// =========================================================================
//  PLANKALENDER / DimKalender — kategoriespezifische Tageskalender, um einen
//  Monats-Planwert TAGGENAU zu verteilen. Beispiel Fixkosten: Mo–Sa = 1,
//  Sonntage = 0, Feiertage = 0, kurze Tage (Heiligabend/Silvester) = 0,5.
//  Onlineshop dagegen 24/7 (auch Feiertage = 1).
//
//  Daraus: Plan je Tag = Monatsplan × Tagesgewicht / Σ Gewichte. So lässt sich
//  später im Tagesreporting taggenau Ist gegen Plan stellen und der Monat aus
//  dem Tagesfortschritt hochrechnen.
//
//  Deterministisch (Kalender 2026). Wochentag-Index = JS getDay(): 0=So … 6=Sa.
// =========================================================================
export const JAHR = 2026
export const MONATSNAME = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
export const WOCHENTAGE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

// Gesetzliche Feiertage 2026 (bundesweit + gängige) als [monat0, tag].
const FEIERTAGE = [[0, 1], [3, 3], [3, 6], [4, 1], [4, 14], [4, 25], [9, 3], [11, 25], [11, 26]]
const FEIERTAG_NAME = { '0-1': 'Neujahr', '3-3': 'Karfreitag', '3-6': 'Ostermontag', '4-1': 'Tag der Arbeit', '4-14': 'Christi Himmelfahrt', '4-25': 'Pfingstmontag', '9-3': 'Tag der Dt. Einheit', '11-25': '1. Weihnachtstag', '11-26': '2. Weihnachtstag' }
// Kurze Tage (halber Plan).
const KURZ = [[11, 24], [11, 31]]
const enthaelt = (liste, m, t) => liste.some(([mm, tt]) => mm === m && tt === t)

// wochentage[]: Gewicht je Wochentag (0=So … 6=Sa).
export const KALENDER = [
  { id: 'fixkosten', name: 'Fixkosten', beschreibung: 'Mo–Sa = 1, So = 0, Feiertage = 0, kurze Tage = 0,5.', wochentage: [0, 1, 1, 1, 1, 1, 1], feiertageZu: true, kurz: 0.5 },
  { id: 'filiale', name: 'Filiale (Store)', beschreibung: 'Öffnungstage Mo–Sa, So geschlossen, Feiertage zu, kurze Tage = 0,5.', wochentage: [0, 1, 1, 1, 1, 1, 1], feiertageZu: true, kurz: 0.5 },
  { id: 'onlineshop', name: 'Onlineshop', beschreibung: '24/7 — jeder Tag = 1, auch Sonn-/Feiertage.', wochentage: [1, 1, 1, 1, 1, 1, 1], feiertageZu: false, kurz: 1 },
  { id: 'werktage', name: 'Verwaltung (Werktage)', beschreibung: 'Mo–Fr = 1, Wochenende = 0, Feiertage = 0, kurze Tage = 0,5.', wochentage: [0, 1, 1, 1, 1, 1, 0], feiertageZu: true, kurz: 0.5 },
]

const r2 = (x) => Math.round(x * 100) / 100
export function tageImMonat(monat) { return new Date(JAHR, monat + 1, 0).getDate() }

/** Tagesgewichte eines Kalenders für einen Monat. */
export function tagesgewichte(kalenderId, monat) {
  const kal = KALENDER.find((k) => k.id === kalenderId) || KALENDER[0]
  const n = tageImMonat(monat)
  const tage = []
  for (let t = 1; t <= n; t++) {
    const dow = new Date(JAHR, monat, t).getDay()
    const feiertag = kal.feiertageZu && enthaelt(FEIERTAGE, monat, t)
    const istKurz = enthaelt(KURZ, monat, t)
    let g = kal.wochentage[dow]
    if (feiertag) g = 0
    else if (istKurz) g = Math.min(g, kal.kurz)
    tage.push({ tag: t, dow, wochentag: WOCHENTAGE[dow], gewicht: g, feiertag, feiertagName: feiertag ? FEIERTAG_NAME[`${monat}-${t}`] : null, kurz: istKurz && g > 0 })
  }
  return tage
}

/** Verteilt einen Monatsplan taggenau nach Gewichten. */
export function verteilePlan(kalenderId, monat, monatsPlan = 0) {
  const tage = tagesgewichte(kalenderId, monat)
  const summe = tage.reduce((s, t) => s + t.gewicht, 0)
  const verteilt = tage.map((t) => ({ ...t, plan: summe ? r2(monatsPlan * t.gewicht / summe) : 0 }))
  return {
    tage: verteilt, summeGewicht: r2(summe), monatsPlan, planJeGewicht: summe ? r2(monatsPlan / summe) : 0,
    volleTage: tage.filter((t) => t.gewicht >= 1).length,
    halbeTage: tage.filter((t) => t.gewicht > 0 && t.gewicht < 1).length,
    geschlossen: tage.filter((t) => t.gewicht === 0).length,
  }
}

/**
 * Monatshochrechnung aus dem Tagesfortschritt:
 *   Hochrechnung = Ist-bis-Tag ÷ (Σ Gewicht bis Tag) × Σ Gewicht gesamt.
 */
export function monatsHochrechnung(kalenderId, monat, bisTag, istBisTag = 0) {
  const tage = tagesgewichte(kalenderId, monat)
  const bis = tage.filter((t) => t.tag <= bisTag).reduce((s, t) => s + t.gewicht, 0)
  const ges = tage.reduce((s, t) => s + t.gewicht, 0)
  return {
    gewichtBis: r2(bis), gewichtGesamt: r2(ges),
    fortschrittPct: ges ? +(bis / ges * 100).toFixed(1) : 0,
    hochrechnung: bis ? r2(istBisTag / bis * ges) : 0,
  }
}
