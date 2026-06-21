# 🚀 Installation – in 3 Schritten startklar

Diese Anleitung ist für **deinen eigenen Rechner** gedacht. Du brauchst kein
Vorwissen. Wenn du an einer Stelle unsicher bist: Es kann nichts kaputtgehen –
du kannst die Einrichtung jederzeit erneut starten.

---

## Was du einmalig brauchst

- **Node.js** (Version 18 oder neuer) – kostenlos von <https://nodejs.org>
  (die Schaltfläche „LTS" wählen, herunterladen, installieren, fertig).

Mehr nicht. Eine Datenbank ist **nicht** nötig, um loszulegen – das Tool
startet mit Beispielzahlen im **Demo-Modus**.

---

## Schritt 1 · Dateien auf den Rechner holen

Den Projektordner irgendwo ablegen, z. B. unter `C:\Tools\enterprise-report`.

## Schritt 2 · Einrichten (einmalig)

**Windows:** Doppelklick auf **`Setup.cmd`**

*(Alternativ in der Eingabeaufforderung im Projektordner: `npm run setup`)*

Der Assistent führt dich durch alles und fragt nur das Nötigste. Bei jeder
Frage kannst du einfach **Enter** drücken, um die empfohlene Vorgabe zu nehmen.
Er fragt unter anderem:

- **Demo-Modus oder echte Datenbank?** → Für den ersten Start **Demo** wählen.
- Bei „echte Datenbank": Server, Datenbankname und Anmeldeart
  (für SQL Server LocalDB: **Windows-Anmeldung**). Das Setup speichert alles
  selbst und kann die Verbindung direkt testen.

## Schritt 3 · Starten

**Windows:** Doppelklick auf **`Start.cmd`**

*(Alternativ: `npm run start:local`)*

Das Tool öffnet sich automatisch im Browser unter
**<http://localhost:5180>**. Fertig. 🎉

Zum Beenden einfach das schwarze Fenster schließen.

---

## Später von Demo auf echte Datenbank wechseln

Einfach **`Setup.cmd`** noch einmal ausführen und diesmal „Echte Datenbank"
wählen. Die SQL-Skripte für die Kennzahlen legst du nach dem Vertrag in
`sql/README.md` ab – das Tool selbst musst du dafür nicht anfassen.

## Rollen & Rechte

Die Gruppen (wer was sehen darf) sind bereits vorbereitet. Im Tool oben rechts
unter **„Rollen & Rechte"** trägst du die Namen ein. Danach meldet sich jede
Person oben mit ihrem Namen an und sieht automatisch nur ihre Bereiche.
Für die dauerhafte Speicherung in der Datenbank legt das Setup die Tabellen
(`sql/_rollen_rechte.sql`) auf Wunsch gleich mit an.

---

## Wenn etwas klemmt

| Problem | Lösung |
|--------|--------|
| „node" wird nicht erkannt | Node.js installieren (s. o.) und Fenster neu öffnen. |
| Browser öffnet sich nicht | Im Browser von Hand `http://localhost:5180` eingeben. |
| Datenbank-Verbindung schlägt fehl | Angaben prüfen; im Ordner `server` `npm run test:db` ausführen. Für LocalDB zusätzlich einmalig im Ordner `server`: `npm install msnodesqlv8`. |
| Ganz neu anfangen | `Setup.cmd` erneut ausführen – überschreibt die Einstellungen sauber. |

Du kommst nicht weiter? Sag mir einfach, an welcher Stelle es hakt – wir lösen
das gemeinsam.
