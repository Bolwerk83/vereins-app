# Eselsohr in ein eigenes Repo umziehen

Die Familien-App **Eselsohr** ist im Ordner [`nestwerk/`](nestwerk/) entstanden
und soll in ein eigenes Repository. Alles ist vorbereitet: Die Datei
[`eselsohr.bundle`](eselsohr.bundle) enthält das **komplette eigenständige
Repo mit voller Entwicklungs-Historie** (App im Wurzelverzeichnis, Konzepte
in `docs/`).

## So geht der Umzug (einmalig, ~2 Minuten)

1. Auf GitHub ein leeres Repo anlegen: **github.com/new** → Name `eselsohr`
   → Privat → **ohne** README.
2. Auf einem Rechner mit Git:

   ```bash
   git clone eselsohr.bundle eselsohr
   cd eselsohr
   git remote set-url origin https://github.com/Bolwerk83/eselsohr.git
   git push -u origin main
   ```

3. Fertig. Danach in diesem Repo (`vereins-app`) aufräumen:

   ```bash
   git rm -r nestwerk demo/nestwerk-demo.html eselsohr.bundle ESELSOHR-UMZUG.md
   git rm docs/digitales-gedaechtnis-konzept.md docs/familienapp-konzept.md
   git commit -m "Eselsohr ist umgezogen: github.com/Bolwerk83/eselsohr"
   ```

## Deploy nach dem Umzug

Vercel → *Add New → Project* → Repo `eselsohr` importieren → keine weiteren
Einstellungen nötig (Vite wird erkannt, App liegt im Wurzelverzeichnis).

## Hinweis

Bis zum Umzug bleibt `nestwerk/` hier die aktuelle Quelle – das Bundle wird
bei Änderungen von der Entwicklungs-Sitzung neu erzeugt.
