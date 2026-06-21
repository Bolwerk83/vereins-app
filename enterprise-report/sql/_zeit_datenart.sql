/* =========================================================================
   ZEIT & DATENART im DWH — Dimensionen + Steuertabellen (Star-Schema).

   Verankert das Controlling-Datenmodell aus dem Tool (periodenmodell.js)
   in der Datenbank:
     dim.DimDatenart      = Ist / Tagesreporting / Plan / Forecast
     dim.DimDatumssicht   = Beleg-/Bestell-/Liefer-/Zahldatum (+ Faktspalte)
     ctrl.PeriodenHerkunft= Zuweisungstabelle: je Monat -> Datenart
     ctrl.PlanKonto       = im Tagesreporting mit Plan aufgefüllte Konten
   plus View ctrl.vw_PeriodenHerkunft (Monat + Datenart-Klartext).

   Im SSMS gegen die Reporting-DB ausführen. Idempotent (mehrfach lauffähig).
   ========================================================================= */
USE [ERP_DWH];   -- <-- auf deine Datenbank anpassen
GO
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'dim')  EXEC('CREATE SCHEMA dim');
GO
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'ctrl') EXEC('CREATE SCHEMA ctrl');
GO

/* ---------- 1) DimDatenart ------------------------------------------------ */
IF OBJECT_ID(N'dim.DimDatenart', N'U') IS NULL
BEGIN
    CREATE TABLE dim.DimDatenart (
        DatenartId   TINYINT       NOT NULL CONSTRAINT PK_DimDatenart PRIMARY KEY,
        Code         NVARCHAR(20)  NOT NULL CONSTRAINT UQ_DimDatenart_Code UNIQUE,
        Name         NVARCHAR(60)  NOT NULL,
        Kurz         NVARCHAR(12)  NOT NULL,
        Reihenfolge  TINYINT       NOT NULL,
        AmpelStatus  CHAR(1)       NOT NULL,            -- g/a/n (Anzeige)
        IstFinal     BIT           NOT NULL,            -- 1 = verbindlich (Ist)
        Beschreibung NVARCHAR(200) NULL
    );
END
GO
MERGE dim.DimDatenart AS z
USING (VALUES
    (1, N'ist',            N'Ist (Buchhaltung)',            N'Ist',    1, 'g', 1, N'Abgeschlossener Monat aus Buchhaltungskonten – verbindlich.'),
    (2, N'tagesreporting', N'Tagesreporting (Auftrag+Plan)', N'Tag-Rep',2, 'a', 0, N'Laufender Monat: Auftragsdaten, ergänzt um Plan einzelner Konten.'),
    (3, N'plan',           N'Plan',                          N'Plan',   3, 'n', 0, N'Zukünftiger Monat aus der Planung.'),
    (4, N'forecast',       N'Forecast (FC)',                 N'FC',     4, 'n', 0, N'Zukünftiger Monat aus dem laufenden Forecast.')
) AS q (DatenartId, Code, Name, Kurz, Reihenfolge, AmpelStatus, IstFinal, Beschreibung)
ON z.DatenartId = q.DatenartId
WHEN MATCHED THEN UPDATE SET z.Code=q.Code, z.Name=q.Name, z.Kurz=q.Kurz, z.Reihenfolge=q.Reihenfolge,
    z.AmpelStatus=q.AmpelStatus, z.IstFinal=q.IstFinal, z.Beschreibung=q.Beschreibung
WHEN NOT MATCHED THEN INSERT (DatenartId, Code, Name, Kurz, Reihenfolge, AmpelStatus, IstFinal, Beschreibung)
    VALUES (q.DatenartId, q.Code, q.Name, q.Kurz, q.Reihenfolge, q.AmpelStatus, q.IstFinal, q.Beschreibung);
GO

/* ---------- 2) DimDatumssicht (Periodenbezug) ----------------------------- */
IF OBJECT_ID(N'dim.DimDatumssicht', N'U') IS NULL
BEGIN
    CREATE TABLE dim.DimDatumssicht (
        DatumssichtId TINYINT      NOT NULL CONSTRAINT PK_DimDatumssicht PRIMARY KEY,
        Code          NVARCHAR(20) NOT NULL CONSTRAINT UQ_DimDatumssicht_Code UNIQUE,
        Name          NVARCHAR(40) NOT NULL,
        FaktSpalte    NVARCHAR(60) NOT NULL,   -- Datumsspalte in der Faktentabelle
        Hinweis       NVARCHAR(120) NULL,
        IstStandard   BIT          NOT NULL CONSTRAINT DF_Datumssicht_Std DEFAULT (0)
    );
