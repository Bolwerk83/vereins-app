# Verteiler — automatischer Berichtsversand

## Modell: Hybrid (Standard)

Gespeichert wird ein **reproduzierbarer Datenstand-Zeiger** — nicht die fertige
Datei: Bericht + Periode + Datumssicht + Datenart-Zuweisung + Filter. Beim
Versand entsteht daraus

- ein **PDF/Excel-Anhang** (eingefrorener, reproduzierbarer Stand) und
- ein **Live-Link** zum Drill-down,

jeweils mit **Datenstand-Stempel** (z. B. „Stand 21.06.2026 · Bezug 2026-06 ·
Datumssicht belegdatum · Mix: 5×Ist · 1×Tagesreporting · 6×Plan").

Alternativen je Verteiler wählbar: **Nur Live-Link** (immer aktuell) oder
**Voll-Snapshot** (Datei eingefroren, revisionssicher).

## Auslösung: Zeitplan UND/ODER Ereignis

- **Zeitplan**: täglich/wöchentlich/monatlich/quartalsweise zu fester Uhrzeit,
  Regel z. B. „5. Werktag".
- **Ereignis**: Monatsabschluss freigegeben, Forecast aktualisiert, neuer
  kritischer Alert.

## Realer Versand (Backend-Scheduler)

Das Frontend definiert die Verteiler und liefert das **Versand-Paket**
(`versandPaket()` in `src/core/verteiler.js`). Der eigentliche Versand läuft im
Backend (`server/`) und ist bewusst dort, weil dafür SMTP-Zugang nötig ist:

1. **Planung**: `node-cron` prüft die fälligen Verteiler (Rhythmus/Uhrzeit) und
   horcht auf Ereignisse (Abschluss-Freigabe etc.).
2. **Rendern**: aus dem Datenstand-Zeiger den Bericht erzeugen
   (PDF z. B. via Headless-Chrome/Puppeteer, Excel via `exceljs`).
3. **Versenden**: `nodemailer` mit den Firmen-SMTP-Daten aus `server/.env`
   (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`).
4. **Protokoll**: Versandzeitpunkt + Stempel je Verteiler speichern.

Beispiel `server/.env`:

```
SMTP_HOST=smtp.firma.de
SMTP_PORT=587
SMTP_USER=reporting@firma.de
SMTP_PASS=__bitte_setzen__
MAIL_FROM=Controlling <reporting@firma.de>
```

Bis SMTP eingerichtet ist, dient der **Testlauf** im Tool als Vorschau: er zeigt
das vollständige Versand-Paket (Empfänger, Betreff, Anhänge, Link, Stempel),
ohne real zu versenden.

## Status: umgesetzt (Backend)

Der Scheduler ist im `server/` eingebaut und läuft mit **graceful degradation**:

- `starteScheduler()` plant aktive Verteiler per **node-cron** (optionalDependency).
  Fehlt das Paket, bleibt der Zeitplan inaktiv — manueller/Ereignis-Versand
  über die API geht trotzdem.
- **Mailversand** via **nodemailer** (optionalDependency). Ohne `SMTP_*`/`MAIL_FROM`
  in `server/.env` läuft alles als **dry-run** (kein realer Versand).
- **Excel-Anhang** via **exceljs** (optionalDependency); PDF deckt der Live-Link ab.

Endpunkte:

| Methode | Pfad | Zweck |
|---|---|---|
| GET  | `/api/verteiler` | gespeicherte Verteiler |
| PUT  | `/api/verteiler` | Liste übernehmen + Zeitpläne neu setzen |
| POST | `/api/verteiler/:id/test` | Versand-Paket (Vorschau) |
| POST | `/api/verteiler/:id/send` | realer (oder dry-run) Versand |
| POST | `/api/ereignis/:typ` | Ereignis-Trigger (z. B. `abschluss_freigabe`) |

Im Tool aktivierst du die Zeitpläne über **„⟳ Im Backend aktivieren (planen)"** —
das synchronisiert die Liste und meldet, ob SMTP aktiv oder dry-run ist.
Aktivierung der optionalen Pakete im Ordner `server`:
`npm install node-cron nodemailer exceljs`.
