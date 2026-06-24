-- ============================================================
-- Enterprise Report — DWH-Setup (postgres) · Schema 1.1.0
-- Reihenfolge: Dimensionen, dann Fakten, dann Beziehungen.
-- ============================================================

-- DimDatum: Kalendertag mit Zeitintelligenz (Jahr/Quartal/Monat/Woche, Feiertag, YTD).
CREATE TABLE IF NOT EXISTS dimdatum (
  datumkey integer NOT NULL,
  datum date NOT NULL,
  jahr smallint NOT NULL,
  quartal smallint NOT NULL,
  monat smallint NOT NULL,
  monatname varchar(20) NOT NULL,
  woche smallint NOT NULL,
  wochentag smallint NOT NULL,
  wochentagname varchar(10) NOT NULL,
  istwochenende boolean NOT NULL,
  istfeiertag boolean NOT NULL,
  feiertagname varchar(40),
  tagimjahr smallint NOT NULL,
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_dimdatum PRIMARY KEY (datumkey)
);

-- DimKalender: Plankalender-Gewicht je Kategorie und Tag (Fixkosten/Filiale/Onlineshop/Werktage).
CREATE TABLE IF NOT EXISTS dimkalender (
  kalenderkey integer NOT NULL,
  kalenderid varchar(30) NOT NULL,
  kalendername varchar(60) NOT NULL,
  datumkey integer NOT NULL,
  gewicht numeric(4,2) NOT NULL,
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_dimkalender PRIMARY KEY (kalenderkey)
);

-- DimWarengruppe: Warengruppen / Bereiche.
CREATE TABLE IF NOT EXISTS dimwarengruppe (
  warengruppekey integer NOT NULL,
  warengruppeid varchar(30) NOT NULL,
  bezeichnung varchar(80) NOT NULL,
  bereich varchar(20) NOT NULL,
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_dimwarengruppe PRIMARY KEY (warengruppekey)
);

-- DimProdukt: Artikelstamm.
CREATE TABLE IF NOT EXISTS dimprodukt (
  produktkey integer NOT NULL,
  artikelnr varchar(40) NOT NULL,
  bezeichnung varchar(120) NOT NULL,
  warengruppekey integer NOT NULL,
  marke varchar(60),
  istebike boolean NOT NULL,
  listenpreis numeric(18,2),
  standardkosten numeric(18,2),
  bildurl varchar(300),
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_dimprodukt PRIMARY KEY (produktkey)
);

-- DimStandort: Filialen, Onlineshop, Zentrale (Profit-Center).
CREATE TABLE IF NOT EXISTS dimstandort (
  standortkey integer NOT NULL,
  standortid varchar(30) NOT NULL,
  name varchar(80) NOT NULL,
  typ varchar(20) NOT NULL,
  region varchar(40),
  flaecheqm integer,
  oeffnungkalenderid varchar(30),
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_dimstandort PRIMARY KEY (standortkey)
);

-- DimKanal: Vertriebs-/Marketingkanal (für Web/GA & Verkauf).
CREATE TABLE IF NOT EXISTS dimkanal (
  kanalkey integer NOT NULL,
  kanalid varchar(30) NOT NULL,
  kanal varchar(60) NOT NULL,
  kanalgruppe varchar(30) NOT NULL,
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_dimkanal PRIMARY KEY (kanalkey)
);

-- DimKunde: Kundenstamm (B2C/B2B), für Forderungen & Webshop.
CREATE TABLE IF NOT EXISTS dimkunde (
  kundekey integer NOT NULL,
  kundeid varchar(40) NOT NULL,
  segment varchar(20) NOT NULL,
  plz varchar(10),
  land varchar(40),
  istneukunde boolean NOT NULL,
  bonitaet varchar(10),
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_dimkunde PRIMARY KEY (kundekey)
);

-- DimLieferant: Lieferantenstamm (Wareneingang, Zahlungsausgang).
CREATE TABLE IF NOT EXISTS dimlieferant (
  lieferantkey integer NOT NULL,
  lieferantid varchar(40) NOT NULL,
  name varchar(80) NOT NULL,
  land varchar(40),
  zahlungszieltage smallint,
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_dimlieferant PRIMARY KEY (lieferantkey)
);

