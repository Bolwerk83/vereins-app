# bolwerk24 – SuperAdmin der Landingpage einrichten

Der SuperAdmin der Landingpage (`bolwerk24.de`) zeigt dir **Besucher-Statistik**,
**Newsletter-Anmeldungen**, **Affiliate-Partner** und den **App-Katalog** – alles
an einem Ort, geschützt durch Login.

Aufruf: **https://bolwerk24.de/admin**

Du musst das **einmal** einrichten (ca. 5 Minuten). Danach läuft alles automatisch.

---

## Schritt 1 – Datenbank anlegen (Supabase)

1. Öffne dein Supabase-Projekt → links **SQL Editor** → **New query**.
2. Öffne die Datei `docs/bolwerk24-superadmin.sql`, kopiere den **kompletten** Inhalt
   in den Editor.
3. Trage – falls nötig – deine **Admin-E-Mail** ein (Zeile mit
   `insert into public.site_admins ... values ('bolwerk@outlook.de')`).
4. Klick **Run**. Es werden die Tabellen, Sicherheitsregeln und Auswertungen angelegt.

## Schritt 2 – anon-Key eintragen

1. Supabase → **Project Settings → API**.
2. Kopiere **Project URL** und den Key **`anon` `public`**.
3. Trage beides in `site/assets/js/supabase-config.js` ein:
   ```js
   window.BW24_SUPABASE = {
     url: "https://DEIN-PROJEKT.supabase.co",
     anonKey: "DEIN_ANON_PUBLIC_KEY",
   };
   ```
   > Der `anon`-Key ist **öffentlich** und sicher im Browser – er ist durch die
   > Row-Level-Security-Regeln geschützt. Niemals den **`service_role`**-Key verwenden!

## Schritt 3 – Admin-Benutzer anlegen

1. Supabase → **Authentication → Users → Add user**.
2. E-Mail = die in Schritt 1 eingetragene Admin-E-Mail, dazu ein Passwort.
   (Häkchen „Auto Confirm User“ setzen, dann ist sofort Login möglich.)
3. Optional, empfohlen: **Authentication → Providers → Email** →
   „Allow new users to sign up“ **aus**, damit sich niemand selbst registrieren kann.

## Schritt 4 – Veröffentlichen

Änderungen committen & pushen (Branch `main`). Vercel deployt automatisch.
Dann auf **https://bolwerk24.de/admin** mit E-Mail + Passwort anmelden.

---

## Was wird erfasst? (Datenschutz)

Es werden **nur anonyme, aggregierbare** Ereignisse gespeichert:
Seitenaufruf, welche App angesehen/geöffnet/vorgemerkt wurde, Affiliate-Klicks,
grobe Herkunft (Referrer-Domain) und „mobil/desktop“. **Keine** personenbezogenen
Daten, **keine** dauerhaften Tracking-Cookies (die Sitzungs-ID liegt nur im
`sessionStorage` und verschwindet beim Schließen des Tabs).

Newsletter-Anmeldungen enthalten die E-Mail-Adresse, die der Nutzer selbst einträgt –
diese siehst du im Reiter „Newsletter“.

## Reiter im SuperAdmin

| Reiter | Funktion |
|---|---|
| 📊 Statistik | Seitenaufrufe, Sitzungen, App-Öffnungen, Anmeldungen, je App, Herkunft, Verlauf |
| ✉️ Newsletter | Liste der Anmeldungen, CSV-Export, einzeln löschbar |
| 🤝 Affiliate | Partner-Links pflegen (werden auf der Seite angezeigt, Klicks gezählt) |
| 🧩 App-Katalog | Apps der Startseite bearbeiten (Name, Status, Link …) ohne Code |
| ⭐ Bewertungen | echte Sterne/Kommentare der Besucher ansehen & löschen; Sterne, Kommentare und den „Seite im Aufbau"-Hinweis **an-/abschalten** |

> **Bewertungen:** Besucher können Apps mit 1–5 Sternen und optional einem
> Kommentar bewerten. Es werden **keine Fake-Werte** mehr angezeigt – die Sterne
> entstehen aus echten Bewertungen. Über die Schalter im Reiter „Bewertungen"
> kannst du Sterne und/oder Kommentare jederzeit deaktivieren.

## Weitere Admins hinzufügen

Im Supabase **SQL Editor**:
```sql
insert into public.site_admins (email) values ('weitere@email.de')
  on conflict (email) do nothing;
```
Dann für diese E-Mail unter **Authentication → Users** einen Benutzer anlegen.
