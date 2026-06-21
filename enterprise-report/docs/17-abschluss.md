# Abschluss & Versionierung

Macht Monatsabschlüsse **revisionssicher** und liefert den echten Auslöser für
den ereignisbasierten Versand (Verteiler, `docs/16`).

## Workflow je Periode

```
offen  →  in Abstimmung  →  freigegeben (final, 🔒)
```

- **Offen**: laufende Bearbeitung.
- **In Abstimmung**: Zahlen werden geprüft/abgestimmt (gelbe Ampel).
- **Freigegeben**: final eingefroren. Die Periode wird auf Datenart **Ist**
  gesetzt und gesperrt.

## Versionen

Jede Freigabe — und jeder bewusst gesicherte **Zwischenstand** — erzeugt eine
unveränderliche Version mit:

- fortlaufender Nummer, Zeitpunkt, Benutzer,
- **Datenstand-Stempel** (Datum, Datumssicht, Ist/Plan/FC-Mix),
- Status und Kommentar; die Freigabe-Version ist als **FINAL** markiert.

So ist nachvollziehbar, *welcher Stand wann* freigegeben wurde — auch nach
späteren Korrekturen.

## Kopplung an den Verteiler

`freigeben()` feuert das Ereignis **`abschluss_freigabe`** an das Backend
(`POST /api/ereignis/abschluss_freigabe`). Der Scheduler versendet daraufhin
alle aktiven Verteiler, die auf dieses Ereignis horchen — der Monatsbericht
geht also automatisch raus, sobald der Abschluss steht. Ohne erreichbares
Backend (Mock) bleibt die Freigabe lokal gültig; der Versand wird beim nächsten
verbundenen Lauf nachgeholt.

## Korrektur

Eine freigegebene Periode lässt sich **wiedereröffnen** (Korrekturlauf). Das
wird als eigene Version protokolliert; die bisherige FINAL-Version bleibt in der
Historie erhalten.

## Persistenz

Aktuell `localStorage` (`er_abschluss`). Produktiv gehört der Abschlussstatus in
eine **DWH-Abschlusstabelle** (Periode, Status, Version, Stempel, Benutzer,
Zeit), damit Sperre und Historie quellseitig verbindlich sind.
