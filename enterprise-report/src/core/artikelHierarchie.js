// =========================================================================
//  ARTIKEL-HIERARCHIE & VERTEILUNGSSCHLÜSSEL
//  Plan-/Gesamtwerte über die Produkthierarchie „splashen" (top-down) bzw.
//  aggregieren (bottom-up). Sieben Ebenen:
//   Warenbereich → Produktobergruppe → Produktgruppe → Modell → Produkt →
//   Variante → Artikel (SKU).
//  Je Knoten ein Anteil (Schlüssel). Geschwister-Anteile werden normiert, ein
//  Elternwert wird also exakt auf die Kinder verteilt.
// =========================================================================

const r0 = (x) => Math.round(x)
const r1 = (x) => Math.round(x * 10) / 10

export const EBENEN = [
  'Warenbereich', 'Produktobergruppe', 'Produktgruppe', 'Modell', 'Produkt', 'Variante', 'Artikel (SKU)'
]

// Demo-Hierarchie (anteil = Verteilungsschlüssel je Geschwistergruppe).
// Bewusst nicht exhaustiv, aber bis auf SKU-Ebene durchgezogen.
export const HIERARCHIE = [
  { id: 'wb-rad', name: 'Fahrräder', anteil: 70, kinder: [
    { id: 'pog-ebike', name: 'E-Bikes', anteil: 65, kinder: [
      { id: 'pg-trekking', name: 'Trekking', anteil: 55, kinder: [
        { id: 'mod-cross', name: 'CrossPower', anteil: 100, kinder: [
          { id: 'prod-cp', name: 'CrossPower 2026', anteil: 100, kinder: [
            { id: 'var-cp-m', name: 'Rahmen M', anteil: 45, kinder: [{ id: 'ART-3001-M', name: 'ART-3001-M', anteil: 100 }] },
            { id: 'var-cp-l', name: 'Rahmen L', anteil: 55, kinder: [{ id: 'ART-3001-L', name: 'ART-3001-L', anteil: 100 }] }
          ] }
        ] }
      ] },
      { id: 'pg-mtb', name: 'Mountain', anteil: 45, kinder: [
        { id: 'mod-peak', name: 'PeakDrive', anteil: 100, kinder: [
          { id: 'prod-pk', name: 'PeakDrive 2026', anteil: 100, kinder: [
            { id: 'var-pk-s', name: 'Rahmen S', anteil: 40, kinder: [{ id: 'ART-3002-S', name: 'ART-3002-S', anteil: 100 }] },
            { id: 'var-pk-m', name: 'Rahmen M', anteil: 60, kinder: [{ id: 'ART-3002-M', name: 'ART-3002-M', anteil: 100 }] }
          ] }
        ] }
      ] }
    ] },
    { id: 'pog-gravel', name: 'Gravel', anteil: 35, kinder: [
      { id: 'pg-allroad', name: 'Allroad', anteil: 100, kinder: [
        { id: 'mod-back', name: 'Backroad', anteil: 100, kinder: [
          { id: 'prod-br', name: 'Backroad 22', anteil: 100, kinder: [
            { id: 'var-br-m', name: 'Rahmen M', anteil: 100, kinder: [{ id: 'ART-2001-M', name: 'ART-2001-M', anteil: 100 }] }
          ] }
        ] }
      ] }
    ] }
  ] },
  { id: 'wb-zub', name: 'Zubehör', anteil: 20, kinder: [
    { id: 'pog-energie', name: 'Energie', anteil: 60, kinder: [
      { id: 'pg-akku', name: 'Akkus', anteil: 100, kinder: [
        { id: 'mod-625', name: '625Wh', anteil: 100, kinder: [
          { id: 'prod-625', name: 'Akku 625Wh', anteil: 100, kinder: [
            { id: 'var-625-std', name: 'Standard', anteil: 100, kinder: [{ id: 'ART-2002', name: 'ART-2002', anteil: 100 }] }
          ] }
        ] }
      ] }
    ] },
    { id: 'pog-nahrung', name: 'Nahrung', anteil: 40, kinder: [
      { id: 'pg-riegel', name: 'Riegel', anteil: 100, kinder: [
        { id: 'mod-energy', name: 'EnergyLine', anteil: 100, kinder: [
          { id: 'prod-rieg', name: 'Energieriegel', anteil: 100, kinder: [
            { id: 'var-rieg-box', name: 'Box', anteil: 100, kinder: [{ id: 'ART-2004', name: 'ART-2004', anteil: 100 }] }
          ] }
        ] }
      ] }
    ] }
  ] },
  { id: 'wb-bek', name: 'Bekleidung', anteil: 10, kinder: [
    { id: 'pog-trikot', name: 'Trikots', anteil: 100, kinder: [
      { id: 'pg-pro', name: 'Pro', anteil: 100, kinder: [
        { id: 'mod-race', name: 'RaceFit', anteil: 100, kinder: [
          { id: 'prod-trikot', name: 'Trikot Pro', anteil: 100, kinder: [
            { id: 'var-trikot-m', name: 'Größe M', anteil: 50, kinder: [{ id: 'ART-2003-M', name: 'ART-2003-M', anteil: 100 }] },
            { id: 'var-trikot-l', name: 'Größe L', anteil: 50, kinder: [{ id: 'ART-2003-L', name: 'ART-2003-L', anteil: 100 }] }
          ] }
        ] }
      ] }
    ] }
  ] }
]

/** Gesamtwert top-down über die Anteile auf alle Knoten „splashen". */
export function verteile(gesamt, knoten = HIERARCHIE) {
  const summe = knoten.reduce((n, k) => n + (k.anteil || 0), 0) || 1
  return knoten.map((k) => {
    const wert = gesamt * (k.anteil || 0) / summe
    return {
      id: k.id, name: k.name, anteil: k.anteil,
      anteilPct: r1((k.anteil || 0) / summe * 100),
      wert: r0(wert),
      kinder: k.kinder && k.kinder.length ? verteile(wert, k.kinder) : []
    }
  })
}

/** Verteilten Baum in eine flache Liste mit Ebenen-Tiefe bringen. */
export function flach(baum, tiefe = 0, pfad = []) {
  const out = []
  for (const k of baum) {
    const p = [...pfad, k.name]
    out.push({ id: k.id, name: k.name, tiefe, ebene: EBENEN[tiefe], anteilPct: k.anteilPct, wert: k.wert, pfad: p, hatKinder: k.kinder.length > 0 })
    if (k.kinder.length) out.push(...flach(k.kinder, tiefe + 1, p))
  }
  return out
}

/** Summe aller Knoten einer Ebene (muss = Gesamtwert sein, top-down). */
export function ebenenSumme(baum, tiefe) {
  return flach(baum).filter((k) => k.tiefe === tiefe).reduce((n, k) => n + k.wert, 0)
}

/** Alle SKU-Blätter mit ihrem verteilten Wert. */
export function blaetter(baum) {
  return flach(baum).filter((k) => !k.hatKinder)
}