-- DimKonditionsart: Geschäfts-/Konditionsart — Sonderfälle für die faire DB (Sponsoring 100%, Aktion, Muster, Personal/IC).
CREATE TABLE IF NOT EXISTS dimkonditionsart (
  konditionsartkey integer NOT NULL,
  konditionsartid varchar(30) NOT NULL,
  bezeichnung varchar(80) NOT NULL,
  istsonderfall boolean NOT NULL,
  rabattprozent numeric(5,2),
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_dimkonditionsart PRIMARY KEY (konditionsartkey)
);

-- DimKPI: KPI-Metadaten (Spiegel der kpiRegistry) für FactKPIWert.
CREATE TABLE IF NOT EXISTS dimkpi (
  kpikey integer NOT NULL,
  kpiid varchar(60) NOT NULL,
  name varchar(120) NOT NULL,
  einheit varchar(20) NOT NULL,
  bereich varchar(20) NOT NULL,
  richtung varchar(12) NOT NULL,
  ziel numeric(18,4),
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_dimkpi PRIMARY KEY (kpikey)
);

-- FactVerkauf: Verkaufspositionen (Order-to-Cash). Grain: Beleg + Position. Basis für Umsatz, DB, faire DB.
CREATE TABLE IF NOT EXISTS factverkauf (
  verkaufkey bigint NOT NULL,
  belegnr varchar(30) NOT NULL,
  position integer NOT NULL,
  datumkey integer NOT NULL,
  lieferdatumkey integer NOT NULL,
  produktkey integer NOT NULL,
  standortkey integer NOT NULL,
  kanalkey integer NOT NULL,
  kundekey integer NOT NULL,
  konditionsartkey integer NOT NULL,
  menge integer NOT NULL,
  bruttoumsatz numeric(18,2) NOT NULL,
  erloesschmaelerung numeric(18,2) NOT NULL,
  nettoumsatz numeric(18,2) NOT NULL,
  wareneinsatz numeric(18,2) NOT NULL,
  db1 numeric(18,2) NOT NULL,
  quellesystem varchar(40),
  ladebatchkey bigint,
  aktualisiertam timestamptz,
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_factverkauf PRIMARY KEY (verkaufkey)
);

-- FactWareneingang: Bestellungen Einkauf nach Lieferdatum (Warenfluss-Eingang).
CREATE TABLE IF NOT EXISTS factwareneingang (
  wareneingangkey bigint NOT NULL,
  bestellnr varchar(30) NOT NULL,
  position integer NOT NULL,
  lieferdatumkey integer NOT NULL,
  produktkey integer NOT NULL,
  lieferantkey integer NOT NULL,
  standortkey integer NOT NULL,
  menge integer NOT NULL,
  einstandswert numeric(18,2) NOT NULL,
  status varchar(20) NOT NULL,
  quellesystem varchar(40),
  ladebatchkey bigint,
  aktualisiertam timestamptz,
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_factwareneingang PRIMARY KEY (wareneingangkey)
);

-- FactAuftrag: Auftragsbestand: Eingang & Auslieferung nach Lieferdatum.
CREATE TABLE IF NOT EXISTS factauftrag (
  auftragkey bigint NOT NULL,
  auftragnr varchar(30) NOT NULL,
  position integer NOT NULL,
  eingangdatumkey integer NOT NULL,
  lieferdatumkey integer NOT NULL,
  produktkey integer NOT NULL,
  kundekey integer NOT NULL,
  menge integer NOT NULL,
  auftragswert numeric(18,2) NOT NULL,
  status varchar(20) NOT NULL,
  quellesystem varchar(40),
  ladebatchkey bigint,
  aktualisiertam timestamptz,
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_factauftrag PRIMARY KEY (auftragkey)
);

-- FactBestand: Bestands-Snapshot je Tag/Standort/Produkt (Warenfluss-Bestand).
CREATE TABLE IF NOT EXISTS factbestand (
  bestandkey bigint NOT NULL,
  datumkey integer NOT NULL,
  standortkey integer NOT NULL,
  produktkey integer NOT NULL,
  bestandmenge integer NOT NULL,
  bestandswert numeric(18,2) NOT NULL,
  reichweitetage integer,
  quellesystem varchar(40),
  ladebatchkey bigint,
  aktualisiertam timestamptz,
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_factbestand PRIMARY KEY (bestandkey)
);

