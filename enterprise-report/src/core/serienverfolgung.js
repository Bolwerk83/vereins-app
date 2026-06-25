// =========================================================================
//  SERIENVERFOLGUNG — Service-/Retoure-Cockpit + Zoll-Traceability.
//  Von der BikeID bis zu Rahmen-/Gabel-/Motor-/Akkunummer: 360°-Sicht je Rad
//  (Modell, Seriennummern, Kunde, Kaufdatum, Bewegungsjournal). Für den
//  Zollnachweis: je Wareneingangs-/Zollnummer der Mengenverbleib
//  (Lager · Produktion · Kunde · verschrottet) mit lückenlosem Audit-Trail.
// =========================================================================

export const ORTE = ['Lager', 'Produktion', 'Kunde', 'verschrottet']
export const ORT_STATUS = {
  Lager: { farbe: 'var(--accent)', icon: '📦' }, Produktion: { farbe: 'var(--amp-a)', icon: '🏭' },
  Kunde: { farbe: 'var(--amp-g)', icon: '✅' }, verschrottet: { farbe: 'var(--amp-r)', icon: '🗑' },
}

// Wareneingangs-/Zollchargen (z. B. 100 Rahmen aus einer Zollanmeldung).
export const CHARGEN = [
  { zollNr: 'ZL-2026-0041', artikel: 'Aluminium-Rahmen 28"', menge: 100, eingang: '2026-01-18', lieferant: 'BikeParts Asia Ltd.', land: 'CN' },
  { zollNr: 'ZL-2026-0052', artikel: 'Mittelmotor 250 W', menge: 60, eingang: '2026-02-05', lieferant: 'Velo Components GmbH', land: 'DE' },
  { zollNr: 'ZL-2026-0067', artikel: 'Akku 625 Wh', menge: 80, eingang: '2026-02-22', lieferant: 'BikeParts Asia Ltd.', land: 'CN' },
]
export const chargeVon = (zollNr) => CHARGEN.find((c) => c.zollNr === zollNr) || null

// Räder mit Seriennummern (Rahmen/Gabel/Motor/Akku) und Bezug zur Rahmen-Charge.
export const BIKES = [
  { bikeId: 'BK-100231', modell: 'E-Bike City 500', kunde: 'Onlineshop / M. Vogel', auftrag: 'SO-88231', kaufdatum: '2026-03-12', ort: 'Kunde',
    serien: { rahmen: 'RA-0041-007', gabel: 'GA-7781', motor: 'MO-0052-014', akku: 'AK-0067-031' }, charge: 'ZL-2026-0041' },
  { bikeId: 'BK-100244', modell: 'E-MTB Trail Pro', kunde: 'Radhaus Müller e.K.', auftrag: 'SO-88245', kaufdatum: '2026-03-20', ort: 'Kunde',
    serien: { rahmen: 'RA-0041-012', gabel: 'GA-7790', motor: 'MO-0052-021', akku: 'AK-0067-040' }, charge: 'ZL-2026-0041' },
  { bikeId: 'BK-100258', modell: 'E-Bike City 500', kunde: '—', auftrag: '—', kaufdatum: null, ort: 'Produktion',
    serien: { rahmen: 'RA-0041-033', gabel: 'GA-7802', motor: 'MO-0052-028', akku: 'AK-0067-052' }, charge: 'ZL-2026-0041' },
  { bikeId: 'BK-100262', modell: 'E-Bike City 500', kunde: '—', auftrag: '—', kaufdatum: null, ort: 'Lager',
    serien: { rahmen: 'RA-0041-058', gabel: 'GA-7811', motor: null, akku: null }, charge: 'ZL-2026-0041' },
  { bikeId: 'BK-100270', modell: 'E-MTB Trail Pro', kunde: 'Velo Schweiz AG', auftrag: 'SO-88277', kaufdatum: '2026-04-02', ort: 'Kunde',
    serien: { rahmen: 'RA-0041-061', gabel: 'GA-7820', motor: 'MO-0052-035', akku: 'AK-0067-066' }, charge: 'ZL-2026-0041' },
  { bikeId: 'BK-100281', modell: 'E-Bike City 500', kunde: '— (Transportschaden)', auftrag: '—', kaufdatum: null, ort: 'verschrottet',
    serien: { rahmen: 'RA-0041-074', gabel: 'GA-7831', motor: 'MO-0052-041', akku: null }, charge: 'ZL-2026-0041' },
]
export const bikeVon = (id) => BIKES.find((b) => b.bikeId === id) || null

