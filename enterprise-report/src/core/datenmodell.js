// =========================================================================
//  DATENMODELL-ADMINISTRATION — Feld-Mapping SQL-Quelle → Report-Feld.
//
//  Der Admin „liest" Quelltabellen ein (Dim*/Fact*) und weist deren Spalten
//  per Drag & Drop den von den Berichten erwarteten Feldern zu. Pflichtfelder
//  müssen belegt sein (dann ist der Bericht „grün"), optionale Felder dürfen
//  leer bleiben — die zugehörige Kennzahl wird dann leer/ausgeblendet.
//
//  Ist ein Bericht grün, kann er in der Bericht-Freigabe getestet/aktiviert
//  werden. Mapping persistent (LocalStorage; später echte Quell-/Mapping-Tabellen).
// =========================================================================

// --- Quelltabellen (Dimensionen & Fakten) ---------------------------------
export const QUELLEN = [
  { id: 'DimPeriode', typ: 'dim', spalten: ['PeriodenID', 'Jahr', 'Quartal', 'Monat', 'Datum', 'Arbeitstage'] },
  { id: 'DimArtikel', typ: 'dim', spalten: ['ArtikelID', 'SKU', 'Bezeichnung', 'Warenbereich', 'Produktgruppe', 'ProduktgruppeID', 'Kategorie'] },
  { id: 'DimKunde', typ: 'dim', spalten: ['KundeID', 'Name', 'Land', 'Region', 'RegionID', 'Kanal', 'Segment'] },
  { id: 'DimProfitcenter', typ: 'dim', spalten: ['PCID', 'Name', 'Kanal', 'Land', 'Funktion'] },
  { id: 'DimKonto', typ: 'dim', spalten: ['KontoNr', 'Bezeichnung', 'Kontoart', 'GuVGruppe'] },
  { id: 'FactUmsatz', typ: 'fact', spalten: ['PeriodenID', 'ArtikelID', 'KundeID', 'PCID', 'UmsatzIst', 'UmsatzPlan', 'UmsatzVorjahr', 'Menge', 'Kategorie'] },
  { id: 'FactKosten', typ: 'fact', spalten: ['PeriodenID', 'KontoNr', 'PCID', 'Betrag'] },
  { id: 'FactVersand', typ: 'fact', spalten: ['PeriodenID', 'Carrier', 'Gewichtsklasse', 'Region', 'Anzahl', 'Versanderloes', 'Versandkosten'] },
  // Normalisierte Unter-Dimensionen (Outrigger) für Snowflake-Modellierung.
  { id: 'DimProduktgruppe', typ: 'dim', rolle: 'outrigger', spalten: ['ProduktgruppeID', 'Produktgruppe', 'WarenbereichID'] },
  { id: 'DimWarenbereich', typ: 'dim', rolle: 'outrigger', spalten: ['WarenbereichID', 'Warenbereich', 'Sortiment'] },
  { id: 'DimRegion', typ: 'dim', rolle: 'outrigger', spalten: ['RegionID', 'Region', 'LandID'] },
  { id: 'DimLand', typ: 'dim', rolle: 'outrigger', spalten: ['LandID', 'Land', 'Waehrung'] }
]
export const quelleInfo = (id) => QUELLEN.find((q) => q.id === id)

