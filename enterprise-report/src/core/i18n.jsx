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
    'nav.tree': 'Berichtsbaum', 'nav.bi': 'Self-Service BI', 'nav.qc': 'Querchecks',
    'nav.massnahmen': 'Maßnahmen', 'nav.instrumente': 'Instrumente', 'nav.alerts': 'Alerts',
    'nav.wizard': 'Wizard', 'nav.katalog': 'Katalog', 'nav.designer': 'Designer', 'nav.rechte': 'Rollen & Rechte', 'nav.hilfe': 'Hilfe / So funktioniert’s', 'nav.kennzahlen': 'Kennzahlen', 'nav.zeit': 'Zeit & Datenart', 'nav.vergleich': 'Versionsvergleich', 'nav.verteiler': 'Verteiler', 'nav.abschluss': 'Abschluss & Versionen', 'nav.transport': 'Transport (dev/test/prod)',
    'lbl.role': 'Rolle', 'lbl.period': 'Periode', 'lbl.source': 'Quelle',
    'conn.ok': 'verbunden', 'conn.none': 'keine Verbindung', 'conn.mock': 'Mock-Daten'
  },
  en: {
    'nav.tree': 'Report tree', 'nav.bi': 'Self-service BI', 'nav.qc': 'Cross-checks',
    'nav.massnahmen': 'Measures', 'nav.instrumente': 'Instruments', 'nav.alerts': 'Alerts',
    'nav.wizard': 'Wizard', 'nav.katalog': 'Catalogue', 'nav.designer': 'Designer', 'nav.rechte': 'Roles & rights', 'nav.hilfe': 'Help / How it works', 'nav.kennzahlen': 'Metrics', 'nav.zeit': 'Time & data type', 'nav.vergleich': 'Version comparison', 'nav.verteiler': 'Distribution', 'nav.abschluss': 'Close & versions', 'nav.transport': 'Transport (dev/test/prod)',
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
