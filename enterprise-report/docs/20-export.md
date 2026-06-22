# Berichts-Export (PDF & Excel)

Designer-Reports lassen sich sauber exportieren — inкл. der eingebetteten
Tabellen-Blöcke. Rein clientseitig, ohne zusätzliche Abhängigkeit.

## PDF

`exportReportPdf(report, werte)` öffnet ein **eigenständiges Druckfenster** mit
dem fertig gerenderten Bericht (Titel, Lagebewertung, KPI-Zeilen mit Ampel,
Texte, Datentabellen, Maßnahmen) und Druck-CSS. Der Browser-Dialog speichert
das als PDF. Vorteil gegenüber „ganze Seite drucken": kein Editor-Chrome,
sauberes A4-Layout, und die Tabellen werden **vollständig** ausgegeben
(Virtualisierung wird beim Drucken ohnehin abgeschaltet).

## Excel

`exportReportExcel(report, werte)` erzeugt eine **Excel-kompatible Arbeitsmappe**
(`.xls`, von Excel/LibreOffice direkt zu öffnen) mit einer KPI-Übersicht
(Kennzahl · Ist · Ziel · Bewertung) und allen eingebetteten Datentabellen als
eigene Abschnitte.

## Tabellen-Blöcke

Beide Exporte laden die Datensätze der `tabelle`-Blöcke vorab quellenrein über
`ladeDatensatz` (Mock oder MSSQL), sodass die Inhalte im Export erscheinen.

## Bedienung

Im **🧩 Designer** unten am Bericht: **🖨 PDF** und **⤓ Excel**. Die gleiche
Export-Funktion lässt sich später auch im **Verteiler** als Anhang-Erzeuger
wiederverwenden.
