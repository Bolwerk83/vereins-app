/* =================================================================
   SUPER-ADMIN ROLLOUT & FEATURE-FLAG SYSTEM
   50+ granulare Einstellungen in 10 Kategorien
   5 vordefinierte Meilenstein-Phasen
================================================================= */

export const FEATURES_KEY = "va_features";

// Vollständige Feature-Flag Datenbank
export const FEATURE_REGISTRY = [

  //  KERN 
  { id:"dir_public",      cat:"kern",      phase:1, risk:"low",
    label:"Öffentliches Verzeichnis",
    desc:"Vereine können im Verzeichnis gefunden werden",
    affects:"all", default:true, deps:[] },
  { id:"club_register",   cat:"kern",      phase:1, risk:"low",
    label:"Neue Vereine anlegen",
    desc:"Jeder kann einen neuen Verein registrieren",
    affects:"all", default:true, deps:[] },
  { id:"demo_access",     cat:"kern",      phase:1, risk:"low",
    label:"Demo-Verein sichtbar",
    desc:"Demo-Verein erscheint im Verzeichnis für neue Nutzer",
    affects:"all", default:true, deps:[] },
  { id:"helper_login",    cat:"kern",      phase:2, risk:"low",
    label:"Helfer-Zugang",
    desc:"Helfer können sich mit Code einloggen",
    affects:"helper", default:true, deps:[] },
  { id:"lang_switcher",   cat:"kern",      phase:3, risk:"low",
    label:"Sprachwechsler",
    desc:"Nutzer können Sprache ändern (DE/EN/NL/AR/TR)",
    affects:"all", default:true, deps:[] },

  //  TERMINE 
  { id:"events_create",   cat:"termine",   phase:1, risk:"low",
    label:"Termine erstellen",
    desc:"Trainer können neue Termine anlegen",
    affects:"trainer", default:true, deps:[] },
  { id:"events_vote",     cat:"termine",   phase:1, risk:"low",
    label:"Abstimmung (Dabei/Nicht dabei)",
    desc:"Eltern und Trainer können bei Terminen abstimmen",
    affects:"all", default:true, deps:["events_create"] },
  { id:"events_late",     cat:"termine",   phase:1, risk:"low",
    label:"Verspätungs-Meldung",
    desc:"Nutzer können angeben wie spät sie kommen",
    affects:"all", default:true, deps:["events_vote"] },
  { id:"events_reason",   cat:"termine",   phase:1, risk:"low",
    label:"Abwesenheits-Grund",
    desc:"Bei Absage kann Grund angegeben werden (Krank, Urlaub...)",
    affects:"all", default:true, deps:["events_vote"] },
  { id:"events_series",   cat:"termine",   phase:2, risk:"medium",
    label:"Serientermine",
    desc:"Trainer können wiederkehrende Termine anlegen",
    affects:"trainer", default:true, deps:["events_create"] },
  { id:"events_fieldbook",cat:"termine",   phase:3, risk:"medium",
    label:"Platzbuchung bei Termin",
    desc:"Beim Anlegen eines Termins wird automatisch ein Platz gebucht",
    affects:"trainer", default:true, deps:["events_create","fields_booking"] },
  { id:"events_conflict", cat:"termine",   phase:3, risk:"low",
    label:"Konflikt-Warnungen",
    desc:"Warnung wenn Platz doppelt gebucht",
    affects:"trainer", default:true, deps:["events_fieldbook"] },

  //  TEAM 
  { id:"players_list",    cat:"team",      phase:1, risk:"low",
    label:"Spielerliste",
    desc:"Trainer sehen alle Spieler ihres Teams",
    affects:"trainer", default:true, deps:[] },
  { id:"players_profiles",cat:"team",      phase:2, risk:"medium",
    label:"Spieler-Profile",
    desc:"Detaillierte Spieler-Daten (Position, Jahrgang, Fuss...)",
    affects:"trainer", default:true, deps:["players_list"] },
  { id:"players_stats",   cat:"team",      phase:4, risk:"low",
    label:"Spieler-Statistiken",
    desc:"Tore, Karten, Anwesenheits-Quote im Profil",
    affects:"trainer", default:true, deps:["players_profiles"] },
  { id:"players_parents", cat:"team",      phase:2, risk:"medium",
    label:"Spielerliste für Eltern",
    desc:"Eltern sehen andere Kinder im Team",
    affects:"user", default:true, deps:["players_list"] },
  { id:"attendance_tab",  cat:"team",      phase:1, risk:"low",
    label:"Anwesenheits-Tab",
    desc:"Trainer sehen Anwesenheits-Statistiken",
    affects:"trainer", default:true, deps:[] },
  { id:"attendance_csv",  cat:"team",      phase:3, risk:"low",
    label:"CSV-Export Anwesenheit",
    desc:"Export als Excel-kompatible Datei",
    affects:"trainer", default:true, deps:["attendance_tab"] },
  { id:"results_tab",     cat:"team",      phase:2, risk:"low",
    label:"Ergebnisse & Tabelle",
    desc:"Spielergebnisse eintragen und Saisontabelle",
    affects:"trainer", default:true, deps:[] },
  { id:"jerseys_tab",     cat:"team",      phase:3, risk:"low",
    label:"Trikot-Verwaltung",
    desc:"Trikot-Nummern und -Zuteilung",
    affects:"trainer", default:true, deps:[] },

  //  KOMMUNIKATION 
  { id:"chat_team",       cat:"komm",      phase:1, risk:"medium",
    label:"Team-Chat",
    desc:"Chat innerhalb des Teams zwischen Trainer und Eltern",
    affects:"all", default:true, deps:[] },
  { id:"chat_club",       cat:"komm",      phase:2, risk:"medium",
    label:"Vereins-Chat",
    desc:"Übergreifender Chat für alle Teams eines Vereins",
    affects:"all", default:true, deps:["chat_team"] },
  { id:"chat_parents",    cat:"komm",      phase:3, risk:"high",
    label:"Eltern dürfen schreiben",
    desc:"Eltern können im Chat Nachrichten senden (nicht nur lesen)",
    affects:"user", default:false, deps:["chat_team"] },
  { id:"chat_moderation", cat:"komm",      phase:1, risk:"low",
    label:"Chat-Moderation (KI)",
    desc:"Automatische Erkennung von Werbung und illegalen Inhalten",
    affects:"all", default:true, deps:["chat_team"] },
  { id:"news_board",      cat:"komm",      phase:2, risk:"low",
    label:"Schwarzes Brett",
    desc:"Admin kann Vereinsnews für alle veröffentlichen",
    affects:"admin", default:true, deps:[] },
  { id:"broadcast_msg",   cat:"komm",      phase:2, risk:"medium",
    label:"Rundschreiben an Trainer",
    desc:"Admin kann Massennachricht an alle Trainer senden",
    affects:"admin", default:true, deps:[] },
  { id:"invite_sheet",    cat:"komm",      phase:1, risk:"low",
    label:"Einladungs-Zettel",
    desc:"Admin kann Einladungs-Text mit Code generieren",
    affects:"admin", default:true, deps:[] },
  { id:"pw_forgot",       cat:"komm",      phase:1, risk:"low",
    label:"Passwort vergessen",
    desc:"Nutzer können Passwort-Reset anfordern",
    affects:"all", default:true, deps:[] },
  { id:"contact_wa",      cat:"komm",      phase:2, risk:"low",
    label:"WhatsApp-Kontakt Button",
    desc:"Trainer-Kontakt via WhatsApp-Deeplink",
    affects:"all", default:true, deps:[] },

  //  PLÄTZE 
  { id:"fields_manager",  cat:"plätze",   phase:3, risk:"low",
    label:"Felder-Verwaltung (Admin)",
    desc:"Admin kann Felder mit Vorlagen anlegen",
    affects:"admin", default:true, deps:[] },
  { id:"fields_booking",  cat:"plätze",   phase:3, risk:"medium",
    label:"Platzbuchung (Trainer)",
    desc:"Trainer können Felder reservieren",
    affects:"trainer", default:true, deps:["fields_manager"] },
  { id:"fields_weather",  cat:"plätze",   phase:4, risk:"low",
    label:"Wetter-Flags",
    desc:"Gutwetter/Schlechtwetter Unterscheidung bei Feldern",
    affects:"trainer", default:true, deps:["fields_manager"] },

  //  TRAINING 
  { id:"training_plans",  cat:"training",  phase:4, risk:"low",
    label:"Trainingspläne erstellen",
    desc:"Trainer können eigene Trainingspläne anlegen",
    affects:"trainer", default:true, deps:[] },
  { id:"training_library",cat:"training",  phase:4, risk:"low",
    label:"Vorlagen-Bibliothek",
    desc:"27+ professionelle Übungsvorlagen mit Coaching-Hinweisen",
    affects:"trainer", default:true, deps:["training_plans"] },
  { id:"training_inventory",cat:"training",phase:4, risk:"low",
    label:"Inventar-Liste",
    desc:"Automatische Material-Liste vor dem Training",
    affects:"trainer", default:true, deps:["training_plans"] },
  { id:"training_fieldplan",cat:"training",phase:4, risk:"low",
    label:"Platz-Visualisierung",
    desc:"SVG-Grafik zeigt Übungszonen auf dem Feld",
    affects:"trainer", default:true, deps:["training_plans"] },
  { id:"training_checker",cat:"training",  phase:4, risk:"low",
    label:"Trainer-Checkin beim Training",
    desc:"Trainer kann sich beim Termin als anwesend markieren",
    affects:"trainer", default:true, deps:[] },
  { id:"trainer_stats",   cat:"training",  phase:4, risk:"low",
    label:"Trainer-Anwesenheits-Statistik",
    desc:"Auswertung wie oft jeder Trainer da war",
    affects:"admin", default:true, deps:["training_checker"] },

  //  SICHERHEIT 
  { id:"bruteforce_prot", cat:"sicherheit",phase:1, risk:"low",
    label:"Brute-Force Schutz",
    desc:"Nach 3 Fehlversuchen 5 Min Sperre",
    affects:"all", default:true, deps:[] },
  { id:"audit_log",       cat:"sicherheit",phase:1, risk:"low",
    label:"Audit-Log",
    desc:"Alle Logins und Änderungen werden protokolliert",
    affects:"admin", default:true, deps:[] },
  { id:"device_track",    cat:"sicherheit",phase:2, risk:"medium",
    label:"Geräte-Erkennung",
    desc:"Neue Geräte werden im Sicherheitslog markiert",
    affects:"admin", default:true, deps:["audit_log"] },
  { id:"region_warn",     cat:"sicherheit",phase:2, risk:"low",
    label:"Auslands-Warnung",
    desc:"Login aus unbekannter Region wird geflaggt",
    affects:"admin", default:true, deps:["audit_log"] },
  { id:"access_manager",  cat:"sicherheit",phase:2, risk:"medium",
    label:"Zugänge-Verwaltung",
    desc:"Admin kann alle Passwörter ändern und Zugänge sperren",
    affects:"admin", default:true, deps:[] },

  //  MARKETING 
  { id:"affiliate_banner",cat:"marketing", phase:5, risk:"low",
    label:"Affiliate-Banner",
    desc:"Werbebanner für Sportausrüstung (Einnahmen für dich)",
    affects:"all", default:false, deps:[] },
  { id:"nps_survey",      cat:"marketing", phase:3, risk:"low",
    label:"NPS-Umfrage",
    desc:"Nach 30 Tagen Zufriedenheits-Abfrage (0-10)",
    affects:"trainer", default:true, deps:[] },
  { id:"moment_share",    cat:"marketing", phase:3, risk:"low",
    label:"Teilen-Funktion",
    desc:"Trainer können die App weiterempfehlen",
    affects:"trainer", default:true, deps:[] },
  { id:"achievements",    cat:"marketing", phase:4, risk:"low",
    label:"Achievements / Meilensteine",
    desc:"Kleine Erfolgs-Toasts beim Erreichen von Zielen",
    affects:"trainer", default:true, deps:[] },
  { id:"powered_by",      cat:"marketing", phase:2, risk:"low",
    label:"'Powered by Vereins-App' Link",
    desc:"Kleiner Link in der Eltern-Ansicht",
    affects:"user", default:true, deps:[] },

  //  UI/UX 
  { id:"dark_mode",       cat:"uiux",      phase:1, risk:"low",
    label:"Dark Mode",
    desc:"Nutzer können zwischen Hell, Dunkel und Auto wählen",
    affects:"all", default:true, deps:[] },
  { id:"font_size",       cat:"uiux",      phase:1, risk:"low",
    label:"Schriftgröße-Einstellung",
    desc:"Klein, Normal oder Groß für bessere Lesbarkeit",
    affects:"all", default:true, deps:[] },
  { id:"animations",      cat:"uiux",      phase:1, risk:"low",
    label:"Animationen",
    desc:"Ein-/Ausblende-Animationen und Übergaenge",
    affects:"all", default:true, deps:[] },
  { id:"accessibility_bar",cat:"uiux",     phase:1, risk:"low",
    label:"Schrift-Button vor Login",
    desc:"A/A/A Schriftgröße-Schalter auf Login-Seite",
    affects:"all", default:true, deps:["font_size"] },

  //  DATENSCHUTZ 
  { id:"dsgvo_consent",   cat:"datenschutz",phase:1, risk:"high",
    label:"DSGVO Einwilligungs-System",
    desc:"Einwilligung vor Fotos und sensiblen Daten",
    affects:"all", default:true, deps:[] },
  { id:"photo_upload",    cat:"datenschutz",phase:3, risk:"high",
    label:"Mannschafts-Fotos",
    desc:"Teams können Gruppenfotos hochladen (nur mit Einwilligung)",
    affects:"trainer", default:true, deps:["dsgvo_consent"] },
  { id:"dsgvo_delete",    cat:"datenschutz",phase:1, risk:"low",
    label:"DSGVO-Löschung",
    desc:"Spielerdaten können auf Anfrage gelöscht werden",
    affects:"admin", default:true, deps:[] },
];

