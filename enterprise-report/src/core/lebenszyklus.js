// =========================================================================
//  PRODUKT-LEBENSZYKLUS & PORTFOLIO — mehrstufig (Artikel → Produkt → Kunde).
//
//  Je Objekt: Umsatz, Deckungsbeitrag (%), Wachstum (% ggü. Vorjahr).
//  Die Lebenszyklus-Phase wird transparent aus dem Wachstum abgeleitet:
//    Einführung (sehr hohes Wachstum) → Wachstum → Reife → Rückgang.
//  So lässt sich das Portfolio auf jeder Ebene auswerten und aufreißen.
// =========================================================================

export const EBENEN = [
  { id: 'artikel', name: 'Artikel' },
  { id: 'produkt', name: 'Produktgruppe' },
  { id: 'kunde',   name: 'Kunde' }
]

export const PHASEN = [
  { id: 'einfuehrung', name: 'Einführung', farbe: '#7c3aed', laie: 'Neu am Markt: hohes Wachstum, noch dünner Deckungsbeitrag.' },
  { id: 'wachstum',    name: 'Wachstum',   farbe: '#2563eb', laie: 'Setzt sich durch: steigender Umsatz und Deckungsbeitrag.' },
  { id: 'reife',       name: 'Reife',      farbe: '#10b981', laie: 'Stabil und ertragsstark: geringes Wachstum, hoher Deckungsbeitrag.' },
  { id: 'rueckgang',   name: 'Rückgang',   farbe: '#ef4444', laie: 'Schrumpfend: rückläufiger Umsatz — Abverkauf/Nachfolge prüfen.' }
]
export const phaseInfo = (id) => PHASEN.find((p) => p.id === id)

/** Phase aus dem Wachstum ableiten (transparent, testbar). */
export function phaseVon(wachstum) {
  if (wachstum >= 20) return 'einfuehrung'
  if (wachstum >= 6) return 'wachstum'
  if (wachstum >= -3) return 'reife'
  return 'rueckgang'
}

