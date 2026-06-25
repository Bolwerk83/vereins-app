// =========================================================================
//  GLOBALE SUCHE — Index über alle Berichte/Ansichten und KPIs, damit man
//  oben rechts tippen und direkt dorthin springen kann.
//
//  - NAV_ZIELE: navigierbare Ansichten (ansicht-Key + i18n-Schlüssel + Gruppe)
//  - baueIndex(t, kpis): baut den durchsuchbaren Index (Berichte + KPIs)
//  - suchen(index, q): einfache, gewichtete Volltextsuche
// =========================================================================

// Navigierbare Ziele. `ziel` = der ansicht-Key, den App.jsx versteht.
export const NAV_ZIELE = [
  { ziel: 'baum', gruppe: 'Berichte', schluessel: 'nav.tree' },
  { ziel: 'kennzahlen', gruppe: 'Berichte', schluessel: 'nav.kennzahlen' },
  { ziel: 'tagesreporting', gruppe: 'Berichte', schluessel: 'nav.tagesreporting' },
  { ziel: 'kpieditor', gruppe: 'Berichte', schluessel: 'nav.kpieditor' },
  { ziel: 'katalog', gruppe: 'Berichte', schluessel: 'nav.katalog' },
  { ziel: 'detailberichte', gruppe: 'Berichte', schluessel: 'nav.detailberichte' },
  { ziel: 'designer', gruppe: 'Berichte', schluessel: 'nav.designer' },
  { ziel: 'controlling', gruppe: 'Berichte', schluessel: 'nav.controlling' },
  { ziel: 'klrablauf', gruppe: 'Berichte', schluessel: 'nav.klrablauf' },
  { ziel: 'ablaufdiagramm', gruppe: 'Berichte', schluessel: 'nav.ablauf' },
  { ziel: 'datenarchitektur', gruppe: 'Wissen', schluessel: 'nav.datenarchitektur' },
  { ziel: 'klr', gruppe: 'Berichte', schluessel: 'nav.klr' },
  { ziel: 'einzelgemein', gruppe: 'Berichte', schluessel: 'nav.einzelgemein' },
  { ziel: 'abgrenzung', gruppe: 'Berichte', schluessel: 'nav.abgrenzung' },
  { ziel: 'kostenstellen', gruppe: 'Berichte', schluessel: 'nav.kostenstellen' },
  { ziel: 'bab', gruppe: 'Berichte', schluessel: 'nav.bab' },
  { ziel: 'profitcenter', gruppe: 'Berichte', schluessel: 'nav.profitcenter' },
  { ziel: 'kalkulation', gruppe: 'Berichte', schluessel: 'nav.kalkulation' },
  { ziel: 'ergebnis', gruppe: 'Berichte', schluessel: 'nav.ergebnis' },
  { ziel: 'deckungsbeitrag', gruppe: 'Berichte', schluessel: 'nav.db' },
  { ziel: 'kalkulatorik', gruppe: 'Berichte', schluessel: 'nav.kalkulatorik' },
  { ziel: 'bi', gruppe: 'Analyse', schluessel: 'nav.bi' },
  { ziel: 'vergleich', gruppe: 'Analyse', schluessel: 'nav.vergleich' },
  { ziel: 'segment', gruppe: 'Analyse', schluessel: 'nav.segment' },
  { ziel: 'abweichung', gruppe: 'Analyse', schluessel: 'nav.abweichung' },
  { ziel: 'qc', gruppe: 'Analyse', schluessel: 'nav.qc' },
  { ziel: 'abstimmung', gruppe: 'Analyse', schluessel: 'nav.abstimmung' },
  { ziel: 'lebenszyklus', gruppe: 'Analyse', schluessel: 'nav.lebenszyklus' },
  { ziel: 'portfoliobcg', gruppe: 'Analyse', schluessel: 'nav.portfoliobcg' },
  { ziel: 'quartalsbericht', gruppe: 'Cockpit', schluessel: 'nav.quartalsbericht' },
  { ziel: 'finanzcockpit', gruppe: 'Kosten & Ergebnis', schluessel: 'nav.finanzcockpit' },
  { ziel: 'pckostenstellen', gruppe: 'Kosten & Ergebnis', schluessel: 'nav.pckostenstellen' },
  { ziel: 'kontenstrukturen', gruppe: 'Kosten & Ergebnis', schluessel: 'nav.kontenstrukturen' },
  { ziel: 'leasing', gruppe: 'Kosten & Ergebnis', schluessel: 'nav.leasing' },
  { ziel: 'versand', gruppe: 'Operativ', schluessel: 'nav.versand' },
  { ziel: 'google', gruppe: 'Operativ', schluessel: 'nav.google' },
  { ziel: 'datenquellen', gruppe: 'Wissen', schluessel: 'nav.datenquellen' },
  { ziel: 'bestandsentwicklung', gruppe: 'Operativ', schluessel: 'nav.bestandsentwicklung' },
  { ziel: 'marktpotenzial', gruppe: 'Operativ', schluessel: 'nav.marktpotenzial' },
  { ziel: 'verkaufsstatistik', gruppe: 'Operativ', schluessel: 'nav.verkaufsstatistik' },
  { ziel: 'fahrradstatistik', gruppe: 'Operativ', schluessel: 'nav.fahrradstatistik' },
  { ziel: 'einkaufsstatistik', gruppe: 'Operativ', schluessel: 'nav.einkaufsstatistik' },
  { ziel: 'produktionsstatistik', gruppe: 'Operativ', schluessel: 'nav.produktionsstatistik' },
  { ziel: 'lzempfehlung', gruppe: 'Analyse', schluessel: 'nav.lzempfehlung' },
  { ziel: 'artikelkarte', gruppe: 'Analyse', schluessel: 'nav.artikelkarte' },
  { ziel: 'auftrag', gruppe: 'Analyse', schluessel: 'nav.auftrag' },
  { ziel: 'anlagen', gruppe: 'Analyse', schluessel: 'nav.anlagen' },
  { ziel: 'lieferant', gruppe: 'Analyse', schluessel: 'nav.lieferant' },
  { ziel: 'marketing', gruppe: 'Analyse', schluessel: 'nav.marketing' },
  { ziel: 'marketingkarte', gruppe: 'Analyse', schluessel: 'nav.marketingkarte' },
  { ziel: 'bestand', gruppe: 'Analyse', schluessel: 'nav.bestand' },
  { ziel: 'lager', gruppe: 'Operativ', schluessel: 'nav.lager' },
  { ziel: 'produktion', gruppe: 'Operativ', schluessel: 'nav.produktion' },
  { ziel: 'wms', gruppe: 'Operativ', schluessel: 'nav.wms' },
  { ziel: 'planung', gruppe: 'Steuerung', schluessel: 'nav.planung' },
  { ziel: 'szenario', gruppe: 'Steuerung', schluessel: 'nav.szenario' },
  { ziel: 'gutschriften', gruppe: 'Operativ', schluessel: 'nav.gutschriften' },
  { ziel: 'vertriebkpi', gruppe: 'Berichte', schluessel: 'nav.vertriebkpi' },
  { ziel: 'prozesskette', gruppe: 'Analyse', schluessel: 'nav.prozesskette' },
  { ziel: 'abgleichabsatz', gruppe: 'Analyse', schluessel: 'nav.abgleichabsatz' },
  { ziel: 'forderungen', gruppe: 'Analyse', schluessel: 'nav.forderungen' },
  { ziel: 'mitarbeiter', gruppe: 'Analyse', schluessel: 'nav.mitarbeiter' },
  { ziel: 'technologie', gruppe: 'Analyse', schluessel: 'nav.technologie' },
  { ziel: 'instrumente', gruppe: 'Analyse', schluessel: 'nav.instrumente' },
  { ziel: 'alerts', gruppe: 'Analyse', schluessel: 'nav.alerts' },
  { ziel: 'events', gruppe: 'Analyse', schluessel: 'nav.events' },
  { ziel: 'massnahmen', gruppe: 'Steuerung', schluessel: 'nav.massnahmen' },
  { ziel: 'zeit', gruppe: 'Steuerung', schluessel: 'nav.zeit' },
  { ziel: 'abschluss', gruppe: 'Steuerung', schluessel: 'nav.abschluss' },
  { ziel: 'verteiler', gruppe: 'Steuerung', schluessel: 'nav.verteiler' },
  { ziel: 'transport', gruppe: 'Steuerung', schluessel: 'nav.transport' },
  { ziel: 'admin', gruppe: 'Steuerung', schluessel: 'nav.admin' },
  { ziel: 'berichtfreigabe', gruppe: 'Administration', schluessel: 'nav.berichtfreigabe' },
  { ziel: 'datenmodell', gruppe: 'Administration', schluessel: 'nav.datenmodell' },
  { ziel: 'datenschutz', gruppe: 'Administration', schluessel: 'nav.datenschutz' },
  { ziel: 'kisteuerung', gruppe: 'Administration', schluessel: 'nav.kisteuerung' },
  { ziel: 'berichtlog', gruppe: 'Administration', schluessel: 'nav.berichtlog' },
  { ziel: 'kibuilder', gruppe: 'Berichte', schluessel: 'nav.kibuilder' },
  { ziel: 'lernpfad', gruppe: 'Steuerung', schluessel: 'nav.lernpfad' },
  { ziel: 'doku', gruppe: 'Steuerung', schluessel: 'nav.doku' }
]

