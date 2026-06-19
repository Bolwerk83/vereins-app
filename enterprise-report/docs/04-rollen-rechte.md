# 04 · Rollen- & Rechte-Konzept

Definiert in `src/core/rbac.js`. Zwei Schutzstufen, die unabhängig wirken.

## Stufe 1 — Bereichssichtbarkeit (RBAC)

Jede Rolle hat ein Feld `bereiche`:
- `'*'` → sieht alle Fachbereiche.
- `['GF','VK']` → sieht nur diese (z. B. Bereichsleiter Verkauf + Konzern).

`baumFuerRolle()` schneidet den Berichtsbaum entsprechend zu — ein
Bereichsleiter Logistik sieht den Einkaufszweig gar nicht erst.

## Stufe 2 — Object-Level-Security (Feldebene)

Einzelne **KPIs** können zusätzlich geschützt sein, unabhängig vom Bereich:

```js
personalkosten: { …, security: ['GF', 'HR', 'FIN'] }
```

`darfKpi(rolle, kpi)` prüft das über das Feld `kontext` der Rolle. Wer keine
Berechtigung hat, sieht die Kachel als **🔒 gesperrt** — der Knoten bleibt
sichtbar, der sensible Wert nicht. (Genau die HR-Einschränkung aus der
Berichtsvorlage.)

## Rollenmatrix (Auslieferungsstand)

| Rolle | Bereiche | Kontext (OLS) | sieht Personalkosten? |
|-------|----------|---------------|------------------------|
| Geschäftsführung | alle | GF, HR, FIN | ✅ |
| Controlling | alle | FIN | ❌ (nur FIN-Kontext, nicht HR) |
| Bereichsleiter Verkauf | GF, VK | – | ❌ |
| Bereichsleiter HR | GF, HR | HR | ✅ |
| Mitarbeiter | VK, LOG | – | ❌ |
| Administrator | alle | GF, HR, FIN | ✅ |

> In der Demo oben rechts die **Rolle umschalten** — Baum und gesperrte
> Kacheln ändern sich live.

## Später: echte Anbindung

Die Rolle kommt heute aus einem Umschalter. Produktiv ersetzt man das durch:
- **Windows-/Entra-ID-Login** → Gruppen → Rollen-Mapping, oder
- eine **MSSQL-Benutzerverwaltung** (Tabelle `User`→`Rolle`→`Bereich`).

Die Engine ändert sich dabei nicht — nur die Herkunft des `rolle`-Objekts.
