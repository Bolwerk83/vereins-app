# 00 · Konzept — wie das als EIN Projekt funktioniert

## Das Grundprinzip: metadaten-getrieben

Klassisch baut man jeden Bericht einzeln: Abfrage + Layout + Rechte +
Druckansicht, immer wieder. Das skaliert in einem unternehmensweiten Tool
nicht. Wir drehen es um:

> **Eine Kennzahl wird EINMAL beschrieben (Metadaten) und überall
> automatisch verwendet** — im Baum, in der Kachel, in der Ampel, im Trend,
> in der Druckansicht, in der Rechteprüfung.

Du lieferst nur zwei Dinge:
1. **Metadaten** je KPI (Name, Einheit, Ziel, Ampel-Richtung, Abhängigkeiten)
   — einmalig in `src/core/kpiRegistry.js`.
2. **SQL** je gemessener KPI — in `sql/<kpi>.kpi.sql`, festes Layout.

Alles andere (Baumdarstellung, Farben, Trends, Rechte, Historie, PDF)
erzeugt die Engine.

## Warum ein Projekt und nicht zehn Berichte

Weil alle Bausteine dieselben drei Kern-Artefakte teilen:

| Kern | Datei | Verantwortung |
|------|-------|---------------|
| **Struktur** | `core/reportTree.js` | Der Baum mit 5 Ebenen |
| **Logik** | `core/kpiRegistry.js` | KPIs, Ziele, Ampel, **Abhängigkeiten** |
| **Rechte** | `core/rbac.js` | Wer sieht welchen Bereich / welche KPI |

Module (Tree-Navigator, Management-Report, Wizard, später Forecast, Export,
Kommentare …) sind nur **Sichten** auf diesen Kern. Deshalb lassen sie sich
unabhängig entwickeln und später „zusammenführen" — sie kollidieren nicht,
weil die Wahrheit zentral liegt.

## Der rote Faden (fachlich, aus der Vorlage)

Das Tool transportiert eine Aussage, nicht nur Zahlen: *Wachstum über
Volumen, nicht über Ertrag.* Zwei Hebel dominieren —
**Wareneinsatzquote** (Einkauf + Produktion) und **Bestandsabbau**
(Logistik) — beide wirken doppelt auf **Ergebnis und Liquidität**. Diese
Logik ist in den KPI-Abhängigkeiten und im Management-Report abgebildet und
bleibt erhalten, egal welche Firma das Tool später nutzt.

## Trennung der Schichten (strikt)

- **Daten** (Mock / MSSQL) — nur Zahlen, keine Logik.
- **Logik** (`core/`) — Berechnung, Status, Rechte, Struktur.
- **Layout** (`modules/`, `components/`, `design/`) — nur Darstellung.

Diese Trennung ist dieselbe, die schon die VeloWerk-Vorlage nutzte
(`content` vs. `generate`). Sie ist die Voraussetzung dafür, dass du später
„nur die SQL vorbereitest".
