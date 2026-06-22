// =========================================================================
//  DATENSCHUTZ & SICHERHEIT — rechtlich/organisatorisch absichern:
//   • Datenklassifizierung (öffentlich/intern/personenbezogen/sensibel)
//   • Maskierung/Pseudonymisierung personenbezogener Daten in dev/test
//     (Grundsatz: in Nicht-Prod keine echten personenbezogenen Daten)
//   • Object-Level-Security (Measures je Rolle), Row-Level-Security (je Dim)
//   • DSGVO-Rechts-Checkliste (Art. 6/28/30/32 …)
//
//  Hinweis: echte Durchsetzung gehört ins Backend/den dataProvider; hier die
//  Verwaltung + die Maskierungs-/Prüflogik. Persistenz im LocalStorage.
// =========================================================================

export const KLASSEN = [
  { id: 'oeffentlich', name: 'Öffentlich', farbe: 'var(--amp-g)', dsgvo: false },
  { id: 'intern', name: 'Intern', farbe: '#2563eb', dsgvo: false },
  { id: 'personenbezogen', name: 'Personenbezogen', farbe: 'var(--amp-a)', dsgvo: true },
  { id: 'sensibel', name: 'Sensibel / Geschäftsgeheimnis', farbe: 'var(--amp-r)', dsgvo: true }
]
export const klasseInfo = (id) => KLASSEN.find((k) => k.id === id) || KLASSEN[1]
export const ROLLEN = ['Geschäftsführung', 'Controlling', 'Finanzen', 'Vertrieb', 'Einkauf', 'Bereichsleiter', 'Mitarbeiter']

// --- Umgebung (dev/test/prod) ---------------------------------------------
export const UMGEBUNGEN = ['dev', 'test', 'prod']
const KEY_UMG = 'er_umgebung'
export function umgebung() {
  // Privacy-first: ohne explizite Festlegung gilt „dev" (maskiert) — echte
  // Personendaten nur, wenn bewusst auf „prod" gestellt.
  try { return localStorage.getItem(KEY_UMG) || 'dev' } catch { return 'dev' }
}
export function setzeUmgebung(u) { localStorage.setItem(KEY_UMG, u); return u }
export const istNichtProd = () => umgebung() !== 'prod'

// --- Datenklassifizierung --------------------------------------------------
const KEY_KLASS = 'er_datenklassen'
// Seed: bekannte personenbezogene/sensible Felder; Rest default „intern".
function seedKlassen() {
  return {
    'DimKunde.Name': 'personenbezogen',
    'DimKunde.KundeID': 'personenbezogen',
    'DimKunde.Region': 'intern',
    'DimKunde.Land': 'intern',
    'DimKunde.Segment': 'intern',
    'DimArtikel.Bezeichnung': 'intern',
    'FactUmsatz.UmsatzPlan': 'sensibel',
    'FactUmsatz.UmsatzVorjahr': 'sensibel'
  }
}
export function ladeKlassen() {
  try { const raw = localStorage.getItem(KEY_KLASS); return raw == null ? seedKlassen() : JSON.parse(raw) } catch { return seedKlassen() }
}
export function klasseVon(feld) { return ladeKlassen()[feld] || 'intern' }
export function setzeKlasse(feld, klasse) {
  const o = ladeKlassen(); o[feld] = klasse; localStorage.setItem(KEY_KLASS, JSON.stringify(o)); return o
}
export const istGeschuetzt = (klasse) => klasse === 'personenbezogen' || klasse === 'sensibel'

// --- Maskierung / Pseudonymisierung ---------------------------------------
function pseudonym(wert) {
  let h = 0; const s = String(wert)
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return 'Kunde-' + (h % 100000).toString().padStart(5, '0')
}
function maskeText(wert) {
  return String(wert).split(' ').map((w) => (w ? w[0] + '•'.repeat(Math.max(1, w.length - 1)) : '')).join(' ')
}
/** Wert je nach Klasse & Umgebung maskieren. In Nicht-Prod werden
 *  personenbezogene/sensible Werte pseudonymisiert/maskiert. */
export function maskiere(wert, klasse, umg = umgebung()) {
  if (umg === 'prod' || !istGeschuetzt(klasse)) return wert
  if (klasse === 'personenbezogen') return pseudonym(wert)
  return maskeText(wert) // sensibel → teilmaskiert
}