export const MILESTONES = [
  {
    phase: 1,
    name: "Beta Kern",
    icon: "1",
    col: "#16a34a",
    desc: "Grundfunktionen: Termine, Abstimmung, Chat, Sicherheit",
    goal: "Erste echte Teams onboarden und Feedback sammeln",
  },
  {
    phase: 2,
    name: "Kommunikation",
    icon: "2",
    col: "#2563eb",
    desc: "Passwort-Reset, Einladungen, News, Zugänge-Verwaltung",
    goal: "Selbstständiges Nutzer-Management ohne Admin-Eingriffe",
  },
  {
    phase: 3,
    name: "Verwaltung",
    icon: "3",
    col: "#7c3aed",
    desc: "Trikots, Helfer, Platzbuchung, CSV-Export",
    goal: "Vollständige Vereins-Verwaltung aus einer App",
  },
  {
    phase: 4,
    name: "Trainer-Tools",
    icon: "4",
    col: "#d97706",
    desc: "Trainingspläne, Vorlagen, Statistiken, Feldplan",
    goal: "Professionelle Trainer-Unterstützung und Auswertungen",
  },
  {
    phase: 5,
    name: "Full Release",
    icon: "5",
    col: "#dc2626",
    desc: "Alle Features aktiv, Affiliate, Marketing",
    goal: "Öffentlicher Launch mit allen Funktionen",
  },
];

