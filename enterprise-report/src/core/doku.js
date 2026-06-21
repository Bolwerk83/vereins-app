// =========================================================================
//  ANWENDER-DOKU / WISSEN — Nachschlagewerk in der App. Jeder Themenbereich
//  laienverständlich erklärt: worum geht's, die wichtigsten Punkte und ein
//  Sprung in den passenden Bericht. Durchsuchbar.
// =========================================================================

export const KATEGORIEN = [
  { id: 'grundlagen', name: 'Grundlagen' },
  { id: 'kostenrechnung', name: 'Kostenrechnung' },
  { id: 'ergebnis', name: 'Ergebnis & Steuerung' },
  { id: 'lebenszyklen', name: 'Lebenszyklen' },
  { id: 'markt', name: 'Markt & Aktionen' }
]

// ziel = ansicht-Key zum Aufruf des Live-Berichts (optional).
export const DOKU = [
  {
    id: 'controlling', kat: 'grundlagen', titel: 'Was ist Controlling?', ziel: 'controlling',
    kurz: 'Controlling steuert das Unternehmen mit Zahlen: planen, messen, vergleichen, gegensteuern.',
    punkte: [
      'Nicht „Kontrolle", sondern Steuerung (engl. to control = steuern).',
      'Liefert Entscheidern Transparenz: Wo stehen wir, wohin laufen wir?',
      'Operativ (kurzfristig, Tagesgeschäft) vs. strategisch (langfristig, Ausrichtung).',
      'Regelkreis: Ziele → Ist messen → Abweichung → Maßnahme.'
    ]
  },
  {
    id: 'klr', kat: 'kostenrechnung', titel: 'Kosten- & Leistungsrechnung (KLR)', ziel: 'klr',
    kurz: 'Die KLR zeigt, welche Kosten im Betrieb für welche Leistung entstehen — die Basis jeder Kalkulation.',
    punkte: [
      'Abgrenzung: Nicht jeder Aufwand ist „Kosten" (betriebsfremd/periodenfremd/außerordentlich raus).',
      'Drei Stufen: Kostenarten (welche?) → Kostenstellen (wo?) → Kostenträger (wofür?).',
      'Grundkosten = Aufwand, der auch Kosten ist; Anderskosten/Zusatzkosten = kalkulatorisch.',
      'Ziel: verursachungsgerechte Verrechnung auf die Produkte.'
    ]
  },
  {
    id: 'abgrenzung', kat: 'kostenrechnung', titel: 'Abgrenzungsrechnung (Aufwand → Kosten)', ziel: 'abgrenzung',
    kurz: 'Der Betriebsüberleitungsbogen führt von der GuV zur KLR: neutrale Posten raus, kalkulatorische Kosten rein.',
    punkte: [
      'Neutraler Aufwand/Ertrag (betriebsfremd, periodenfremd, außerordentlich) wird abgegrenzt.',
      'Zweckaufwand = GuV-Aufwand − neutral; daraus Grundkosten.',
      'Anderskosten ersetzen das bilanzielle Pendant (z. B. kalk. statt bilanzielle Abschreibung).',
      'Unternehmensergebnis (GuV) = neutrales Ergebnis + Betriebsergebnis (KLR).'
    ]
  },
  {
    id: 'kostenarten', kat: 'kostenrechnung', titel: 'Kostenartenrechnung', ziel: 'kostenarten',
    kurz: 'Welche Kosten sind angefallen? Material, Personal, Abschreibungen, kalkulatorische Kosten …',
    punkte: [
      'Gliederung nach Art (Material, Personal, …) und Verhalten (fix/variabel).',
      'Einzelkosten direkt zurechenbar, Gemeinkosten nur indirekt (über Schlüssel).',
      'Kalkulatorische Kosten: Abschreibung, Zinsen, Wagnisse, Unternehmerlohn.',
      'Abgrenzung Aufwand ↔ Kosten über die Abgrenzungsrechnung.'
    ]
  },
  {
    id: 'kostenstellen', kat: 'kostenrechnung', titel: 'Kostenstellenrechnung & BAB', ziel: 'bab',
    kurz: 'Wo sind die Gemeinkosten entstanden? Der Betriebsabrechnungsbogen (BAB) verteilt sie auf Stellen.',
    punkte: [
      'Kostenstellen = betriebliche Orte (Material, Fertigung, Verwaltung, Vertrieb).',
      'Primäre Gemeinkosten verteilen, dann Hilfsstellen umlegen (sekundär).',
      'Ergebnis: Zuschlagssätze je Hauptstelle für die Kalkulation.',
      'Plan/Ist je Datenart möglich — dynamisch neu gerechnet.'
    ]
  },
  {
    id: 'kalkulation', kat: 'kostenrechnung', titel: 'Kostenträgerrechnung / Kalkulation', ziel: 'kalkulation',
    kurz: 'Was kostet ein Produkt? Verfahren: Division, Äquivalenzziffern, Zuschlag, Maschinenstundensatz, Kuppel.',
    punkte: [
      'Divisionskalkulation: Gesamtkosten ÷ Menge (Einproduktbetrieb).',
      'Äquivalenzziffern: Sorten über Verhältniszahlen vergleichbar machen.',
      'Zuschlagskalkulation: Gemeinkosten per Zuschlagssatz auf Einzelkosten.',
      'Maschinenstundensatz bei maschinenintensiver Fertigung; Kuppelkalkulation nach Marktwert.'
    ]
  },
  {
    id: 'deckungsbeitrag', kat: 'ergebnis', titel: 'Deckungsbeitragsrechnung', ziel: 'deckungsbeitrag',
    kurz: 'Was bleibt nach den variablen Kosten zur Deckung der Fixkosten übrig?',
    punkte: [
      'DB = Umsatz − variable Kosten. Positiv = Produkt trägt zu den Fixkosten bei.',
      'Mehrstufig: DB I (Produkt) → DB II (Produktfix) → DB III (Bereichsfix) → Betriebsergebnis.',
      'Teilkostenrechnung — ideal für kurzfristige Entscheidungen (Annahme von Aufträgen, Sortiment).',
      'Engpass: DB pro Engpasseinheit maximieren.'
    ]
  },
  {
    id: 'ergebnis', kat: 'ergebnis', titel: 'Ergebnisrechnung (GuV)', ziel: 'ergebnis',
    kurz: 'Erträge − Aufwendungen = Betriebsergebnis. Als Staffel und als T-Konto.',
    punkte: [
      'Gesamtkostenverfahren (GKV): nach Kostenarten gegliedert.',
      'Umsatzkostenverfahren (UKV): Umsatz − Herstellkosten der verkauften Erzeugnisse.',
      'T-Konto: Soll (Aufwand) / Haben (Ertrag), Saldo = Ergebnis.',
      'Datenart skaliert (Ist/Plan/Forecast).'
    ]
  },
  {
    id: 'profitcenter', kat: 'ergebnis', titel: 'Profitcenter & Segmente', ziel: 'profitcenter',
    kurz: 'Ergebnis je Bereich/Gesellschaft — wer verdient wie viel Geld?',
    punkte: [
      'Center-Typen: Cost, Profit, Investment (mit Kapitalrendite/ROCE).',
      'Profitcenter-Ergebnis = Umsatz − var. Kosten − Fixkosten.',
      'Segment-/Konzernbericht konsolidiert mehrere Gesellschaften.',
      'Intercompany-Umsätze werden eliminiert (sonst Doppelzählung).'
    ]
  },
  {
    id: 'abweichung', kat: 'ergebnis', titel: 'Abweichungsanalyse', ziel: 'abweichung',
    kurz: 'Warum weicht das Ist vom Plan ab? Aufspaltung in Preis- und Mengeneffekt.',
    punkte: [
      'Gesamtabweichung = Ist − Plan.',
      'Preisabweichung = (Ist-Preis − Plan-Preis) × Ist-Menge.',
      'Mengenabweichung = (Ist-Menge − Plan-Menge) × Plan-Preis.',
      'Günstig/ungünstig je nachdem, ob Erlös oder Kosten.'
    ]
  },
  {
    id: 'lebenszyklen', kat: 'lebenszyklen', titel: 'Lebenszyklen verstehen', ziel: 'lebenszyklus',
    kurz: 'Produkte, Kunden, Anlagen, Lieferanten und Forderungen durchlaufen Phasen — jede braucht andere Steuerung.',
    punkte: [
      'Produkt: Einführung → Wachstum → Reife → Sättigung → Rückgang (Normstrategie je Phase).',
      'Kunde: Akquise → Entwicklung → Bestand → gefährdet → verloren.',
      'Anlagen: Investition → Nutzung (kalk. Abschreibung) → Ersatz.',
      'Forderungs-Aging & Bestands-Gängigkeit zeigen Risiken im Umlaufvermögen.'
    ]
  },
  {
    id: 'forderungen', kat: 'lebenszyklen', titel: 'Forderungs-Aging & Working Capital', ziel: 'forderungen',
    kurz: 'Wie alt sind offene Rechnungen und wie viel droht auszufallen?',
    punkte: [
      'Buckets nach Fälligkeit (nicht fällig, 1–30, 31–60, … Tage).',
      'DSO = Ø Zahlungsziel in Tagen — je niedriger, desto besser für die Liquidität.',
      'Wertberichtigung steigt mit dem Alter → erwarteter Ausfall.',
      'Mahnstufen vom Hinweis bis zum Inkasso.'
    ]
  },
  {
    id: 'bestand', kat: 'lebenszyklen', titel: 'Bestands-Gängigkeit (ABC/XYZ)', ziel: 'bestand',
    kurz: 'Welche Artikel drehen schnell (Renner) und welche liegen (Ladenhüter)?',
    punkte: [
      'ABC nach Wert, XYZ nach Umschlag/Vorhersagbarkeit.',
      'Renner gut bevorraten, Ladenhüter aktiv abverkaufen.',
      'Reichweite (Tage) zeigt, wie lange der Bestand reicht.',
      'Ladenhüter binden Kapital — Aktionen helfen beim Abbau.'
    ]
  },
  {
    id: 'marketing', kat: 'markt', titel: 'Marketing & Digital-Analytics', ziel: 'marketing',
    kurz: 'Wie effektiv sind Kanäle und Kampagnen? Funnel, Conversion, ROAS, Cross-Selling.',
    punkte: [
      'Funnel: Besuch → Produktansicht → Warenkorb → Checkout → Kauf.',
      'Conversion-Rate = Käufe ÷ Sessions; AOV = Ø Bestellwert.',
      'ROAS = Umsatz ÷ Werbekosten; CAC = Kosten je Neukunde.',
      'Cross-Selling: welche Produkte werden zusammen gekauft.'
    ]
  },
  {
    id: 'events', kat: 'markt', titel: 'Events & Aktionen', ziel: 'events',
    kurz: 'Aktionen planen und ihre Wirksamkeit messen: Mehrumsatz, ROI, Ladenhüter-Abbau.',
    punkte: [
      'Aktion = Zeitraum + Produkte + Mechanik (Rabatt/Bundle/Werbung) + Kosten.',
      'Mehrumsatz = Ist − Baseline (Normalumsatz ohne Aktion).',
      'Zusätzlicher DB − Werbekosten = Netto-Mehrergebnis → ROI.',
      'Ladenhüter-Abbau zeigt, ob Altware abverkauft wurde.'
    ]
  }
]

const norm = (s) => String(s || '').toLowerCase()

/** Volltextsuche über Titel, Kurztext und Stichpunkte. */
export function sucheDoku(q, doku = DOKU) {
  const query = norm(q).trim()
  if (!query) return doku
  return doku.filter((d) =>
    norm(d.titel).includes(query) ||
    norm(d.kurz).includes(query) ||
    d.punkte.some((p) => norm(p).includes(query)))
}

export const dokuNachKategorie = (katId, doku = DOKU) => doku.filter((d) => d.kat === katId)
