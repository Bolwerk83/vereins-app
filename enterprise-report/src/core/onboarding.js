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

// Merker: pro Rolle nur einmal automatisch zeigen.
const KEY = 'er_onboarding_gesehen'
function gesehenSet() { try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')) } catch { return new Set() } }
export function schonGesehen(rolleId) { return gesehenSet().has(rolleId || 'standard') }
export function merkeGesehen(rolleId) {
  const s = gesehenSet(); s.add(rolleId || 'standard')
  localStorage.setItem(KEY, JSON.stringify([...s]))
}
