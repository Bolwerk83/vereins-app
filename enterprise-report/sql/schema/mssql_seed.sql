-- Seed / Demo-Befüllung (mssql) · Schema 1.1.0

INSERT INTO DimKanal (KanalKey, KanalId, Kanal, Kanalgruppe) VALUES
  (1, N'organic', N'Organische Suche', N'organic'),
  (2, N'paid', N'Google Ads', N'paid'),
  (3, N'social', N'Social', N'social'),
  (4, N'direct', N'Direkt', N'direct'),
  (5, N'email', N'Newsletter', N'email');

INSERT INTO DimKonditionsart (KonditionsartKey, KonditionsartId, Bezeichnung, IstSonderfall, RabattProzent) VALUES
  (1, N'normal', N'Normalverkauf', 0, 0),
  (2, N'sponsoring', N'Sponsoring (100%)', 1, 100),
  (3, N'aktion', N'Aktion/Rabatt (>=50%)', 1, 50),
  (4, N'muster', N'Muster/Freiware & Garantie', 1, 100),
  (5, N'personal', N'Personalkauf & Intern/IC', 1, 30);

INSERT INTO DimWarengruppe (WarengruppeKey, WarengruppeId, Bezeichnung, Bereich) VALUES
  (1, N'ebike', N'E-Bikes', N'raeder'),
  (2, N'city', N'City/Trekking', N'raeder'),
  (3, N'teile', N'Teile & Zubehör', N'teile_zub'),
  (4, N'bekleidung', N'Bekleidung', N'bekleidung');

INSERT INTO DimStandort (StandortKey, StandortId, Name, Typ, Region, FlaecheQm, OeffnungKalenderId) VALUES
  (1, N'online', N'Onlineshop', N'Online', N'DE', NULL, N'onlineshop'),
  (2, N'fil_koeln', N'Filiale Köln', N'Filiale', N'West', 620, N'filiale'),
  (3, N'fil_muc', N'Filiale München', N'Filiale', N'Süd', 540, N'filiale');

-- DimDatum, DimProdukt, DimKPI und die Faktentabellen werden aus den Quellsystemen
-- per ETL/Delta-Beladung befüllt (siehe Delta-Skript). DimKPI spiegelt die kpiRegistry.
