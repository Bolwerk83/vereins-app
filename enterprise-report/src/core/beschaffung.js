// =========================================================================
//  BESCHAFFUNG / RÜCKWÄRTSTERMINIERUNG — vom Bedarfstermin rückwärts rechnen,
//  wann ein Artikel bestellt werden muss. WBZ = Lieferzeit (Hauptlieferant)
//  + Reaktionszeit der Kollegen + Sicherheitspuffer. Liefert:
//    • Optimaler Bestellzeitpunkt (empfohlen, mit Puffer)
//    • Spätester Bestelltermin (sicher, Worst-Case-Lieferzeit + Lieferverzug)
//    • Best-Case (nur bei min. Lieferzeit)
//  Fehlende Lieferzeiten werden gemeldet (am Artikel/Lieferanten erfassen);
//  Ersatzartikel als Alternative. Plus eine Lieferanten-Anfragevorlage.
// =========================================================================
export const HEUTE = '2026-06-24'
export const REAKTION_STD = 5    // Reaktionszeit Kollegen (Tage), editierbar
const OV_KEY = 'er_beschaffung_overrides'

export const LIEFERANTEN = [
  { id: 'velo', name: 'Velo Components GmbH', land: 'DE', standardLieferzeitTage: 60, verzugTage: 0, kontakt: 'einkauf@velo-components.example' },
  { id: 'cargo', name: 'CargoBike AB', land: 'SE', standardLieferzeitTage: 80, verzugTage: 14, kontakt: 'orders@cargobike.example' },
  { id: 'parts', name: 'BikeParts Asia Ltd.', land: 'CN', standardLieferzeitTage: 95, verzugTage: 21, kontakt: 'sales@bikeparts-asia.example' },
]
export const lieferantVon = (id) => LIEFERANTEN.find((l) => l.id === id) || null

// Artikel: lieferzeitTage = normale Lieferzeit; min/max = Bandbreite; ersatzId.
export const ARTIKEL_BASIS = [
  { id: 'ebike-city', name: 'E-Bike City', hauptlieferant: 'velo', lieferzeitTage: 60, lieferzeitMin: 45, lieferzeitMax: 90, ersatzId: 'ebike-city-s', puffer: 14 },
  { id: 'trekking-pro', name: 'Trekking Pro', hauptlieferant: 'velo', lieferzeitTage: 45, lieferzeitMin: 35, lieferzeitMax: 65, ersatzId: null, puffer: 10 },
  { id: 'lastenrad', name: 'Lastenrad Cargo', hauptlieferant: 'cargo', lieferzeitTage: null, lieferzeitMin: null, lieferzeitMax: null, ersatzId: null, puffer: 14 }, // fehlende Werte (Demo)
  { id: 'akku', name: 'Wechsel-Akku 500 Wh', hauptlieferant: 'parts', lieferzeitTage: 95, lieferzeitMin: 70, lieferzeitMax: 130, ersatzId: 'akku-alt', puffer: 21 },
  { id: 'ebike-city-s', name: 'E-Bike City S (Ersatz)', hauptlieferant: 'velo', lieferzeitTage: 50, lieferzeitMin: 40, lieferzeitMax: 75, ersatzId: null, puffer: 14 },
  { id: 'akku-alt', name: 'Wechsel-Akku 400 Wh (Ersatz)', hauptlieferant: 'velo', lieferzeitTage: 40, lieferzeitMin: 30, lieferzeitMax: 60, ersatzId: null, puffer: 14 },
]