// Bewegungsjournal (Serien-/Stück-Ebene) — Audit-Trail für Service & Zoll.
export const BEWEGUNGEN = [
  { datum: '2026-01-18', bikeId: null, charge: 'ZL-2026-0041', von: '—', nach: 'Lager', status: 'Wareneingang (Zoll)', ort: 'Fach A-12', beleg: 'WE-4471' },
  { datum: '2026-02-10', bikeId: 'BK-100231', charge: 'ZL-2026-0041', von: 'Lager', nach: 'Produktion', status: 'Kommissioniert', ort: 'Linie 1', beleg: 'FA-77120' },
  { datum: '2026-03-02', bikeId: 'BK-100231', charge: 'ZL-2026-0041', von: 'Produktion', nach: 'Lager', status: 'Endmontage fertig', ort: 'Fach V-03', beleg: 'FA-77120' },
  { datum: '2026-03-12', bikeId: 'BK-100231', charge: 'ZL-2026-0041', von: 'Lager', nach: 'Kunde', status: 'Ausgeliefert', ort: 'Versand', beleg: 'AR-2025-04412' },
  { datum: '2026-03-20', bikeId: 'BK-100244', charge: 'ZL-2026-0041', von: 'Lager', nach: 'Kunde', status: 'Ausgeliefert', ort: 'Versand', beleg: 'SO-88245' },
  { datum: '2026-02-28', bikeId: 'BK-100281', charge: 'ZL-2026-0041', von: 'Produktion', nach: 'verschrottet', status: 'Transportschaden', ort: 'Q-Sperrlager', beleg: 'QS-0093' },
]
export const journalFuer = (pred) => BEWEGUNGEN.filter(pred).slice().sort((a, b) => (a.datum < b.datum ? -1 : 1))

/** 360°-Suche: BikeID, Seriennummer (Rahmen/Gabel/Motor/Akku), Auftrag oder Kunde. */
export function suche(query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return []
  return BIKES.filter((b) => {
    const felder = [b.bikeId, b.auftrag, b.kunde, ...Object.values(b.serien).filter(Boolean)]
    return felder.some((f) => String(f).toLowerCase().includes(q))
  })
}

/** Mengenverbleib je Zollcharge: Lager/Produktion/Kunde/verschrottet + Differenz zur Eingangsmenge. */
export function chargeVerbleib(zollNr) {
  const c = chargeVon(zollNr)
  const raeder = BIKES.filter((b) => b.charge === zollNr)
  const verteilung = Object.fromEntries(ORTE.map((o) => [o, raeder.filter((b) => b.ort === o).length]))
  const erfasst = raeder.length
  const offen = c ? c.menge - erfasst : 0 // noch nicht in Rädern verbaute Rahmen (im Lager)
  // Rahmen ohne fertiges Rad zählen als „Lager" (Rohbestand der Charge).
  verteilung.Lager += Math.max(0, offen)
  const summe = ORTE.reduce((s, o) => s + verteilung[o], 0)
  return { charge: c, verteilung, summe, erfasstRaeder: erfasst, vollstaendig: c ? summe === c.menge : false }
}

export const alleChargen = () => CHARGEN.map((c) => ({ ...c, ...chargeVerbleib(c.zollNr) }))
