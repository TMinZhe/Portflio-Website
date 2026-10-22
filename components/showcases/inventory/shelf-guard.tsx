"use client";

import { useId, useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import { safeDeliveryQuantity } from "./placement-model";

/*
 * Beginner view of the delivery guardrail: a plan made from cached data, a
 * shelf that fills up before the delivery, and the smaller, safe quantity the
 * system actually delivers. Uses safeDeliveryQuantity from placement-model.ts.
 */

const CAPACITY = 12;
const SNAPSHOT = 4;
const PLANNED = CAPACITY - SNAPSHOT;

function Shelf({ base, added, extra, label, byHand }: { base: number; added: number; extra?: number; label: string; byHand?: boolean }) {
  return (
    <div>
      <p className="t-meta">{label}</p>
      <div className="mt-2 flex h-8 gap-1" role="img" aria-label={`${base + added} of ${CAPACITY} units${extra ? `, ${extra} would not fit` : ""}`}>
        {Array.from({ length: CAPACITY + (extra ?? 0) }, (_, n) => (
          <span
            key={n}
            className={`flex-1 rounded-[3px] ${
              n >= CAPACITY ? "border border-dashed border-[var(--c-warn)] bg-[var(--c-warn)]/20" : n < base ? "bg-ink-2/60" : n < base + added ? (byHand ? "bg-ice/70" : "bg-lime") : "bg-elevated"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function ShelfGuard() {
  const id = useId();
  const [step, setStep] = useState(0);
  const [restocked, setRestocked] = useState(5);
  const live = SNAPSHOT + restocked;
  const g = safeDeliveryQuantity(PLANNED, CAPACITY, [{ id: "P-01", capacity: CAPACITY, qty: live, active: true }]);
  const blind = live + PLANNED - CAPACITY;

  const steps = [
    {
      title: "The plan is made from the last snapshot",
      text: `Head office's last snapshot shows ${SNAPSHOT} of ${CAPACITY} units on the shelf, so the top-up plan is to deliver ${PLANNED}.`,
    },
    {
      title: "The shelf changes before the delivery",
      text: `While the delivery is still pending, staff restock the shelf by hand. The plan doesn't know.`,
    },
    {
      title: "The system re-checks the shelf, then delivers only what fits",
      text:
        g.safe < PLANNED
          ? `At delivery it reads the shelf again: ${live} units, so there's room for ${g.safe}. It delivers ${g.safe} instead of ${PLANNED}, and the other ${PLANNED - g.safe} stay in the warehouse.`
          : `At delivery it reads the shelf again: there's still room for all ${PLANNED}, so the plan goes ahead unchanged.`,
    },
  ];

  return (
    <div className="rounded-[var(--r-md)] bg-graphite p-4 sm:p-6">
      <ol className="grid grid-cols-3 gap-1.5" aria-label="Steps">
        {steps.map((s, n) => (
          <li key={s.title}>
            <button
              type="button"
              onClick={() => setStep(n)}
              aria-current={n === step ? "step" : undefined}
              aria-label={`Step ${n + 1}: ${s.title}`}
              className={`min-h-11 w-full rounded-[var(--r-xs)] text-[0.8125rem] transition-colors ${
                n === step ? "bg-lime font-medium text-[var(--c-lime-ink)]" : n < step ? "bg-elevated" : "border border-line-strong text-ink-2 hover:text-ink"
              }`}
            >
              {n + 1}
            </button>
          </li>
        ))}
      </ol>

      <div aria-live="polite" className="mt-5 min-h-[6.5rem]">
        <p className="t-meta">
          Step {step + 1} of {steps.length}
        </p>
        <h4 className="mt-1 text-[1.25rem] font-medium leading-snug">{steps[step].title}</h4>
        <p className="mt-2 max-w-[60ch] text-ink-2">{steps[step].text}</p>
      </div>

      <div className="mt-4 space-y-5 rounded-[var(--r-sm)] bg-void p-4">
        {step === 0 && <Shelf base={SNAPSHOT} added={0} label={`Shelf in the snapshot · ${SNAPSHOT} of ${CAPACITY}`} />}
        {step >= 1 && <Shelf base={SNAPSHOT} added={restocked} byHand label={`Shelf now · ${live} of ${CAPACITY} (${restocked} added by hand)`} />}
        {step >= 1 && (
          <div>
            <div className="flex items-baseline justify-between gap-3 text-[0.875rem]">
              <label htmlFor={`${id}-r`}>Units added by hand</label>
              <output htmlFor={`${id}-r`} className="tabular-nums text-ink-2">
                {restocked}
              </output>
            </div>
            <input id={`${id}-r`} type="range" className="ops-range w-full" min={0} max={PLANNED} value={restocked} onChange={(e) => setRestocked(Number(e.target.value))} />
          </div>
        )}
        {step === 2 && (
          <>
            <dl className="grid grid-cols-3 gap-2 text-center">
              {[
                { k: "Planned", v: PLANNED },
                { k: "Space now", v: g.capacityRoom },
                { k: "Delivered", v: g.safe, lead: true },
              ].map((m) => (
                <div key={m.k} className={`rounded-[var(--r-xs)] bg-graphite py-3 ${m.lead ? "ring-1 ring-lime" : ""}`}>
                  <dt className="t-meta">{m.k}</dt>
                  <dd className={`font-display text-[2rem] leading-none tabular-nums ${m.lead ? "text-lime" : ""}`}>{m.v}</dd>
                </div>
              ))}
            </dl>
            <Shelf base={live} added={g.safe} label={`After a safe delivery · ${live + g.safe} of ${CAPACITY}`} />
            {blind > 0 && (
              <Shelf base={live} added={CAPACITY - live} extra={blind} label={`If the plan were followed blindly · ${live + PLANNED} on a ${CAPACITY}-unit shelf`} />
            )}
            <p className="flex items-start gap-2 font-medium text-lime">
              <Check size={18} aria-hidden className="mt-0.5 shrink-0" />
              {blind > 0
                ? `The shelf is filled, not overfilled: ${blind} unit${blind === 1 ? "" : "s"} that wouldn't fit stay in the warehouse instead.`
                : "Nothing changed enough to matter, so the full plan is delivered."}
            </p>
          </>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStep((n) => Math.max(0, n - 1))}
          disabled={step === 0}
          className="inline-flex min-h-11 items-center gap-2 rounded-[var(--r-sm)] border border-line-strong px-4 text-[0.875rem] hover:border-ink-2 disabled:opacity-40"
        >
          <ArrowLeft size={15} aria-hidden /> Back
        </button>
        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((n) => n + 1)}
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--r-sm)] bg-lime px-5 text-[0.875rem] font-medium text-[var(--c-lime-ink)]"
          >
            Next <ArrowRight size={15} aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setStep(0);
              setRestocked(5);
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--r-sm)] bg-lime px-5 text-[0.875rem] font-medium text-[var(--c-lime-ink)]"
          >
            <RotateCcw size={15} aria-hidden /> Restart
          </button>
        )}
      </div>
    </div>
  );
}
