// =========================================================================
//  BAB (ganze Firma) — Kostenarten × Bereiche, Verteilung über Schlüssel,
//  Umlage des Allgemein-Bereichs auf die Endbereiche, Gemeinkosten nach
//  Umlage und Zuschlagssätze (MGK/FM, FGK/FL, VwGK/HK, VtGK/HK).
// =========================================================================
import { BEREICHE, ENDBEREICHE, schluessel, gewichte } from './verteilung.js'
import { DATENARTEN as PM_DATENARTEN } from './periodenmodell.js'

// Bezugsgrößen für die Zuschlagssätze (Mio €, Ist): Fertigungsmaterial, -lohn.
export const FM = 26.8
export const FL = 5.2

// Auswählbare Datenarten für den BAB (aus dem Periodenmodell).
export const DATENARTEN = PM_DATENARTEN.map((d) => ({ id: d.id, name: d.name, kurz: d.kurz }))

// Faktor je Datenart für eine Kostenart (pf=Plan, ff=Forecast; Tagesrep.≈Ist).
function faktor(k, datenart) {
  if (datenart === 'plan') return k.pf ?? 0.96
  if (datenart === 'forecast') return k.ff ?? 1.03
  if (datenart === 'tagesreporting') return k.tf ?? 1.0
  return 1 // ist
}
// Bezugsgrößen skalieren mit der Datenart (Plan straffer, FC höher).
function bezugFaktor(datenart) {
  return { ist: 1, tagesreporting: 1.0, plan: 0.96, forecast: 1.03 }[datenart] ?? 1
}

// Kostenarten: Summe (Ist, Mio €), Plan-/Forecast-Faktor, Schlüssel.
export const KOSTENARTEN_STD = [
  { id: 'hilfsstoffe', name: 'Hilfsstoffe',     summe: 1.5, pf: 0.95, ff: 1.04, schluessel: 'materialscheine' },
  { id: 'hilfsloehne', name: 'Hilfslöhne',      summe: 0.9, pf: 0.97, ff: 1.02, schluessel: 'lohnzettel' },
  { id: 'gehaelter',   name: 'Gehälter',        summe: 5.3, pf: 0.98, ff: 1.01, schluessel: 'gehaltsliste' },
  { id: 'steuern',     name: 'Steuern/Abgaben', summe: 1.0, pf: 1.00, ff: 1.00, schluessel: 'verwaltungslast' },
  { id: 'raum',        name: 'Raumkosten',      summe: 1.3, pf: 1.00, ff: 1.00, schluessel: 'flaeche' },
  { id: 'abschr',      name: 'Abschreibungen',  summe: 0.7, pf: 1.00, ff: 1.00, schluessel: 'inventarwert' },
  { id: 'energie',     name: 'Energie',         summe: 1.8, pf: 0.93, ff: 1.08, schluessel: 'flaeche' },
  { id: 'it',          name: 'IT/Lizenzen',     summe: 1.2, pf: 0.96, ff: 1.05, schluessel: 'koepfe' },
  { id: 'marketing',   name: 'Marketing',       summe: 2.9, pf: 0.90, ff: 1.06, schluessel: 'direkt_vertrieb' },
  { id: 'logistik',    name: 'Logistik',        summe: 2.3, pf: 0.95, ff: 1.04, schluessel: 'direkt_vertrieb' }
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

/** Vollständiger BAB für eine Datenart (ist/tagesreporting/plan/forecast). */
export function bab(datenart = 'ist') {
  const kostenarten = ladeKostenarten().map((k) => {
    const g = gewichte(schluessel(k.schluessel))
    const summe = r2(k.summe * faktor(k, datenart))
    const verteilung = {}
    for (const b of BEREICHE) verteilung[b.id] = r2((g[b.id] || 0) * summe)
    return { ...k, summe, schluesselName: schluessel(k.schluessel)?.name || k.schluessel, verteilung }
  })
  const fmEff = r2(FM * bezugFaktor(datenart))
  const flEff = r2(FL * bezugFaktor(datenart))

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

  const hk = r2(fmEff + nachUmlage.material + flEff + nachUmlage.fertigung)
  const zuschlag = {
    material:  r1(nachUmlage.material / fmEff * 100),
    fertigung: r1(nachUmlage.fertigung / flEff * 100),
    verwaltung: r1(nachUmlage.verwaltung / hk * 100),
    vertrieb:  r1(nachUmlage.vertrieb / hk * 100)
  }
  const bezug = { material: { label: 'Fertigungsmaterial', wert: fmEff }, fertigung: { label: 'Fertigungslohn', wert: flEff }, verwaltung: { label: 'Herstellkosten', wert: hk }, vertrieb: { label: 'Herstellkosten', wert: hk } }

  return { datenart, kostenarten, primaer, umlage, nachUmlage, zuschlag, bezug, fm: fmEff, fl: flEff, hk, summe: r2(kostenarten.reduce((n, k) => n + k.summe, 0)) }
}
