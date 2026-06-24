-- Seed / Demo-Befüllung (postgres) · Schema 1.1.0

INSERT INTO dimkanal (kanalkey, kanalid, kanal, kanalgruppe) VALUES
  (1, 'organic', 'Organische Suche', 'organic'),
  (2, 'paid', 'Google Ads', 'paid'),
  (3, 'social', 'Social', 'social'),
  (4, 'direct', 'Direkt', 'direct'),
  (5, 'email', 'Newsletter', 'email');

INSERT INTO dimkonditionsart (konditionsartkey, konditionsartid, bezeichnung, istsonderfall, rabattprozent) VALUES
  (1, 'normal', 'Normalverkauf', FALSE, 0),
  (2, 'sponsoring', 'Sponsoring (100%)', TRUE, 100),
  (3, 'aktion', 'Aktion/Rabatt (>=50%)', TRUE, 50),
  (4, 'muster', 'Muster/Freiware & Garantie', TRUE, 100),
  (5, 'personal', 'Personalkauf & Intern/IC', TRUE, 30);

INSERT INTO dimwarengruppe (warengruppekey, warengruppeid, bezeichnung, bereich) VALUES
  (1, 'ebike', 'E-Bikes', 'raeder'),
  (2, 'city', 'City/Trekking', 'raeder'),
  (3, 'teile', 'Teile & Zubehör', 'teile_zub'),
  (4, 'bekleidung', 'Bekleidung', 'bekleidung');

INSERT INTO dimstandort (standortkey, standortid, name, typ, region, flaecheqm, oeffnungkalenderid) VALUES
  (1, 'online', 'Onlineshop', 'Online', 'DE', NULL, 'onlineshop'),
  (2, 'fil_koeln', 'Filiale Köln', 'Filiale', 'West', 620, 'filiale'),
  (3, 'fil_muc', 'Filiale München', 'Filiale', 'Süd', 540, 'filiale');

-- DimDatum, DimProdukt, DimKPI und die Faktentabellen werden aus den Quellsystemen
-- per ETL/Delta-Beladung befüllt (siehe Delta-Skript). DimKPI spiegelt die kpiRegistry.
