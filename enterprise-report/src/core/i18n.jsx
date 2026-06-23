// =========================================================================
//  i18n — leichte Mehrsprachigkeit (DE/EN) für die App-Bedienoberfläche.
//  Erweiterbar: weitere Schlüssel/Module ergänzen; Fachinhalte (KPI-Namen)
//  können später über name_en in der Registry folgen.
// =========================================================================
import React, { createContext, useContext, useState, useCallback } from 'react'

const KEY = 'er_lang'
export const SPRACHEN = [{ id: 'de', label: 'DE' }, { id: 'en', label: 'EN' }]

const DICT = {
  de: {
    'nav.tree': 'Berichtsbaum', 'nav.bi': 'Self-Service BI', 'nav.qc': 'Querchecks', 'nav.abstimmung': 'Abstimmbrücken', 'nav.lebenszyklus': 'Produkt-Lebenszyklus', 'nav.auftrag': 'Auftrags-Lebenszyklus', 'nav.anlagen': 'Anlagen-Lebenszyklus', 'nav.lieferant': 'Lieferanten-Lebenszyklus', 'nav.marketing': 'Marketing & Analytics', 'nav.marketingkarte': 'Marketing-Landkarten', 'nav.google': 'Google-Reporting', 'nav.gutschriften': 'Gutschriften & Retouren', 'nav.vertriebkpi': 'Vertriebskennzahlen', 'nav.prozesskette': 'Prozesskette AE → Umsatz', 'nav.portfoliobcg': 'Portfolio-Matrix (BCG)', 'nav.versand': 'Versand-Cockpit', 'nav.bestand': 'Bestands-Gängigkeit', 'nav.forderungen': 'Forderungs-Aging', 'nav.mitarbeiter': 'Mitarbeiter-Lebenszyklus',
    'nav.massnahmen': 'Maßnahmen', 'nav.instrumente': 'Instrumente', 'nav.alerts': 'Alerts',
    'nav.wizard': 'Wizard', 'nav.katalog': 'Katalog', 'nav.designer': 'Designer', 'nav.controlling': 'Controlling-Struktur', 'nav.klrablauf': 'KLR-Ablauf (roter Faden)', 'nav.ablauf': 'Ablaufdiagramm', 'nav.klr': 'Kosten- & Leistungsrechnung', 'nav.einzelgemein': 'Einzel- & Gemeinkosten', 'nav.kostenstellen': 'Kostenstellenrechnung', 'nav.bab': 'Betriebsabrechnungsbogen', 'nav.profitcenter': 'Profitcenter-Ergebnis', 'nav.pckostenstellen': 'Profit-Center → Kostenstellen', 'nav.kontenstrukturen': 'Sachkonto-Strukturen', 'nav.leasing': 'Leasing-Cockpit', 'nav.finanzcockpit': 'Finanz- & Risiko-Cockpit', 'nav.kalkulation': 'Kostenträger & Kalkulation', 'nav.ergebnis': 'Ergebnisrechnung (GuV)', 'nav.db': 'Deckungsbeitragsrechnung', 'nav.rechte': 'Rollen & Rechte', 'nav.lernpfad': 'Lernpfad', 'nav.onboarding': 'Onboarding', 'nav.hilfe': 'Hilfe / So funktioniert’s', 'nav.kennzahlen': 'Kennzahlen', 'nav.tagesreporting': 'Tagesreporting', 'nav.quartalsbericht': 'Quartalsbericht', 'nav.kalkulatorik': 'Kalkulatorische Kosten', 'nav.zeit': 'Zeit & Datenart', 'nav.vergleich': 'Versionsvergleich', 'nav.segment': 'Segment- & Konzernbericht', 'nav.abweichung': 'Abweichungsanalyse', 'nav.abgleichabsatz': 'Abgleich Absatz ↔ AET', 'nav.verteiler': 'Verteiler', 'nav.abschluss': 'Abschluss & Versionen', 'nav.transport': 'Transport (dev/test/prod)',
    'nav.admin': 'Admin-Bereich', 'nav.datenmodell': 'Datenmodell & Mapping', 'nav.datenschutz': 'Datenschutz & Sicherheit', 'nav.kisteuerung': 'KI-Steuerung', 'nav.kibuilder': 'KI-Report-Builder', 'nav.berichtlog': 'Bericht-Zugriffs-Log', 'nav.berichtfreigabe': 'Bericht-Freigabe', 'nav.events': 'Events & Aktionen', 'nav.doku': 'Wissen & Doku', 'nav.datenquellen': 'Datenquellen & Links', 'nav.technologie': 'Technologie & F&E', 'nav.abgrenzung': 'Abgrenzungsrechnung', 'nav.lzempfehlung': 'Lebenszyklus-Maßnahmen', 'nav.kpieditor': 'KPI-Editor (Formeln)', 'nav.nutzung': 'Nutzungs-Statistik', 'nav.lager': 'Lagerverwaltung', 'nav.bestandsentwicklung': 'Lagerbestandsentwicklung', 'nav.wms': 'WMS (operativ)', 'nav.produktion': 'Produktionscontrolling', 'nav.planung': 'Planung (Budget/Forecast)', 'nav.szenario': 'Szenario-Simulator', 'nav.detailberichte': 'Detailberichte',
    'suche.platzhalter': 'Berichte / KPI suchen …', 'suche.leer': 'Keine Treffer.',
    'lbl.role': 'Rolle', 'lbl.period': 'Periode', 'lbl.source': 'Quelle',
    'conn.ok': 'verbunden', 'conn.none': 'keine Verbindung', 'conn.mock': 'Mock-Daten'
  },
  en: {
    'nav.tree': 'Report tree', 'nav.bi': 'Self-service BI', 'nav.qc': 'Cross-checks', 'nav.abstimmung': 'Reconciliation', 'nav.lebenszyklus': 'Product lifecycle', 'nav.auftrag': 'Order-to-cash', 'nav.anlagen': 'Asset lifecycle', 'nav.lieferant': 'Supplier lifecycle', 'nav.marketing': 'Marketing & analytics', 'nav.marketingkarte': 'Marketing maps', 'nav.google': 'Google reporting', 'nav.gutschriften': 'Credit notes & returns', 'nav.vertriebkpi': 'Sales metrics', 'nav.prozesskette': 'Funnel order → revenue', 'nav.portfoliobcg': 'Portfolio matrix (BCG)', 'nav.versand': 'Shipping cockpit', 'nav.bestand': 'Inventory turnover', 'nav.forderungen': 'Receivables aging', 'nav.mitarbeiter': 'Employee lifecycle',
    'nav.massnahmen': 'Measures', 'nav.instrumente': 'Instruments', 'nav.alerts': 'Alerts',
    'nav.wizard': 'Wizard', 'nav.katalog': 'Catalogue', 'nav.designer': 'Designer', 'nav.controlling': 'Controlling structure', 'nav.klrablauf': 'Cost accounting flow', 'nav.ablauf': 'Process diagram', 'nav.klr': 'Cost & activity accounting', 'nav.einzelgemein': 'Direct & overhead costs', 'nav.kostenstellen': 'Cost centre accounting', 'nav.bab': 'Cost allocation sheet', 'nav.profitcenter': 'Profit-centre result', 'nav.pckostenstellen': 'Profit centre → cost centres', 'nav.kontenstrukturen': 'GL account structures', 'nav.leasing': 'Leasing cockpit', 'nav.finanzcockpit': 'Financial & risk cockpit', 'nav.kalkulation': 'Costing & product result', 'nav.ergebnis': 'Income statement (P&L)', 'nav.db': 'Contribution margin', 'nav.rechte': 'Roles & rights', 'nav.lernpfad': 'Learning path', 'nav.onboarding': 'Onboarding', 'nav.hilfe': 'Help / How it works', 'nav.kennzahlen': 'Metrics', 'nav.tagesreporting': 'Daily reporting', 'nav.quartalsbericht': 'Quarterly report', 'nav.kalkulatorik': 'Imputed costs', 'nav.zeit': 'Time & data type', 'nav.vergleich': 'Version comparison', 'nav.segment': 'Segment & group report', 'nav.abweichung': 'Variance analysis', 'nav.abgleichabsatz': 'Sales vs. order intake', 'nav.verteiler': 'Distribution', 'nav.abschluss': 'Close & versions', 'nav.transport': 'Transport (dev/test/prod)',
    'nav.admin': 'Admin area', 'nav.datenmodell': 'Data model & mapping', 'nav.datenschutz': 'Data protection & security', 'nav.kisteuerung': 'AI control', 'nav.kibuilder': 'AI report builder', 'nav.berichtlog': 'Report access log', 'nav.berichtfreigabe': 'Report release', 'nav.events': 'Events & campaigns', 'nav.doku': 'Knowledge & docs', 'nav.datenquellen': 'Data sources & links', 'nav.technologie': 'Technology & R&D', 'nav.abgrenzung': 'Cost/expense reconciliation', 'nav.lzempfehlung': 'Lifecycle measures', 'nav.kpieditor': 'KPI editor (formulas)', 'nav.nutzung': 'Usage analytics', 'nav.lager': 'Warehouse (controlling)', 'nav.bestandsentwicklung': 'Inventory development', 'nav.wms': 'WMS (operations)', 'nav.produktion': 'Production controlling', 'nav.planung': 'Planning (budget/forecast)', 'nav.szenario': 'What-if simulator', 'nav.detailberichte': 'Detail reports',
    'suche.platzhalter': 'Search reports / KPIs …', 'suche.leer': 'No matches.',
    'lbl.role': 'Role', 'lbl.period': 'Period', 'lbl.source': 'Source',
    'conn.ok': 'connected', 'conn.none': 'no connection', 'conn.mock': 'mock data'
  }
}

const Ctx = createContext({ lang: 'de', t: (k, f) => f ?? k, setLang: () => {} })

export function SpracheProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem(KEY) || 'de')
  const setLang = useCallback((l) => { localStorage.setItem(KEY, l); setLangState(l) }, [])
  const t = useCallback((k, f) => (DICT[lang] && DICT[lang][k]) || DICT.de[k] || f || k, [lang])
  return <Ctx.Provider value={{ lang, t, setLang }}>{children}</Ctx.Provider>
}
export const useT = () => useContext(Ctx)
