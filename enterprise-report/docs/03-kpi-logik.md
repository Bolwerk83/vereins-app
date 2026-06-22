# 03 · KPI-Logik, Abhängigkeiten & Ampel

Definiert in `src/core/kpiRegistry.js`. Statuslogik in `src/core/ampel.js`.

## Zwei KPI-Arten

| Art | Woher der Wert | `sqlRef` | `abhaengig` |
|-----|----------------|----------|-------------|
| **gemessen** | aus SQL/MSSQL (oder Mock) | gesetzt | `[]` |
| **abgeleitet** | berechnet aus anderen KPIs | `null` | Liste + `berechne()` |

Beispiel abgeleitet:

```js
dbQuote: {
  einheit: 'percent', ziel: 40.0, richtung: 'hoch_gut',
  abhaengig: ['db1', 'nettoumsatz'],
  berechne: (v) => (v.db1 / v.nettoumsatz) * 100
}
```

`berechneAlle(roheWerte)` löst die Abhängigkeiten **topologisch** auf:
zuerst die gemessenen Werte, dann `db1 = nettoumsatz − wareneinsatz`, dann
`dbQuote = db1 / nettoumsatz`. So sind Abhängigkeiten **explizit,
dokumentiert und nachvollziehbar** — nie versteckt in einer UI.

## Der Abhängigkeitsgraph (der rote Faden)

```
nettoumsatz  = bruttoumsatz − erloesschmaelerung   (gemessen)
wareneinsatz                                       (gemessen)
db1          = nettoumsatz − wareneinsatz
dbQuote      = db1 / nettoumsatz
wareneinsatzquote = wareneinsatz / nettoumsatz      ◄ Hebel #1
cashConversion ← reichweite                         ◄ Hebel #2 (Bestand→Liquidität)
```

`abhaengigkeitsGraph()` gibt diese Kette maschinenlesbar aus (für Doku oder
eine spätere Graph-Visualisierung).

## Ampel-Logik (zielbezogen, EINHEITLICH)

`ampelStatus({ wert, ziel, richtung, warn })`:

```
erfuellung = (richtung = 'tief_gut') ? ziel/wert : wert/ziel
erfuellung ≥ 1.0   → grün  (im Ziel)
erfuellung ≥ warn  → amber (Beobachtung)   // warn z. B. 0.95
sonst              → rot   (Handlung nötig)
```

- `richtung: 'hoch_gut'` → höher ist besser (Umsatz, Liefertreue).
- `richtung: 'tief_gut'` → tiefer ist besser (Lagerbestand, Retouren).
- Kein Ziel (`ziel: null`) → Status **neutral** (grau).

Die KPI legt nur Ziel/Richtung fest — **die Farbe entscheidet immer
dieselbe Funktion**. Dadurch sind alle Berichte konsistent.

## Trend & Historie

`trendAusHistorie(reihe, richtung)` liefert `trend` (▲/▼/▬), `delta`,
`deltaPct` und `istGut`. Die Sparkline (Ebene 5) färbt grün/rot je nach
`istGut` — unabhängig von der reinen Richtung der Zahl.

## Eine neue KPI anlegen (Checkliste)

1. Eintrag in `kpiRegistry.js`: `id, name, einheit, bereich, ziel,
   richtung, beschreibung`.
2. Gemessen? → `sqlRef` setzen und `sql/<sqlRef>.kpi.sql` füllen.
   Abgeleitet? → `abhaengig` + `berechne()` setzen.
3. Schützenswert? → `security: ['GF','HR','FIN']` (Object-Level-Security).
4. KPI im Baum (`reportTree.js`) an den passenden Knoten hängen.