// Stammdaten: umsatz (Mio €), db (%), wachstum (% YoY). parent = Produktgruppe.
const ROH = [
  // Produktgruppen
  { ebene: 'produkt', id: 'ebike',   name: 'E-Bikes',         umsatz: 30.1, db: 37, wachstum: 9 },
  { ebene: 'produkt', id: 'city',    name: 'City/Trekking',   umsatz: 9.6,  db: 34, wachstum: 4 },
  { ebene: 'produkt', id: 'teile',   name: 'Teile',           umsatz: 8.8,  db: 39, wachstum: -2 },
  { ebene: 'produkt', id: 'zubehoer', name: 'Zubehör',        umsatz: 5.7,  db: 44, wachstum: 1 },
  { ebene: 'produkt', id: 'bekleidung', name: 'Bekleidung',   umsatz: 3.7,  db: 32, wachstum: -6 },
  { ebene: 'produkt', id: 'cargo',   name: 'E-Cargo',         umsatz: 1.2,  db: 20, wachstum: 35 },
  // Artikel je Produktgruppe (parent)
  { ebene: 'artikel', id: 'a-emtb',  name: 'E-MTB Trail Pro', parent: 'ebike', umsatz: 12.4, db: 38, wachstum: 12 },
  { ebene: 'artikel', id: 'a-urban', name: 'E-Bike Urban 500', parent: 'ebike', umsatz: 10.2, db: 36, wachstum: 7 },
  { ebene: 'artikel', id: 'a-etrek', name: 'E-Trekking 700',  parent: 'ebike', umsatz: 7.5,  db: 37, wachstum: 2 },
  { ebene: 'artikel', id: 'a-city7', name: 'City 7',          parent: 'city',  umsatz: 5.1,  db: 34, wachstum: 3 },
  { ebene: 'artikel', id: 'a-trek5', name: 'Trekking 5',      parent: 'city',  umsatz: 4.5,  db: 33, wachstum: 5 },
  { ebene: 'artikel', id: 'a-antrieb', name: 'Antriebseinheit M3', parent: 'teile', umsatz: 4.2, db: 40, wachstum: -1 },
  { ebene: 'artikel', id: 'a-schalt', name: 'Schaltwerk 12s', parent: 'teile', umsatz: 2.6,  db: 38, wachstum: -5 },
  { ebene: 'artikel', id: 'a-akku',  name: 'Akku 625Wh',      parent: 'teile', umsatz: 2.0,  db: 39, wachstum: 6 },
  { ebene: 'artikel', id: 'a-helm',  name: 'Helme',           parent: 'zubehoer', umsatz: 2.1, db: 46, wachstum: 2 },
  { ebene: 'artikel', id: 'a-tasche', name: 'Taschen',        parent: 'zubehoer', umsatz: 1.8, db: 43, wachstum: 0 },
  { ebene: 'artikel', id: 'a-lampe', name: 'Lampen',          parent: 'zubehoer', umsatz: 1.8, db: 42, wachstum: 1 },
  { ebene: 'artikel', id: 'a-jacke', name: 'Jacken',          parent: 'bekleidung', umsatz: 1.6, db: 33, wachstum: -5 },
  { ebene: 'artikel', id: 'a-hose',  name: 'Hosen',           parent: 'bekleidung', umsatz: 1.2, db: 31, wachstum: -7 },
  { ebene: 'artikel', id: 'a-trikot', name: 'Trikots',        parent: 'bekleidung', umsatz: 0.9, db: 32, wachstum: -6 },
  { ebene: 'artikel', id: 'a-cargof', name: 'Cargo Family',   parent: 'cargo', umsatz: 0.7,  db: 21, wachstum: 40 },
  { ebene: 'artikel', id: 'a-cargol', name: 'Cargo Load',     parent: 'cargo', umsatz: 0.5,  db: 18, wachstum: 30 },
  // Kunden
  { ebene: 'kunde', id: 'k-online',  name: 'Onlineshop (Privat)', umsatz: 23.4, db: 39, wachstum: 8 },
  { ebene: 'kunde', id: 'k-leasing', name: 'Leasing-Partner A',  umsatz: 7.8,  db: 32, wachstum: 15 },
  { ebene: 'kunde', id: 'k-veloch',  name: 'Velo Schweiz AG',    umsatz: 6.2,  db: 40, wachstum: 2 },
  { ebene: 'kunde', id: 'k-b2b',     name: 'B2B-Händler B',      umsatz: 5.2,  db: 30, wachstum: 4 },
  { ebene: 'kunde', id: 'k-filiale', name: 'Filialkette C',      umsatz: 4.7,  db: 28, wachstum: -3 },
  { ebene: 'kunde', id: 'k-nl',      name: 'Stadtflotte NL',     umsatz: 4.2,  db: 31, wachstum: 22 }
]

const mitPhase = (o) => ({ ...o, phase: phaseVon(o.wachstum) })

/** Objekte einer Ebene (mit abgeleiteter Phase). */
export function daten(ebene) { return ROH.filter((o) => o.ebene === ebene).map(mitPhase) }

/** Artikel unterhalb einer Produktgruppe (Drill-down). */
export function kinder(produktId) { return ROH.filter((o) => o.ebene === 'artikel' && o.parent === produktId).map(mitPhase) }

/** Phasen-Verteilung einer Ebene: je Phase Anzahl, Umsatz, Umsatzanteil. */
export function phaseVerteilung(ebene) {
  const d = daten(ebene); const ges = d.reduce((n, x) => n + x.umsatz, 0) || 1
  return PHASEN.map((p) => {
    const grp = d.filter((x) => x.phase === p.id)
    const umsatz = +grp.reduce((n, x) => n + x.umsatz, 0).toFixed(1)
    return { ...p, anzahl: grp.length, umsatz, anteil: +(umsatz / ges * 100).toFixed(1) }
  })
}
