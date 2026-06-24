-- ============================================================
-- Enterprise Report — DWH-Setup (mssql) · Schema 1.0.0
-- Reihenfolge: Dimensionen, dann Fakten, dann Beziehungen.
-- ============================================================

-- DimDatum: Kalendertag mit Zeitintelligenz (Jahr/Quartal/Monat/Woche, Feiertag, YTD).
IF OBJECT_ID(N'DimDatum') IS NULL
CREATE TABLE DimDatum (
  DatumKey int NOT NULL,
  Datum date NOT NULL,
  Jahr smallint NOT NULL,
  Quartal tinyint NOT NULL,
  Monat tinyint NOT NULL,
  MonatName nvarchar(20) NOT NULL,
  Woche tinyint NOT NULL,
  Wochentag tinyint NOT NULL,
  WochentagName nvarchar(10) NOT NULL,
  IstWochenende bit NOT NULL,
  IstFeiertag bit NOT NULL,
  FeiertagName nvarchar(40),
  TagImJahr smallint NOT NULL,
  CONSTRAINT PK_DimDatum PRIMARY KEY (DatumKey)
);

-- DimKalender: Plankalender-Gewicht je Kategorie und Tag (Fixkosten/Filiale/Onlineshop/Werktage).
IF OBJECT_ID(N'DimKalender') IS NULL
CREATE TABLE DimKalender (
  KalenderKey int NOT NULL,
  KalenderId nvarchar(30) NOT NULL,
  KalenderName nvarchar(60) NOT NULL,
  DatumKey int NOT NULL,
  Gewicht decimal(4,2) NOT NULL,
  CONSTRAINT PK_DimKalender PRIMARY KEY (KalenderKey)
);

-- DimWarengruppe: Warengruppen / Bereiche.
IF OBJECT_ID(N'DimWarengruppe') IS NULL
CREATE TABLE DimWarengruppe (
  WarengruppeKey int NOT NULL,
  WarengruppeId nvarchar(30) NOT NULL,
  Bezeichnung nvarchar(80) NOT NULL,
  Bereich nvarchar(20) NOT NULL,
  CONSTRAINT PK_DimWarengruppe PRIMARY KEY (WarengruppeKey)
);

-- DimProdukt: Artikelstamm.
IF OBJECT_ID(N'DimProdukt') IS NULL
CREATE TABLE DimProdukt (
  ProduktKey int NOT NULL,
  ArtikelNr nvarchar(40) NOT NULL,
  Bezeichnung nvarchar(120) NOT NULL,
  WarengruppeKey int NOT NULL,
  Marke nvarchar(60),
  IstEBike bit NOT NULL,
  Listenpreis decimal(18,2),
  Standardkosten decimal(18,2),
  CONSTRAINT PK_DimProdukt PRIMARY KEY (ProduktKey)
);

-- DimStandort: Filialen, Onlineshop, Zentrale (Profit-Center).
IF OBJECT_ID(N'DimStandort') IS NULL
CREATE TABLE DimStandort (
  StandortKey int NOT NULL,
  StandortId nvarchar(30) NOT NULL,
  Name nvarchar(80) NOT NULL,
  Typ nvarchar(20) NOT NULL,
  Region nvarchar(40),
  FlaecheQm int,
  OeffnungKalenderId nvarchar(30),
  CONSTRAINT PK_DimStandort PRIMARY KEY (StandortKey)
);

-- DimKanal: Vertriebs-/Marketingkanal (für Web/GA & Verkauf).
IF OBJECT_ID(N'DimKanal') IS NULL
CREATE TABLE DimKanal (
  KanalKey int NOT NULL,
  KanalId nvarchar(30) NOT NULL,
  Kanal nvarchar(60) NOT NULL,
  Kanalgruppe nvarchar(30) NOT NULL,
  CONSTRAINT PK_DimKanal PRIMARY KEY (KanalKey)
);

