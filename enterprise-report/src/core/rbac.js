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

/** Object-Level-Security: darf die Rolle diese KPI sehen? */
export function darfKpi(rolle, kpi) {
  if (!kpi?.security) return true            // kein Schutz -> sichtbar
  if (rolle.bereiche === '*' && rolle.kontext.length === 0) return false
  return kpi.security.some((s) => rolle.kontext.includes(s) || (rolle.bereiche !== '*' && rolle.bereiche.includes(s)))
}
