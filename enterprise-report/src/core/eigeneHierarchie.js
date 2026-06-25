// =========================================================================
//  EIGENE HIERARCHIEN — der Nutzer stellt im Designer aus vorhandenen
//  Dimensionen eine beliebige Hierarchie zusammen (z. B. Region → Funktion →
//  Kostenstellengruppe) und erhält einen aggregierenden Drill-Baum.
//  Datenbasis: die Kostenstellen (mehrdimensional: Geschäftsbereich, Region,
//  Funktion, Gruppe; Maße Erlös/Kosten/Ergebnis).
// =========================================================================
import { kostenstellen, pcInfo } from './pcKostenstellen.js'

const LAND = { DE: 'Deutschland', CH: 'Schweiz', AT: 'Österreich', NL: 'Niederlande', zentral: 'Zentral' }
const FUNKT = { beschaffung: 'Beschaffung', produktion: 'Produktion', logistik: 'Logistik', vertrieb: 'Vertrieb', marketing: 'Marketing', verwaltung: 'Verwaltung' }

// Wählbare Dimensionen (Ebenen) für eigene Hierarchien.
export const DIMENSIONEN = [
  { id: 'pc', name: 'Geschäftsbereich', wert: (r) => pcInfo(r.pc)?.name || r.pc },
  { id: 'land', name: 'Region / Land', wert: (r) => LAND[r.land] || r.land },
  { id: 'funktion', name: 'Funktion', wert: (r) => FUNKT[r.funktion] || r.funktion },
  { id: 'gruppe', name: 'Kostenstellengruppe', wert: (r) => r.gruppe },
  { id: 'name', name: 'Kostenstelle', wert: (r) => r.name },
]
export const dimInfo = (id) => DIMENSIONEN.find((d) => d.id === id)

export const MASSE = [
  { id: 'ergebnis', name: 'Ergebnis' }, { id: 'erloes', name: 'Erlös' }, { id: 'kosten', name: 'Kosten' },
]

const r2 = (x) => Math.round(x * 100) / 100

/**
 * Baut einen aggregierenden Baum entlang der gewählten Dimensionsreihenfolge.
 * @param dimIds  geordnete Liste von Dimensions-Ids (= Ebenen)
 * @param mass    'ergebnis' | 'erloes' | 'kosten' (Sortier-/Anzeigemaß)
 */
export function baueEigeneHierarchie(dimIds = [], mass = 'ergebnis') {
  const rows = kostenstellen().map((r) => ({ ...r, ergebnis: r.erloes - r.kosten }))
  const dims = dimIds.map(dimInfo).filter(Boolean)
  let _id = 0
  const root = { id: 'root', name: 'Gesamt', ebene: 0, erloes: 0, kosten: 0, ergebnis: 0, kinder: [], _idx: {} }
  const add = (n, r) => { n.erloes += r.erloes; n.kosten += r.kosten; n.ergebnis += r.ergebnis }
  for (const r of rows) {
    add(root, r)
    let knoten = root
    dims.forEach((d, i) => {
      const name = d.wert(r) || '—'
      if (!knoten._idx[name]) {
        const neu = { id: `n${_id++}`, name, ebene: i + 1, ebeneName: d.name, erloes: 0, kosten: 0, ergebnis: 0, kinder: [], _idx: {} }
        knoten._idx[name] = neu; knoten.kinder.push(neu)
      }
      knoten = knoten._idx[name]
      add(knoten, r)
    })
  }
  const putze = (n) => {
    delete n._idx
    n.erloes = r2(n.erloes); n.kosten = r2(n.kosten); n.ergebnis = r2(n.ergebnis)
    n.marge = n.erloes > 0 ? n.ergebnis / n.erloes : null
    n.kinder.sort((a, b) => Math.abs(b[mass]) - Math.abs(a[mass]))
    n.kinder.forEach(putze)
    return n
  }
  return putze(root)
}

/** Sichtbare Zeilen je geöffneten Knoten (für die Drill-Darstellung). */
export function sichtbareZeilen(root, offen) {
  const out = []
  const lauf = (n, tiefe) => {
    out.push({ id: n.id, name: n.name, ebene: n.ebene, ebeneName: n.ebeneName, erloes: n.erloes, kosten: n.kosten, ergebnis: n.ergebnis, marge: n.marge, tiefe, hatKinder: n.kinder.length > 0, offen: offen.has(n.id) })
    if (offen.has(n.id)) n.kinder.forEach((c) => lauf(c, tiefe + 1))
  }
  root.kinder.forEach((c) => lauf(c, 0))
  return out
}
export function alleIds(root) { const ids = []; const lauf = (n) => { if (n.kinder.length) { ids.push(n.id); n.kinder.forEach(lauf) } }; lauf(root); return ids }

// --- Persistenz benannter Hierarchien (für Wiederverwendung) --------------
const KEY = 'er_eigene_hierarchien'
export function ladeHierarchien() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
function speichere(a) { try { localStorage.setItem(KEY, JSON.stringify(a)) } catch {} ; return a }
export function saveHierarchie(h) {
  const a = ladeHierarchien(); const i = a.findIndex((x) => x.id === h.id)
  if (i >= 0) a[i] = h; else a.unshift(h)
  return speichere(a)
}
export function removeHierarchie(id) { return speichere(ladeHierarchien().filter((x) => x.id !== id)) }