const norm = (s) => String(s || '').toLowerCase().trim()

/**
 * Baut den Suchindex aus Navigationszielen und KPIs.
 * @param {(k:string)=>string} t  i18n-Funktion (Label-Übersetzung)
 * @param {Record<string,{id,name,einheit?}>} kpis  KPI-Registry (KPI)
 */
// Benannte Visualisierungen (Charts/Diagramme/Sektionen) → Zielbericht. Damit
// findet man ein Visual auch über seinen Namen und springt direkt dorthin.
export const VISUALS = [
  { name: 'Umsatzverlauf je Monat', ziel: 'verkaufsstatistik' },
  { name: 'Umsatz nach Warengruppe', ziel: 'verkaufsstatistik' },
  { name: 'Top-Artikel nach Umsatz', ziel: 'verkaufsstatistik' },
  { name: 'Profit-Center · Geschäftsbereich & Kanal', ziel: 'verkaufsstatistik' },
  { name: 'E-Bike vs. Bio (Antriebsart)', ziel: 'fahrradstatistik' },
  { name: 'Verteilung nach Preisklasse', ziel: 'fahrradstatistik' },
  { name: 'Verkaufte Räder nach Kategorie', ziel: 'fahrradstatistik' },
  { name: 'ABC-Analyse (Pareto)', ziel: 'einkaufsstatistik' },
  { name: 'Einkaufsvolumen nach Lieferant', ziel: 'einkaufsstatistik' },
  { name: 'Gesamt-Output je Monat', ziel: 'produktionsstatistik' },
  { name: 'Output nach Werk', ziel: 'produktionsstatistik' },
  { name: 'Bilanzstruktur (Aktiva/Passiva)', ziel: 'finanzcockpit' },
  { name: 'Risikobild', ziel: 'finanzcockpit' },
  { name: 'Online ↔ Stationär (Vertriebskanal)', ziel: 'quartalsbericht' },
  { name: 'Kumulierter Umsatzverlauf', ziel: 'quartalsbericht' },
  { name: 'Durchschnittliche Verkaufspreise', ziel: 'quartalsbericht' },
  { name: 'Marktanteil & Benchmark', ziel: 'quartalsbericht' },
  { name: 'Marktpotenzial je PLZ · White Spots', ziel: 'marktpotenzial' },
  { name: 'Lagerbestandsentwicklung', ziel: 'bestandsentwicklung' },
  { name: 'Sternschema-Diagramm', ziel: 'datenarchitektur' },
  { name: 'BCG-Portfolio-Matrix', ziel: 'portfoliobcg' },
  { name: 'Artikel-Journey (Lebenszyklus-Chronologie)', ziel: 'artikelkarte' },
  { name: 'Absatz-Ist/Plan-Vergleich (Artikel)', ziel: 'artikelkarte' },
  { name: 'Produkt-Lebenszyklus-Kurve', ziel: 'lebenszyklus' },
  { name: 'Deckungsbeitrag (stufenweise)', ziel: 'deckungsbeitrag' },
  { name: 'GuV / Ergebniskonto (T-Konto)', ziel: 'ergebnis' },
  { name: 'Profitcenter-Ergebnis (ROCE)', ziel: 'profitcenter' },
  { name: 'Leasinggebühren nach Kategorie', ziel: 'leasing' },
  { name: 'Versand: Erlös ↔ Kosten je Klasse', ziel: 'versand' },
  { name: 'Forderungs-Aging', ziel: 'forderungen' },
  { name: 'Marketing-Landkarte (Choropleth)', ziel: 'marketingkarte' }
]

