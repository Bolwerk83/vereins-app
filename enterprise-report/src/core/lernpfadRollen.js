// =========================================================================
//  ROLLENBASIERTE LERNPFADE — je Rolle ein anderer Schwerpunkt: welche
//  Lektionen besonders relevant sind. Der Lernpfad bleibt vollständig, aber
//  der Einstieg/Fokus passt sich an. Auswahl wird in localStorage gehalten.
// =========================================================================
import { LEKTIONEN } from './lernpfad.js'

const ALLE = LEKTIONEN.map((l) => l.id)

export const LERN_ROLLEN = [
  { id: 'alle', name: 'Kompletter Pfad', icon: '🎓', fokus: ALLE,
    intro: 'Alle Lektionen von den Grundlagen bis zur Steuerung.' },
  { id: 'gf', name: 'Geschäftsführung', icon: '🧑‍💼',
    fokus: ['l-was-controlling', 'l-ergebnis', 'l-deckungsbeitrag', 'l-lebenszyklus', 'l-massnahmen'],
    intro: 'Der rote Faden fürs Steuern: Ergebnis, Deckungsbeitrag, Portfolio und Maßnahmen.' },
  { id: 'controlling', name: 'Controlling', icon: '📊', fokus: ALLE,
    intro: 'Das komplette Handwerk — von der Abgrenzung bis zur Kalkulation.' },
  { id: 'vertrieb', name: 'Vertrieb', icon: '🤝',
    fokus: ['l-deckungsbeitrag', 'l-lebenszyklus', 'l-o2c', 'l-massnahmen'],
    intro: 'Margen verstehen, Kunden über den Lebenszyklus führen, Cash schneller realisieren.' },
  { id: 'produktion', name: 'Einkauf / Produktion', icon: '🏭',
    fokus: ['l-was-kosten', 'l-kostenarten', 'l-einzelgemein', 'l-bab', 'l-kostentraeger'],
    intro: 'Kostenarten, Zuschläge, BAB und Kalkulation — wo die Produktkosten entstehen.' }
]

export const rolleInfo = (id) => LERN_ROLLEN.find((r) => r.id === id) || LERN_ROLLEN[0]

/** Lektions-IDs im Fokus einer Rolle (Reihenfolge wie im Lernpfad). */
export function fokusLektionen(rolleId) {
  const set = new Set(rolleInfo(rolleId).fokus)
  return ALLE.filter((id) => set.has(id))
}

export const imFokus = (rolleId, lektionId) => rolleInfo(rolleId).fokus.includes(lektionId)

const KEY = 'er_lernrolle'
export function ladeLernRolle() { try { return localStorage.getItem(KEY) || 'alle' } catch { return 'alle' } }
export function setzeLernRolle(id) { try { localStorage.setItem(KEY, id) } catch {} return id }
