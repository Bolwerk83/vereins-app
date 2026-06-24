// =========================================================================
//  DATENSCHEMA (DWH) — die EINE Wahrheit über die Tabellenstruktur, die das
//  Reporting später befüllt. Star-Schema: Dimensionen + Faktentabellen.
//  Deckt alle gebauten Domänen ab: Verkauf/DB, Wareneingang, Auftragsbestand,
//  Bestand, Forderungen, Zahlungsfluss, Filial-Frequenz, Web/GA, Plan
//  (Plankalender) und KPI-Werte.
//
//  Spalten-Kurznotation: { n:Name, t:MSSQL-Typ, pk?, fk?:'DimX.Col',
//  null?:true, biz?:true (Geschäftsschlüssel für Delta-Merge) }.
//  Der SQL-Generator (sqlGenerator.js) erzeugt daraus DDL/Seed/Delta für
//  MSSQL und Postgres (Vercel).
// =========================================================================

const audit = [
  { n: 'QuelleSystem', t: 'nvarchar(40)', null: true },
  { n: 'LadeBatchKey', t: 'bigint', null: true },
  { n: 'AktualisiertAm', t: 'datetime2', null: true }, // Wasserzeichen für Delta-Beladung
]

// Versions-/Bearbeitungsspalten für OPTIMISTISCHES SPERREN — in JEDER Tabelle.
// RowVersion wird bei jeder Änderung hochgezählt; wer speichert, muss die beim
// Lesen gesehene Version mitschicken (Konflikt, wenn inzwischen erhöht).
// GeaendertVon/-Am dokumentieren wer/wann (das „Was" steckt in der Historie).
const versionierung = [
  { n: 'RowVersion', t: 'bigint', null: true },        // optimistic-lock Stempel (Start 1, +1 je Update)
  { n: 'GeaendertVon', t: 'nvarchar(80)', null: true },
  { n: 'GeaendertAm', t: 'datetime2', null: true },
]

