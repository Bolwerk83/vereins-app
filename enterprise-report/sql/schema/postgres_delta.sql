-- ============================================================
-- Delta-Beladung (postgres) — inkrementell über Wasserzeichen 'AktualisiertAm'.
-- Ablauf je Tabelle: Staging füllen (nur geänderte Zeilen) → MERGE/Upsert.
-- ============================================================

-- Delta FactVerkauf (Postgres): Staging 'factverkauf_stg' laden (nur AktualisiertAm > :seit), dann:
INSERT INTO factverkauf (verkaufkey, belegnr, position, datumkey, lieferdatumkey, produktkey, standortkey, kanalkey, kundekey, konditionsartkey, menge, bruttoumsatz, erloesschmaelerung, nettoumsatz, wareneinsatz, db1, quellesystem, ladebatchkey, aktualisiertam)
SELECT verkaufkey, belegnr, position, datumkey, lieferdatumkey, produktkey, standortkey, kanalkey, kundekey, konditionsartkey, menge, bruttoumsatz, erloesschmaelerung, nettoumsatz, wareneinsatz, db1, quellesystem, ladebatchkey, aktualisiertam FROM factverkauf_stg
ON CONFLICT (belegnr, position) DO UPDATE SET datumkey = EXCLUDED.datumkey, lieferdatumkey = EXCLUDED.lieferdatumkey, produktkey = EXCLUDED.produktkey, standortkey = EXCLUDED.standortkey, kanalkey = EXCLUDED.kanalkey, kundekey = EXCLUDED.kundekey, konditionsartkey = EXCLUDED.konditionsartkey, menge = EXCLUDED.menge, bruttoumsatz = EXCLUDED.bruttoumsatz, erloesschmaelerung = EXCLUDED.erloesschmaelerung, nettoumsatz = EXCLUDED.nettoumsatz, wareneinsatz = EXCLUDED.wareneinsatz, db1 = EXCLUDED.db1, quellesystem = EXCLUDED.quellesystem, ladebatchkey = EXCLUDED.ladebatchkey, aktualisiertam = EXCLUDED.aktualisiertam;

-- Delta FactWareneingang (Postgres): Staging 'factwareneingang_stg' laden (nur AktualisiertAm > :seit), dann:
INSERT INTO factwareneingang (wareneingangkey, bestellnr, position, lieferdatumkey, produktkey, lieferantkey, standortkey, menge, einstandswert, status, quellesystem, ladebatchkey, aktualisiertam)
SELECT wareneingangkey, bestellnr, position, lieferdatumkey, produktkey, lieferantkey, standortkey, menge, einstandswert, status, quellesystem, ladebatchkey, aktualisiertam FROM factwareneingang_stg
ON CONFLICT (bestellnr, position) DO UPDATE SET lieferdatumkey = EXCLUDED.lieferdatumkey, produktkey = EXCLUDED.produktkey, lieferantkey = EXCLUDED.lieferantkey, standortkey = EXCLUDED.standortkey, menge = EXCLUDED.menge, einstandswert = EXCLUDED.einstandswert, status = EXCLUDED.status, quellesystem = EXCLUDED.quellesystem, ladebatchkey = EXCLUDED.ladebatchkey, aktualisiertam = EXCLUDED.aktualisiertam;

-- Delta FactAuftrag (Postgres): Staging 'factauftrag_stg' laden (nur AktualisiertAm > :seit), dann:
INSERT INTO factauftrag (auftragkey, auftragnr, position, eingangdatumkey, lieferdatumkey, produktkey, kundekey, menge, auftragswert, status, quellesystem, ladebatchkey, aktualisiertam)
SELECT auftragkey, auftragnr, position, eingangdatumkey, lieferdatumkey, produktkey, kundekey, menge, auftragswert, status, quellesystem, ladebatchkey, aktualisiertam FROM factauftrag_stg
ON CONFLICT (auftragnr, position) DO UPDATE SET eingangdatumkey = EXCLUDED.eingangdatumkey, lieferdatumkey = EXCLUDED.lieferdatumkey, produktkey = EXCLUDED.produktkey, kundekey = EXCLUDED.kundekey, menge = EXCLUDED.menge, auftragswert = EXCLUDED.auftragswert, status = EXCLUDED.status, quellesystem = EXCLUDED.quellesystem, ladebatchkey = EXCLUDED.ladebatchkey, aktualisiertam = EXCLUDED.aktualisiertam;

