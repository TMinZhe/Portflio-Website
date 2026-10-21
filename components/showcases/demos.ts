import type { ComponentType } from "react";
import type { DemoKey } from "@/content/types";
import { RiskMatrix } from "./erm/risk-matrix";
import { SignoffWorkflow } from "./erm/signoff-workflow";
import { AuditTimeline } from "./erm/audit-timeline";

/** Interactive, synthetic demonstrations used by case-study deep dives. */
export const demos: Record<DemoKey, ComponentType> = {
  "risk-matrix": RiskMatrix,
  "signoff-workflow": SignoffWorkflow,
  "audit-timeline": AuditTimeline,
};