export const DIMENSIONEN = [
  { name: 'DimDatum', beschreibung: 'Kalendertag mit Zeitintelligenz (Jahr/Quartal/Monat/Woche, Feiertag, YTD).', spalten: [
    { n: 'DatumKey', t: 'int', pk: true }, { n: 'Datum', t: 'date', biz: true },
    { n: 'Jahr', t: 'smallint' }, { n: 'Quartal', t: 'tinyint' }, { n: 'Monat', t: 'tinyint' }, { n: 'MonatName', t: 'nvarchar(20)' },
    { n: 'Woche', t: 'tinyint' }, { n: 'Wochentag', t: 'tinyint' }, { n: 'WochentagName', t: 'nvarchar(10)' },
    { n: 'IstWochenende', t: 'bit' }, { n: 'IstFeiertag', t: 'bit' }, { n: 'FeiertagName', t: 'nvarchar(40)', null: true }, { n: 'TagImJahr', t: 'smallint' },
  ] },
  { name: 'DimKalender', beschreibung: 'Plankalender-Gewicht je Kategorie und Tag (Fixkosten/Filiale/Onlineshop/Werktage).', spalten: [
    { n: 'KalenderKey', t: 'int', pk: true }, { n: 'KalenderId', t: 'nvarchar(30)', biz: true }, { n: 'KalenderName', t: 'nvarchar(60)' },
    { n: 'DatumKey', t: 'int', fk: 'DimDatum.DatumKey', biz: true }, { n: 'Gewicht', t: 'decimal(4,2)' },
  ] },
  { name: 'DimWarengruppe', beschreibung: 'Warengruppen / Bereiche.', spalten: [
    { n: 'WarengruppeKey', t: 'int', pk: true }, { n: 'WarengruppeId', t: 'nvarchar(30)', biz: true }, { n: 'Bezeichnung', t: 'nvarchar(80)' }, { n: 'Bereich', t: 'nvarchar(20)' },
  ] },
  { name: 'DimProdukt', beschreibung: 'Artikelstamm.', spalten: [
    { n: 'ProduktKey', t: 'int', pk: true }, { n: 'ArtikelNr', t: 'nvarchar(40)', biz: true }, { n: 'Bezeichnung', t: 'nvarchar(120)' },
    { n: 'WarengruppeKey', t: 'int', fk: 'DimWarengruppe.WarengruppeKey' }, { n: 'Marke', t: 'nvarchar(60)', null: true }, { n: 'IstEBike', t: 'bit' },
    { n: 'Listenpreis', t: 'decimal(18,2)', null: true }, { n: 'Standardkosten', t: 'decimal(18,2)', null: true },
    { n: 'BildUrl', t: 'nvarchar(300)', null: true }, // Artikelbild für die Artikelkarte (falls hinterlegt)
  ] },
  { name: 'DimStandort', beschreibung: 'Filialen, Onlineshop, Zentrale (Profit-Center).', spalten: [
    { n: 'StandortKey', t: 'int', pk: true }, { n: 'StandortId', t: 'nvarchar(30)', biz: true }, { n: 'Name', t: 'nvarchar(80)' },
    { n: 'Typ', t: 'nvarchar(20)' }, { n: 'Region', t: 'nvarchar(40)', null: true }, { n: 'FlaecheQm', t: 'int', null: true }, { n: 'OeffnungKalenderId', t: 'nvarchar(30)', null: true },
  ] },
  { name: 'DimKanal', beschreibung: 'Vertriebs-/Marketingkanal (für Web/GA & Verkauf).', spalten: [
    { n: 'KanalKey', t: 'int', pk: true }, { n: 'KanalId', t: 'nvarchar(30)', biz: true }, { n: 'Kanal', t: 'nvarchar(60)' }, { n: 'Kanalgruppe', t: 'nvarchar(30)' },
  ] },
  { name: 'DimKunde', beschreibung: 'Kundenstamm (B2C/B2B), für Forderungen & Webshop.', spalten: [
    { n: 'KundeKey', t: 'int', pk: true }, { n: 'KundeId', t: 'nvarchar(40)', biz: true }, { n: 'Segment', t: 'nvarchar(20)' },
    { n: 'PLZ', t: 'nvarchar(10)', null: true }, { n: 'Land', t: 'nvarchar(40)', null: true }, { n: 'IstNeukunde', t: 'bit' }, { n: 'Bonitaet', t: 'nvarchar(10)', null: true },
  ] },
  { name: 'DimLieferant', beschreibung: 'Lieferantenstamm (Wareneingang, Zahlungsausgang).', spalten: [
    { n: 'LieferantKey', t: 'int', pk: true }, { n: 'LieferantId', t: 'nvarchar(40)', biz: true }, { n: 'Name', t: 'nvarchar(80)' }, { n: 'Land', t: 'nvarchar(40)', null: true }, { n: 'ZahlungszielTage', t: 'smallint', null: true },
  ] },
  { name: 'DimKonditionsart', beschreibung: 'Geschäfts-/Konditionsart — Sonderfälle für die faire DB (Sponsoring 100%, Aktion, Muster, Personal/IC).', spalten: [
    { n: 'KonditionsartKey', t: 'int', pk: true }, { n: 'KonditionsartId', t: 'nvarchar(30)', biz: true }, { n: 'Bezeichnung', t: 'nvarchar(80)' }, { n: 'IstSonderfall', t: 'bit' }, { n: 'RabattProzent', t: 'decimal(5,2)', null: true },
  ] },
  { name: 'DimKPI', beschreibung: 'KPI-Metadaten (Spiegel der kpiRegistry) für FactKPIWert.', spalten: [
    { n: 'KPIKey', t: 'int', pk: true }, { n: 'KPIId', t: 'nvarchar(60)', biz: true }, { n: 'Name', t: 'nvarchar(120)' }, { n: 'Einheit', t: 'nvarchar(20)' }, { n: 'Bereich', t: 'nvarchar(20)' }, { n: 'Richtung', t: 'nvarchar(12)' }, { n: 'Ziel', t: 'decimal(18,4)', null: true },
  ] },
]

