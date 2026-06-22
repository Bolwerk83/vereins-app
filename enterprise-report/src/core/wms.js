// =========================================================================
//  WMS (operativ) — Lagerverwaltung im Tagesgeschäft: Lagerplätze, Bestand
//  je Platz, Wareneingang (Einlagern), Kommissionierung (Picken), Umlagern und
//  ein Bewegungsprotokoll. Buchungen verändern den Bestand und werden geloggt.
//  Persistenz in localStorage (er_wms); Stückmengen.
// =========================================================================
const KEY = 'er_wms'

// --- Lagerplätze: 3 Zonen × 3 Gänge × 3 Ebenen = 27 Plätze ----------------
export const ZONEN = [
  { z: 'A', name: 'Schnelldreher (vorne)', kapazitaet: 60 },
  { z: 'B', name: 'Reservelager', kapazitaet: 120 },
  { z: 'C', name: 'Sperr-/Auslauflager', kapazitaet: 200 }
]
export const PLAETZE = []
for (const zone of ZONEN) for (let g = 1; g <= 3; g++) for (let e = 1; e <= 3; e++)
  PLAETZE.push({ id: `${zone.z}-0${g}-${e}`, zone: zone.z, gang: g, ebene: e, kapazitaet: zone.kapazitaet })

export const platzInfo = (id) => PLAETZE.find((p) => p.id === id)
export const zoneInfo = (z) => ZONEN.find((x) => x.z === z)

// --- Artikel (SKU) --------------------------------------------------------
export const ARTIKEL = [
  { sku: 'EBIKE-500', name: 'E-Bike Urban 500' },
  { sku: 'AKKU-625', name: 'Akku 625Wh' },
  { sku: 'TEIL-M3', name: 'Antriebseinheit M3' },
  { sku: 'ZUB-HELM', name: 'Helm' },
  { sku: 'BEKL-JACK', name: 'Jacke' }
]
export const artikelName = (sku) => (ARTIKEL.find((a) => a.sku === sku) || {}).name || sku

const SEED_BESTAND = [
  { platz: 'A-01-1', sku: 'AKKU-625', menge: 40 },
  { platz: 'A-01-2', sku: 'ZUB-HELM', menge: 50 },
  { platz: 'A-02-1', sku: 'TEIL-M3', menge: 45 },
  { platz: 'A-03-1', sku: 'ZUB-HELM', menge: 25 },
  { platz: 'B-01-1', sku: 'EBIKE-500', menge: 22 },
  { platz: 'B-01-2', sku: 'EBIKE-500', menge: 30 },
  { platz: 'B-02-1', sku: 'AKKU-625', menge: 80 },
  { platz: 'C-01-1', sku: 'BEKL-JACK', menge: 120 }
]

function seed() {
  const store = { bestand: SEED_BESTAND.map((b) => ({ ...b })), bewegungen: [], seq: 1 }
  return speichere(store)
}
function ladeStore() {
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); return s && s.bestand ? s : seed() } catch { return seed() }
}
function speichere(s) { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch {} return s }
export function reset() { try { localStorage.removeItem(KEY) } catch {} return seed() }

const heute = () => new Date().toISOString().slice(0, 10)
function logBewegung(s, b) {
  s.bewegungen.unshift({ id: 'b' + (s.seq++), zeit: new Date().toISOString(), ...b })
  if (s.bewegungen.length > 500) s.bewegungen.length = 500
}

// --- Lesezugriffe ---------------------------------------------------------
export function bestand() { return ladeStore().bestand }
export function bewegungen() { return ladeStore().bewegungen }

/** Belegung je Platz: Gesamtmenge + Positionen. */
export function platzBelegung() {
  const b = bestand()
  return PLAETZE.map((p) => {
    const pos = b.filter((x) => x.platz === p.id)
    const menge = pos.reduce((n, x) => n + x.menge, 0)
    return { ...p, positionen: pos, menge, frei: p.kapazitaet - menge, auslastung: p.kapazitaet ? Math.round(menge / p.kapazitaet * 100) : 0 }
  })
}
export const freieKapazitaet = (platz) => {
  const p = platzInfo(platz); if (!p) return 0
  const belegt = bestand().filter((x) => x.platz === platz).reduce((n, x) => n + x.menge, 0)
  return p.kapazitaet - belegt
}

/** Bestand je Artikel: Gesamtmenge + auf welchen Plätzen. */
export function bestandJeArtikel() {
  const b = bestand()
  return ARTIKEL.map((a) => {
    const pos = b.filter((x) => x.sku === a.sku)
    return { ...a, menge: pos.reduce((n, x) => n + x.menge, 0), plaetze: pos.map((x) => ({ platz: x.platz, menge: x.menge })) }
  })
}

