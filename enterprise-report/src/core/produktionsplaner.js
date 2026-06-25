// =========================================================================
//  PRODUKTIONSPLANER — terminiert Produktionsaufträge auf die Montagelinien.
//  Je Auftrag: Materialverfügbarkeit (BOM/Bestand → Machbarkeit), frühester
//  Start (Material bereit & Linie frei), Ende (Kapazität), Termin-Gefährdung.
//  Reihenfolge wahlweise nach Liefertermin oder Deckungsbeitrag.
// =========================================================================
import { machbarkeit, addTage, diffTage, HEUTE, artikelVon } from './beschaffung.js'

export const LINIEN = [{ id: 'L1', name: 'Montagelinie 1' }, { id: 'L2', name: 'Montagelinie 2' }]
export const DB_JE_STUECK = { 'ebike-city': 1100, 'trekking-pro': 720 } // € DB I je Rad
export const SORTIERUNGEN = [{ id: 'termin', name: 'Liefertermin' }, { id: 'db', name: 'Deckungsbeitrag' }]

export const AUFTRAEGE = [
  { id: 'PA-5001', bike: 'ebike-city', menge: 50, liefertermin: '2026-11-15' },
  { id: 'PA-5002', bike: 'trekking-pro', menge: 80, liefertermin: '2026-09-30' },
  { id: 'PA-5003', bike: 'ebike-city', menge: 30, liefertermin: '2026-12-20' },
  { id: 'PA-5004', bike: 'trekking-pro', menge: 40, liefertermin: '2026-08-31' },
  { id: 'PA-5005', bike: 'ebike-city', menge: 20, liefertermin: '2026-10-10' },
]

/** Plant alle Aufträge auf die Linien. sortBy: 'termin' | 'db'. */
export function plane(sortBy = 'termin', { puffer = 7 } = {}) {
  const lineFree = LINIEN.map(() => HEUTE)
  const liste = AUFTRAEGE.map((a) => {
    // Ohne Stückliste liefert machbarkeit() null — dann keine Komponenten-
    // Beschaffung, Produktionszeit aus der Linienkapazität (ceil(menge/12)+2).
    const m = machbarkeit(a.bike, a.menge, { puffer }) || { fehlteile: 0, kritBeschaffungTage: 0, produktionsTage: Math.ceil(a.menge / 12) + 2 }
    const db = DB_JE_STUECK[a.bike] || 0
    return { ...a, name: artikelVon(a.bike)?.name || a.bike, fehlteile: m.fehlteile, materialReady: addTage(HEUTE, m.kritBeschaffungTage), prodTage: m.produktionsTage, dbStueck: db, dbBeitrag: a.menge * db }
  })
  liste.sort((x, y) => (sortBy === 'db' ? y.dbBeitrag - x.dbBeitrag : (x.liefertermin < y.liefertermin ? -1 : x.liefertermin > y.liefertermin ? 1 : 0)))
  const auftraege = liste.map((a) => {
    let li = 0
    for (let i = 1; i < lineFree.length; i++) if (lineFree[i] < lineFree[li]) li = i
    const start = a.materialReady > lineFree[li] ? a.materialReady : lineFree[li]
    const ende = addTage(start, a.prodTage)
    lineFree[li] = ende
    const puenktlich = ende <= a.liefertermin
    return {
      ...a, linie: LINIEN[li].id, linieName: LINIEN[li].name, start, ende, puenktlich,
      material: a.fehlteile === 0 ? 'g' : (puenktlich ? 'a' : 'r'),
      status: puenktlich ? 'plan' : 'gefaehrdet', tageZumTermin: diffTage(a.liefertermin, ende),
    }
  })
  const ende = auftraege.reduce((mx, a) => (a.ende > mx ? a.ende : mx), HEUTE)
  return {
    auftraege, linien: LINIEN, ende,
    gefaehrdet: auftraege.filter((a) => !a.puenktlich).length,
    dbGesamt: auftraege.reduce((n, a) => n + a.dbBeitrag, 0),
    dbPuenktlich: auftraege.filter((a) => a.puenktlich).reduce((n, a) => n + a.dbBeitrag, 0),
    raederGesamt: auftraege.reduce((n, a) => n + a.menge, 0),
  }
}

/** Vergleicht beide Reihenfolgen und empfiehlt die bessere. */
export function empfehlung() {
  const t = plane('termin'), d = plane('db')
  // Weniger gefährdete Aufträge gewinnen; bei Gleichstand der höhere pünktliche DB.
  const besser = t.gefaehrdet !== d.gefaehrdet
    ? (t.gefaehrdet < d.gefaehrdet ? 'termin' : 'db')
    : (d.dbPuenktlich > t.dbPuenktlich ? 'db' : 'termin')
  return { besser, termin: t, db: d }
}
