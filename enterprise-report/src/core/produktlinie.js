// =========================================================================
//  PRODUKTLINIE / NACHFOLGER-VERKETTUNG
//
//  Problem: Bei einem Modellwechsel bekommt das Nachfolgemodell eine NEUE
//  Artikelnummer. Ohne Verkettung rutscht der Alt-Artikel in „Rückgang" und
//  der Neue erscheint als frische „Einführung" — obwohl es dieselbe
//  Produktlinie ist. Das verfälscht den Lebenszyklus.
//
//  Lösung: Vorgänger → Nachfolger einmalig zuordnen und DAUERHAFT validieren
//  (persistent, mit Wer/Wann). Validierte Matches werden zu einer Produkt-
//  linie zusammengefasst: Umsatz aller Generationen summiert, Lebenszyklus-
//  Position folgt dem aktuellen (neuesten) Artikel. So bleibt die Linie über
//  Modellwechsel hinweg durchgängig sichtbar.
//
//  Kandidaten kommen aus dem Stammdaten-Feld `vorgaenger` (z. B. WaWi-Feld
//  „Nachfolgeartikel"); validiert wird hier (LocalStorage, später MSSQL).
// =========================================================================
import { produkte } from './lebenszyklus.js'

const KEY = 'er_artikel_matches'

/** Alle Artikel der untersten Ebene (mit Phase). */
function artikel() { return produkte('artikel') }

/** Aus den Stammdaten bekannte Nachfolge-Kandidaten {vorgaenger, nachfolger}. */
export function kandidaten() {
  const ids = new Set(artikel().map((a) => a.id))
  return artikel().filter((a) => a.vorgaenger && ids.has(a.vorgaenger))
    .map((a) => ({ vorgaenger: a.vorgaenger, nachfolger: a.id }))
}

function mk(vorgaenger, nachfolger, von, am) {
  return { id: vorgaenger + '>' + nachfolger, vorgaenger, nachfolger, validiert: true,
    von: von || 'Controller', am: am || new Date().toISOString().slice(0, 10) }
}

// Demo: der erste Kandidat ist bereits validiert, damit die Wirkung sichtbar
// ist; weitere Kandidaten bleiben als Vorschlag offen.
function standardMatches() {
  const k = kandidaten()
  return k.length ? [mk(k[0].vorgaenger, k[0].nachfolger, 'Controller (Demo)', '2026-06-01')] : []
}

export function ladeMatches() {
  try { const raw = localStorage.getItem(KEY); return raw == null ? standardMatches() : JSON.parse(raw) }
  catch { return standardMatches() }
}
function speichere(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); return arr }

/** Match bestätigen/validieren (idempotent). */
export function bestaetigeMatch({ vorgaenger, nachfolger, von }) {
  const arr = ladeMatches().filter((m) => !(m.vorgaenger === vorgaenger && m.nachfolger === nachfolger))
  arr.push(mk(vorgaenger, nachfolger, von))
  return speichere(arr)
}
/** Validierung aufheben. */
export function loeseMatch(id) { return speichere(ladeMatches().filter((m) => m.id !== id)) }

/** Noch offene (nicht validierte) Nachfolge-Vorschläge. */
export function offeneVorschlaege() {
  const aktiv = new Set(ladeMatches().map((m) => m.vorgaenger + '>' + m.nachfolger))
  const byId = Object.fromEntries(artikel().map((a) => [a.id, a]))
  return kandidaten().filter((k) => !aktiv.has(k.vorgaenger + '>' + k.nachfolger))
    .map((k) => ({ ...k, vName: byId[k.vorgaenger]?.name, nName: byId[k.nachfolger]?.name }))
}

function baueLinie(kette) {
  const aktuell = kette[kette.length - 1] // neueste Generation
  const umsatz = +kette.reduce((n, x) => n + x.umsatz, 0).toFixed(1)
  return {
    id: 'linie-' + kette[0].id,
    name: aktuell.name,
    kombiniert: kette.length > 1,
    members: kette,            // alt → neu
    aktuell,
    umsatz,                    // Umsatz aller Generationen
    db: aktuell.db,            // Lebenszyklus-Position folgt dem aktuellen Artikel
    wachstum: aktuell.wachstum,
    dbTrend: aktuell.dbTrend,
    phase: aktuell.phase,
    parent: aktuell.parent,
    gruppe: aktuell.gruppe
  }
}

/** Artikel zu Produktlinien falten: validierte Vorgänger→Nachfolger-Ketten
 *  werden zusammengefasst, alle übrigen Artikel bleiben als Einzel-Linie. */
export function produktLinien(matches = ladeMatches()) {
  const arts = artikel()
  const byId = Object.fromEntries(arts.map((a) => [a.id, a]))
  const nachfolgerVon = {}, hatVorgaenger = {}
  for (const m of matches) {
    if (byId[m.vorgaenger] && byId[m.nachfolger]) { nachfolgerVon[m.vorgaenger] = m.nachfolger; hatVorgaenger[m.nachfolger] = true }
  }
  const linien = []
  for (const a of arts) {
    if (hatVorgaenger[a.id]) continue // nur Kettenanfänge starten eine Linie
    const kette = [a]; let cur = a.id; const guard = new Set([cur])
    while (nachfolgerVon[cur] && !guard.has(nachfolgerVon[cur])) {
      const nx = byId[nachfolgerVon[cur]]; kette.push(nx); cur = nx.id; guard.add(cur)
    }
    linien.push(baueLinie(kette))
  }
  return linien
}

/** Objektliste für die Grafik: Produktlinien als Pseudo-Artikel (kombiniert),
 *  Form kompatibel zu produkte('artikel'). */
export function mitLinien(matches = ladeMatches()) { return produktLinien(matches) }
