// =========================================================================
//  SACHKONTO-STRUKTUREN — mehrere parallele Kontenhierarchien über denselben
//  Kontenstamm. Ein Konto darf in mehreren Bäumen (und mehrfach) vorkommen.
//
//  Bäume:
//   1) GuV-Struktur (Gesamtkostenverfahren) → Ergebnis vor Steuern
//   2) ROI-/DuPont-Baum: ROI = Umsatzrendite × Kapitalumschlag
//   3) Kostenarten (variabel/fix) mit Deckungsbeitragsschema
//
//  Knoten-Typen:
//   - Konten-Knoten:  `konten` (Liste von Kontonummern) → Wert = Σ Beträge
//   - Summen-Knoten:  `kinder` → Wert = Σ (kind.sign × kind.Wert)
//   - Formel-Knoten:  `kinder` + `berechne(c)` → c[key] = Wert des Kindes
//  Beträge in T€.
// =========================================================================

export const KONTEN = [
  // Erlöse
  { nr: '8400', name: 'Umsatzerlöse Inland', betrag: 150000, art: 'erloes' },
  { nr: '8410', name: 'Umsatzerlöse Ausland', betrag: 55000, art: 'erloes' },
  // Aufwand
  { nr: '5100', name: 'Wareneinsatz Fahrräder', betrag: 78000, art: 'aufwand', variabel: true },
  { nr: '5200', name: 'Wareneinsatz Teile', betrag: 24000, art: 'aufwand', variabel: true },
  { nr: '5300', name: 'Wareneinsatz Zubehör', betrag: 18000, art: 'aufwand', variabel: true },
  { nr: '6000', name: 'Personalaufwand', betrag: 45000, art: 'aufwand' },
  { nr: '6500', name: 'Abschreibungen', betrag: 9000, art: 'aufwand' },
  { nr: '6700', name: 'Sonstige betr. Aufwendungen', betrag: 20000, art: 'aufwand' },
  { nr: '7510', name: 'Zinsaufwand', betrag: 3200, art: 'aufwand' },
  // Aktiva (für den ROI-Baum)
  { nr: '0700', name: 'Sachanlagen', betrag: 60000, art: 'aktiva' },
  { nr: '0800', name: 'Immaterielle Vermögensgegenstände', betrag: 8000, art: 'aktiva' },
  { nr: '0900', name: 'Finanzanlagen', betrag: 10000, art: 'aktiva' },
  { nr: '1140', name: 'Vorräte', betrag: 48000, art: 'aktiva' },
  { nr: '1400', name: 'Forderungen aus L+L', betrag: 28000, art: 'aktiva' },
  { nr: '1200', name: 'Sonstige Vermögensgegenstände', betrag: 4000, art: 'aktiva' },
  { nr: '1800', name: 'Bank / Kasse', betrag: 12000, art: 'aktiva' }
]
const BETRAG = Object.fromEntries(KONTEN.map((k) => [k.nr, k.betrag]))
export const kontoInfo = (nr) => KONTEN.find((k) => k.nr === nr)
const summeKonten = (nrs) => nrs.reduce((n, nr) => n + (BETRAG[nr] || 0), 0)

// Kürzel
const wareneinsatz = ['5100', '5200', '5300']
const umsatz = ['8400', '8410']
const alleKosten = ['5100', '5200', '5300', '6000', '6500', '6700']
const gesamtkapital = ['0700', '0800', '0900', '1140', '1400', '1200', '1800']