// Komponenten (für Stücklisten) — eigene Lieferzeiten je Bauteil.
export const KOMPONENTEN = [
  { id: 'rahmen-alu', name: 'Aluminium-Rahmen', hauptlieferant: 'parts', lieferzeitTage: 110, lieferzeitMin: 80, lieferzeitMax: 150, ersatzId: null, puffer: 21, typ: 'komponente' },
  { id: 'motor', name: 'Mittelmotor 250 W', hauptlieferant: 'velo', lieferzeitTage: 70, lieferzeitMin: 55, lieferzeitMax: 100, ersatzId: 'motor-alt', puffer: 21, typ: 'komponente' },
  { id: 'motor-alt', name: 'Mittelmotor 250 W (Alt.)', hauptlieferant: 'velo', lieferzeitTage: 60, lieferzeitMin: 45, lieferzeitMax: 85, ersatzId: null, puffer: 21, typ: 'komponente' },
  { id: 'akku-z', name: 'Akku 500 Wh (Zelle)', hauptlieferant: 'parts', lieferzeitTage: 95, lieferzeitMin: 70, lieferzeitMax: 130, ersatzId: null, puffer: 21, typ: 'komponente' },
  { id: 'schaltung', name: 'Schaltgruppe 11-fach', hauptlieferant: 'parts', lieferzeitTage: 80, lieferzeitMin: 60, lieferzeitMax: 120, ersatzId: null, puffer: 14, typ: 'komponente' },
  { id: 'bremse', name: 'Scheibenbremse-Set', hauptlieferant: 'velo', lieferzeitTage: 40, lieferzeitMin: 30, lieferzeitMax: 60, ersatzId: null, puffer: 10, typ: 'komponente' },
  { id: 'laufrad', name: 'Laufradsatz 28"', hauptlieferant: 'velo', lieferzeitTage: 45, lieferzeitMin: 35, lieferzeitMax: 70, ersatzId: null, puffer: 10, typ: 'komponente' },
  { id: 'reifen', name: 'Reifen-Set', hauptlieferant: 'velo', lieferzeitTage: 30, lieferzeitMin: 21, lieferzeitMax: 50, ersatzId: null, puffer: 7, typ: 'komponente' },
]

// Montagezeit je Rad (Tage, Eigenfertigung) und Stücklisten (BOM).
export const MONTAGE_TAGE = { 'ebike-city': 7, 'trekking-pro': 5, 'lastenrad': 9 }
export const STUECKLISTE = {
  'ebike-city': [{ id: 'rahmen-alu', menge: 1 }, { id: 'motor', menge: 1 }, { id: 'akku-z', menge: 1 }, { id: 'schaltung', menge: 1 }, { id: 'bremse', menge: 1 }, { id: 'laufrad', menge: 1 }, { id: 'reifen', menge: 1 }],
  'trekking-pro': [{ id: 'rahmen-alu', menge: 1 }, { id: 'schaltung', menge: 1 }, { id: 'bremse', menge: 1 }, { id: 'laufrad', menge: 1 }, { id: 'reifen', menge: 1 }],
}

function ladeOverrides() { try { return JSON.parse(localStorage.getItem(OV_KEY) || '{}') } catch { return {} } }
export function setzeArtikelWert(artikelId, patch) {
  const o = ladeOverrides(); o[artikelId] = { ...o[artikelId], ...patch }
  try { localStorage.setItem(OV_KEY, JSON.stringify(o)) } catch {}
  return o
}
export function artikelListe() {
  const ov = ladeOverrides()
  return [...ARTIKEL_BASIS, ...KOMPONENTEN].map((a) => ({ ...a, ...ov[a.id] }))
}
export const hatStueckliste = (id) => Array.isArray(STUECKLISTE[id])
export const artikelVon = (id) => artikelListe().find((a) => a.id === id) || null

// --- Datums-Helfer (UTC, deterministisch) --------------------------------
const tag = 86400000
const parse = (s) => new Date(s + 'T00:00:00Z')
const iso = (d) => d.toISOString().slice(0, 10)
export const addTage = (s, n) => iso(new Date(parse(s).getTime() + n * tag))
export const diffTage = (a, b) => Math.round((parse(a).getTime() - parse(b).getTime()) / tag)
export const fmtDatum = (s) => { const [y, m, t] = s.split('-'); return `${t}.${m}.${y}` }

/**
 * Rückwärtsterminierung eines Artikels für einen Bedarfstermin.
 * @returns { lieferzeit{n,min,max}, wbz{n,min,max}, optimal, spaetester, bestCase,
 *            tageBisSpaetester, status, fehlendeWerte[], lieferant, ersatz }
 */
