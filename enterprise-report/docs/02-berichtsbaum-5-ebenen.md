# 02 · Berichtsbaum & die 5 Ebenen

Definiert in `src/core/reportTree.js`. Der Baum ist reine **Struktur** und
verweist nur (auf KPIs, Detail-Schlüssel, Bereich) — keine Zahlen.

## Die Ebenen

| E | Name | Frage, die sie beantwortet | Träger im Baum |
|--:|------|----------------------------|----------------|
| 1 | **GF / Konzern** | „Wie steht das Unternehmen?" | Wurzelknoten, öffnet `management-report` |
| 2 | **Fachbereich** | „Wie steht Verkauf / Logistik …?" | direkte Kinder der Wurzel |
| 3 | **Themenbereich** | „Wo genau im Bereich klemmt es?" | Kinder der Fachbereiche |
| 4 | **Details** | „Welche Positionen/Zeilen stecken dahinter?" | Knoten mit `detail:` → Tabelle |
| 5 | **Historisierung** | „Wie hat es sich entwickelt?" | quer: `ladeHistorie(kpiId)` je KPI |

**Wichtig:** Ebene 5 ist **keine eigene Baumzeile**, sondern eine
**Dimension (Zeit)**, die an jedem Knoten für jede sichtbare KPI verfügbar
ist (Sparkline im Tree-Navigator). So vermeidet man Doppelpflege.

## Navigationslogik (Drill-down)

```
GF (Konzern)
 └─ Logistik & Lager            (E2 Fachbereich)
     ├─ Bestände & Reichweite   (E3 Themenbereich)
     │   └─ Bestände je Warenbereich   (E4 Details → Tabelle)
     └─ Externe Läger           (E3)
         └─ Standorte & Kosten  (E4)
```

Jeder Knoten zeigt: Breadcrumb (Pfad), Ebenen-Tag, seine KPI-Kacheln
(rechtegeprüft), ggf. die Detailtabelle und die Historie je KPI.

## Einen Knoten hinzufügen

```js
n('log-abwertung', 3, 'Abwertungsrisiko', {
  bereich: 'LOG', kpis: ['lagerbestand'],
  kinder: [ n('log-abwertung-det', 4, 'Abwertung je Saison', { bereich: 'LOG', detail: 'abwertung' }) ]
})
```

- `bereich` steuert die **Rechte** (siehe `04-rollen-rechte.md`).
- `kpis` referenzieren die **Registry** (Ampel/Trend kommen automatisch).
- `detail` referenziert `sql/detail_abwertung.sql` (bzw. Mock).
