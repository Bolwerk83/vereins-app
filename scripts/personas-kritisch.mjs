// 500 sehr kritische Personas. Diese Leute finden fast nichts gut: zu viel
// Text, zu viele Knoepfe, Fachchinesisch, blasse Schrift, Popups vor dem
// ersten Blick, zu tief versteckte Hauptaktionen. Ihre Messlatten liegen
// bewusst hoeher als das, was im Alltag gerade noch durchgeht.
export const KRIT_PROFILE=[
  {id:"k-trainer-klein",  rolle:"trainer", w:320, h:640, lang:"de"},
  {id:"k-trainer-normal", rolle:"trainer", w:390, h:844, lang:"de"},
  {id:"k-helfer-klein",   rolle:"helfer",  w:320, h:640, lang:"de"},
  {id:"k-helfer-normal",  rolle:"helfer",  w:390, h:844, lang:"de"},
  {id:"k-eltern-klein",   rolle:"eltern",  w:320, h:640, lang:"de"},
  {id:"k-eltern-normal",  rolle:"eltern",  w:390, h:844, lang:"de"},
  {id:"k-admin-normal",   rolle:"admin",   w:390, h:844, lang:"de"},
];
// Archetypen mit ihrer jeweiligen Messlatte
export const KRITIKER=[
  { id:"lesefaul", name:"Der Lesefaule", satz:"Wenn ich mehr als ein paar Zeilen lesen muss, bin ich raus.",
    pruefe:[{art:"max_woerter", wo:"sicht", grenze:120, text:"Zu viel Text auf dem ersten Blick"}] },
  { id:"entscheidungsmuede", name:"Die Entscheidungsmüde", satz:"So viele Knöpfe – womit soll ich anfangen?",
    pruefe:[{art:"max_knoepfe", wo:"sicht", grenze:12, text:"Zu viele Knöpfe gleichzeitig sichtbar"}] },
  { id:"laie", name:"Der Fußball-Laie", satz:"Funino? Spielform? Ich hab keine Ahnung, was das heißt.",
    pruefe:[{art:"jargon", wo:"sicht", grenze:1, text:"Fachbegriffe ohne Erklärung"}] },
  { id:"augen", name:"Die Brillenträgerin", satz:"Diese hellgraue Schrift kann ich schlicht nicht lesen.",
    pruefe:[{art:"kontrast", grenze:0, text:"Zu blasse Schrift (unter dem lesbaren Mindestkontrast)"}] },
  { id:"popupgenervt", name:"Der Popup-Genervte", satz:"Erst mal drei Fenster wegklicken, bevor ich irgendwas sehe.",
    pruefe:[{art:"max_overlays", grenze:1, text:"Mehrere Overlays vor der ersten Nutzung"}] },
  { id:"ungeduldig", name:"Die Ungeduldige", satz:"Wenn ich scrollen muss, um das Wichtigste zu finden, taugt es nichts.",
    pruefe:[{art:"hauptaktion_sichtbar", text:"Hauptaktion liegt unter dem sichtbaren Bereich"}] },
  { id:"emojihasser", name:"Der Emoji-Hasser", satz:"Bilderrätsel statt Beschriftung – ich will Worte.",
    pruefe:[{art:"max_emoji_only", grenze:2, text:"Knöpfe, die nur aus Symbolen bestehen"}] },
  { id:"begriffspolizist", name:"Die Begriffspolizistin", satz:"Mal heißt es so, mal anders – das ist doch dasselbe!",
    pruefe:[{art:"konsistenz", text:"Dieselbe Sache heißt an verschiedenen Stellen anders"}] },
  { id:"zurueck", name:"Der Zurück-Taster", satz:"Ich drücke Zurück – und lande gleich ganz woanders.",
    pruefe:[{art:"zurueck_schliesst", text:"Zurück-Taste schließt das geöffnete Fenster nicht"}] },
  { id:"zittrig", name:"Die Zittrige", satz:"Ich treffe die kleinen Knöpfe nicht, und doppelt getippt ist alles kaputt.",
    pruefe:[{art:"tippziel_hart", wo:"sicht", grenze:44, text:"Knöpfe unter 44 px – schwer zu treffen"},
            {art:"doppeltipp", text:"Doppelt getippt führt zu einem widersprüchlichen Zustand"}] },
];
const VORNAMEN=["Achim","Beate","Claus","Dagmar","Egon","Frieda","Gunter","Helga","Ingo","Jutta","Klaus","Lore","Manfred","Nina","Otto","Petra","Rolf","Sieglinde","Theo","Ute","Volker","Waltraud","Xaver","Yvonne","Zita"];
const NACHNAMEN=["Adler","Bock","Cramer","Drews","Ebert","Falk","Gruber","Haas","Ims","Jost","Kern","Lorenz","Maas","Nolte","Ohlsen","Pfeiffer","Reuter","Stark","Tietze","Voss"];
export function buildKritiker(n=500){
  const out=[]; let i=0;
  while(out.length<n){
    const k=KRITIKER[i%KRITIKER.length];
    const p=KRIT_PROFILE[(i*3)%KRIT_PROFILE.length];
    out.push({ id:"k"+String(out.length+1).padStart(3,"0"),
      name:`${VORNAMEN[i%VORNAMEN.length]} ${NACHNAMEN[(i*5)%NACHNAMEN.length]}`,
      archetyp:k.id, typName:k.name, satz:k.satz, rolle:p.rolle, profil:p.id,
      geraet:`${p.w}px`, pruefe:k.pruefe });
    i++;
  }
  return out;
}
