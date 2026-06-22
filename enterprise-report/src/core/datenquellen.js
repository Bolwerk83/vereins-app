// =========================================================================
//  DATENQUELLEN — kuratierte, erweiterbare Linksammlung für externe Daten:
//  Marktanteile/Branchenstatistik (Bike), Geo-/PLZ-/Einwohner-/Flächendaten,
//  Wettbewerb & Benchmark, E-Commerce, Mobilität & Trends.
//  Erweiterbar/bearbeitbar (LocalStorage; Seed mit echten Quellen).
// =========================================================================
export const KATEGORIEN = [
  { id: 'branche', name: 'Branchen-/Marktstatistik (Bike)', icon: '🚲' },
  { id: 'geo', name: 'Geo · PLZ · Einwohner · Fläche', icon: '🗺' },
  { id: 'wettbewerb', name: 'Wettbewerb & Benchmark', icon: '🏁' },
  { id: 'ecommerce', name: 'E-Commerce & Handel', icon: '🛒' },
  { id: 'trends', name: 'Mobilität & Trends', icon: '📈' }
]
export const kategorieInfo = (id) => KATEGORIEN.find((k) => k.id === id) || KATEGORIEN[0]
export const KOSTEN = { kostenlos: { name: 'kostenlos', farbe: 'var(--amp-g)' }, teils: { name: 'teils kostenlos', farbe: 'var(--amp-a)' }, kostenpflichtig: { name: 'kostenpflichtig', farbe: 'var(--amp-r)' } }