// --- Erwartete Felder je Bericht ------------------------------------------
export const REPORT_FELDER = {
  quartalsbericht: {
    name: 'Quartalsbericht', felder: [
      { id: 'periode', name: 'Periode', pflicht: true, hinweis: 'Zeitachse (Monat/Quartal)' },
      { id: 'umsatz_ist', name: 'Umsatz Ist', pflicht: true },
      { id: 'umsatz_plan', name: 'Umsatz Plan', pflicht: true },
      { id: 'umsatz_vorjahr', name: 'Umsatz Vorjahr', pflicht: false, hinweis: 'optional – ohne: kein VJ-Vergleich' },
      { id: 'kategorie', name: 'Kategorie', pflicht: true },
      { id: 'arbeitstage', name: 'Arbeitstage', pflicht: false, hinweis: 'optional – für Normierung je Arbeitstag' },
      { id: 'kanal', name: 'Kanal', pflicht: false, hinweis: 'optional – für Online↔Offline' }
    ]
  },
  versand: {
    name: 'Versand-Cockpit', felder: [
      { id: 'anzahl', name: 'Sendungsanzahl', pflicht: true },
      { id: 'versanderloes', name: 'Versanderlös', pflicht: true },
      { id: 'versandkosten', name: 'Versandkosten (Carrier)', pflicht: true },
      { id: 'carrier', name: 'Carrier', pflicht: false },
      { id: 'region', name: 'Region', pflicht: false },
      { id: 'gewichtsklasse', name: 'Gewichtsklasse', pflicht: false }
    ]
  },
  finanzcockpit: {
    name: 'Finanz- & Risiko-Cockpit', felder: [
      { id: 'konto', name: 'Konto', pflicht: true },
      { id: 'kontoart', name: 'Kontoart', pflicht: true },
      { id: 'betrag', name: 'Betrag', pflicht: true },
      { id: 'guv_gruppe', name: 'GuV-Gruppe', pflicht: false }
    ]
  }
}
export const REPORT_IDS = Object.keys(REPORT_FELDER)

// --- Mapping-Persistenz ----------------------------------------------------
const KEY = 'er_feldmapping'
// Demo-Seed: Quartalsbericht vollständig, Versand teilweise, Finanz leer.
function seed() {
  return {
    quartalsbericht: { periode: 'DimPeriode.Monat', umsatz_ist: 'FactUmsatz.UmsatzIst', umsatz_plan: 'FactUmsatz.UmsatzPlan', umsatz_vorjahr: 'FactUmsatz.UmsatzVorjahr', kategorie: 'FactUmsatz.Kategorie', arbeitstage: 'DimPeriode.Arbeitstage' },
    versand: { anzahl: 'FactVersand.Anzahl', versanderloes: 'FactVersand.Versanderloes' }
  }
}
export function ladeMapping() {
  try { const raw = localStorage.getItem(KEY); return raw == null ? seed() : JSON.parse(raw) } catch { return seed() }
}
function speichere(m) { localStorage.setItem(KEY, JSON.stringify(m)); return m }
export function mappingVon(reportId, feldId) { return (ladeMapping()[reportId] || {})[feldId] || null }
export function setzeMapping(reportId, feldId, quelleSpalte) {
  const m = ladeMapping(); const r = { ...(m[reportId] || {}) }
  if (quelleSpalte) r[feldId] = quelleSpalte; else delete r[feldId]
  m[reportId] = r; return speichere(m)
}
export function setzeZurueck() { localStorage.removeItem(KEY); return ladeMapping() }

// --- Validierung -----------------------------------------------------------
export function validierung(reportId) {
  const def = REPORT_FELDER[reportId]; const map = ladeMapping()[reportId] || {}
  const pflicht = def.felder.filter((f) => f.pflicht)
  const fehlend = pflicht.filter((f) => !map[f.id])
  const optional = def.felder.filter((f) => !f.pflicht)
  return {
    name: def.name,
    pflichtGesamt: pflicht.length,
    pflichtGemappt: pflicht.length - fehlend.length,
    optionalGesamt: optional.length,
    optionalGemappt: optional.filter((f) => map[f.id]).length,
    fehlend: fehlend.map((f) => f.name),
    gruen: fehlend.length === 0,
    fortschritt: Math.round((def.felder.filter((f) => map[f.id]).length) / def.felder.length * 100)
  }
}
/** Berichte, die einsatzbereit (alle Pflichtfelder gemappt) sind. */
export function bereiteReports() {
  return REPORT_IDS.filter((id) => validierung(id).gruen)
}
