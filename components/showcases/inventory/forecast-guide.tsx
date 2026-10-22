"use client";

import { useId, useState } from "react";
import { DEMO_POLICY, forecast, type ForecastInput } from "./forecast-model";

/*
 * Beginner view of the forecast: three scenarios, three primary controls, one
 * recommendation in plain English. Advanced settings and the calculation are
 * opt-in. Demo policy values only; see forecast-model.ts.
 */

type ScenarioId = "normal" | "stockouts" | "bulk";

const BASE = { dispersion: 1.5, serviceLevel: 0.95, visitDays: 3, shelfCapacity: 30 };
const SCENARIOS: Record<ScenarioId, { label: string; input: ForecastInput }> = {
  normal: { label: "Normal sales", input: { ...BASE, observedRate: 2, availability: 1, bulkBasket: 0, currentStock: 4 } },
  stockouts: { label: "Often out of stock", input: { ...BASE, observedRate: 1.5, availability: 0.5, bulkBasket: 0, currentStock: 2 } },
  bulk: { label: "One bulk purchase", input: { ...BASE, observedRate: 1, availability: 1, bulkBasket: 18, currentStock: 3 } },
};

type Key = keyof ForecastInput;
type Control = { key: Key; label: string; min: number; max: number; step: number; format: (v: number) => string };

