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

export const BI_QUELLE = import.meta.env?.VITE_BI_SOURCE || 'heuristik'

/**
 * Erzeugt aus einer natürlichsprachlichen Anforderung einen BI-Bericht
 * (Vertrag siehe agentBoard.js -> BI_REPORT_FELDER).
 * @param {string} anforderung  Freitext des Anwenders
 * @param {object} werte        aktuelle KPI-Werte (aus dataProvider)
 */
export async function erzeugeBiBericht(anforderung, werte) {
  if (BI_QUELLE === 'claude') {
    const r = await fetch('/api/bi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anforderung, werte })
    })
    if (!r.ok) throw new Error('BI-Backend (Claude) nicht erreichbar')
    return r.json()
  }
  // Offline: kleine künstliche Verzögerung für realistisches UX.
  await new Promise((res) => setTimeout(res, 350))
  return biHeuristik(anforderung, werte)
}
