// =========================================================================
//  ONBOARDING — rollenbasierte Einführung, jederzeit erneut aufrufbar.
//  Je Rolle (Gruppe) ein zugeschnittener Pfad: was ist für DICH wichtig,
//  und wo findest du es. Schritte verlinken direkt in die jeweilige Ansicht.
// =========================================================================

// Schritt: { titel, text, ziel? (View-Id zum Hinspringen) }
const PROFILE = {
  'g-gf': {
    titel: 'Geschäftsführung', intro: 'Dein Fokus: Gesamtlage, Ergebnis und Steuerung auf einen Blick.',
    schritte: [
      { titel: 'Berichtsbaum & Management Report', text: 'Top-down von der Konzernsicht bis ins Detail — starte hier.', ziel: 'baum' },
      { titel: 'Lebenszyklus & Portfolio', text: 'Wo stehen Produkte und Kunden? Stars, Cash Cows, Auslaufkandidaten.', ziel: 'lebenszyklus' },
      { titel: 'Abschluss & Freigabe', text: 'Monatsabschluss prüfen und freigeben — löst den Versand aus.', ziel: 'abschluss' },
      { titel: 'Verteiler', text: 'Berichte automatisch an Empfänger verschicken (Zeitplan/Ereignis).', ziel: 'verteiler' }
    ]
  },
  'g-controlling': {
    titel: 'Controlling', intro: 'Dein Fokus: Kosten, Abweichungen, Wirtschaftlichkeit und saubere Zahlen.',
    schritte: [
      { titel: 'Kosten- & Leistungsrechnung', text: 'Von Kostenarten über Kostenstellen bis zum Betriebsergebnis.', ziel: 'klr' },
      { titel: 'Kostenstellenrechnung (BAB)', text: 'Umlage, Zuschlagssätze und Plan/Ist je Stelle.', ziel: 'kostenstellen' },
      { titel: 'Abstimmbrücken', text: 'Reporting gegen die Buchhaltung abstimmen.', ziel: 'abstimmung' },
      { titel: 'Versionsvergleich', text: 'Ist/Plan/Forecast gegenüberstellen.', ziel: 'vergleich' },
      { titel: 'Maßnahmen', text: 'Aus Abweichungen Maßnahmen ableiten und nachhalten.', ziel: 'massnahmen' }
    ]
  },
  'g-finanzen': {
    titel: 'Finanzen & Buchhaltung', intro: 'Dein Fokus: Abschluss, Liquidität und abgestimmte Ergebnisse.',
    schritte: [
      { titel: 'Abschluss & Versionen', text: 'Perioden revisionssicher einfrieren.', ziel: 'abschluss' },
      { titel: 'Abstimmbrücken', text: 'Differenzen Reporting ↔ Hauptbuch klären.', ziel: 'abstimmung' },
      { titel: 'KLR & Abgrenzung', text: 'Aufwand vs. Kosten, kalkulatorische Kosten.', ziel: 'klr' }
    ]
  },
  'g-vertrieb': {
    titel: 'Vertrieb & Marketing', intro: 'Dein Fokus: Markt, Kunden, Aufträge und Margen.',
    schritte: [
      { titel: 'Berichtsbaum (Vertrieb)', text: 'Umsatz, DB und Kanäle aufreißen.', ziel: 'baum' },
      { titel: 'Lebenszyklus Produkt & Kunde', text: 'Portfolio und Kundenbeziehungen steuern.', ziel: 'lebenszyklus' },
      { titel: 'Auftrags-Lebenszyklus', text: 'Order-to-Cash: Pipeline und Durchlaufzeiten.', ziel: 'auftrag' }
    ]
  },
  'g-supply': {
    titel: 'Produktion & Supply Chain', intro: 'Dein Fokus: Produktion, Bestände, Logistik und Qualität.',
    schritte: [
      { titel: 'Berichtsbaum (Produktion/Logistik)', text: 'Auslastung, Bestände, Lieferfähigkeit.', ziel: 'baum' },
      { titel: 'Auftrags-Lebenszyklus', text: 'Fertigung und Lieferung im Fluss, Engpässe erkennen.', ziel: 'auftrag' },
      { titel: 'Kostenstellenrechnung', text: 'Wirtschaftlichkeit je Stelle.', ziel: 'kostenstellen' }
    ]
  },
  'g-personal': {
    titel: 'Personal (HR)', intro: 'Dein Fokus: Köpfe, Kosten und Personalkennzahlen.',
    schritte: [
      { titel: 'Berichtsbaum (HR)', text: 'FTE, Fluktuation, Krankenstand.', ziel: 'baum' },
      { titel: 'Controlling-Struktur', text: 'Personalcontrolling und seine Instrumente.', ziel: 'controlling' }
    ]
  },
  'g-leser': {
    titel: 'Lesezugriff', intro: 'Dein Fokus: Berichte ansehen und Kennzahlen nachschlagen.',
    schritte: [
      { titel: 'Berichtsbaum', text: 'Durch die Berichte navigieren.', ziel: 'baum' },
      { titel: 'Kennzahlen-Glossar', text: 'Bedeutung jeder Kennzahl nachschlagen.', ziel: 'kennzahlen' }
    ]
  },
  standard: {
    titel: 'Willkommen', intro: 'So findest du dich zurecht.',
    schritte: [
      { titel: 'Berichtsbaum', text: 'Zentraler Einstieg in alle Berichte.', ziel: 'baum' },
      { titel: 'Kennzahlen-Glossar', text: 'Alle Definitionen an einem Ort.', ziel: 'kennzahlen' },
      { titel: 'Controlling-Struktur', text: 'Überblick über die Controlling-Bereiche.', ziel: 'controlling' }
    ]
  }
}