/** Pick-Vorschlag (FIFO/voller Platz zuerst) für eine Auslagerung. */
export function pickVorschlag(sku, menge) {
  const pos = bestand().filter((x) => x.sku === sku && x.menge > 0).sort((a, b) => b.menge - a.menge)
  const picks = []; let rest = menge
  for (const p of pos) { if (rest <= 0) break; const m = Math.min(rest, p.menge); picks.push({ platz: p.platz, menge: m }); rest -= m }
  return { picks, machbar: rest <= 0, fehlmenge: Math.max(0, rest) }
}

// --- Buchungen ------------------------------------------------------------
/** Wareneingang/Einlagern auf einen Platz. */
export function einlagern(sku, menge, platz, ref = '', user = '') {
  menge = Number(menge) || 0
  if (!sku || menge <= 0) return { ok: false, fehler: 'Artikel und Menge angeben.' }
  if (!platzInfo(platz)) return { ok: false, fehler: 'Unbekannter Lagerplatz.' }
  if (menge > freieKapazitaet(platz)) return { ok: false, fehler: `Nicht genug Platz (frei: ${freieKapazitaet(platz)}).` }
  const s = ladeStore()
  const e = s.bestand.find((x) => x.platz === platz && x.sku === sku)
  if (e) e.menge += menge; else s.bestand.push({ platz, sku, menge })
  logBewegung(s, { typ: 'einlagerung', sku, menge, nachPlatz: platz, ref, user })
  speichere(s)
  return { ok: true }
}

/** Kommissionieren/Auslagern von einem Platz. */
export function picken(sku, menge, platz, ref = '', user = '') {
  menge = Number(menge) || 0
  if (!sku || menge <= 0) return { ok: false, fehler: 'Artikel und Menge angeben.' }
  const s = ladeStore()
  const e = s.bestand.find((x) => x.platz === platz && x.sku === sku)
  if (!e || e.menge < menge) return { ok: false, fehler: `Bestand am Platz reicht nicht (verfügbar: ${e?.menge || 0}).` }
  e.menge -= menge
  s.bestand = s.bestand.filter((x) => x.menge > 0)
  logBewegung(s, { typ: 'kommissionierung', sku, menge, vonPlatz: platz, ref, user })
  speichere(s)
  return { ok: true }
}

/** Umlagern zwischen zwei Plätzen. */
export function umlagern(sku, menge, vonPlatz, nachPlatz, user = '') {
  menge = Number(menge) || 0
  if (vonPlatz === nachPlatz) return { ok: false, fehler: 'Quelle und Ziel sind gleich.' }
  const s = ladeStore()
  const e = s.bestand.find((x) => x.platz === vonPlatz && x.sku === sku)
  if (!e || e.menge < menge || menge <= 0) return { ok: false, fehler: 'Quellbestand reicht nicht.' }
  if (!platzInfo(nachPlatz)) return { ok: false, fehler: 'Unbekannter Zielplatz.' }
  if (menge > freieKapazitaet(nachPlatz)) return { ok: false, fehler: `Zielplatz zu voll (frei: ${freieKapazitaet(nachPlatz)}).` }
  e.menge -= menge
  const ziel = s.bestand.find((x) => x.platz === nachPlatz && x.sku === sku)
  if (ziel) ziel.menge += menge; else s.bestand.push({ platz: nachPlatz, sku, menge })
  s.bestand = s.bestand.filter((x) => x.menge > 0)
  logBewegung(s, { typ: 'umlagerung', sku, menge, vonPlatz, nachPlatz, user })
  speichere(s)
  return { ok: true }
}

/** Kennzahlen fürs Cockpit. */
export function kennzahlen() {
  const bel = platzBelegung()
  const belegte = bel.filter((p) => p.menge > 0).length
  const kapGesamt = PLAETZE.reduce((n, p) => n + p.kapazitaet, 0)
  const mengeGesamt = bel.reduce((n, p) => n + p.menge, 0)
  const t = heute()
  return {
    plaetzeGesamt: PLAETZE.length, belegte, freiePlaetze: PLAETZE.length - belegte,
    auslastung: kapGesamt ? Math.round(mengeGesamt / kapGesamt * 100) : 0,
    artikelImLager: bestandJeArtikel().filter((a) => a.menge > 0).length,
    mengeGesamt,
    bewegungenHeute: bewegungen().filter((b) => b.zeit.slice(0, 10) === t).length
  }
}