-- DimKunde: Kundenstamm (B2C/B2B), für Forderungen & Webshop.
IF OBJECT_ID(N'DimKunde') IS NULL
CREATE TABLE DimKunde (
  KundeKey int NOT NULL,
  KundeId nvarchar(40) NOT NULL,
  Segment nvarchar(20) NOT NULL,
  PLZ nvarchar(10),
  Land nvarchar(40),
  IstNeukunde bit NOT NULL,
  Bonitaet nvarchar(10),
  CONSTRAINT PK_DimKunde PRIMARY KEY (KundeKey)
);

-- DimLieferant: Lieferantenstamm (Wareneingang, Zahlungsausgang).
IF OBJECT_ID(N'DimLieferant') IS NULL
CREATE TABLE DimLieferant (
  LieferantKey int NOT NULL,
  LieferantId nvarchar(40) NOT NULL,
  Name nvarchar(80) NOT NULL,
  Land nvarchar(40),
  ZahlungszielTage smallint,
  CONSTRAINT PK_DimLieferant PRIMARY KEY (LieferantKey)
);

-- DimKonditionsart: Geschäfts-/Konditionsart — Sonderfälle für die faire DB (Sponsoring 100%, Aktion, Muster, Personal/IC).
IF OBJECT_ID(N'DimKonditionsart') IS NULL
CREATE TABLE DimKonditionsart (
  KonditionsartKey int NOT NULL,
  KonditionsartId nvarchar(30) NOT NULL,
  Bezeichnung nvarchar(80) NOT NULL,
  IstSonderfall bit NOT NULL,
  RabattProzent decimal(5,2),
  CONSTRAINT PK_DimKonditionsart PRIMARY KEY (KonditionsartKey)
);

-- DimKPI: KPI-Metadaten (Spiegel der kpiRegistry) für FactKPIWert.
IF OBJECT_ID(N'DimKPI') IS NULL
CREATE TABLE DimKPI (
  KPIKey int NOT NULL,
  KPIId nvarchar(60) NOT NULL,
  Name nvarchar(120) NOT NULL,
  Einheit nvarchar(20) NOT NULL,
  Bereich nvarchar(20) NOT NULL,
  Richtung nvarchar(12) NOT NULL,
  Ziel decimal(18,4),
  CONSTRAINT PK_DimKPI PRIMARY KEY (KPIKey)
);

-- FactVerkauf: Verkaufspositionen (Order-to-Cash). Grain: Beleg + Position. Basis für Umsatz, DB, faire DB.
IF OBJECT_ID(N'FactVerkauf') IS NULL
CREATE TABLE FactVerkauf (
  VerkaufKey bigint NOT NULL,
  BelegNr nvarchar(30) NOT NULL,
  Position int NOT NULL,
  DatumKey int NOT NULL,
  LieferDatumKey int NOT NULL,
  ProduktKey int NOT NULL,
  StandortKey int NOT NULL,
  KanalKey int NOT NULL,
  KundeKey int NOT NULL,
  KonditionsartKey int NOT NULL,
  Menge int NOT NULL,
  Bruttoumsatz decimal(18,2) NOT NULL,
  Erloesschmaelerung decimal(18,2) NOT NULL,
  Nettoumsatz decimal(18,2) NOT NULL,
  Wareneinsatz decimal(18,2) NOT NULL,
  DB1 decimal(18,2) NOT NULL,
  QuelleSystem nvarchar(40),
  LadeBatchKey bigint,
  AktualisiertAm datetime2,
  CONSTRAINT PK_FactVerkauf PRIMARY KEY (VerkaufKey)
);

-- FactWareneingang: Bestellungen Einkauf nach Lieferdatum (Warenfluss-Eingang).
IF OBJECT_ID(N'FactWareneingang') IS NULL
CREATE TABLE FactWareneingang (
  WareneingangKey bigint NOT NULL,
  BestellNr nvarchar(30) NOT NULL,
  Position int NOT NULL,
  LieferDatumKey int NOT NULL,
  ProduktKey int NOT NULL,
  LieferantKey int NOT NULL,
  StandortKey int NOT NULL,
  Menge int NOT NULL,
  Einstandswert decimal(18,2) NOT NULL,
  Status nvarchar(20) NOT NULL,
  QuelleSystem nvarchar(40),
  LadeBatchKey bigint,
  AktualisiertAm datetime2,
  CONSTRAINT PK_FactWareneingang PRIMARY KEY (WareneingangKey)
);