export function baueIndex(t = (k) => k, kpis = {}) {
  const nav = NAV_ZIELE.map((z) => ({
    typ: 'bericht', ziel: z.ziel, gruppe: z.gruppe, label: t(z.schluessel)
  }))
  const kpi = Object.values(kpis).map((k) => ({
    typ: 'kpi', ziel: k.id, gruppe: 'KPI', label: k.name, sub: k.einheit || null
  }))
  const visual = VISUALS.map((v) => ({
    typ: 'visual', ziel: v.ziel, gruppe: 'Visual', label: v.name, sub: '📊 Visual'
  }))
  return [...nav, ...kpi, ...visual]
}

/**
 * Gewichtete Suche: exakter Treffer > Wortanfang > Teilstring > Gruppe.
 * @returns Treffer absteigend nach Relevanz, auf `limit` begrenzt.
 */
export function suchen(index = [], q = '', limit = 8) {
  const query = norm(q)
  if (!query) return []
  const out = []
  for (const e of index) {
    const label = norm(e.label)
    let score = -1
    if (label === query) score = 100
    else if (label.startsWith(query)) score = 80
    else if (label.split(/\s+/).some((w) => w.startsWith(query))) score = 65
    else if (label.includes(query)) score = 50
    else if (norm(e.gruppe).includes(query)) score = 20
    if (score >= 0) out.push({ ...e, score })
  }
  // KPIs leicht abwerten, damit Berichte bei Gleichstand vorne stehen.
  return out
    .sort((a, b) => (b.score - (b.typ === 'kpi' ? 5 : 0)) - (a.score - (a.typ === 'kpi' ? 5 : 0)) || a.label.length - b.label.length)
    .slice(0, limit)
}
