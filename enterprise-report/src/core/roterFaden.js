// =========================================================================
//  ROTER FADEN — die durchgängige Erzählung durch das Reporting. Folgt von
//  Ebene 1 (Konzern) automatisch dem KRITISCHEN PFAD nach unten: an jeder
//  Ebene der Zweig mit der schlechtesten Ampel — „wo tut's weh, bis auf
//  Detail-/Verlaufsebene". Der Zweig ist auch frei wählbar.
//
//  Nutzt den echten Berichtsbaum (reportTree) + die KPI-Bewertung (insights),
//  damit Kernaussage und Ampel je Knoten aus den echten Werten kommen.
// =========================================================================
import { BERICHTSBAUM, EBENEN } from './reportTree.js'
import { KPI } from './kpiRegistry.js'
import { kpiInsight } from './insights.js'
import { darfKpi } from './rbac.js'

const SEV = { r: 2, a: 1, g: 0, n: -1 }

function kpiStatus(id, werte, rolle) {
  const k = KPI[id]
  if (!k || werte?.[id] == null) return null
  if (rolle && !darfKpi(rolle, k)) return null
  const ins = kpiInsight(id, werte[id])
  return { id, name: k.name, wert: werte[id], einheit: k.einheit, status: ins.status, aussage: ins.aussage, deltaPct: ins.abwZielPct }
}

function knotenKpis(node, werte, rolle) {
  return (node.kpis || []).map((id) => kpiStatus(id, werte, rolle)).filter(Boolean)
}

// Schwere des gesamten Teilbaums (für die Pfadwahl).
function teilbaumSchwere(node, werte, rolle) {
  let sev = knotenKpis(node, werte, rolle).reduce((m, k) => Math.max(m, SEV[k.status]), -1)
  for (const c of node.kinder || []) sev = Math.max(sev, teilbaumSchwere(c, werte, rolle))
  return sev
}

function schrittVon(node, werte, rolle) {
  const kpis = knotenKpis(node, werte, rolle)
  const verteilung = { g: 0, a: 0, r: 0 }
  kpis.forEach((k) => { if (verteilung[k.status] != null) verteilung[k.status]++ })
  const leitKpi = [...kpis].sort((a, b) => SEV[b.status] - SEV[a.status] || Math.abs(b.deltaPct || 0) - Math.abs(a.deltaPct || 0))[0] || null
  const status = kpis.length ? (verteilung.r ? 'r' : verteilung.a ? 'a' : 'g') : 'n'
  return { ebene: EBENEN[node.ebene - 1], node, kpis, verteilung, leitKpi, status }
}

/**
 * Kritischer Pfad als Schrittfolge (E1 → … → Detail).
 * @param startId  optional: E2-Knoten-Id, um einen anderen Zweig zu erzwingen.
 */
export function kritischerPfad(werte = {}, rolle = null, startId = null) {
  const schritte = []
  let node = BERICHTSBAUM
  schritte.push(schrittVon(node, werte, rolle))
  let erzwinge = startId
  while (node.kinder && node.kinder.length) {
    let next = null
    if (erzwinge && node.ebene === 1) next = node.kinder.find((c) => c.id === erzwinge)
    if (!next) next = [...node.kinder].sort((a, b) => teilbaumSchwere(b, werte, rolle) - teilbaumSchwere(a, werte, rolle))[0]
    if (!next) break
    schritte.push(schrittVon(next, werte, rolle))
    node = next
    erzwinge = null
  }
  return schritte
}

/** Leitkennzahl des Pfades = schlechteste KPI des tiefsten Knotens mit KPIs (für E5-Verlauf). */
export function pfadLeitKpi(schritte) {
  for (let i = schritte.length - 1; i >= 0; i--) if (schritte[i].leitKpi) return schritte[i].leitKpi
  return null
}

/** E2-Fachbereiche mit Schwere & Kernzahlen — für die Zweig-Auswahl. */
export function fachbereiche(werte = {}, rolle = null) {
  return (BERICHTSBAUM.kinder || []).map((c) => ({ id: c.id, titel: c.titel, schwere: teilbaumSchwere(c, werte, rolle), ...schrittVon(c, werte, rolle) }))
}

/** Kernaussage eines Schritts in einem Satz. */
export function kernaussage(schritt) {
  const { verteilung: v, leitKpi, kpis } = schritt
  if (!kpis.length) return 'Detail-/Belegebene — Einzelpositionen dahinter.'
  const teile = []
  if (v.r) teile.push(`${v.r} rot`)
  if (v.a) teile.push(`${v.a} gelb`)
  if (v.g) teile.push(`${v.g} grün`)
  const lage = teile.join(' · ')
  return leitKpi ? `${lage} — Treiber: ${leitKpi.name} (${leitKpi.aussage})` : lage
}
