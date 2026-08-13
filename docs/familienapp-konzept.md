# Familien-App – Konzept (Gemeinschaftskalender + Digitales Gedächtnis)

Erweiterung des Konzepts aus `digitales-gedaechtnis-konzept.md`: Die Haupt-App
ist ein **Familienraum** mit gemeinsamem Kalender. Jedes Familienmitglied
bekommt darin zusätzlich sein eigenes, individuell verschlüsseltes
**Digitales Gedächtnis**. Später kann die App weiteren Familien zur Verfügung
gestellt werden (Mandanten-Modell wie in der Vereins-App).

## Aufbau: Eine App, drei Ebenen

```
Familie (Mandant)
│
├── GEMEINSAM  – Gemeinschaftskalender, geteilte Dokumente, Einkaufsliste …
│                sichtbar für alle Familienmitglieder
│
├── HEBAMMEN-MODUL – Arbeitsbereich der Frau (Kurse, Bürokratie, Fristen)
│                sichtbar nur für sie (+ optional freigegeben)
│
└── PRIVAT     – Digitales Gedächtnis pro Person
                 Ende-zu-Ende-verschlüsselt mit individuellem Passwort:
                 selbst der Server kann diese Daten NICHT lesen
```

## Modul 1: Gemeinschaftskalender (das Zentrum)

- **Eine Wochen-/Monatsansicht für die ganze Familie**, jede Person hat eine
  Farbe. Filter: „nur Kinder", „nur ich", „alle".
- Termine der Kinder: Training, Schule, Arzt – mit Feld **„Wer bringt/holt?"**
  (Zuständigkeit pro Termin, damit nichts zwischen den Stühlen landet).
- Wiederkehrende Termine, Erinnerungen per Push (Baustein aus der Vereins-App
  vorhanden).
- Konfliktanzeige: zwei Termine gleichzeitig, niemand zum Fahren eingeteilt →
  Warnung.
- Jeder Termin kann verknüpft werden mit Dokumenten (Einladung, Impfpass) und
  Personen aus dem eigenen Gedächtnis.
- Später: Abo-Feeds (Schulkalender, Vereinskalender per iCal importieren).

## Modul 2: Hebammen-Arbeitsbereich (Bürokratie-Hilfe für die Frau)

Ziel: Der selbstständigen Hebamme die Verwaltung abnehmen. Ausbaustufen:

**Stufe A – Kurse & Termine:**
- Kurse anlegen (Geburtsvorbereitung, Rückbildung …) mit Terminserie, Ort,
  max. Teilnehmerzahl.
- Teilnehmerliste pro Kurs: Name, Kontakt, Krankenkasse, bezahlt ja/nein,
  Anwesenheit abhaken.
- Kurstermine erscheinen automatisch (als Block) im Gemeinschaftskalender –
  die Familie sieht „Mama hat Kurs", ohne Details.

**Stufe B – Bürokratie & Fristen:**
- Fristen-Cockpit: Abrechnungszeiträume, QM-Nachweise, Fortbildungspflicht,
  Versicherung, Steuertermine – mit Vorlauf-Erinnerungen.
- Dokumentenablage je Kurs/Klientin (Anmeldebögen, Bescheinigungen) mit
  Vorlagen zum Wiederverwenden.
- Einfache Einnahmenliste (wer hat was bezahlt, was ist offen) als Zuarbeit
  für die Steuer – **keine** eigene Buchhaltung, nur saubere Vorarbeit.

**Stufe C – später, wenn gewünscht:**
- Online-Anmeldung für Kursteilnehmerinnen per Link, Warteliste,
  automatische Bestätigungsmail.

**Wichtig (Datenschutz):** Sobald Klientinnen-Daten gespeichert werden, gelten
erhöhte Anforderungen (Gesundheitsdaten, DSGVO Art. 9). Für den Familien-Start
unkritisch; vor einer Öffnung für andere/Online-Anmeldung braucht dieses Modul
eine eigene Datenschutz-Runde (AVV mit Supabase, EU-Region, Löschkonzept).

## Modul 3: Digitales Gedächtnis – jetzt pro Person, individuell verschlüsselt

Funktional wie im Basiskonzept (Personen-Spickzettel, Notizen, Abläufe,
Dokumente, Suche) – aber **jedes Familienmitglied hat sein eigenes**, und der
Inhalt ist **Ende-zu-Ende-verschlüsselt**:

### Verschlüsselungskonzept (Zero-Knowledge)

- Beim Einrichten wählt jede Person ein **Gedächtnis-Passwort** (unabhängig
  vom Login-Passwort).
- Daraus wird **im Browser/Handy** ein Schlüssel abgeleitet (Argon2id bzw.
  PBKDF2, WebCrypto). Verschlüsselt wird lokal mit AES-256-GCM – erst dann
  geht der Datensatz an den Server.
