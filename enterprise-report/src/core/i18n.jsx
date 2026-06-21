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
    'nav.tree': 'Berichtsbaum', 'nav.bi': 'Self-Service BI', 'nav.qc': 'Querchecks', 'nav.abstimmung': 'Abstimmbrücken', 'nav.lebenszyklus': 'Produkt-Lebenszyklus', 'nav.auftrag': 'Auftrags-Lebenszyklus', 'nav.anlagen': 'Anlagen-Lebenszyklus', 'nav.lieferant': 'Lieferanten-Lebenszyklus', 'nav.marketing': 'Marketing & Analytics', 'nav.bestand': 'Bestands-Gängigkeit', 'nav.forderungen': 'Forderungs-Aging',
    'nav.massnahmen': 'Maßnahmen', 'nav.instrumente': 'Instrumente', 'nav.alerts': 'Alerts',
    'nav.wizard': 'Wizard', 'nav.katalog': 'Katalog', 'nav.designer': 'Designer', 'nav.controlling': 'Controlling-Struktur', 'nav.klrablauf': 'KLR-Ablauf (roter Faden)', 'nav.ablauf': 'Ablaufdiagramm', 'nav.klr': 'Kosten- & Leistungsrechnung', 'nav.einzelgemein': 'Einzel- & Gemeinkosten', 'nav.kostenstellen': 'Kostenstellenrechnung', 'nav.bab': 'Betriebsabrechnungsbogen', 'nav.profitcenter': 'Profitcenter-Ergebnis', 'nav.kalkulation': 'Kostenträger & Kalkulation', 'nav.ergebnis': 'Ergebnisrechnung (GuV)', 'nav.db': 'Deckungsbeitragsrechnung', 'nav.rechte': 'Rollen & Rechte', 'nav.lernpfad': 'Lernpfad', 'nav.onboarding': 'Onboarding', 'nav.hilfe': 'Hilfe / So funktioniert’s', 'nav.kennzahlen': 'Kennzahlen', 'nav.zeit': 'Zeit & Datenart', 'nav.vergleich': 'Versionsvergleich', 'nav.abweichung': 'Abweichungsanalyse', 'nav.verteiler': 'Verteiler', 'nav.abschluss': 'Abschluss & Versionen', 'nav.transport': 'Transport (dev/test/prod)',
    'lbl.role': 'Rolle', 'lbl.period': 'Periode', 'lbl.source': 'Quelle',
    'conn.ok': 'verbunden', 'conn.none': 'keine Verbindung', 'conn.mock': 'Mock-Daten'
  },
  en: {
    'nav.tree': 'Report tree', 'nav.bi': 'Self-service BI', 'nav.qc': 'Cross-checks', 'nav.abstimmung': 'Reconciliation', 'nav.lebenszyklus': 'Product lifecycle', 'nav.auftrag': 'Order-to-cash', 'nav.anlagen': 'Asset lifecycle', 'nav.lieferant': 'Supplier lifecycle', 'nav.marketing': 'Marketing & analytics', 'nav.bestand': 'Inventory turnover', 'nav.forderungen': 'Receivables aging',
    'nav.massnahmen': 'Measures', 'nav.instrumente': 'Instruments', 'nav.alerts': 'Alerts',
    'nav.wizard': 'Wizard', 'nav.katalog': 'Catalogue', 'nav.designer': 'Designer', 'nav.controlling': 'Controlling structure', 'nav.klrablauf': 'Cost accounting flow', 'nav.ablauf': 'Process diagram', 'nav.klr': 'Cost & activity accounting', 'nav.einzelgemein': 'Direct & overhead costs', 'nav.kostenstellen': 'Cost centre accounting', 'nav.bab': 'Cost allocation sheet', 'nav.profitcenter': 'Profit-centre result', 'nav.kalkulation': 'Costing & product result', 'nav.ergebnis': 'Income statement (P&L)', 'nav.db': 'Contribution margin', 'nav.rechte': 'Roles & rights', 'nav.lernpfad': 'Learning path', 'nav.onboarding': 'Onboarding', 'nav.hilfe': 'Help / How it works', 'nav.kennzahlen': 'Metrics', 'nav.zeit': 'Time & data type', 'nav.vergleich': 'Version comparison', 'nav.abweichung': 'Variance analysis', 'nav.verteiler': 'Distribution', 'nav.abschluss': 'Close & versions', 'nav.transport': 'Transport (dev/test/prod)',
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
