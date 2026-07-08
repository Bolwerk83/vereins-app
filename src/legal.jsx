// Rechtstexte: Impressum (aus cl.clubSettings.impressum), Datenschutzerklaerung,
// Nutzungsbedingungen. Vorlagen - echte Angaben pflegt der Vereinsadmin.
import React, { useState } from "react";

/*  LEGAL / IMPRESSUM / DATENSCHUTZ  */
export function LegalPage({ onBack, cl }) {
  const [tab, setTab] = useState("imprint"); // imprint | privacy | terms
  const imp = cl?.clubSettings?.impressum || null;
  const impFilled = imp && (imp.provider||imp.street||imp.email);
  return (
    <div style={{minHeight:"100dvh",background:"#f0f4f8",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#fff",padding:"16px 20px",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{width:36,height:36,borderRadius:10,background:"#f1f5f9",border:"none",cursor:"pointer",fontSize:18,fontWeight:700}}>{"<"}</button>
        <h1 style={{fontWeight:900,fontSize:17,color:"#0f172a"}}>Rechtliches</h1>
      </div>
      <div style={{display:"flex",gap:0,borderBottom:"1px solid #e2e8f0",background:"#fff"}}>
        {[["imprint","Impressum"],["privacy","Datenschutz"],["terms","Nutzung"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{flex:1,padding:"12px 8px",border:"none",borderBottom:`2px solid ${tab===k?"#16a34a":"transparent"}`,background:"#fff",color:tab===k?"#16a34a":"#64748b",fontWeight:tab===k?800:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
            {l}
          </button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px",maxWidth:600,margin:"0 auto",width:"100%"}}>
        {!(impFilled&&tab==="imprint") && <div style={{background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:10,padding:"10px 13px",fontSize:12,color:"#9a3412",lineHeight:1.5,marginBottom:16}}>
          <strong>Hinweis:</strong> Dies ist eine Vorlage. Trage deine echten Daten ein (Impressum im Vereinsadmin unter Datenschutz) und lass die Texte vor dem Echtbetrieb mit Kinderdaten von einer fachkundigen Person (Datenschutz/Anwalt) prüfen.
        </div>}
        {tab==="imprint"&&(
          <div style={{lineHeight:1.8,fontSize:14,color:"#334155"}}>
            <h2 style={{fontWeight:800,marginBottom:12}}>Impressum</h2>
            <p>Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz):</p>
            {impFilled ? (
              <>
                <p style={{marginTop:10}}><strong>Diensteanbieter:</strong><br/>
                {imp.provider||cl?.name}<br/>
                {imp.street&&<>{imp.street}<br/></>}
                {imp.plzCity&&<>{imp.plzCity}<br/></>}
                {imp.country||"Deutschland"}</p>
                {(imp.phone||imp.email)&&<p style={{marginTop:10}}><strong>Kontakt:</strong><br/>
                {imp.phone&&<>Telefon: {imp.phone}<br/></>}
                {imp.email&&<>E-Mail: {imp.email}</>}</p>}
                {imp.represent&&<p style={{marginTop:10}}><strong>Vertretungsberechtigt:</strong><br/>{imp.represent}</p>}
                {(imp.register||imp.registerNr)&&<p style={{marginTop:10}}><strong>Register:</strong><br/>{imp.register||""}{imp.register&&imp.registerNr?" · ":""}{imp.registerNr||""}</p>}
                {imp.ustId&&<p style={{marginTop:10}}><strong>USt-IdNr.:</strong> {imp.ustId}</p>}
                <p style={{marginTop:10}}><strong>Verantwortlich für den Inhalt:</strong><br/>{imp.represent||imp.provider||cl?.name}, Anschrift wie oben</p>
              </>
            ) : (
              <>
                <p style={{marginTop:10}}><strong>Diensteanbieter:</strong><br/>[Vereinsname]<br/>[Straße und Hausnummer]<br/>[PLZ und Ort]<br/>[Land]</p>
                <p style={{marginTop:10}}><strong>Kontakt:</strong><br/>Telefon: [Telefonnummer]<br/>E-Mail: [verein@email.de]</p>
                <p style={{marginTop:10}}><strong>Vertretungsberechtigt:</strong><br/>[z. B. 1. Vorsitzende/r]</p>
                <p style={{marginTop:12,fontSize:12,color:"#64748b"}}>Trage die echten Daten im Vereinsadmin unter <strong>Einstellungen → Datenschutz → Impressum</strong> ein. Ein vollständiges Impressum ist gesetzlich verpflichtend.</p>
              </>
            )}
          </div>
        )}
        {tab==="privacy"&&(
          <div style={{lineHeight:1.75,fontSize:14,color:"#334155"}}>
            <h2 style={{fontWeight:800,marginBottom:12}}>Datenschutzerklärung</h2>

            <p><strong>1. Verantwortlicher</strong><br/>
            Verantwortlich im Sinne der DSGVO ist der im Impressum genannte Betreiber.</p>

            <p style={{marginTop:12}}><strong>2. Welche Daten werden verarbeitet?</strong><br/>
            Es werden nur die Daten verarbeitet, die im Verein eingegeben werden: Vornamen (empfohlen mit höchstens Nachnamen-Initial), Geburtsjahr, Mannschaftszugehörigkeit, Termine mit Zu-/Absagen und Anwesenheit, Fahrgemeinschafts-Einträge, Nachrichten innerhalb des Vereins, optionale Eltern-Kontaktangaben (z. B. Warteliste) sowie optionale sportliche Einschätzungen (Position, Skill-Profil – nur für Trainer sichtbar). Es werden bewusst möglichst wenige Daten erhoben (Datensparsamkeit, Art. 5 DSGVO). <strong>Gesundheitsdaten werden nicht gespeichert</strong>; eine Trainingspause wird ohne Grund nur mit Zeitraum erfasst.</p>

            <p style={{marginTop:12}}><strong>3. Rechtsgrundlage</strong><br/>
            Die Verarbeitung erfolgt auf Grundlage einer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) und/oder zur Durchführung der Vereinsorganisation (berechtigtes Interesse, Art. 6 Abs. 1 lit. f DSGVO).</p>

            <p style={{marginTop:12}}><strong>4. Minderjährige</strong><br/>
            Für die Verarbeitung von Daten Minderjähriger ist die Einwilligung der Erziehungsberechtigten erforderlich (Art. 8 DSGVO). Die Einwilligung wird bei der ersten Anmeldung in der App abgefragt und mit Name der einwilligenden Person, Rolle (z. B. Mutter/Vater) und Zeitpunkt dokumentiert. Eltern können die Daten ihres Kindes jederzeit einsehen, berichtigen und über die Lösch-Funktion im Profil löschen lassen.</p>

            <p style={{marginTop:12}}><strong>5. Speicherort &amp; Auftragsverarbeitung</strong><br/>
            Die Daten werden auf dem eigenen Gerät (Browser-Speicher) und in einer zentralen Datenbank beim Dienstleister Supabase gespeichert, damit alle Geräte des Vereins denselben Stand sehen. Supabase handelt als Auftragsverarbeiter (Art. 28 DSGVO) auf Grundlage des mit dem Betreiber geschlossenen Auftragsverarbeitungsvertrags (DPA).</p>

            <p style={{marginTop:12}}><strong>6. Push-Benachrichtigungen (optional)</strong><br/>
            Aktivierst du Benachrichtigungen, wird eine technische Empfangsadresse deines Geräts (Push-Endpoint deines Browsers, z. B. Apple/Google) zusammen mit Verein/Team gespeichert, um Termin-Erinnerungen zuzustellen. Du kannst das jederzeit in der App wieder abschalten; die Adresse wird dann gelöscht.</p>

            <p style={{marginTop:12}}><strong>7. Kalender-Abo (optional)</strong><br/>
            Das Termin-Abo stellt die Team-Termine über eine geheime, tokengeschützte Internet-Adresse bereit. Wer den Link kennt, sieht die Termine des Teams (keine weiteren Personendaten). Der Link sollte nicht öffentlich geteilt werden.</p>

            <p style={{marginTop:12}}><strong>8. Wetteranzeige</strong><br/>
            Für die Wetteranzeige an Terminen wird die ungefähre Vereins-Position (aus der Vereins-PLZ) an den Wetterdienst Open-Meteo übertragen – keine personenbezogenen Daten.</p>

            <p style={{marginTop:12}}><strong>9. Werbung &amp; externe Links</strong><br/>
            Die App kann als Werbung gekennzeichnete Empfehlungen (Affiliate-Links) zu externen Shops anzeigen. Beim Klick verlässt du die App; auf den Zielseiten gelten deren eigene Datenschutzbestimmungen. Es werden keine personenbezogenen Mitgliederdaten an diese Dritten weitergegeben. Die App zählt lediglich anonym, wie oft Werbe-Empfehlungen angeklickt werden (je Angebot, ohne Personenbezug), um die Auswahl der Empfehlungen zu verbessern.</p>

            <p style={{marginTop:12}}><strong>9a. Anonyme Nutzungsstatistik</strong><br/>
            Zur Verbesserung der App werden anonyme Tages-Zähler erhoben: eingestellte Sprache, grobe Region (abgeleitet aus der Zeitzone des Geräts – keine IP-Adresse, kein GPS), Gerätetyp und die Häufigkeit genutzter Funktionen. Die Zähler sind keiner Person zuordenbar; es wird eine zufällige Gerätekennung ohne Bezug zu Namen oder Konten verwendet.</p>

            <p style={{marginTop:12}}><strong>10. Deine Rechte</strong><br/>
            Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde (für NRW: LDI NRW).</p>

            <p style={{marginTop:12}}><strong>11. Speicherdauer</strong><br/>
            Daten werden gespeichert, solange die Vereinszugehörigkeit besteht, und auf Wunsch bzw. beim Verlassen des Vereins gelöscht. Der Verein kann Altlasten (z. B. erledigte Wartelisten-Einträge, alte Kontaktanfragen) über den Datenpflege-Assistenten regelmäßig entfernen.</p>

            <p style={{marginTop:12}}><strong>12. Kontakt</strong><br/>
            Datenschutzanfragen bitte an die im Impressum genannte Adresse.</p>
          </div>
        )}
        {tab==="terms"&&(
          <div style={{lineHeight:1.8,fontSize:14,color:"#334155"}}>
            <h2 style={{fontWeight:800,marginBottom:12}}>Nutzungsbedingungen</h2>
            <p><strong>Nutzung:</strong><br/>
            Die App darf für die Vereinsverwaltung genutzt werden.</p>
            <p style={{marginTop:10}}><strong>Verantwortung des Vereins:</strong><br/>
            Der Vereinsadmin ist dafür verantwortlich, dass für eingegebene personenbezogene Daten – insbesondere von Minderjährigen – die erforderlichen Einwilligungen vorliegen und der Umgang datenschutzkonform erfolgt.</p>
            <p style={{marginTop:10}}><strong>Werbung:</strong><br/>
            Die App kann als solche gekennzeichnete Werbung/Affiliate-Empfehlungen enthalten.</p>
            <p style={{marginTop:10}}><strong>Haftung:</strong><br/>
            Die App wird ohne Gewähr bereitgestellt. Es wird keine Haftung für Datenverlust übernommen.</p>
            <p style={{marginTop:10}}><strong>Änderungen:</strong><br/>
            Diese Bedingungen können angepasst werden; wesentliche Änderungen werden angekündigt.</p>
          </div>
        )}
      </div>
    </div>
  );
}
