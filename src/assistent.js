// ----------------------------------------------------------------
// Wissensbasis des Trainer-Assistenten. Reine Daten + Erkennung, keine
// Oberfläche. Bewusst offline: die Antworten kommen aus dieser Datei und
// aus der Übungssammlung (drills.js) - kein fremder Dienst, keine Kosten.
// Später lässt sich hier eine echte KI dazuschalten, ohne dass die
// Oberfläche etwas davon merkt (antwortAuf bleibt die eine Schnittstelle).
// ----------------------------------------------------------------

// Ein Thema bündelt: woran man es erkennt, was der Trainer wissen sollte,
// welcher Trainings-Schwerpunkt dazugehört und welche Aufgabe sich lohnt.
export const THEMEN = [
  {
    id:"zusammenspiel", titel:"Zusammenspiel & Passspiel", icon:"🤝", focus:"spielform",
    worte:["zusammenspiel","zusammen spielen","zusammenspielen","passspiel","pässe","paesse","pass","passen","kombination","kombinieren","miteinander","abspiel","anspiel","mannschaftsspiel","teamplay","abstimmung","füreinander","einzelkämpfer","alleine","eigensinnig"],
    kern:"Kinder spielen nicht ab, weil sie den Mitspieler nicht sehen – nicht, weil sie egoistisch sind. Das Ziel ist also nicht „spiel ab!“, sondern „schau vor dem Ball hin“.",
    tipps:[
      "Vor dem Zuspiel schauen: Lass sie vor der Ballannahme über die Schulter blicken. Ruf im Training nur ein Wort: „Schulter!“ – das genügt.",
      "Spielt kleine Felder (4 gegen 4) mit der Regel „Tor zählt doppelt nach drei Pässen“. Das erzwingt Zusammenspiel, ohne dass ihr es fordern müsst.",
      "Anbieten üben, nicht nur Passen: Wer keinen Ball hat, bewegt sich aus dem Deckungsschatten. Das ist die eigentliche Ursache, wenn niemand anspielbar ist.",
      "Lobt den Pass, nicht das Tor. Kinder machen das, wofür sie Anerkennung bekommen – drei Wochen konsequent, dann kippt es.",
      "Verbietet nichts. „Nicht dribbeln“ nimmt den Mut. Baut stattdessen Situationen, in denen Abspielen leichter zum Erfolg führt.",
    ],
    aufgabe:{ titel:"Zusammenspiel: kleine Spielformen", takt:"woche", anzahl:2, wochen:6,
      text:"2× pro Woche eine Spielform mit Pass-Regel (4 gegen 4, Tor zählt doppelt nach drei Pässen) – sechs Wochen am Stück." },
  },
  {
    id:"abschluss", titel:"Torabschluss", icon:"🥅", focus:"torschuss",
    worte:["abschluss","tore","torschuss","schuss","schiessen","schießen","treffer","chancenverwertung","vergeben","abschlussschwäche","vor dem tor","kaltschnäuzig"],
    kern:"Vor dem Tor entscheidet nicht die Schusstechnik, sondern die Ruhe. Wer im Training nie unter Druck abschließt, verliert sie im Spiel.",
    tipps:[
      "Immer mit Torwart abschließen lassen. Schüsse ins leere Tor trainieren ein Gefühl, das es im Spiel nicht gibt.",
      "Kurze Wege: Abschluss nach 2–3 Sekunden Handlung, nicht nach langem Aufbau. So sieht es im Spiel auch aus.",
      "Zweiter Ball: Nach jedem Schuss sofort nachsetzen lassen. Die Hälfte der Kindertore fällt aus Abprallern.",
      "Nicht auf Technik korrigieren, solange das Kind trifft. Erst Selbstvertrauen, dann Feinschliff.",
      "Jedes Kind im Training mindestens 15 Abschlüsse – zählt es einmal mit, meist sind es viel weniger.",
    ],
    aufgabe:{ titel:"Abschluss-Serie", takt:"woche", anzahl:1, wochen:8,
      text:"1× pro Woche ein Abschlussblock mit Torwart, mindestens 15 Abschlüsse je Kind – acht Wochen." },
  },
  {
    id:"technik", titel:"Technik & Dribbling", icon:"⚡", focus:"technik",
    worte:["technik","dribbling","dribbeln","ballführung","ballkontrolle","ball halten","eins gegen eins","1 gegen 1","zweikampf offensiv","finten","trick","tricks","beweglichkeit am ball"],
    kern:"Ballgefühl entsteht durch Wiederholungen mit eigenem Ball – nicht durch Warteschlangen. Faustregel: jedes Kind einen Ball, niemand steht länger als zehn Sekunden.",
    tipps:[
      "Jedes Kind einen Ball. Übungen mit einem Ball für acht Kinder sind vergeudete Trainingszeit.",
      "Dribbel-Aufgaben mit Kopfarbeit verbinden: auf Zuruf Richtung wechseln, Farbe nennen, Hütchen umkurven. Das fordert Blick heben und Ballführung zugleich.",
      "Tricks kurz und oft: 3 Minuten am Anfang jeder Einheit, immer derselbe Trick für zwei Wochen. Dann sitzt er.",
      "Im 1 gegen 1 Tempo belohnen, nicht Schönheit. Ein einfacher Ausfallschritt mit Tempo schlägt jeden perfekten Übersteiger im Stand.",
      "Lasst sie scheitern. Wer den Trick nur im Training ohne Gegner zeigt, hat ihn nicht gelernt.",
    ],
    aufgabe:{ titel:"Trick der Woche", takt:"woche", anzahl:1, wochen:10,
      text:"Jede Woche ein Trick, 3 Minuten zu Beginn jeder Einheit – zehn Wochen, also zehn Tricks." },
  },
  {
    id:"verteidigen", titel:"Verteidigen & Zweikampf", icon:"🛡", focus:"taktik",
    worte:["verteidigen","abwehr","defensive","zweikampf","gegentore","hinten","tore bekommen","kassiert","pressing","stören","zweikämpfe"],
    kern:"Kinder verteidigen mit dem Fuß statt mit dem Körper. Zuerst Stellung und Abstand, erst danach die Grätsche – die meist ohnehin unnötig ist.",
    tipps:[
      "Abstand statt Attacke: eine Armlänge, seitlich stehen, den Gegner zur Außenlinie lenken. Das ist die halbe Miete.",
      "Nicht hinterherlaufen lassen: Wer einmal überlaufen wurde, soll den Weg abkürzen statt den Rücken zu zeigen.",
      "Gegentore gemeinsam anschauen, nie einzeln aufarbeiten. Ein Gegentor hat immer drei Ursachen, nicht eine.",
      "Im Training Überzahl-Unterzahl spielen (3 gegen 2). Unterzahl zwingt zum Verschieben – Verteidigen ohne Vortrag.",
      "Torwart mitverteidigen lassen: mitgehen, laut sein. Das nimmt der Abwehr enorm viel ab.",
    ],
    aufgabe:{ titel:"Unterzahl-Formen", takt:"woche", anzahl:1, wochen:6,
      text:"1× pro Woche eine Über-/Unterzahlform (3 gegen 2, 4 gegen 3) – sechs Wochen." },
  },
  {
    id:"kondition", titel:"Kondition & Athletik", icon:"🏃", focus:"kondition",
    worte:["kondition","ausdauer","kraft","athletik","schnelligkeit","fitness","müde","puste","laufen","koordination"],
    kern:"Im Kinderfußball wird Ausdauer nicht gelaufen, sondern gespielt. Runden um den Platz bringen nichts außer Langeweile.",
    tipps:[
      "Kondition kommt aus kleinen Spielformen mit vielen Wiederholungen – nicht aus Dauerläufen.",
      "Koordination vor Kraft: Hüpfen, Landen, Richtungswechsel. Das schützt Knie und Sprunggelenk mehr als jedes Krafttraining.",
      "Belastung dosieren: kurze intensive Blöcke (30–60 Sekunden), dazwischen echte Pausen. Kinder erholen sich schnell.",
      "Nie als Strafe laufen lassen. Wer Laufen mit Strafe verbindet, bewegt sich später weniger.",
      "Auf Wachstumsschübe achten: Wer plötzlich unkoordiniert wirkt, ist meist gewachsen – dann Technik vor Tempo.",
    ],
    aufgabe:{ titel:"Koordination im Aufwärmen", takt:"woche", anzahl:2, wochen:8,
      text:"Jedes Aufwärmen 5 Minuten Koordination (Hüpfen, Landen, Richtungswechsel) – acht Wochen." },
  },
  {
    id:"torwart", titel:"Torwartspiel", icon:"🧤", focus:"technik",
    worte:["torwart","keeper","tw","torhüter","torfrau","im tor","abschlag","fangen"],
    kern:"In der F- und G-Jugend gibt es keine Torwarte, sondern Kinder, die auch mal im Tor stehen. Jede und jeder sollte reihum ran.",
    tipps:[
      "Reihum ins Tor – jede Einheit ein anderes Kind. Wer festgelegt wird, verliert die Feldspieler-Ausbildung.",
      "Fangen vor Abwehren: erst sicher fangen, dann abklatschen, dann hechten.",
      "Nicht auf die Linie stellen: einen Schritt heraus, Gewicht auf den Fußballen.",
      "Torwart ist Mitspieler: mit dem Fuß anspielbar sein, laut coachen.",
      "Nach Gegentoren zuerst loben, was gut war. Kinder im Tor nehmen jedes Tor persönlich.",
    ],
    aufgabe:{ titel:"Torwart-Rotation", takt:"training", anzahl:1, wochen:12,
      text:"Jede Einheit 10 Minuten Torwartspiel mit wechselndem Kind – so kommen alle durch." },
  },
  {
    id:"teamgeist", titel:"Teamgeist nach Niederlagen", icon:"💛", focus:"spielform",
    worte:["verlieren","niederlage","verloren","stimmung","motivation","teamgeist","frust","streit","köpfe hängen","aufgeben","lustlos","kein bock","spaß"],
    kern:"Eine Serie von Niederlagen frisst zuerst die Stärksten, dann alle anderen. Dagegen hilft kein Vortrag, sondern ein zweites Erfolgsmaß neben dem Ergebnis.",
    tipps:[
      "Setzt ein eigenes Ziel pro Spiel, das nichts mit dem Ergebnis zu tun hat: „drei Kombinationen über drei Stationen“. Das ist erreichbar, auch bei 0:6.",
      "Nach dem Spiel zuerst drei Dinge, die gut waren – erst danach das andere. Und nie am Spieltag selbst analysieren.",
      "Gegner auf Augenhöhe suchen: Freundschaftsspiele bewusst gegen Mannschaften, gegen die ihr bestehen könnt. Ein Erfolgserlebnis wiegt fünf Trainings auf.",
      "Bei großem Kader lieber zwei Mannschaften melden als eine gemischte. Ständige Niederlagen vergraulen die Stärkeren, Dauer-Bankdrücken die Schwächeren.",
      "Redet mit den Eltern über das Ziel der Saison. Der Druck kommt selten von den Kindern.",
    ],
    aufgabe:{ titel:"Spielziel statt Ergebnis", takt:"spiel", anzahl:1, wochen:8,
      text:"Vor jedem Spiel ein Mannschaftsziel setzen, das nicht das Ergebnis ist – und danach gemeinsam auswerten." },
  },
  {
    id:"eltern", titel:"Eltern & Kommunikation", icon:"👪", focus:null,
    worte:["eltern","kommunikation","whatsapp","elterngespräch","väter","mütter","meckern","coachen von außen","zuschauer","beschwerde"],
    kern:"Die meisten Elternkonflikte entstehen aus fehlender Information, nicht aus Böswilligkeit. Wer früh und regelmäßig erklärt, muss selten diskutieren.",
    tipps:[
      "Einmal pro Saison Elternabend mit einer klaren Aussage zur Spielzeit. Danach bezieht ihr euch nur noch darauf.",
      "Vom Spielfeldrand coacht nur das Trainerteam. Das lässt sich freundlich, aber verbindlich vereinbaren.",
      "Kritik nie in der Gruppe beantworten – ein Anruf klärt in fünf Minuten, was im Chat eine Woche kocht.",
      "Gute Nachrichten aktiv streuen: Wer nur schreibt, wenn etwas fehlt, wird als Mahner gelesen.",
      "Absagen ohne Vorwurf annehmen. Wer sich für eine Absage rechtfertigen muss, sagt beim nächsten Mal gar nichts.",
    ],
    aufgabe:{ titel:"Kurzer Wochenrückblick an die Eltern", takt:"woche", anzahl:1, wochen:12,
      text:"1× pro Woche zwei Sätze in die Elterngruppe: was diese Woche gut lief und was ansteht." },
  },
];

