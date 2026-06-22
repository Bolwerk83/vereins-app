# 07 · Roadmap — wie wir vorgehen

Inkrementell: erst der lauffähige Rahmen (steht), dann echte Daten, dann
Funktionsmodule. Jede Phase ist für sich nutzbar.

## Phase 0 — Fundament ✅ (dieser Stand)
- Berichtsbaum mit 5 Ebenen, Tree-Navigator, Management-Report, Wizard.
- KPI-Registry mit Abhängigkeiten, Ampel-/Trendlogik.
- Rollen-/Rechte-Konzept (RBAC + Object-Level-Security).
- Einheitliche Design-Tokens. Mock-Daten + MSSQL-Backend-Stub + SQL-Vertrag.

## Phase 1 — Echte Daten (dein Beitrag: SQL)
- `server/.env` mit MSSQL-Verbindung füllen.
- `sql/<kpi>.kpi.sql` je gemessener KPI nach dem Vertrag schreiben.
- `VITE_DATA_SOURCE=mssql` → Demo läuft auf echten Zahlen.
- **Abnahme:** Konzern-KPIs stimmen mit dem Controlling überein.

## Phase 2 — Fachbereiche vervollständigen
- Pro Bereich Themenbereiche (E3) + Detailberichte (E4) ausdefinieren.
- KPI-Katalog je Bereich finalisieren (Ziele mit den Bereichsleitern).
- Detail-SQL (`sql/detail_*.sql`) liefern.

## Phase 3 — Funktionsmodule
- **Export** (PDF/Excel) · **Forecast** (Plan/Ist) · **Kommentare/Maßnahmen**.
- **Alerts** auf rote Ampeln.

## Phase 4 — Betrieb & Governance
- Login (Entra/AD) → Rollen-Mapping ablösen.
- **Admin-Modul**: Registry/Baum über UI pflegen (statt Code).
- Historisierung in MSSQL (Snapshot je Periode), Audit/Datenschutz (HR).

## Arbeitsweise mit Claude Code
Pro Aufgabe ein klarer Auftrag, z. B.:
- „Neue KPI *Marketingkostenquote* in Bereich VK, abgeleitet aus
  Marketingkosten/Nettoumsatz, Ziel 6 %, tief_gut."
- „Themenbereich *Saison-Abwertung* unter Logistik mit Detailbericht."
- „Modul *export* anlegen: aktuellen Knoten als PDF."

Die zentrale Logik (Registry/Baum/Rechte) macht solche Erweiterungen klein
und lokal — kein Umbau bestehender Berichte.
