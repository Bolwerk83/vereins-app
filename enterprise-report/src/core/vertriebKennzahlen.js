// =========================================================================
//  VERTRIEBSKENNZAHLEN-TAXONOMIE
//  Sechs Phasen vom Angebot bis zum Umsatz, mit den Fach-Codes des Vertriebs.
//  Symbol-Legende: Σ wertbasiert (€) · ◊ mengenbezogen · % Verhältnis · Ø Schnitt.
//  Hinweise:
//   - AEW (Auftragseingang wirksam) gibt es NICHT mehr → entfällt.
//   - OAU (Offene Aufträge) = Auftragsbestand.
//  Werte sind Demo-Größen; abgeleitete Kennzahlen sind über `formel` erklärt.
// =========================================================================

const r0 = (x) => Math.round(x)
const r1 = (x) => Math.round(x * 10) / 10

// Symbol je Wertetyp (entspricht der Legende).
export const ART_SYMBOL = { eur: 'Σ', stk: '◊', pct: '%', avg: 'Ø' }
export const ART_LEGENDE = [
  ['Σ', 'Wertbasierte Kennzahl (€)'],
  ['◊', 'Mengenbezogene Kennzahl'],
  ['%', 'Prozent-/Verhältniskennzahl'],
  ['Ø', 'Durchschnitt']
]

// Basis-Demowerte (Wert in €, Menge in Stück) — Bezugsperiode.
const B = {
  angeWert: 6200000, oangWert: 1800000, vangeWert: 900000, angeAnzahl: 540,
  aeWert: 4100000, storaeWert: 180000, saeoaWert: 60000, aeoaWert: 1230000,
  aetWert: 3800000, nfaWert: 320000,
  oauWert: 1450000, retWert: 210000,
  umsWert: 3700000, artumsWert: 3500000, vumsWert: 95000, kgWert: 42000,
  absMenge: 12400, vkmMenge: 11900, auftraege: 1180
}

/** Phasen mit ihren Kennzahlen (Code, Name, Wertetyp, Wert, optional Formel). */
export function phasen() {
  const storoQuote = r1(B.storaeWert / B.aeWert * 100)
  const angebotsverlust = r1(B.vangeWert / B.angeWert * 100)
  const auftragsstorno = r1((B.storaeWert + B.saeoaWert) / B.aeWert * 100)
  return [
    { id: 'ange', name: 'Angebotsphase', icon: '📨', hinweis: 'Alle Verkaufschancen vor Beauftragung', kpis: [
      { code: 'ANGE', name: 'Angebotseingang', art: 'eur', wert: B.angeWert },
      { code: 'OANG', name: 'Offene Angebote', art: 'eur', wert: B.oangWert },
      { code: 'VANGE', name: 'Verlorener Angebotseingang', art: 'eur', wert: B.vangeWert },
      { code: 'ANGE◊', name: 'Angebotsanzahl', art: 'stk', wert: B.angeAnzahl },
      { code: 'ANGEØ', name: 'Angebotswert Ø', art: 'avg', wert: r0(B.angeWert / B.angeAnzahl), formel: 'ANGE ÷ Angebotsanzahl' }
    ] },
    { id: 'ae', name: 'Auftragseingangsphase', icon: '📥', hinweis: 'Erteilte Aufträge – Brutto, bereinigt, netto', kpis: [
      { code: 'AE', name: 'Auftragseingang', art: 'eur', wert: B.aeWert },
      { code: 'AEB', name: 'Auftragseingang bereinigt', art: 'eur', wert: B.aeWert - B.storaeWert, formel: 'AE − STORAE' },
      { code: 'AEOA', name: 'Auftragseingang ohne Angebote', art: 'eur', wert: B.aeoaWert },
      { code: 'STORAE', name: 'Stornierter Auftragseingang', art: 'eur', wert: B.storaeWert },
      { code: 'SAEOA', name: 'Stornierter AE ohne Angebot', art: 'eur', wert: B.saeoaWert }
    ] },
    { id: 'aer', name: 'Auftragsverwertung', icon: '📊', hinweis: 'Wie viel ist wirtschaftlich verwertbar / fakturiert', kpis: [
      { code: 'AET', name: 'Auftragseingang tatsächlich', art: 'eur', wert: B.aetWert },
      { code: 'NFA', name: 'Nicht fakturierte Aufträge', art: 'eur', wert: B.nfaWert }
    ] },
    { id: 'au', name: 'Auftragsbearbeitung', icon: '📦', hinweis: 'Was ist noch offen, was wurde retourniert', kpis: [
      { code: 'OAU', name: 'Offene Aufträge (= Auftragsbestand)', art: 'eur', wert: B.oauWert },
      { code: 'RET', name: 'Retouren', art: 'eur', wert: B.retWert }
    ] },
    { id: 'q', name: 'Vertriebsqualität & Verluste', icon: '⚠️', hinweis: 'Was wurde storniert, was nicht gewonnen', kpis: [
      { code: 'STORNO%', name: 'Storno %', art: 'pct', wert: storoQuote, formel: 'STORAE ÷ AE' },
      { code: 'ANGVERL%', name: 'Angebotsverlust %', art: 'pct', wert: angebotsverlust, formel: 'VANGE ÷ ANGE' },
      { code: 'AUFSTORNO%', name: 'Auftragsstorno %', art: 'pct', wert: auftragsstorno, formel: '(STORAE + SAEOA) ÷ AE' }
    ] },
    { id: 'um', name: 'Umsatz & Absatz', icon: '💶', hinweis: 'Was wurde fakturiert & in welcher Menge verkauft', kpis: [
      { code: 'UMS', name: 'Umsatzerlöse', art: 'eur', wert: B.umsWert },
      { code: 'ARTUMS', name: 'Artikelerlöse', art: 'eur', wert: B.artumsWert },
      { code: 'VUMS', name: 'Versanderlöse', art: 'eur', wert: B.vumsWert },
      { code: 'KG', name: 'Kaufgutscheine', art: 'eur', wert: B.kgWert },
      { code: 'ABS', name: 'Absatzmenge', art: 'stk', wert: B.absMenge },
      { code: 'VKM', name: 'Verkaufte Artikelmenge', art: 'stk', wert: B.vkmMenge },
      { code: 'UMSAUFTØ', name: 'Umsatz pro Auftrag Ø', art: 'avg', wert: r0(B.umsWert / B.auftraege), formel: 'UMS ÷ Aufträge' },
      { code: 'UMSARTØ', name: 'Umsatz pro Artikel Ø', art: 'avg', wert: r0(B.umsWert / B.absMenge), formel: 'UMS ÷ ABS' }
    ] }
  ]
}

/** Flache Liste aller Kennzahlen (für Suche/Glossar). */
export function alleKennzahlen() {
  return phasen().flatMap((p) => p.kpis.map((k) => ({ ...k, phase: p.name, phaseId: p.id })))
}
