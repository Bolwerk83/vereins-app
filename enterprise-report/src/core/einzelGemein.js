// =========================================================================
//  EINZEL- & GEMEINKOSTEN — Zurechenbarkeit und Zuschlagskalkulation.
//
//  Einzelkosten : direkt einem Produkt/Auftrag zurechenbar (Material, Lohn).
//  Gemeinkosten : nur über einen Schlüssel/Zuschlag zurechenbar (Miete, Verw.).
//    echt   : prinzipiell nicht direkt zuordenbar (z. B. Geschäftsführung)
//    unecht : wäre zurechenbar, wird aber aus Wirtschaftlichkeit pauschaliert
//  relative Einzelkosten (Riebel): jede Kostenart ist Einzelkosten zu einem
//    passenden Bezugsobjekt — nur die Ebene (Produkt/Auftrag/Bereich) zählt.
//
//  Praktischer Nutzen: differenzierte Zuschlagskalkulation
//    Material(EK+GK) + Fertigung(EK+GK) = Herstellkosten
//    + Verwaltungs-GK + Vertriebs-GK    = Selbstkosten
// =========================================================================

export const KONZEPTE = [
  { begriff: 'Einzelkosten', laie: 'Direkt einem Produkt zurechenbar — z. B. das verbaute Material und der Fertigungslohn am Stück.' },
  { begriff: 'Gemeinkosten', laie: 'Für mehrere Produkte gemeinsam; nur über einen Schlüssel/Zuschlag zurechenbar — z. B. Miete, Verwaltung, IT.' },
  { begriff: 'Echte Gemeinkosten', laie: 'Lassen sich grundsätzlich nicht direkt zuordnen (z. B. Geschäftsführung, Gebäude).' },
  { begriff: 'Unechte Gemeinkosten', laie: 'Wären eigentlich zurechenbar, werden aber aus Wirtschaftlichkeit pauschal als Gemeinkosten behandelt (z. B. Schrauben, Klebstoff).' },
  { begriff: 'Relative Einzelkosten (Riebel)', laie: 'Jede Kostenart ist Einzelkosten — man muss nur das passende Bezugsobjekt wählen (Stück, Auftrag, Bereich). Nur die Ebene entscheidet.' }
]

export const GK_BEISPIELE = {
  echt: ['Geschäftsführung', 'Gebäude/Miete', 'Buchhaltung/Controlling', 'Allgemeine IT'],
  unecht: ['Kleinteile (Schrauben, Klebstoff)', 'Hilfsstoffe', 'Energie der Fertigung']
}

// Kostenblöcke (Mio €) für die differenzierte Zuschlagskalkulation.
export const BLOECKE = [
  { id: 'mek',  name: 'Materialeinzelkosten',     art: 'einzel', betrag: 26.8 },
  { id: 'mgk',  name: 'Materialgemeinkosten',     art: 'gemein', betrag: 1.6, basis: 'mek',  zuschlagAuf: 'Materialeinzelkosten' },
  { id: 'fek',  name: 'Fertigungseinzelkosten',   art: 'einzel', betrag: 5.2 },
  { id: 'fgk',  name: 'Fertigungsgemeinkosten',   art: 'gemein', betrag: 3.4, basis: 'fek',  zuschlagAuf: 'Fertigungseinzelkosten' },
  { id: 'vwgk', name: 'Verwaltungsgemeinkosten',  art: 'gemein', betrag: 7.4, basis: 'hk',   zuschlagAuf: 'Herstellkosten' },
  { id: 'vtgk', name: 'Vertriebsgemeinkosten',    art: 'gemein', betrag: 7.2, basis: 'hk',   zuschlagAuf: 'Herstellkosten' }
]

/** Zuschlagssätze + Kalkulationsschema bis Selbstkosten. */
export function kalkulation() {
  const b = Object.fromEntries(BLOECKE.map((x) => [x.id, x.betrag]))
  const hk = +(b.mek + b.mgk + b.fek + b.fgk).toFixed(2)
  const selbst = +(hk + b.vwgk + b.vtgk).toFixed(2)
  const pct = (z, n) => +(z / n * 100).toFixed(1)
  const zuschlag = { mgk: pct(b.mgk, b.mek), fgk: pct(b.fgk, b.fek), vwgk: pct(b.vwgk, hk), vtgk: pct(b.vtgk, hk) }
  const einzel = +(b.mek + b.fek).toFixed(2)
  const gemein = +(b.mgk + b.fgk + b.vwgk + b.vtgk).toFixed(2)
  return { b, hk, selbst, zuschlag, einzel, gemein, gemeinquote: +(gemein / (einzel + gemein) * 100).toFixed(1) }
}

/** Kalkulationsschema als Zeilen (für die Tabelle), mit Zuschlag-Hinweis. */
export function schema() {
  const k = kalkulation()
  return [
    { label: 'Materialeinzelkosten', wert: k.b.mek, typ: 'pos' },
    { label: 'Materialgemeinkosten', wert: k.b.mgk, typ: 'pos', hinweis: `${k.zuschlag.mgk} % auf MEK` },
    { label: 'Fertigungseinzelkosten', wert: k.b.fek, typ: 'pos' },
    { label: 'Fertigungsgemeinkosten', wert: k.b.fgk, typ: 'pos', hinweis: `${k.zuschlag.fgk} % auf FEK` },
    { label: 'Herstellkosten', wert: k.hk, typ: 'sum' },
    { label: 'Verwaltungsgemeinkosten', wert: k.b.vwgk, typ: 'pos', hinweis: `${k.zuschlag.vwgk} % auf HK` },
    { label: 'Vertriebsgemeinkosten', wert: k.b.vtgk, typ: 'pos', hinweis: `${k.zuschlag.vtgk} % auf HK` },
    { label: 'Selbstkosten', wert: k.selbst, typ: 'sum' }
  ]
}
