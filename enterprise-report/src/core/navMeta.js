// =========================================================================
//  NAV-META — ordnet jede Ansicht einem Fachbereich (E2-Code) zu, damit die
//  Navigation nach Rollen/Rechten gefiltert und sortiert werden kann.
//  null = übergreifend (immer sichtbar, z. B. Cockpit, Lernen, Werkzeuge).
//  Die Bereichscodes entsprechen denen aus rbac.js / gruppen.js.
// =========================================================================
export const VIEW_BEREICH = {
  // Cockpit & Berichte – übergreifend
  baum: null, tagesreporting: null, quartalsbericht: null, kennzahlen: null, katalog: null, kpieditor: null, designer: null, kibuilder: null, detailberichte: null,
  // Kosten & Ergebnis
  klr: 'KLR', kostenarten: 'KLR', kalkulatorik: 'KLR', einzelgemein: 'KLR', // kalkulatorik direkt anwaehlbar
  abgrenzung: 'KLR', kostenstellen: 'KLR', bab: 'KLR', kalkulation: 'KLR', deckungsbeitrag: 'KLR',
  ergebnis: 'FIN', profitcenter: 'FIN', pckostenstellen: 'FIN', kontenstrukturen: 'FIN', finanzcockpit: 'FIN', leasing: 'FIN', segment: 'KON',
  // Operativ
  marketing: 'MKT', marketingkarte: 'MKT', gutschriften: 'VC', vertriebkpi: 'VK', prozesskette: 'VK', events: 'MKT', bestand: 'SCC', lager: 'LOG', wms: 'LOG', produktion: 'PR', lieferant: 'EK', auftrag: 'VK', versand: 'LOG', forderungen: 'RIS',
  // Analyse & Steuerung
  bi: null, planung: 'FIN', szenario: 'FIN', abgleichabsatz: 'VC', abweichung: 'FIN', vergleich: null, portfoliobcg: null, qc: null, abstimmung: 'FIN',
  lebenszyklus: 'VK', lzempfehlung: 'VK', anlagen: 'LIQ', technologie: 'FE', mitarbeiter: 'PC',
  massnahmen: null, instrumente: null, alerts: null, zeit: null,
  // Lernen & Wissen – übergreifend
  lernpfad: null, doku: null, controlling: null, klrablauf: null, ablaufdiagramm: null,
  // Verwaltung
  abschluss: 'FIBU', verteiler: null, transport: null, wizard: null, admin: null, datenmodell: null, datenschutz: null, kisteuerung: null, berichtfreigabe: null, berichtlog: null, nutzung: null, rechte: null
}

export const bereichVon = (view) => (view in VIEW_BEREICH ? VIEW_BEREICH[view] : null)
