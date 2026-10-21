"use client";

import { useId, useState } from "react";
import { DEMO_POLICY, forecast, type ForecastInput } from "./forecast-model";

/*
 * Forecast Explorer: fictional sales inputs run through the demonstration
 * policy in forecast-model.ts. It mirrors the shape of the production
 * calculation, not its constants.
 */

type Key = keyof ForecastInput;
type Control = { key: Key; label: string; min: number; max: number; step: number; format: (v: number) => string };

const CONTROLS: Control[] = [
  { key: "observedRate", label: "Recent sales", min: 0, max: 6, step: 0.1, format: (v) => `${v.toFixed(1)} / day` },
  { key: "availability", label: "Days in stock", min: 0.2, max: 1, step: 0.05, format: (v) => `${Math.round(v * 100)}%` },
  { key: "dispersion", label: "Sales variability", min: 1, max: 4, step: 0.25, format: (v) => (v === 1 ? "Steady (Poisson)" : `${v.toFixed(2)}× Poisson`) },
  { key: "serviceLevel", label: "Service-level target", min: 0.8, max: 0.99, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
  { key: "visitDays", label: "Days to next restock", min: 1, max: 7, step: 1, format: (v) => `${v} day${v === 1 ? "" : "s"}` },
  { key: "shelfCapacity", label: "Shelf capacity", min: 6, max: 40, step: 1, format: (v) => `${v} units` },
  { key: "currentStock", label: "On the shelf now", min: 0, max: 40, step: 1, format: (v) => `${v} units` },
];

const INITIAL: ForecastInput = {
  observedRate: 1.8,
  availability: 0.6,
  dispersion: 1.5,
  serviceLevel: 0.95,
  visitDays: 3,
  shelfCapacity: 24,
  currentStock: 6,
};

export function ForecastExplorer() {
  const [input, setInput] = useState<ForecastInput>(INITIAL);
  const id = useId();
  const stock = Math.min(input.currentStock, input.shelfCapacity);
  const r = forecast({ ...input, currentStock: stock });
  const scale = (v: number) => `${(Math.min(v, input.shelfCapacity) / input.shelfCapacity) * 100}%`;

  return (
    <div className="grid gap-6 rounded-[var(--r-md)] bg-graphite p-4 sm:p-6">
      <fieldset className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
        <legend className="t-meta mb-2">Fictional product · inputs</legend>
        {CONTROLS.map((c) => {
          const max = c.key === "currentStock" ? input.shelfCapacity : c.max;
          return (
            <div key={c.key}>
              <div className="flex items-baseline justify-between gap-3 text-[0.875rem]">
                <label htmlFor={`${id}-${c.key}`}>{c.label}</label>
                <output htmlFor={`${id}-${c.key}`} className="tabular-nums text-ink-2">
                  {c.format(c.key === "currentStock" ? stock : input[c.key])}
                </output>
              </div>
              <input
                id={`${id}-${c.key}`}
                type="range"
                className="ops-range w-full"
                min={c.min}
                max={max}
                step={c.step}
                value={c.key === "currentStock" ? stock : input[c.key]}
                onChange={(e) => setInput((s) => ({ ...s, [c.key]: Number(e.target.value) }))}
              />
            </div>
          );
        })}
      </fieldset>

      <div className="flex flex-col gap-4">
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { k: "Daily demand", v: r.demand.toFixed(2), sub: r.uplift > 1.001 ? `×${r.uplift.toFixed(2)} for stockouts` : "no stockout correction" },
            { k: "Reorder point", v: String(r.reorderPoint), sub: `covers ${input.visitDays} day${input.visitDays === 1 ? "" : "s"}` },
            { k: "Target", v: String(r.target), sub: r.capped ? "capped at shelf capacity" : `covers ${r.coverDays} days` },
            { k: "Recommended", v: r.recommended > 0 ? `+${r.recommended}` : "0", sub: r.triggered ? "below reorder point" : "no top-up needed", lead: true },
          ].map((m) => (
            <div key={m.k} className="rounded-[var(--r-sm)] bg-void p-3">
              <dt className="t-meta">{m.k}</dt>
              <dd className={`mt-1 font-display text-[1.75rem] leading-none tabular-nums ${m.lead && r.recommended > 0 ? "text-lime" : ""}`}>{m.v}</dd>
              <dd className="mt-1.5 text-[0.75rem] text-ink-2">{m.sub}</dd>
            </div>
          ))}
        </dl>

        <figure className="rounded-[var(--r-sm)] bg-void p-4">
          <figcaption className="t-meta">Shelf, 0 to {input.shelfCapacity} units</figcaption>
          <div
            className="relative mt-8 h-3 rounded-full bg-graphite"
            role="img"
            aria-label={`On the shelf ${stock}, reorder point ${r.reorderPoint}, target ${r.target}, capacity ${input.shelfCapacity}${
              r.recommended ? `, top up by ${r.recommended}` : ""
            }.`}
          >
            <span className="absolute inset-y-0 left-0 rounded-full bg-ink-2/60" style={{ width: scale(stock) }} />
            {r.recommended > 0 && (
              <span className="absolute inset-y-0 rounded-r-full bg-lime/80" style={{ left: scale(stock), width: scale(r.recommended) }} />
            )}
            <Marker at={scale(r.reorderPoint)} label="Reorder" tone="text-ice" above />
            <Marker at={scale(r.target)} label="Target" tone="text-lime" />
          </div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-1 text-[0.75rem] text-ink-2">
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-2 rounded-full bg-ink-2/60" /> On the shelf
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-2 rounded-full bg-lime/80" /> Recommended top-up
            </span>
          </div>
        </figure>

        <div className="grid gap-3 md:grid-cols-2">
          <p className="rounded-[var(--r-sm)] bg-void p-4 text-[0.875rem]">
            <span className="t-meta mb-1 block text-ice">How it was calculated</span>
            {input.observedRate.toFixed(1)} sold per day, but the product was only on sale {Math.round(input.availability * 100)}% of days, so demand is
            estimated at {r.demand.toFixed(2)} per in-stock day. With variance {r.variance.toFixed(2)} and z = {r.z.toFixed(2)} for a{" "}
            {Math.round(input.serviceLevel * 100)}% service level, the shelf should hold {r.reorderPoint} to last until the visit in {input.visitDays}{" "}
            day{input.visitDays === 1 ? "" : "s"}, and is filled to {r.target} to cover {r.coverDays} days.
          </p>
          <p className="rounded-[var(--r-sm)] bg-void p-4 text-[0.875rem]">
            <span className="t-meta mb-1 block text-ice">Against a plain average</span>
            Averaging sales over calendar days would aim for {r.naiveTarget} units, {r.target - r.naiveTarget >= 0 ? `${r.target - r.naiveTarget} fewer` : `${r.naiveTarget - r.target} more`}{" "}
            than this policy.{" "}
            {r.uplift > 1.001
              ? "The gap comes from the days the product could not sell because it was out of stock, plus the safety stock"
              : "With no stockouts in the window, the gap is the safety stock"}{" "}
            ({r.safetyStock} unit{r.safetyStock === 1 ? "" : "s"}).
          </p>
        </div>
        <p className="font-mono text-[0.75rem] text-ink-2">
          ROP = ⌈μR + z√(σ²R)⌉ · target = ⌈μP + z√(σ²P)⌉, P = R + {DEMO_POLICY.bufferDays} · demo policy values, not production constants
        </p>
      </div>
    </div>
  );
}

function Marker({ at, label, tone, above }: { at: string; label: string; tone: string; above?: boolean }) {
  return (
    <span aria-hidden className={`absolute inset-y-[-6px] w-0.5 -translate-x-1/2 bg-current ${tone}`} style={{ left: at }}>
      <span className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.6875rem] ${above ? "bottom-full mb-1" : "top-full mt-1"}`}>
        {label}
      </span>
    </span>
  );
}
