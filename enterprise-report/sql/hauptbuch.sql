-- =========================================================================
--  HAUPTBUCH-SICHT für die Abstimmbrücken (server/hauptbuch.js).
--  Liefert je Periode und Abstimmposition den absoluten FiBu-Saldo (Mio €).
--  PositionId muss den IDs in src/core/abstimmung.js (POSITIONEN[].id)
--  entsprechen: umsatz, wareneinsatz, personal, gesamtkosten, bestaende,
--  rueckstell, eigenkapital, bilanzsumme, liquide, cashflow.
--
--  Beispiel-Sicht: Kontensalden auf Abstimmpositionen mappen. An deine
--  Kontenrahmen-/Periodenlogik anpassen.
-- =========================================================================
CREATE OR ALTER VIEW ctrl.vw_Hauptbuch AS
SELECT
    s.Periode,
    m.PositionId,
    SUM(s.Saldo) / 1000000.0 AS Saldo          -- in Mio €
FROM fibu.Kontensalden          AS s
JOIN ctrl.MapKontoPosition      AS m  ON m.Konto = s.Konto
GROUP BY s.Periode, m.PositionId;
GO
