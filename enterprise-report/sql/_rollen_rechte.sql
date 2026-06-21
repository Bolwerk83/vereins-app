/* =========================================================================
   ROLLEN & RECHTE — Persistenz in MSSQL (Gruppen, Bereiche, Datenfreigaben,
   Mitglieder) + eine Auflösungs-View, die je Benutzer die EFFEKTIVEN Rechte
   als Vereinigung aller seiner Gruppen liefert.

   Spiegelt 1:1 das Tool-Modell (src/core/gruppen.js):
     Gruppe        = { name, beschreibung, alleBereiche }
     GruppeBereich = sichtbare Fachbereiche (E2-Codes), falls nicht "alle"
     GruppeKontext = Object-Level-Security-Freigaben (GF / HR / FIN)
     GruppeMitglied= Namen/Logins (vom Admin im Tool gepflegt)

   Im SSMS gegen die Reporting-Datenbank (= MSSQL_DATABASE, z. B. ERP_DWH)
   ausführen. Idempotent: kann mehrfach laufen.
   ========================================================================= */

USE [ERP_DWH];   -- <-- auf deine Datenbank anpassen (= MSSQL_DATABASE)
GO

-- Eigenes Schema, sauber vom ERP getrennt.
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'sec')
    EXEC('CREATE SCHEMA sec');
GO

/* ---------- 1) Gruppen ---------------------------------------------------- */
IF OBJECT_ID(N'sec.Gruppe', N'U') IS NULL
BEGIN
    CREATE TABLE sec.Gruppe (
        GruppeId      INT IDENTITY(1,1) CONSTRAINT PK_Gruppe PRIMARY KEY,
        Code          NVARCHAR(40)  NOT NULL CONSTRAINT UQ_Gruppe_Code UNIQUE,  -- z. B. 'g-gf'
        Name          NVARCHAR(120) NOT NULL,
        Beschreibung  NVARCHAR(400) NULL,
        AlleBereiche  BIT           NOT NULL CONSTRAINT DF_Gruppe_Alle DEFAULT (0), -- 1 = '*'
        IstVorlage    BIT           NOT NULL CONSTRAINT DF_Gruppe_Vorlage DEFAULT (0),
        GeaendertAm   DATETIME2(0)  NOT NULL CONSTRAINT DF_Gruppe_Geaendert DEFAULT (SYSUTCDATETIME())
    );
END
GO

/* ---------- 2) Sichtbare Fachbereiche (nur wenn AlleBereiche = 0) --------- */
IF OBJECT_ID(N'sec.GruppeBereich', N'U') IS NULL
BEGIN
    CREATE TABLE sec.GruppeBereich (
        GruppeId     INT          NOT NULL,
        BereichCode  NVARCHAR(10) NOT NULL,   -- E2-Code: VK, EK, PR, FIN …
        CONSTRAINT PK_GruppeBereich PRIMARY KEY (GruppeId, BereichCode),
        CONSTRAINT FK_GruppeBereich_Gruppe FOREIGN KEY (GruppeId)
            REFERENCES sec.Gruppe (GruppeId) ON DELETE CASCADE
    );
END
GO

/* ---------- 3) Object-Level-Security-Freigaben (GF / HR / FIN) ------------ */
IF OBJECT_ID(N'sec.GruppeKontext', N'U') IS NULL
BEGIN
    CREATE TABLE sec.GruppeKontext (
        GruppeId    INT          NOT NULL,
        KontextTag  NVARCHAR(10) NOT NULL,    -- GF | HR | FIN
        CONSTRAINT PK_GruppeKontext PRIMARY KEY (GruppeId, KontextTag),
        CONSTRAINT FK_GruppeKontext_Gruppe FOREIGN KEY (GruppeId)
            REFERENCES sec.Gruppe (GruppeId) ON DELETE CASCADE
    );
END
GO

/* ---------- 4) Mitglieder (Namen/Logins) --------------------------------- */
IF OBJECT_ID(N'sec.GruppeMitglied', N'U') IS NULL
BEGIN
    CREATE TABLE sec.GruppeMitglied (
        GruppeId    INT           NOT NULL,
        Login       NVARCHAR(120) NOT NULL,   -- 'm.mustermann' oder AD-Konto
        AufgenommenAm DATETIME2(0) NOT NULL CONSTRAINT DF_Mitglied_Am DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_GruppeMitglied PRIMARY KEY (GruppeId, Login),
        CONSTRAINT FK_GruppeMitglied_Gruppe FOREIGN KEY (GruppeId)
            REFERENCES sec.Gruppe (GruppeId) ON DELETE CASCADE
    );
END
GO

/* =========================================================================
   5) AUFLÖSUNG — effektive Rechte je Benutzer (Vereinigung aller Gruppen).
      Genau die Logik aus effektiveRolleFuerName():
        - hat irgendeine Gruppe AlleBereiche=1  -> AlleBereiche=1
        - sonst: distinkte Liste der Bereichscodes (kommagetrennt)
        - Kontext-Tags: distinkte Vereinigung
   ========================================================================= */
CREATE OR ALTER VIEW sec.vw_BenutzerRechte
AS
WITH m AS (
    SELECT DISTINCT gm.Login, gm.GruppeId
    FROM sec.GruppeMitglied gm
)
SELECT
    m.Login,
    CAST(MAX(CAST(g.AlleBereiche AS INT)) AS BIT)                       AS AlleBereiche,
    STUFF((
        SELECT DISTINCT N',' + gb.BereichCode
        FROM m m2
        JOIN sec.GruppeBereich gb ON gb.GruppeId = m2.GruppeId
        WHERE m2.Login = m.Login
        FOR XML PATH(N'')), 1, 1, N'')                                  AS Bereiche,
    STUFF((
        SELECT DISTINCT N',' + gk.KontextTag
        FROM m m3
        JOIN sec.GruppeKontext gk ON gk.GruppeId = m3.GruppeId
        WHERE m3.Login = m.Login
        FOR XML PATH(N'')), 1, 1, N'')                                  AS Kontext,
    STUFF((
        SELECT DISTINCT N' + ' + g2.Name
        FROM m m4
        JOIN sec.Gruppe g2 ON g2.GruppeId = m4.GruppeId
        WHERE m4.Login = m.Login
        FOR XML PATH(N'')), 1, 3, N'')                                  AS Gruppen
