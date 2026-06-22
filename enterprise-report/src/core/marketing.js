// =========================================================================
//  MARKETING & DIGITAL-ANALYTICS — Web/Funnel, Traffic-Kanäle, Kampagnen
//  und Cross-Selling. Aussagekräftige Kennzahlen wie in Web-Analytics:
//  Sessions, Conversion Rate, ROAS, CAC, AOV, Funnel-Conversion.
// =========================================================================

const r1 = (x) => Math.round(x * 10) / 10
const r2 = (x) => Math.round(x * 100) / 100

// --- Web-Analytics (Onlineshop) -----------------------------------------
export const WEB = {
  sessions: 480000, nutzer: 312000, seitenaufrufe: 1850000,
  bounceRate: 42, avgDauerSek: 185, conversionRate: 2.6, transaktionen: 12480, umsatzMio: 23.4
}
export const webKennzahlen = () => ({
  ...WEB,
  seitenProSession: r1(WEB.seitenaufrufe / WEB.sessions),
  aov: Math.round(WEB.umsatzMio * 1e6 / WEB.transaktionen) // Ø Bestellwert €
})

// --- Conversion-Funnel ---------------------------------------------------
export const FUNNEL = [
  { id: 'besuch',     name: 'Besuche (Sessions)', anzahl: 480000 },
  { id: 'produkt',    name: 'Produktansicht',     anzahl: 268000 },
  { id: 'warenkorb',  name: 'In den Warenkorb',   anzahl: 86000 },
  { id: 'checkout',   name: 'Checkout gestartet', anzahl: 31000 },
  { id: 'kauf',       name: 'Kauf abgeschlossen', anzahl: 12480 }
]
export function funnel() {
  const start = FUNNEL[0].anzahl || 1
  return FUNNEL.map((s, i) => ({
    ...s,
    abGesamt: r1(s.anzahl / start * 100),
    abVorstufe: i === 0 ? 100 : r1(s.anzahl / FUNNEL[i - 1].anzahl * 100)
  }))
}

// --- Traffic-Kanäle ------------------------------------------------------
export const KANAELE = [
  { id: 'organic', name: 'Organic Search', sessions: 168000, cvr: 2.9, umsatzMio: 8.1, spendMio: 0 },
  { id: 'sea',     name: 'Paid Search (SEA)', sessions: 96000, cvr: 3.4, umsatzMio: 6.2, spendMio: 1.1 },
  { id: 'social',  name: 'Social', sessions: 84000, cvr: 1.6, umsatzMio: 2.4, spendMio: 0.6 },
  { id: 'direct',  name: 'Direct', sessions: 72000, cvr: 3.1, umsatzMio: 3.6, spendMio: 0 },
  { id: 'email',   name: 'E-Mail/CRM', sessions: 36000, cvr: 4.8, umsatzMio: 2.1, spendMio: 0.1 },
  { id: 'referral', name: 'Referral', sessions: 24000, cvr: 2.2, umsatzMio: 1.0, spendMio: 0 }
]
export function kanaele() {
  return KANAELE.map((k) => ({ ...k, roas: k.spendMio > 0 ? r1(k.umsatzMio / k.spendMio) : null }))
}

// --- Kampagnen -----------------------------------------------------------
export const KAMPAGNEN = [
  { id: 'fruehjahr', name: 'Frühjahrs-Sale E-Bike', spendMio: 0.45, umsatzMio: 3.2, conversions: 1700 },
  { id: 'blackfriday', name: 'Black Friday', spendMio: 0.60, umsatzMio: 4.8, conversions: 2600 },
  { id: 'leasing', name: 'Leasing B2B', spendMio: 0.20, umsatzMio: 1.4, conversions: 180 },
  { id: 'retarget', name: 'Zubehör Retargeting', spendMio: 0.15, umsatzMio: 0.9, conversions: 1200 }
]
export function kampagnen() {
  return KAMPAGNEN.map((c) => ({
    ...c, roas: c.spendMio > 0 ? r1(c.umsatzMio / c.spendMio) : null,
    cac: c.conversions > 0 ? Math.round(c.spendMio * 1e6 / c.conversions) : null
  }))
}

// --- Cross-Selling -------------------------------------------------------
export const PRODUKTPAARE = [
  { a: 'Akku 625Wh', b: 'Ladegerät', anteil: 52, lift: 3.1 },
  { a: 'E-Bike', b: 'Helm', anteil: 38, lift: 2.4 },
  { a: 'E-Bike', b: 'Schloss', anteil: 31, lift: 2.0 },
  { a: 'E-Bike', b: 'Tasche', anteil: 24, lift: 1.7 },
  { a: 'Trekking', b: 'Lampe', anteil: 18, lift: 1.5 }
]
export const CROSS = { crossSellQuote: 27, itemsProBestellung: 2.3, empfehlung: 'Bundle „E-Bike + Helm + Schloss" aktiv bewerben — höchste gemeinsame Kaufrate.' }

/** Gesamt-ROAS & Marketingkennzahlen über alle Kanäle/Kampagnen. */
export function marketingKpis() {
  const k = kanaele()
  const umsatz = r2(k.reduce((n, x) => n + x.umsatzMio, 0))
  const spend = r2(k.reduce((n, x) => n + x.spendMio, 0))
  const w = webKennzahlen()
  return {
    umsatz, spend,
    roasGesamt: spend > 0 ? r1(umsatz / spend) : null,
    conversionRate: w.conversionRate, aov: w.aov,
    crossSellQuote: CROSS.crossSellQuote, marketingquote: r1(spend / umsatz * 100)
  }
}
