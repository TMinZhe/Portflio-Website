import type { ComponentType } from "react";
import type { DemoKey } from "@/content/types";
import { RiskMatrix } from "./erm/risk-matrix";
import { SignoffWorkflow } from "./erm/signoff-workflow";
import { AuditTimeline } from "./erm/audit-timeline";
import { StoreTopology } from "./inventory/store-topology";
import { OfflineDelivery } from "./inventory/offline-delivery";
import { ForecastExplorer } from "./inventory/forecast-explorer";
import { StockPlacement } from "./inventory/stock-placement";
import { CogsLedger } from "./inventory/cogs-ledger";
import { InventoryArchitecture } from "./inventory/architecture";

/** Interactive, synthetic demonstrations used by case-study deep dives. */
export const demos: Record<DemoKey, ComponentType> = {
  "risk-matrix": RiskMatrix,
  "signoff-workflow": SignoffWorkflow,
  "audit-timeline": AuditTimeline,
  "store-topology": StoreTopology,
  "offline-delivery": OfflineDelivery,
  "forecast-explorer": ForecastExplorer,
  "stock-placement": StockPlacement,
  "cogs-ledger": CogsLedger,
  "inventory-architecture": InventoryArchitecture,
};
