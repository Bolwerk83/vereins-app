-- ============================================================
-- Delta-Beladung (mssql) — inkrementell über Wasserzeichen 'AktualisiertAm'.
-- Ablauf je Tabelle: Staging füllen (nur geänderte Zeilen) → MERGE/Upsert.
-- ============================================================

-- Delta FactVerkauf (MSSQL): Staging 'FactVerkauf_stg' laden (nur AktualisiertAm > @SeitAktualisiert), dann MERGE:
MERGE FactVerkauf AS T
USING FactVerkauf_stg AS S ON (T.BelegNr = S.BelegNr AND T.Position = S.Position)
WHEN MATCHED THEN UPDATE SET T.DatumKey = S.DatumKey, T.LieferDatumKey = S.LieferDatumKey, T.ProduktKey = S.ProduktKey, T.StandortKey = S.StandortKey, T.KanalKey = S.KanalKey, T.KundeKey = S.KundeKey, T.KonditionsartKey = S.KonditionsartKey, T.Menge = S.Menge, T.Bruttoumsatz = S.Bruttoumsatz, T.Erloesschmaelerung = S.Erloesschmaelerung, T.Nettoumsatz = S.Nettoumsatz, T.Wareneinsatz = S.Wareneinsatz, T.DB1 = S.DB1, T.QuelleSystem = S.QuelleSystem, T.LadeBatchKey = S.LadeBatchKey, T.AktualisiertAm = S.AktualisiertAm, T.RowVersion = S.RowVersion, T.GeaendertVon = S.GeaendertVon, T.GeaendertAm = S.GeaendertAm
WHEN NOT MATCHED THEN INSERT (VerkaufKey, BelegNr, Position, DatumKey, LieferDatumKey, ProduktKey, StandortKey, KanalKey, KundeKey, KonditionsartKey, Menge, Bruttoumsatz, Erloesschmaelerung, Nettoumsatz, Wareneinsatz, DB1, QuelleSystem, LadeBatchKey, AktualisiertAm, RowVersion, GeaendertVon, GeaendertAm) VALUES (S.VerkaufKey, S.BelegNr, S.Position, S.DatumKey, S.LieferDatumKey, S.ProduktKey, S.StandortKey, S.KanalKey, S.KundeKey, S.KonditionsartKey, S.Menge, S.Bruttoumsatz, S.Erloesschmaelerung, S.Nettoumsatz, S.Wareneinsatz, S.DB1, S.QuelleSystem, S.LadeBatchKey, S.AktualisiertAm, S.RowVersion, S.GeaendertVon, S.GeaendertAm);

-- Delta FactWareneingang (MSSQL): Staging 'FactWareneingang_stg' laden (nur AktualisiertAm > @SeitAktualisiert), dann MERGE:
MERGE FactWareneingang AS T
USING FactWareneingang_stg AS S ON (T.BestellNr = S.BestellNr AND T.Position = S.Position)
WHEN MATCHED THEN UPDATE SET T.LieferDatumKey = S.LieferDatumKey, T.ProduktKey = S.ProduktKey, T.LieferantKey = S.LieferantKey, T.StandortKey = S.StandortKey, T.Menge = S.Menge, T.Einstandswert = S.Einstandswert, T.Status = S.Status, T.QuelleSystem = S.QuelleSystem, T.LadeBatchKey = S.LadeBatchKey, T.AktualisiertAm = S.AktualisiertAm, T.RowVersion = S.RowVersion, T.GeaendertVon = S.GeaendertVon, T.GeaendertAm = S.GeaendertAm
WHEN NOT MATCHED THEN INSERT (WareneingangKey, BestellNr, Position, LieferDatumKey, ProduktKey, LieferantKey, StandortKey, Menge, Einstandswert, Status, QuelleSystem, LadeBatchKey, AktualisiertAm, RowVersion, GeaendertVon, GeaendertAm) VALUES (S.WareneingangKey, S.BestellNr, S.Position, S.LieferDatumKey, S.ProduktKey, S.LieferantKey, S.StandortKey, S.Menge, S.Einstandswert, S.Status, S.QuelleSystem, S.LadeBatchKey, S.AktualisiertAm, S.RowVersion, S.GeaendertVon, S.GeaendertAm);