-- FactAuftrag: Auftragsbestand: Eingang & Auslieferung nach Lieferdatum.
IF OBJECT_ID(N'FactAuftrag') IS NULL
CREATE TABLE FactAuftrag (
  AuftragKey bigint NOT NULL,
  AuftragNr nvarchar(30) NOT NULL,
  Position int NOT NULL,
  EingangDatumKey int NOT NULL,
  LieferDatumKey int NOT NULL,
  ProduktKey int NOT NULL,
  KundeKey int NOT NULL,
  Menge int NOT NULL,
  Auftragswert decimal(18,2) NOT NULL,
  Status nvarchar(20) NOT NULL,
  QuelleSystem nvarchar(40),
  LadeBatchKey bigint,
  AktualisiertAm datetime2,
  CONSTRAINT PK_FactAuftrag PRIMARY KEY (AuftragKey)
);

-- FactBestand: Bestands-Snapshot je Tag/Standort/Produkt (Warenfluss-Bestand).
IF OBJECT_ID(N'FactBestand') IS NULL
CREATE TABLE FactBestand (
  BestandKey bigint NOT NULL,
  DatumKey int NOT NULL,
  StandortKey int NOT NULL,
  ProduktKey int NOT NULL,
  BestandMenge int NOT NULL,
  Bestandswert decimal(18,2) NOT NULL,
  ReichweiteTage int,
  QuelleSystem nvarchar(40),
  LadeBatchKey bigint,
  AktualisiertAm datetime2,
  CONSTRAINT PK_FactBestand PRIMARY KEY (BestandKey)
);

-- FactForderung: Offene Posten / Forderungs-Aging (DSO, überfällig, Ausfall).
IF OBJECT_ID(N'FactForderung') IS NULL
CREATE TABLE FactForderung (
  ForderungKey bigint NOT NULL,
  BelegNr nvarchar(30) NOT NULL,
  StichtagKey int NOT NULL,
  KundeKey int NOT NULL,
  FaelligkeitKey int NOT NULL,
  OffenerBetrag decimal(18,2) NOT NULL,
  TageUeberfaellig int NOT NULL,
  Mahnstufe tinyint NOT NULL,
  ErwarteterAusfall decimal(18,2) NOT NULL,
  QuelleSystem nvarchar(40),
  LadeBatchKey bigint,
  AktualisiertAm datetime2,
  CONSTRAINT PK_FactForderung PRIMARY KEY (ForderungKey)
);

-- FactZahlung: Zahlungsfluss (Liquidität): Ein-/Ausgänge nach Fälligkeit.
IF OBJECT_ID(N'FactZahlung') IS NULL
CREATE TABLE FactZahlung (
  ZahlungKey bigint NOT NULL,
  Referenz nvarchar(40) NOT NULL,
  FaelligDatumKey int NOT NULL,
  Richtung nvarchar(10) NOT NULL,
  Kategorie nvarchar(40) NOT NULL,
  Betrag decimal(18,2) NOT NULL,
  IstProg nvarchar(10) NOT NULL,
  QuelleSystem nvarchar(40),
  LadeBatchKey bigint,
  AktualisiertAm datetime2,
  CONSTRAINT PK_FactZahlung PRIMARY KEY (ZahlungKey)
);

-- FactBesuch: Filial-Frequenz (Footfall) je Tag/Stunde/Standort — für Conversion & Personalbedarf.
IF OBJECT_ID(N'FactBesuch') IS NULL
CREATE TABLE FactBesuch (
  BesuchKey bigint NOT NULL,
  DatumKey int NOT NULL,
  Stunde tinyint NOT NULL,
  StandortKey int NOT NULL,
  Besucher int NOT NULL,
  Kaeufe int NOT NULL,
  Umsatz decimal(18,2) NOT NULL,
  QuelleSystem nvarchar(40),
  LadeBatchKey bigint,
  AktualisiertAm datetime2,
  CONSTRAINT PK_FactBesuch PRIMARY KEY (BesuchKey)
);

