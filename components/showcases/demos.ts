import type { ComponentType } from "react";
import type { DemoKey } from "@/content/types";
import { RiskMatrix } from "./erm/risk-matrix";
import { SignoffWorkflow } from "./erm/signoff-workflow";
import { AuditTimeline } from "./erm/audit-timeline";
import { StoreTopology } from "./inventory/store-topology";
import { OfflineDelivery } from "./inventory/offline-delivery";
import { StockPlacement } from "./inventory/stock-placement";
import { CogsLedger } from "./inventory/cogs-ledger";
import { InventoryArchitecture } from "./inventory/architecture";
import { GuidedDelivery } from "./inventory/guided-delivery";
import { ForecastGuide } from "./inventory/forecast-guide";
import { ShelfGuard } from "./inventory/shelf-guard";
import { RevenueExample } from "./inventory/revenue-example";
import { ChatDemo } from "./ai-assistant/chat-demo";
import { QuestionPipeline } from "./ai-assistant/question-pipeline";
import { EvalWorkflow, GuardrailGallery, InferenceArchitecture, LatencyComparison } from "./ai-assistant/engineering-visuals";
import { AccessSimulator } from "./scantry/access-simulator";
import { KioskHardware, ProjectTimeline, SystemMap, VisionPipeline } from "./scantry/engineering-visuals";
import { AdExplorer } from "./advertising/ad-explorer";
import { CompositionConcept } from "./advertising/composition-concept";

/** Interactive, synthetic demonstrations used by case-study deep dives. */
export const demos: Record<DemoKey, ComponentType> = {
  "risk-matrix": RiskMatrix,
  "signoff-workflow": SignoffWorkflow,
  "audit-timeline": AuditTimeline,
  "store-topology": StoreTopology,
  "offline-delivery": OfflineDelivery,
  "stock-placement": StockPlacement,
  "cogs-ledger": CogsLedger,
  "inventory-architecture": InventoryArchitecture,
  "guided-delivery": GuidedDelivery,
  "forecast-guide": ForecastGuide,
  "shelf-guard": ShelfGuard,
  "revenue-example": RevenueExample,
  "ai-chat": ChatDemo,
  "ai-pipeline": QuestionPipeline,
  "ai-guardrails": GuardrailGallery,
  "ai-inference": InferenceArchitecture,
  "ai-latency": LatencyComparison,
  "ai-eval": EvalWorkflow,
  "scantry-access": AccessSimulator,
  "scantry-vision": VisionPipeline,
  "scantry-kiosk": KioskHardware,
  "scantry-system": SystemMap,
  "scantry-timeline": ProjectTimeline,
  "ad-explorer": AdExplorer,
  "ad-composition": CompositionConcept,
};
