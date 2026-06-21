// =========================================================================
//  ABWEICHUNGSANALYSE — Plan/Ist je Position in Preis- und Mengenabweichung
//  zerlegen. Saubere Aufspaltung (Preis + Menge = Gesamtabweichung):
//    Preisabweichung  = (Ist-Preis − Plan-Preis) × Ist-Menge
//    Mengenabweichung = (Ist-Menge − Plan-Menge) × Plan-Preis
//  Bewertung: bei Erlösen ist „mehr" günstig, bei Kosten „weniger".
// =========================================================================

// Positionen: Preis (€/Stück), Menge (Stück). art: 'erloes' | 'kosten'.
export const POSITIONEN = [
  { id: 'erl_ebike', name: 'Erlöse E-Bikes',   art: 'erloes', planPreis: 1800, planMenge: 14000, istPreis: 1850, istMenge: 14300 },
  { id: 'erl_city',  name: 'Erlöse City/Trekking', art: 'erloes', planPreis: 700, planMenge: 7000, istPreis: 720, istMenge: 7200 },
  { id: 'kos_material', name: 'Fertigungsmaterial', art: 'kosten', planPreis: 600, planMenge: 14000, istPreis: 620, istMenge: 14300 },
  { id: 'kos_lohn',  name: 'Fertigungslohn',    art: 'kosten', planPreis: 95, planMenge: 14000, istPreis: 92, istMenge: 14300 }
]

const r3 = (x) => Math.round(x * 1000) / 1000

/** Analyse je Position (Beträge in Mio €). */
export function analyse(positionen = POSITIONEN) {
  const rows = positionen.map((p) => {
    const plan = p.planPreis * p.planMenge
    const ist = p.istPreis * p.istMenge
    const gesamt = ist - plan
    const preis = (p.istPreis - p.planPreis) * p.istMenge
    const menge = (p.istMenge - p.planMenge) * p.planPreis
    const guenstig = p.art === 'erloes' ? gesamt >= 0 : gesamt <= 0
    const M = 1e6
    return {
      ...p, planMio: r3(plan / M), istMio: r3(ist / M),
      gesamt: r3(gesamt / M), preisAbw: r3(preis / M), mengenAbw: r3(menge / M), guenstig
    }
  })
  const sum = (k, art) => r3(rows.filter((r) => !art || r.art === art).reduce((n, r) => n + r[k], 0))
  return {
    rows,
    erloes: { gesamt: sum('gesamt', 'erloes'), preis: sum('preisAbw', 'erloes'), menge: sum('mengenAbw', 'erloes') },
    kosten: { gesamt: sum('gesamt', 'kosten'), preis: sum('preisAbw', 'kosten'), menge: sum('mengenAbw', 'kosten') }
  }
}