-- FactWebSession: Web-/GA-Sitzungen je Tag/Kanal/Gerät (Sessions, Users, Bounce, Dauer).
IF OBJECT_ID(N'FactWebSession') IS NULL
CREATE TABLE FactWebSession (
  WebSessionKey bigint NOT NULL,
  DatumKey int NOT NULL,
  KanalKey int NOT NULL,
  Geraet nvarchar(20) NOT NULL,
  Sitzungen int NOT NULL,
  Nutzer int NOT NULL,
  NeueNutzer int NOT NULL,
  Seitenaufrufe int NOT NULL,
  AbsprungProzent decimal(5,2) NOT NULL,
  DauerSek int NOT NULL,
  QuelleSystem nvarchar(40),
  LadeBatchKey bigint,
  AktualisiertAm datetime2,
  CONSTRAINT PK_FactWebSession PRIMARY KEY (WebSessionKey)
);

-- FactWebFunnel: Webshop-Funnel je Tag/Kanal: Schritt-Zahlen (Sitzung→Produkt→Warenkorb→Checkout→Kauf) + Onsite-Suche.
IF OBJECT_ID(N'FactWebFunnel') IS NULL
CREATE TABLE FactWebFunnel (
  WebFunnelKey bigint NOT NULL,
  DatumKey int NOT NULL,
  KanalKey int NOT NULL,
  Sitzungen int NOT NULL,
  Produktansichten int NOT NULL,
  WarenkorbAdds int NOT NULL,
  CheckoutStarts int NOT NULL,
  Kaeufe int NOT NULL,
  Umsatz decimal(18,2) NOT NULL,
  SucheOhneTreffer int NOT NULL,
  QuelleSystem nvarchar(40),
  LadeBatchKey bigint,
  AktualisiertAm datetime2,
  CONSTRAINT PK_FactWebFunnel PRIMARY KEY (WebFunnelKey)
);

-- FactPlan: Plan/Budget je KPI und Monat, optional Plankalender für Tagesverteilung.
IF OBJECT_ID(N'FactPlan') IS NULL
CREATE TABLE FactPlan (
  PlanKey bigint NOT NULL,
  KPIKey int NOT NULL,
  Jahr smallint NOT NULL,
  Monat tinyint NOT NULL,
  StandortKey int,
  KalenderId nvarchar(30),
  Planwert decimal(18,4) NOT NULL,
  QuelleSystem nvarchar(40),
  LadeBatchKey bigint,
  AktualisiertAm datetime2,
  CONSTRAINT PK_FactPlan PRIMARY KEY (PlanKey)
);

-- FactKPIWert: Gemessene KPI-Ist-Werte je Periode (Spiegel des SQL-Vertrags sql/<sqlRef>.kpi.sql).
IF OBJECT_ID(N'FactKPIWert') IS NULL
CREATE TABLE FactKPIWert (
  KPIWertKey bigint NOT NULL,
  KPIKey int NOT NULL,
  Periode nvarchar(10) NOT NULL,
  Dimension nvarchar(60),
  Wert decimal(18,4) NOT NULL,
  QuelleSystem nvarchar(40),
  LadeBatchKey bigint,
  AktualisiertAm datetime2,
  CONSTRAINT PK_FactKPIWert PRIMARY KEY (KPIWertKey)
);