export const FAKTEN = [
  { name: 'FactVerkauf', beschreibung: 'Verkaufspositionen (Order-to-Cash). Grain: Beleg + Position. Basis für Umsatz, DB, faire DB.', spalten: [
    { n: 'VerkaufKey', t: 'bigint', pk: true }, { n: 'BelegNr', t: 'nvarchar(30)', biz: true }, { n: 'Position', t: 'int', biz: true },
    { n: 'DatumKey', t: 'int', fk: 'DimDatum.DatumKey' }, { n: 'LieferDatumKey', t: 'int', fk: 'DimDatum.DatumKey' },
    { n: 'ProduktKey', t: 'int', fk: 'DimProdukt.ProduktKey' }, { n: 'StandortKey', t: 'int', fk: 'DimStandort.StandortKey' },
    { n: 'KanalKey', t: 'int', fk: 'DimKanal.KanalKey' }, { n: 'KundeKey', t: 'int', fk: 'DimKunde.KundeKey' }, { n: 'KonditionsartKey', t: 'int', fk: 'DimKonditionsart.KonditionsartKey' },
    { n: 'Menge', t: 'int' }, { n: 'Bruttoumsatz', t: 'decimal(18,2)' }, { n: 'Erloesschmaelerung', t: 'decimal(18,2)' }, { n: 'Nettoumsatz', t: 'decimal(18,2)' }, { n: 'Wareneinsatz', t: 'decimal(18,2)' }, { n: 'DB1', t: 'decimal(18,2)' },
  ] },
  { name: 'FactWareneingang', beschreibung: 'Bestellungen Einkauf nach Lieferdatum (Warenfluss-Eingang).', spalten: [
    { n: 'WareneingangKey', t: 'bigint', pk: true }, { n: 'BestellNr', t: 'nvarchar(30)', biz: true }, { n: 'Position', t: 'int', biz: true },
    { n: 'LieferDatumKey', t: 'int', fk: 'DimDatum.DatumKey' }, { n: 'ProduktKey', t: 'int', fk: 'DimProdukt.ProduktKey' }, { n: 'LieferantKey', t: 'int', fk: 'DimLieferant.LieferantKey' }, { n: 'StandortKey', t: 'int', fk: 'DimStandort.StandortKey' },
    { n: 'Menge', t: 'int' }, { n: 'Einstandswert', t: 'decimal(18,2)' }, { n: 'Status', t: 'nvarchar(20)' },
  ] },
  { name: 'FactAuftrag', beschreibung: 'Auftragsbestand: Eingang & Auslieferung nach Lieferdatum.', spalten: [
    { n: 'AuftragKey', t: 'bigint', pk: true }, { n: 'AuftragNr', t: 'nvarchar(30)', biz: true }, { n: 'Position', t: 'int', biz: true },
    { n: 'EingangDatumKey', t: 'int', fk: 'DimDatum.DatumKey' }, { n: 'LieferDatumKey', t: 'int', fk: 'DimDatum.DatumKey' }, { n: 'ProduktKey', t: 'int', fk: 'DimProdukt.ProduktKey' }, { n: 'KundeKey', t: 'int', fk: 'DimKunde.KundeKey' },
    { n: 'Menge', t: 'int' }, { n: 'Auftragswert', t: 'decimal(18,2)' }, { n: 'Status', t: 'nvarchar(20)' },
  ] },
  { name: 'FactBestand', beschreibung: 'Bestands-Snapshot je Tag/Standort/Produkt (Warenfluss-Bestand).', spalten: [
    { n: 'BestandKey', t: 'bigint', pk: true }, { n: 'DatumKey', t: 'int', fk: 'DimDatum.DatumKey', biz: true }, { n: 'StandortKey', t: 'int', fk: 'DimStandort.StandortKey', biz: true }, { n: 'ProduktKey', t: 'int', fk: 'DimProdukt.ProduktKey', biz: true },
    { n: 'BestandMenge', t: 'int' }, { n: 'Bestandswert', t: 'decimal(18,2)' }, { n: 'ReichweiteTage', t: 'int', null: true },
  ] },
  { name: 'FactForderung', beschreibung: 'Offene Posten / Forderungs-Aging (DSO, überfällig, Ausfall).', spalten: [
    { n: 'ForderungKey', t: 'bigint', pk: true }, { n: 'BelegNr', t: 'nvarchar(30)', biz: true }, { n: 'StichtagKey', t: 'int', fk: 'DimDatum.DatumKey', biz: true }, { n: 'KundeKey', t: 'int', fk: 'DimKunde.KundeKey' },
    { n: 'FaelligkeitKey', t: 'int', fk: 'DimDatum.DatumKey' }, { n: 'OffenerBetrag', t: 'decimal(18,2)' }, { n: 'TageUeberfaellig', t: 'int' }, { n: 'Mahnstufe', t: 'tinyint' }, { n: 'ErwarteterAusfall', t: 'decimal(18,2)' },
  ] },
  { name: 'FactZahlung', beschreibung: 'Zahlungsfluss (Liquidität): Ein-/Ausgänge nach Fälligkeit.', spalten: [
    { n: 'ZahlungKey', t: 'bigint', pk: true }, { n: 'Referenz', t: 'nvarchar(40)', biz: true }, { n: 'FaelligDatumKey', t: 'int', fk: 'DimDatum.DatumKey' }, { n: 'Richtung', t: 'nvarchar(10)' }, { n: 'Kategorie', t: 'nvarchar(40)' }, { n: 'Betrag', t: 'decimal(18,2)' }, { n: 'IstProg', t: 'nvarchar(10)' },
  ] },
  { name: 'FactBesuch', beschreibung: 'Filial-Frequenz (Footfall) je Tag/Stunde/Standort — für Conversion & Personalbedarf.', spalten: [
    { n: 'BesuchKey', t: 'bigint', pk: true }, { n: 'DatumKey', t: 'int', fk: 'DimDatum.DatumKey', biz: true }, { n: 'Stunde', t: 'tinyint', biz: true }, { n: 'StandortKey', t: 'int', fk: 'DimStandort.StandortKey', biz: true },
    { n: 'Besucher', t: 'int' }, { n: 'Kaeufe', t: 'int' }, { n: 'Umsatz', t: 'decimal(18,2)' },
  ] },
  { name: 'FactWebSession', beschreibung: 'Web-/GA-Sitzungen je Tag/Kanal/Gerät (Sessions, Users, Bounce, Dauer).', spalten: [
    { n: 'WebSessionKey', t: 'bigint', pk: true }, { n: 'DatumKey', t: 'int', fk: 'DimDatum.DatumKey', biz: true }, { n: 'KanalKey', t: 'int', fk: 'DimKanal.KanalKey', biz: true }, { n: 'Geraet', t: 'nvarchar(20)', biz: true },
    { n: 'Sitzungen', t: 'int' }, { n: 'Nutzer', t: 'int' }, { n: 'NeueNutzer', t: 'int' }, { n: 'Seitenaufrufe', t: 'int' }, { n: 'AbsprungProzent', t: 'decimal(5,2)' }, { n: 'DauerSek', t: 'int' },
  ] },
  { name: 'FactWebFunnel', beschreibung: 'Webshop-Funnel je Tag/Kanal: Schritt-Zahlen (Sitzung→Produkt→Warenkorb→Checkout→Kauf) + Onsite-Suche.', spalten: [
    { n: 'WebFunnelKey', t: 'bigint', pk: true }, { n: 'DatumKey', t: 'int', fk: 'DimDatum.DatumKey', biz: true }, { n: 'KanalKey', t: 'int', fk: 'DimKanal.KanalKey', biz: true },
    { n: 'Sitzungen', t: 'int' }, { n: 'Produktansichten', t: 'int' }, { n: 'WarenkorbAdds', t: 'int' }, { n: 'CheckoutStarts', t: 'int' }, { n: 'Kaeufe', t: 'int' }, { n: 'Umsatz', t: 'decimal(18,2)' }, { n: 'SucheOhneTreffer', t: 'int' },
  ] },
  { name: 'FactPlan', beschreibung: 'Plan/Budget je KPI und Monat, optional Plankalender für Tagesverteilung.', spalten: [
    { n: 'PlanKey', t: 'bigint', pk: true }, { n: 'KPIKey', t: 'int', fk: 'DimKPI.KPIKey', biz: true }, { n: 'Jahr', t: 'smallint', biz: true }, { n: 'Monat', t: 'tinyint', biz: true },
    { n: 'StandortKey', t: 'int', fk: 'DimStandort.StandortKey', null: true }, { n: 'KalenderId', t: 'nvarchar(30)', null: true }, { n: 'Planwert', t: 'decimal(18,4)' },
  ] },
  { name: 'FactKPIWert', beschreibung: 'Gemessene KPI-Ist-Werte je Periode (Spiegel des SQL-Vertrags sql/<sqlRef>.kpi.sql).', spalten: [
    { n: 'KPIWertKey', t: 'bigint', pk: true }, { n: 'KPIKey', t: 'int', fk: 'DimKPI.KPIKey', biz: true }, { n: 'Periode', t: 'nvarchar(10)', biz: true }, { n: 'Dimension', t: 'nvarchar(60)', null: true, biz: true }, { n: 'Wert', t: 'decimal(18,4)' },
  ] },
]

// Audit-Spalten an jede Faktentabelle anhängen (Delta-Beladung).
FAKTEN.forEach((f) => { f.spalten = [...f.spalten, ...audit] })

// Versions-/Bearbeitungsspalten an ALLE Tabellen (Dimensionen + Fakten)
// anhängen — optimistisches Sperren gilt durchgängig, nicht nur beim Artikel.
;[...DIMENSIONEN, ...FAKTEN].forEach((t) => { t.spalten = [...t.spalten, ...versionierung] })

export const TABELLEN = [...DIMENSIONEN, ...FAKTEN]
export const SCHEMA_VERSION = '1.1.0' // +RowVersion/GeaendertVon/-Am in allen Tabellen, DimProdukt.BildUrl
export const AUDIT_SPALTEN = audit.map((s) => s.n)
export const VERSIONS_SPALTEN = versionierung.map((s) => s.n)