export function rueckwaerts(artikelId, bedarfDatum, { reaktion = REAKTION_STD, heute = HEUTE } = {}) {
  const a = artikelVon(artikelId)
  if (!a) return null
  const lf = lieferantVon(a.hauptlieferant)
  const fehlend = []
  // Lieferzeit auflösen: Artikel → sonst Lieferanten-Standard (mit Hinweis).
  let lzN = a.lieferzeitTage
  if (lzN == null) { lzN = lf?.standardLieferzeitTage ?? null; if (lzN != null) fehlend.push('lieferzeitTage') }
  if (lzN == null) { fehlend.push('lieferzeitTage'); lzN = 60 }
  const lzMin = a.lieferzeitMin ?? Math.round(lzN * 0.75)
  const lzMax = (a.lieferzeitMax ?? Math.round(lzN * 1.4)) + (lf?.verzugTage || 0) // Worst-Case inkl. Lieferverzug
  if (a.lieferzeitMin == null) fehlend.push('lieferzeitMin')
  if (a.lieferzeitMax == null) fehlend.push('lieferzeitMax')
  const puffer = a.puffer ?? 14

  const wbzN = lzN + reaktion, wbzMin = lzMin + reaktion, wbzMax = lzMax + reaktion
  // Muss-Termin nutzt die Worst-Case-WBZ (sicher gegen Lieferzeit-Streuung);
  // der optimale Termin liegt um den Puffer DAVOR (früher).
  const spaetester = addTage(bedarfDatum, -wbzMax)        // Muss-Bestelltermin (sicher)
  const optimal = addTage(bedarfDatum, -(wbzMax + puffer)) // empfohlen, mit Puffer
  const bestCase = addTage(bedarfDatum, -wbzMin)          // spätestmöglich (nur bei min. Lieferzeit)
  const tageBisSpaetester = diffTage(spaetester, heute)
  const tageBisOptimal = diffTage(optimal, heute)
  const status = tageBisSpaetester < 0 ? 'ueberfaellig' : tageBisOptimal < 0 ? 'jetzt' : 'plan'

  return {
    artikel: a, lieferant: lf,
    lieferzeit: { n: lzN, min: lzMin, max: lzMax }, wbz: { n: wbzN, min: wbzMin, max: wbzMax }, puffer, reaktion,
    bedarf: bedarfDatum, optimal, spaetester, bestCase,
    tageBisSpaetester, tageBisOptimal, status,
    fehlendeWerte: [...new Set(fehlend)],
    ersatz: a.ersatzId ? artikelVon(a.ersatzId) : null,
  }
}

/**
 * Stücklisten-Terminierung (BOM): jede Komponente rückwärts terminieren, der
 * KRITISCHE PFAD (längste WBZ → frühester Muss-Bestelltermin) bestimmt, wann
 * die Beschaffung fürs Rad starten muss. Vor der Montage müssen alle Teile da
 * sein → Komponenten-Bedarf = Bedarf − Montagezeit.
 */
export function stuecklisteTerminierung(bikeId, bedarf, opts = {}) {
  const stk = STUECKLISTE[bikeId]
  if (!stk) return null
  const bike = artikelVon(bikeId)
  const montage = MONTAGE_TAGE[bikeId] ?? 7
  const komponentenBedarf = addTage(bedarf, -montage)
  const positionen = stk.map((p) => ({ ...p, komponente: artikelVon(p.id), term: rueckwaerts(p.id, komponentenBedarf, opts) }))
    .filter((p) => p.term)
    .sort((a, b) => (a.term.spaetester < b.term.spaetester ? -1 : 1)) // kritischste zuerst
  const kritisch = positionen[0] || null
  return {
    bike, montage, bedarf, komponentenBedarf, positionen, kritisch,
    fehlend: positionen.some((p) => p.term.fehlendeWerte.length),
    montagestart: kritisch ? kritisch.term.spaetester : null,
  }
}