export const BAEUME = [
  {
    id: 'guv', name: 'GuV-Struktur', kurz: 'GuV',
    beschreibung: 'Gesamtkostenverfahren: von den Umsatzerlösen über die Aufwandsarten zum Ergebnis vor Steuern.',
    wurzel: {
      name: 'Ergebnis vor Steuern (EBT)', typ: 'summe', kinder: [
        { name: 'Umsatzerlöse', sign: 1, konten: umsatz },
        { name: 'Materialaufwand', sign: -1, konten: wareneinsatz },
        { name: 'Personalaufwand', sign: -1, konten: ['6000'] },
        { name: 'Abschreibungen', sign: -1, konten: ['6500'] },
        { name: 'Sonstige betr. Aufwendungen', sign: -1, konten: ['6700'] },
        { name: 'Zinsergebnis', sign: -1, konten: ['7510'] }
      ]
    }
  },
  {
    id: 'roi', name: 'ROI-/DuPont-Baum', kurz: 'ROI',
    beschreibung: 'Kapitalrendite zerlegt: ROI = Umsatzrendite × Kapitalumschlag. Der Umsatz erscheint bewusst in beiden Ästen.',
    wurzel: {
      name: 'ROI', key: 'roi', einheit: '%',
      berechne: (c) => c.umsatzrendite / 100 * c.kapitalumschlag * 100,
      kinder: [
        {
          name: 'Umsatzrendite', key: 'umsatzrendite', einheit: '%',
          berechne: (c) => c.umsatz ? c.betriebsergebnis / c.umsatz * 100 : 0,
          kinder: [
            { name: 'Betriebsergebnis (EBIT)', key: 'betriebsergebnis', einheit: 'T€', typ: 'summe', kinder: [
              { name: 'Umsatzerlöse', sign: 1, konten: umsatz },
              { name: 'Kosten gesamt', sign: -1, konten: alleKosten }
            ] },
            { name: 'Umsatz', key: 'umsatz', einheit: 'T€', konten: umsatz }
          ]
        },
        {
          name: 'Kapitalumschlag', key: 'kapitalumschlag', einheit: '×',
          berechne: (c) => c.gesamtkapital ? c.umsatz2 / c.gesamtkapital : 0,
          kinder: [
            { name: 'Umsatz', key: 'umsatz2', einheit: 'T€', konten: umsatz },
            { name: 'Gesamtkapital', key: 'gesamtkapital', einheit: 'T€', konten: gesamtkapital }
          ]
        }
      ]
    }
  },
  {
    id: 'kostenarten', name: 'Kostenarten (variabel/fix)', kurz: 'DB-Schema',
    beschreibung: 'Deckungsbeitragsschema: Umsatz − variable Kosten = DB, abzüglich Fixkosten = Betriebsergebnis.',
    wurzel: {
      name: 'Betriebsergebnis (EBIT)', typ: 'summe', kinder: [
        { name: 'Deckungsbeitrag', sign: 1, typ: 'summe', kinder: [
          { name: 'Umsatzerlöse', sign: 1, konten: umsatz },
          { name: 'Variable Kosten (Wareneinsatz)', sign: -1, konten: wareneinsatz }
        ] },
        { name: 'Fixkosten', sign: -1, typ: 'summe', kinder: [
          { name: 'Personalaufwand', konten: ['6000'] },
          { name: 'Abschreibungen', konten: ['6500'] },
          { name: 'Sonstige (fix)', konten: ['6700'] }
        ] }
      ]
    }
  }
]

/** Knoten rekursiv auswerten → {...node, wert, kinder:[…ausgewertet]}. */
export function werteBaum(node) {
  const kinder = (node.kinder || []).map(werteBaum)
  let wert
  if (node.berechne) {
    const c = {}; kinder.forEach((k) => { c[k.key] = k.wert })
    wert = node.berechne(c)
  } else if (node.kinder) {
    wert = kinder.reduce((n, k) => n + (k.sign || 1) * k.wert, 0)
  } else {
    wert = summeKonten(node.konten || [])
  }
  return { ...node, wert: +wert.toFixed(2), kinder }
}

export function baum(id) {
  const def = BAEUME.find((b) => b.id === id) || BAEUME[0]
  return { ...def, wurzel: werteBaum(def.wurzel) }
}

/** In welchen Bäumen kommt ein Konto vor (für „auch in …"-Hinweis). */
export function kontoVorkommen(nr) {
  const treffer = []
  const suche = (node, baumName) => {
    if ((node.konten || []).includes(nr) && !treffer.includes(baumName)) treffer.push(baumName)
    ;(node.kinder || []).forEach((k) => suche(k, baumName))
  }
  BAEUME.forEach((b) => suche(b.wurzel, b.kurz))
  return treffer
}
