// =========================================================================
//  EVENTS / AKTIONEN — Werbe-/Verkaufsaktionen mit Zeitraum, betroffenen
//  Produkten, Mechanik und Kosten. Daraus die Wirksamkeitsanalyse:
//  Mehrumsatz, zusätzlicher Deckungsbeitrag, ROI der Werbung und
//  Ladenhüter-Abbau ("wurde mehr verkauft? Ladenhüter runter?").
//
//  Persistenz via localStorage (er_events); Seed-Aktionen als Beispiel.
//  Beträge in € (nicht Mio), damit Aktionen feingranular planbar sind.
// =========================================================================

const KEY = 'er_events'

export const MECHANIKEN = [
  { id: 'rabatt', name: 'Preisnachlass (%)' },
  { id: 'bundle', name: 'Bundle / Set-Preis' },
  { id: 'gutschein', name: 'Gutschein / Coupon' },
  { id: 'werbung', name: 'Werbeanzeige / Kampagne' },
  { id: 'pos', name: 'Schaufenster / POS-Aktion' }
]
export const mechanikName = (id) => (MECHANIKEN.find((m) => m.id === id) || {}).name || id

// Seed-Aktionen. produkte[]: baseUmsatz = erwarteter Normalumsatz im Zeitraum,
// istUmsatz = tatsächlich mit Aktion; dbMarge = Deckungsbeitrags-% des Produkts.
// ladenhueter + bestandVorher/-Nachher (€) für den Abverkauf-Effekt.
export const EVENTS_SEED = [
  {
    id: 'blackweek25', name: 'Black Week 2025', mechanik: 'rabatt', rabatt: 20,
    von: '2025-11-24', bis: '2025-11-30', kosten: 60000,
    produkte: [
      { name: 'E-Bikes', baseUmsatz: 900000, istUmsatz: 1480000, dbMarge: 32, ladenhueter: false },
      { name: 'Zubehör', baseUmsatz: 120000, istUmsatz: 210000, dbMarge: 45, ladenhueter: false },
      { name: 'Auslaufmodell 2023', baseUmsatz: 30000, istUmsatz: 145000, dbMarge: 12, ladenhueter: true, bestandVorher: 600000, bestandNachher: 470000 }
    ]
  },
  {
    id: 'weihnachten25', name: 'Weihnachtsaktion 2025', mechanik: 'bundle', rabatt: 10,
    von: '2025-12-08', bis: '2025-12-24', kosten: 28000,
    produkte: [
      { name: 'Bekleidung', baseUmsatz: 90000, istUmsatz: 165000, dbMarge: 40, ladenhueter: false },
      { name: 'Zubehör-Bundle', baseUmsatz: 60000, istUmsatz: 138000, dbMarge: 38, ladenhueter: false }
    ]
  },
  {
    id: 'sommer25', name: 'Ferien-Special 2025', mechanik: 'werbung', rabatt: 0,
    von: '2025-07-15', bis: '2025-08-15', kosten: 42000,
    produkte: [
      { name: 'City/Trekking', baseUmsatz: 320000, istUmsatz: 470000, dbMarge: 30, ladenhueter: false },
      { name: 'Lagerware Helme 2024', baseUmsatz: 18000, istUmsatz: 56000, dbMarge: 15, ladenhueter: true, bestandVorher: 95000, bestandNachher: 52000 }
    ]
  }
]

const r2 = (x) => Math.round(x * 100) / 100
const r0 = (x) => Math.round(x)

export function ladeEvents() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EVENTS_SEED.map((e) => ({ ...e }))
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : EVENTS_SEED.map((e) => ({ ...e }))
  } catch {
    return EVENTS_SEED.map((e) => ({ ...e }))
  }
}
export function speichereEvents(events) {
  localStorage.setItem(KEY, JSON.stringify(events))
  return events
}
export function addEvent(event) {
  const events = ladeEvents()
  const next = [...events, { ...event, id: event.id || 'ev_' + Date.now() }]
  return speichereEvents(next)
}
export function loescheEvent(id) {
  return speichereEvents(ladeEvents().filter((e) => e.id !== id))
}

/**
 * Wirksamkeit einer einzelnen Aktion berechnen.
 * mehrumsatz = ist − base; zusatzDB = Mehrumsatz × Marge; ROI auf Kosten.
 */
export function wirksamkeit(event) {
  const produkte = (event.produkte || []).map((p) => {
    const mehrumsatz = r2(p.istUmsatz - p.baseUmsatz)
    const upliftPct = p.baseUmsatz ? r2(mehrumsatz / p.baseUmsatz * 100) : 0
    const zusatzDB = r2(mehrumsatz * (p.dbMarge || 0) / 100)
    const ladenhueterAbbau = p.ladenhueter ? r2((p.bestandVorher || 0) - (p.bestandNachher || 0)) : 0
    return { ...p, mehrumsatz, upliftPct, zusatzDB, ladenhueterAbbau }
  })
  const baseUmsatz = r2(produkte.reduce((n, p) => n + p.baseUmsatz, 0))
  const istUmsatz = r2(produkte.reduce((n, p) => n + p.istUmsatz, 0))
  const mehrumsatz = r2(istUmsatz - baseUmsatz)
  const upliftPct = baseUmsatz ? r2(mehrumsatz / baseUmsatz * 100) : 0
  const zusatzDB = r2(produkte.reduce((n, p) => n + p.zusatzDB, 0))
  const kosten = event.kosten || 0
  const ergebnisEffekt = r2(zusatzDB - kosten) // Netto-Mehrergebnis der Aktion
  const roi = kosten ? r0(ergebnisEffekt / kosten * 100) : null
  const roas = kosten ? r2(mehrumsatz / kosten) : null // Mehrumsatz je € Werbung
  const ladenhueterAbbau = r2(produkte.reduce((n, p) => n + p.ladenhueterAbbau, 0))
  return {
    ...event, produkte, baseUmsatz, istUmsatz, mehrumsatz, upliftPct,
    zusatzDB, kosten, ergebnisEffekt, roi, roas, ladenhueterAbbau, erfolg: ergebnisEffekt > 0
  }
}

/** Alle Aktionen auswerten + Summen über das Portfolio. */
export function alleWirksamkeit(events = ladeEvents()) {
  const rows = events.map(wirksamkeit)
  const summe = {
    mehrumsatz: r2(rows.reduce((n, r) => n + r.mehrumsatz, 0)),
    zusatzDB: r2(rows.reduce((n, r) => n + r.zusatzDB, 0)),
    kosten: r2(rows.reduce((n, r) => n + r.kosten, 0)),
    ergebnisEffekt: r2(rows.reduce((n, r) => n + r.ergebnisEffekt, 0)),
    ladenhueterAbbau: r2(rows.reduce((n, r) => n + r.ladenhueterAbbau, 0))
  }
  summe.roi = summe.kosten ? r0(summe.ergebnisEffekt / summe.kosten * 100) : null
  return { rows, summe }
}