const PRIMARY: Control[] = [
  { key: "observedRate", label: "Everyday sales", min: 0.2, max: 5, step: 0.1, format: (v) => `${v.toFixed(1)} a day` },
  { key: "availability", label: "Days the product was in stock", min: 0.2, max: 1, step: 0.05, format: (v) => `${Math.round(v * 100)}%` },
  { key: "visitDays", label: "Days until the next restock", min: 1, max: 7, step: 1, format: (v) => `${v} day${v === 1 ? "" : "s"}` },
];
const ADVANCED: Control[] = [
  { key: "bulkBasket", label: "One bulk basket in the last 14 days", min: 0, max: 30, step: 1, format: (v) => (v ? `${v} units` : "none") },
  { key: "currentStock", label: "On the shelf now", min: 0, max: 40, step: 1, format: (v) => `${v} units` },
  { key: "shelfCapacity", label: "Shelf capacity", min: 6, max: 40, step: 1, format: (v) => `${v} units` },
  { key: "serviceLevel", label: "Chance of not running out", min: 0.8, max: 0.99, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
  { key: "dispersion", label: "How much daily sales swing", min: 1, max: 4, step: 0.25, format: (v) => (v === 1 ? "steady" : `${v.toFixed(2)}× steady`) },
];

function Slider({ c, value, max, onChange, id }: { c: Control; value: number; max?: number; onChange: (v: number) => void; id: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-[0.875rem]">
        <label htmlFor={id}>{c.label}</label>
        <output htmlFor={id} className="tabular-nums text-ink-2">
          {c.format(value)}
        </output>
      </div>
      <input id={id} type="range" className="ops-range w-full" min={c.min} max={max ?? c.max} step={c.step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export function ForecastGuide() {
  const id = useId();
  const [scenario, setScenario] = useState<ScenarioId>("stockouts");
  const [input, setInput] = useState<ForecastInput>(SCENARIOS.stockouts.input);
  const stock = Math.min(input.currentStock, input.shelfCapacity);
  const i = { ...input, currentStock: stock };
  const r = forecast(i);
  const set = (k: Key, v: number) => setInput((s) => ({ ...s, [k]: v }));
  const pick = (s: ScenarioId) => {
    setScenario(s);
    setInput(SCENARIOS[s].input);
  };

  // Comparisons isolate one effect at a time, and only appear when they differ.
  const bulk = i.bulkBasket ?? 0;
  const noCorrection = i.availability < 1 ? forecast({ ...i, availability: 1 }) : null;
  const bulkInFull = bulk > DEMO_POLICY.basketCap ? forecast({ ...i, observedRate: r.naiveRate, bulkBasket: 0 }) : null;
  const shortShelf = r.shelfDays < i.visitDays;

  const explain: string[] = [];
  if (i.availability < 1)
    explain.push(
      `Customers couldn't buy this product on ${Math.round((1 - i.availability) * 100)}% of days because it was out of stock, so recorded sales understate demand. The system estimates ${r.demand.toFixed(1)} a day instead of the recorded ${(r.demand / r.uplift).toFixed(1)}${r.upliftCapped ? ", and caps the correction at double so a patchy history can't inflate it further" : ""}.`,
    );
  if (bulk > DEMO_POLICY.basketCap)
    explain.push(`One customer bought ${bulk} units at once. That basket counts as ${DEMO_POLICY.basketCap}, so a one-off doesn't make the system overstock the shelf.`);
  if (explain.length === 0) explain.push(`Sales are steady at about ${r.demand.toFixed(1)} a day, so the system plans for that plus a small buffer for busier days.`);

  return (
    <div className="rounded-[var(--r-md)] bg-graphite p-4 sm:p-6">
      <div role="radiogroup" aria-label="Scenario" className="grid gap-1.5 sm:grid-cols-3">
        {(Object.keys(SCENARIOS) as ScenarioId[]).map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={scenario === s}
            onClick={() => pick(s)}
            className={`min-h-11 rounded-[var(--r-xs)] px-3 text-[0.875rem] transition-colors ${
              scenario === s ? "bg-lime font-medium text-[var(--c-lime-ink)]" : "border border-line-strong text-ink-2 hover:text-ink"
            }`}
          >
            {SCENARIOS[s].label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1.1fr_1fr]">
        <div className="rounded-[var(--r-sm)] bg-void p-4" aria-live="polite">
          <p className="t-meta">Recommended top-up</p>
          <p className="mt-1 flex items-baseline gap-3">
            <span className={`font-display text-[3rem] leading-none tabular-nums ${r.recommended > 0 ? "text-lime" : ""}`}>
              {r.recommended > 0 ? `+${r.recommended}` : "0"}
            </span>
            <span className="text-ink-2">units</span>
          </p>
          <dl className="mt-4 grid grid-cols-3 gap-2 text-[0.8125rem]">
            <div>
              <dt className="text-ink-2">On the shelf</dt>
              <dd className="text-[1.125rem] tabular-nums">{stock}</dd>
            </div>
            <div>
              <dt className="text-ink-2">Demand a day</dt>
              <dd className="text-[1.125rem] tabular-nums">{r.demand.toFixed(1)}</dd>
            </div>
            <div>
              <dt className="text-ink-2">Fill to</dt>
              <dd className="text-[1.125rem] tabular-nums">{r.target}</dd>
            </div>
          </dl>
          <div className="mt-4 space-y-2 text-[0.9375rem]">
            {explain.map((e) => (
              <p key={e}>{e}</p>
            ))}
            {r.recommended === 0 && <p className="text-ink-2">There is already enough on the shelf to last until the next visit, so no top-up is needed.</p>}
            {shortShelf && (
              <p className="text-[var(--c-warn)]">
                The full shelf holds {i.shelfCapacity}, about {r.shelfDays.toFixed(1)} days of demand, but the next restock is in {i.visitDays} days. The shelf is
                the limit here, not the forecast.
              </p>
            )}
          </div>
          {(noCorrection || bulkInFull) && (
            <div className="mt-4 border-t border-line pt-3 text-[0.875rem] text-ink-2">
              {noCorrection && noCorrection.recommended !== r.recommended && (
                <p>
                  Without the stockout correction it would recommend <span className="text-ink">+{noCorrection.recommended}</span>.
                </p>
              )}
              {bulkInFull && bulkInFull.recommended !== r.recommended && (
                <p>
                  Counting the bulk basket in full, it would recommend <span className="text-ink">+{bulkInFull.recommended}</span>.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {PRIMARY.map((c) => (
            <Slider key={c.key} c={c} id={`${id}-${c.key}`} value={i[c.key] as number} onChange={(v) => set(c.key, v)} />
          ))}
        </div>
      </div>

      <details className="group mt-5 rounded-[var(--r-sm)] bg-void">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-[0.9375rem] [&::-webkit-details-marker]:hidden">
          Advanced settings
          <span aria-hidden className="text-ink-2 transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <div className="grid gap-x-8 gap-y-3 px-4 pb-4 sm:grid-cols-2">
          {ADVANCED.map((c) => (
            <Slider
              key={c.key}
              c={c}
              id={`${id}-${c.key}`}
              value={(c.key === "currentStock" ? stock : i[c.key]) as number}
              max={c.key === "currentStock" ? i.shelfCapacity : undefined}
              onChange={(v) => set(c.key, v)}
            />
          ))}
        </div>
      </details>

      <details className="group mt-2 rounded-[var(--r-sm)] bg-void">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-[0.9375rem] [&::-webkit-details-marker]:hidden">
          View calculation
          <span aria-hidden className="text-ink-2 transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <div className="space-y-2 px-4 pb-4 font-mono text-[0.8125rem] text-ink-2">
          <p>
            demand μ = (everyday {i.observedRate.toFixed(2)} + min(basket {bulk}, {DEMO_POLICY.basketCap}) / {DEMO_POLICY.windowDays}) × min(1 / in-stock{" "}
            {i.availability.toFixed(2)}, {DEMO_POLICY.maxUplift}) = {r.demand.toFixed(2)} a day
          </p>
          <p>
            variance σ² = max(swing {i.dispersion.toFixed(2)}, 1) × μ = {r.variance.toFixed(2)} · z({Math.round(i.serviceLevel * 100)}%) = {r.z.toFixed(2)}
          </p>
          <p>
            reorder point = ⌈μR + z√(σ²R)⌉ = {r.reorderPoint}, R = {i.visitDays} days
          </p>
          <p>
            target = ⌈μP + z√(σ²P)⌉ = {r.target}, P = R + {DEMO_POLICY.bufferDays} = {r.coverDays} days, capped at shelf {i.shelfCapacity}
          </p>
          <p>
            top-up = {r.triggered ? `target ${r.target} − shelf ${stock} = ${r.recommended}` : `0 (shelf ${stock} ≥ reorder point ${r.reorderPoint})`}
          </p>
          <p className="pt-1 font-sans text-ink-2">
            A simplified demonstration with illustrative values. The production calculation also blends several sales windows, sets the service level by
            demand band, and limits the list by warehouse stock and trip capacity. It is statistics and rules, not machine learning.
          </p>
        </div>
      </details>
    </div>
  );
}