// Feature-Flag lesen
export const FEAT_KEY = "va_features_v1";
// Global gespeicherte Modul-Schalter (data.featureFlags, globale Zeile) haben
// Vorrang - sie gelten fuer ALLE Geraete. Der Geraete-Speicher (va_features)
// ist nur noch Fallback, solange die Cloud keinen Wert kennt.
let _FEAT_CLOUD = null;
export const applyFeatureFlags = (o) => { _FEAT_CLOUD = (o && typeof o === "object" && !Array.isArray(o)) ? o : null; };
export const getFeat = (id) => {
  try {
    if (_FEAT_CLOUD && Object.prototype.hasOwnProperty.call(_FEAT_CLOUD, id)) return !!_FEAT_CLOUD[id];
    const stored = JSON.parse(localStorage.getItem(FEAT_KEY)||"{}");
    if(stored.hasOwnProperty(id)) return stored[id];
    return FEATURE_REGISTRY.find(f=>f.id===id)?.default ?? true;
  } catch { return true; }
};
export const setFeat = (id, val) => {
  try {
    const stored = JSON.parse(localStorage.getItem(FEAT_KEY)||"{}");
    stored[id] = val;
    localStorage.setItem(FEAT_KEY, JSON.stringify(stored));
  } catch {}
};
export const setAllPhase = (phase) => {
  try {
    const stored = JSON.parse(localStorage.getItem(FEAT_KEY)||"{}");
    FEATURE_REGISTRY.forEach(f => {
      stored[f.id] = f.phase <= phase;
    });
    localStorage.setItem(FEAT_KEY, JSON.stringify(stored));
  } catch {}
};
// Check if feature active (use everywhere in app)
export const feat = (id) => getFeat(id);
