// =========================================================================
//  TRANSPORTWESEN — ausgewählte Berichte/Artefakte als Bundle zwischen den
//  Instanzen (dev → test → prod) bewegen.
//
//  Ein Transportauftrag bündelt die GEWÄHLTEN Artefakte vier Typen:
//    berichte  : selbst gebaute Management-Reports (er_designer_reports)
//    kpidefs   : KPI-Definitionen (Snapshot aus der Registry -> Overrides)
//    layouts   : Spalten-Layouts (er_tabellenlayout)
//    verteiler : Versand-Definitionen (er_verteiler)
//
//  Erzeugen (Quellinstanz) -> Backend committet/pusht (core: /api/transport)
//  Anwenden (Zielinstanz)  -> bundleAnwenden() schreibt in die lokalen Stores.
// =========================================================================
import { ladeReports, saveReport } from './designer.js'
import { KPI } from './kpiRegistry.js'

const lese = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || fallback) } catch { return JSON.parse(fallback) } }
const schreibe = (key, val) => localStorage.setItem(key, JSON.stringify(val))

// KPI-Felder, die transportierbar sind (Funktionen wie berechne() nicht).
const KPI_FELDER = ['name', 'einheit', 'bereich', 'ziel', 'richtung', 'beschreibung', 'sqlRef']

export const ARTEFAKT_TYPEN = [
  {
    id: 'berichte', name: 'Berichte / Katalog', icon: '🌳',
    liste: () => ladeReports().map((r) => ({ id: r.id, name: r.titel })),
    exportiere: (ids) => ladeReports().filter((r) => ids.includes(r.id)),
    importiere: (arr) => (arr || []).forEach(saveReport)
  },
  {
    id: 'kpidefs', name: 'KPI-Definitionen', icon: '📖',
    liste: () => Object.values(KPI).map((k) => ({ id: k.id, name: k.name })),
    exportiere: (ids) => ids.reduce((acc, id) => {
      const k = KPI[id]; if (!k) return acc
      acc[id] = Object.fromEntries(KPI_FELDER.filter((f) => k[f] !== undefined).map((f) => [f, k[f]]))
      return acc
    }, {}),
    importiere: (obj) => {
      const ov = lese('er_kpi_overrides', '{}')
      schreibe('er_kpi_overrides', { ...ov, ...(obj || {}) })
    }
  },
  {
    id: 'layouts', name: 'Spalten-Layouts', icon: '🧱',
    liste: () => Object.keys(lese('er_tabellenlayout', '{}')).map((k) => ({ id: k, name: k })),
    exportiere: (ids) => { const all = lese('er_tabellenlayout', '{}'); return Object.fromEntries(ids.map((k) => [k, all[k]])) },
    importiere: (obj) => schreibe('er_tabellenlayout', { ...lese('er_tabellenlayout', '{}'), ...(obj || {}) })
  },
  {
    id: 'verteiler', name: 'Verteiler', icon: '📤',
    liste: () => lese('er_verteiler', '[]').map((v) => ({ id: v.id, name: v.name })),
    exportiere: (ids) => lese('er_verteiler', '[]').filter((v) => ids.includes(v.id)),
    importiere: (arr) => {
      const vorhanden = lese('er_verteiler', '[]')
      const nachId = new Map(vorhanden.map((v) => [v.id, v]))
      ;(arr || []).forEach((v) => nachId.set(v.id, v))   // gleiche ID = ersetzen
      schreibe('er_verteiler', [...nachId.values()])
    }
  }
]
export const typInfo = (id) => ARTEFAKT_TYPEN.find((t) => t.id === id)

/** Bundle aus der Auswahl bauen. auswahl = { typId: [artefaktIds] }. */
export function bundleErstellen(auswahl, meta) {
  const artefakte = {}
  let anzahl = 0
  for (const typ of ARTEFAKT_TYPEN) {
    const ids = auswahl[typ.id] || []
    if (!ids.length) continue
    artefakte[typ.id] = typ.exportiere(ids)
    anzahl += ids.length
  }
  return {
    id: 'TR-' + Date.now().toString(36).toUpperCase(),
    von: meta.von, nach: meta.nach, modus: meta.modus,
    autor: meta.autor || 'unbekannt', erstellt: new Date().toISOString(),
    anzahl, artefakte
  }
}

/** Bundle auf der Zielinstanz anwenden (in die lokalen Stores schreiben). */
export function bundleAnwenden(bundle) {
  const bericht = []
  for (const typ of ARTEFAKT_TYPEN) {
    const data = bundle?.artefakte?.[typ.id]
    if (data == null) continue
    typ.importiere(data)
    const n = Array.isArray(data) ? data.length : Object.keys(data).length
    bericht.push(`${typ.name}: ${n}`)
  }
  return bericht
}

/** Bundle als Datei herunterladen (manueller Transportweg). */
export function bundleDownload(bundle) {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = `${bundle.id}.json`; a.click()
  URL.revokeObjectURL(a.href)
}
