// =========================================================================
//  DATA-PROVIDER — die EINE Naht zwischen UI und Datenquelle.
//
//  Heute:  'mock'  -> liefert Werte aus src/data/mock.js
//  Später: 'mssql' -> ruft das Backend (server/) auf, das die SQL-Dateien
//                     aus sql/<kpiRef>.kpi.sql gegen den MSSQL-Server ausführt.
//
//  Die UI/Module kennen NUR dieses Interface — Umstellung auf MSSQL ist
//  ein Einzeiler (QUELLE = 'mssql'), kein Umbau der Module.
// =========================================================================
import { MOCK } from '../data/mock.js'
import { berechneAlle } from './kpiRegistry.js'

export const QUELLE = import.meta.env?.VITE_DATA_SOURCE || 'mock'

// =========================================================================
//  CLIENT-CACHE — Ladezeit-Optimierung. Identische Abfragen (gleicher
//  Schlüssel) werden nicht erneut geholt. Schlüssel berücksichtigt Periode,
//  Datumssicht und Granularität, damit Umschalten korrekt nachlädt.
//  cacheKontext() wird von der App gesetzt (aus dem Periodenmodell).
// =========================================================================
const _cache = new Map()
let _kontext = ''   // z. B. "belegdatum|monat"
export function setCacheKontext(s) { if (s !== _kontext) { _kontext = s; _cache.clear() } }
export function leereCache() { _cache.clear() }
async function memo(schluessel, fn) {
  const k = `${_kontext}::${schluessel}`
  if (_cache.has(k)) return _cache.get(k)
  const wert = await fn()
  _cache.set(k, wert)
  return wert
}

/** Rohe (gemessene) KPI-Werte für eine Periode holen. */
async function holeRoheWerte(periode) {
  if (QUELLE === 'mssql') {
    // Vertrag mit dem Backend (server/index.js):
    const r = await fetch(`/api/kpi?periode=${encodeURIComponent(periode)}`)
    if (!r.ok) throw new Error('MSSQL-Backend nicht erreichbar')
    return r.json()
  }
  return MOCK.roheWerte[periode] ?? MOCK.roheWerte[MOCK.aktuellePeriode]
}

/** Alle (rohe + abgeleitete) KPI-Werte einer Periode. */
export async function ladeKpiWerte(periode = MOCK.aktuellePeriode) {
  return memo(`kpi:${periode}`, async () => berechneAlle(await holeRoheWerte(periode)))
}

/** Historie (Zeitreihe) einer KPI über alle Perioden — Ebene 5. */
export async function ladeHistorie(kpiId) {
  return memo(`hist:${kpiId}`, async () => {
    if (QUELLE === 'mssql') {
      const r = await fetch(`/api/kpi/${encodeURIComponent(kpiId)}/historie`)
      if (!r.ok) throw new Error('MSSQL-Backend nicht erreichbar')
      return r.json()
    }
    return MOCK.perioden.map((p) => {
      const werte = berechneAlle(MOCK.roheWerte[p])
      return { periode: p, wert: werte[kpiId] ?? null }
    })
  })
}

/** Detail-Perspektive (Ebene-4-Sprungpunkt), key = <bereich>_<objekt>. */
export async function ladePerspektive(key) {
  return memo(`persp:${key}`, async () => {
    if (QUELLE === 'mssql') {
      const r = await fetch(`/api/perspektive/${encodeURIComponent(key)}`)
      if (!r.ok) throw new Error('MSSQL-Backend nicht erreichbar')
      return r.json()
    }
    return MOCK.perspektiven?.[key] ?? null
  })
}

/** Detail-Datensatz (Tabelle) für einen E4-Knoten. */
export async function ladeDetail(detailKey) {
  return memo(`detail:${detailKey}`, async () => {
    if (QUELLE === 'mssql') {
      const r = await fetch(`/api/detail/${encodeURIComponent(detailKey)}`)
      if (!r.ok) throw new Error('MSSQL-Backend nicht erreichbar')
      return r.json()
    }
    return MOCK.details[detailKey] ?? null
  })
}

/** Verbindungsstatus des Backends (nur relevant bei QUELLE='mssql'). */
export async function pruefeVerbindung() {
  if (QUELLE !== 'mssql') return { status: 'mock' }
  try {
    const r = await fetch('/api/health')
    const j = await r.json()
    return r.ok ? { status: 'ok', ...j } : { status: 'fehler', ...j }
  } catch (e) {
    return { status: 'fehler', fehler: String(e) }
  }
}

export const PERIODEN = MOCK.perioden
export const AKTUELLE_PERIODE = MOCK.aktuellePeriode
