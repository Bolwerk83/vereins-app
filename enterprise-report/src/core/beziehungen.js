// =========================================================================
//  BEZIEHUNGEN / STERNSCHEMA — Joins zwischen Faktentabellen und Dimensionen.
//  Tabular-Baustein: jede Fact-Zeile bekommt über Fremdschlüssel Kontext aus
//  den Dimensionen. Empfohlene Joins werden aus Spaltennamen (…ID/KontoNr)
//  abgeleitet; der Admin kann sie pflegen. Modell-Health prüft Vollständigkeit.
// =========================================================================
import { QUELLEN } from './datenmodell.js'

const FACTS = QUELLEN.filter((q) => q.typ === 'fact')
const DIMS = QUELLEN.filter((q) => q.typ === 'dim')
// Primär-Dimensionen (direkt am Fact) vs. Outrigger (Snowflake-Unter-Dim).
const DIMS_PRIMAER = DIMS.filter((q) => q.rolle !== 'outrigger')
const DIMS_OUTRIGGER = DIMS.filter((q) => q.rolle === 'outrigger')
export const factListe = () => FACTS
export const dimListe = () => DIMS_PRIMAER       // Stern-Matrix: nur Primär-Dim
export const outriggerListe = () => DIMS_OUTRIGGER
// Schlüssel einer Dimension = erste Spalte (PeriodenID, ArtikelID, …, KontoNr).
export const dimKey = (dimId) => (QUELLEN.find((q) => q.id === dimId)?.spalten[0]) || null

/** Empfohlene Joins (Stern): Fact-Spalte = Dim-Schlüssel ⇒ Beziehung. */
export function empfohleneJoins() {
  const out = []
  for (const f of FACTS) {
    for (const d of DIMS_PRIMAER) {
      const k = dimKey(d.id)
      if (k && f.spalten.includes(k)) out.push({ id: f.id + '|' + d.id, fact: f.id, dim: d.id, factKey: k, dimKey: k })
    }
  }
  return out
}

/** Empfohlene Snowflake-Joins (Dim → Dim): Dim-Spalte = Schlüssel einer
 *  anderen Dimension ⇒ Verzweigung (z. B. DimArtikel → DimProduktgruppe). */
export function empfohleneSnowflake() {
  const out = []
  for (const c of DIMS) {
    for (const p of DIMS) {
      if (c.id === p.id) continue
      const k = dimKey(p.id)
      if (k && c.spalten.includes(k) && dimKey(c.id) !== k) out.push({ id: c.id + '>' + p.id, child: c.id, parent: p.id, key: k })
    }
  }
  return out
}

const KEY_SF = 'er_snowflake'
function seedSf() { return empfohleneSnowflake().map((j) => ({ ...j, aktiv: true })) }
export function ladeSnowflake() {
  try { const raw = localStorage.getItem(KEY_SF); return raw == null ? seedSf() : JSON.parse(raw) } catch { return seedSf() }
}
export const snowflakeVon = (child, parent) => ladeSnowflake().find((b) => b.child === child && b.parent === parent) || null
export function toggleSnowflake(child, parent) {
  const arr = ladeSnowflake(); const i = arr.findIndex((b) => b.child === child && b.parent === parent)
  if (i >= 0) arr[i] = { ...arr[i], aktiv: !arr[i].aktiv }
  else arr.push({ id: child + '>' + parent, child, parent, key: dimKey(parent), aktiv: true })
  localStorage.setItem(KEY_SF, JSON.stringify(arr)); return arr
}
/** Snowflake-Ketten (Pfade) aus den aktiven Verzweigungen, z. B.
 *  DimArtikel → DimProduktgruppe → DimWarenbereich. */
export function snowflakeKetten() {
  const aktiv = ladeSnowflake().filter((b) => b.aktiv)
  const next = (id) => aktiv.filter((b) => b.child === id).map((b) => b.parent)
  const kinder = new Set(aktiv.map((b) => b.child))
  // Startknoten = Child, das selbst nicht Parent von etwas ist
  const starts = [...kinder].filter((id) => !aktiv.some((b) => b.parent === id))
  const ketten = []
  for (const s of starts) {
    let pfad = [s], cur = s, guard = 0
    while (next(cur).length && guard++ < 8) { cur = next(cur)[0]; pfad.push(cur) }
    if (pfad.length > 1) ketten.push(pfad)
  }
  return ketten
}
/** Modelltyp aus dem aktuellen Modell ableiten. */
export function schemaTyp() {
  return ladeSnowflake().some((b) => b.aktiv) ? 'snowflake' : 'star'
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
