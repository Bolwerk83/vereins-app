# 06 · Erststart-Wizard

Modul `src/modules/wizard/SetupWizard.jsx`. Erscheint beim ersten Start
(Flag `er_setup_done` im LocalStorage; produktiv: in MSSQL).

## Was er fragt (5 Schritte)

1. **Unternehmen** — Firma, Währung, Geschäftsjahr, Konsolidierung
   (Stichtags-/Durchschnittskurs).
2. **Fachbereiche** — welche der Ebene-2-Bereiche in den Baum kommen.
3. **Datenquelle** — MSSQL-Server, Datenbank, Schema, Auth.
4. **Rollen** — welche Rollen aktiviert werden.
5. **Zusammenfassung** — zeigt die erzeugte `config.json` **und die Liste
   der SQL-Dateien, die du füllen musst**.

## Was er erzeugt

- eine **Konfiguration** (`config.json`), die Baum-Umfang und Verbindung
  beschreibt;
- die **Aufgabenliste** „diese `sql/*.kpi.sql` jetzt befüllen".

So entsteht der konkrete Berichtsbaum **aus Antworten**, nicht aus
Programmierung — genau der „Wizard, der fragt, wie er die Berichte
aufbauen soll".

## Ausbaustufen (später)

- Verbindungstest gegen MSSQL direkt im Wizard.
- KPI-Auswahl je Bereich (an/aus) statt fixer Liste.
- Generierung der SQL-Stub-Dateien (Template ausrollen) per Knopfdruck.
- Schreiben der Konfiguration nach MSSQL statt LocalStorage.