function seed() {
  return [
    // --- Branchen-/Marktstatistik Bike ---
    { id: 'q-ziv', name: 'ZIV – Zweirad-Industrie-Verband', url: 'https://www.ziv-zweirad.de', kategorie: 'branche', kosten: 'kostenlos', tags: ['Absatz', 'E-Bike-Anteil', 'Ø-Preise', 'DE'], beschreibung: 'Offizielle Marktdaten Fahrrad/E-Bike Deutschland: Stückzahlen, Durchschnittspreise, E-Bike-Quote (jährliche Pressemappe).' },
    { id: 'q-conebi', name: 'CONEBI – European Bicycle Industry', url: 'https://www.conebi.eu', kategorie: 'branche', kosten: 'teils', tags: ['EU', 'Markt', 'Bikes'], beschreibung: 'Europäische Branchenzahlen (Bicycle Industry & Market Profile), Produktion/Absatz je Land.' },
    { id: 'q-bikeeu', name: 'Bike Europe', url: 'https://www.bike-eu.com', kategorie: 'branche', kosten: 'teils', tags: ['News', 'Markt', 'Gravel/MTB/Road'], beschreibung: 'Branchennews & Marktanalysen (Segmente Gravel, Rennrad, MTB, E-Bike), Lieferketten.' },
    { id: 'q-statista-bike', name: 'Statista – Fahrrad/E-Bike', url: 'https://de.statista.com/themen/1900/fahrrad/', kategorie: 'branche', kosten: 'kostenpflichtig', tags: ['Marktanteil', 'Segmente'], beschreibung: 'Marktzahlen, Segment- und Markenanteile (Premium für Detaildaten).' },
    { id: 'q-vsf', name: 'VSF – Verbund Service und Fahrrad', url: 'https://www.vsf.de', kategorie: 'branche', kosten: 'kostenlos', tags: ['Fachhandel', 'DE'], beschreibung: 'Fachhandels-Verband; Branchenkennzahlen & Konjunktur im qualifizierten Fahrradhandel.' },

    // --- Geo / PLZ / Einwohner / Fläche ---
    { id: 'q-suchplz', name: 'suche-postleitzahl.org (OpenGeoDB)', url: 'https://www.suche-postleitzahl.org/downloads', kategorie: 'geo', kosten: 'kostenlos', tags: ['PLZ', 'Einwohner', 'Koordinaten', 'CSV'], beschreibung: 'Kostenlose PLZ-Tabellen mit Einwohnerzahl, Fläche (qkm) und Geokoordinaten als CSV/GeoJSON.' },
    { id: 'q-geonames', name: 'GeoNames', url: 'https://www.geonames.org', kategorie: 'geo', kosten: 'kostenlos', tags: ['PLZ', 'Einwohner', 'API'], beschreibung: 'Weltweite Geodaten inkl. Postleitzahlen & Einwohner; kostenloser Download und API.' },
    { id: 'q-destatis', name: 'Destatis – Statistisches Bundesamt', url: 'https://www.destatis.de', kategorie: 'geo', kosten: 'kostenlos', tags: ['Bevölkerung', 'Gemeinden', 'DE'], beschreibung: 'Amtliche Bevölkerung, Gemeinde-/Kreisdaten; Basis für Marktpotenzial je Region.' },
    { id: 'q-regionalstat', name: 'Regionalstatistik (GENESIS)', url: 'https://www.regionalstatistik.de', kategorie: 'geo', kosten: 'kostenlos', tags: ['kleinräumig', 'Kreise/Gemeinden'], beschreibung: 'Kleinräumige amtliche Statistik (Bevölkerung, Fläche, Kaufkraft-nahe Indikatoren).' },
    { id: 'q-bkg', name: 'BKG – Bundesamt für Kartographie u. Geodäsie', url: 'https://gdz.bkg.bund.de', kategorie: 'geo', kosten: 'kostenlos', tags: ['Fläche/qm', 'Verwaltungsgrenzen', 'GeoJSON'], beschreibung: 'Verwaltungsgebiete mit Flächen (qm/qkm), Grenzen (VG250) – ideal für Choroplethen & Dichte.' },
    { id: 'q-zensus', name: 'Zensus 2022', url: 'https://www.zensus2022.de', kategorie: 'geo', kosten: 'kostenlos', tags: ['Bevölkerung', 'Gitter 100m'], beschreibung: 'Kleinräumige Bevölkerung (auch 100m-Gitter) – Basis für Marktanteil je PLZ/Quadratkilometer.' },
    { id: 'q-inkar', name: 'INKAR (BBSR)', url: 'https://www.inkar.de', kategorie: 'geo', kosten: 'kostenlos', tags: ['Regionalindikatoren', 'Kaufkraft'], beschreibung: 'Indikatoren und Karten zur Raum- und Stadtentwicklung (Einkommen, Pendler, Dichte).' },

    // --- Wettbewerb & Benchmark ---
    { id: 'q-bundesanzeiger', name: 'Bundesanzeiger', url: 'https://www.bundesanzeiger.de', kategorie: 'wettbewerb', kosten: 'kostenlos', tags: ['Jahresabschlüsse', 'Konkurrenz'], beschreibung: 'Veröffentlichte Jahresabschlüsse von Wettbewerbern (Umsatz/Ergebnis, soweit publiziert).' },
    { id: 'q-unternehmensregister', name: 'Unternehmensregister', url: 'https://www.unternehmensregister.de', kategorie: 'wettbewerb', kosten: 'teils', tags: ['Firmendaten'], beschreibung: 'Zentraler Zugang zu Unternehmens-/Registerdaten.' },
    { id: 'q-geizhals', name: 'Geizhals / idealo (Preisvergleich)', url: 'https://geizhals.de', kategorie: 'wettbewerb', kosten: 'kostenlos', tags: ['Preisbenchmark', 'Marktpreise'], beschreibung: 'Marktpreise & Preisverläufe je Modell – Benchmark der eigenen Verkaufspreise.' },
    { id: 'q-trustpilot', name: 'Trustpilot / Google Reviews', url: 'https://de.trustpilot.com', kategorie: 'wettbewerb', kosten: 'teils', tags: ['Service-Benchmark', 'NPS-nah'], beschreibung: 'Bewertungen der Wettbewerber als Service-/Reputations-Benchmark.' },

    // --- E-Commerce & Handel ---
    { id: 'q-bevh', name: 'bevh – Bundesverband E-Commerce', url: 'https://www.bevh.org', kategorie: 'ecommerce', kosten: 'kostenlos', tags: ['Online-Anteil', 'Wachstum'], beschreibung: 'Marktzahlen Onlinehandel (Umsatz, Wachstum, Warengruppen) – Online-Anteil-Benchmark.' },
    { id: 'q-hde', name: 'HDE – Handelsverband Deutschland', url: 'https://einzelhandel.de', kategorie: 'ecommerce', kosten: 'kostenlos', tags: ['Einzelhandel', 'Konjunktur'], beschreibung: 'Einzelhandels-Konjunktur, Online-Monitor, Konsumbarometer.' },
    { id: 'q-eurostat', name: 'Eurostat', url: 'https://ec.europa.eu/eurostat', kategorie: 'ecommerce', kosten: 'kostenlos', tags: ['EU', 'Handel', 'Haushalte'], beschreibung: 'Europäische amtliche Statistik (Handel, Haushalte, E-Commerce-Nutzung).' },

    // --- Mobilität & Trends ---
    { id: 'q-adfc', name: 'ADFC – Fahrradklima & Mobilität', url: 'https://www.adfc.de', kategorie: 'trends', kosten: 'kostenlos', tags: ['Nutzung', 'Fahrradklima'], beschreibung: 'Fahrradklima-Test, Nutzungs-/Infrastrukturdaten – Nachfrageindikatoren je Region.' },
    { id: 'q-mid', name: 'Mobilität in Deutschland (MiD)', url: 'https://www.mobilitaet-in-deutschland.de', kategorie: 'trends', kosten: 'kostenlos', tags: ['Verkehr', 'Wege', 'Rad'], beschreibung: 'Repräsentative Mobilitätserhebung (Radverkehrsanteile, Wegezwecke) – Trendbasis.' },
    { id: 'q-googletrends', name: 'Google Trends', url: 'https://trends.google.de', kategorie: 'trends', kosten: 'kostenlos', tags: ['Nachfrage', 'Saison', 'Segmente'], beschreibung: 'Suchnachfrage je Segment (Gravel, E-Bike, MTB …) regional & saisonal – Frühindikator.' }
  ]
}

const KEY = 'er_datenquellen'
export function ladeQuellen() {
  try { const raw = localStorage.getItem(KEY); return raw == null ? seed() : JSON.parse(raw) } catch { return seed() }
}
function speichere(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); return arr }

export function speichereQuelle(q) {
  const arr = ladeQuellen(); const i = arr.findIndex((x) => x.id === q.id)
  if (i >= 0) arr[i] = q; else arr.push(q)
  return speichere(arr)
}
export function loescheQuelle(id) { return speichere(ladeQuellen().filter((q) => q.id !== id)) }
export function neueQuelle() { return { id: 'q-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4), name: '', url: '', kategorie: 'branche', kosten: 'kostenlos', tags: [], beschreibung: '' } }
export function setzeZurueck() { localStorage.removeItem(KEY); return ladeQuellen() }
export function quellenNachKategorie(katId) { return ladeQuellen().filter((q) => q.kategorie === katId) }
