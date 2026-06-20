// =========================================================================
//  BI-PROVIDER — die Naht zwischen Self-Service-BI-UI und "Intelligenz".
//
//   'heuristik' -> offline, deterministisch (biHeuristik.js). Läuft SOFORT.
//   'claude'    -> ruft das Backend (server/biAgents.js), das den
//                  Controller-Lead + Berater-Beirat mit Claude (claude-opus-4-8)
//                  ausführt und denselben Bericht-Vertrag zurückgibt.
//
//  Umschalten über VITE_BI_SOURCE. Die UI kennt nur diese Funktion.
// =========================================================================
import { biHeuristik } from './biHeuristik.js'
import { empfehleHeuristik } from './massnahmen.js'
import { KPI } from './kpiRegistry.js'
import { darfKpi } from './rbac.js'

export const BI_QUELLE = import.meta.env?.VITE_BI_SOURCE || 'heuristik'

// Geschützte KPI-Werte entfernen, die die Rolle nicht sehen darf —
// damit weder Heuristik noch Claude-Backend sie zu Gesicht bekommen.
function sichtbareWerte(werte, rolle) {
  if (!rolle) return werte
  const out = {}
  for (const [id, v] of Object.entries(werte)) {
    if (!KPI[id] || darfKpi(rolle, KPI[id])) out[id] = v
  }
  return out
}

/**
 * Erzeugt aus einer natürlichsprachlichen Anforderung einen BI-Bericht
 * (Vertrag siehe agentBoard.js -> BI_REPORT_FELDER).
 * @param {string} anforderung  Freitext des Anwenders
 * @param {object} werte        aktuelle KPI-Werte (aus dataProvider)
 */
export async function erzeugeBiBericht(anforderung, werte, rolle = null) {
  const werteSicht = sichtbareWerte(werte, rolle)
  if (BI_QUELLE === 'claude') {
    const r = await fetch('/api/bi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anforderung, werte: werteSicht })
    })
    if (!r.ok) throw new Error('BI-Backend (Claude) nicht erreichbar')
    return r.json()
  }
  // Offline: kleine künstliche Verzögerung für realistisches UX.
  await new Promise((res) => setTimeout(res, 350))
  return biHeuristik(anforderung, werteSicht, rolle)
}

/**
 * KI-Auswertung „wie ein Controller": liefert SMART-Maßnahmen zu einem
 * Bericht/Kontext. heuristik = offline; claude = Backend /api/massnahmen.
 * @param {string} kontext  z. B. Berichtstitel / Bereich
 * @param {object} werte    aktuelle KPI-Werte
 * @param {object} rolle    fürs Object-Level-Security
 */
export async function empfehleMassnahmen(kontext, werte, rolle = null) {
  const werteSicht = sichtbareWerte(werte, rolle)
  if (BI_QUELLE === 'claude') {
    const r = await fetch('/api/massnahmen', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kontext, werte: werteSicht })
    })
    if (!r.ok) throw new Error('Maßnahmen-Backend (Claude) nicht erreichbar')
    return r.json()
  }
  await new Promise((res) => setTimeout(res, 300))
  return empfehleHeuristik(werteSicht, rolle)
}
