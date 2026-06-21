// =========================================================================
//  KPI-DEFINITIONS-CONTEXT
//  Stellt EINEN Opener bereit, damit JEDE KpiCard (egal in welchem Modul)
//  per Klick auf das ⓘ ihre Definition öffnen kann — ohne dass jedes Modul
//  das selbst verdrahten muss. Das Panel wird hier einmal zentral gerendert.
// =========================================================================
import React, { createContext, useContext, useState } from 'react'
import KpiDefinitionPanel from './KpiDefinitionPanel.jsx'

const Ctx = createContext(null)
export function useKpiDef() { return useContext(Ctx) }

export function KpiDefProvider({ rolle, werte, onSpringe, children }) {
  const [aktivId, setAktivId] = useState(null)
  return (
    <Ctx.Provider value={{ oeffne: setAktivId }}>
      {children}
      <KpiDefinitionPanel
        kpiId={aktivId} rolle={rolle} werte={werte}
        onOeffneKpi={setAktivId}
        onClose={() => setAktivId(null)}
        onSpringe={(knotenId) => { setAktivId(null); onSpringe && onSpringe(knotenId) }} />
    </Ctx.Provider>
  )
}