// --- Lager/Reservierung & Produktionskapazität (Demo) --------------------
export const KAPAZITAET_PRO_TAG = 12 // Räder/Tag Endmontage
export const RUEST_TAGE = 2          // Rüst-/Anlauf vor Serienmontage
export const KOMPONENTEN_BESTAND = {
  'rahmen-alu': { bestand: 30, reserviert: 10, fach: 'A-12' },
  motor: { bestand: 80, reserviert: 20, fach: 'B-03' },
  'akku-z': { bestand: 25, reserviert: 5, fach: 'C-07' },
  schaltung: { bestand: 45, reserviert: 15, fach: 'B-09' },
  bremse: { bestand: 120, reserviert: 30, fach: 'D-01' },
  laufrad: { bestand: 50, reserviert: 40, fach: 'D-05' },
  reifen: { bestand: 200, reserviert: 60, fach: 'E-02' },
}

/**
 * Machbarkeit/Durchlaufzeit: „menge Räder bauen — wie lange?" Je Komponente
 * verfügbarer Bestand (Bestand − reserviert), Fehlmenge und deren
 * Beschaffungszeit; der kritische Pfad + Produktionszeit + Puffer ergeben die
 * Gesamtdurchlaufzeit ab heute.
 */
export function machbarkeit(bikeId, menge, { reaktion = REAKTION_STD, puffer = 7, heute = HEUTE } = {}) {
  const stk = STUECKLISTE[bikeId]
  if (!stk) return null
  const bike = artikelVon(bikeId)
  const positionen = stk.map((p) => {
    const k = artikelVon(p.id)
    const lager = KOMPONENTEN_BESTAND[p.id] || { bestand: 0, reserviert: 0, fach: '—' }
    const benoetigt = menge * p.menge
    const verfuegbar = Math.max(0, lager.bestand - lager.reserviert)
    const fehl = Math.max(0, benoetigt - verfuegbar)
    const lz = k?.lieferzeitTage ?? lieferantVon(k?.hauptlieferant)?.standardLieferzeitTage ?? 60
    const beschaffungTage = fehl > 0 ? lz + reaktion : 0
    return { id: p.id, komponente: k, mengeProRad: p.menge, benoetigt, bestand: lager.bestand, reserviert: lager.reserviert, verfuegbar, fehl, fach: lager.fach, lieferzeit: lz, beschaffungTage, ausLager: fehl === 0 }
  }).sort((a, b) => b.beschaffungTage - a.beschaffungTage)
  const kritKomponente = positionen.find((p) => p.beschaffungTage > 0) || null
  const kritBeschaffungTage = kritKomponente ? kritKomponente.beschaffungTage : 0
  const produktionsTage = Math.ceil(menge / KAPAZITAET_PRO_TAG) + RUEST_TAGE
  const gesamtTage = kritBeschaffungTage + produktionsTage + puffer
  return {
    bike, menge, kapazitaetProTag: KAPAZITAET_PRO_TAG, positionen,
    kritKomponente, kritBeschaffungTage, produktionsTage, puffer, ruest: RUEST_TAGE, gesamtTage,
    produktionStart: addTage(heute, kritBeschaffungTage), fertigDatum: addTage(heute, gesamtTage),
    fehlteile: positionen.filter((p) => p.fehl > 0).length,
  }
}

/** Anfragevorlage an den Lieferanten (Verfügbarkeit & Liefertermin). */
export function anfrageVorlage(t, menge = 1) {
  const a = t.artikel, lf = t.lieferant
  return `Betreff: Liefertermin-Anfrage – ${a.name} (Menge ${menge})

Guten Tag${lf ? ' ' + lf.name : ''},

für unsere Saisonplanung benötigen wir ${menge} × ${a.name} zum Bedarfstermin ${fmtDatum(t.bedarf)}.

Bitte bestätigen Sie uns:
• die aktuelle Lieferzeit ab Bestelleingang (derzeit kalkulieren wir mit ${t.lieferzeit.n} Tagen, Spanne ${t.lieferzeit.min}–${t.lieferzeit.max}),
• die Verfügbarkeit zum gewünschten Termin,
• ob bei Engpässen ein Ersatz-/Alternativartikel möglich ist.

Damit der Bedarfstermin sicher gehalten wird, müssten wir spätestens am ${fmtDatum(t.spaetester)} bestellen; optimal wäre eine Bestellung bis ${fmtDatum(t.optimal)}.

Vielen Dank und freundliche Grüße
Einkauf / Disposition`
}
