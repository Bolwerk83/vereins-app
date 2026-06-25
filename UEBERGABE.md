# Übergabe — Business Controlling Reports (BCR)

Stand: 2026-06-25 · Branch `claude/enterprise-reporting-system-fvfwe4` · **750/750 Tests grün** · Build ok · v1.0.0

Dieses Dokument fasst den kompletten Stand zusammen, damit er in einer neuen
Claude-Session übernommen und nach `https://github.com/Bolwerk83/bcr.git`
hochgeladen werden kann.

---

## 1. Was ist das Projekt?

**BCR — Business Controlling Reports**: ein KI-freies Controlling-/Reporting-System
für Handel/Produktion. Frontend-only (React + Vite), läuft als Demo standalone
ohne Backend; optionale Supabase-Anbindung vorhanden.

- **Tech:** React 18, Vite, reines JS (kein TS), Node-Test-Runner (`node:test`)
- **Projektname:** `business-controlling-reports` (package.json), Version `1.0.0`
- **Umfang:** ~89 Views, ~85 Fachmodule unter `enterprise-report/src/modules/`

### Starten / Bauen / Testen
```bash
cd enterprise-report
npm install
npm run dev      # Dev-Server
npm run build    # Produktions-Build → dist/ (~1.9 MB)
npm test         # 750 Tests (node:test), aktuell alle grün
```

---

## 2. Verzeichnis-Überblick

```
/ (Repo-Root)
├─ enterprise-report/        ← die eigentliche App
│  ├─ src/
│  │  ├─ App.jsx             ← Menüstruktur (menuGruppen) + Routing
│  │  ├─ main.jsx
│  │  ├─ core/  data/  components/  design/
│  │  └─ modules/            ← ~85 Fachmodule (s. u.)
│  ├─ tests/                 ← 124 Test-Dateien, 750 Tests
│  ├─ dist/                  ← Build-Ausgabe
│  ├─ KENNZAHLEN-KATALOG.md  ← Abgleich aller Buch-KPIs
│  ├─ CHANGELOG.md  README.md  INSTALLATION.md  BACKLOG.md  PERFORMANCE.md
│  └─ package.json (name: business-controlling-reports, v1.0.0)
├─ docs/                     ← Mandanten-Trennung, Aktivierung, Superadmin-Setup
├─ supabase/                 ← optionale DB-Anbindung
└─ UEBERGABE.md              ← dieses Dokument
```

### Wichtige Module (Auszug aus `src/modules/`)
- **Kennzahlen/KPIs:** `kennzahlen` (KpiDefinitionPanel, KpiDefContext), `kpi-editor`, `katalog`
- **Cockpits:** `finanzcockpit`, `service-zoll`, `vertrieb-kennzahlen`, `management-report`
- **Planung:** `planung`, `wizard`, `szenario`, `marktpotenzial`
- **Kostenrechnung:** `bab`, `klr`, `kostenarten`, `kostenstellen`, `deckungsbeitrag`, `kalkulation`, `ergebnis`
- **ProfitCenter/Hierarchien:** `profitcenter` (8-Ebenen-Baum), `designer`, `tree-navigator`
- **Operativ:** `bestand`, `lieferant`, `auftrag`, `produktion`, `wms`, `transport`, `versand`
- **Werkzeuge:** `onepager`, `roter-faden`, `assistent`, `ki-builder`, `command-palette` (⌘K)
- **Verwaltung:** `admin`, `benutzer`, `rollen-rechte`, `berichtfreigabe`, `datenschutz`

---

## 3. In dieser Session umgesetzt (jüngste Arbeit)

Reihenfolge = neueste zuerst (vgl. `git log`):

1. **Navigation app-weit: „Auswertungen" oben / „Verwaltung" unten** (`App.jsx`)
   - Ordnungsregel in `menuSichtbar`: Untergruppen mit verwaltendem Titel
     (Verwaltung, Einrichtung, Administration, Prozesse, Werkzeuge, Hilfe …)
     wandern je Knoten **stabil ans Ende**; Auswertungen bleiben oben.
   - Set `VERWALTUNG_TITEL` + Helper `istVerwaltungsGruppe()` + `.sort(...)`.

2. **Kennzahlen-Katalog** (`enterprise-report/KENNZAHLEN-KATALOG.md`)
   - Alle Buch-KPIs klassifiziert: vorhanden / jetzt rechenbar / Daten fehlen,
     inkl. **Datenherkunft** für fehlende (FiBu-Bilanz, WaWi, WMS, TMS, GA4, HR, ITSM …).

