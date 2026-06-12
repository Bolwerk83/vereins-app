/* =====================================================================
   bolwerk24.de — App-Katalog
   ---------------------------------------------------------------------
   HIER trägst du neue Projekte ein. Jede App ist ein Objekt im Array.
   Felder:
     id        eindeutiger Kurzname (für Filter/Links)
     name      Anzeigename
     icon      ein Emoji ODER Buchstabe (wird im farbigen Kachel-Icon gezeigt)
     category  eine der Kategorien aus CATEGORIES (unten)
     tagline   kurze Zeile unter dem Namen (App-Store-Style)
     desc      1–2 Sätze Beschreibung
     tags      kleine Schlagwörter (Array)
     color     Akzentfarbe der App (Hex) — bringt Farbe in die neutrale Seite
     status    "live"  -> "Öffnen"-Button   |   "soon" -> "Vormerken"
     url       Live-URL der App (nur bei status "live")
     rating    optionale Bewertung (Zahl) + reviews (Anzahl) für Social Proof
     featured  true => erscheint im großen Spotlight-Bereich
   ===================================================================== */

const CATEGORIES = [
  { id: "all",        label: "Alle Apps" },
  { id: "vereine",    label: "Vereine & Ehrenamt" },
  { id: "finanzen",   label: "Finanzen & Vorsorge" },
  { id: "alltag",     label: "Alltag & Familie" },
  { id: "kommunikation", label: "Kommunikation" },
];

const APPS = [
  {
    id: "vereinsapp",
    name: "VereinsApp",
    icon: "🏆",
    category: "vereine",
    tagline: "Dein Verein. Alles an einem Ort.",
    desc: "Termine, Abstimmungen, Aufstellungen, Mitglieder & Chat – die komplette Vereinsverwaltung als App. Mit Push-Benachrichtigungen, offline-fähig, ohne Installation.",
    tags: ["Termine", "Abstimmungen", "Chat", "Push", "PWA"],
    color: "#16a34a",
    status: "live",
    url: "https://verein.bolwerk24.de",
    rating: 4.9,
    reviews: 128,
    featured: true,
    features: [
      "Termine & automatische Erinnerungen",
      "Spieler-Aufstellung & Verfügbarkeitsabfrage",
      "Gruppen-Chat mit Push-Benachrichtigung",
      "Funktioniert offline – keine Installation nötig",
    ],
  },
  {
    id: "vorsorge",
    name: "Vorsorge",
    icon: "🛡️",
    category: "finanzen",
    tagline: "Heute regeln. Morgen entlastet.",
    desc: "Vollmachten, Patientenverfügung, wichtige Dokumente & Notfallkontakte – sicher gebündelt und im Ernstfall sofort griffbereit für deine Liebsten.",
    tags: ["Dokumente", "Notfall", "Sicherheit"],
    color: "#0ea5e9",
    status: "soon",
    rating: null,
    reviews: 0,
  },
  {
    id: "klartext",
    name: "Klartext",
    icon: "💬",
    category: "kommunikation",
    tagline: "Briefe & Behörden – endlich verständlich.",
    desc: "Komplizierte Schreiben in einfache Sprache übersetzt, Antworten formuliert und Fristen im Blick. Schluss mit Behörden-Kauderwelsch.",
    tags: ["Übersetzen", "Vorlagen", "Fristen"],
    color: "#6366f1",
    status: "soon",
    rating: null,
    reviews: 0,
  },
  {
    id: "kochbuch",
    name: "Kochbuch",
    icon: "🍳",
    category: "alltag",
    tagline: "Deine Rezepte. Clever organisiert.",
    desc: "Lieblingsrezepte sammeln, Wochenplan erstellen und mit einem Tipp die passende Einkaufsliste generieren. Teilbar mit der ganzen Familie.",
    tags: ["Rezepte", "Wochenplan", "Einkaufsliste"],
    color: "#f97316",
    status: "soon",
    rating: null,
    reviews: 0,
  },
];

/* ---------------------------------------------------------------------
   ZENTRALE KONFIGURATION
   --------------------------------------------------------------------- */
const CONFIG = {
  /* Newsletter / Update-Liste -------------------------------------------
     Anbindung an Brevo (ehemals Sendinblue) OHNE API-Key im Code:
       1. In Brevo eine Kontaktliste anlegen.
       2. Unter "Kontakte → Formulare" ein DOI-Anmeldeformular erstellen.
       3. Im erzeugten Einbettungs-Code die "action"-URL kopieren
          (Form: https://xxxxx.sibforms.com/serve/MUIFA...).
       4. Diese URL hier eintragen — fertig. Solange leer, speichert die
          Seite die E-Mail nur lokal (Demo). Der API-Key bleibt geheim,
          weil Brevo das Form-Endpoint öffentlich & sicher bereitstellt.   */
  newsletter: {
    brevoFormUrl: "",        // z. B. "https://abc123.sibforms.com/serve/MUIFAxyz..."
    emailField: "EMAIL",     // Standard-Feldname in Brevo-Formularen
    sourceField: "APP",      // optionales verstecktes Feld: welche App gewünscht wurde
  },
};

/* global window */
window.BOLWERK = { CATEGORIES, APPS, CONFIG };
