# Vereins-App

Progressive Web App zur Vereinsverwaltung: Termine, Mannschaften, Spieler,
Trikots, Platzbuchungen, Chat und mehr. Mehrsprachig (DE / EN / NL).

Technik: React 18 + Vite. Daten werden lokal im Browser gespeichert und
optional mit einem sicheren Supabase-Backend synchronisiert.

## Lokal starten

Voraussetzung: Node.js 18 oder neuer.

```bash
npm install
npm run dev      # Entwicklungsserver auf http://localhost:5173
npm run build    # Produktiv-Build nach dist/
npm run preview  # Produktiv-Build lokal testen
```

Ohne Datenbank-Verbindung laeuft die App vollstaendig lokal (Daten im
Browser-Speicher des jeweiligen Geraets).

## Als Web-App / PWA bereitstellen (Deployment)

Die App ist ein statisches Vite-Projekt und laesst sich bei jedem
Static-Hosting betreiben. Empfohlen: **Vercel** (kostenloses Kontingent).

1. Code zu GitHub pushen (ist bereits eingerichtet).
2. Auf [vercel.com](https://vercel.com) anmelden, **New Project**, das
   Repository auswaehlen.
3. Vercel erkennt Vite automatisch (`vercel.json` ist enthalten) und baut
   mit `npm run build`. Auf **Deploy** klicken.
4. Nach dem Deployment ist die App unter einer `*.vercel.app`-Adresse
   erreichbar. Diesen Link teilst du mit den Nutzern; auf dem Handy laesst
   sich die App ueber das Browser-Menue ("Zum Startbildschirm hinzufuegen")
   wie eine native App installieren.

Alternative ohne Hosting-Konto: `npm run build` ausfuehren und den Inhalt
des Ordners `dist/` auf einen beliebigen Webspace hochladen.

## Sichere, gemeinsame Datenbank einrichten (Supabase)

Damit viele Nutzer dieselben Daten sehen und teilen, wird ein
Supabase-Backend verwendet. Die Daten sind durch **Row Level Security**
geschuetzt (nur wer den Vereinscode kennt, hat Zugriff) und von Supabase
**verschluesselt** gespeichert (Festplatte) sowie verschluesselt uebertragen
(TLS).

1. Auf [supabase.com](https://supabase.com) ein kostenloses Projekt anlegen.
2. **SQL Editor** oeffnen, den Inhalt von [`supabase/schema.sql`](supabase/schema.sql)
   einfuegen. Vorher unten im Skript `HIER-DEINEN-CODE` durch einen langen,
   geheimen **Vereinscode** ersetzen (mind. 12 Zeichen). Dann **Run**.
3. **Authentication -> Sign In / Up** oeffnen und **Anonymous sign-ins**
   aktivieren (jedes Geraet erhaelt damit eine sichere Identitaet).
4. **Project Settings -> API**: *Project URL* und *anon public key* kopieren.
5. In der App den Bildschirm **Sichere Datenbank verbinden** oeffnen
   (erscheint automatisch, sobald eine Verbindung konfiguriert ist, oder
   ueber die Einstellungen). URL, anon key und den Vereinscode eingeben und
   **Verbinden & testen**.

Den Vereinscode gibst du an die Vereinsmitglieder weiter. Wer den Code
einmal eingegeben hat, ist dauerhaft auf dem Geraet freigeschaltet.

Wichtig:
- Es wird ausschliesslich der **anon public key** benoetigt. Der
  `service_role`-Key darf niemals in die App oder ins Repository gelangen.
- Der Vereinscode ist der Zugangsschluessel. Geht er verloren, kann er im
  SQL-Editor neu gesetzt werden (Schritt 6 im Schema erneut ausfuehren).

## Projektstruktur

```
src/App.jsx          gesamte App (Komponenten, Datenlogik)
src/main.jsx         Einstiegspunkt
src/notifications.js  Erinnerungs-Helfer (optional)
public/              manifest.json, sw.js (Service Worker), App-Icons
supabase/schema.sql  SQL fuer das sichere Backend
vercel.json          Hosting-Konfiguration
```