-- Delta FactAuftrag (MSSQL): Staging 'FactAuftrag_stg' laden (nur AktualisiertAm > @SeitAktualisiert), dann MERGE:
MERGE FactAuftrag AS T
USING FactAuftrag_stg AS S ON (T.AuftragNr = S.AuftragNr AND T.Position = S.Position)
WHEN MATCHED THEN UPDATE SET T.EingangDatumKey = S.EingangDatumKey, T.LieferDatumKey = S.LieferDatumKey, T.ProduktKey = S.ProduktKey, T.KundeKey = S.KundeKey, T.Menge = S.Menge, T.Auftragswert = S.Auftragswert, T.Status = S.Status, T.QuelleSystem = S.QuelleSystem, T.LadeBatchKey = S.LadeBatchKey, T.AktualisiertAm = S.AktualisiertAm, T.RowVersion = S.RowVersion, T.GeaendertVon = S.GeaendertVon, T.GeaendertAm = S.GeaendertAm
WHEN NOT MATCHED THEN INSERT (AuftragKey, AuftragNr, Position, EingangDatumKey, LieferDatumKey, ProduktKey, KundeKey, Menge, Auftragswert, Status, QuelleSystem, LadeBatchKey, AktualisiertAm, RowVersion, GeaendertVon, GeaendertAm) VALUES (S.AuftragKey, S.AuftragNr, S.Position, S.EingangDatumKey, S.LieferDatumKey, S.ProduktKey, S.KundeKey, S.Menge, S.Auftragswert, S.Status, S.QuelleSystem, S.LadeBatchKey, S.AktualisiertAm, S.RowVersion, S.GeaendertVon, S.GeaendertAm);

-- Delta FactBestand (MSSQL): Staging 'FactBestand_stg' laden (nur AktualisiertAm > @SeitAktualisiert), dann MERGE:
MERGE FactBestand AS T
USING FactBestand_stg AS S ON (T.DatumKey = S.DatumKey AND T.StandortKey = S.StandortKey AND T.ProduktKey = S.ProduktKey)
WHEN MATCHED THEN UPDATE SET T.BestandMenge = S.BestandMenge, T.Bestandswert = S.Bestandswert, T.ReichweiteTage = S.ReichweiteTage, T.QuelleSystem = S.QuelleSystem, T.LadeBatchKey = S.LadeBatchKey, T.AktualisiertAm = S.AktualisiertAm, T.RowVersion = S.RowVersion, T.GeaendertVon = S.GeaendertVon, T.GeaendertAm = S.GeaendertAm
WHEN NOT MATCHED THEN INSERT (BestandKey, DatumKey, StandortKey, ProduktKey, BestandMenge, Bestandswert, ReichweiteTage, QuelleSystem, LadeBatchKey, AktualisiertAm, RowVersion, GeaendertVon, GeaendertAm) VALUES (S.BestandKey, S.DatumKey, S.StandortKey, S.ProduktKey, S.BestandMenge, S.Bestandswert, S.ReichweiteTage, S.QuelleSystem, S.LadeBatchKey, S.AktualisiertAm, S.RowVersion, S.GeaendertVon, S.GeaendertAm);

-- Delta FactForderung (MSSQL): Staging 'FactForderung_stg' laden (nur AktualisiertAm > @SeitAktualisiert), dann MERGE:
MERGE FactForderung AS T
USING FactForderung_stg AS S ON (T.BelegNr = S.BelegNr AND T.StichtagKey = S.StichtagKey)
WHEN MATCHED THEN UPDATE SET T.KundeKey = S.KundeKey, T.FaelligkeitKey = S.FaelligkeitKey, T.OffenerBetrag = S.OffenerBetrag, T.TageUeberfaellig = S.TageUeberfaellig, T.Mahnstufe = S.Mahnstufe, T.ErwarteterAusfall = S.ErwarteterAusfall, T.QuelleSystem = S.QuelleSystem, T.LadeBatchKey = S.LadeBatchKey, T.AktualisiertAm = S.AktualisiertAm, T.RowVersion = S.RowVersion, T.GeaendertVon = S.GeaendertVon, T.GeaendertAm = S.GeaendertAm
WHEN NOT MATCHED THEN INSERT (ForderungKey, BelegNr, StichtagKey, KundeKey, FaelligkeitKey, OffenerBetrag, TageUeberfaellig, Mahnstufe, ErwarteterAusfall, QuelleSystem, LadeBatchKey, AktualisiertAm, RowVersion, GeaendertVon, GeaendertAm) VALUES (S.ForderungKey, S.BelegNr, S.StichtagKey, S.KundeKey, S.FaelligkeitKey, S.OffenerBetrag, S.TageUeberfaellig, S.Mahnstufe, S.ErwarteterAusfall, S.QuelleSystem, S.LadeBatchKey, S.AktualisiertAm, S.RowVersion, S.GeaendertVon, S.GeaendertAm);

