// =========================================================================
//  DESIGNER-SEED — erzeugt aus dem Berichtsbaum 20 fertige Management-Reports
//  als echte Designer-Reports (Blöcke: Text · KPIs · Maßnahmen).
//  Stabile IDs (seed-<knoten>) -> idempotent und im Katalog/Transport wählbar.
// =========================================================================
import { BERICHTSBAUM } from './reportTree.js'
import { KPI } from './kpiRegistry.js'
import { ladeReports, saveReport } from './designer.js'

// Alle Baumknoten mit Inhalt einsammeln; KPI-Knoten zuerst (gehaltvoller).
function knotenMitInhalt() {
  const out = []
  ;(function walk(n, pfad = []) {
    const tp = [...pfad, n.titel]
    const kpis = (n.kpis || []).filter((id) => KPI[id])
    if (kpis.length || n.detail) out.push({ knoten: n, pfad: tp.slice(0, -1), kpis })
    ;(n.kinder || []).forEach((k) => walk(k, tp))
  })(BERICHTSBAUM)
  return out.sort((a, b) => b.kpis.length - a.kpis.length)
}

export function beispielReports() {
  const heute = new Date().toISOString().slice(0, 10)
  return knotenMitInhalt().slice(0, 20).map(({ knoten, pfad, kpis }) => ({
    id: 'seed-' + knoten.id,
    titel: knoten.titel,
    beschreibung: pfad.length ? pfad.join(' › ') : 'Konzern / Gesamtsicht',
    bloecke: [
      { typ: 'text', titel: 'Kontext',
        text: `Management Report zu „${knoten.titel}"${pfad.length ? ` (${pfad.join(' › ')})` : ''}. Kennzahlen mit Ist/Ziel und Ampel; offene Maßnahmen am Ende.` },
      ...kpis.map((id) => ({ typ: 'kpi', kpiId: id })),
      { typ: 'massnahmen' }
    ],
    erstellt: heute
  }))
}

/** 20 Beispiel-Reports anlegen (vorhandene seed-IDs werden überschrieben). */
export function seedBeispielReports() {
  const reports = beispielReports()
  reports.forEach(saveReport)
  return { erstellt: reports.length, gesamt: ladeReports().length }
}