-- Beziehungen & Geschäftsschlüssel-Indizes
CREATE UNIQUE INDEX UX_DimDatum_BIZ ON DimDatum (Datum);
ALTER TABLE DimKalender ADD CONSTRAINT FK_DimKalender_DatumKey FOREIGN KEY (DatumKey) REFERENCES DimDatum(DatumKey);
CREATE UNIQUE INDEX UX_DimKalender_BIZ ON DimKalender (KalenderId, DatumKey);
CREATE UNIQUE INDEX UX_DimWarengruppe_BIZ ON DimWarengruppe (WarengruppeId);
ALTER TABLE DimProdukt ADD CONSTRAINT FK_DimProdukt_WarengruppeKey FOREIGN KEY (WarengruppeKey) REFERENCES DimWarengruppe(WarengruppeKey);
CREATE UNIQUE INDEX UX_DimProdukt_BIZ ON DimProdukt (ArtikelNr);
CREATE UNIQUE INDEX UX_DimStandort_BIZ ON DimStandort (StandortId);
CREATE UNIQUE INDEX UX_DimKanal_BIZ ON DimKanal (KanalId);
CREATE UNIQUE INDEX UX_DimKunde_BIZ ON DimKunde (KundeId);
CREATE UNIQUE INDEX UX_DimLieferant_BIZ ON DimLieferant (LieferantId);
CREATE UNIQUE INDEX UX_DimKonditionsart_BIZ ON DimKonditionsart (KonditionsartId);
CREATE UNIQUE INDEX UX_DimKPI_BIZ ON DimKPI (KPIId);
ALTER TABLE FactVerkauf ADD CONSTRAINT FK_FactVerkauf_DatumKey FOREIGN KEY (DatumKey) REFERENCES DimDatum(DatumKey);
ALTER TABLE FactVerkauf ADD CONSTRAINT FK_FactVerkauf_LieferDatumKey FOREIGN KEY (LieferDatumKey) REFERENCES DimDatum(DatumKey);
ALTER TABLE FactVerkauf ADD CONSTRAINT FK_FactVerkauf_ProduktKey FOREIGN KEY (ProduktKey) REFERENCES DimProdukt(ProduktKey);
ALTER TABLE FactVerkauf ADD CONSTRAINT FK_FactVerkauf_StandortKey FOREIGN KEY (StandortKey) REFERENCES DimStandort(StandortKey);
ALTER TABLE FactVerkauf ADD CONSTRAINT FK_FactVerkauf_KanalKey FOREIGN KEY (KanalKey) REFERENCES DimKanal(KanalKey);
ALTER TABLE FactVerkauf ADD CONSTRAINT FK_FactVerkauf_KundeKey FOREIGN KEY (KundeKey) REFERENCES DimKunde(KundeKey);
ALTER TABLE FactVerkauf ADD CONSTRAINT FK_FactVerkauf_KonditionsartKey FOREIGN KEY (KonditionsartKey) REFERENCES DimKonditionsart(KonditionsartKey);
CREATE UNIQUE INDEX UX_FactVerkauf_BIZ ON FactVerkauf (BelegNr, Position);
ALTER TABLE FactWareneingang ADD CONSTRAINT FK_FactWareneingang_LieferDatumKey FOREIGN KEY (LieferDatumKey) REFERENCES DimDatum(DatumKey);
ALTER TABLE FactWareneingang ADD CONSTRAINT FK_FactWareneingang_ProduktKey FOREIGN KEY (ProduktKey) REFERENCES DimProdukt(ProduktKey);
ALTER TABLE FactWareneingang ADD CONSTRAINT FK_FactWareneingang_LieferantKey FOREIGN KEY (LieferantKey) REFERENCES DimLieferant(LieferantKey);
ALTER TABLE FactWareneingang ADD CONSTRAINT FK_FactWareneingang_StandortKey FOREIGN KEY (StandortKey) REFERENCES DimStandort(StandortKey);
CREATE UNIQUE INDEX UX_FactWareneingang_BIZ ON FactWareneingang (BestellNr, Position);
ALTER TABLE FactAuftrag ADD CONSTRAINT FK_FactAuftrag_EingangDatumKey FOREIGN KEY (EingangDatumKey) REFERENCES DimDatum(DatumKey);
ALTER TABLE FactAuftrag ADD CONSTRAINT FK_FactAuftrag_LieferDatumKey FOREIGN KEY (LieferDatumKey) REFERENCES DimDatum(DatumKey);
ALTER TABLE FactAuftrag ADD CONSTRAINT FK_FactAuftrag_ProduktKey FOREIGN KEY (ProduktKey) REFERENCES DimProdukt(ProduktKey);
ALTER TABLE FactAuftrag ADD CONSTRAINT FK_FactAuftrag_KundeKey FOREIGN KEY (KundeKey) REFERENCES DimKunde(KundeKey);
CREATE UNIQUE INDEX UX_FactAuftrag_BIZ ON FactAuftrag (AuftragNr, Position);
ALTER TABLE FactBestand ADD CONSTRAINT FK_FactBestand_DatumKey FOREIGN KEY (DatumKey) REFERENCES DimDatum(DatumKey);
ALTER TABLE FactBestand ADD CONSTRAINT FK_FactBestand_StandortKey FOREIGN KEY (StandortKey) REFERENCES DimStandort(StandortKey);
ALTER TABLE FactBestand ADD CONSTRAINT FK_FactBestand_ProduktKey FOREIGN KEY (ProduktKey) REFERENCES DimProdukt(ProduktKey);
CREATE UNIQUE INDEX UX_FactBestand_BIZ ON FactBestand (DatumKey, StandortKey, ProduktKey);
ALTER TABLE FactForderung ADD CONSTRAINT FK_FactForderung_StichtagKey FOREIGN KEY (StichtagKey) REFERENCES DimDatum(DatumKey);
ALTER TABLE FactForderung ADD CONSTRAINT FK_FactForderung_KundeKey FOREIGN KEY (KundeKey) REFERENCES DimKunde(KundeKey);
ALTER TABLE FactForderung ADD CONSTRAINT FK_FactForderung_FaelligkeitKey FOREIGN KEY (FaelligkeitKey) REFERENCES DimDatum(DatumKey);
CREATE UNIQUE INDEX UX_FactForderung_BIZ ON FactForderung (BelegNr, StichtagKey);
ALTER TABLE FactZahlung ADD CONSTRAINT FK_FactZahlung_FaelligDatumKey FOREIGN KEY (FaelligDatumKey) REFERENCES DimDatum(DatumKey);
CREATE UNIQUE INDEX UX_FactZahlung_BIZ ON FactZahlung (Referenz);
ALTER TABLE FactBesuch ADD CONSTRAINT FK_FactBesuch_DatumKey FOREIGN KEY (DatumKey) REFERENCES DimDatum(DatumKey);
ALTER TABLE FactBesuch ADD CONSTRAINT FK_FactBesuch_StandortKey FOREIGN KEY (StandortKey) REFERENCES DimStandort(StandortKey);
CREATE UNIQUE INDEX UX_FactBesuch_BIZ ON FactBesuch (DatumKey, Stunde, StandortKey);
ALTER TABLE FactWebSession ADD CONSTRAINT FK_FactWebSession_DatumKey FOREIGN KEY (DatumKey) REFERENCES DimDatum(DatumKey);
ALTER TABLE FactWebSession ADD CONSTRAINT FK_FactWebSession_KanalKey FOREIGN KEY (KanalKey) REFERENCES DimKanal(KanalKey);
CREATE UNIQUE INDEX UX_FactWebSession_BIZ ON FactWebSession (DatumKey, KanalKey, Geraet);
ALTER TABLE FactWebFunnel ADD CONSTRAINT FK_FactWebFunnel_DatumKey FOREIGN KEY (DatumKey) REFERENCES DimDatum(DatumKey);
ALTER TABLE FactWebFunnel ADD CONSTRAINT FK_FactWebFunnel_KanalKey FOREIGN KEY (KanalKey) REFERENCES DimKanal(KanalKey);
CREATE UNIQUE INDEX UX_FactWebFunnel_BIZ ON FactWebFunnel (DatumKey, KanalKey);
ALTER TABLE FactPlan ADD CONSTRAINT FK_FactPlan_KPIKey FOREIGN KEY (KPIKey) REFERENCES DimKPI(KPIKey);
ALTER TABLE FactPlan ADD CONSTRAINT FK_FactPlan_StandortKey FOREIGN KEY (StandortKey) REFERENCES DimStandort(StandortKey);
CREATE UNIQUE INDEX UX_FactPlan_BIZ ON FactPlan (KPIKey, Jahr, Monat);
ALTER TABLE FactKPIWert ADD CONSTRAINT FK_FactKPIWert_KPIKey FOREIGN KEY (KPIKey) REFERENCES DimKPI(KPIKey);
CREATE UNIQUE INDEX UX_FactKPIWert_BIZ ON FactKPIWert (KPIKey, Periode, Dimension);
