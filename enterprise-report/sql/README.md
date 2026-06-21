# SQL-Vertrag — so lieferst DU die Zahlen

Jede gemessene KPI hat **genau eine** SQL-Datei: `sql/<sqlRef>.kpi.sql`.
Den `sqlRef`-Namen legt die KPI-Registry fest (`src/core/kpiRegistry.js`,
Feld `sqlRef`). Abgeleitete KPIs (z. B. `dbQuote`, `wareneinsatzquote`)
brauchen **keine** SQL-Datei — sie werden aus ihren Abhängigkeiten berechnet.

## Der Vertrag (Spaltennamen sind verbindlich)

Eine KPI-SQL liefert **eine Kennzahl je Periode** mit exakt diesen Spalten:

| Spalte    | Typ            | Bedeutung                                  |
|-----------|----------------|--------------------------------------------|
| `periode` | NVARCHAR/INT   | Periodenschlüssel (Jahr, `YYYY-MM`, …)     |
| `wert`    | DECIMAL/FLOAT  | der Kennzahlwert in der KPI-Einheit        |

Optional, aber empfohlen für Drill-down:
| `dimension` | NVARCHAR | Aufrisskriterium (Kanal, Warengruppe, Standort …) |

> **Einheit beachten:** Liefere den Wert in der in der Registry hinterlegten
> Einheit. `eur_mio` → in **Millionen** (52.0, nicht 52000000). `percent` →
> als **Prozentzahl** (38.1, nicht 0.381).

## Parameter

Das Backend übergibt benannte Parameter:
- `@periode` — gewünschte Periode (oder leer = alle Perioden für die Historie)

## Detailberichte (Ebene 4)

Detailtabellen liegen in `sql/detail_<key>.sql` und liefern beliebige
Spalten (frei), die 1:1 als Tabelle gerendert werden. Der `<key>` stammt
aus dem Berichtsbaum (`detail:`-Feld in `src/core/reportTree.js`).

## Ablauf

1. `_template.kpi.sql` kopieren → `sql/<sqlRef>.kpi.sql`.
2. `SELECT` gegen die echten ERP/DWH-Tabellen schreiben, Vertrag einhalten.
3. Backend (`server/`) verbinden → fertig. Kein Frontend-Code nötig.

## Rollen & Rechte (Gruppen, Mitglieder)

`_rollen_rechte.sql` legt im Schema `sec` die Tabellen **Gruppe**,
**GruppeBereich**, **GruppeKontext** und **GruppeMitglied** an und befüllt
die vordefinierten Gruppen (Vorlagen, ohne Mitglieder). Die View
`sec.vw_BenutzerRechte` löst je Benutzer die **effektiven Rechte** als
Vereinigung aller seiner Gruppen auf — identisch zur Tool-Logik
(`effektiveRolleFuerName()` in `src/core/gruppen.js`).

- Mitglieder pflegst du im Tool (Reiter **Rollen & Rechte**) oder per
  `INSERT INTO sec.GruppeMitglied`.
- Das Backend liest später über `GET /api/benutzer/:login/rechte` bzw.
  `GET /api/gruppen` direkt aus diesen Tabellen — heute liefert das Tool die
  Gruppen noch aus dem Browser (localStorage), der Übergang ist nahtlos.

Ausführen im SSMS gegen `ERP_DWH` (idempotent, mehrfach lauffähig).
