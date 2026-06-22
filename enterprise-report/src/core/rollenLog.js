// =========================================================================
//  ROLLEN-/RECHTE-LOG — Audit-Trail: wer hat wann was an Rollen/Rechten
//  geändert (Bereich freigegeben, Mitglied hinzugefügt, Anfrage bearbeitet …).
//  So bleibt jede Berechtigungsänderung nachvollziehbar. Lokal; mappt später
//  auf eine Audit-Tabelle im Backend.
// =========================================================================
const KEY = 'er_rollen_log'
const MAX = 300

export function ladeLog() {
  try { const a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a : [] } catch { return [] }
}
function speichere(a) { try { localStorage.setItem(KEY, JSON.stringify(a.slice(0, MAX))) } catch {} return a }

/**
 * Einen Audit-Eintrag schreiben (neueste zuerst).
 * @param aktion  Kurzkennung, z. B. 'bereich.add', 'mitglied.add', 'anfrage.gewaehrt'
 * @param ziel    betroffenes Objekt (Gruppe/Bericht …)
 * @param detail  Klartext-Beschreibung
 * @param akteur  wer die Änderung gemacht hat
 */
export function protokolliere({ aktion, ziel = null, detail = '', akteur = 'System' }) {
  if (!aktion) return ladeLog()
  const eintrag = { zeit: new Date().toISOString(), akteur, aktion, ziel, detail }
  return speichere([eintrag, ...ladeLog()])
}

export function leereLog() { try { localStorage.removeItem(KEY) } catch {} return [] }
export const anzahlLog = () => ladeLog().length
