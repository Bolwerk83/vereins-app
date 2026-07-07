// Affiliate-Partner, IDs und Banner-Definitionen (reine Daten + Laufzeit-Override).
/* =============================================================
   AFFILIATE + WERBUNG
   -------------------------------------------------------------
   HIER deine Affiliate-IDs eintragen, sobald du dich bei den
   jeweiligen Programmen angemeldet hast. Solange ein Feld leer
   ist, läuft der Link auf den fallback-Wert ("vereinsapp") -
   damit verdienst du NICHTS, der Klick zählt aber als Test-Klick.
   ============================================================= */
export const AFFILIATE_IDS = {
  amazon: "",          // Amazon Partnernet: Tag wie "deinname-21"
  owayo:  "",          // Owayo Vereins-Partner-ID
  awin:   "",          // AWIN Publisher-ID (für 11teamsports, Decathlon, ...)
  hrs:    "",          // HRS Sports / Hotel-Affiliate-ID
  jako:   "",          // JAKO Direktpartner-Code (langfristig)
  trainerakademie: "", // Deutsche Trainerakademie etc.
  adsense: "",         // Google AdSense Publisher-ID, z. B. "ca-pub-1234567890123456"
};
// Affiliate-IDs zur Laufzeit aus den (global gespeicherten) Vereinsdaten
// übernehmen – im SuperAdmin pflegbar, ohne Code-Änderung.
export function applyAffiliateIds(o){ if(o&&typeof o==="object"){ for(const k of Object.keys(AFFILIATE_IDS)){ if(typeof o[k]==="string") AFFILIATE_IDS[k]=o[k]; } } }

/* AdSense-Konfiguration (Display-Werbung). Solange `client` leer
   ist, wird KEIN AdSense-Code geladen. Damit personalisierte Ads in
   der EU laufen können, braucht es zusätzlich einen Consent-Manager
   (Google Funding Choices oder externes CMP). Solange nicht
   konfiguriert: nur nicht-personalisierte Anzeigen. */
export const ADSENSE_CONFIG = {
  client: "",          // z. B. "ca-pub-1234567890123456"
  slots: {
    directoryTop: "",  // Slot-ID für oben auf der Vereins-Liste
    feedInline:   "",  // Slot-ID für Inline-Position
  },
};

/* Affiliate-Slots. weight = Reihenfolge wenn mehrere für einen
   Trigger konfiguriert wären; idKey verweist auf AFFILIATE_IDS. */
/* Affiliate-Slots, ausgerichtet auf die App-Trigger (Trikots, Spieler,
   Termine, Platz, Ergebnisse, Training) und brand-safe fuer den Jugend-/
   Familienkontext. Empfohlene, passende AWIN-Advertiser-Kategorien:
     - Retail: Sportartikel · Sportbekleidung · Schuhe · Kinderbekleidung
               · Foto- & Druckdienste (Trikot-/Bannerdruck, Mannschaftsfotos)
               · Gesundheit & Pflege
     - Reisen: Hotels & Uebernachtungen · Busse (Turniere/Auswaerts)
   BEWUSST MEIDEN (neben Kinderdaten): Erotik, Dating, Gluecksspiele/
   Gewinnspiele, Alkohol/Tabak, Finanzprodukte.
   AWIN-Deeplink-Muster: awin1.com/cread.php?awinmid=<ADVERTISER-mid>&
   awinaffid=<DEINE-AWIN-PUBLISHER-ID>&clickref=<trigger>. Wo noch keine
   verifizierte mid vorliegt, zeigt der Link direkt auf den Shop (funktioniert,
   aber ohne Provision) - spaeter durch awinDeep(<mid>,<trigger>) ersetzen.
   weight = Reihenfolge; idKey -> AFFILIATE_IDS (idKey:null = immer verfuegbar). */
