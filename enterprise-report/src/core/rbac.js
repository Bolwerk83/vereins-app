// =========================================================================
//  ROLLEN- & RECHTE-KONZEPT (RBAC + Object-Level-Security)
//
//  Zwei Stufen:
//   1) Bereichssichtbarkeit  – welche Fachbereiche sieht eine Rolle im Baum?
//   2) Object-Level-Security – einzelne KPIs sind zusätzlich geschützt
//      (z. B. Personalkosten nur GF/HR/FIN), unabhängig vom Bereich.
//
//  Später kommt die Rolle aus dem Login (AD/Entra/MSSQL-Useradmin).
// =========================================================================

export const ROLLEN = {
  gf:           { id: 'gf',          name: 'Geschäftsführung',  bereiche: '*',
                  kontext: ['GF','HR','FIN'] },
  controller:   { id: 'controller',  name: 'Controlling',       bereiche: '*',
                  kontext: ['FIN'] },
  bl_vk:        { id: 'bl_vk',        name: 'Bereichsleiter Verkauf',  bereiche: ['GF','VK'], kontext: [] },
  bl_log:       { id: 'bl_log',       name: 'Bereichsleiter Logistik', bereiche: ['GF','LOG'], kontext: [] },
  bl_hr:        { id: 'bl_hr',        name: 'Bereichsleiter HR',       bereiche: ['GF','HR'],  kontext: ['HR'] },
  mitarbeiter:  { id: 'mitarbeiter', name: 'Mitarbeiter (Lesesicht)', bereiche: ['VK','LOG'], kontext: [] },
  admin:        { id: 'admin',       name: 'Administrator',     bereiche: '*', kontext: ['GF','HR','FIN'] }
}

/** Darf die Rolle den Fachbereich im Baum sehen? */
export function darfBereich(rolle, bereich) {
  if (!bereich) return true                 // strukturelle Knoten ohne Bereich
  if (rolle.bereiche === '*') return true
  return rolle.bereiche.includes(bereich)
}

/**
 * Object-Level-Security: darf die Rolle diese KPI sehen?
 *   1) explizite Einzelsperre (kpiGesperrt) -> nie sichtbar (auch ungeschützte)
 *   2) ungeschützte KPI -> sichtbar
 *   3) explizite Einzelfreigabe (kpiFrei) -> sichtbar (überschreibt security)
 *   4) sonst nach kontext/bereich der Schutz-Liste
 */
export function darfKpi(rolle, kpi) {
  if (!rolle) return true
  const id = kpi?.id
  if (id && (rolle.kpiGesperrt || []).includes(id)) return false
  if (!kpi?.security) return true
  if (id && (rolle.kpiFrei || []).includes(id)) return true
  if (rolle.bereiche === '*' && rolle.kontext.length === 0) return false
  return kpi.security.some((s) => rolle.kontext.includes(s) || (rolle.bereiche !== '*' && rolle.bereiche.includes(s)))
}

/** Darf die Rolle diese Dimension (Aufriss) sehen? Standard: ja, außer gesperrt. */
export function darfDimension(rolle, dimId) {
  if (!rolle || !dimId) return true
  return !(rolle.dimGesperrt || []).includes(dimId)
}
