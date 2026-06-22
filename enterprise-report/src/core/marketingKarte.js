// =========================================================================
//  MARKETING-LANDKARTEN — geografische Verteilung mit Drilldown:
//   Welt → Europa → Deutschland → Bundesland → PLZ-Gebiet.
//  Wählbare Metrik (Umsatzerlöse, Marktanteil, DB %, Online-Anteil) und je
//  Region die Verteilung nach Warenbereichen. Choropleth als Kachelkarte
//  (Farbintensität = Metrikwert), per Klick eine Ebene tiefer.
// =========================================================================

const r0 = (x) => Math.round(x)
const r1 = (x) => Math.round(x * 10) / 10

export const EBENEN = ['Welt', 'Kontinent', 'Land', 'Bundesland', 'PLZ-Gebiet']

export const METRIKEN = [
  { key: 'umsatz', name: 'Umsatzerlöse', einheit: 'eur' },
  { key: 'marktanteil', name: 'Marktanteil', einheit: 'pct' },
  { key: 'db', name: 'DB %', einheit: 'pct' },
  { key: 'onlineAnteil', name: 'Online-Anteil', einheit: 'pct' }
]

// Flache Regionen-Liste (parent = übergeordnete Region). umsatz in Tsd €;
// wb = Verteilung nach Warenbereichen in % (Fahrräder/Zubehör/Bekleidung).
export const REGIONEN = [
  { id: 'welt', parent: null, name: 'Welt', umsatz: 52000, marktanteil: 2.1, db: 38.0, onlineAnteil: 41, wb: { Fahrräder: 64, Zubehör: 22, Bekleidung: 14 } },

  { id: 'europa', parent: 'welt', name: 'Europa', umsatz: 44200, marktanteil: 4.8, db: 39.2, onlineAnteil: 39, wb: { Fahrräder: 65, Zubehör: 21, Bekleidung: 14 } },
  { id: 'nordamerika', parent: 'welt', name: 'Nordamerika', umsatz: 5200, marktanteil: 0.9, db: 33.5, onlineAnteil: 52, wb: { Fahrräder: 58, Zubehör: 27, Bekleidung: 15 } },
  { id: 'asien', parent: 'welt', name: 'Asien-Pazifik', umsatz: 2600, marktanteil: 0.4, db: 30.1, onlineAnteil: 60, wb: { Fahrräder: 55, Zubehör: 30, Bekleidung: 15 } },

  { id: 'de', parent: 'europa', name: 'Deutschland', umsatz: 31200, marktanteil: 7.4, db: 40.1, onlineAnteil: 37, wb: { Fahrräder: 66, Zubehör: 20, Bekleidung: 14 } },
  { id: 'at', parent: 'europa', name: 'Österreich', umsatz: 5400, marktanteil: 6.1, db: 38.8, onlineAnteil: 40, wb: { Fahrräder: 63, Zubehör: 23, Bekleidung: 14 } },
  { id: 'ch', parent: 'europa', name: 'Schweiz', umsatz: 4100, marktanteil: 5.2, db: 41.5, onlineAnteil: 36, wb: { Fahrräder: 67, Zubehör: 19, Bekleidung: 14 } },
  { id: 'eu_rest', parent: 'europa', name: 'Übriges Europa', umsatz: 3500, marktanteil: 1.3, db: 35.0, onlineAnteil: 45, wb: { Fahrräder: 60, Zubehör: 25, Bekleidung: 15 } },

  { id: 'by', parent: 'de', name: 'Bayern', umsatz: 8400, marktanteil: 9.1, db: 41.2, onlineAnteil: 33, wb: { Fahrräder: 68, Zubehör: 19, Bekleidung: 13 } },
  { id: 'nrw', parent: 'de', name: 'Nordrhein-Westfalen', umsatz: 7100, marktanteil: 6.8, db: 39.4, onlineAnteil: 38, wb: { Fahrräder: 64, Zubehör: 21, Bekleidung: 15 } },
  { id: 'bw', parent: 'de', name: 'Baden-Württemberg', umsatz: 6300, marktanteil: 7.9, db: 40.8, onlineAnteil: 34, wb: { Fahrräder: 67, Zubehör: 20, Bekleidung: 13 } },
  { id: 'be', parent: 'de', name: 'Berlin', umsatz: 3200, marktanteil: 8.6, db: 38.0, onlineAnteil: 49, wb: { Fahrräder: 61, Zubehör: 23, Bekleidung: 16 } },
  { id: 'de_rest', parent: 'de', name: 'Übrige Länder', umsatz: 6200, marktanteil: 5.1, db: 38.6, onlineAnteil: 39, wb: { Fahrräder: 63, Zubehör: 22, Bekleidung: 15 } },

  { id: 'by_80', parent: 'by', name: '80–81 München', umsatz: 3100, marktanteil: 12.4, db: 42.1, onlineAnteil: 44, wb: { Fahrräder: 66, Zubehör: 20, Bekleidung: 14 } },
  { id: 'by_85', parent: 'by', name: '85 Oberbayern', umsatz: 1700, marktanteil: 9.8, db: 41.0, onlineAnteil: 31, wb: { Fahrräder: 70, Zubehör: 18, Bekleidung: 12 } },
  { id: 'by_90', parent: 'by', name: '90 Nürnberg', umsatz: 2100, marktanteil: 10.2, db: 40.6, onlineAnteil: 29, wb: { Fahrräder: 69, Zubehör: 18, Bekleidung: 13 } },
  { id: 'by_93', parent: 'by', name: '93 Regensburg', umsatz: 900, marktanteil: 7.4, db: 39.8, onlineAnteil: 27, wb: { Fahrräder: 71, Zubehör: 17, Bekleidung: 12 } },
  { id: 'by_rest', parent: 'by', name: 'Übriges Bayern', umsatz: 600, marktanteil: 5.0, db: 38.5, onlineAnteil: 25, wb: { Fahrräder: 72, Zubehör: 16, Bekleidung: 12 } }
]

export const regionVon = (id) => REGIONEN.find((r) => r.id === id) || null
export const kinderVon = (id) => REGIONEN.filter((r) => r.parent === id)
export const hatKinder = (id) => REGIONEN.some((r) => r.parent === id)

/** Breadcrumb-Pfad von der Wurzel bis zur Region. */
export function pfadVon(id) {
  const pfad = []
  let cur = regionVon(id)
  while (cur) { pfad.unshift(cur); cur = cur.parent ? regionVon(cur.parent) : null }
  return pfad
}

/** Ebenen-Index (0 = Welt) anhand der Pfadtiefe. */
export const ebeneVon = (id) => Math.max(0, pfadVon(id).length - 1)

/** Kinder einer Region inkl. Metrikwert + Anteil am Elternwert (für die Karte). */
export function karte(parentId, metrikKey = 'umsatz') {
  const kinder = kinderVon(parentId)
  const werte = kinder.map((k) => k[metrikKey] ?? 0)
  const min = Math.min(...werte, 0)
  const max = Math.max(...werte, 1)
  const summe = kinder.reduce((n, k) => n + (k.umsatz || 0), 0) || 1
  return kinder.map((k) => ({
    ...k, wert: k[metrikKey] ?? 0,
    intensitaet: max > min ? r1((k[metrikKey] - min) / (max - min)) : 1,
    umsatzAnteil: r1((k.umsatz || 0) / summe * 100),
    drillbar: hatKinder(k.id)
  })).sort((a, b) => b.wert - a.wert)
}
