// =========================================================================
//  VERTEILUNGSSCHLÜSSEL (Verteilungstabellen) — verteilen Kostenarten auf
//  Bereiche/Kostenstellen. Zwei Arten:
//    manuell      : feste Gewichte je Bereich (Prozent), selbst gesetzt.
//    automatisch  : aus Bezugsmengen je Bereich (z. B. Fläche m², Köpfe,
//                   Materialscheine) — die Gewichte ergeben sich daraus.
//
//  Persistenz: localStorage (Gewichte/Mengen überschreibbar). Die Schlüssel
//  werden im BAB den Kostenarten zugeordnet (manuell wählbar).
// =========================================================================

// Bereiche/Spalten des BAB (allgemein = Vorkostenstelle).
export const BEREICHE = [
  { id: 'allgemein',  name: 'Allgemein',  vor: true },
  { id: 'material',   name: 'Material',   vor: false },
  { id: 'fertigung',  name: 'Fertigung',  vor: false },
  { id: 'verwaltung', name: 'Verwaltung', vor: false },
  { id: 'vertrieb',   name: 'Vertrieb',   vor: false }
]
export const ENDBEREICHE = BEREICHE.filter((b) => !b.vor).map((b) => b.id)

// Standard-Verteilungsschlüssel.
export const SCHLUESSEL_STD = [
  { id: 'flaeche',        name: 'Fläche (m²)',        art: 'automatisch', bezug: 'm²',            mengen: { allgemein: 500, material: 800, fertigung: 4000, verwaltung: 1500, vertrieb: 1200 } },
  { id: 'materialscheine', name: 'Materialscheine',   art: 'automatisch', bezug: 'Belege',        mengen: { allgemein: 200, material: 1500, fertigung: 2000 } },
  { id: 'lohnzettel',     name: 'Lohnzettel',         art: 'automatisch', bezug: 'Stück',         mengen: { allgemein: 10, material: 20, fertigung: 120 } },
  { id: 'gehaltsliste',   name: 'Gehaltsliste',       art: 'automatisch', bezug: 'Köpfe',         mengen: { material: 6, fertigung: 15, verwaltung: 40, vertrieb: 25 } },
  { id: 'koepfe',         name: 'Köpfe (FTE)',        art: 'automatisch', bezug: 'FTE',           mengen: { allgemein: 4, material: 10, fertigung: 96, verwaltung: 26, vertrieb: 64 } },
  { id: 'inventarwert',   name: 'Inventarwert',       art: 'automatisch', bezug: 'T€',            mengen: { allgemein: 500, material: 500, fertigung: 4000, verwaltung: 1000, vertrieb: 800 } },
  { id: 'verwaltungslast', name: 'Verwaltungsliste',  art: 'manuell',     gewichte: { fertigung: 0.15, verwaltung: 0.60, vertrieb: 0.25 } },
  { id: 'direkt_vertrieb', name: 'Direkt: Vertrieb',  art: 'manuell',     gewichte: { vertrieb: 1 } },
  { id: 'direkt_fertigung', name: 'Direkt: Fertigung', art: 'manuell',    gewichte: { fertigung: 1 } }
]

const KEY = 'er_verteilung'
function overrides() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} } }
function speichere(o) { localStorage.setItem(KEY, JSON.stringify(o)); return o }

/** Alle Schlüssel (mit gespeicherten Anpassungen). */
export function ladeSchluessel() {
  const ov = overrides()
  return SCHLUESSEL_STD.map((s) => ({ ...s, ...(ov[s.id] || {}) }))
}
export const schluessel = (id) => ladeSchluessel().find((s) => s.id === id)

/** Schlüssel anpassen (Gewichte/Mengen) und persistieren. */
export function setSchluessel(id, patch) {
  const ov = overrides(); ov[id] = { ...(ov[id] || {}), ...patch }
  return speichere(ov)
}

/** Normierte Gewichte je Bereich (Summe = 1) — egal ob manuell oder automatisch. */
export function gewichte(s) {
  if (!s) return {}
  if (s.art === 'manuell') {
    const sum = Object.values(s.gewichte || {}).reduce((n, v) => n + v, 0) || 1
    return Object.fromEntries(Object.entries(s.gewichte || {}).map(([k, v]) => [k, v / sum]))
  }
  const sum = Object.values(s.mengen || {}).reduce((n, v) => n + v, 0) || 1
  return Object.fromEntries(Object.entries(s.mengen || {}).map(([k, v]) => [k, v / sum]))
}
