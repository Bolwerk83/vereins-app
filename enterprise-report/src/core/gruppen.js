// =========================================================================
//  GRUPPEN- & RECHTEVERWALTUNG  (im Tool pflegbar)
//
//  Eine Gruppe ist rechte-kompatibel zu einer Rolle (rbac.js): sie hat
//  { bereiche, kontext }, daher funktionieren darfBereich()/darfKpi()
//  unverändert. Zusätzlich trägt sie einen Namen, eine Beschreibung und
//  eine Mitgliederliste (Namen pflegt der Admin später im Tool).
//
//  Zwei Stufen Rechte:
//   1) Bereiche  – welche Fachbereiche (E2) sieht die Gruppe?  '*' = alle
//   2) Kontext   – Object-Level-Security-Freigaben für vertrauliche KPIs
//                  (GF = vertrauliche GF-Zahlen, HR = Personaldaten,
//                   FIN = Finanz-/Ergebnisdaten)
//
//  Persistenz heute: localStorage. Morgen: MSSQL-Tabelle / AD-Gruppen.
// =========================================================================
import { BERICHTSBAUM } from './reportTree.js'
import { CLUSTER, clusterFuer } from './bereiche.js'
import { QUELLE } from './dataProvider.js'

const KEY = 'er_gruppen'

// Object-Level-Security-Freigaben (Tags an geschützten KPIs).
export const KONTEXTE = [
  { id: 'GF',  name: 'Vertrauliche GF-Kennzahlen', hinweis: 'Konzernergebnis, sensible Steuerungsgrößen' },
  { id: 'HR',  name: 'Personaldaten',              hinweis: 'Personalkosten, Fluktuation, Köpfe' },
  { id: 'FIN', name: 'Finanz-/Ergebnisdaten',      hinweis: 'Margen, DB, Ergebnis je Einheit' }
]

// Alle Fachbereiche (E2) mit Klartextnamen – aus EINER Quelle (dem Baum).
export function alleBereiche() {
  return (BERICHTSBAUM.kinder || [])
    .filter((k) => k.bereich)
    .map((k) => ({ code: k.bereich, name: k.titel, cluster: clusterFuer(k.bereich)?.id || 'weitere' }))
}

// Fachbereiche nach Cluster gruppiert (für die Rechte-Matrix).
export function bereicheNachCluster() {
  const alle = alleBereiche()
  const gruppen = CLUSTER.map((c) => ({ cluster: c, bereiche: alle.filter((b) => b.cluster === c.id) }))
    .filter((g) => g.bereiche.length)
  const rest = alle.filter((b) => b.cluster === 'weitere')
  if (rest.length) gruppen.push({ cluster: { id: 'weitere', name: 'Weitere' }, bereiche: rest })
  return gruppen
}

// =========================================================================
//  VORDEFINIERTE GRUPPEN (Vorlagen)  – Namen/Mitglieder fügt der Admin zu.
//  bereiche: '*' = alle Fachbereiche; sonst Liste von Bereichscodes.
// =========================================================================
export const VORLAGEN = [
  { id: 'g-gf',          name: 'Geschäftsführung',         beschreibung: 'Vollzugriff auf alle Bereiche und alle vertraulichen Kennzahlen.',
    bereiche: '*', kontext: ['GF', 'HR', 'FIN'], mitglieder: [] },
  { id: 'g-controlling', name: 'Controlling',              beschreibung: 'Alle Bereiche und Finanzzahlen – ohne Personaldetails.',
    bereiche: '*', kontext: ['FIN'], mitglieder: [] },
  { id: 'g-finanzen',    name: 'Finanzen & Buchhaltung',   beschreibung: 'Finanz-, Abschluss- und Treasury-Bereiche inkl. Ergebniszahlen.',
    bereiche: ['FIN', 'FIBU', 'KON', 'KLR', 'LIQ', 'TRE'], kontext: ['FIN'], mitglieder: [] },
  { id: 'g-vertrieb',    name: 'Vertrieb & Marketing',     beschreibung: 'Markt-, Kunden-, Service- und Kampagnensicht.',
    bereiche: ['VK', 'VC', 'MKT', 'SVC'], kontext: [], mitglieder: [] },
  { id: 'g-supply',      name: 'Produktion & Supply Chain', beschreibung: 'Einkauf, Produktion, Planung, Logistik, Bestände, Qualität.',
    bereiche: ['EK', 'PR', 'PP', 'LOG', 'SCC', 'QM'], kontext: [], mitglieder: [] },
  { id: 'g-personal',    name: 'Personal (HR)',            beschreibung: 'HR- und Personalcontrolling inkl. vertraulicher Personaldaten.',
    bereiche: ['HR', 'PC'], kontext: ['HR'], mitglieder: [] },
  { id: 'g-leser',       name: 'Lesezugriff (Standard)',   beschreibung: 'Eingeschränkte Lesesicht ohne vertrauliche Kennzahlen.',
    bereiche: ['VK', 'LOG'], kontext: [], mitglieder: [] }
]

const klon = (g) => JSON.parse(JSON.stringify(g))

function seed() {
  const s = VORLAGEN.map((g) => ({ ...klon(g), system: true }))
  localStorage.setItem(KEY, JSON.stringify(s))
  return s
}

/** Alle Gruppen laden (beim Erststart aus den Vorlagen befüllt). */
export function ladeGruppen() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) { const a = JSON.parse(raw); if (Array.isArray(a) && a.length) return a }
  } catch { /* fällt auf Seed zurück */ }
  return seed()
}

function speichere(list) { localStorage.setItem(KEY, JSON.stringify(list)); return list }