-- Delta FactBestand (Postgres): Staging 'factbestand_stg' laden (nur AktualisiertAm > :seit), dann:
INSERT INTO factbestand (bestandkey, datumkey, standortkey, produktkey, bestandmenge, bestandswert, reichweitetage, quellesystem, ladebatchkey, aktualisiertam)
SELECT bestandkey, datumkey, standortkey, produktkey, bestandmenge, bestandswert, reichweitetage, quellesystem, ladebatchkey, aktualisiertam FROM factbestand_stg
ON CONFLICT (datumkey, standortkey, produktkey) DO UPDATE SET bestandmenge = EXCLUDED.bestandmenge, bestandswert = EXCLUDED.bestandswert, reichweitetage = EXCLUDED.reichweitetage, quellesystem = EXCLUDED.quellesystem, ladebatchkey = EXCLUDED.ladebatchkey, aktualisiertam = EXCLUDED.aktualisiertam;

-- Delta FactForderung (Postgres): Staging 'factforderung_stg' laden (nur AktualisiertAm > :seit), dann:
INSERT INTO factforderung (forderungkey, belegnr, stichtagkey, kundekey, faelligkeitkey, offenerbetrag, tageueberfaellig, mahnstufe, erwarteterausfall, quellesystem, ladebatchkey, aktualisiertam)
SELECT forderungkey, belegnr, stichtagkey, kundekey, faelligkeitkey, offenerbetrag, tageueberfaellig, mahnstufe, erwarteterausfall, quellesystem, ladebatchkey, aktualisiertam FROM factforderung_stg
ON CONFLICT (belegnr, stichtagkey) DO UPDATE SET kundekey = EXCLUDED.kundekey, faelligkeitkey = EXCLUDED.faelligkeitkey, offenerbetrag = EXCLUDED.offenerbetrag, tageueberfaellig = EXCLUDED.tageueberfaellig, mahnstufe = EXCLUDED.mahnstufe, erwarteterausfall = EXCLUDED.erwarteterausfall, quellesystem = EXCLUDED.quellesystem, ladebatchkey = EXCLUDED.ladebatchkey, aktualisiertam = EXCLUDED.aktualisiertam;

-- Delta FactZahlung (Postgres): Staging 'factzahlung_stg' laden (nur AktualisiertAm > :seit), dann:
INSERT INTO factzahlung (zahlungkey, referenz, faelligdatumkey, richtung, kategorie, betrag, istprog, quellesystem, ladebatchkey, aktualisiertam)
SELECT zahlungkey, referenz, faelligdatumkey, richtung, kategorie, betrag, istprog, quellesystem, ladebatchkey, aktualisiertam FROM factzahlung_stg
ON CONFLICT (referenz) DO UPDATE SET faelligdatumkey = EXCLUDED.faelligdatumkey, richtung = EXCLUDED.richtung, kategorie = EXCLUDED.kategorie, betrag = EXCLUDED.betrag, istprog = EXCLUDED.istprog, quellesystem = EXCLUDED.quellesystem, ladebatchkey = EXCLUDED.ladebatchkey, aktualisiertam = EXCLUDED.aktualisiertam;

-- Delta FactBesuch (Postgres): Staging 'factbesuch_stg' laden (nur AktualisiertAm > :seit), dann:
INSERT INTO factbesuch (besuchkey, datumkey, stunde, standortkey, besucher, kaeufe, umsatz, quellesystem, ladebatchkey, aktualisiertam)
SELECT besuchkey, datumkey, stunde, standortkey, besucher, kaeufe, umsatz, quellesystem, ladebatchkey, aktualisiertam FROM factbesuch_stg
ON CONFLICT (datumkey, stunde, standortkey) DO UPDATE SET besucher = EXCLUDED.besucher, kaeufe = EXCLUDED.kaeufe, umsatz = EXCLUDED.umsatz, quellesystem = EXCLUDED.quellesystem, ladebatchkey = EXCLUDED.ladebatchkey, aktualisiertam = EXCLUDED.aktualisiertam;