const awinDeep = (mid, ref) => `https://www.awin1.com/cread.php?awinmid=${mid}&awinaffid=${AFFILIATE_IDS.awin||"0"}&clickref=${ref}`;
export const AFFILIATES = [
  // === TRIKOTS (Sportbekleidung + Druck) ===
  { id:"owayo-jerseys", trigger:"jerseys", weight:3, idKey:"owayo", icon:"O",
    text:"Trikots & Vereinskleidung drucken",
    sub:"Owayo · Vereinspreise ab 5 Trikots",
    network:"Owayo",
    url:(id)=>`https://www.owayo.de/?partner=${id||"vereinsapp"}` },
  { id:"11teamsports-jerseys", trigger:"jerseys", weight:2, idKey:"awin", icon:"11",
    text:"Vereins- & Bundesliga-Trikots",
    sub:"11teamsports · Vereinskonditionen",
    network:"AWIN · 11teamsports",
    url:()=>awinDeep(14589,"jerseys") },
  { id:"amazon-jerseys", trigger:"jerseys", weight:1, idKey:"amazon", icon:"A",
    text:"Trikots & Sportbekleidung",
    sub:"Amazon · große Auswahl",
    network:"Amazon Partnernet",
    url:(id)=>`https://www.amazon.de/s?k=fu%C3%9Fball+trikot+kinder&tag=${id||"vereinsapp-21"}` },

  // === SPIELER (Sportartikel / Kinder / Schuhe) ===
  { id:"11teamsports-players", trigger:"players", weight:3, idKey:"awin", icon:"11",
    text:"Fußballschuhe & Schienbeinschoner",
    sub:"11teamsports · schnelle Lieferung",
    network:"AWIN · 11teamsports",
    url:()=>awinDeep(14589,"players") },
  { id:"decathlon-players", trigger:"players", weight:2, idKey:null, icon:"D",
    text:"Ausrüstung & Schuhe für Kinder",
    sub:"Decathlon · günstig für die Jugend",
    network:"Decathlon", // AWIN-Advertiser (Sportartikel) - mid eintragen: awinDeep(<mid>,"players")
    url:()=>`https://www.decathlon.de/sport/fussball` },
  { id:"amazon-players", trigger:"players", weight:1, idKey:"amazon", icon:"A",
    text:"Sportausrüstung für Kinder",
    sub:"Amazon · alles fürs Training",
    network:"Amazon Partnernet",
    url:(id)=>`https://www.amazon.de/s?k=fu%C3%9Fball+kinder+ausr%C3%BCstung&tag=${id||"vereinsapp-21"}` },

  // === TERMINE (Reisen: Hotels & Busse für Turniere/Auswärts) ===
  { id:"hrs-events", trigger:"events", weight:3, idKey:"hrs", icon:"H",
    text:"Hotel fürs Turnierwochenende",
    sub:"HRS · Gruppen-/Vereinsraten",
    network:"HRS",
    url:(id)=>`https://www.hrs.de/?partnerid=${id||"vereinsapp"}` },
  { id:"flixbus-events", trigger:"events", weight:2, idKey:null, icon:"Bus",
    text:"Mannschaftsfahrt zum Turnier",
    sub:"FlixBus · günstige Gruppenfahrten",
    network:"FlixBus", // AWIN-Advertiser (Reisen/Busse) - mid eintragen: awinDeep(<mid>,"events")
    url:()=>`https://www.flixbus.de/` },
  { id:"amazon-events", trigger:"events", weight:1, idKey:"amazon", icon:"A",
    text:"Reisetaschen & Trinkflaschen",
    sub:"Amazon · für Auswärtsfahrten",
    network:"Amazon Partnernet",
    url:(id)=>`https://www.amazon.de/s?k=sporttasche+trinkflasche&tag=${id||"vereinsapp-21"}` },

  // === PLATZ (Trainings-Equipment / Sportartikel) ===
  { id:"decathlon-fields", trigger:"fields", weight:2, idKey:null, icon:"D",
    text:"Tore, Hütchen & Markierung",
    sub:"Decathlon · Trainingsmaterial",
    network:"Decathlon", // AWIN-Advertiser (Sportartikel) - mid eintragen
    url:()=>`https://www.decathlon.de/sport/fussball` },
  { id:"amazon-fields", trigger:"fields", weight:1, idKey:"amazon", icon:"A",
    text:"Trainings-Equipment",
    sub:"Hütchen, Mini-Tore, Markierungen",
    network:"Amazon Partnernet",
    url:(id)=>`https://www.amazon.de/s?k=fu%C3%9Fballtor+kinder+training&tag=${id||"vereinsapp-21"}` },

  // === ERGEBNISSE (Sportkamera/Analyse) ===
  { id:"amazon-cam", trigger:"results", weight:1, idKey:"amazon", icon:"A",
    text:"Sportkamera fürs Spiel",
    sub:"Automatisches Aufzeichnen · ab 200 €",
    network:"Amazon Partnernet",
    url:(id)=>`https://www.amazon.de/s?k=sportkamera+fu%C3%9Fball&tag=${id||"vereinsapp-21"}` },

  // === TRAINING (Trainer-Weiterbildung + Fachliteratur) ===
  { id:"trainerakademie", trigger:"training", weight:2, idKey:"trainerakademie", icon:"T",
    text:"Trainer-Lizenz online",
    sub:"DFB-konforme Weiterbildung",
    network:"Trainerakademie",
    url:(id)=>`https://www.deutsche-trainerakademie.de/?ref=${id||"vereinsapp"}` },
  { id:"amazon-training", trigger:"training", weight:1, idKey:"amazon", icon:"A",
    text:"Trainingsbücher & Übungssammlungen",
    sub:"Amazon · Jugendfußball",
    network:"Amazon Partnernet",
    url:(id)=>`https://www.amazon.de/s?k=jugendfu%C3%9Fball+training+buch&tag=${id||"vereinsapp-21"}` },

  // settings (Operatives)
  { id:"supabase", trigger:"settings", weight:1, idKey:null, icon:"S",
    text:"Eigene Cloud-Datenbank",
    sub:"Supabase · kostenloser Vereins-Start",
    network:"Direkt",
    url:()=>`https://supabase.com/?ref=vereinsapp` },
];