-- Delta FactZahlung (MSSQL): Staging 'FactZahlung_stg' laden (nur AktualisiertAm > @SeitAktualisiert), dann MERGE:
MERGE FactZahlung AS T
USING FactZahlung_stg AS S ON (T.Referenz = S.Referenz)
WHEN MATCHED THEN UPDATE SET T.FaelligDatumKey = S.FaelligDatumKey, T.Richtung = S.Richtung, T.Kategorie = S.Kategorie, T.Betrag = S.Betrag, T.IstProg = S.IstProg, T.QuelleSystem = S.QuelleSystem, T.LadeBatchKey = S.LadeBatchKey, T.AktualisiertAm = S.AktualisiertAm, T.RowVersion = S.RowVersion, T.GeaendertVon = S.GeaendertVon, T.GeaendertAm = S.GeaendertAm
WHEN NOT MATCHED THEN INSERT (ZahlungKey, Referenz, FaelligDatumKey, Richtung, Kategorie, Betrag, IstProg, QuelleSystem, LadeBatchKey, AktualisiertAm, RowVersion, GeaendertVon, GeaendertAm) VALUES (S.ZahlungKey, S.Referenz, S.FaelligDatumKey, S.Richtung, S.Kategorie, S.Betrag, S.IstProg, S.QuelleSystem, S.LadeBatchKey, S.AktualisiertAm, S.RowVersion, S.GeaendertVon, S.GeaendertAm);

-- Delta FactBesuch (MSSQL): Staging 'FactBesuch_stg' laden (nur AktualisiertAm > @SeitAktualisiert), dann MERGE:
MERGE FactBesuch AS T
USING FactBesuch_stg AS S ON (T.DatumKey = S.DatumKey AND T.Stunde = S.Stunde AND T.StandortKey = S.StandortKey)
WHEN MATCHED THEN UPDATE SET T.Besucher = S.Besucher, T.Kaeufe = S.Kaeufe, T.Umsatz = S.Umsatz, T.QuelleSystem = S.QuelleSystem, T.LadeBatchKey = S.LadeBatchKey, T.AktualisiertAm = S.AktualisiertAm, T.RowVersion = S.RowVersion, T.GeaendertVon = S.GeaendertVon, T.GeaendertAm = S.GeaendertAm
WHEN NOT MATCHED THEN INSERT (BesuchKey, DatumKey, Stunde, StandortKey, Besucher, Kaeufe, Umsatz, QuelleSystem, LadeBatchKey, AktualisiertAm, RowVersion, GeaendertVon, GeaendertAm) VALUES (S.BesuchKey, S.DatumKey, S.Stunde, S.StandortKey, S.Besucher, S.Kaeufe, S.Umsatz, S.QuelleSystem, S.LadeBatchKey, S.AktualisiertAm, S.RowVersion, S.GeaendertVon, S.GeaendertAm);

-- Delta FactWebSession (MSSQL): Staging 'FactWebSession_stg' laden (nur AktualisiertAm > @SeitAktualisiert), dann MERGE:
MERGE FactWebSession AS T
USING FactWebSession_stg AS S ON (T.DatumKey = S.DatumKey AND T.KanalKey = S.KanalKey AND T.Geraet = S.Geraet)
WHEN MATCHED THEN UPDATE SET T.Sitzungen = S.Sitzungen, T.Nutzer = S.Nutzer, T.NeueNutzer = S.NeueNutzer, T.Seitenaufrufe = S.Seitenaufrufe, T.AbsprungProzent = S.AbsprungProzent, T.DauerSek = S.DauerSek, T.QuelleSystem = S.QuelleSystem, T.LadeBatchKey = S.LadeBatchKey, T.AktualisiertAm = S.AktualisiertAm, T.RowVersion = S.RowVersion, T.GeaendertVon = S.GeaendertVon, T.GeaendertAm = S.GeaendertAm
WHEN NOT MATCHED THEN INSERT (WebSessionKey, DatumKey, KanalKey, Geraet, Sitzungen, Nutzer, NeueNutzer, Seitenaufrufe, AbsprungProzent, DauerSek, QuelleSystem, LadeBatchKey, AktualisiertAm, RowVersion, GeaendertVon, GeaendertAm) VALUES (S.WebSessionKey, S.DatumKey, S.KanalKey, S.Geraet, S.Sitzungen, S.Nutzer, S.NeueNutzer, S.Seitenaufrufe, S.AbsprungProzent, S.DauerSek, S.QuelleSystem, S.LadeBatchKey, S.AktualisiertAm, S.RowVersion, S.GeaendertVon, S.GeaendertAm);