-- FactForderung: Offene Posten / Forderungs-Aging (DSO, überfällig, Ausfall).
CREATE TABLE IF NOT EXISTS factforderung (
  forderungkey bigint NOT NULL,
  belegnr varchar(30) NOT NULL,
  stichtagkey integer NOT NULL,
  kundekey integer NOT NULL,
  faelligkeitkey integer NOT NULL,
  offenerbetrag numeric(18,2) NOT NULL,
  tageueberfaellig integer NOT NULL,
  mahnstufe smallint NOT NULL,
  erwarteterausfall numeric(18,2) NOT NULL,
  quellesystem varchar(40),
  ladebatchkey bigint,
  aktualisiertam timestamptz,
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_factforderung PRIMARY KEY (forderungkey)
);

-- FactZahlung: Zahlungsfluss (Liquidität): Ein-/Ausgänge nach Fälligkeit.
CREATE TABLE IF NOT EXISTS factzahlung (
  zahlungkey bigint NOT NULL,
  referenz varchar(40) NOT NULL,
  faelligdatumkey integer NOT NULL,
  richtung varchar(10) NOT NULL,
  kategorie varchar(40) NOT NULL,
  betrag numeric(18,2) NOT NULL,
  istprog varchar(10) NOT NULL,
  quellesystem varchar(40),
  ladebatchkey bigint,
  aktualisiertam timestamptz,
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_factzahlung PRIMARY KEY (zahlungkey)
);

-- FactBesuch: Filial-Frequenz (Footfall) je Tag/Stunde/Standort — für Conversion & Personalbedarf.
CREATE TABLE IF NOT EXISTS factbesuch (
  besuchkey bigint NOT NULL,
  datumkey integer NOT NULL,
  stunde smallint NOT NULL,
  standortkey integer NOT NULL,
  besucher integer NOT NULL,
  kaeufe integer NOT NULL,
  umsatz numeric(18,2) NOT NULL,
  quellesystem varchar(40),
  ladebatchkey bigint,
  aktualisiertam timestamptz,
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_factbesuch PRIMARY KEY (besuchkey)
);

-- FactWebSession: Web-/GA-Sitzungen je Tag/Kanal/Gerät (Sessions, Users, Bounce, Dauer).
CREATE TABLE IF NOT EXISTS factwebsession (
  websessionkey bigint NOT NULL,
  datumkey integer NOT NULL,
  kanalkey integer NOT NULL,
  geraet varchar(20) NOT NULL,
  sitzungen integer NOT NULL,
  nutzer integer NOT NULL,
  neuenutzer integer NOT NULL,
  seitenaufrufe integer NOT NULL,
  absprungprozent numeric(5,2) NOT NULL,
  dauersek integer NOT NULL,
  quellesystem varchar(40),
  ladebatchkey bigint,
  aktualisiertam timestamptz,
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_factwebsession PRIMARY KEY (websessionkey)
);

-- FactWebFunnel: Webshop-Funnel je Tag/Kanal: Schritt-Zahlen (Sitzung→Produkt→Warenkorb→Checkout→Kauf) + Onsite-Suche.
CREATE TABLE IF NOT EXISTS factwebfunnel (
  webfunnelkey bigint NOT NULL,
  datumkey integer NOT NULL,
  kanalkey integer NOT NULL,
  sitzungen integer NOT NULL,
  produktansichten integer NOT NULL,
  warenkorbadds integer NOT NULL,
  checkoutstarts integer NOT NULL,
  kaeufe integer NOT NULL,
  umsatz numeric(18,2) NOT NULL,
  sucheohnetreffer integer NOT NULL,
  quellesystem varchar(40),
  ladebatchkey bigint,
  aktualisiertam timestamptz,
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_factwebfunnel PRIMARY KEY (webfunnelkey)
);

-- FactPlan: Plan/Budget je KPI und Monat, optional Plankalender für Tagesverteilung.
CREATE TABLE IF NOT EXISTS factplan (
  plankey bigint NOT NULL,
  kpikey integer NOT NULL,
  jahr smallint NOT NULL,
  monat smallint NOT NULL,
  standortkey integer,
  kalenderid varchar(30),
  planwert numeric(18,4) NOT NULL,
  quellesystem varchar(40),
  ladebatchkey bigint,
  aktualisiertam timestamptz,
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_factplan PRIMARY KEY (plankey)
);