/** Auf die Vorlagen zurücksetzen (verwirft eigene Gruppen/Mitglieder). */
export function setzeZurueck() { return seed() }

/** Neue, leere Gruppe anlegen. */
export function neueGruppe() {
  const list = ladeGruppen()
  const neu = { id: 'g_' + Date.now().toString(36), name: 'Neue Gruppe', beschreibung: '',
    bereiche: [], kontext: [], mitglieder: [], system: false }
  return speichere([...list, neu])
}

export function aktualisiereGruppe(id, patch) {
  return speichere(ladeGruppen().map((g) => (g.id === id ? { ...g, ...patch } : g)))
}

export function loescheGruppe(id) {
  return speichere(ladeGruppen().filter((g) => g.id !== id))
}

/** Bereichszugriff einer Gruppe umschalten (Code rein/raus; '*' bleibt '*'). */
export function toggleBereich(id, code) {
  const list = ladeGruppen()
  return speichere(list.map((g) => {
    if (g.id !== id || g.bereiche === '*') return g
    const has = g.bereiche.includes(code)
    return { ...g, bereiche: has ? g.bereiche.filter((b) => b !== code) : [...g.bereiche, code] }
  }))
}

/** "Alle Bereiche" setzen/aufheben. */
export function setzeAlleBereiche(id, alle) {
  return aktualisiereGruppe(id, { bereiche: alle ? '*' : [] })
}

/** Object-Level-Security-Freigabe umschalten. */
export function toggleKontext(id, tag) {
  const list = ladeGruppen()
  return speichere(list.map((g) => {
    if (g.id !== id) return g
    const has = g.kontext.includes(tag)
    return { ...g, kontext: has ? g.kontext.filter((k) => k !== tag) : [...g.kontext, tag] }
  }))
}

export function mitgliedHinzu(id, name) {
  const n = (name || '').trim()
  if (!n) return ladeGruppen()
  return speichere(ladeGruppen().map((g) =>
    g.id === id && !g.mitglieder.includes(n) ? { ...g, mitglieder: [...g.mitglieder, n] } : g))
}

export function mitgliedWeg(id, name) {
  return speichere(ladeGruppen().map((g) =>
    g.id === id ? { ...g, mitglieder: g.mitglieder.filter((m) => m !== name) } : g))
}

/** Darf eine Gruppe die Rechteverwaltung bedienen? (Vollzugriff + GF-Freigabe) */
export function istAdmin(gruppe) {
  return !!gruppe && gruppe.bereiche === '*' && (gruppe.kontext || []).includes('GF')
}

// =========================================================================
//  SEAM mock | mssql  — analog zum dataProvider.
//   mock  -> Gruppen aus localStorage (im Tool voll editierbar)
//   mssql -> Gruppen/Rechte aus der DB (server: /api/gruppen,
//            /api/benutzer/:login/rechte). Fällt bei Fehlern auf lokal zurück,
//            damit das Tool immer nutzbar bleibt.
// =========================================================================

/** Ist die Gruppenquelle die Datenbank? (dann ist die Verwaltung lesend) */
export const GRUPPEN_QUELLE = QUELLE

/** Gruppen laden — aus DB (mssql) oder localStorage (mock). */
export async function ladeGruppenAsync() {
  if (QUELLE === 'mssql') {
    try {
      const r = await fetch('/api/gruppen')
      if (r.ok) {
        const a = await r.json()
        if (Array.isArray(a) && a.length) return a.map((g) => ({ ...g, system: g.system ?? true }))
      }
    } catch { /* Fallback auf lokale Vorlagen */ }
  }
  return ladeGruppen()
}

/** Effektive Rolle eines Benutzers — aus DB-View (mssql) oder lokal (mock). */
export async function effektiveRolleAsync(name) {
  const n = (name || '').trim()
  if (!n) return null
  if (QUELLE === 'mssql') {
    try {
      const r = await fetch(`/api/benutzer/${encodeURIComponent(n)}/rechte`)
      if (r.status === 404) return null
      if (r.ok) return await r.json()
    } catch { /* Fallback lokal */ }
  }
  return effektiveRolleFuerName(n)
}

/** Alle Gruppen, in denen ein Name (Login) Mitglied ist (Groß-/Kleinschreibung egal). */
export function findeGruppenFuerName(name) {
  const n = (name || '').trim().toLowerCase()
  if (!n) return []
  return ladeGruppen().filter((g) => g.mitglieder.some((m) => m.toLowerCase() === n))
}

/**
 * Effektive Rolle eines angemeldeten Benutzers: die VEREINIGUNG der Rechte
 * aller seiner Gruppen (ein Benutzer kann in mehreren Gruppen sein).
 * Liefert ein rolle-kompatibles Objekt { bereiche, kontext } oder null.
 */
export function effektiveRolleFuerName(name) {
  const treffer = findeGruppenFuerName(name)
  if (!treffer.length) return null
  const alle = treffer.some((g) => g.bereiche === '*')
  const bereiche = alle ? '*' : [...new Set(treffer.flatMap((g) => g.bereiche))]
  const kontext = [...new Set(treffer.flatMap((g) => g.kontext))]
  return { id: 'user:' + name, name, bereiche, kontext, gruppen: treffer.map((g) => g.name) }
}

/** Kurze Klartext-Zusammenfassung der Bereichsrechte. */
export function bereichZusammenfassung(gruppe) {
  if (!gruppe) return '—'
  if (gruppe.bereiche === '*') return 'Alle Fachbereiche'
  const n = gruppe.bereiche.length
  return n === 0 ? 'Keine Bereiche' : `${n} Fachbereich${n === 1 ? '' : 'e'}`
}
