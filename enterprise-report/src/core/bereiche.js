// =========================================================================
//  BEREICHE & CLUSTER — zentrale Ordnung der Fachbereiche (Ebene 2).
//  Die 24 Fachbereiche werden zu thematischen Clustern gruppiert. Das ist
//  eine ORGANISATORISCHE Gliederung für die Navigation — die 5-Ebenen-Logik
//  des Berichtsbaums bleibt unverändert.
// =========================================================================

export const CLUSTER = [
  { id: 'fuehrung',   name: 'Führung & Finanzen',          bereiche: ['FIN', 'FIBU', 'KON'] },
  { id: 'markt',      name: 'Markt & Kunde',               bereiche: ['VK', 'VC', 'MKT', 'SVC'] },
  { id: 'supply',     name: 'Produktion & Supply Chain',   bereiche: ['EK', 'PR', 'PP', 'LOG', 'SCC', 'QM'] },
  { id: 'steuerung',  name: 'Planung & Steuerung',         bereiche: ['KLR', 'PLAN', 'FC', 'LIQ', 'TRE'] },
  { id: 'governance', name: 'Risiko & Governance',         bereiche: ['RIS', 'ESG'] },
  { id: 'enabler',    name: 'Enabler & Innovation',        bereiche: ['HR', 'PC', 'IT', 'FE'] }
]

/** Cluster-Definition zu einem Bereichscode finden (oder undefined). */
export function clusterFuer(bereich) {
  return CLUSTER.find((c) => c.bereiche.includes(bereich))
}

/**
 * Die direkten Kinder (E2) eines Wurzelknotens nach Cluster gruppieren.
 * Bereiche ohne Cluster landen in einer Sammelgruppe "Weitere".
 */
export function gruppiereNachCluster(kinder = []) {
  const gruppen = CLUSTER.map((c) => ({
    cluster: c,
    knoten: kinder.filter((k) => c.bereiche.includes(k.bereich))
  })).filter((g) => g.knoten.length)

  const erfasst = new Set(CLUSTER.flatMap((c) => c.bereiche))
  const rest = kinder.filter((k) => !erfasst.has(k.bereich))
  if (rest.length) gruppen.push({ cluster: { id: 'weitere', name: 'Weitere' }, knoten: rest })
  return gruppen
}