// ----------------------------------------------------------------
// Tricks: Schritt für Schritt erklärt, dazu ein kleines Bewegungsbild.
// "pfad" ist ein SVG-Pfad im Koordinatenraum 0..100 x 0..60, auf dem der
// Ball entlangläuft - so sieht man die Bewegung statt sie nur zu lesen.
// ----------------------------------------------------------------
export const TRICKS = [
  { id:"sohlenrolle", name:"Sohlenrolle", ab:"ab G-Jugend", stufe:1,
    zweck:"Ball verstecken und die Richtung wechseln, ohne ihn herzugeben.",
    schritte:[
      "Ball mit der Sohle des rechten Fußes leicht berühren.",
      "Ball mit der Sohle quer nach links ziehen – der Körper bleibt zwischen Ball und Gegner.",
      "Mit dem linken Fuß sofort mitnehmen und andrehen.",
      "Erster Schritt nach dem Trick ist ein Tempo-Schritt, kein Bremsschritt.",
    ],
    fehler:"Zu langsam weiter. Der Trick gewinnt nichts, wenn danach nicht beschleunigt wird.",
    pfad:"M20,30 L45,30 L45,14 L80,14", gegner:{x:52,y:30} },
  { id:"ausfallschritt", name:"Ausfallschritt (Körpertäuschung)", ab:"ab G-Jugend", stufe:1,
    zweck:"Den Gegner auf das falsche Bein schicken – der wirksamste Trick im Kinderfußball.",
    schritte:[
      "Im Dribbling einen deutlichen Schritt nach rechts setzen, Oberkörper mitnehmen.",
      "Blick und Schulter gehen mit – das glaubt der Gegner, nicht der Fuß.",
      "Ball mit der Außenseite links am Gegner vorbeischieben.",
      "Zwei schnelle Schritte, dann erst wieder hinschauen.",
    ],
    fehler:"Nur der Fuß täuscht, der Körper bleibt gerade. Dann fällt niemand darauf herein.",
    pfad:"M20,30 L42,30 L46,42 L52,18 L80,18", gegner:{x:55,y:30} },
  { id:"uebersteiger", name:"Übersteiger", ab:"ab F-Jugend", stufe:2,
    zweck:"Klassiker: Fuß um den Ball herum, dann in die andere Richtung weg.",
    schritte:[
      "Ball leicht vorlegen, Tempo herausnehmen.",
      "Rechten Fuß von innen nach außen um den Ball führen – ohne ihn zu berühren.",
      "Auf dem rechten Fuß landen, Gewicht sofort nach links verlagern.",
      "Mit der Außenseite links wegziehen und beschleunigen.",
    ],
    fehler:"Zu weit weg vom Gegner. Der Übersteiger wirkt erst ab etwa zwei Metern Abstand.",
    pfad:"M20,30 L40,30 L44,20 L44,40 L50,30 L80,40", gegner:{x:54,y:30} },
  { id:"cruyff", name:"Cruyff-Trick", ab:"ab F-Jugend", stufe:2,
    zweck:"Aus vollem Lauf die Richtung um 180 Grad drehen – ideal an der Außenlinie.",
    schritte:[
      "Den Schuss andeuten: Standbein neben den Ball, Schussbein ausholen.",
      "Statt zu schießen den Ball mit der Innenseite hinter dem Standbein zurückziehen.",
      "Auf dem Standbein drehen und sofort losgehen.",
      "Der Blick geht vor dem Trick schon dorthin, wohin es danach gehen soll.",
    ],
    fehler:"Ball wird zu weit hinter das Standbein gezogen – dann steht man sich selbst im Weg.",
    pfad:"M20,30 L50,30 L38,42 L18,46", gegner:{x:58,y:30} },
  { id:"zidane", name:"Zidane-Drehung (Roulette)", ab:"ab E-Jugend", stufe:3,
    zweck:"Im Gedränge mit dem Rücken zum Gegner herausdrehen.",
    schritte:[
      "Ball mit der Sohle des rechten Fußes stoppen.",
      "Um den Ball herumdrehen, dabei den Körper zwischen Ball und Gegner halten.",
      "Mit der Sohle des linken Fußes den Ball in die neue Richtung ziehen.",
      "Aus der Drehung heraus sofort zwei schnelle Schritte.",
    ],
    fehler:"Die Drehung wird eingeleitet, bevor der Ball wirklich gestoppt ist.",
    pfad:"M20,30 L48,30 C56,30 56,46 44,46 C34,46 30,38 40,34 L78,44", gegner:{x:56,y:26} },
  { id:"mitnahme", name:"Ballmitnahme in den Rücken", ab:"ab F-Jugend", stufe:2,
    zweck:"Kein Trick im engeren Sinn, aber der wichtigste Handgriff im Zusammenspiel.",
    schritte:[
      "Vor dem Zuspiel über die Schulter schauen – wo steht der Gegner?",
      "Den Ball nicht stoppen, sondern mit der vom Gegner abgewandten Seite mitnehmen.",
      "Die erste Berührung geht in den freien Raum, nicht zum eigenen Fuß.",
      "Kopf hoch, bevor der Ball ankommt – nicht danach.",
    ],
    fehler:"Ball wird angenommen und erst dann geschaut. Dann ist der Gegner schon da.",
    pfad:"M85,14 L52,26 L34,40 L14,44", gegner:{x:60,y:34} },
];

