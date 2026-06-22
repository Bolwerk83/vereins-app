# 11 · Strukturoptimierung

Nach dem Ausbau auf 24 Fachbereiche wurde die Struktur überarbeitet — ohne
die 5-Ebenen-Logik oder bestehende KPIs zu ändern.

## 1. Thematische Cluster (Navigation)

Die 24 Fachbereiche (Ebene 2) waren eine flache Liste. Sie werden jetzt zu
**6 Clustern** gruppiert (`src/core/bereiche.js`) — eine organisatorische
Gliederung allein für die Navigation; Baum, Pfade und Ebenen bleiben gleich.

| Cluster | Bereiche |
|---------|----------|
| Führung & Finanzen | FIN · FIBU · KON |
| Markt & Kunde | VK · VC · MKT · SVC |
| Produktion & Supply Chain | EK · PR · PP · LOG · SCC · QM |
| Planung & Steuerung | KLR · PLAN · FC · LIQ · TRE |
| Risiko & Governance | RIS · ESG |
| Enabler & Innovation | HR · PC · IT · FE |

Der Berichtsbaum-Navigator zeigt die Wurzel (GF) und darunter die Cluster
als **einklappbare Gruppen**. `gruppiereNachCluster()` ordnet die Knoten zu;
nicht zugeordnete Bereiche landen automatisch unter „Weitere".

## 2. Single Source of Truth (Backend)

Das Backend pflegte das `sqlRef → kpiId`-Mapping (`ROHE_KPIS`) als
**Kopie** der KPI-Registry — eine ständige Synchronisationsfalle. Jetzt wird
es **direkt aus der Registry abgeleitet**:

```js
const ROHE_KPIS = Object.fromEntries(
  Object.values(KPI).filter((k) => k.sqlRef).map((k) => [k.sqlRef, k.id])
)
```

Eine neue gemessene KPI in `kpiRegistry.js` ist damit automatisch im Backend
bekannt — keine zweite Stelle mehr zu pflegen.

## 3. Zentrale Bereichs-Registry

`src/core/bereiche.js` bündelt Cluster + Zuordnung an einem Ort
(`CLUSTER`, `clusterFuer`, `gruppiereNachCluster`) — vorher waren
Bereichscodes über Baum und Module verstreut.

## Wirkung
- **Navigation:** aus 24 Einträgen werden 6 übersichtliche Gruppen.
- **Wartbarkeit:** KPIs nur noch an einer Stelle definieren (Registry).
- **Erweiterbarkeit:** neuer Bereich → Cluster-Zuordnung in `bereiche.js`,
  KPIs in der Registry; Navigation und Backend ziehen automatisch nach.

## Nächste sinnvolle Schritte
- Rollen könnten Rechte je **Cluster** statt je Einzelbereich vergeben.
- Detaildaten/Portfolio über den `dataProvider` statt direktem Mock-Import
  (für die Instrumente), damit auch sie MSSQL-fähig werden.
