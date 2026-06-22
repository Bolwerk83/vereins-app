// =========================================================================
//  QUALITÄTS-WORKFLOW — Status & Bearbeitungs-Log auf den Plausi-Befunden.
//  Zustände: offen (rot/gelb je Schwere) · bearbeitung (blau) · erledigt (grün).
//  Wird ein erledigter Befund an einem späteren Tag erneut geprüft und ist
//  noch da -> "Wiedervorlage" inkl. Historie (wer/wann/was). localStorage.
// =========================================================================
import { sammelBefunde } from './detailberichte.js'

const KEY = 'er_qualitaet'
export const ZUSTAND_LABEL = { offen: 'Offen', bearbeitung: 'In Bearbeitung', erledigt: 'Erledigt' }

function hash(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h.toString(36) }
function lade() { try { const o = JSON.parse(localStorage.getItem(KEY) || '{}'); return o && typeof o === 'object' ? o : {} } catch { return {} } }
function speichere(o) { try { localStorage.setItem(KEY, JSON.stringify(o)) } catch {} return o }
const heute = () => new Date().toISOString().slice(0, 10)

/** Stabile ID eines Befunds (über Tage hinweg gleich). */
export function befundId(it) { return `${it.listId}::${it.id}::${it.feld}::${hash(it.text)}` }

export function statusVon(id) { return lade()[id] || null }

/** Zustand setzen + Log-Eintrag (wer/wann/was/Kommentar) anhängen. */
export function setStatus(id, status, { aktor = 'Du', kommentar = '' } = {}) {
  const o = lade()
  const e = o[id] || { status: 'offen', log: [] }
  e.status = status
  if (status === 'erledigt') e.erledigtAm = heute()
  e.log = [...(e.log || []), { ts: Date.now(), aktor, aktion: ZUSTAND_LABEL[status] || status, kommentar }]
  o[id] = e
  speichere(o)
  return e
}

// Welcher Fachbereich bündelt welche Liste? (für das Dashboard je Bereich)
export const BEREICH_VON_LISTE = {
  rechnung: 'Finanzen / FiBu', rechnungpos: 'Finanzen / FiBu', offeneposten: 'Finanzen / FiBu',
  artikel: 'Bestand / Logistik', produkt: 'Bestand / Logistik', charge: 'Bestand / Logistik', inventur: 'Bestand / Logistik', warenverbrauch: 'Bestand / Logistik',
  auftrag: 'Vertrieb / Auftrag', auftragsbestand: 'Vertrieb / Auftrag', leasing: 'Vertrieb / Auftrag', retoure: 'Vertrieb / Auftrag', bestellkanal: 'Vertrieb / Auftrag',
  bestellung: 'Einkauf', lieferant: 'Einkauf',
  kunde: 'Stammdaten'
}

/** Alle Befunde mit Workflow-Zustand angereichert. */
export function qualitaetUebersicht() {
  const o = lade()
  const h = heute()
  return sammelBefunde().map((it) => {
    const id = befundId(it)
    const st = o[id]
    const zustand = st?.status || 'offen'
    const wiedervorlage = zustand === 'erledigt' && !!st?.erledigtAm && st.erledigtAm !== h
    return { ...it, id, zustand, wiedervorlage, erledigtAm: st?.erledigtAm || null, log: st?.log || [], bereich: BEREICH_VON_LISTE[it.listId] || 'Sonstige' }
  })
}

/** Effektive Ampel eines Bereichs aus seinen Zählern. */
export function ampelVon(z) {
  if (z.offenFehler > 0 || z.wiedervorlage > 0) return 'rot'
  if (z.offenWarnung > 0) return 'gelb'
  if (z.bearbeitung > 0) return 'blau'
  return 'gruen'
}

/** Kennzahlen je Bereich (für die Bereichskarten). */
export function qualitaetStats() {
  const proBereich = {}
  for (const it of qualitaetUebersicht()) {
    const z = proBereich[it.bereich] = proBereich[it.bereich] || { bereich: it.bereich, offenFehler: 0, offenWarnung: 0, bearbeitung: 0, erledigt: 0, wiedervorlage: 0, gesamt: 0 }
    z.gesamt++
    if (it.wiedervorlage) z.wiedervorlage++
    else if (it.zustand === 'erledigt') z.erledigt++
    else if (it.zustand === 'bearbeitung') z.bearbeitung++
    else if (it.schwere === 'fehler') z.offenFehler++
    else z.offenWarnung++
  }
  const liste = Object.values(proBereich).map((z) => ({ ...z, ampel: ampelVon(z) })).sort((a, b) => a.bereich.localeCompare(b.bereich))
  const gesamt = { offen: 0, bearbeitung: 0, erledigt: 0, wiedervorlage: 0 }
  for (const z of liste) { gesamt.offen += z.offenFehler + z.offenWarnung; gesamt.bearbeitung += z.bearbeitung; gesamt.erledigt += z.erledigt; gesamt.wiedervorlage += z.wiedervorlage }
  return { proBereich: liste, gesamt }
}