// ----------------------------------------------------------------
// Erkennung: Welches Thema meint der Trainer? Bewusst schlicht und
// nachvollziehbar - Treffer je Stichwort, das beste Thema gewinnt.
// ----------------------------------------------------------------
const nrm = s => String(s||"").toLowerCase().replace(/[.,!?;:]/g," ").replace(/\s+/g," ").trim();

export const findeThema = (frage) => {
  const f = nrm(frage);
  if(!f) return null;
  let best=null, bestScore=0;
  for(const th of THEMEN){
    let score=0;
    for(const w of th.worte){ if(f.includes(w)) score += w.length>6?3:2; }
    if(score>bestScore){ best=th; bestScore=score; }
  }
  return bestScore>=2 ? best : null;
};

export const findeTricks = (frage) => {
  const f = nrm(frage);
  if(!/trick|finte|move|übersteiger|uebersteiger|cruyff|zidane|sohle|täuschung|taeuschung|dribbel|dribbling/.test(f)) return [];
  const treffer = TRICKS.filter(t=>f.includes(nrm(t.name).split(" ")[0]));
  return treffer.length ? treffer : TRICKS;
};

// Vorschlag für einen Zeitraum: "2× pro Woche, sechs Wochen" in Klartext.
export const taktText = (a) => {
  if(!a) return "";
  if(a.takt==="training") return `jede Einheit · ${a.wochen} Wochen`;
  if(a.takt==="spiel")    return `vor jedem Spiel · ${a.wochen} Wochen`;
  return `${a.anzahl}× pro Woche · ${a.wochen} Wochen`;
};

// Nächste Fälligkeit einer wiederkehrenden Aufgabe.
export const naechsteFaelligkeit = (takt, vonISO) => {
  const d = new Date((vonISO||new Date().toISOString()).slice(0,10)+"T12:00:00");
  d.setDate(d.getDate() + (takt==="woche" ? 7 : takt==="training" ? 3 : 7));
  return d.toISOString().slice(0,10);
};

// Die EINE Schnittstelle der Oberfläche. Später kann hier eine echte KI
// antworten, ohne dass sich sonst etwas ändert.
export const antwortAuf = (frage, ctx={}) => {
  const tricks = findeTricks(frage);
  if(tricks.length) return { art:"tricks", tricks, text:tricks.length===1
    ? `So geht der ${tricks[0].name}:`
    : "Diese Tricks lohnen sich im Kinderfußball – vom einfachsten zum schwersten:" };
  const th = findeThema(frage);
  if(!th) return { art:"unklar", text:"Das habe ich nicht sicher zuordnen können. Frag mich z. B. nach Zusammenspiel, Torabschluss, Verteidigen, Kondition, Technik und Tricks, Torwartspiel, Stimmung nach Niederlagen oder Elternkommunikation." };
  return { art:"thema", thema:th, text:th.kern };
};
