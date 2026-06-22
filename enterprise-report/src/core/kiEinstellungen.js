// =========================================================================
//  KI-STEUERUNG — zentraler Schalter, ob KI im Reporting genutzt wird, plus
//  Betriebsmodus für Datensouveränität (wo liegen die Daten?). Hintergrund:
//  Firmendaten sollen im Haus bleiben — der Admin entscheidet bewusst.
// =========================================================================
export const MODI = [
  { id: 'lokal', name: 'Lokal / On-Premise', kurz: 'Eigenes RZ', souv: 3,
    info: 'Modell und Daten laufen vollständig im eigenen Rechenzentrum. Nichts verlässt das Haus — höchste Souveränität.' },
  { id: 'privatcloud', name: 'Private Cloud (VPC + AVV)', kurz: 'Privat-Cloud', souv: 2,
    info: 'Dedizierte, abgeschottete Umgebung in EU-Region mit Auftragsverarbeitungsvertrag und Zero-Retention (kein Training, keine Speicherung).' },
  { id: 'extern', name: 'Externer KI-Dienst (Zero-Retention)', kurz: 'Extern', souv: 1,
    info: 'Nur Metadaten/aggregierte, maskierte Werte verlassen das Haus; EU-Residency, kein Training. Keine Roh- oder Personendaten.' }
]
export const DATENFREIGABE = [
  { id: 'metadaten', name: 'Nur Modell-Metadaten', info: 'KI sieht nur Feld-/Kennzahlnamen & Struktur — niemals Werte.' },
  { id: 'aggregiert', name: 'Aggregiert & maskiert', info: 'KI sieht nur aggregierte, anonymisierte Werte — keine Einzelbelege/Personen.' },
  { id: 'voll', name: 'Vollzugriff (nur lokal sinnvoll)', info: 'KI darf Detaildaten nutzen — nur im lokalen Modus vertretbar.' }
]

const KEY = 'er_ki'
const DEFAULT = { aktiv: true, modus: 'lokal', datenfreigabe: 'metadaten' }
export function ladeKi() {
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return { ...DEFAULT } }
}
export function setzeKi(patch) {
  const v = { ...ladeKi(), ...patch }; localStorage.setItem(KEY, JSON.stringify(v)); return v
}
export const kiAktiv = () => ladeKi().aktiv
export const modusInfo = (id) => MODI.find((m) => m.id === id) || MODI[0]
export const freigabeInfo = (id) => DATENFREIGABE.find((d) => d.id === id) || DATENFREIGABE[0]

/** Klartext, wo die Daten bei der aktuellen Einstellung liegen/bleiben. */
export function datenStandort() {
  const k = ladeKi()
  if (!k.aktiv) return 'KI deaktiviert — es werden keinerlei Daten an ein KI-Modell gegeben.'
  return `${modusInfo(k.modus).name}: ${modusInfo(k.modus).info} Freigegeben: ${freigabeInfo(k.datenfreigabe).name.toLowerCase()}.`
}
