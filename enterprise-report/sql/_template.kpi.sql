/* =========================================================================
   KPI: <NAME>            (Datei: sql/<sqlRef>.kpi.sql)
   Einheit laut Registry: <eur_mio | percent | days | count | ...>
   Abhängigkeiten:        keine (gemessene Kennzahl)
   -------------------------------------------------------------------------
   VERTRAG: Rückgabe MUSS die Spalten  periode, wert  enthalten.
            Optional: dimension (für Drill-down/Detail).
   Parameter: @periode  (NULL/leer = alle Perioden, für Historisierung)
   Ziel-DBMS: Microsoft SQL Server (T-SQL)
   ========================================================================= */
SELECT
    CAST(f.GeschaeftsjahrJahr AS NVARCHAR(10))  AS periode,
    SUM(f.Wert) / 1000000.0                     AS wert        -- Beispiel: in Mio
FROM dbo.FaktTabelle AS f
WHERE (@periode IS NULL OR CAST(f.GeschaeftsjahrJahr AS NVARCHAR(10)) = @periode)
GROUP BY f.GeschaeftsjahrJahr
ORDER BY periode;
