// =========================================================================
//  KALKULATORIK — kalkulatorische Kosten aufbauen (Anders- & Zusatzkosten):
//  kalk. Abschreibung, Zinsen, Wagnisse, Miete, Unternehmerlohn.
//
//  Jeder Baustein hat Eingabefelder, eine Formel und einen begründeten
//  VORSCHLAG, der sich aus den Unternehmenszahlen (werte) ableitet — als
//  kollegiale Hilfe. Konfiguration wird in localStorage gehalten und kann
//  später in die Kostenartenrechnung/Abgrenzung einfließen.
// =========================================================================

const r1 = (x) => Math.round(x * 10) / 10
const r2 = (x) => Math.round(x * 100) / 100

export const BAUSTEINE = [
  {
    id: 'abschreibung', name: 'Kalkulatorische Abschreibung', typ: 'anders',
    laie: 'Verteilt den Werteverzehr von Anlagen gleichmäßig — bewertet zum Wiederbeschaffungswert (nicht zum alten Anschaffungspreis).',
    felder: [
      { key: 'wbw', label: 'Wiederbeschaffungswert', einheit: 'Mio €', default: 5.0 },
      { key: 'nd', label: 'Nutzungsdauer', einheit: 'Jahre', default: 8 },
      { key: 'rw', label: 'Restwert', einheit: 'Mio €', default: 0.5 }
    ],
    berechne: (f) => f.nd > 0 ? r2((f.wbw - f.rw) / f.nd) : 0,
    vorschlag: (w) => ({
      patch: { wbw: 5.0, nd: 8, rw: 0.5 },
      text: 'Anlagevermögen ~9,8 Mio €; Wiederbeschaffungswert konservativ 5,0 Mio € auf 8 Jahre → ≈ 0,56 Mio €/Jahr. Liegt bewusst über der bilanziellen Abschreibung (0,7 Mio €), weil zu höheren Wiederbeschaffungspreisen bewertet wird.'
    })
  },
  {
    id: 'zinsen', name: 'Kalkulatorische Zinsen', typ: 'anders',
    laie: 'Verzinst das im Betrieb gebundene Kapital — auch das Eigenkapital, das ja sonst „arbeiten" könnte.',
    felder: [
      { key: 'kapital', label: 'Betriebsnotwendiges Kapital', einheit: 'Mio €', default: 12.8 },
      { key: 'satz', label: 'Kalk. Zinssatz', einheit: '%', default: 6 }
    ],
    berechne: (f) => r2(f.kapital * f.satz / 100),
    vorschlag: (w) => {
      const kapital = w?.bilanzsumme != null ? r1(w.bilanzsumme * 0.45) : 12.8
      return {
        patch: { kapital, satz: 6 },
        text: `Betriebsnotwendiges Kapital ≈ ${kapital} Mio € (rund 45 % der Bilanzsumme ${w?.bilanzsumme ?? '—'} Mio €: Anlagen + Vorräte + Forderungen − unverzinsliches Fremdkapital). Kalk. Zinssatz 6 % (markt-/WACC-nah) → ${r2(kapital * 0.06)} Mio €.`
      }
    }
  },
  {
    id: 'wagnis', name: 'Kalkulatorische Wagnisse', typ: 'anders',
    laie: 'Setzt erwartete Einzelrisiken planmäßig an (Ausschuss, Garantie, Forderungsausfall) — statt zufälliger Einzelbuchungen.',
    felder: [
      { key: 'bezug', label: 'Bezugsgröße (z. B. Umsatz)', einheit: 'Mio €', default: 52.0 },
      { key: 'satz', label: 'Wagnissatz', einheit: '%', default: 1.0 }
    ],
    berechne: (f) => r2(f.bezug * f.satz / 100),
    vorschlag: (w) => {
      const bezug = w?.nettoumsatz != null ? r1(w.nettoumsatz) : 52.0
      return {
        patch: { bezug, satz: 1.0 },
        text: `Bezug = Nettoumsatz ${bezug} Mio €. Wagnissatz 1,0 % aus Erfahrung (Garantie/Gewährleistung + Forderungsausfall + Ausschuss) → ${r2(bezug * 0.01)} Mio €. Bei steigender Reklamationsquote eher 1,2 %.`
      }
    }
  },
  {
    id: 'miete', name: 'Kalkulatorische Miete', typ: 'anders',
    laie: 'Setzt für selbst genutzte eigene Räume die ortsübliche Marktmiete an — als ob man mieten müsste.',
    felder: [
      { key: 'flaeche', label: 'Fläche', einheit: 'm²', default: 4000 },
      { key: 'miete', label: 'Marktmiete', einheit: '€/m²·Monat', default: 9 }
    ],
    berechne: (f) => r2(f.flaeche * f.miete * 12 / 1e6),
    vorschlag: () => ({
      patch: { flaeche: 4000, miete: 9 },
      text: 'Eigengenutzte Betriebsfläche ~4.000 m², ortsübliche Gewerbemiete 9 €/m²·Monat → 0,43 Mio €/Jahr. Bei reiner Bilanzsicht fehlt dieser Aufwand — kalkulatorisch sauber angesetzt.'
    })
  },
  {
    id: 'unternehmerlohn', name: 'Kalkulatorischer Unternehmerlohn', typ: 'zusatz',
    laie: 'Lohn für mitarbeitende Eigentümer, der buchhalterisch als Gewinn gilt — betriebswirtschaftlich aber „echte" Arbeitskosten sind. Zusatzkosten: kein Aufwand gegenüber.',
    felder: [
      { key: 'gehalt', label: 'Vergleichsgehalt (GF)', einheit: '€/Jahr', default: 180000 }
    ],
    berechne: (f) => r2(f.gehalt / 1e6),
    vorschlag: () => ({
      patch: { gehalt: 180000 },
      text: 'Marktübliches Geschäftsführergehalt für vergleichbare Funktion/Größe ≈ 180.000 €/Jahr (0,18 Mio €). Reine Zusatzkosten — steht in der GuV nicht als Aufwand.'
    })
  }
]
export const baustein = (id) => BAUSTEINE.find((b) => b.id === id)

const KEY = 'er_kalkulatorik'
export function ladeKonfig() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} } }
function speichere(o) { localStorage.setItem(KEY, JSON.stringify(o)); return o }

/** Feldwerte eines Bausteins (gespeicherte, sonst Defaults). */
export function felderVon(id) {
  const b = baustein(id); const gespeichert = ladeKonfig()[id] || {}
  const f = {}
  for (const fe of b.felder) f[fe.key] = gespeichert[fe.key] != null ? gespeichert[fe.key] : fe.default
  return f
}
export function setFelder(id, felder) { return speichere({ ...ladeKonfig(), [id]: felder }) }

/** Wert eines Bausteins (Mio €/Jahr). */
export function wertVon(id) { return baustein(id).berechne(felderVon(id)) }

/** Gesamt-Kalkulatorik: je Baustein + Summen nach Anders/Zusatz. */
export function gesamt() {
  const zeilen = BAUSTEINE.map((b) => ({ id: b.id, name: b.name, typ: b.typ, wert: wertVon(b.id) }))
  const summe = (typ) => r2(zeilen.filter((z) => !typ || z.typ === typ).reduce((n, z) => n + z.wert, 0))
  return { zeilen, anders: summe('anders'), zusatz: summe('zusatz'), summe: summe() }
}
