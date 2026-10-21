import type { ComponentType } from "react";
import type { Showcase } from "@/content/types";
import { STORES, grid, type Cell } from "./ops-console-model";
import { RiskMatrix } from "./erm/risk-matrix";
import { StoreSyncPreview } from "./inventory/store-sync-preview";

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

/** Analytics assistant: a plain-language question, the SQL it becomes, and the explained answer. */
function TextToSqlPreview() {
  return (
    <div className={panel}>
      <p className="ml-auto max-w-[85%] rounded-[var(--r-md)] rounded-br-[var(--r-xs)] bg-[var(--c-elevated)] px-4 py-3 text-[0.9375rem]">
        Which items are below their reorder point at each store?
      </p>
      <pre className="overflow-hidden rounded-[var(--r-sm)] bg-[var(--c-void)] px-4 py-3 font-mono text-[0.75rem] leading-relaxed text-ink-2 sm:text-[0.8125rem]">
        <code>
          <span className="text-ice">SELECT</span> store, item, on_hand{"\n"}
          <span className="text-ice">FROM</span> stock{"\n"}
          <span className="text-ice">WHERE</span> on_hand &lt; reorder_point{"\n"}
          <span className="text-ice">ORDER BY</span> store;
        </code>
      </pre>
      <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 text-[0.8125rem] tabular-nums">
        {["Store", "Item", "On hand"].map((h) => (
          <span key={h} className="t-meta">
            {h}
          </span>
        ))}
        {[
          ["Store A", "1041", "4"],
          ["Store B", "2295", "2"],
          ["Store D", "3302", "9"],
        ].map((r) => r.map((v, i) => <span key={r[0] + i}>{v}</span>))}
      </div>
      <p className="max-w-[85%] rounded-[var(--r-md)] rounded-bl-[var(--r-xs)] bg-[var(--c-elevated)] px-4 py-3 text-[0.9375rem]">
        Three items are below their reorder point, one each at Stores A, B and D. Store B is lowest, with 2 left.
      </p>
    </div>
  );
}

/** Risk management: a still frame of the synthetic risk matrix. */
function RiskMatrixPreview() {
  return <RiskMatrix still />;
}

export const previews: Partial<Record<Showcase, ComponentType>> = {
  "ops-console": InventoryPreview,
  "store-sync": StoreSyncPreview,
  "text-to-sql": TextToSqlPreview,
  "risk-matrix": RiskMatrixPreview,
};
