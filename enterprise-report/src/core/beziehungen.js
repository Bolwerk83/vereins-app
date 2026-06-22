// =========================================================================
//  BEZIEHUNGEN / STERNSCHEMA — Joins zwischen Faktentabellen und Dimensionen.
//  Tabular-Baustein: jede Fact-Zeile bekommt über Fremdschlüssel Kontext aus
//  den Dimensionen. Empfohlene Joins werden aus Spaltennamen (…ID/KontoNr)
//  abgeleitet; der Admin kann sie pflegen. Modell-Health prüft Vollständigkeit.
// =========================================================================
import { QUELLEN } from './datenmodell.js'

const FACTS = QUELLEN.filter((q) => q.typ === 'fact')
const DIMS = QUELLEN.filter((q) => q.typ === 'dim')
export const factListe = () => FACTS
export const dimListe = () => DIMS
// Schlüssel einer Dimension = erste Spalte (PeriodenID, ArtikelID, …, KontoNr).
export const dimKey = (dimId) => (QUELLEN.find((q) => q.id === dimId)?.spalten[0]) || null

/** Empfohlene Joins: Fact-Spalte = Dim-Schlüssel ⇒ Beziehung vorschlagen. */
export function empfohleneJoins() {
  const out = []
  for (const f of FACTS) {
    for (const d of DIMS) {
      const k = dimKey(d.id)
      if (k && f.spalten.includes(k)) out.push({ id: f.id + '|' + d.id, fact: f.id, dim: d.id, factKey: k, dimKey: k })
    }
  }
  return out
}

const KEY = 'er_beziehungen'
function seed() { return empfohleneJoins().map((j) => ({ ...j, aktiv: true })) }
export function ladeBeziehungen() {
  try { const raw = localStorage.getItem(KEY); return raw == null ? seed() : JSON.parse(raw) } catch { return seed() }
}
function speichere(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); return arr }
export const beziehung = (fact, dim) => ladeBeziehungen().find((b) => b.fact === fact && b.dim === dim) || null

/** Beziehung an-/abschalten (legt sie mit Vorschlagsschlüsseln an, falls neu). */
export function toggleBeziehung(fact, dim) {
  const arr = ladeBeziehungen(); const i = arr.findIndex((b) => b.fact === fact && b.dim === dim)
  if (i >= 0) { arr[i] = { ...arr[i], aktiv: !arr[i].aktiv } }
  else {
    const k = dimKey(dim); const f = FACTS.find((x) => x.id === fact)
    const factKey = f.spalten.includes(k) ? k : (f.spalten[0] || k)
    arr.push({ id: fact + '|' + dim, fact, dim, factKey, dimKey: k, aktiv: true })
  }
  return speichere(arr)
}
export function setzeKeys(fact, dim, factKey, dimKeyVal) {
  return speichere(ladeBeziehungen().map((b) => b.fact === fact && b.dim === dim ? { ...b, factKey, dimKey: dimKeyVal } : b))
}
export function loescheBeziehung(fact, dim) {
  return speichere(ladeBeziehungen().filter((b) => !(b.fact === fact && b.dim === dim)))
}
export function setzeZurueck() { localStorage.removeItem(KEY); return ladeBeziehungen() }

/** Modell-Health: je Fact verbundene/empfohlene Dimensionen + Gesamtstatus. */
export function modellHealth() {
  const aktiv = ladeBeziehungen().filter((b) => b.aktiv)
  const empfohlen = empfohleneJoins()
  const facts = FACTS.map((f) => {
    const verbunden = aktiv.filter((b) => b.fact === f.id).map((b) => b.dim)
    const soll = empfohlen.filter((j) => j.fact === f.id).map((j) => j.dim)
    const fehlend = soll.filter((d) => !verbunden.includes(d))
    return { fact: f.id, verbunden, soll, fehlend, ok: fehlend.length === 0 && verbunden.length > 0 }
  })
  return { facts, ok: facts.every((f) => f.ok), aktivAnzahl: aktiv.length, empfohlenAnzahl: empfohlen.length }
}
