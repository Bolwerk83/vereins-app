// =========================================================================
//  GOOGLE-DATEN — Google Ads & Analytics als Reporting, abgeglichen mit den
//  Echtdaten (WaWi/Vertrieb). Marketing-Performance, Funnel, Cross-Selling
//  und der Attributions-Abgleich (Google meldet oft mehr als real ankommt).
//  Beträge in €. Demo-Daten (Mock); später Google-Ads-/GA4-API.
// =========================================================================

// --- Google Ads je Kampagne ------------------------------------------------
const ADS = [
  { id: 'k-brand', kampagne: 'Brand Search', kanal: 'Search', typ: 'Suche', impressionen: 420000, klicks: 38000, kosten: 11400, conversions: 1850, conversionWert: 268000, echtQuote: 0.92 },
  { id: 'k-shop-ebike', kampagne: 'Shopping E-Bikes', kanal: 'Shopping', typ: 'Shopping', impressionen: 1250000, klicks: 64000, kosten: 96000, conversions: 2100, conversionWert: 1480000, echtQuote: 0.86 },
  { id: 'k-shop-teile', kampagne: 'Shopping Teile/Zubehör', kanal: 'Shopping', typ: 'Shopping', impressionen: 880000, klicks: 41000, kosten: 28000, conversions: 3600, conversionWert: 392000, echtQuote: 0.9 },
  { id: 'k-pmax-gravel', kampagne: 'PMax Gravel', kanal: 'Performance Max', typ: 'PMax', impressionen: 960000, klicks: 52000, kosten: 74000, conversions: 980, conversionWert: 690000, echtQuote: 0.8 },
  { id: 'k-retarget', kampagne: 'Display Retargeting', kanal: 'Display', typ: 'Display', impressionen: 3200000, klicks: 22000, kosten: 9800, conversions: 540, conversionWert: 96000, echtQuote: 0.78 },
  { id: 'k-youtube', kampagne: 'YouTube Brand', kanal: 'Video', typ: 'Video', impressionen: 2100000, klicks: 14000, kosten: 18000, conversions: 210, conversionWert: 38000, echtQuote: 0.7 }
]
const mitAds = (a) => ({
  ...a,
  ctr: a.klicks / a.impressionen * 100,
  cpc: a.kosten / a.klicks,
  cpa: a.conversions ? a.kosten / a.conversions : 0,
  roas: a.kosten ? a.conversionWert / a.kosten : 0,
  echtumsatz: Math.round(a.conversionWert * a.echtQuote)
})
export function adsKampagnen() { return ADS.map(mitAds) }
export function adsSumme() {
  const a = adsKampagnen()
  const kosten = a.reduce((n, x) => n + x.kosten, 0)
  const wert = a.reduce((n, x) => n + x.conversionWert, 0)
  const echt = a.reduce((n, x) => n + x.echtumsatz, 0)
  return {
    kosten, klicks: a.reduce((n, x) => n + x.klicks, 0), impressionen: a.reduce((n, x) => n + x.impressionen, 0),
    conversions: a.reduce((n, x) => n + x.conversions, 0), conversionWert: wert, echtumsatz: echt,
    roas: kosten ? wert / kosten : 0, cpa: 0, ueberzeichnung: wert - echt, ueberzeichnungPct: echt ? (wert - echt) / echt * 100 : 0
  }
}

// --- Google Analytics (GA4) Funnel & Kanäle -------------------------------
export const FUNNEL = [
  { stufe: 'Sitzungen', wert: 540000 },
  { stufe: 'Produktaufrufe', wert: 286000 },
  { stufe: 'In den Warenkorb', wert: 64000 },
  { stufe: 'Checkout', wert: 28000 },
  { stufe: 'Kauf', wert: 17600 }
]
export function funnelMitRaten() {
  return FUNNEL.map((s, i) => ({ ...s, anteil: +(s.wert / FUNNEL[0].wert * 100).toFixed(1), schritt: i === 0 ? 100 : +(s.wert / FUNNEL[i - 1].wert * 100).toFixed(1) }))
}
export const KANAELE = [
  { kanal: 'Organic Search', anteil: 38 }, { kanal: 'Paid Search/Shopping', anteil: 27 },
  { kanal: 'Direct', anteil: 18 }, { kanal: 'Referral', anteil: 7 },
  { kanal: 'Social', anteil: 6 }, { kanal: 'E-Mail', anteil: 4 }
]

// --- Cross-Selling (oft zusammen gekauft) ---------------------------------
export const CROSS_SELLING = [
  { wenn: 'E-Bike Urban', dann: 'Helm', quote: 64 },
  { wenn: 'E-Bike Urban', dann: 'Rahmenschloss', quote: 58 },
  { wenn: 'Rennrad', dann: 'Radbekleidung', quote: 52 },
  { wenn: 'MTB', dann: 'Schutzausrüstung', quote: 49 },
  { wenn: 'Rennrad', dann: 'Klickpedale', quote: 47 },
  { wenn: 'Gravel', dann: 'Bikepacking-Tasche', quote: 44 },
  { wenn: 'E-Bike', dann: 'Gepäcktasche', quote: 41 }
]

// --- Abgleich Google ↔ Echtdaten ------------------------------------------
export function abgleich() {
  return adsKampagnen().map((a) => ({
    id: a.id, kampagne: a.kampagne,
    google: a.conversionWert, echt: a.echtumsatz,
    differenz: a.conversionWert - a.echtumsatz,
    differenzPct: a.echtumsatz ? (a.conversionWert - a.echtumsatz) / a.echtumsatz * 100 : 0
  }))
}
