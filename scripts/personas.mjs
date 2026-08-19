// 500 Personas fuer den Anwender-Check. Jede Persona bringt ihre eigene
// Erwartung mit ("Ich muss X sehen", "Ich darf Y nicht sehen", "nichts darf
// aus dem Bildschirm laufen"). Geprueft wird gegen echte Messwerte aus dem
// Browser-Rundgang (scripts/test-personas.mjs) - die Personas teilen sich
// dabei Sitzungs-Profile, damit jede Erwartung an echten Daten haengt.
const VORNAMEN=["Anna","Bernd","Carla","Dennis","Elif","Fatih","Greta","Hakan","Ines","Jonas","Katja","Lars","Mira","Nils","Olga","Peter","Quirin","Rita","Sven","Tanja","Udo","Vera","Wolf","Yasmin","Zeynep","Ahmed","Britta","Cem","Doris","Emre","Frank","Gabi","Hanna","Igor","Jasmin","Kemal","Lena","Murat","Nora","Onur","Paula","Rana","Stefan","Timo","Ulrike","Viktor","Willi","Xenia","Yusuf","Zoe"];
const NACHNAMEN=["Berger","Clausen","Demir","Engel","Fischer","Grote","Hansen","Ivanov","Jansen","Kaya","Lange","Meier","Novak","Ortmann","Peters","Quast","Richter","Schulz","Thiel","Ulrich","Vogt","Weber","Yilmaz","Zimmer"];
// Sitzungs-Profile: Rolle x Bildschirm x Sprache. Der Rundgang misst sie einmal.
export const PROFILE=[
  {id:"trainer-klein",  rolle:"trainer", w:320, h:640, lang:"de"},
  {id:"trainer-normal", rolle:"trainer", w:390, h:844, lang:"de"},
  {id:"trainer-gross",  rolle:"trainer", w:430, h:932, lang:"de"},
  {id:"trainer-en",     rolle:"trainer", w:390, h:844, lang:"en"},
  {id:"helfer-klein",   rolle:"helfer",  w:320, h:640, lang:"de"},
  {id:"helfer-normal",  rolle:"helfer",  w:390, h:844, lang:"de"},
  {id:"helfer-gross",   rolle:"helfer",  w:430, h:932, lang:"de"},
  {id:"kasse-normal",   rolle:"kasse",   w:390, h:844, lang:"de"},
  {id:"eltern-klein",   rolle:"eltern",  w:320, h:640, lang:"de"},
  {id:"eltern-normal",  rolle:"eltern",  w:390, h:844, lang:"de"},
  {id:"eltern-en",      rolle:"eltern",  w:390, h:844, lang:"en"},
  {id:"eltern-tr",      rolle:"eltern",  w:390, h:844, lang:"tr"},
  {id:"admin-normal",   rolle:"admin",   w:390, h:844, lang:"de"},
  {id:"admin-klein",    rolle:"admin",   w:320, h:640, lang:"de"},
];
// Was jede Rolle koennen bzw. nicht sehen soll. "wo" ist der Messpunkt.
const ERW = {
  trainer:[
    {art:"sichtbar",   wo:"start",  was:"Ansehen",            grund:"Termine öffnen"},
    {art:"sichtbar",   wo:"start",  was:"🏗 Aufbau",          grund:"Aufbau direkt erreichbar"},
    {art:"sichtbar",   wo:"start",  was:"Training",           grund:"Trainingsplanung erreichbar"},
    {art:"sichtbar",   wo:"aufbau", was:"Das wird gebraucht", grund:"Aufbau-Liste"},
    {art:"sichtbar",   wo:"aufbau", was:"AUFBAU-VORSCHLÄGE",  grund:"KI-Vorschlag"},
    {art:"kein_overflow", wo:"start", grund:"Karten passen auf den Bildschirm"},
    {art:"kein_overflow", wo:"aufbau",grund:"Aufbau-Liste passt auf den Bildschirm"},
    {art:"kein_overflow", wo:"termin",grund:"Termin passt auf den Bildschirm"},
    {art:"sauber",     wo:"aufbau", grund:"keine kaputten Zahlen im Aufbau"},
    {art:"tippziele",  wo:"start",  grund:"Knöpfe groß genug zum Treffen"},
    {art:"sprache",                 grund:"Oberfläche in der gewählten Sprache"},
    {art:"keine_fehler", grund:"kein Absturz"},
  ],
  helfer:[
    {art:"sichtbar",   wo:"start",  was:"🏗 Aufbau",          grund:"Aufbau ist die Hauptaufgabe"},
    {art:"sichtbar",   wo:"start",  was:"Ansehen",            grund:"Termin ansehen"},
    {art:"unsichtbar", wo:"start",  was:"📋 Spickzettel",     grund:"Trainer-Werkzeug"},
    {art:"unsichtbar", wo:"start",  was:"✏️ Bearbeiten",      grund:"darf Termine nicht ändern"},
    {art:"unsichtbar", wo:"start",  was:"Training planen",    grund:"kein Trainingsplan"},
    {art:"sichtbar",   wo:"aufbau", was:"Ballsack",           grund:"einfache Liste"},
    {art:"unsichtbar", wo:"aufbau", was:"EINSTELLUNGEN",      grund:"keine Einstellungen für Helfer"},
    {art:"unsichtbar", wo:"termin", was:"👥 Orga",            grund:"kein Orga-Reiter"},
    {art:"kein_overflow", wo:"start", grund:"Karten passen auf den Bildschirm"},
    {art:"kein_overflow", wo:"aufbau",grund:"Liste passt auf den Bildschirm"},
    {art:"kein_overflow", wo:"termin",grund:"Termin passt auf den Bildschirm"},
    {art:"sauber",     wo:"aufbau", grund:"keine kaputten Zahlen im Aufbau"},
    {art:"tippziele",  wo:"start",  grund:"Knöpfe groß genug zum Treffen"},
    {art:"keine_fehler", grund:"kein Absturz"},
  ],
  kasse:[
    {art:"unsichtbar", wo:"start",  was:"🏗 Aufbau",          grund:"reiner Kassenhelfer macht keinen Aufbau"},
    {art:"unsichtbar", wo:"start",  was:"Das wird gebraucht", grund:"kein Aufbau"},
    {art:"sichtbar",   wo:"start",  was:"Kasse",              grund:"seine eigentliche Aufgabe"},
    {art:"keine_fehler", grund:"kein Absturz"},
    {art:"kein_overflow", wo:"start", grund:"passt auf den Bildschirm"},
    {art:"tippziele",  wo:"start", grund:"Knöpfe groß genug zum Treffen"},
  ],
  eltern:[
    {art:"unsichtbar", wo:"start",  was:"Das wird gebraucht", grund:"Aufbau ist nicht ihre Aufgabe"},
    {art:"unsichtbar", wo:"start",  was:"Spickzettel",        grund:"Trainer-Werkzeug"},
    {art:"unsichtbar", wo:"start",  was:"AUFBAU-VORSCHLÄGE",  grund:"Trainer-Werkzeug"},
    {art:"kein_overflow", wo:"start", grund:"Abstimmung passt auf den Bildschirm"},
    {art:"tippziele",  wo:"start",  grund:"Knöpfe groß genug zum Treffen"},
    {art:"sprache",                 grund:"Oberfläche in der gewählten Sprache"},
    {art:"keine_fehler", grund:"kein Absturz"},
  ],
  admin:[
    {art:"sichtbar",   wo:"mehr",   was:"📈 Entwicklung",     grund:"Überblick über die Entwicklung"},
    {art:"sichtbar",   wo:"log",    was:"Neue Funktion",      grund:"Features getrennt gezählt"},
    {art:"sichtbar",   wo:"log",    was:"Behobener Fehler",   grund:"Fehler getrennt gezählt"},
    {art:"kein_overflow", wo:"log",  grund:"Log passt auf den Bildschirm"},
    {art:"kein_overflow", wo:"start",grund:"Überblick passt auf den Bildschirm"},
    {art:"tippziele",  wo:"start",  grund:"Knöpfe groß genug zum Treffen"},
    {art:"keine_fehler", grund:"kein Absturz"},
  ],
};
// Situationen schaerfen die Persona, aendern aber nichts an der Technik.
const SITUATION={
  trainer:["betreut zwei Mannschaften","ist neu und unsicher mit Technik","plant am Handy im Auto","hat 25 Kinder im Kader","teilt sich das Team mit einem Co-Trainer","macht alles kurz vor dem Training","ist selbst Vater im Team","trainiert nur vertretungsweise"],
  helfer:["baut zum ersten Mal auf","kennt sich mit Fußball kaum aus","hilft in zwei Jugenden","kommt direkt von der Arbeit","ist Opa und liest ungern kleine Schrift","organisiert lieber den Kuchenstand","packt beim Turnier mit an","ist selbst Ex-Spieler"],
  kasse:["macht nur die Kasse","zählt nach dem Turnier ab","verwaltet die Wechselgeldkasse"],
  eltern:["hat zwei Kinder im Verein","spricht wenig Deutsch","antwortet im Bus","vergisst Termine gern","fährt Fahrgemeinschaft","meldet das Kind oft krank","liest nur die Erinnerung","ist neu im Verein"],
  admin:["will den Überblick behalten","plant die neue Saison","zeigt es dem Vorstand","prüft, ob sich die App lohnt","sucht neue Trainer"],
};
const ERFAHRUNG=["nie mit Apps gearbeitet","kommt gut zurecht","sehr technikaffin","nutzt nur das Nötigste"];
export function buildPersonas(n=500){
  const out=[]; let i=0;
  const rollenPlan=[...Array(150).fill("trainer"),...Array(150).fill("helfer"),...Array(140).fill("eltern"),...Array(30).fill("admin"),...Array(30).fill("kasse")];
  while(out.length<n){
    const rolle=rollenPlan[out.length%rollenPlan.length];
    const prof=PROFILE.filter(p=>p.rolle===rolle);
    const p=prof[i%prof.length];
    const sit=SITUATION[rolle][i%SITUATION[rolle].length];
    const name=`${VORNAMEN[i%VORNAMEN.length]} ${NACHNAMEN[(i*7)%NACHNAMEN.length]}`;
    out.push({ id:"p"+String(out.length+1).padStart(3,"0"), name, rolle, profil:p.id,
      geraet:`${p.w}px`, sprache:p.lang, situation:sit, erfahrung:ERFAHRUNG[i%ERFAHRUNG.length],
      erwartungen:ERW[rolle] });
    i++;
  }
  return out;
}
