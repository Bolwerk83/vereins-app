/* =========================================================================
   KPI: Lagerbestand      (Datei: sql/lagerbestand.kpi.sql)
   Einheit: eur_mio   ·   Richtung: tief_gut (Hebel #2: Bestandsabbau)
   Abhängigkeiten: keine — gemessene Basiskennzahl
   dimension: Warenbereich (für Detail "bestaende", Ebene 4)
   ========================================================================= */
SELECT
    CAST(p.Jahr AS NVARCHAR(10))            AS periode,
    wb.Warenbereich                          AS dimension,
    SUM(b.BestandswertEUR) / 1000000.0       AS wert
FROM dbo.FaktBestand   AS b
JOIN dbo.DimPeriode    AS p  ON p.PeriodeKey = b.PeriodeKey
JOIN dbo.DimWarenbereich AS wb ON wb.WarenbereichKey = b.WarenbereichKey
WHERE (@periode IS NULL OR CAST(p.Jahr AS NVARCHAR(10)) = @periode)
GROUP BY p.Jahr, wb.Warenbereich
ORDER BY periode, dimension;

/* Gesamtwert der KPI = SUM über alle dimension-Zeilen je periode.
   Das Backend aggregiert die dimension-Zeilen für die KPI-Kachel und
   nutzt die Einzelzeilen für den Detailbericht. */