- Der Server (Supabase) speichert **nur Chiffretext**. Weder andere
  Familienmitglieder noch der Betreiber (auch ich nicht) können mitlesen.
  Genau das Modell „nur mit dem Schlüssel lassen sich die Daten entschlüsseln".
- Technisch sauber: pro Person ein zufälliger **Datenschlüssel** (DEK), der
  mit dem Passwort-Schlüssel (KEK) verschlüsselt abgelegt wird. Vorteil:
  Passwort ändern = nur DEK neu verschlüsseln, nicht alle Daten.

### Ehrliche Konsequenzen dieses Modells

1. **Passwort weg = Daten weg.** Es gibt keinen „Passwort vergessen"-Knopf,
   das ist der Sinn der Sache. Lösung: Beim Einrichten wird ein
   **Wiederherstellungscode** erzeugt (ausdrucken, in den Tresor). Ohne den
   ist Verlust endgültig – das muss jedem Mitglied klar gesagt werden.
2. **Suche läuft lokal.** Der Server kann verschlüsselte Daten nicht
   durchsuchen. Das Gedächtnis wird daher beim Entsperren aufs Gerät geladen
   und dort durchsucht (bei persönlichen Datenmengen problemlos schnell,
   und es macht die App nebenbei offlinefähig).
3. **Der Gemeinschaftskalender bleibt normal verschlüsselt** (Transport +
   at rest, aber nicht E2E) – sonst funktionieren Teilen, Push-Erinnerungen
   und Konfliktprüfung nicht. Privat-verschlüsselt ist der persönliche
   Bereich; gemeinsam Genutztes ist bewusst „nur" klassisch abgesichert.
4. Dokumente im Gedächtnis werden **vor** dem Upload verschlüsselt
   (verschlüsselte Blobs im Storage).

## Rollen & Familienmodell

- Familie = Mandant. Rollen: **Admin** (du), **Erwachsene/r**, **Kind**
  (vereinfachte Ansicht, keine Verwaltungsfunktionen).
- Einladung per Link/Code, wie aus der Vereins-App bekannt.
- Jede Person: eigener Login, eigene Farbe, eigenes (optionales) Gedächtnis.

## Später: Öffnung für andere Familien

Die Vereins-App hat das Muster schon (siehe `docs/mandanten-trennung.md`):
RLS pro Mandant, Superadmin-Ebene, Aktivierung. Übernahme des Modells:

- Jede Familie ein Mandant, strikte RLS-Trennung.
- Die E2E-Verschlüsselung des Gedächtnisses ist dann ein **Kernversprechen
  des Produkts**: „Selbst wir können deine privaten Daten nicht lesen."
- Erst relevant ab Stufe 4 – Architektur wird aber von Anfang an
  mandantenfähig angelegt (kostet fast nichts extra, erspart Umbau).

## Namensvorschlag

„Gemeinschaftskalender" beschreibt nur Modul 1 und ist als Name generisch.
Empfehlung: ein Markenname für die Haupt-App, Modulnamen darunter:

- **Nestwerk** (Favorit) – Nest (Familie) + Netzwerk + Werk. Passt perfekt
  zum Modul **Merkzeug** (das Digitale Gedächtnis). „Nestwerk – der
  Familienkalender mit Gedächtnis."
- Alternativen: **Famlio**, **Wirzeit**, **Heimbasis**.
- Modulnamen: Kalender = „Nestkalender" oder schlicht „Kalender",
  Gedächtnis = „Merkzeug", Hebammen-Bereich = „Praxis".

## Technik

Stack unverändert (React + Vite PWA, Supabase mit RLS, Vercel). Neu dazu:

- WebCrypto/Argon2 für die E2E-Schicht des Gedächtnisses.
- Kalender-Datenmodell: `termin (familie_id, person_ids[], serie, zustaendig,
  ort, verknuepfungen)`.
- Hebammen-Modul: eigene Tabellen (`kurs`, `kursteilnehmer`, `frist`),
  RLS auf die Inhaberin beschränkt.

## Ausbaustufen (überarbeitet)

1. **Familienraum + Gemeinschaftskalender** (Familie anlegen, Mitglieder
   einladen, Kalender mit Farben, Zuständigkeit, Push) – sofort nutzbar.
2. **Digitales Gedächtnis pro Person** mit E2E-Verschlüsselung
   (Personen-Spickzettel, Notizen, lokale Suche, Wiederherstellungscode).
3. **Hebammen-Modul** Stufe A (Kurse + Teilnehmer), dann B (Fristen, Ablage).
4. **Öffnung für weitere Familien** (Mandanten, Onboarding, Datenschutz-Runde).
