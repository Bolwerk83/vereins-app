// =========================================================================
//  BERICHT-INFO — „Schaufenster" für jeden Bericht: Was sagt er aus? Für wen
//  ist er gedacht? Welchen Mehrwert bringt er? So sieht jeder, was es gibt –
//  auch ohne Berechtigung (dann ausgegraut, nur Info, kein Aufruf).
//  Schlüssel = ansicht-/view-Key (wie in navMeta/Navigation).
// =========================================================================
export const BERICHT_INFO = {
  // ---- Cockpit & Berichte ----
  baum: { zweck: 'Zentraler Einstieg: alle Berichte hierarchisch von der Geschäftsführung bis zum Detail.', zielgruppe: 'Alle Rollen.', mehrwert: 'Schneller Überblick und Drill-down bis zur Einzelkennzahl.' },
  kennzahlen: { zweck: 'Nachschlagewerk aller KPIs mit Definition, Ziel und Abhängigkeiten.', zielgruppe: 'Alle, v. a. Controlling.', mehrwert: 'Einheitliches Verständnis der Kennzahlen.' },
  katalog: { zweck: 'Durchsuchbarer Katalog aller verfügbaren Berichte.', zielgruppe: 'Alle.', mehrwert: 'Den passenden Bericht schnell finden.' },
  kpieditor: { zweck: 'Eigene, abgeleitete KPIs aus Formeln definieren.', zielgruppe: 'Controlling / Power-User.', mehrwert: 'Individuelle Kennzahlen ohne IT.' },
  designer: { zweck: 'Eigene Berichte aus KPIs zusammenstellen.', zielgruppe: 'Power-User / Controlling.', mehrwert: 'Flexible, wiederverwendbare Auswertungen.' },
  detailberichte: { zweck: 'Granulare Listen (Artikel, Aufträge …) für die Einzelfallprüfung mit Plausibilitätskontrolle.', zielgruppe: 'Controlling / Stammdaten / Fachbereiche.', mehrwert: 'Falscheingaben und unplausible Datenvorgänge gezielt finden und validieren.' },
  // ---- Kosten & Ergebnis ----
  klr: { zweck: 'Grundlagen und Fluss der Kosten- & Leistungsrechnung.', zielgruppe: 'Controlling, Rechnungswesen.', mehrwert: 'Verstehen, welche Kosten wofür entstehen.' },
  einzelgemein: { zweck: 'Einzel- vs. Gemeinkosten und Zuschlagskalkulation.', zielgruppe: 'Kalkulation / Controlling.', mehrwert: 'Saubere Gemeinkostenverrechnung.' },
  abgrenzung: { zweck: 'Überleitung GuV → KLR inkl. neutraler Abgrenzung und kalkulatorischer Kosten.', zielgruppe: 'Rechnungswesen / Controlling.', mehrwert: 'Betriebsergebnis korrekt abgegrenzt.' },
  kostenstellen: { zweck: 'Kostenstellenrechnung mit Umlage und Zuschlagssätzen.', zielgruppe: 'Controlling.', mehrwert: 'Wo entstehen Gemeinkosten – und wie teuer ist jede Stelle.' },
  bab: { zweck: 'Betriebsabrechnungsbogen über die ganze Firma (Plan/Ist).', zielgruppe: 'Controlling.', mehrwert: 'Gemeinkostenverteilung & Wirtschaftlichkeit je Stelle.' },
  kalkulation: { zweck: 'Kostenträgerrechnung: Selbstkosten je Produkt (Division/Äquivalenz/Zuschlag/Maschine/Kuppel).', zielgruppe: 'Kalkulation / Vertrieb.', mehrwert: 'Preisuntergrenzen & Produktergebnis.' },
  ergebnis: { zweck: 'Ergebnisrechnung (GuV) als Staffel und T-Konto.', zielgruppe: 'Geschäftsführung / Finanzen.', mehrwert: 'Periodenergebnis transparent.' },
  deckungsbeitrag: { zweck: 'Deckungsbeitragsrechnung, ein- und mehrstufig.', zielgruppe: 'Vertrieb / Controlling.', mehrwert: 'Welche Produkte tragen die Fixkosten.' },
  profitcenter: { zweck: 'Ergebnis je Profitcenter inkl. Kapitalrendite (ROCE).', zielgruppe: 'Bereichsleitung / GF.', mehrwert: 'Wer verdient wie viel Geld.' },
  segment: { zweck: 'Segment-/Konzernbericht mit Intercompany-Konsolidierung.', zielgruppe: 'GF / Konzern.', mehrwert: 'Konzernsicht ohne Doppelzählung.' },
  // ---- Operativ ----
  marketing: { zweck: 'Digital-Analytics: Funnel, Conversion, Kanäle, ROAS.', zielgruppe: 'Marketing / Vertrieb.', mehrwert: 'Kanäle & Kampagnen datenbasiert steuern.' },
  events: { zweck: 'Aktionen mit Zeitraum/Kosten und ihre Wirksamkeit.', zielgruppe: 'Marketing / Vertrieb.', mehrwert: 'Werbe-ROI, Mehrumsatz und Ladenhüter-Abbau messen.' },
  bestand: { zweck: 'Bestands-Gängigkeit (ABC/XYZ, Renner/Ladenhüter).', zielgruppe: 'Logistik / Einkauf.', mehrwert: 'Kapitalbindung senken, Ladenhüter erkennen.' },
  lager: { zweck: 'Lagerverwaltung aus Controlling-Sicht: Kapitalbindung, Lagerhaltungskosten, Standortkosten, Bestandsoptimierung (EOQ).', zielgruppe: 'Logistik / Controlling.', mehrwert: 'Lagerkosten transparent machen und Bestände/Bestellmengen optimieren.' },
  wms: { zweck: 'Operatives Lager: Lagerplätze, Wareneingang, Kommissionierung, Umlagern und Bewegungsprotokoll.', zielgruppe: 'Lager / Logistik.', mehrwert: 'Bestände platzgenau führen und Buchungen nachvollziehen.' },
  lieferant: { zweck: 'Lieferanten-Lebenszyklus und -Risiken.', zielgruppe: 'Einkauf.', mehrwert: 'Lieferantenbasis aktiv steuern.' },
  auftrag: { zweck: 'Order-to-Cash-Prozess mit Engpassanalyse.', zielgruppe: 'Vertrieb / Finanzen.', mehrwert: 'Durchlaufzeiten verkürzen, Cash beschleunigen.' },
  forderungen: { zweck: 'Forderungs-Aging, DSO und Ausfallrisiko.', zielgruppe: 'Finanzen / Risiko.', mehrwert: 'Liquidität sichern, Ausfälle vermeiden.' },
  // ---- Analyse & Steuerung ----
  bi: { zweck: 'Self-Service-BI für freie Auswertungen.', zielgruppe: 'Alle.', mehrwert: 'Ad-hoc-Analysen ohne IT.' },
  abweichung: { zweck: 'Plan/Ist-Abweichung, aufgeteilt in Preis- und Mengeneffekt.', zielgruppe: 'Controlling.', mehrwert: 'Ursachen von Abweichungen erkennen.' },
  vergleich: { zweck: 'Versionsvergleich (Plan/Forecast/Ist).', zielgruppe: 'Controlling.', mehrwert: 'Stände sauber gegenüberstellen.' },
  qc: { zweck: 'Querchecks / Datenqualitätsprüfungen.', zielgruppe: 'Controlling / IT.', mehrwert: 'Fehler vor dem Reporting finden.' },
  abstimmung: { zweck: 'Abstimmbrücken zwischen FiBu und Controlling.', zielgruppe: 'Rechnungswesen.', mehrwert: 'Differenzen erklären und schließen.' },
  lebenszyklus: { zweck: 'Produkt- und Kunden-Lebenszyklus mit Phasen.', zielgruppe: 'Vertrieb / Marketing.', mehrwert: 'Phasengerechte Strategie je Produkt/Kunde.' },
  lzempfehlung: { zweck: 'Automatische Empfehlungen + Maßnahmen aus den Lebenszyklen.', zielgruppe: 'Vertrieb / Controlling.', mehrwert: 'Risiken/Chancen direkt in Maßnahmen überführen.' },
  anlagen: { zweck: 'Anlagen-Lebenszyklus inkl. kalkulatorischer Abschreibung.', zielgruppe: 'Finanzen / Controlling.', mehrwert: 'Investitions- und Ersatzsteuerung.' },
  technologie: { zweck: 'Technologie-Reifegrad & F&E-Portfolio.', zielgruppe: 'GF / F&E.', mehrwert: 'Innovationspipeline bewerten und priorisieren.' },
  mitarbeiter: { zweck: 'Mitarbeiter-Lebenszyklus (HR).', zielgruppe: 'HR / Personalcontrolling.', mehrwert: 'Bindung & Fluktuation steuern.' },
  massnahmen: { zweck: 'Maßnahmen-Nachverfolgung (SMART, mit Owner/Frist).', zielgruppe: 'Alle Führungskräfte.', mehrwert: 'Vom Bericht zur umgesetzten Maßnahme.' },
  instrumente: { zweck: 'Übersicht der Controlling-Instrumente.', zielgruppe: 'Controlling.', mehrwert: 'Das passende Instrument je Fragestellung.' },
  alerts: { zweck: 'Frühwarnungen bei kritischen Kennzahlen.', zielgruppe: 'Alle.', mehrwert: 'Rechtzeitig gegensteuern.' },
  zeit: { zweck: 'Zeit & Datenart umschalten (Ist/Plan/Forecast/Tagesreporting).', zielgruppe: 'Alle.', mehrwert: 'Berichte aus verschiedenen Datensichten lesen.' },
  // ---- Lernen & Wissen ----
  lernpfad: { zweck: 'Geführter Lernweg durch Controlling & Kostenrechnung.', zielgruppe: 'Neue Anwender, alle.', mehrwert: 'Wissen aufbauen, mit Quiz & Zertifikat.' },
  doku: { zweck: 'Durchsuchbares Wissens-/Doku-Nachschlagewerk.', zielgruppe: 'Alle.', mehrwert: 'Themen schnell nachlesen.' },
  controlling: { zweck: 'Controlling-Struktur & Teilgebiete.', zielgruppe: 'Alle / Einarbeitung.', mehrwert: 'Das Big Picture verstehen.' },
  klrablauf: { zweck: 'KLR-Ablauf als roter Faden mit echten Werten.', zielgruppe: 'Einarbeitung / Controlling.', mehrwert: 'Zusammenhänge der Kostenrechnung nachvollziehen.' },
  ablaufdiagramm: { zweck: 'Interaktives Prozess-/Ablaufdiagramm.', zielgruppe: 'Alle.', mehrwert: 'Prozesse klickbar verstehen.' },
  // ---- Verwaltung ----
  abschluss: { zweck: 'Abschluss & Versionierung der Berichte.', zielgruppe: 'Rechnungswesen.', mehrwert: 'Sauberer, nachvollziehbarer Periodenabschluss.' },
  verteiler: { zweck: 'Geplanter, automatischer Versand von Berichten.', zielgruppe: 'Controlling / Assistenz.', mehrwert: 'Die richtigen Berichte automatisch verteilen.' },
  transport: { zweck: 'Transport von Berichten zwischen dev/test/prod.', zielgruppe: 'Admin / Power-User.', mehrwert: 'Berichte kontrolliert ausrollen.' },
  wizard: { zweck: 'Ersteinrichtung der Anwendung.', zielgruppe: 'Admin.', mehrwert: 'System sauber konfigurieren.' },
  admin: { zweck: 'Admin-Bereich: Logo, Themes, Branding.', zielgruppe: 'Admin.', mehrwert: 'Die App an Anlässe/Marke anpassen.' },
  nutzung: { zweck: 'Nutzungs-Statistik: Aufrufe, eindeutige & aktive User.', zielgruppe: 'Admin.', mehrwert: 'Das Reporting datenbasiert verbessern.' },
  rechte: { zweck: 'Rollen & Rechte verwalten (Bereiche, geschützte KPIs, Mitglieder).', zielgruppe: 'Admin.', mehrwert: 'Sichtbarkeit & Schutz zentral steuern.' }
}

export const infoVon = (view) => BERICHT_INFO[view] || null
