// =========================================================================
//  KPI-GLOSSAR — laienverständliche Definition + konkretes Beispiel je
//  Kennzahl (für Nicht-Kaufleute). Wird im Kennzahl-Drill und in der
//  Kennzahlen-Übersicht angezeigt. Ergänzt die technische kpiRegistry.
// =========================================================================
export const LAIEN = {
  nettoumsatz: {
    definition: 'Das Geld, das nach Abzug von Rabatten, Skonti und Retouren wirklich beim Unternehmen ankommt.',
    beispiel: 'Verkauf für 60 Mio €, davon 8 Mio € Rabatte/Retouren → 52 Mio € Nettoumsatz.',
    synonyme: ['Umsatzerlöse', 'Nettoerlös', 'Net Sales', 'Revenue']
  },
  bruttoumsatz: {
    definition: 'Der volle Rechnungsbetrag aller Verkäufe, bevor Rabatte, Skonti oder Retouren abgezogen werden.',
    beispiel: '12.000 Räder zu je 5.000 € fakturiert → 60 Mio € Bruttoumsatz (vor Abzügen).',
    synonyme: ['Fakturierter Umsatz', 'Gross Sales', 'Gross Revenue', 'Bruttoerlös']
  },
  erloesschmaelerung: {
    definition: 'Alles, was vom Rechnungsbetrag wieder abgeht: zurückgeschickte Ware, Rabatte und Skonti.',
    beispiel: '60 Mio € fakturiert, davon 8 Mio € Retouren und Rabatte → 8 Mio € Erlösschmälerung.',
    synonyme: ['Erlösminderung', 'Sales Deductions', 'Sales Allowances']
  },
  wareneinsatz: {
    definition: 'Was die verkauften Räder und Teile im Einkauf bzw. in der Herstellung gekostet haben.',
    beispiel: 'Ein E-Bike wird für 2.000 € verkauft, Material/Einkauf kostete 1.200 € → 1.200 € Wareneinsatz.',
    synonyme: ['COGS', 'Cost of Goods Sold', 'Materialaufwand', 'Umsatzkosten']
  },
  db1: {
    definition: 'Was vom Umsatz übrig bleibt, nachdem die Kosten der verkauften Ware abgezogen sind — der Rohüberschuss.',
    beispiel: '52 Mio € Nettoumsatz − 31 Mio € Wareneinsatz → 21 Mio € Deckungsbeitrag I.',
    synonyme: ['Rohertrag', 'Bruttoergebnis', 'Gross Profit', 'DB I', 'Contribution Margin']
  },
  dbQuote: {
    definition: 'Wie viel Prozent vom Umsatz nach Abzug der Warenkosten übrig bleiben — zeigt die Marge.',
    beispiel: '21 Mio € DB I bei 52 Mio € Umsatz → 21 ÷ 52 = 40 % DB-Quote.',
    synonyme: ['Rohertragsmarge', 'Bruttomarge', 'Gross Margin', 'Deckungsbeitragsquote']
  },
  wareneinsatzquote: {
    definition: 'Welcher Anteil des Umsatzes für Einkauf und Herstellung der Ware draufgeht — je niedriger, desto besser.',
    beispiel: '31 Mio € Wareneinsatz bei 52 Mio € Umsatz → 60 % Wareneinsatzquote.',
    synonyme: ['Materialquote', 'COGS Ratio', 'Materialintensität']
  },
  ebitda: {
    definition: 'Operativer Gewinn vor Zinsen, Steuern und Abschreibungen — zeigt die reine Ertragskraft des Geschäfts.',
    beispiel: 'Umsatz minus alle laufenden Kosten (ohne Zinsen/Steuern/Abschreibung) → 6 Mio € EBITDA.',
    synonyme: ['Operatives Ergebnis vor Abschreibungen', 'Bruttobetriebsergebnis']
  },
  ebit: {
    definition: 'Der operative Gewinn nach Abschreibungen, aber vor Zinsen und Steuern — das Ergebnis aus dem Kerngeschäft.',
    beispiel: '6 Mio € EBITDA − 2 Mio € Abschreibungen → 4 Mio € EBIT.',
    synonyme: ['Operating Profit', 'Operating Income', 'Betriebsergebnis', 'Operatives Ergebnis']
  },
  onlineAnteil: {
    definition: 'Wie viel Prozent des Umsatzes über den eigenen Onlineshop statt im Laden erzielt wird.',
    beispiel: '52 Mio € Umsatz, davon 23 Mio € online → rund 45 % Online-Anteil.',
    synonyme: ['E-Commerce-Anteil', 'Online-Umsatzanteil', 'Online Share']
  },
  retourenquote: {
    definition: 'Anteil der online bestellten Ware, der wieder zurückgeschickt wird — hohe Quote kostet viel Geld.',
    beispiel: '100 online bestellte Räder, 12 kommen zurück → 12 % Retourenquote.',
    synonyme: ['Rücksendequote', 'Return Rate', 'Returns Ratio']
  },
  einkaufsvolumen: {
    definition: 'Wie viel das Unternehmen im Jahr für Material und zugekaufte Handelsware bestellt hat.',
    beispiel: 'Rahmen, Motoren, Reifen und Zubehör für zusammen 30 Mio € bestellt → 30 Mio € Einkaufsvolumen.',
    synonyme: ['Bestellvolumen', 'Beschaffungsvolumen', 'Purchasing Volume', 'Spend']
  },
  liefertreue: {
    definition: 'Anteil der Lieferungen vom Lieferanten, die pünktlich und in voller Menge ankommen.',
    beispiel: '100 Bestellungen, 92 termin- und mengengerecht geliefert → 92 % Liefertreue.',
    synonyme: ['Liefertermintreue Lieferant', 'On Time In Full', 'OTIF', 'Supplier Reliability']
  },
  ausschuss: {
    definition: 'Anteil der gefertigten Teile/Räder, die fehlerhaft sind und nicht verkauft werden können.',
    beispiel: '10.000 Rahmen produziert, 200 unbrauchbar → 2 % Ausschussquote.',
    synonyme: ['Scrap Rate', 'Reject Rate', 'Schrottquote']
  },
  auslastung: {
    definition: 'Wie stark die Fertigung und Montage ausgelastet ist — 100 % heißt, die Kapazität ist voll genutzt.',
    beispiel: 'Möglich wären 12.000 Räder, gefertigt werden 10.200 → 85 % Auslastung.',
    synonyme: ['Kapazitätsauslastung', 'Capacity Utilization', 'Utilization']
  },
  lagerbestand: {
    definition: 'Der Wert aller Räder, Teile und Waren, die gerade im Lager liegen und Kapital binden.',
    beispiel: 'Fertige Räder, Rahmen und Ersatzteile im Lager im Wert von 9 Mio € → 9 Mio € Lagerbestand.',
    synonyme: ['Bestandswert', 'Inventory', 'Vorräte', 'Stock Value']
  },
  reichweite: {
    definition: 'Wie viele Tage der aktuelle Lagerbestand reicht, bis er bei normalem Absatz aufgebraucht wäre.',
    beispiel: 'Lager 9 Mio €, täglicher Verbrauch 0,12 Mio € → rund 75 Tage Reichweite.',
    synonyme: ['Bestandsreichweite', 'Days Inventory Outstanding', 'DIO', 'Days of Supply']
  },
  personalkosten: {
    definition: 'Alle Kosten für die Mitarbeitenden: Löhne, Gehälter und Sozialabgaben — der größte feste Kostenblock.',
    beispiel: '300 Beschäftigte, im Schnitt 50.000 € pro Jahr → rund 15 Mio € Personalkosten.',
    synonyme: ['Personalaufwand', 'Labour Cost', 'Payroll', 'Lohnkosten']
  },
  fluktuation: {
    definition: 'Anteil der Mitarbeitenden, die das Unternehmen im Jahr verlassen — hohe Werte bedeuten viel Wechsel.',
    beispiel: '300 Beschäftigte, 36 verlassen das Unternehmen → 12 % Fluktuation.',
    synonyme: ['Fluktuationsrate', 'Turnover Rate', 'Attrition', 'Personalfluktuation']
  },
  shopVerfuegbarkeit: {
    definition: 'Anteil der Zeit, in der der Onlineshop störungsfrei erreichbar ist — kritisch, weil viel Umsatz online läuft.',
    beispiel: 'Shop in 8.736 von 8.760 Jahresstunden online → rund 99,7 % Verfügbarkeit.',
    synonyme: ['Uptime', 'Systemverfügbarkeit', 'Availability', 'Erreichbarkeit']
  },
  cashConversion: {
    definition: 'Wie viele Tage Geld im Lager und in offenen Rechnungen gebunden ist, bis es als Cash zurückkommt.',
    beispiel: '75 Tage Lager + 30 Tage Forderungen − 40 Tage Lieferantenziel → 65 Tage gebundenes Kapital.',
    synonyme: ['CCC', 'Geldumschlagsdauer', 'Kapitalbindungsdauer', 'Cash-to-Cash Cycle']
  },
  produktionsmenge: {
    definition: 'Wie viele Räder in der Periode tatsächlich gefertigt wurden — Basis für die Stückkostenrechnung.',
    beispiel: 'In einem Jahr 10.200 City- und E-Bikes montiert → 10.200 Stück Produktionsmenge.',
    synonyme: ['Fertigungsmenge', 'Output', 'Production Volume', 'Stückzahl']
  },
  herstellkosten: {
    definition: 'Alle Kosten, um die Räder herzustellen: Material plus Fertigungsaufwand.',
    beispiel: 'Material 20 Mio € + Fertigung 8 Mio € → 28 Mio € Herstellkosten.',
    synonyme: ['Herstellungskosten', 'Manufacturing Cost', 'Production Cost']
  },
  gemeinkosten: {
    definition: 'Kosten, die sich nicht einem einzelnen Rad zuordnen lassen, z. B. Verwaltung, Miete und Vertrieb.',
    beispiel: 'Verwaltung, IT und Vertrieb kosten zusammen 10 Mio € → 10 Mio € Gemeinkosten.',
    synonyme: ['Overhead', 'Indirect Cost', 'Overheads', 'Indirekte Kosten']
  },
  gesamtkosten: {
    definition: 'Sämtliche Kosten der Periode zusammen — direkt zurechenbare Kosten plus Gemeinkosten.',
    beispiel: '28 Mio € Herstellkosten + 10 Mio € Gemeinkosten → 38 Mio € Gesamtkosten.',
    synonyme: ['Total Cost', 'Periodenkosten', 'Gesamtaufwand']
  },
  herstellkostenJeRad: {
    definition: 'Was die Herstellung eines einzelnen Rades im Durchschnitt kostet.',
    beispiel: '28 Mio € Herstellkosten ÷ 10.200 Räder → rund 2.745 € je Rad.',
    synonyme: ['Stückkosten', 'Unit Cost', 'Cost per Unit', 'Kosten je Rad']
  },
  gemeinkostenquote: {
    definition: 'Wie groß der Anteil der nicht direkt zurechenbaren Kosten an den Gesamtkosten ist.',
    beispiel: '10 Mio € Gemeinkosten von 38 Mio € Gesamtkosten → rund 26 % Gemeinkostenquote.',
    synonyme: ['Overhead Ratio', 'Overhead-Quote', 'Gemeinkostenanteil']
  },
  absatzprognose: {
    definition: 'Die erwartete Verkaufsmenge für die kommende Periode — eine Vorhersage, kein Ist-Wert.',
    beispiel: 'Für das nächste Quartal werden 2.800 verkaufte Räder erwartet → 2.800 Stück Absatzprognose.',
    synonyme: ['Mengenforecast', 'Demand Forecast', 'Sales Forecast (Menge)']
  },
  umsatzprognose: {
    definition: 'Der für die kommende Periode erwartete Nettoumsatz — eine fortlaufend aktualisierte Vorhersage.',
    beispiel: '2.800 Räder × Ø 5.000 € → rund 14 Mio € Umsatzprognose fürs Quartal.',
    synonyme: ['Sales Forecast', 'Revenue Forecast', 'Umsatzforecast']
  },
  forecastGenauigkeit: {
    definition: 'Wie gut die bisherigen Prognosen den tatsächlichen Verlauf getroffen haben — höher ist besser.',
    beispiel: 'Prognosen lagen im Schnitt 8 % daneben → 100 − 8 = 92 % Prognosegüte.',
    synonyme: ['Forecast Accuracy', 'Prognosequalität', 'Forecast Quality']
  },
  auftragsbestand: {
    definition: 'Der Wert bereits eingegangener, noch nicht ausgelieferter Bestellungen — ein Blick auf künftigen Umsatz.',
    beispiel: 'Händler haben Räder für 18 Mio € bestellt, noch nicht geliefert → 18 Mio € Auftragsbestand.',
    synonyme: ['Orderbuch', 'Backlog', 'Order Backlog', 'Auftragsreichweite']
  },
  prognoseWachstum: {
    definition: 'Um wie viel Prozent der prognostizierte Umsatz über (oder unter) dem aktuellen Ist liegt.',
    beispiel: 'Prognose 56 Mio € gegenüber Ist 52 Mio € → rund 8 % erwartetes Wachstum.',
    synonyme: ['Erwartetes Wachstum', 'Forecast Growth', 'Wachstumsprognose']
  },
  umsatzplan: {
    definition: 'Der für die Periode fest eingeplante Nettoumsatz — das Umsatzziel aus dem Budget.',
    beispiel: 'Im Budget sind 54 Mio € Umsatz vorgesehen → 54 Mio € Umsatzplan.',
    synonyme: ['Umsatzbudget', 'Sales Budget', 'Planumsatz', 'Revenue Plan']
  },
  kostenplan: {
    definition: 'Die für die Periode budgetierten Gesamtkosten — die geplante Kostenobergrenze.',
    beispiel: 'Im Budget sind 39 Mio € Kosten eingeplant → 39 Mio € Kostenplan.',
    synonyme: ['Kostenbudget', 'Cost Budget', 'Plankosten']
  },
  ebitPlan: {
    definition: 'Der geplante operative Gewinn (EBIT) laut Budget — das Ergebnisziel der Periode.',
    beispiel: 'Geplanter Umsatz 54 Mio € minus geplante Kosten 49 Mio € → 5 Mio € EBIT-Plan.',
    synonyme: ['Ergebnisbudget', 'Budget EBIT', 'EBIT-Budget', 'Plan-EBIT']
  },
  umsatzZielerreichung: {
    definition: 'Wie viel Prozent des geplanten Umsatzes tatsächlich erreicht wurden — 100 % heißt Ziel getroffen.',
    beispiel: 'Ist 52 Mio €, Plan 54 Mio € → 52 ÷ 54 = rund 96 % Zielerreichung.',
    synonyme: ['Plan-Ist-Umsatz', 'Sales Target Achievement', 'Umsatzerfüllung']
  },
  ergebnisZielerreichung: {
    definition: 'Wie viel Prozent des geplanten Gewinns (EBIT) tatsächlich erreicht wurden — zeigt die Ergebnislücke.',
    beispiel: 'Ist-EBIT 4 Mio €, Plan 5 Mio € → 4 ÷ 5 = 80 % Zielerreichung.',
    synonyme: ['EBIT-Zielerreichung', 'Profit Target Achievement', 'Ergebniserfüllung']
  },
  kostendisziplin: {
    definition: 'Ob die Kosten im Budget geblieben sind — Werte ab 100 % heißen: nicht teurer als geplant.',
    beispiel: 'Plan 39 Mio €, Ist 38 Mio € → 39 ÷ 38 = rund 103 %, also im Budget.',
    synonyme: ['Budgettreue Kosten', 'Cost Discipline', 'Budget Adherence']
  },
  produktionsplan: {
    definition: 'Wie viele Räder in der Periode gefertigt werden sollen — die geplante Produktionsmenge.',
    beispiel: 'Fürs Quartal sind 2.700 Räder zur Fertigung eingeplant → 2.700 Stück Produktionsplan.',
    synonyme: ['Fertigungsplan', 'Production Plan', 'Produktionsprogramm']
  },
  kapazitaet: {
    definition: 'Wie viele Räder mit dem aktuellen Schichtmodell maximal gefertigt werden könnten.',
    beispiel: 'Bei voller Schichtbesetzung sind 3.000 Räder/Quartal möglich → 3.000 Stück Kapazität.',
    synonyme: ['Fertigungskapazität', 'Capacity', 'Produktionskapazität']
  },
  schichtauslastung: {
    definition: 'Wie stark die eingeplanten Schichten tatsächlich genutzt werden — 100 % heißt voll ausgelastet.',
    beispiel: 'Geplant 2.700, gefertigt 2.430 → 2.430 ÷ 2.700 = 90 % Schichtauslastung.',
    synonyme: ['Shift Utilization', 'Schichtnutzung']
  },
  liefertermintreue: {
    definition: 'Anteil der Fertigungsaufträge, die rechtzeitig fertig wurden — pünktlich heißt termintreu.',
    beispiel: '500 Fertigungsaufträge, 470 pünktlich fertig → 94 % Liefertermintreue.',
    synonyme: ['On Time Delivery', 'OTD', 'Termintreue', 'Schedule Adherence']
  },
  kapazitaetsauslastung: {
    definition: 'Wie stark der Produktionsplan die verfügbare Kapazität ausschöpft — zeigt Engpass oder Leerstand.',
    beispiel: 'Plan 2.700, Kapazität 3.000 → 2.700 ÷ 3.000 = 90 % Kapazitätsauslastung.',
    synonyme: ['Capacity Utilization', 'Auslastungsgrad', 'Kapazitätsnutzung']
  },
  planErfuellungProduktion: {
    definition: 'Wie viel Prozent der geplanten Produktionsmenge tatsächlich gefertigt wurden.',
    beispiel: 'Plan 2.700, gefertigt 2.565 → 2.565 ÷ 2.700 = 95 % Plan-Erfüllung.',
    synonyme: ['Plan-Ist-Produktion', 'Production Attainment', 'Plangenauigkeit Produktion']
  },
  lieferfaehigkeit: {
    definition: 'Anteil der Kundenwünsche, die sofort ab Lager bedient werden können — der Servicegrad.',
    beispiel: '1.000 Bestellpositionen, 970 sofort lieferbar → 97 % Lieferfähigkeit.',
    synonyme: ['Lieferbereitschaftsgrad', 'Servicegrad', 'Service Level', 'Fill Rate']
  },
  ueberbestand: {
    definition: 'Der Teil des Lagers, der über die Ziel-Reichweite hinausgeht und unnötig Kapital bindet.',
    beispiel: 'Lager 9 Mio €, Zielbestand 7 Mio € → 2 Mio € Überbestand.',
    synonyme: ['Excess Inventory', 'Überschussbestand', 'Surplus Stock']
  },
  lagerumschlag: {
    definition: 'Wie oft im Jahr das komplette Lager verkauft und neu aufgefüllt wird — höher heißt schlanker.',
    beispiel: 'Wareneinsatz 31 Mio € ÷ Lagerbestand 9 Mio € → rund 3,4-mal Umschlag pro Jahr.',
    synonyme: ['Umschlagshäufigkeit', 'Inventory Turnover', 'Stock Turn', 'Lagerumschlagshäufigkeit']
  },
  abschlussdauer: {
    definition: 'Wie viele Arbeitstage es dauert, bis der Monatsabschluss fertig vorliegt — kürzer ist besser.',
    beispiel: 'Der Monatsabschluss steht am 6. Arbeitstag → 6 Tage Abschlussdauer.',
    synonyme: ['Fast Close', 'Closing Time', 'Abschlussgeschwindigkeit']
  },
  rueckstellungen: {
    definition: 'Geld, das für absehbare künftige Ausgaben zurückgelegt wird, z. B. Garantie- oder Personalfälle.',
    beispiel: 'Garantie 1,5 Mio €, Personal 1 Mio €, Risiken 0,5 Mio € → 3 Mio € Rückstellungen.',
    synonyme: ['Provisions', 'Reserven', 'Accruals']
  },
  bilanzsumme: {
    definition: 'Der Gesamtwert aller Vermögenswerte des Unternehmens zum Stichtag — die Größe der Bilanz.',
    beispiel: 'Anlagen, Lager, Forderungen und Kasse zusammen → 40 Mio € Bilanzsumme.',
    synonyme: ['Total Assets', 'Bilanzvolumen', 'Gesamtvermögen', 'Aktiva']
  },
  eigenkapital: {
    definition: 'Das eigene Kapital der Eigentümer im Unternehmen — Vermögen minus Schulden.',
    beispiel: 'Bilanzsumme 40 Mio € minus Schulden 24 Mio € → 16 Mio € Eigenkapital.',
    synonyme: ['Equity', 'Reinvermögen', 'Shareholders Equity', 'EK']
  },
  handelsrechtlichesErgebnis: {
    definition: 'Der Jahresgewinn so, wie ihn die Finanzbuchhaltung nach Handelsrecht (HGB) ausweist.',
    beispiel: 'Nach allen Buchungen und Steuern bleibt ein Jahresgewinn von 3 Mio € → 3 Mio € HGB-Ergebnis.',
    synonyme: ['Jahresüberschuss', 'Net Income', 'HGB-Ergebnis', 'Jahresergebnis']
  },
  neutralesErgebnis: {
    definition: 'Posten, die nicht zum eigentlichen Geschäft gehören, z. B. einmalige oder periodenfremde Effekte.',
    beispiel: 'Verkauf eines alten Grundstücks bringt einmalig 0,5 Mio € → 0,5 Mio € neutrales Ergebnis.',
    synonyme: ['Außerordentliches Ergebnis', 'Non-operating Result', 'Sondereffekte']
  },
  eigenkapitalquote: {
    definition: 'Welcher Anteil des Vermögens mit eigenem Geld finanziert ist — höher bedeutet mehr Stabilität.',
    beispiel: '16 Mio € Eigenkapital von 40 Mio € Bilanzsumme → 40 % Eigenkapitalquote.',
    synonyme: ['Equity Ratio', 'EK-Quote', 'Eigenkapitalanteil']
  },
  betrieblichesErgebnis: {
    definition: 'Der Gewinn nur aus dem Kerngeschäft — das HGB-Ergebnis ohne betriebsfremde Sondereffekte.',
    beispiel: 'HGB-Ergebnis 3 Mio € minus neutrale 0,5 Mio € → 2,5 Mio € Betriebsergebnis.',
    synonyme: ['Operating Result', 'Operatives Ergebnis (Controlling)', 'Betriebsgewinn']
  },
  investitionsvolumen: {
    definition: 'Wie viel in der Periode für langlebige Anschaffungen wie Maschinen oder Gebäude ausgegeben wurde.',
    beispiel: 'Neue Montagelinie und IT für zusammen 2,5 Mio € → 2,5 Mio € Investitionsvolumen.',
    synonyme: ['CapEx', 'Capital Expenditure', 'Investitionen', 'Sachinvestitionen']
  },
  investitionsbudget: {
    definition: 'Der freigegebene Geldrahmen für Investitionen in der Periode — die Obergrenze fürs Investieren.',
    beispiel: 'Die Geschäftsführung gibt 3 Mio € für Investitionen frei → 3 Mio € Investitionsbudget.',
    synonyme: ['CapEx Budget', 'Investitionsrahmen', 'Capital Budget']
  },
  liquideMittel: {
    definition: 'Das sofort verfügbare Geld in Kasse und auf Bankkonten zum Stichtag.',
    beispiel: 'Bankguthaben 3,8 Mio € plus Kasse 0,2 Mio € → 4 Mio € liquide Mittel.',
    synonyme: ['Cash', 'Zahlungsmittel', 'Cash and Equivalents', 'Kassenbestand']
  },
  kreditlinie: {
    definition: 'Der noch ungenutzte Teil des zugesagten Bankkredits — eine Reserve für den Bedarfsfall.',
    beispiel: 'Kreditrahmen 10 Mio €, davon 4 Mio € genutzt → 6 Mio € freie Kreditlinie.',
    synonyme: ['Credit Line', 'Kreditrahmen', 'Undrawn Facility', 'Verfügbare Kreditlinie']
  },
  operativerCashflow: {
    definition: 'Wie viel Geld das laufende Geschäft tatsächlich eingebracht hat — echter Mittelzufluss, kein Buchgewinn.',
    beispiel: 'Aus dem laufenden Geschäft fließen netto 5 Mio € zu → 5 Mio € operativer Cashflow.',
    synonyme: ['Operating Cash Flow', 'OCF', 'Cashflow aus laufender Geschäftstätigkeit']
  },
  investBudgettreue: {
    definition: 'Ob die Investitionen im Budget geblieben sind — Werte ab 100 % heißen: im Rahmen.',
    beispiel: 'Budget 3 Mio €, ausgegeben 2,5 Mio € → 3 ÷ 2,5 = 120 %, also im Rahmen.',
    synonyme: ['CapEx Budget Adherence', 'Investitionsbudgettreue']
  },
  freieLiquiditaet: {
    definition: 'Das gesamte kurzfristig verfügbare Geld: Kasse, Bank und der freie Kreditrahmen zusammen.',
    beispiel: 'Liquide Mittel 4 Mio € + freie Kreditlinie 6 Mio € → 10 Mio € freie Liquidität.',
    synonyme: ['Verfügbare Liquidität', 'Available Liquidity', 'Liquiditätsreserve']
  },
  vertriebskosten: {
    definition: 'Alle Kosten rund um Verkauf und Marketing: Werbung, Vertrieb und Provisionen.',
    beispiel: 'Marketing 3 Mio €, Außendienst 1,5 Mio €, Provisionen 0,5 Mio € → 5 Mio € Vertriebskosten.',
    synonyme: ['Selling Expenses', 'Vertriebsaufwand', 'Sales Costs']
  },
  rabattquote: {
    definition: 'Wie viel Prozent des Rechnungsbetrags im Schnitt als Rabatt gewährt werden.',
    beispiel: '4,8 Mio € Rabatte bei 60 Mio € Bruttoumsatz → 8 % Rabattquote.',
    synonyme: ['Discount Rate', 'Rabattanteil', 'Nachlassquote']
  },
  neukundenanteil: {
    definition: 'Welcher Anteil des Umsatzes mit neu gewonnenen Kunden erzielt wird.',
    beispiel: '52 Mio € Umsatz, davon 10,4 Mio € mit Neukunden → 20 % Neukundenanteil.',
    synonyme: ['New Customer Share', 'Neukundenquote', 'Acquisition Share']
  },
  vertriebskostenquote: {
    definition: 'Wie viel Prozent vom Umsatz für Vertrieb und Marketing ausgegeben werden.',
    beispiel: '5 Mio € Vertriebskosten bei 52 Mio € Umsatz → rund 9,6 % Vertriebskostenquote.',
    synonyme: ['Selling Cost Ratio', 'Vertriebskostenanteil', 'Cost-to-Sales']
  },
  mitarbeiterFTE: {
    definition: 'Die Belegschaft umgerechnet in volle Stellen — zwei Halbtagskräfte zählen als eine Vollzeitkraft.',
    beispiel: '280 Vollzeit- plus 40 Halbtagskräfte → 280 + 20 = 300 FTE.',
    synonyme: ['Vollzeitäquivalente', 'Full Time Equivalent', 'Headcount', 'Belegschaft']
  },
  ueberstundenquote: {
    definition: 'Anteil der Überstunden an der regulären Arbeitszeit — ein Hinweis auf Auslastung und Engpässe.',
    beispiel: 'Auf 100 Soll-Stunden kommen 6 Überstunden → 6 % Überstundenquote.',
    synonyme: ['Overtime Ratio', 'Mehrarbeitsquote']
  },
  krankenstand: {
    definition: 'Anteil der Arbeitszeit, der krankheitsbedingt ausfällt.',
    beispiel: 'Von 100 Soll-Arbeitstagen fallen 4,5 krankheitsbedingt aus → 4,5 % Krankenstand.',
    synonyme: ['Krankheitsquote', 'Absenteeism', 'Fehlzeitenquote', 'Sick Leave Rate']
  },
  umsatzJeFTE: {
    definition: 'Wie viel Umsatz im Schnitt auf eine Vollzeitkraft entfällt — ein Maß für die Produktivität.',
    beispiel: '52 Mio € Umsatz ÷ 300 FTE → rund 173.000 € Umsatz je Vollzeitkraft.',
    synonyme: ['Revenue per Employee', 'Pro-Kopf-Umsatz', 'Sales per FTE']
  },
  personalkostenquote: {
    definition: 'Wie viel Prozent vom Umsatz für das Personal aufgewendet werden.',
    beispiel: '15 Mio € Personalkosten bei 52 Mio € Umsatz → rund 29 % Personalkostenquote.',
    synonyme: ['Labour Cost Ratio', 'Personalintensität', 'Personalaufwandsquote']
  },
  offeneForderungen: {
    definition: 'Summe der Rechnungen, die Kunden noch nicht bezahlt haben — Geld, das noch aussteht.',
    beispiel: 'Händler schulden für gelieferte Räder noch 4,3 Mio € → 4,3 Mio € offene Forderungen.',
    synonyme: ['Accounts Receivable', 'Debitoren', 'Forderungen', 'AR']
  },
  ueberfaelligeForderungen: {
    definition: 'Der Teil der offenen Rechnungen, dessen Zahlungsfrist bereits abgelaufen ist.',
    beispiel: 'Von 4,3 Mio € offen sind 0,6 Mio € über die Frist hinaus → 0,6 Mio € überfällig.',
    synonyme: ['Overdue Receivables', 'Past Due', 'Außenstände überfällig']
  },
  dso: {
    definition: 'Wie viele Tage es im Schnitt dauert, bis Kunden ihre Rechnungen bezahlen — kürzer ist besser.',
    beispiel: 'Offene Forderungen 4,3 Mio €, Tagesumsatz 0,14 Mio € → rund 30 Tage DSO.',
    synonyme: ['Days Sales Outstanding', 'Forderungslaufzeit', 'Debitorenlaufzeit']
  },
  forderungsausfall: {
    definition: 'Anteil des Umsatzes, der durch nicht zahlende Kunden endgültig verloren geht.',
    beispiel: '0,26 Mio € abgeschrieben bei 52 Mio € Umsatz → 0,5 % Forderungsausfallquote.',
    synonyme: ['Bad Debt Ratio', 'Ausfallquote', 'Forderungsverluste']
  },
  klumpenrisikoTop3: {
    definition: 'Welcher Umsatzanteil von nur den drei größten Kunden abhängt — hohe Werte sind ein Risiko.',
    beispiel: 'Die drei größten Händler bringen 13 Mio € von 52 Mio € → 25 % Klumpenrisiko.',
    synonyme: ['Customer Concentration', 'Kundenkonzentration', 'Konzentrationsrisiko']
  },
  ueberfaelligkeitsquote: {
    definition: 'Welcher Anteil der offenen Forderungen bereits überfällig ist.',
    beispiel: '0,6 Mio € überfällig von 4,3 Mio € offen → rund 14 % Überfälligkeitsquote.',
    synonyme: ['Overdue Ratio', 'Past Due Ratio', 'Verzugsquote']
  },
  co2ProRad: {
    definition: 'Wie viel Kilogramm CO₂ die Herstellung eines Rades verursacht — über die gesamte Lieferkette.',
    beispiel: 'Gesamtemissionen 1.530 t für 10.200 Räder → rund 150 kg CO₂ je Rad.',
    synonyme: ['CO₂-Fußabdruck je Rad', 'Carbon Footprint per Unit', 'Emissionen je Rad']
  },
  co2Gesamt: {
    definition: 'Der gesamte CO₂-Ausstoß des Unternehmens in Tonnen pro Jahr.',
    beispiel: 'Produktion, Energie und Transporte zusammen → 1.530 Tonnen CO₂ im Jahr.',
    synonyme: ['Carbon Footprint', 'Gesamtemissionen', 'Total Emissions', 'CO₂-Bilanz']
  },
  energieJeRad: {
    definition: 'Wie viel Energie (in Kilowattstunden) für Fertigung und Montage eines Rades gebraucht wird.',
    beispiel: '1,2 Mio kWh Energie für 10.200 Räder → rund 118 kWh je Rad.',
    synonyme: ['Energy per Unit', 'Energieintensität', 'Energieverbrauch je Rad']
  },
  oekostromanteil: {
    definition: 'Welcher Anteil des verbrauchten Stroms aus erneuerbaren Quellen stammt.',
    beispiel: 'Von 1 Mio kWh Strom stammen 0,7 Mio kWh aus Ökostrom → 70 % Ökostromanteil.',
    synonyme: ['Anteil erneuerbarer Energie', 'Renewable Share', 'Grünstromanteil']
  },
  recyclingquote: {
    definition: 'Welcher Anteil von Material und Verpackung wiederverwertet statt entsorgt wird.',
    beispiel: '100 t Abfall, davon 85 t verwertet → 85 % Recyclingquote.',
    synonyme: ['Recycling Rate', 'Verwertungsquote', 'Wiederverwertungsquote']
  },
  nettoverschuldung: {
    definition: 'Die Bankschulden abzüglich des vorhandenen Geldes — die echte Restschuld des Unternehmens.',
    beispiel: 'Kredite 16 Mio € minus liquide Mittel 4 Mio € → 12 Mio € Nettoverschuldung.',
    synonyme: ['Net Debt', 'Nettofinanzschulden', 'Nettoschulden']
  },
  zinsaufwand: {
    definition: 'Wie viel das Unternehmen in der Periode an Zinsen für seine Kredite zahlt.',
    beispiel: '16 Mio € Kredite zu durchschnittlich 5 % → rund 0,8 Mio € Zinsaufwand.',
    synonyme: ['Interest Expense', 'Zinskosten', 'Finanzaufwand']
  },
  durchschnittszins: {
    definition: 'Der durchschnittliche Zinssatz über alle Kredite hinweg.',
    beispiel: '0,8 Mio € Zinsen auf 16 Mio € Kredite → 5 % durchschnittlicher Zinssatz.',
    synonyme: ['Average Interest Rate', 'Finanzierungszins', 'Ø Finanzierungskosten']
  },
  hedgeQuote: {
    definition: 'Welcher Anteil des Währungsrisikos gegen Wechselkursschwankungen abgesichert ist.',
    beispiel: 'Von 10 Mio € Fremdwährungsrisiko sind 8 Mio € abgesichert → 80 % Hedge-Quote.',
    synonyme: ['Hedge Ratio', 'Absicherungsquote', 'FX Hedge Ratio']
  },
  fxExposureOffen: {
    definition: 'Der nicht abgesicherte Teil des Geschäfts in fremder Währung — hier drohen Wechselkursverluste.',
    beispiel: 'Von 10 Mio € Währungsrisiko sind 2 Mio € ungesichert → 2 Mio € offenes FX-Exposure.',
    synonyme: ['Open FX Exposure', 'Offenes Währungsrisiko', 'Currency Exposure']
  },
  nettoverschuldungEbitda: {
    definition: 'Wie viele Jahresgewinne (EBITDA) nötig wären, um die Schulden zu tilgen — über 3 gilt als hoch.',
    beispiel: 'Nettoverschuldung 12 Mio € ÷ EBITDA 6 Mio € → Faktor 2,0.',
    synonyme: ['Leverage', 'Net Debt to EBITDA', 'Verschuldungsfaktor', 'Leverage Ratio']
  },
  zinsdeckung: {
    definition: 'Wie oft der operative Gewinn die Zinsen deckt — höher bedeutet mehr finanzielle Sicherheit.',
    beispiel: 'EBIT 4 Mio € ÷ Zinsaufwand 0,8 Mio € → Faktor 5,0.',
    synonyme: ['Interest Coverage', 'Zinsdeckungsgrad', 'ICR', 'Zinsdeckungsquote']
  },
  reklamationsquote: {
    definition: 'Anteil der ausgelieferten Räder, zu denen Kunden später eine Beanstandung melden.',
    beispiel: '10.000 ausgelieferte Räder, 150 Reklamationen → 1,5 % Reklamationsquote.',
    synonyme: ['Complaint Rate', 'Beanstandungsquote', 'Field Failure Rate']
  },
  nacharbeitsquote: {
    definition: 'Anteil der gefertigten Räder, die wegen Mängeln nochmal nachbearbeitet werden müssen.',
    beispiel: '10.200 Räder, 306 müssen nachgearbeitet werden → 3 % Nacharbeitsquote.',
    synonyme: ['Rework Rate', 'Nachbearbeitungsquote']
  },
  firstPassYield: {
    definition: 'Anteil der Räder, die gleich beim ersten Durchlauf fehlerfrei gefertigt werden — ohne Nacharbeit.',
    beispiel: '10.200 Räder, 9.690 sofort fehlerfrei → 95 % First Pass Yield.',
    synonyme: ['FPY', 'Gutausbeute', 'Yield', 'Ausbeute']
  },
  garantiekosten: {
    definition: 'Kosten für Reparaturen und Ersatz, die unter Garantie oder Gewährleistung übernommen werden.',
    beispiel: 'Garantie-Reparaturen und Austauschteile im Jahr → 0,5 Mio € Garantiekosten.',
    synonyme: ['Warranty Cost', 'Gewährleistungskosten', 'Garantieaufwand']
  },
  qualitaetskostenquote: {
    definition: 'Wie viel Prozent vom Umsatz durch Garantie- und Fehlerkosten verloren gehen.',
    beispiel: '0,5 Mio € Garantiekosten bei 52 Mio € Umsatz → rund 1 % Fehlerkostenquote.',
    synonyme: ['CoPQ', 'Cost of Poor Quality', 'Fehlerkostenquote', 'Qualitätskostenquote']
  },
  marketingkosten: {
    definition: 'Die Ausgaben für Werbung und Kampagnen — ein Teil der gesamten Vertriebskosten.',
    beispiel: 'Online-Werbung, Print und Messen zusammen → 3 Mio € Marketingkosten.',
    synonyme: ['Marketing Spend', 'Werbekosten', 'Mediabudget', 'Marketing Expense']
  },
  roas: {
    definition: 'Wie viel Umsatz jeder Euro Werbebudget bringt — höher heißt, die Werbung wirkt besser.',
    beispiel: '3 Mio € Werbebudget bringen 18 Mio € Umsatz → ROAS von 6,0.',
    synonyme: ['Return on Ad Spend', 'Werbeeffizienz', 'Media Efficiency']
  },
  cac: {
    definition: 'Was es im Schnitt kostet, einen neuen Kunden zu gewinnen — Werbeausgaben je Neukunde.',
    beispiel: '3 Mio € Marketing gewinnen 30.000 Neukunden → 100 € pro Neukunde.',
    synonyme: ['Customer Acquisition Cost', 'Kundengewinnungskosten', 'Akquisekosten']
  },
  conversionRate: {
    definition: 'Welcher Anteil der Shop-Besuche zu einer Bestellung führt — höher heißt, der Shop verkauft besser.',
    beispiel: '1.000 Shop-Besuche, 25 Bestellungen → 2,5 % Conversion-Rate.',
    synonyme: ['Conversion', 'Umwandlungsrate', 'CVR', 'Bestellquote']
  },
  marketingkostenquote: {
    definition: 'Wie viel Prozent vom Umsatz für Marketing ausgegeben werden.',
    beispiel: '3 Mio € Marketing bei 52 Mio € Umsatz → rund 5,8 % Marketingkostenquote.',
    synonyme: ['Marketing Cost Ratio', 'Werbekostenquote', 'Marketing-to-Sales']
  },
  roce: {
    definition: 'Wie gut das eingesetzte Kapital Gewinn erwirtschaftet — operativer Gewinn je Euro Kapital.',
    beispiel: 'EBIT 4 Mio € ÷ eingesetztes Kapital 25 Mio € → 16 % ROCE.',
    synonyme: ['Return on Capital Employed', 'Kapitalrendite', 'Gesamtkapitalrentabilität']
  },
  auslandsanteil: {
    definition: 'Welcher Anteil des Umsatzes von den Auslandstöchtern in der Schweiz und den Niederlanden kommt.',
    beispiel: '52 Mio € Umsatz, davon 13 Mio € aus CH und NL → 25 % Auslandsanteil.',
    synonyme: ['International Share', 'Exportquote', 'Foreign Sales Share']
  },
  intercompanyVolumen: {
    definition: 'Der Wert der Lieferungen zwischen den eigenen Konzerngesellschaften — wird später herausgerechnet.',
    beispiel: 'Das Werk liefert Räder für 6 Mio € an die eigene CH-Tochter → 6 Mio € Intercompany-Volumen.',
    synonyme: ['IC-Volumen', 'Intercompany Sales', 'Konzerninterne Umsätze']
  },
  eigenkapitalrendite: {
    definition: 'Wie stark sich das eingesetzte Eigenkapital verzinst — Gewinn im Verhältnis zum Eigenkapital.',
    beispiel: 'Jahresgewinn 3 Mio € ÷ Eigenkapital 16 Mio € → rund 19 % Eigenkapitalrendite.',
    synonyme: ['ROE', 'Return on Equity', 'Eigenkapitalrentabilität']
  },
  intercompanyQuote: {
    definition: 'Wie groß die konzerninternen Lieferungen gemessen am Umsatz sind — zeigt den Konsolidierungsumfang.',
    beispiel: '6 Mio € Intercompany bei 52 Mio € Umsatz → rund 11,5 % Intercompany-Quote.',
    synonyme: ['IC-Quote', 'Intercompany Ratio', 'Konzerninterne Quote']
  },
  serviceumsatz: {
    definition: 'Umsatz aus Reparatur, Wartung und Ersatzteilen — wiederkehrend und meist margenstark.',
    beispiel: 'Werkstatt, Inspektionen und Ersatzteile bringen zusammen 6 Mio € → 6 Mio € Serviceumsatz.',
    synonyme: ['Service Revenue', 'After-Sales-Umsatz', 'Aftermarket Revenue']
  },
  ersatzteilverfuegbarkeit: {
    definition: 'Anteil der wichtigen Ersatzteile, die sofort ab Lager verfügbar sind.',
    beispiel: 'Von 200 kritischen Teilen sind 192 sofort lieferbar → 96 % Ersatzteilverfügbarkeit.',
    synonyme: ['Spare Parts Availability', 'Teileverfügbarkeit', 'Parts Fill Rate']
  },
  reparaturdurchlaufzeit: {
    definition: 'Wie viele Tage eine Reparatur in der Werkstatt im Schnitt von Annahme bis Abholung dauert.',
    beispiel: 'Rad kommt am Montag, ist Donnerstag fertig → rund 3 Tage Durchlaufzeit.',
    synonyme: ['Repair Turnaround Time', 'Werkstatt-Durchlaufzeit', 'TAT']
  },
  nps: {
    definition: 'Ein Wert zwischen -100 und +100, der zeigt, wie gern Kunden das Unternehmen weiterempfehlen.',
    beispiel: '60 % Empfehler minus 15 % Kritiker → NPS von 45.',
    synonyme: ['Net Promoter Score', 'Weiterempfehlungswert', 'Promoter Score']
  },
  serviceanteil: {
    definition: 'Wie viel Prozent des Gesamtumsatzes aus dem Servicegeschäft stammen.',
    beispiel: '6 Mio € Serviceumsatz bei 52 Mio € Umsatz → rund 11,5 % Serviceanteil.',
    synonyme: ['Service Share', 'After-Sales-Anteil', 'Serviceumsatzanteil']
  },
  fuekosten: {
    definition: 'Die Ausgaben für Forschung und Entwicklung neuer Räder und Technik.',
    beispiel: 'Entwicklung neuer E-Bike-Modelle und Antriebe → 2 Mio € F&E-Kosten.',
    synonyme: ['R&D Expense', 'Forschungskosten', 'Entwicklungskosten', 'RuD-Kosten']
  },
  neuproduktumsatzanteil: {
    definition: 'Welcher Anteil des Umsatzes mit Produkten erzielt wird, die jünger als drei Jahre sind.',
    beispiel: '52 Mio € Umsatz, davon 18,2 Mio € mit neuen Modellen → 35 % Neuprodukt-Anteil.',
    synonyme: ['New Product Sales Ratio', 'Innovationsrate', 'Vitality Index']
  },
  entwicklungsprojekte: {
    definition: 'Wie viele Entwicklungsprojekte gerade aktiv in der Pipeline laufen.',
    beispiel: 'Vier neue Rahmen und zwei Antriebskonzepte in Arbeit → 6 Entwicklungsprojekte.',
    synonyme: ['R&D Projects', 'Projektpipeline', 'Entwicklungspipeline']
  },
  timeToMarket: {
    definition: 'Wie viele Monate es im Schnitt dauert, ein neues Rad von der Idee bis in den Verkauf zu bringen.',
    beispiel: 'Idee im Januar, Marktstart 18 Monate später → 18 Monate Time-to-Market.',
    synonyme: ['TTM', 'Markteinführungszeit', 'Entwicklungsdauer']
  },
  fueQuote: {
    definition: 'Wie viel Prozent vom Umsatz in Forschung und Entwicklung fließen.',
    beispiel: '2 Mio € F&E-Kosten bei 52 Mio € Umsatz → rund 3,8 % F&E-Quote.',
    synonyme: ['R&D Ratio', 'Forschungsquote', 'R&D Intensity', 'FuE-Intensität']
  },
  fremdkapital: {
    definition: 'Die gesamten Schulden des Unternehmens — alles, was nicht durch Eigenkapital gedeckt ist.',
    beispiel: 'Bilanzsumme 40 Mio € minus Eigenkapital 16 Mio € → 24 Mio € Fremdkapital.',
    synonyme: ['Liabilities', 'Verbindlichkeiten', 'Schulden', 'Total Debt', 'FK']
  },
  fremdkapitalquote: {
    definition: 'Welcher Anteil des Vermögens mit Schulden finanziert ist — höher heißt mehr Fremdfinanzierung.',
    beispiel: '24 Mio € Fremdkapital von 40 Mio € Bilanzsumme → 60 % Fremdkapitalquote.',
    synonyme: ['Debt Ratio', 'FK-Quote', 'Anspannungsgrad', 'Fremdkapitalanteil']
  },
  verschuldungsgrad: {
    definition: 'Das Verhältnis von Schulden zu Eigenkapital — zeigt, wie stark fremdfinanziert das Unternehmen ist.',
    beispiel: '24 Mio € Fremdkapital ÷ 16 Mio € Eigenkapital → 150 % Verschuldungsgrad.',
    synonyme: ['Debt to Equity', 'Gearing', 'D/E Ratio', 'Leverage-Grad']
  },
  kapitalumschlag: {
    definition: 'Wie oft im Jahr das gesamte eingesetzte Kapital als Umsatz wieder umgesetzt wird.',
    beispiel: 'Umsatz 52 Mio € ÷ Bilanzsumme 40 Mio € → Kapital schlägt 1,3-mal um.',
    synonyme: ['Asset Turnover', 'Kapitalumschlagshäufigkeit', 'Total Asset Turnover']
  },
  umsatzrendite: {
    definition: 'Wie viel operativer Gewinn (EBIT) von jedem Euro Umsatz übrig bleibt — in Prozent.',
    beispiel: 'EBIT 4 Mio € bei 52 Mio € Umsatz → rund 7,7 % Umsatzrendite.',
    synonyme: ['Return on Sales', 'RoS', 'Umsatzrentabilität', 'Nettoumsatzrendite', 'Operating Margin']
  },
  ebitdaMarge: {
    definition: 'Wie viel operativer Gewinn vor Abschreibungen (EBITDA) je Euro Umsatz übrig bleibt — in Prozent.',
    beispiel: 'EBITDA 6 Mio € bei 52 Mio € Umsatz → rund 11,5 % EBITDA-Marge.',
    synonyme: ['EBITDA Margin', 'EBITDA-Rendite', 'Bruttobetriebsmarge']
  },
  nopat: {
    definition: 'Der operative Gewinn nach Abzug der Steuern — was vom Kerngeschäft nach Steuern übrig bleibt.',
    beispiel: 'EBIT 4 Mio € bei 30 % Steuersatz → 4 × 0,7 = 2,8 Mio € NOPAT.',
    synonyme: ['Net Operating Profit After Tax', 'Operatives Ergebnis nach Steuern', 'NOPLAT']
  },
  investitionsquote: {
    definition: 'Wie viel Prozent vom Umsatz in langlebige Anschaffungen wie Maschinen und Gebäude investiert werden.',
    beispiel: '2,5 Mio € Investitionen bei 52 Mio € Umsatz → rund 4,8 % Investitionsquote.',
    synonyme: ['CapEx Ratio', 'Investitionsintensität', 'CapEx to Sales']
  },
  gmroi: {
    definition: 'Wie viel Rohertrag jeder Euro im Lager erwirtschaftet — zeigt, wie rentabel der Bestand arbeitet.',
    beispiel: 'Bruttoertrag 21 Mio € ÷ Ø Lagerbestand 9 Mio € → GMROI von 2,3.',
    synonyme: ['Gross Margin Return on Investment', 'GMROII', 'Lagerrendite']
  }
}
export const glossar = (id) => LAIEN[id] || null
