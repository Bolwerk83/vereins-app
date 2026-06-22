/* =========================================================================
   Read-only Reporting-Login für das Backend (SQL-Login).
   Im SQL Server Management Studio (SSMS) gegen die master-DB ausführen,
   dann den db_datareader-Teil in der Reporting-Datenbank.
   Least Privilege: NUR lesen — das Reporting braucht keine Schreibrechte.
   ========================================================================= */

-- 1) Login auf Server-Ebene (in master)
USE master;
GO
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'report_reader')
BEGIN
    CREATE LOGIN [report_reader]
        WITH PASSWORD = N'BITTE-STARKES-PASSWORT-SETZEN',
             CHECK_POLICY = ON;
END
GO

-- 2) Benutzer + nur-Lese-Rolle in der Reporting-Datenbank
USE [ERP_DWH];   -- <-- auf deine Datenbank anpassen (= MSSQL_DATABASE)
GO
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'report_reader')
BEGIN
    CREATE USER [report_reader] FOR LOGIN [report_reader];
END
GO
ALTER ROLE [db_datareader] ADD MEMBER [report_reader];
GO

/* Optional, falls die KPI-SQLs nur bestimmte Views/Schemas lesen sollen
   (empfohlen: ein dediziertes Reporting-Schema, z. B. rpt):
   GRANT SELECT ON SCHEMA::rpt TO [report_reader];
*/

-- 3) Prüfen
-- SELECT name, type_desc FROM sys.database_principals WHERE name = 'report_reader';
