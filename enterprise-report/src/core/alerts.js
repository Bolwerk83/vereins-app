// =========================================================================
//  ALERTS — alles, was Aufmerksamkeit braucht, an einem Ort:
//   - KPIs außerhalb des Ziels (rot/amber), rechtegeprüft
//   - fehlgeschlagene Querchecks (Abstimmfehler/Plausibilität)
//   - überfällige Maßnahmen
// =========================================================================
import { KPI } from './kpiRegistry.js'
import { darfKpi } from './rbac.js'
import { kpiInsight } from './insights.js'
import { pruefeAlle } from './validierung.js'
import { ladeMassnahmen, istUeberfaellig } from './massnahmen.js'

export function sammleAlerts(werte, rolle) {
  // KPI-Alerts
  const kpis = Object.values(KPI)
    .filter((k) => k.ziel != null && werte[k.id] != null && darfKpi(rolle, k))
    .map((k) => kpiInsight(k.id, werte[k.id]))
    .filter((i) => i.status === 'r' || i.status === 'a')
    .sort((a, b) => (a.status === 'r' ? -1 : 1) - (b.status === 'r' ? -1 : 1))

  // Quercheck-Alerts
  const querchecks = pruefeAlle(werte).filter((q) => q.status === 'fehler' || q.status === 'warnung')

  // Maßnahmen-Alerts
  const massnahmen = ladeMassnahmen().filter(istUeberfaellig)

  const kritisch = kpis.filter((k) => k.status === 'r').length +
    querchecks.filter((q) => q.status === 'fehler').length + massnahmen.length

  return { kpis, querchecks, massnahmen, kritisch,
    gesamt: kpis.length + querchecks.length + massnahmen.length }
}

/** Zahl der kritischen Alerts (für Topbar-Badge). */
export function alertAnzahl(werte, rolle) {
  return sammleAlerts(werte, rolle).kritisch
}
