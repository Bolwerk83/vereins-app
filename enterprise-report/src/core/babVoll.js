// =========================================================================
//  BAB (ganze Firma) — Kostenarten × Bereiche, Verteilung über Schlüssel,
//  Umlage des Allgemein-Bereichs auf die Endbereiche, Gemeinkosten nach
//  Umlage und Zuschlagssätze (MGK/FM, FGK/FL, VwGK/HK, VtGK/HK).
// =========================================================================
import { BEREICHE, ENDBEREICHE, schluessel, gewichte } from './verteilung.js'

// Bezugsgrößen für die Zuschlagssätze (Mio €): Fertigungsmaterial, -lohn.
export const FM = 26.8
export const FL = 5.2

// Kostenarten mit Summe (Mio €) und zugeordnetem Verteilungsschlüssel.
export const KOSTENARTEN_STD = [
  { id: 'hilfsstoffe', name: 'Hilfsstoffe',     summe: 1.5, schluessel: 'materialscheine' },
  { id: 'hilfsloehne', name: 'Hilfslöhne',      summe: 0.9, schluessel: 'lohnzettel' },
  { id: 'gehaelter',   name: 'Gehälter',        summe: 5.3, schluessel: 'gehaltsliste' },
  { id: 'steuern',     name: 'Steuern/Abgaben', summe: 1.0, schluessel: 'verwaltungslast' },
  { id: 'raum',        name: 'Raumkosten',      summe: 1.3, schluessel: 'flaeche' },
  { id: 'abschr',      name: 'Abschreibungen',  summe: 0.7, schluessel: 'inventarwert' },
  { id: 'energie',     name: 'Energie',         summe: 1.8, schluessel: 'flaeche' },
  { id: 'it',          name: 'IT/Lizenzen',     summe: 1.2, schluessel: 'koepfe' },
  { id: 'marketing',   name: 'Marketing',       summe: 2.9, schluessel: 'direkt_vertrieb' },
  { id: 'logistik',    name: 'Logistik',        summe: 2.3, schluessel: 'direkt_vertrieb' }
]

const KEY = 'er_bab_zuordnung'
function zuordnungen() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} } }
export function setZuordnung(kostenartId, schluesselId) {
  const z = zuordnungen(); z[kostenartId] = schluesselId
  localStorage.setItem(KEY, JSON.stringify(z)); return z
}
export function ladeKostenarten() {
  const z = zuordnungen()
  return KOSTENARTEN_STD.map((k) => ({ ...k, schluessel: z[k.id] || k.schluessel }))
}

const r2 = (x) => Math.round(x * 100) / 100
const r1 = (x) => Math.round(x * 10) / 10

/** Vollständiger BAB. */
export function bab() {
  const kostenarten = ladeKostenarten().map((k) => {
    const g = gewichte(schluessel(k.schluessel))
    const verteilung = {}
    for (const b of BEREICHE) verteilung[b.id] = r2((g[b.id] || 0) * k.summe)
    return { ...k, schluesselName: schluessel(k.schluessel)?.name || k.schluessel, verteilung }
  })

  // Primärsummen je Bereich.
  const primaer = {}
  for (const b of BEREICHE) primaer[b.id] = r2(kostenarten.reduce((n, k) => n + (k.verteilung[b.id] || 0), 0))

  // Umlage des Allgemein-Bereichs auf die Endbereiche (Schlüssel: Fläche).
  const gFlaeche = gewichte(schluessel('flaeche'))
  const endSum = ENDBEREICHE.reduce((n, e) => n + (gFlaeche[e] || 0), 0) || 1
  const umlage = {}
  for (const e of ENDBEREICHE) umlage[e] = r2(primaer.allgemein * (gFlaeche[e] || 0) / endSum)

  // Gemeinkosten nach Umlage je Endbereich.
  const nachUmlage = {}
  for (const e of ENDBEREICHE) nachUmlage[e] = r2((primaer[e] || 0) + (umlage[e] || 0))

  const hk = r2(FM + nachUmlage.material + FL + nachUmlage.fertigung)
  const zuschlag = {
    material:  r1(nachUmlage.material / FM * 100),
    fertigung: r1(nachUmlage.fertigung / FL * 100),
    verwaltung: r1(nachUmlage.verwaltung / hk * 100),
    vertrieb:  r1(nachUmlage.vertrieb / hk * 100)
  }
  const bezug = { material: { label: 'Fertigungsmaterial', wert: FM }, fertigung: { label: 'Fertigungslohn', wert: FL }, verwaltung: { label: 'Herstellkosten', wert: hk }, vertrieb: { label: 'Herstellkosten', wert: hk } }

  return { kostenarten, primaer, umlage, nachUmlage, zuschlag, bezug, hk, summe: r2(kostenarten.reduce((n, k) => n + k.summe, 0)) }
}