FROM m
JOIN sec.Gruppe g ON g.GruppeId = m.GruppeId
GROUP BY m.Login;
GO

/* =========================================================================
   6) SEED — die im Tool vordefinierten Vorlagen (ohne Mitglieder).
      MERGE = idempotent: legt fehlende Gruppen an, aktualisiert Texte.
      Mitglieder fügst du anschließend im Tool ODER per INSERT (s. u.) hinzu.
   ========================================================================= */
MERGE sec.Gruppe AS z
USING (VALUES
    (N'g-gf',          N'Geschäftsführung',         N'Vollzugriff auf alle Bereiche und alle vertraulichen Kennzahlen.', 1),
    (N'g-controlling', N'Controlling',              N'Alle Bereiche und Finanzzahlen – ohne Personaldetails.',           1),
    (N'g-finanzen',    N'Finanzen & Buchhaltung',   N'Finanz-, Abschluss- und Treasury-Bereiche inkl. Ergebniszahlen.',  0),
    (N'g-vertrieb',    N'Vertrieb & Marketing',     N'Markt-, Kunden-, Service- und Kampagnensicht.',                    0),
    (N'g-supply',      N'Produktion & Supply Chain',N'Einkauf, Produktion, Planung, Logistik, Bestände, Qualität.',      0),
    (N'g-personal',    N'Personal (HR)',            N'HR- und Personalcontrolling inkl. vertraulicher Personaldaten.',   0),
    (N'g-leser',       N'Lesezugriff (Standard)',   N'Eingeschränkte Lesesicht ohne vertrauliche Kennzahlen.',           0)
) AS q (Code, Name, Beschreibung, AlleBereiche)
ON z.Code = q.Code
WHEN MATCHED THEN UPDATE SET z.Name = q.Name, z.Beschreibung = q.Beschreibung,
    z.AlleBereiche = q.AlleBereiche, z.IstVorlage = 1, z.GeaendertAm = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (Code, Name, Beschreibung, AlleBereiche, IstVorlage)
    VALUES (q.Code, q.Name, q.Beschreibung, q.AlleBereiche, 1);
GO

-- Bereiche je Vorlage (nur für die nicht-"alle"-Gruppen) neu setzen.
;WITH v AS (
    SELECT g.GruppeId, g.Code FROM sec.Gruppe g
)
DELETE gb FROM sec.GruppeBereich gb
JOIN v ON v.GruppeId = gb.GruppeId
WHERE v.Code IN (N'g-finanzen', N'g-vertrieb', N'g-supply', N'g-personal', N'g-leser');
GO

INSERT INTO sec.GruppeBereich (GruppeId, BereichCode)
SELECT g.GruppeId, x.BereichCode
FROM (VALUES
    (N'g-finanzen', N'FIN'), (N'g-finanzen', N'FIBU'), (N'g-finanzen', N'KON'),
    (N'g-finanzen', N'KLR'), (N'g-finanzen', N'LIQ'),  (N'g-finanzen', N'TRE'),
    (N'g-vertrieb', N'VK'),  (N'g-vertrieb', N'VC'),   (N'g-vertrieb', N'MKT'), (N'g-vertrieb', N'SVC'),
    (N'g-supply',   N'EK'),  (N'g-supply',   N'PR'),   (N'g-supply',   N'PP'),
    (N'g-supply',   N'LOG'), (N'g-supply',   N'SCC'),  (N'g-supply',   N'QM'),
    (N'g-personal', N'HR'),  (N'g-personal', N'PC'),
    (N'g-leser',    N'VK'),  (N'g-leser',    N'LOG')
) AS x (Code, BereichCode)
JOIN sec.Gruppe g ON g.Code = x.Code;
GO

-- Datenfreigaben (Object-Level-Security) je Vorlage neu setzen.
DELETE FROM sec.GruppeKontext;
GO
INSERT INTO sec.GruppeKontext (GruppeId, KontextTag)
SELECT g.GruppeId, x.KontextTag
FROM (VALUES
    (N'g-gf', N'GF'), (N'g-gf', N'HR'), (N'g-gf', N'FIN'),
    (N'g-controlling', N'FIN'),
    (N'g-finanzen', N'FIN'),
    (N'g-personal', N'HR')
) AS x (Code, KontextTag)
JOIN sec.Gruppe g ON g.Code = x.Code;
GO

/* =========================================================================
   7) Mitglieder pflegen — Beispiel (auskommentiert):

   INSERT INTO sec.GruppeMitglied (GruppeId, Login)
   SELECT GruppeId, N'm.mustermann' FROM sec.Gruppe WHERE Code = N'g-controlling';

   Prüfen:
   SELECT * FROM sec.vw_BenutzerRechte WHERE Login = N'm.mustermann';
   -- -> AlleBereiche | Bereiche | Kontext | Gruppen
   ========================================================================= */

-- Read-only Reporting-Login darf die Auflösung lesen (siehe _setup_readonly_login.sql):
IF EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'report_reader')
BEGIN
    GRANT SELECT ON OBJECT::sec.vw_BenutzerRechte TO [report_reader];
END
GO
