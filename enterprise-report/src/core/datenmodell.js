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
  // Google-Marketing-Quellen
  { id: 'DimKampagne', typ: 'dim', spalten: ['KampagneID', 'Kampagne', 'Kanal', 'Typ'] },
  { id: 'FactGoogleAds', typ: 'fact', spalten: ['PeriodenID', 'KampagneID', 'Impressionen', 'Klicks', 'Kosten', 'Conversions', 'ConversionWert'] },
  { id: 'FactGoogleAnalytics', typ: 'fact', spalten: ['PeriodenID', 'Kanal', 'Sessions', 'Produktaufrufe', 'Warenkorb', 'Checkout', 'Kauf'] },
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
      { id: 'periode', name: 'Periode', pflicht: true, typ: 'periode', hinweis: 'Zeitachse (Monat/Quartal)' },
      { id: 'umsatz_ist', name: 'Umsatz Ist', pflicht: true, typ: 'zahl' },
      { id: 'umsatz_plan', name: 'Umsatz Plan', pflicht: true, typ: 'zahl' },
      { id: 'umsatz_vorjahr', name: 'Umsatz Vorjahr', pflicht: false, typ: 'zahl', hinweis: 'optional – ohne: kein VJ-Vergleich' },
      { id: 'kategorie', name: 'Kategorie', pflicht: true, typ: 'text' },
      { id: 'arbeitstage', name: 'Arbeitstage', pflicht: false, typ: 'zahl', hinweis: 'optional – für Normierung je Arbeitstag' },
      { id: 'kanal', name: 'Kanal', pflicht: false, typ: 'text', hinweis: 'optional – für Online↔Offline' }
    ]
  },
  versand: {
    name: 'Versand-Cockpit', felder: [
      { id: 'anzahl', name: 'Sendungsanzahl', pflicht: true, typ: 'zahl' },
      { id: 'versanderloes', name: 'Versanderlös', pflicht: true, typ: 'zahl' },
      { id: 'versandkosten', name: 'Versandkosten (Carrier)', pflicht: true, typ: 'zahl' },
      { id: 'carrier', name: 'Carrier', pflicht: false, typ: 'text' },
      { id: 'region', name: 'Region', pflicht: false, typ: 'text' },
      { id: 'gewichtsklasse', name: 'Gewichtsklasse', pflicht: false, typ: 'text' }
    ]
  },
  finanzcockpit: {
    name: 'Finanz- & Risiko-Cockpit', felder: [
      { id: 'konto', name: 'Konto', pflicht: true, typ: 'schluessel' },
      { id: 'kontoart', name: 'Kontoart', pflicht: true, typ: 'text' },
      { id: 'betrag', name: 'Betrag', pflicht: true, typ: 'zahl' },
      { id: 'guv_gruppe', name: 'GuV-Gruppe', pflicht: false, typ: 'text' }
    ]
  }
}
export const REPORT_IDS = Object.keys(REPORT_FELDER)

// --- Datentypen & Auto-Mapping --------------------------------------------
/** Datentyp einer Quellspalte (heuristisch aus dem Namen). */
export function spaltenTyp(spalte) {
  const s = spalte
  if (/(^|[^A-Za-z])(ID|Nr)$/.test(s) || /ID$|Nr$/.test(s)) return 'schluessel'
  if (/Datum/i.test(s)) return 'datum'
  if (/^(Monat|Quartal|Jahr)$/.test(s)) return 'periode'
  if (/Umsatz|Kosten|Betrag|Menge|Anzahl|Klicks|Impress|Conversion|Wert|Quote|Rate|Sessions|Arbeitstage|Saldo|Preis|Erloes|Erlös|Aufrufe|Warenkorb|Checkout|Kauf/i.test(s)) return 'zahl'
  return 'text'
}
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '')
/** Ist der Quellspaltentyp mit dem Feldtyp kompatibel? */
export function typPasst(feldTyp, spTyp) {
  if (feldTyp === spTyp) return true
  const ok = {
    periode: ['periode', 'datum', 'schluessel', 'text'],
    text: ['text', 'schluessel', 'datum', 'periode'],
    schluessel: ['schluessel', 'zahl'],
    zahl: ['zahl'],
    datum: ['datum', 'periode', 'text']
  }
  return (ok[feldTyp] || []).includes(spTyp)
}
/** Status einer bestehenden Zuordnung: Typ ok? sonst Cast-Hinweis. */
export function mappingTypStatus(reportId, feldId) {
  const feld = REPORT_FELDER[reportId].felder.find((f) => f.id === feldId)
  const ref = mappingVon(reportId, feldId)
  if (!feld || !ref) return null
  const sp = ref.split('.')[1]; const spTyp = spaltenTyp(sp)
  const ok = typPasst(feld.typ, spTyp)
  return { ok, feldTyp: feld.typ, spTyp, hinweis: ok ? null : `Typ ${spTyp} → ${feld.typ}: Anpassung/CAST nötig` }
}
/** Namens-/Typ-Ähnlichkeit Feld ↔ Spalte (0..1). */
function score(feld, quelle, spalte) {
  const spTyp = spaltenTyp(spalte)
  if (!typPasst(feld.typ, spTyp)) return 0           // falscher Typ → kein Vorschlag
  const a = norm(feld.id), b = norm(feld.name), c = norm(spalte)
  if (a === c || b === c) return 1
  if (c.includes(a) || a.includes(c) || c.includes(b)) return 0.75
  const tokA = new Set(a.match(/[a-z]+|[0-9]+/g) || [])
  const tokC = new Set(c.match(/[a-z]+|[0-9]+/g) || [])
  const gem = [...tokA].filter((t) => t.length > 2 && tokC.has(t)).length
  return gem ? 0.5 : 0
}
/** Auto-Mapping-Vorschlag je Bericht: beste passende Spalte je (noch leerem)
 *  Feld, nur bei passendem Typ und ausreichender Namensähnlichkeit. */
export function autoVorschlag(reportId, nurLeere = true) {
  const def = REPORT_FELDER[reportId]; const map = ladeMapping()[reportId] || {}
  const out = {}
  for (const feld of def.felder) {
    if (nurLeere && map[feld.id]) continue
    let best = null, bestS = 0.5
    for (const q of QUELLEN) for (const sp of q.spalten) {
      const s = score(feld, q.id, sp)
      if (s > bestS) { bestS = s; best = `${q.id}.${sp}` }
    }
    if (best) out[feld.id] = best
  }
  return out
}
/** Auto-Mapping anwenden (übernimmt die Vorschläge ins Mapping). */
export function wendeAutoAn(reportId, nurLeere = true) {
  const v = autoVorschlag(reportId, nurLeere)
  for (const [feldId, ref] of Object.entries(v)) setzeMapping(reportId, feldId, ref)
  return Object.keys(v).length
}

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