-- FactKPIWert: Gemessene KPI-Ist-Werte je Periode (Spiegel des SQL-Vertrags sql/<sqlRef>.kpi.sql).
CREATE TABLE IF NOT EXISTS factkpiwert (
  kpiwertkey bigint NOT NULL,
  kpikey integer NOT NULL,
  periode varchar(10) NOT NULL,
  dimension varchar(60),
  wert numeric(18,4) NOT NULL,
  quellesystem varchar(40),
  ladebatchkey bigint,
  aktualisiertam timestamptz,
  rowversion bigint,
  geaendertvon varchar(80),
  geaendertam timestamptz,
  CONSTRAINT pk_factkpiwert PRIMARY KEY (kpiwertkey)
);

-- Beziehungen & Geschäftsschlüssel-Indizes
CREATE UNIQUE INDEX ux_dimdatum_biz ON dimdatum (datum);
ALTER TABLE dimkalender ADD CONSTRAINT fk_dimkalender_datumkey FOREIGN KEY (datumkey) REFERENCES dimdatum(datumkey);
CREATE UNIQUE INDEX ux_dimkalender_biz ON dimkalender (kalenderid, datumkey);
CREATE UNIQUE INDEX ux_dimwarengruppe_biz ON dimwarengruppe (warengruppeid);
ALTER TABLE dimprodukt ADD CONSTRAINT fk_dimprodukt_warengruppekey FOREIGN KEY (warengruppekey) REFERENCES dimwarengruppe(warengruppekey);
CREATE UNIQUE INDEX ux_dimprodukt_biz ON dimprodukt (artikelnr);
CREATE UNIQUE INDEX ux_dimstandort_biz ON dimstandort (standortid);
CREATE UNIQUE INDEX ux_dimkanal_biz ON dimkanal (kanalid);
CREATE UNIQUE INDEX ux_dimkunde_biz ON dimkunde (kundeid);
CREATE UNIQUE INDEX ux_dimlieferant_biz ON dimlieferant (lieferantid);
CREATE UNIQUE INDEX ux_dimkonditionsart_biz ON dimkonditionsart (konditionsartid);
CREATE UNIQUE INDEX ux_dimkpi_biz ON dimkpi (kpiid);
ALTER TABLE factverkauf ADD CONSTRAINT fk_factverkauf_datumkey FOREIGN KEY (datumkey) REFERENCES dimdatum(datumkey);
ALTER TABLE factverkauf ADD CONSTRAINT fk_factverkauf_lieferdatumkey FOREIGN KEY (lieferdatumkey) REFERENCES dimdatum(datumkey);
ALTER TABLE factverkauf ADD CONSTRAINT fk_factverkauf_produktkey FOREIGN KEY (produktkey) REFERENCES dimprodukt(produktkey);
ALTER TABLE factverkauf ADD CONSTRAINT fk_factverkauf_standortkey FOREIGN KEY (standortkey) REFERENCES dimstandort(standortkey);
ALTER TABLE factverkauf ADD CONSTRAINT fk_factverkauf_kanalkey FOREIGN KEY (kanalkey) REFERENCES dimkanal(kanalkey);
ALTER TABLE factverkauf ADD CONSTRAINT fk_factverkauf_kundekey FOREIGN KEY (kundekey) REFERENCES dimkunde(kundekey);
ALTER TABLE factverkauf ADD CONSTRAINT fk_factverkauf_konditionsartkey FOREIGN KEY (konditionsartkey) REFERENCES dimkonditionsart(konditionsartkey);
CREATE UNIQUE INDEX ux_factverkauf_biz ON factverkauf (belegnr, position);
ALTER TABLE factwareneingang ADD CONSTRAINT fk_factwareneingang_lieferdatumkey FOREIGN KEY (lieferdatumkey) REFERENCES dimdatum(datumkey);
ALTER TABLE factwareneingang ADD CONSTRAINT fk_factwareneingang_produktkey FOREIGN KEY (produktkey) REFERENCES dimprodukt(produktkey);
ALTER TABLE factwareneingang ADD CONSTRAINT fk_factwareneingang_lieferantkey FOREIGN KEY (lieferantkey) REFERENCES dimlieferant(lieferantkey);
ALTER TABLE factwareneingang ADD CONSTRAINT fk_factwareneingang_standortkey FOREIGN KEY (standortkey) REFERENCES dimstandort(standortkey);
CREATE UNIQUE INDEX ux_factwareneingang_biz ON factwareneingang (bestellnr, position);
ALTER TABLE factauftrag ADD CONSTRAINT fk_factauftrag_eingangdatumkey FOREIGN KEY (eingangdatumkey) REFERENCES dimdatum(datumkey);
ALTER TABLE factauftrag ADD CONSTRAINT fk_factauftrag_lieferdatumkey FOREIGN KEY (lieferdatumkey) REFERENCES dimdatum(datumkey);
ALTER TABLE factauftrag ADD CONSTRAINT fk_factauftrag_produktkey FOREIGN KEY (produktkey) REFERENCES dimprodukt(produktkey);
ALTER TABLE factauftrag ADD CONSTRAINT fk_factauftrag_kundekey FOREIGN KEY (kundekey) REFERENCES dimkunde(kundekey);
CREATE UNIQUE INDEX ux_factauftrag_biz ON factauftrag (auftragnr, position);
ALTER TABLE factbestand ADD CONSTRAINT fk_factbestand_datumkey FOREIGN KEY (datumkey) REFERENCES dimdatum(datumkey);
ALTER TABLE factbestand ADD CONSTRAINT fk_factbestand_standortkey FOREIGN KEY (standortkey) REFERENCES dimstandort(standortkey);
ALTER TABLE factbestand ADD CONSTRAINT fk_factbestand_produktkey FOREIGN KEY (produktkey) REFERENCES dimprodukt(produktkey);
CREATE UNIQUE INDEX ux_factbestand_biz ON factbestand (datumkey, standortkey, produktkey);
ALTER TABLE factforderung ADD CONSTRAINT fk_factforderung_stichtagkey FOREIGN KEY (stichtagkey) REFERENCES dimdatum(datumkey);
ALTER TABLE factforderung ADD CONSTRAINT fk_factforderung_kundekey FOREIGN KEY (kundekey) REFERENCES dimkunde(kundekey);
ALTER TABLE factforderung ADD CONSTRAINT fk_factforderung_faelligkeitkey FOREIGN KEY (faelligkeitkey) REFERENCES dimdatum(datumkey);
CREATE UNIQUE INDEX ux_factforderung_biz ON factforderung (belegnr, stichtagkey);
ALTER TABLE factzahlung ADD CONSTRAINT fk_factzahlung_faelligdatumkey FOREIGN KEY (faelligdatumkey) REFERENCES dimdatum(datumkey);
CREATE UNIQUE INDEX ux_factzahlung_biz ON factzahlung (referenz);
ALTER TABLE factbesuch ADD CONSTRAINT fk_factbesuch_datumkey FOREIGN KEY (datumkey) REFERENCES dimdatum(datumkey);
ALTER TABLE factbesuch ADD CONSTRAINT fk_factbesuch_standortkey FOREIGN KEY (standortkey) REFERENCES dimstandort(standortkey);
CREATE UNIQUE INDEX ux_factbesuch_biz ON factbesuch (datumkey, stunde, standortkey);
ALTER TABLE factwebsession ADD CONSTRAINT fk_factwebsession_datumkey FOREIGN KEY (datumkey) REFERENCES dimdatum(datumkey);
ALTER TABLE factwebsession ADD CONSTRAINT fk_factwebsession_kanalkey FOREIGN KEY (kanalkey) REFERENCES dimkanal(kanalkey);
CREATE UNIQUE INDEX ux_factwebsession_biz ON factwebsession (datumkey, kanalkey, geraet);
ALTER TABLE factwebfunnel ADD CONSTRAINT fk_factwebfunnel_datumkey FOREIGN KEY (datumkey) REFERENCES dimdatum(datumkey);
ALTER TABLE factwebfunnel ADD CONSTRAINT fk_factwebfunnel_kanalkey FOREIGN KEY (kanalkey) REFERENCES dimkanal(kanalkey);
CREATE UNIQUE INDEX ux_factwebfunnel_biz ON factwebfunnel (datumkey, kanalkey);
ALTER TABLE factplan ADD CONSTRAINT fk_factplan_kpikey FOREIGN KEY (kpikey) REFERENCES dimkpi(kpikey);
ALTER TABLE factplan ADD CONSTRAINT fk_factplan_standortkey FOREIGN KEY (standortkey) REFERENCES dimstandort(standortkey);
CREATE UNIQUE INDEX ux_factplan_biz ON factplan (kpikey, jahr, monat);
ALTER TABLE factkpiwert ADD CONSTRAINT fk_factkpiwert_kpikey FOREIGN KEY (kpikey) REFERENCES dimkpi(kpikey);
CREATE UNIQUE INDEX ux_factkpiwert_biz ON factkpiwert (kpikey, periode, dimension);