END
GO
MERGE dim.DimDatumssicht AS z
USING (VALUES
    (1, N'belegdatum',   N'Belegdatum',   N'BelegDatum',   N'Rechnungs-/Belegdatum (Umsatz, GuV)', 1),
    (2, N'bestelldatum', N'Bestelldatum', N'BestellDatum', N'Auftragseingang – Frühindikator',     0),
    (3, N'lieferdatum',  N'Lieferdatum',  N'LieferDatum',  N'Lieferung/Realisierung – Logistik',   0),
    (4, N'zahldatum',    N'Zahldatum',    N'ZahlDatum',    N'Zahlungsfluss – Liquidität',          0)
) AS q (DatumssichtId, Code, Name, FaktSpalte, Hinweis, IstStandard)
ON z.DatumssichtId = q.DatumssichtId
WHEN MATCHED THEN UPDATE SET z.Code=q.Code, z.Name=q.Name, z.FaktSpalte=q.FaktSpalte, z.Hinweis=q.Hinweis, z.IstStandard=q.IstStandard
WHEN NOT MATCHED THEN INSERT (DatumssichtId, Code, Name, FaktSpalte, Hinweis, IstStandard)
    VALUES (q.DatumssichtId, q.Code, q.Name, q.FaktSpalte, q.Hinweis, q.IstStandard);
GO

/* ---------- 3) ctrl.PeriodenHerkunft (Zuweisungstabelle) ------------------ */
IF OBJECT_ID(N'ctrl.PeriodenHerkunft', N'U') IS NULL
BEGIN
    CREATE TABLE ctrl.PeriodenHerkunft (
        Periode     CHAR(7)  NOT NULL CONSTRAINT PK_PeriodenHerkunft PRIMARY KEY, -- 'YYYY-MM'
        DatenartId  TINYINT  NOT NULL,
        GeaendertAm DATETIME2(0) NOT NULL CONSTRAINT DF_PH_Geaendert DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT FK_PH_Datenart FOREIGN KEY (DatenartId) REFERENCES dim.DimDatenart (DatenartId)
    );
END
GO
-- Standard für das laufende Kalenderjahr seeden (nur fehlende Monate):
--   Vormonate = Ist, aktueller Monat = Tagesreporting, Folgemonate = Plan.
;WITH M AS (
    SELECT n AS MonatNr,
           CONCAT(YEAR(GETDATE()), '-', RIGHT('0' + CONVERT(VARCHAR(2), n), 2)) AS Periode
    FROM (VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12)) AS t(n)
)
INSERT INTO ctrl.PeriodenHerkunft (Periode, DatenartId)
SELECT M.Periode,
       CASE WHEN M.MonatNr <  MONTH(GETDATE()) THEN 1   -- Ist
            WHEN M.MonatNr =  MONTH(GETDATE()) THEN 2   -- Tagesreporting
            ELSE 3 END                                  -- Plan
FROM M
WHERE NOT EXISTS (SELECT 1 FROM ctrl.PeriodenHerkunft p WHERE p.Periode = M.Periode);
GO

/* ---------- 4) ctrl.PlanKonto (Planauffüllung im Tagesreporting) ---------- */
IF OBJECT_ID(N'ctrl.PlanKonto', N'U') IS NULL
BEGIN
    CREATE TABLE ctrl.PlanKonto (
        KontoCode      NVARCHAR(20)  NOT NULL CONSTRAINT PK_PlanKonto PRIMARY KEY,
        Bezeichnung    NVARCHAR(120) NULL,
        Aktiv          BIT           NOT NULL CONSTRAINT DF_PlanKonto_Aktiv DEFAULT (1)
    );
END
GO
MERGE ctrl.PlanKonto AS z
USING (VALUES
    (N'6200', N'Personalaufwand'), (N'6500', N'Energie/Raum'), (N'6900', N'Abschreibungen')
) AS q (KontoCode, Bezeichnung)
ON z.KontoCode = q.KontoCode
WHEN NOT MATCHED THEN INSERT (KontoCode, Bezeichnung) VALUES (q.KontoCode, q.Bezeichnung);
GO

/* ---------- 5) View: Periode + Datenart-Klartext -------------------------- */
CREATE OR ALTER VIEW ctrl.vw_PeriodenHerkunft
AS
SELECT p.Periode, d.Code AS DatenartCode, d.Name AS Datenart, d.Kurz, d.AmpelStatus, d.IstFinal
FROM ctrl.PeriodenHerkunft p
JOIN dim.DimDatenart d ON d.DatenartId = p.DatenartId;
GO

/* =========================================================================
   So VERANKERST du es im Reporting (Beispielmuster für eine KPI-SQL):

   DECLARE @sicht NVARCHAR(60) =
       (SELECT FaktSpalte FROM dim.DimDatumssicht WHERE Code = @datumssicht);

   -- Periode über die GEWÄHLTE Datumsspalte bilden und je Periode die
   -- hinterlegte Datenart mitführen:
   SELECT h.Periode,
          h.Datenart,                       -- Ist / Tagesreporting / Plan / FC
          SUM(f.Betrag) AS wert
   FROM fakt.Bewegung f
   JOIN ctrl.vw_PeriodenHerkunft h
        ON h.Periode = FORMAT(f.BelegDatum, 'yyyy-MM')   -- bzw. dynamisch @sicht
   GROUP BY h.Periode, h.Datenart;

   Read-only Reporting-Login lesen lassen (falls vorhanden):
   ========================================================================= */
IF EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'report_reader')
BEGIN
    GRANT SELECT ON OBJECT::ctrl.vw_PeriodenHerkunft TO [report_reader];
    GRANT SELECT ON OBJECT::dim.DimDatenart          TO [report_reader];
    GRANT SELECT ON OBJECT::dim.DimDatumssicht       TO [report_reader];
END
GO
