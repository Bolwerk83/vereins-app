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
  { ziel: 'kpieditor', gruppe: 'Berichte', schluessel: 'nav.kpieditor' },
  { ziel: 'katalog', gruppe: 'Berichte', schluessel: 'nav.katalog' },
  { ziel: 'detailberichte', gruppe: 'Berichte', schluessel: 'nav.detailberichte' },
  { ziel: 'designer', gruppe: 'Berichte', schluessel: 'nav.designer' },
  { ziel: 'controlling', gruppe: 'Berichte', schluessel: 'nav.controlling' },
  { ziel: 'klrablauf', gruppe: 'Berichte', schluessel: 'nav.klrablauf' },
  { ziel: 'ablaufdiagramm', gruppe: 'Berichte', schluessel: 'nav.ablauf' },
  { ziel: 'klr', gruppe: 'Berichte', schluessel: 'nav.klr' },
  { ziel: 'einzelgemein', gruppe: 'Berichte', schluessel: 'nav.einzelgemein' },
  { ziel: 'abgrenzung', gruppe: 'Berichte', schluessel: 'nav.abgrenzung' },
  { ziel: 'kostenstellen', gruppe: 'Berichte', schluessel: 'nav.kostenstellen' },
  { ziel: 'bab', gruppe: 'Berichte', schluessel: 'nav.bab' },
  { ziel: 'profitcenter', gruppe: 'Berichte', schluessel: 'nav.profitcenter' },
  { ziel: 'kalkulation', gruppe: 'Berichte', schluessel: 'nav.kalkulation' },
  { ziel: 'ergebnis', gruppe: 'Berichte', schluessel: 'nav.ergebnis' },
  { ziel: 'deckungsbeitrag', gruppe: 'Berichte', schluessel: 'nav.db' },
  { ziel: 'bi', gruppe: 'Analyse', schluessel: 'nav.bi' },
  { ziel: 'vergleich', gruppe: 'Analyse', schluessel: 'nav.vergleich' },
  { ziel: 'segment', gruppe: 'Analyse', schluessel: 'nav.segment' },
  { ziel: 'abweichung', gruppe: 'Analyse', schluessel: 'nav.abweichung' },
  { ziel: 'qc', gruppe: 'Analyse', schluessel: 'nav.qc' },
  { ziel: 'abstimmung', gruppe: 'Analyse', schluessel: 'nav.abstimmung' },
  { ziel: 'lebenszyklus', gruppe: 'Analyse', schluessel: 'nav.lebenszyklus' },
  { ziel: 'lzempfehlung', gruppe: 'Analyse', schluessel: 'nav.lzempfehlung' },
  { ziel: 'auftrag', gruppe: 'Analyse', schluessel: 'nav.auftrag' },
  { ziel: 'anlagen', gruppe: 'Analyse', schluessel: 'nav.anlagen' },
  { ziel: 'lieferant', gruppe: 'Analyse', schluessel: 'nav.lieferant' },
  { ziel: 'marketing', gruppe: 'Analyse', schluessel: 'nav.marketing' },
  { ziel: 'bestand', gruppe: 'Analyse', schluessel: 'nav.bestand' },
  { ziel: 'lager', gruppe: 'Operativ', schluessel: 'nav.lager' },
  { ziel: 'produktion', gruppe: 'Operativ', schluessel: 'nav.produktion' },
  { ziel: 'wms', gruppe: 'Operativ', schluessel: 'nav.wms' },
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
  { ziel: 'lernpfad', gruppe: 'Steuerung', schluessel: 'nav.lernpfad' },
  { ziel: 'doku', gruppe: 'Steuerung', schluessel: 'nav.doku' }
]

const norm = (s) => String(s || '').toLowerCase().trim()

/**
 * Baut den Suchindex aus Navigationszielen und KPIs.
 * @param {(k:string)=>string} t  i18n-Funktion (Label-Übersetzung)
 * @param {Record<string,{id,name,einheit?}>} kpis  KPI-Registry (KPI)
 */
export function baueIndex(t = (k) => k, kpis = {}) {
  const nav = NAV_ZIELE.map((z) => ({
    typ: 'bericht', ziel: z.ziel, gruppe: z.gruppe, label: t(z.schluessel)
  }))
  const kpi = Object.values(kpis).map((k) => ({
    typ: 'kpi', ziel: k.id, gruppe: 'KPI', label: k.name, sub: k.einheit || null
  }))
  return [...nav, ...kpi]
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
