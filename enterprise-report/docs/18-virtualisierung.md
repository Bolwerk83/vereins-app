# Tabellen-Virtualisierung (große Datenmengen)

Damit Detailtabellen mit vielen tausend Zeilen flüssig bleiben, rendert die App
nur die **sichtbaren** Zeilen ins DOM (Zeilen-Windowing) — ohne externe
Bibliothek.

## Wie es funktioniert

`src/core/useFenster.js` ist eine kleine Hook:

- **Unter der Schwelle** (≤ 60 Zeilen) bleibt alles unverändert — volle Liste,
  frei wachsend, exakt wie zuvor.
- **Darüber** wird ein Scroll-Container mit fester Höhe genutzt; gerendert
  werden nur die sichtbaren Zeilen plus ein Overscan. Zwei Platzhalter-Zeilen
  (oben/unten) halten Gesamthöhe und Scrollbalken korrekt.
- **Beim Drucken** (`beforeprint`/`afterprint`) schaltet sich die
  Virtualisierung automatisch ab, damit **alle** Zeilen im PDF landen.

`DetailTabelle` (in `src/components/ui.jsx`) nutzt die Hook. Da alle
Detail-/Perspektiven-Tabellen über diese Komponente laufen, profitieren
Berichtsbaum **und** Detail-Sprungpunkte ohne weitere Änderung.

## Korrektheit beim Drill-Through

Der Zeilen-Klick liefert weiterhin den **echten** Zeilenindex
(`start + lokalerIndex`), sodass Drill-Through auf den richtigen
Schlüsselwert trifft — unabhängig davon, welcher Ausschnitt gerade
gerendert ist.

## Ausprobieren

Berichtsbaum → ein Vertriebsknoten → Detail-Sprungpunkt **Verkaufsrechnungen**
→ Anzahl auf **„Alle"** stellen. Der Mock-Datensatz enthält dafür ~640 Belege
(deterministisch generiert, siehe `src/data/mock.js`); die Kopfzeile zeigt
„… Zeilen · virtualisiert". Im Echtbetrieb liefert das MSSQL-Backend die
vollständige Belegliste.
