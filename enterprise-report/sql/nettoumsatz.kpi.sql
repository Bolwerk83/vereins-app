/* =========================================================================
   KPI: Nettoumsatz       (Datei: sql/nettoumsatz.kpi.sql)
   Einheit: eur_mio  (Wert in Millionen EUR)
   Abhängigkeiten: keine — gemessene Basiskennzahl
   Logik: Bruttoumsatz − Erlösschmälerungen, konsolidiert in EUR.
   ========================================================================= */
SELECT
    CAST(p.Jahr AS NVARCHAR(10))                                   AS periode,
    SUM(u.BruttoUmsatzEUR - u.ErloesschmaelerungEUR) / 1000000.0   AS wert
FROM dbo.FaktUmsatz       AS u
JOIN dbo.DimPeriode       AS p ON p.PeriodeKey = u.PeriodeKey
JOIN dbo.DimGesellschaft  AS g ON g.GesellschaftKey = u.GesellschaftKey
WHERE (@periode IS NULL OR CAST(p.Jahr AS NVARCHAR(10)) = @periode)
GROUP BY p.Jahr
ORDER BY periode;

/* Hinweis Konsolidierung: CHF-Gesellschaften vorab über DimWechselkurs
   (Stichtags- oder Durchschnittskurs laut Wizard-Konfiguration) in EUR
   umrechnen — idealerweise bereits in der View dbo.FaktUmsatz (…EUR-Spalten). */