3. **Eigener Knoten „Planung & Budgetierung"** (`App.jsx`, `modules/planung/Planung.jsx`)
   - Untergruppen umbenannt: „Berichte" → **„Auswertungen"**, „Eingabe & Verwaltung" → **„Verwaltung"**.
   - On-Page-Tabs entsprechend; Deep-Links auf Tabs (budget/beschaffung/machbarkeit).
   - Bericht verweist auf die Verwaltung, wenn Planmengen fehlen.

4. **9 neue rechenbare KPIs + laienverständliches Glossar** (Modul `kennzahlen`)
   - Neue KPIs mit Abhängigkeiten: Fremdkapital, Fremdkapitalquote, Verschuldungsgrad,
     Kapitalumschlag, Umsatzrendite, EBITDA-Marge, NOPAT, Investitionsquote, GMROI.
   - Duplikate bewusst weggelassen (z. B. Bruttomarge = DB-Quote).
   - Für **alle 123 KPIs**: Definition + konkretes Beispiel als „💡 Einfach erklärt" im Drill.

5. **Drill-through:** jede Kennzahl erreicht eine Detailebene.

6. **Startseite** (Login/Favoriten/Audit-Log) + **Break-Even-Diagramm** mit Filtern.

> Frühere Meilensteine (bereits committed): ProfitCenter 8-Ebenen-Baum, Budget
> end-to-end, Service-/Zoll-Cockpit, Command-Palette ⌘K, Rollen-/Freigabe-System,
> Versionsvergleich, Designer für eigene Hierarchien, Druck-Layout.

---

## 4. Offene Punkte (To-do im neuen Verlauf)

- [ ] **Upload nach `Bolwerk83/bcr`** (s. Abschnitt 5) — Hauptgrund dieser Übergabe.
- [ ] **#18: Mehr Visualisierung + Werkzeuge nur im Burger-Menü** (noch offen).
- [ ] Optional: eigener **„Kapitalstruktur & Rendite"-Bericht** für die 9 neuen KPIs.
- [ ] Aufräumen: alter Arbeits-Branch / alte Deploy-Projekte (nach Freigabe).
- [ ] Klären, ob fehlende Buch-KPIs (lt. Katalog) mit Echt-Datenquellen ergänzt werden.

---

## 5. Upload nach GitHub (`Bolwerk83/bcr`)

> Hinweis: In der vorherigen Session war `bcr` **nicht** in der Repo-Freigabeliste,
> daher konnte dort nicht gepusht werden. Die GitHub-App „Claude" hat inzwischen
> Zugriff auf **alle** Repos von Bolwerk83. In einer **neuen Session, die auf
> `Bolwerk83/bcr` scoped ist**, funktioniert der Push direkt.

### Variante A — neue Claude-Session auf `bcr`
1. Neue Claude-Code-Session öffnen, Repository **`Bolwerk83/bcr`** wählen.
2. Diese Übergabe + den App-Stand übernehmen, Push erfolgt direkt aus der Session.

### Variante B — selbst per Git pushen (kein Warten)
```bash
# im Ordner mit dem aktuellen Stand (enterprise-report bzw. Repo-Root)
git init
git add -A
git commit -m "BCR v1.0.0 — Reporting/Controlling-System"
git branch -M main
git remote add origin https://github.com/Bolwerk83/bcr.git
git push -u origin main
```

---

## 6. Startnachricht für die neue Session (zum Kopieren)

> Repo: `Bolwerk83/bcr`. Dies ist „Business Controlling Reports (BCR)", ein
> React/Vite-Reporting-System (Frontend-only, 750 Tests grün, v1.0.0). Bitte den
> aktuellen Stand übernehmen und nach `Bolwerk83/bcr` pushen. Anschließend
> weiterarbeiten an: (1) mehr Visualisierung + Werkzeuge nur im Burger-Menü,
> (2) optionaler „Kapitalstruktur & Rendite"-Bericht für die 9 neuen KPIs
> (Fremdkapitalquote, Verschuldungsgrad, Kapitalumschlag, Umsatzrendite,
> EBITDA-Marge, NOPAT, Investitionsquote, GMROI). Konvention im Menü:
> „Auswertungen" oben, „Verwaltung" unten je Knoten. Details siehe UEBERGABE.md.