// --- Object-Level-Security (Measures je Rolle) ----------------------------
const KEY_OLS = 'er_ols'
// Seed: margenkritische/sensible Measures nur GF + Controlling.
function seedOls() {
  return { 'm-umsatzrendite': ['Geschäftsführung', 'Controlling', 'Finanzen'], 'm-roce': ['Geschäftsführung', 'Controlling', 'Finanzen'] }
}
export function ladeOls() {
  try { const raw = localStorage.getItem(KEY_OLS); return raw == null ? seedOls() : JSON.parse(raw) } catch { return seedOls() }
}
/** Rollen, die eine Measure sehen dürfen (leer/keine Regel = alle). */
export function erlaubteRollen(measureId) { return ladeOls()[measureId] || null }
export function darfMeasure(measureId, rolle) { const r = erlaubteRollen(measureId); return !r || r.includes(rolle) }
export function setzeOls(measureId, rolle, erlaubt) {
  const o = ladeOls(); const cur = new Set(o[measureId] || ROLLEN)
  erlaubt ? cur.add(rolle) : cur.delete(rolle)
  o[measureId] = [...cur]; localStorage.setItem(KEY_OLS, JSON.stringify(o)); return o
}

// --- Row-Level-Security (je Dimension) ------------------------------------
export const RLS_REGELN = [
  { id: 'alle', name: 'Alle Zeilen (keine Einschränkung)' },
  { id: 'eigenerBereich', name: 'Nur eigener Bereich/Profit-Center' },
  { id: 'eigenesLand', name: 'Nur eigenes Land/Region' }
]
const KEY_RLS = 'er_rls'
function seedRls() { return { DimProfitcenter: 'eigenerBereich', DimKunde: 'eigenesLand' } }
export function ladeRls() {
  try { const raw = localStorage.getItem(KEY_RLS); return raw == null ? seedRls() : JSON.parse(raw) } catch { return seedRls() }
}
export function rlsVon(dimId) { return ladeRls()[dimId] || 'alle' }
export function setzeRls(dimId, regel) {
  const o = ladeRls(); if (regel === 'alle') delete o[dimId]; else o[dimId] = regel
  localStorage.setItem(KEY_RLS, JSON.stringify(o)); return o
}

// --- DSGVO-Rechts-Checkliste ----------------------------------------------
export const CHECKLISTE = [
  { id: 'rechtsgrundlage', titel: 'Rechtsgrundlage je Verarbeitung dokumentiert', gesetz: 'Art. 6 DSGVO', hinweis: 'Vertrag, berechtigtes Interesse oder Einwilligung je Datennutzung.' },
  { id: 'vvt', titel: 'Verarbeitungsverzeichnis geführt', gesetz: 'Art. 30 DSGVO', hinweis: 'Verzeichnis aller Verarbeitungstätigkeiten (auch dieses Reportings).' },
  { id: 'av', titel: 'Auftragsverarbeitungs-Verträge vorhanden', gesetz: 'Art. 28 DSGVO', hinweis: 'Mit Dienstleistern (Hosting, Analytics/Google, Carrier).' },
  { id: 'toms', titel: 'Technische & organisatorische Maßnahmen', gesetz: 'Art. 32 DSGVO', hinweis: 'Verschlüsselung, Zugriffskontrolle (RBAC/OLS/RLS), Pseudonymisierung.' },
  { id: 'minimierung', titel: 'Datenminimierung & Zweckbindung', gesetz: 'Art. 5 DSGVO', hinweis: 'Nur benötigte Felder; dev/test ohne echte personenbezogene Daten.' },
  { id: 'fristen', titel: 'Lösch-/Aufbewahrungsfristen definiert', gesetz: 'Art. 17 / § 257 HGB', hinweis: 'Handels-/Steuerdaten 6–10 J.; personenbezogene Daten löschen, wenn Zweck entfällt.' },
  { id: 'betroffenenrechte', titel: 'Auskunfts-/Löschkonzept (Betroffenenrechte)', gesetz: 'Art. 15–17 DSGVO', hinweis: 'Auskunft, Berichtigung, Löschung umsetzbar.' },
  { id: 'drittland', titel: 'Drittlandtransfer abgesichert (z. B. Google/USA)', gesetz: 'Art. 44 ff. DSGVO', hinweis: 'SCC / Angemessenheitsbeschluss, Datentransfer-Folgenabschätzung.' }
]
const KEY_CHECK = 'er_dsgvo_check'
export function ladeCheck() { try { return JSON.parse(localStorage.getItem(KEY_CHECK) || '{}') } catch { return {} } }
export function toggleCheck(id) { const o = ladeCheck(); o[id] = !o[id]; localStorage.setItem(KEY_CHECK, JSON.stringify(o)); return o }
export function complianceScore() {
  const o = ladeCheck(); const erledigt = CHECKLISTE.filter((c) => o[c.id]).length
  return { erledigt, gesamt: CHECKLISTE.length, prozent: Math.round(erledigt / CHECKLISTE.length * 100) }
}
