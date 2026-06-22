// =========================================================================
//  KPI-/SPALTEN-GLOSSAR — erklärt die Kürzel in den Detaillisten.
//  Hover am Spaltenkopf zeigt Vollname + Kurzerläuterung; von dort führt ein
//  Link zur ausführlichen Beschreibung (inkl. KPI-Definition, falls verknüpft).
// =========================================================================
import { KPI } from './kpiRegistry.js'

export const GLOSSAR = {
  // Bestand / Artikel
  sku: { name: 'Artikelnummer (SKU)', kurz: 'Eindeutige Lager-/Artikelkennung (Stock Keeping Unit).', lang: 'Die SKU identifiziert einen Artikel eindeutig über alle Listen hinweg und ist der zentrale Verknüpfungsschlüssel zu Produkt-, Chargen-, Bestell- und Inventurdaten.' },
  lbEff: { name: 'Lagerbestand effektiv', kurz: 'Physisch im Lager vorhandene Menge – inkl. gesperrter und kommissionierter Ware.', lang: 'Der effektive Lagerbestand ist die real eingelagerte Menge laut Bestandsführung, bevor Sperren und Reservierungen abgezogen werden.' },
  gesp: { name: 'Gesperrter Bestand', kurz: 'Bestand mit Qualitäts-/Buchungssperre – nicht verfügbar.', lang: 'Gesperrte Ware ist physisch vorhanden, darf aber nicht verkauft/kommissioniert werden (z. B. QS-Prüfung, Reklamation, Inventurklärung).' },
  kom: { name: 'Kommissionierter Bestand', kurz: 'Für offene Aufträge reservierte, bereits gepickte Menge.', lang: 'Kommissionierte Ware ist Aufträgen fest zugeordnet und steht dem freien Verkauf nicht mehr zur Verfügung.' },
  lbVerf: { name: 'Verfügbarer Lagerbestand', kurz: 'Frei verkaufbar = Effektiv − Gesperrt − Kommissioniert.', formelText: 'LB Verf = LB Eff − GESP − KOM', lang: 'Die zentrale Dispositionsgröße: nur dieser Bestand kann neuen Aufträgen zugesagt werden. Negative Werte sind ein Alarmsignal (Überverkauf).' },
  ae: { name: 'Auftragseingang (offen)', kurz: 'Noch nicht ausgelieferte, bestellte Menge aus Kundenaufträgen.', lang: 'Offener Auftragseingang zeigt den künftigen Lieferdruck und ist Basis der Verfügbarkeitsplanung.' },
  fc: { name: 'Forecast / Bedarfsprognose', kurz: 'Erwarteter künftiger Bedarf (Planmenge).', lang: 'Der Forecast steuert Nachbestellung und Produktion; Abweichungen zwischen FC und Absatz sind ein Qualitätsmaß der Planung.' },
  vk: { name: 'Verkaufspreis (netto)', kurz: 'Netto-Verkaufs-/Listenpreis je Einheit bzw. Σ Umsatz.', lang: 'Grundlage der Erlös- und Margenrechnung. In Auftragslisten als Summe über alle Positionen ausgewiesen.' },
  ek: { name: 'Einkaufspreis (netto)', kurz: 'Netto-Beschaffungskosten je Einheit.', kpiId: 'wareneinsatz', lang: 'Der Einkaufspreis bestimmt zusammen mit dem VK die Marge und fließt in den Wareneinsatz (COGS) ein.' },
  marge: { name: 'Marge (absolut)', kurz: 'Rohertrag je Einheit = VK − EK.', formelText: 'Marge = VK − EK', lang: 'Der absolute Deckungsbeitrag je Stück vor anteiligen Gemeinkosten.' },
  margePct: { name: 'Margenquote', kurz: 'Marge in % vom Verkaufspreis.', formelText: 'Marge % = (VK − EK) / VK', kpiId: 'dbQuote', lang: 'Die relative Marge macht Artikel unterschiedlicher Preislagen vergleichbar und ist die zentrale Rentabilitätskennzahl je Artikel.' },
  // Auftrag
  ab: { name: 'Auftragsbestätigte Menge', kurz: 'Summe der bestätigten Auftragsmengen (Σ AB).', lang: 'Menge, für die eine Auftragsbestätigung an den Kunden erging.' },
  aeb: { name: 'Auftragseingang bewertet', kurz: 'Bewerteter (€) offener Auftragseingang (Σ AEB).', lang: 'Der offene Auftragseingang zu Verkaufspreisen – zeigt das gebundene Umsatzvolumen.' },
  ret: { name: 'Retouren', kurz: 'Zurückgesendete Menge/Wert (Σ RET).', kpiId: 'erloesschmaelerung', lang: 'Retouren mindern den Nettoumsatz (Erlösschmälerung) und sind ein Qualitäts-/Zufriedenheitsindikator.' },
  aet: { name: 'Auslieferung (transaktional)', kurz: 'Tatsächlich ausgelieferte Menge (Σ AET).', lang: 'Die effektiv fakturierte/ausgelieferte Menge, Basis der Umsatzrealisierung.' },
  mek: { name: 'Materialeinkaufswert', kurz: 'Summe Einkaufs-/Materialwert (Σ MEK).', kpiId: 'wareneinsatz', lang: 'Der bewertete Materialeinsatz der Position – Gegenstück zum Umsatz bei der DB-Rechnung.' },
  abs: { name: 'Absatz', kurz: 'Verkaufte/abgesetzte Menge in der Periode.', lang: 'Mengengerüst des Umsatzes, unabhängig vom Preis.' },
  ue: { name: 'Umsatzerlös', kurz: 'Netto-Umsatz aus den Positionen (Σ UE).', kpiId: 'nettoumsatz', lang: 'Der realisierte Nettoumsatz – konsolidiert die zentrale Top-Line-Kennzahl.' },
  anzeigeWert: { name: 'Anzeigewert (führend)', kurz: 'Der eine, entdoppelte Leasingwert je Vorgang.', lang: 'Aus den drei Leasingbelegen (Angebot/Kundenleasing/Leasinggesellschaft) wird je Sicht genau ein führender Wert gewählt, damit Werte nie doppelt zählen.' },
  // Quoten / Kaufmännisches
  reklamationsQuote: { name: 'Reklamationsquote', kurz: 'Anteil reklamierter Lieferungen je Lieferant.', lang: 'Misst die Lieferqualität; hohe Werte sind ein Risiko für Versorgung und Kundenzufriedenheit.' },
  retourenQuote: { name: 'Retourenquote', kurz: 'Anteil retournierter Bestellungen je Kanal.', lang: 'Kanalabhängig stark unterschiedlich (online > stationär); Treiber für Erlösschmälerung und Prozesskosten.' },
  stornoQuote: { name: 'Stornoquote', kurz: 'Anteil stornierter Bestellungen je Kanal.', lang: 'Hohe Stornoquoten deuten auf Verfügbarkeits-, Preis- oder Prozessprobleme hin.' },
  mahnstufe: { name: 'Mahnstufe', kurz: 'Eskalationsstufe im Forderungsmanagement (0–3).', lang: 'Stufe 3 ist die höchste Mahnstufe vor Inkasso/Wertberichtigung – Risiko für den Zahlungseingang.' },
  mhd: { name: 'Mindesthaltbarkeitsdatum', kurz: 'Datum, bis zu dem die Charge verkäuflich ist.', lang: 'Abgelaufene Chargen müssen gesperrt/abgeschrieben werden; bald ablaufende benötigen Abverkaufssteuerung.' },
  // Kontenstamm (DimKonto)
  klasse: { name: 'Kontenklasse', kurz: 'SKR-Klasse 0–9 des Sachkontos.', lang: 'Die Kontenklasse ordnet das Konto grob ein: 0–2 Bilanz (Anlagen/Kapital/Umlauf), 3 Wareneingang/Bestand, 4–7 Aufwand, 8 Erlöse, 9 Abschluss. Sie muss zur GuV-/Bilanz-Zuordnung passen.' },
  guvBilanz: { name: 'GuV-/Bilanz-Zuordnung', kurz: 'Gehört das Konto in die GuV oder in die Bilanz (Aktiv/Passiv)?', lang: 'Steuert, in welchem Abschlussteil der Saldo erscheint. Ein Widerspruch zwischen Zuordnung und Kontenklasse ist ein Datenfehler.' },
  kostenart: { name: 'Kostenart-Zuordnung', kurz: 'Verknüpfung des Kontos zur Kostenartenrechnung.', lang: 'GuV-Aufwandskonten ohne Kostenart-Zuordnung fehlen in der KLR — die Kostenartenrechnung wird dadurch unvollständig.' },
  abstimmposition: { name: 'Abstimmposition', kurz: 'Mapping des Kontos auf eine Position der Abstimmbrücke.', lang: 'Verbindet FiBu-Salden mit der Controlling-Abstimmung (MapKontoPosition). Ohne Zuordnung kann das Konto nicht gegen die KPIs abgestimmt werden.' },
  steuerschluessel: { name: 'Steuerschlüssel', kurz: 'USt-/VSt-Kennzeichen des Kontos.', lang: 'Bestimmt die automatische Steuerermittlung bei der Buchung; bei Erlös-/Aufwandskonten i. d. R. zwingend.' }
}

/** Glossareintrag zu einer Spalte (oder null). */
export function glossarFuer(key) { return GLOSSAR[key] || null }

/** Ausführliche Beschreibung zusammenstellen (Glossar + ggf. KPI-Definition). */
export function ausfuehrlich(key) {
  const g = GLOSSAR[key]
  if (!g) return null
  const kpi = g.kpiId ? KPI[g.kpiId] : null
  return {
    name: g.name,
    kurz: g.kurz,
    lang: g.lang || g.kurz,
    formelText: g.formelText || null,
    kpi: kpi ? { id: kpi.id, name: kpi.name, beschreibung: kpi.beschreibung, einheit: kpi.einheit, ziel: kpi.ziel, richtung: kpi.richtung, abhaengig: kpi.abhaengig || [] } : null
  }
}
