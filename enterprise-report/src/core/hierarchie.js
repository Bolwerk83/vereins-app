// =========================================================================
//  HIERARCHIE — aufklappbare Berichts-Struktur (wie eine Power-BI-Matrix).
//  Blätter tragen gemessene Werte; Elternknoten werden aggregiert (Summe).
//  flach() liefert je nach geöffneten Knoten die sichtbaren Zeilen.
//  Demo-Struktur: Umsatz/DB nach Warenbereich → Warengruppe → Artikel.
// =========================================================================
const r1 = (n) => Math.round(n * 10) / 10

export const STRUKTUR = {
  id: 'gesamt', name: 'Gesamt', kinder: [
    { id: 'b-fahrrad', name: 'Fahrräder', kinder: [
      { id: 'g-gravel', name: 'Gravel', kinder: [
        { id: 'a-gravel-al', name: 'Gravel AL', umsatz: 4200000, db: 1180000, menge: 2600 },
        { id: 'a-gravel-carbon', name: 'Gravel Carbon', umsatz: 6100000, db: 2010000, menge: 1700 }
      ] },
      { id: 'g-rennrad', name: 'Rennrad', umsatz: 5200000, db: 1560000, menge: 1500 },
      { id: 'g-mtb', name: 'MTB', umsatz: 3100000, db: 870000, menge: 1200 }
    ] },
    { id: 'b-ebike', name: 'E-Bikes', kinder: [
      { id: 'g-egravel', name: 'E-Gravel', umsatz: 9800000, db: 2450000, menge: 2100 },
      { id: 'g-eurban', name: 'E-Urban', umsatz: 7400000, db: 1630000, menge: 1900 },
      { id: 'g-emtb', name: 'E-MTB', umsatz: 5600000, db: 1340000, menge: 1100 }
    ] },
    { id: 'b-zubehoer', name: 'Zubehör', kinder: [
      { id: 'g-helme', name: 'Helme', umsatz: 1200000, db: 540000, menge: 9000 },
      { id: 'g-bekleidung', name: 'Bekleidung', umsatz: 2300000, db: 1010000, menge: 14000 },
      { id: 'g-teile', name: 'Teile & Akku', umsatz: 3900000, db: 1170000, menge: 22000 }
    ] }
  ]
}

/** Werte rekursiv aggregieren (Eltern = Summe der Kinder). */
export function aggregiere(node) {
  if (!node.kinder || !node.kinder.length) {
    return { ...node, umsatz: node.umsatz || 0, db: node.db || 0, menge: node.menge || 0, blatt: true }
  }
  const kinder = node.kinder.map(aggregiere)
  return {
    ...node, blatt: false, kinder,
    umsatz: kinder.reduce((n, k) => n + k.umsatz, 0),
    db: kinder.reduce((n, k) => n + k.db, 0),
    menge: kinder.reduce((n, k) => n + k.menge, 0)
  }
}

/** Sichtbare Zeilen je geöffneten Knoten (Set von IDs), mit Tiefe & Kennzahlen. */
export function flach(root, offen = new Set()) {
  const gesamtUmsatz = root.umsatz || 1
  const out = []
  const rec = (node, tiefe) => {
    out.push({
      id: node.id, name: node.name, tiefe, hatKinder: !node.blatt, offen: offen.has(node.id),
      umsatz: node.umsatz, db: node.db, menge: node.menge,
      dbProzent: node.umsatz ? r1(node.db / node.umsatz * 100) : 0,
      anteil: r1(node.umsatz / gesamtUmsatz * 100)
    })
    if (!node.blatt && offen.has(node.id)) for (const k of node.kinder) rec(k, tiefe + 1)
  }
  rec(root, 0)
  return out
}

/** Alle IDs (für Alle-aufklappen). */
export function alleIds(node, acc = []) {
  acc.push(node.id)
  if (node.kinder) for (const k of node.kinder) alleIds(k, acc)
  return acc
}