-- Delta FactWebFunnel (MSSQL): Staging 'FactWebFunnel_stg' laden (nur AktualisiertAm > @SeitAktualisiert), dann MERGE:
MERGE FactWebFunnel AS T
USING FactWebFunnel_stg AS S ON (T.DatumKey = S.DatumKey AND T.KanalKey = S.KanalKey)
WHEN MATCHED THEN UPDATE SET T.Sitzungen = S.Sitzungen, T.Produktansichten = S.Produktansichten, T.WarenkorbAdds = S.WarenkorbAdds, T.CheckoutStarts = S.CheckoutStarts, T.Kaeufe = S.Kaeufe, T.Umsatz = S.Umsatz, T.SucheOhneTreffer = S.SucheOhneTreffer, T.QuelleSystem = S.QuelleSystem, T.LadeBatchKey = S.LadeBatchKey, T.AktualisiertAm = S.AktualisiertAm, T.RowVersion = S.RowVersion, T.GeaendertVon = S.GeaendertVon, T.GeaendertAm = S.GeaendertAm
WHEN NOT MATCHED THEN INSERT (WebFunnelKey, DatumKey, KanalKey, Sitzungen, Produktansichten, WarenkorbAdds, CheckoutStarts, Kaeufe, Umsatz, SucheOhneTreffer, QuelleSystem, LadeBatchKey, AktualisiertAm, RowVersion, GeaendertVon, GeaendertAm) VALUES (S.WebFunnelKey, S.DatumKey, S.KanalKey, S.Sitzungen, S.Produktansichten, S.WarenkorbAdds, S.CheckoutStarts, S.Kaeufe, S.Umsatz, S.SucheOhneTreffer, S.QuelleSystem, S.LadeBatchKey, S.AktualisiertAm, S.RowVersion, S.GeaendertVon, S.GeaendertAm);

-- Delta FactPlan (MSSQL): Staging 'FactPlan_stg' laden (nur AktualisiertAm > @SeitAktualisiert), dann MERGE:
MERGE FactPlan AS T
USING FactPlan_stg AS S ON (T.KPIKey = S.KPIKey AND T.Jahr = S.Jahr AND T.Monat = S.Monat)
WHEN MATCHED THEN UPDATE SET T.StandortKey = S.StandortKey, T.KalenderId = S.KalenderId, T.Planwert = S.Planwert, T.QuelleSystem = S.QuelleSystem, T.LadeBatchKey = S.LadeBatchKey, T.AktualisiertAm = S.AktualisiertAm, T.RowVersion = S.RowVersion, T.GeaendertVon = S.GeaendertVon, T.GeaendertAm = S.GeaendertAm
WHEN NOT MATCHED THEN INSERT (PlanKey, KPIKey, Jahr, Monat, StandortKey, KalenderId, Planwert, QuelleSystem, LadeBatchKey, AktualisiertAm, RowVersion, GeaendertVon, GeaendertAm) VALUES (S.PlanKey, S.KPIKey, S.Jahr, S.Monat, S.StandortKey, S.KalenderId, S.Planwert, S.QuelleSystem, S.LadeBatchKey, S.AktualisiertAm, S.RowVersion, S.GeaendertVon, S.GeaendertAm);

-- Delta FactKPIWert (MSSQL): Staging 'FactKPIWert_stg' laden (nur AktualisiertAm > @SeitAktualisiert), dann MERGE:
MERGE FactKPIWert AS T
USING FactKPIWert_stg AS S ON (T.KPIKey = S.KPIKey AND T.Periode = S.Periode AND (T.Dimension = S.Dimension OR (T.Dimension IS NULL AND S.Dimension IS NULL)))
WHEN MATCHED THEN UPDATE SET T.Wert = S.Wert, T.QuelleSystem = S.QuelleSystem, T.LadeBatchKey = S.LadeBatchKey, T.AktualisiertAm = S.AktualisiertAm, T.RowVersion = S.RowVersion, T.GeaendertVon = S.GeaendertVon, T.GeaendertAm = S.GeaendertAm
WHEN NOT MATCHED THEN INSERT (KPIWertKey, KPIKey, Periode, Dimension, Wert, QuelleSystem, LadeBatchKey, AktualisiertAm, RowVersion, GeaendertVon, GeaendertAm) VALUES (S.KPIWertKey, S.KPIKey, S.Periode, S.Dimension, S.Wert, S.QuelleSystem, S.LadeBatchKey, S.AktualisiertAm, S.RowVersion, S.GeaendertVon, S.GeaendertAm);
