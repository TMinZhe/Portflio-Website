import type { ComponentType } from "react";
import type { Showcase } from "@/content/types";
import { STORES, grid, type Cell } from "./ops-console-model";
import { RiskMatrix } from "./erm/risk-matrix";
import { StoreSyncPreview } from "./inventory/store-sync-preview";
import { AiChatPreview } from "./ai-assistant/chat-preview";
import { KioskPreview } from "./scantry/kiosk-preview";
import { AdPipelinePreview } from "./advertising/ad-preview";

/*
 * Still previews for the homepage. Each is an illustrative schematic of what a
 * project does, drawn with synthetic data and labelled as such by the caller.
 * They are decorative to assistive tech: the project's text says the same.
 */

const panel = "flex h-full flex-col gap-4 rounded-[var(--r-md)] bg-[var(--c-graphite)] p-4 sm:p-6";

/** Inventory: stock across stores on one day, with the top-ups that become a purchase order. */
function InventoryPreview() {
  const cells = grid(6);
  const topUps = cells.flat().filter((c) => c.topUp > 0);
  return (
    <div className={panel}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-[1.125rem]">Stock across stores</p>
        <p className="t-meta">Day 6</p>
      </div>
      <div className="grid flex-1 grid-cols-[auto_repeat(4,minmax(0,1fr))] gap-1.5 text-[0.75rem]">
        <span />
        {STORES.map((s) => (
          <span key={s} className="t-meta truncate text-[0.6875rem]">
            {s}
          </span>
        ))}
        {cells.map((row) => (
          <Row key={row[0].sku} row={row} />
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 rounded-[var(--r-sm)] bg-[var(--c-void)] px-3 py-2.5 text-[0.8125rem]">
        <span>Purchase order draft</span>
        <span className="t-meta text-lime">{topUps.length} lines · {topUps.reduce((n, c) => n + c.topUp, 0)} units</span>
      </div>
    </div>
  );
}

function Row({ row }: { row: Cell[] }) {
  return (
    <>
      <span className="t-meta self-center pr-1 text-[0.6875rem]">{row[0].sku.replace("SKU-", "")}</span>
      {row.map((c) => (
        <span
          key={c.store}
          className={`flex items-baseline justify-between rounded-[var(--r-xs)] border bg-[var(--c-elevated)]/60 px-1.5 py-1.5 font-mono tabular-nums ${
            c.status === "out" ? "border-[var(--c-warn)]/70 text-[var(--c-warn)]" : c.status === "low" ? "border-lime/70" : "border-transparent"
          }`}
        >
          {c.status === "out" ? "Out" : c.stock}
          {c.topUp > 0 && <span className={c.status === "out" ? "" : "text-lime"}>+{c.topUp}</span>}
        </span>
      ))}
    </>
  );
}

/** Risk management: a still frame of the synthetic risk matrix. */
function RiskMatrixPreview() {
  return <RiskMatrix still />;
}

export const previews: Partial<Record<Showcase, ComponentType>> = {
  "ops-console": InventoryPreview,
  "store-sync": StoreSyncPreview,
  "ai-chat": AiChatPreview,
  "risk-matrix": RiskMatrixPreview,
  "scantry-kiosk": KioskPreview,
  "ad-pipeline": AdPipelinePreview,
};
