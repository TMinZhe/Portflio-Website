"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useEffects } from "@/lib/hooks/use-effects";
import { ease } from "@/lib/motion/tokens";
import { MAX_DAY, STORES, grid, type Cell } from "./ops-console-model";

/**
 * Inventory showcase: an interactive schematic of store-wide monitoring,
 * top-up recommendations and purchase-order drafting, on synthetic data.
 */
export function OpsConsole() {
  const [day, setDay] = useState(0);
  const [order, setOrder] = useState<{ day: number; lines: Cell[] } | null>(null);
  const effects = useEffects();
  const rootRef = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const sliderId = useId();

  const cells = useMemo(() => grid(day), [day]);
  const flat = cells.flat();
  const low = flat.filter((c) => c.status === "low").length;
  const out = flat.filter((c) => c.status === "out").length;
  const recommended = flat.filter((c) => c.topUp > 0);

  // Once, when first seen: run the clock forward so the console shows its point
  // without needing a click. Stops the moment the visitor touches a control.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || effects === "reduced") return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || touched.current) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          if (touched.current) return;
          const p = Math.min(1, (now - t0) / 2200);
          setDay(Math.round(p * 6));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [effects]);

  const stale = order !== null && order.day !== day;

  return (
    <div ref={rootRef} className="grid gap-px overflow-hidden rounded-[var(--r-md)] border border-line bg-line lg:grid-cols-[minmax(0,1fr)_22rem]">
      {/* Monitor */}
      <div className="min-w-0 bg-[var(--c-graphite)] p-3 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="font-display text-[1.25rem] tracking-[-0.02em]">Stock across stores</h4>
            <p className="mt-1 text-[0.875rem] text-ink-2">Units on hand per item. Cells outlined in lime need a top-up.</p>
          </div>
          <dl className="flex gap-5 sm:text-right" aria-live="polite">
            <Stat label="Stores" value={STORES.length} />
            <Stat label="Below reorder point" value={low} tone={low ? "lime" : undefined} />
            <Stat label="Out of stock" value={out} tone={out ? "warn" : undefined} />
          </dl>
        </div>

        <div className="mt-5">
          <table className="w-full table-fixed border-separate border-spacing-0.5 text-left sm:border-spacing-1">
            <caption className="sr-only">Synthetic stock levels on day {day}, by item and store</caption>
            <thead>
              <tr>
                <th scope="col" className="t-meta w-[3.75rem] pb-1 font-normal sm:w-24">Item</th>
                {STORES.map((s) => (
                  <th key={s} scope="col" className="t-meta pb-1 font-normal">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cells.map((row) => (
                <tr key={row[0].sku}>
                  <th scope="row" className="t-meta pr-1 font-normal text-ink sm:pr-2">
                    <span className="sm:hidden">{row[0].sku.slice(4)}</span>
                    <span className="hidden sm:inline">{row[0].sku}</span>
                  </th>
                  {row.map((c) => (
                    <StockCell key={c.store} cell={c} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <label htmlFor={sliderId} className="text-[0.9375rem]">
                Days without restocking
              </label>
              <output htmlFor={sliderId} className="t-meta text-ink">
                Day {day}
              </output>
            </div>
            <input
              id={sliderId}
              type="range"
              min={0}
              max={MAX_DAY}
              step={1}
              value={day}
              onChange={(e) => {
                touched.current = true;
                setDay(Number(e.target.value));
              }}
              className="ops-range mt-3 w-full"
            />
          </div>
          <button
            type="button"
            disabled={recommended.length === 0}
            onClick={() => {
              touched.current = true;
              setOrder({ day, lines: recommended });
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--r-sm)] bg-lime px-5 text-[0.9375rem] font-medium text-[var(--c-lime-ink)] transition-[background-color,opacity] hover:bg-[#c8ff6a] disabled:cursor-not-allowed disabled:opacity-40 sm:ml-4"
          >
            {recommended.length ? `Draft purchase order (${recommended.length} ${recommended.length === 1 ? "line" : "lines"})` : "Nothing to order yet"}
          </button>
        </div>
      </div>

      {/* Purchase order */}
      <PurchaseOrder order={order} stale={stale} reduced={effects === "reduced"} />
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "lime" | "warn" }) {
  return (
    <div>
      <dt className="text-[0.75rem] text-ink-2">{label}</dt>
      <dd
        className={`font-display text-[1.5rem] leading-none tabular-nums ${
          tone === "lime" ? "text-lime" : tone === "warn" ? "text-[var(--c-warn)]" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function StockCell({ cell }: { cell: Cell }) {
  const pct = Math.round((cell.stock / cell.capacity) * 100);
  const rp = Math.round((cell.reorderPoint / cell.capacity) * 100);
  const border =
    cell.status === "out"
      ? "border-[var(--c-warn)]/70"
      : cell.status === "low"
        ? "border-lime/70"
        : "border-transparent";
  return (
    <td className={`relative rounded-[var(--r-xs)] border bg-[var(--c-elevated)]/60 px-1.5 py-2 align-top sm:px-2.5 transition-colors duration-[var(--d-base)] ${border}`}>
      <div className="flex items-baseline justify-between gap-1">
        <span className={`font-mono text-[0.875rem] tabular-nums ${cell.status === "out" ? "text-[var(--c-warn)]" : ""}`}>
          {cell.status === "out" ? "Out" : cell.stock}
        </span>
        {cell.topUp > 0 && (
          <span className={`font-mono text-[0.6875rem] tabular-nums sm:text-[0.75rem] ${cell.status === "out" ? "text-[var(--c-warn)]" : "text-lime"}`}>
            +{cell.topUp}
          </span>
        )}
      </div>
      <div className="relative mt-2 h-1 rounded-full bg-white/[0.06]" aria-hidden>
        <div
          className={`h-full rounded-full transition-[width,background-color] duration-[var(--d-slow)] ease-[var(--ease-out-expo)] ${
            cell.status === "ok" ? "bg-ice/70" : cell.status === "low" ? "bg-lime" : "bg-[var(--c-warn)]"
          }`}
          style={{ width: `${pct}%` }}
        />
        <div className="absolute -top-0.5 h-2 w-px bg-ink-2" style={{ left: `${rp}%` }} />
      </div>
      <span className="sr-only">
        {cell.status === "ok" ? "OK" : cell.status === "low" ? `Below reorder point, recommend ${cell.topUp}` : `Out of stock, recommend ${cell.topUp}`}
      </span>
    </td>
  );
}

function PurchaseOrder({ order, stale, reduced }: { order: { day: number; lines: Cell[] } | null; stale: boolean; reduced: boolean }) {
  const bySku = useMemo(() => {
    if (!order) return [];
    const m = new Map<string, Cell[]>();
    for (const c of order.lines) m.set(c.sku, [...(m.get(c.sku) ?? []), c]);
    return [...m.entries()].map(([sku, lines]) => ({ sku, lines, total: lines.reduce((s, l) => s + l.topUp, 0) }));
  }, [order]);
  const total = bySku.reduce((s, l) => s + l.total, 0);

  return (
    <section aria-label="Purchase order draft" className="flex min-h-[22rem] flex-col bg-[#12181e] p-4 sm:p-6">
      <div className="flex items-baseline justify-between">
        <h4 className="font-display text-[1.25rem] tracking-[-0.02em]">Purchase order</h4>
        <span className="t-meta">{order ? `Draft, day ${order.day}` : "Not drafted"}</span>
      </div>

      {!order ? (
        <p className="mt-6 max-w-[30ch] text-[0.9375rem] text-ink-2">
          Move the day slider until items fall below their reorder point, then draft an order from the recommendations.
        </p>
      ) : (
        <>
          {stale && (
            <p className="mt-4 rounded-[var(--r-xs)] border border-dashed border-line-strong px-3 py-2 text-[0.8125rem] text-ink-2" role="status">
              Stock has moved since this draft. Draft again to refresh it.
            </p>
          )}
          <ul className="mt-5 flex-1 divide-y divide-line border-y border-line">
            <AnimatePresence initial={!reduced}>
              {bySku.map((row, i) => (
                <motion.li
                  key={`${order.day}-${row.sku}`}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduced ? 0 : i * 0.06, duration: reduced ? 0 : 0.4, ease: ease.outExpo }}
                  className="py-3"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[0.875rem]">{row.sku}</span>
                    <span className="font-mono text-[0.875rem] tabular-nums text-lime">{row.total} units</span>
                  </div>
                  <p className="mt-0.5 text-[0.8125rem] text-ink-2">
                    {row.lines.map((l) => `${l.store} ${l.topUp}`).join(", ")}
                  </p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-[0.9375rem] text-ink-2">Total</span>
            <span className="font-display text-[1.75rem] tabular-nums">{total}</span>
          </div>
        </>
      )}
      <p className="mt-4 text-[0.75rem] text-ink-2">Demo only. Nothing is sent.</p>
    </section>
  );
}

