// =========================================================================
//  HAUPTBUCH (FiBu-Salden) für die Abstimmbrücken.
//
//  Liefert absolute Buchhaltungssalden je Abstimmposition und Periode.
//  - MSSQL konfiguriert: Query gegen die FiBu-Sicht (sql/hauptbuch.sql,
//    Mapping PositionId -> Saldo). Schlägt sie fehl, greift der Mock.
//  - sonst: hinterlegte Mock-Salden (für die Demo, periodengenau).
// =========================================================================
import { getPool, configBeschreibung } from './db.js'

// Mock-Hauptbuch: ABSOLUTE Salden je Position (Mio €). Bewusst mit ein paar
// Differenzen zum Reporting-Ist (Wareneinsatz/Bestände/Rückstellungen/CF).
const MOCK_HAUPTBUCH = {
  '2025': {
    umsatz: 52.0, wareneinsatz: 32.55, personal: 10.46, gesamtkosten: 50.6,
    bestaende: 11.65, rueckstell: 3.82, eigenkapital: 11.2, bilanzsumme: 28.5,
    liquide: 6.27, cashflow: 1.98
  }
}

// Zuordnung PositionId -> FiBu-Konto (für die echte Query/Doku).
const KONTO = {
  umsatz: '8400', wareneinsatz: '3400', personal: '4100', gesamtkosten: null,
  bestaende: '1140', rueckstell: '3070', eigenkapital: '2000', bilanzsumme: null,
  liquide: '1200', cashflow: null
}

export async function ladeHauptbuch(periode) {
  if (configBeschreibung().konfiguriert) {
    try {
      // Erwartet: ctrl.vw_Hauptbuch(Periode, PositionId, Saldo) — passe die
      // Sicht an deine FiBu an. Mapping PositionId == abstimmung.POSITIONEN[].id.
      const pool = await getPool()
      const r = await pool.request()
        .input('periode', periode)
        .query('SELECT PositionId, Saldo FROM ctrl.vw_Hauptbuch WHERE Periode = @periode')
      if (r.recordset?.length) {
        const werte = {}
        for (const row of r.recordset) werte[row.PositionId] = Number(row.Saldo)
        return { quelle: 'fibu', werte }
      }
    } catch { /* Fallback Mock */ }
  }
  const werte = MOCK_HAUPTBUCH[periode]
  return werte ? { quelle: 'mock', werte } : { quelle: 'mock', werte: {} }
}

export { KONTO }
