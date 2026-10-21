"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { applyDeltas, fillFirstPlan, safeDeliveryQuantity, type Position } from "./placement-model";

/*
 * Planned versus safe delivery, then two-pass placement at the store.
 * One fictional product in three positions; the model is placement-model.ts.
 */

const CAPACITY = 8;
const REQUESTED = 10;
const TARGET = 20;
const SNAPSHOT: Position[] = [
  { id: "P-01", capacity: CAPACITY, qty: 3, active: true },
  { id: "P-02", capacity: CAPACITY, qty: 2, active: true },
  { id: "P-03", capacity: CAPACITY, qty: 5, active: true },
];

function Stepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const b = "grid size-9 place-items-center rounded-[var(--r-xs)] border border-line-strong hover:border-ink-2 disabled:opacity-30";
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={label}>
      <button type="button" className={b} aria-label={`Decrease ${label}`} disabled={value <= 0} onClick={() => onChange(value - 1)}>
        <Minus size={14} aria-hidden />
      </button>
      <span className="w-6 text-center font-mono tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" className={b} aria-label={`Increase ${label}`} disabled={value >= CAPACITY} onClick={() => onChange(value + 1)}>
        <Plus size={14} aria-hidden />
      </button>
    </div>
  );
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[0.875rem]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[var(--c-lime)]" />
      {children}
    </label>
  );
}

export function StockPlacement() {
  const [live, setLive] = useState(() => SNAPSHOT.map((p) => p.qty + (p.id === "P-03" ? 1 : 0)));
  const [refilled, setRefilled] = useState(true);
  const [deactivated, setDeactivated] = useState(false);

  const atCompletion = SNAPSHOT.map((p, i) => ({ ...p, qty: live[i] }));
  const guard = safeDeliveryQuantity(REQUESTED, TARGET, atCompletion);
  const deltas = fillFirstPlan(guard.safe, atCompletion);

  const atDelivery = atCompletion.map((p) => ({
    ...p,
    qty: refilled && p.id === "P-01" ? CAPACITY : p.qty,
    active: !(deactivated && p.id === "P-02"),
  }));
  const result = applyDeltas(deltas, atDelivery);

  return (
    <div className="rounded-[var(--r-md)] bg-graphite p-4 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="sp-a" className="rounded-[var(--r-sm)] bg-void p-4">
          <p id="sp-a" className="t-meta">
            1 · Completion: check the plan against live stock
          </p>
          <p className="mt-2 text-[0.875rem] text-ink-2">
            The plan was made from a cached snapshot. Change the live quantities to see the delivery shrink to what is safe.
          </p>
          <ul className="mt-4 space-y-2">
            {atCompletion.map((p, i) => (
              <li key={p.id} className="flex items-center justify-between gap-3 text-[0.875rem]">
                <span>
                  {p.id} <span className="text-ink-2">· snapshot {SNAPSHOT[i].qty} · live</span>
                </span>
                <Stepper value={live[i]} label={`${p.id} live quantity`} onChange={(v) => setLive((l) => l.map((x, j) => (j === i ? v : x)))} />
              </li>
            ))}
          </ul>
          <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
            {[
              { k: "Planned", v: REQUESTED },
              { k: "Shelf room", v: guard.capacityRoom },
              { k: "Target room", v: guard.targetRoom },
              { k: "Safe", v: guard.safe, lead: true },
            ].map((m) => (
              <div key={m.k} className="rounded-[var(--r-xs)] bg-graphite py-2">
                <dt className="t-meta text-[0.625rem]">{m.k}</dt>
                <dd className={`font-display text-[1.375rem] tabular-nums ${m.lead ? "text-lime" : ""}`}>{m.v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 font-mono text-[0.75rem] text-ink-2">
            safe = min(planned, shelf room, target {TARGET} − live {guard.live}) = {guard.safe}
          </p>
          <p className="mt-2 text-[0.8125rem]">
            Queued deltas:{" "}
            <span className="font-mono text-lime">
              {Object.entries(deltas).length
                ? Object.entries(deltas)
                    .map(([p, n]) => `+${n} → ${p}`)
                    .join(", ")
                : "none"}
            </span>
          </p>
        </section>

        <section aria-labelledby="sp-b" className="rounded-[var(--r-sm)] bg-void p-4">
          <p id="sp-b" className="t-meta">
            2 · Delivery: the shelf changed while the job was queued
          </p>
          <div className="mt-2">
            <Check checked={refilled} onChange={setRefilled}>
              P-01 was filled to capacity by hand
            </Check>
            <Check checked={deactivated} onChange={setDeactivated}>
              P-02 was deactivated
            </Check>
          </div>
          <ul className="mt-3 space-y-3" aria-label="Positions after delivery">
            {atDelivery.map((p) => {
              const placed = result.placed[p.id] ?? 0;
              const held = result.held[p.id] ?? 0;
              return (
                <li key={p.id} className="grid grid-cols-[3rem_1fr_6.5rem] items-center gap-3 text-[0.8125rem]">
                  <span className={p.active ? "" : "text-ink-2 line-through"}>{p.id}</span>
                  <span className="flex h-4 overflow-hidden rounded-[var(--r-xs)] bg-graphite" aria-hidden>
                    <span className="bg-ink-2/50" style={{ width: `${(p.qty / CAPACITY) * 100}%` }} />
                    <span className="bg-lime" style={{ width: `${(placed / CAPACITY) * 100}%` }} />
                  </span>
                  <span className="text-right tabular-nums">
                    {p.qty}
                    {placed > 0 && <span className="text-lime"> +{placed}</span>}
                    {held > 0 && <span className="text-ice"> · {held} held</span>}
                    <span className="sr-only"> of {CAPACITY}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className={`mt-4 text-[0.875rem] ${result.unplaced ? "text-[var(--c-warn)]" : "text-ink-2"}`}>
            {result.unplaced
              ? `${result.unplaced} unit${result.unplaced === 1 ? "" : "s"} could not be placed. An issue is recorded for follow-up instead of the units disappearing.`
              : "Every delivered unit is accounted for."}
          </p>
          <ol className="mt-3 space-y-1 font-mono text-[0.75rem] text-ink-2" aria-label="Placement steps">
            {result.log.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