// Zusatzschritte für Administrator:innen (werden angehängt).
const ADMIN_SCHRITTE = [
  { titel: 'Rollen & Rechte', text: 'Gruppen, Bereiche und vertrauliche Kennzahlen steuern.', ziel: 'rechte' },
  { titel: 'Transport (dev/test/prod)', text: 'Berichte zwischen den Instanzen bewegen.', ziel: 'transport' },
  { titel: 'KPI-Definitionen', text: 'Ziele/Einheiten im Glossar pflegen (Admin).', ziel: 'kennzahlen' }
]

/** Passendes Profil zur Rolle bestimmen. */
export function profilFuer(rolle, admin = false) {
  const basis = (rolle && PROFILE[rolle.id]) ? PROFILE[rolle.id] : PROFILE.standard
  const schritte = admin ? [...basis.schritte, ...ADMIN_SCHRITTE] : basis.schritte
  return { ...basis, schritte }
}

// ---- Neugier-Hooks: wechselnde "Entdecke"-Fragen, die zum Klicken anregen --
export const NEUGIER = [
  { frage: 'Wo versteckt sich gerade die größte negative Marge?', hinweis: 'Der Controller-Radar findet sie in einem Klick — kritische Punkte zuerst.', ziel: 'detailberichte' },
  { frage: 'Welche Rechnung wurde mit einer Artikelnummer statt einer Rechnungsnummer erfasst?', hinweis: 'Das Qualitätsdashboard zeigt dir den Übeltäter — anklicken, bereinigen, abhaken.', ziel: 'detailberichte' },
  { frage: 'Welche Charge läuft als Nächstes ab?', hinweis: 'Chargenliste, Spalte MHD — rot heißt: überschritten.', ziel: 'detailberichte' },
  { frage: 'Welcher Kunde kratzt am Kreditlimit?', hinweis: 'Kundenliste, Ansicht „Risiko" — ein Klick genügt.', ziel: 'detailberichte' },
  { frage: 'Ursache oder Folgefehler?', hinweis: 'Der Radar erkennt Abhängigkeiten und meldet nur die Wurzel — nicht den ganzen Rattenschwanz.', ziel: 'detailberichte' },
  { frage: 'Welcher Lieferant fällt durch Reklamationen auf?', hinweis: 'Lieferantenliste, Ansicht „Qualität".', ziel: 'detailberichte' },
  { frage: 'Stimmen Reporting und Hauptbuch wirklich überein?', hinweis: 'Die Abstimmbrücken zeigen jede Differenz auf den Cent.', ziel: 'abstimmung' },
  { frage: 'Star, Cash Cow oder Auslaufkandidat?', hinweis: 'Der Lebenszyklus sortiert dein ganzes Portfolio.', ziel: 'lebenszyklus' },
  { frage: 'Wie sieht deine App in deinen Firmenfarben aus?', hinweis: 'Im Admin-Bereich legst du eigene Designs an — mit Logo.', ziel: 'admin' }
]

// Motivierende, wechselnde Aufmacher.
export const MOTIVATION = [
  'Bereit für ein paar Aha-Momente? 👀',
  'Heute schon eine Auffälligkeit entdeckt? 🔍',
  'Lust, dem Controlling auf den Zahn zu fühlen? 🦷',
  'Drei Klicks bis zum nächsten Insight. 🚀',
  'Was würde dir auffallen, wenn du genau hinschaust? 🧐'
]

const ROT_KEY = 'er_neugier_idx'
function rotIndex(step) {
  let i = 0
  try { i = parseInt(localStorage.getItem(ROT_KEY) || '0', 10) || 0 } catch {}
  try { localStorage.setItem(ROT_KEY, String(i + step)) } catch {}
  return i
}
/** Wechselnde Neugier-Hooks (jedes Öffnen andere) + ein Aufmacher. */
export function naechsteNeugier(anzahl = 2) {
  const i = rotIndex(anzahl)
  const hooks = Array.from({ length: Math.min(anzahl, NEUGIER.length) }, (_, k) => NEUGIER[(i + k) % NEUGIER.length])
  return { motto: MOTIVATION[i % MOTIVATION.length], hooks }
}

// Merker: pro Rolle nur einmal automatisch zeigen.
const KEY = 'er_onboarding_gesehen'
function gesehenSet() { try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')) } catch { return new Set() } }
export function schonGesehen(rolleId) { return gesehenSet().has(rolleId || 'standard') }
export function merkeGesehen(rolleId) {
  const s = gesehenSet(); s.add(rolleId || 'standard')
  localStorage.setItem(KEY, JSON.stringify([...s]))
}
