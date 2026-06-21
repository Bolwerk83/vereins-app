// =========================================================================
//  PERIODENMODELL — Zeitbezug, Granularität und Datenherkunft je Periode.
//
//   1) Datumssicht  : nach welchem Datum wird die Periode bestimmt
//                     (Belegdatum, Bestelldatum, Lieferdatum, Zahldatum).
//   2) Granularität : Tag / Woche / Monat / Quartal / Jahr.
//   3) Datenart je Periode (Zuweisungstabelle):
//        ist           = abgeschlossener Monat aus der Buchhaltung
//        tagesreporting= laufender Monat: Auftragsdaten + Planauffüllung
//                        einzelner Konten (einstellbar)
//        plan / forecast = zukünftige Monate
//
//  Alles im Tool steuerbar, in localStorage gespeichert, jederzeit auf den
//  Standard zurücksetzbar (Monatsabschluss-Logik).
// =========================================================================

export const DATUMSSICHTEN = [
  { id: 'belegdatum',   name: 'Belegdatum',   hinweis: 'Standard – Rechnungs-/Belegdatum (Umsatz, GuV)' },
  { id: 'bestelldatum', name: 'Bestelldatum', hinweis: 'Auftragseingang – Vertriebsfrühindikator' },
  { id: 'lieferdatum',  name: 'Lieferdatum',  hinweis: 'Lieferung/Realisierung – Logistik' },
  { id: 'zahldatum',    name: 'Zahldatum',    hinweis: 'Zahlungseingang/-ausgang – Liquidität' }
]

export const GRANULARITAETEN = [
  { id: 'tag', name: 'Tag' }, { id: 'woche', name: 'Woche' }, { id: 'monat', name: 'Monat' },
  { id: 'quartal', name: 'Quartal' }, { id: 'jahr', name: 'Jahr' }
]

export const DATENARTEN = [
  { id: 'ist',            name: 'Ist (Buchhaltung)',           kurz: 'Ist', status: 'g',
    beschreibung: 'Abgeschlossener Monat aus Buchhaltungskonten – verbindlich, abgestimmt.' },
  { id: 'tagesreporting', name: 'Tagesreporting (Auftrag + Plan)', kurz: 'Tag-Rep', status: 'a',
    beschreibung: 'Laufender Monat: operative Auftragsdaten, ergänzt um Plan für einzelne Konten.' },
  { id: 'plan',           name: 'Plan',                        kurz: 'Plan', status: 'n',
    beschreibung: 'Zukünftiger Monat aus der Planung.' },
  { id: 'forecast',       name: 'Forecast (FC)',               kurz: 'FC', status: 'n',
    beschreibung: 'Zukünftiger Monat aus dem laufenden Forecast.' }
]
export const datenart = (id) => DATENARTEN.find((d) => d.id === id)

// --- Monate des Steuerungsjahres ----------------------------------------
// (Demo: Kalenderjahr des aktuellen Datums; im Echtbetrieb aus dem DWH.)
const HEUTE = new Date()
export const STEUERJAHR = HEUTE.getFullYear()
const AKT_MONAT = HEUTE.getMonth() + 1 // 1..12
export const MONATE = Array.from({ length: 12 }, (_, i) => `${STEUERJAHR}-${String(i + 1).padStart(2, '0')}`)
export const AKTUELLER_MONAT = `${STEUERJAHR}-${String(AKT_MONAT).padStart(2, '0')}`

// Konten, die im Tagesreporting typischerweise mit Plan aufgefüllt werden.
const STANDARD_PLANKONTEN = ['6200 Personalaufwand', '6500 Energie/Raum', '6900 Abschreibungen']

// Standard-Zuweisung: Vormonate = Ist, aktueller = Tagesreporting, Folge = Plan.
export function standardZuweisung() {
  const eintraege = {}
  MONATE.forEach((m) => {
    const nr = Number(m.slice(-2))
    eintraege[m] = nr < AKT_MONAT ? 'ist' : nr === AKT_MONAT ? 'tagesreporting' : 'plan'
  })
  return { datumssicht: 'belegdatum', granularitaet: 'monat', eintraege, planKonten: [...STANDARD_PLANKONTEN] }
}

const KEY = 'er_periodenmodell'

export function ladeModell() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const m = JSON.parse(raw)
      // fehlende Monate ergänzen (z. B. Jahreswechsel)
      const std = standardZuweisung()
      m.eintraege = { ...std.eintraege, ...m.eintraege }
      return { ...std, ...m }
    }
  } catch { /* Standard unten */ }
  return standardZuweisung()
}
function speichere(m) { localStorage.setItem(KEY, JSON.stringify(m)); return m }

export function setDatumssicht(id) { return speichere({ ...ladeModell(), datumssicht: id }) }
export function setGranularitaet(id) { return speichere({ ...ladeModell(), granularitaet: id }) }
export function setDatenart(periode, art) {
  const m = ladeModell()
  return speichere({ ...m, eintraege: { ...m.eintraege, [periode]: art } })
}
export function setPlanKonten(konten) { return speichere({ ...ladeModell(), planKonten: konten }) }
export function setzeStandard() { return speichere(standardZuweisung()) }

// Year-to-date-Mix als Klartext (für Hinweise im Bericht).
export function mixBeschreibung(m = ladeModell()) {
  const z = Object.values(m.eintraege)
  const n = (a) => z.filter((x) => x === a).length
  const teile = []
  if (n('ist')) teile.push(`${n('ist')} × Ist`)
  if (n('tagesreporting')) teile.push(`${n('tagesreporting')} × Tagesreporting`)
  if (n('plan')) teile.push(`${n('plan')} × Plan`)
  if (n('forecast')) teile.push(`${n('forecast')} × FC`)
  return teile.join(' · ')
}
