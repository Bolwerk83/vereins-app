// =========================================================================
//  KPI-DEFINITIONS-CONTEXT
//  Stellt EINEN Opener bereit, damit JEDE KpiCard (egal in welchem Modul)
//  per Klick auf das ⓘ ihre Definition öffnen kann — ohne dass jedes Modul
//  das selbst verdrahten muss. Das Panel wird hier einmal zentral gerendert.
// =========================================================================
import React, { createContext, useContext, useState } from 'react'
import KpiDefinitionPanel from './KpiDefinitionPanel.jsx'
import { setzeStatus } from '../../core/kpiFreigabe.js'

const Ctx = createContext(null)
export function useKpiDef() { return useContext(Ctx) }

export function KpiDefProvider({ rolle, werte, onSpringe, children }) {
  const [aktivId, setAktivId] = useState(null)
  const [freigabeTick, setFreigabeTick] = useState(0)
  // Freigabe setzen (Controlling/Admin) und alle Karten neu zeichnen lassen.
  const setFreigabe = (kpiId, status) => { setzeStatus(kpiId, status); setFreigabeTick((t) => t + 1) }
  return (
    <Ctx.Provider value={{ oeffne: setAktivId, rolle, freigabeTick, setFreigabe }}>
      {children}
      <KpiDefinitionPanel
        kpiId={aktivId} rolle={rolle} werte={werte}
        onOeffneKpi={setAktivId}
        onClose={() => setAktivId(null)}
        onSpringe={(knotenId) => { setAktivId(null); onSpringe && onSpringe(knotenId) }} />
    </Ctx.Provider>
  )
}
