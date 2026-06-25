// =========================================================================
//  ONEPAGER — einheitliche Ein-Seiten-Vorlage je Knoten/Ebene (1–5). Bindet
//  Lage (Ampel/Kernaussage), die KPIs des Knotens (mit Ziel/Verlauf), einen
//  festen Qualitätskennzahlen-Block, Kommentierung und den Drill in die
//  nächste Ebene zusammen — über den echten Berichtsbaum (reportTree).
// =========================================================================
import { BERICHTSBAUM, EBENEN } from './reportTree.js'
import { KPI } from './kpiRegistry.js'
import { kpiInsight } from './insights.js'
import { darfKpi } from './rbac.js'

// Querschnitts-Qualitätskennzahlen — auf jedem OnePager sichtbar (rechtegeprüft).
export const QUALITAET_KPIS = ['firstPassYield', 'reklamationsquote', 'nacharbeitsquote', 'qualitaetskostenquote', 'garantiekosten']
const SEV = { r: 2, a: 1, g: 0, n: -1 }

export function findeKnoten(id, node = BERICHTSBAUM) {
  if (!id || node.id === id) return node
  for (const c of node.kinder || []) { const f = findeKnoten(id, c); if (f) return f }
  return null
}

export function pfadZu(id, node = BERICHTSBAUM, weg = []) {
  const next = [...weg, node]
  if (node.id === id) return next
  for (const c of node.kinder || []) { const f = pfadZu(id, c, next); if (f) return f }
  return null
}

function kpiZeile(idKpi, werte, rolle) {
  const k = KPI[idKpi]
  if (!k || werte?.[idKpi] == null) return null
  if (rolle && !darfKpi(rolle, k)) return null
  const ins = kpiInsight(idKpi, werte[idKpi])
  return { id: idKpi, name: k.name, einheit: k.einheit, wert: werte[idKpi], ziel: k.ziel, status: ins.status, aussage: ins.aussage, deltaPct: ins.abwZielPct, zielText: ins.zielText }
}

function lageVon(kpis) {
  const verteilung = { g: 0, a: 0, r: 0 }
  kpis.forEach((k) => { if (verteilung[k.status] != null) verteilung[k.status]++ })
  const status = kpis.length ? (verteilung.r ? 'r' : verteilung.a ? 'a' : 'g') : 'n'
  return { verteilung, status }
}

/** Vollständige OnePager-Daten zu einem Knoten (per Id oder Knoten). */
export function onepager(idOrNode, werte = {}, rolle = null) {
  const node = typeof idOrNode === 'string' ? findeKnoten(idOrNode) : idOrNode
  if (!node) return null
  const kpis = (node.kpis || []).map((id) => kpiZeile(id, werte, rolle)).filter(Boolean)
  const qualitaet = QUALITAET_KPIS.map((id) => kpiZeile(id, werte, rolle)).filter(Boolean)
  const { verteilung, status } = lageVon(kpis)
  const leit = [...kpis].sort((a, b) => SEV[b.status] - SEV[a.status] || Math.abs(b.deltaPct || 0) - Math.abs(a.deltaPct || 0))[0] || null
  const kinder = (node.kinder || []).map((c) => {
    const ck = (c.kpis || []).map((id) => kpiZeile(id, werte, rolle)).filter(Boolean)
    return { id: c.id, titel: c.titel, ebene: c.ebene, detail: c.detail || null, status: lageVon(ck).status, hatKinder: (c.kinder || []).length > 0 }
  })
  return { node, ebene: EBENEN[node.ebene - 1], pfad: pfadZu(node.id) || [node], kpis, qualitaet, verteilung, status, leit, kinder }
}

/** Kernaussage des OnePagers (ein Satz). */
export function kernaussage(op) {
  if (!op || !op.kpis.length) return 'Keine bewertbaren Kennzahlen auf dieser Ebene.'
  const v = op.verteilung, t = []
  if (v.r) t.push(`${v.r} rot`)
  if (v.a) t.push(`${v.a} gelb`)
  if (v.g) t.push(`${v.g} grün`)
  return op.leit ? `${t.join(' · ')} — Treiber: ${op.leit.name} (${op.leit.aussage})` : t.join(' · ')
}

/** Empfehlung des OnePagers. */
export function empfehlung(op) {
  if (!op || !op.leit) return 'Stufenweise in die auffälligen Knoten abtauchen.'
  if (op.status === 'g') return 'Auf Kurs — Niveau halten, Treiber sichern.'
  return `${op.leit.name} ${op.leit.aussage} — vorrangig gegensteuern; in die nächste Ebene abtauchen.`
}