-- Delta FactWebSession (Postgres): Staging 'factwebsession_stg' laden (nur AktualisiertAm > :seit), dann:
INSERT INTO factwebsession (websessionkey, datumkey, kanalkey, geraet, sitzungen, nutzer, neuenutzer, seitenaufrufe, absprungprozent, dauersek, quellesystem, ladebatchkey, aktualisiertam)
SELECT websessionkey, datumkey, kanalkey, geraet, sitzungen, nutzer, neuenutzer, seitenaufrufe, absprungprozent, dauersek, quellesystem, ladebatchkey, aktualisiertam FROM factwebsession_stg
ON CONFLICT (datumkey, kanalkey, geraet) DO UPDATE SET sitzungen = EXCLUDED.sitzungen, nutzer = EXCLUDED.nutzer, neuenutzer = EXCLUDED.neuenutzer, seitenaufrufe = EXCLUDED.seitenaufrufe, absprungprozent = EXCLUDED.absprungprozent, dauersek = EXCLUDED.dauersek, quellesystem = EXCLUDED.quellesystem, ladebatchkey = EXCLUDED.ladebatchkey, aktualisiertam = EXCLUDED.aktualisiertam;

-- Delta FactWebFunnel (Postgres): Staging 'factwebfunnel_stg' laden (nur AktualisiertAm > :seit), dann:
INSERT INTO factwebfunnel (webfunnelkey, datumkey, kanalkey, sitzungen, produktansichten, warenkorbadds, checkoutstarts, kaeufe, umsatz, sucheohnetreffer, quellesystem, ladebatchkey, aktualisiertam)
SELECT webfunnelkey, datumkey, kanalkey, sitzungen, produktansichten, warenkorbadds, checkoutstarts, kaeufe, umsatz, sucheohnetreffer, quellesystem, ladebatchkey, aktualisiertam FROM factwebfunnel_stg
ON CONFLICT (datumkey, kanalkey) DO UPDATE SET sitzungen = EXCLUDED.sitzungen, produktansichten = EXCLUDED.produktansichten, warenkorbadds = EXCLUDED.warenkorbadds, checkoutstarts = EXCLUDED.checkoutstarts, kaeufe = EXCLUDED.kaeufe, umsatz = EXCLUDED.umsatz, sucheohnetreffer = EXCLUDED.sucheohnetreffer, quellesystem = EXCLUDED.quellesystem, ladebatchkey = EXCLUDED.ladebatchkey, aktualisiertam = EXCLUDED.aktualisiertam;

-- Delta FactPlan (Postgres): Staging 'factplan_stg' laden (nur AktualisiertAm > :seit), dann:
INSERT INTO factplan (plankey, kpikey, jahr, monat, standortkey, kalenderid, planwert, quellesystem, ladebatchkey, aktualisiertam)
SELECT plankey, kpikey, jahr, monat, standortkey, kalenderid, planwert, quellesystem, ladebatchkey, aktualisiertam FROM factplan_stg
ON CONFLICT (kpikey, jahr, monat) DO UPDATE SET standortkey = EXCLUDED.standortkey, kalenderid = EXCLUDED.kalenderid, planwert = EXCLUDED.planwert, quellesystem = EXCLUDED.quellesystem, ladebatchkey = EXCLUDED.ladebatchkey, aktualisiertam = EXCLUDED.aktualisiertam;

-- Delta FactKPIWert (Postgres): Staging 'factkpiwert_stg' laden (nur AktualisiertAm > :seit), dann:
INSERT INTO factkpiwert (kpiwertkey, kpikey, periode, dimension, wert, quellesystem, ladebatchkey, aktualisiertam)
SELECT kpiwertkey, kpikey, periode, dimension, wert, quellesystem, ladebatchkey, aktualisiertam FROM factkpiwert_stg
ON CONFLICT (kpikey, periode, dimension) DO UPDATE SET wert = EXCLUDED.wert, quellesystem = EXCLUDED.quellesystem, ladebatchkey = EXCLUDED.ladebatchkey, aktualisiertam = EXCLUDED.aktualisiertam;
