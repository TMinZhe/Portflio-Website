"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

/*
 * Synthetic demo of event-derived approval state, using only confirmed rules:
 * building manager → director → ERM administrator; the director's review needs
 * the manager's sign-off for that building; the administrator sees a roll-up.
 * Sign-off validity windows and self-managed buildings exist in the real app
 * but are not modelled here until their exact rules are confirmed.
 */

const BUILDINGS = ["Building A", "Building B", "Building C"] as const;
type Building = (typeof BUILDINGS)[number];
type Role = "Manager" | "Director";
type SignOff = { seq: number; building: Building; role: Role };
type Status = "Awaiting manager" | "Ready for director" | "Complete";

/** The only source of truth: state is computed from the sign-off history. */
function derive(events: SignOff[], b: Building): Status {
  const manager = events.some((e) => e.building === b && e.role === "Manager");
  const director = events.some((e) => e.building === b && e.role === "Director");
  return manager && director ? "Complete" : manager ? "Ready for director" : "Awaiting manager";
}

const tone: Record<Status, string> = {
  "Awaiting manager": "text-ink-2",
  "Ready for director": "text-ice",
  Complete: "text-lime",
};

export function SignoffWorkflow() {
  const [events, setEvents] = useState<SignOff[]>([]);
  const [building, setBuilding] = useState<Building>("Building A");
  const [notice, setNotice] = useState<string | null>(null);
  const status = derive(events, building);
  const complete = BUILDINGS.filter((b) => derive(events, b) === "Complete").length;

  const sign = (role: Role) => {
    if (role === "Manager" && status !== "Awaiting manager") {
      setNotice(`${building}: the manager has already signed off.`);
      return;
    }
    if (role === "Director" && status === "Awaiting manager") {
      setNotice(`Blocked: ${building} has no manager sign-off yet, so the director can't complete the review. No event was recorded.`);
      return;
    }
    if (role === "Director" && status === "Complete") {
      setNotice(`${building}: the review is already complete.`);
      return;
    }
    setEvents((ev) => [...ev, { seq: ev.length + 1, building, role }]);
    setNotice(null);
  };

  const step = (label: string, state: "done" | "ready" | "waiting") => (
    <li className="flex items-center gap-3">
      <span
        aria-hidden
        className={`grid size-7 shrink-0 place-items-center rounded-full text-[0.75rem] font-medium ${
          state === "done" ? "bg-lime text-[var(--c-lime-ink)]" : state === "ready" ? "ring-1 ring-ice text-ice" : "ring-1 ring-line-strong text-ink-2"
        }`}
      >
        {state === "done" ? "✓" : "·"}
      </span>
      <span className={state === "waiting" ? "text-ink-2" : ""}>{label}</span>
      <span className="sr-only">{state === "done" ? "signed off" : state === "ready" ? "can sign now" : "waiting"}</span>
    </li>
  );

  return (
    <div className="rounded-[var(--r-md)] bg-graphite p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Building" className="flex flex-wrap gap-1.5">
          {BUILDINGS.map((b) => (
            <button
              key={b}
              type="button"
              role="radio"
              aria-checked={building === b}
              onClick={() => {
                setBuilding(b);
                setNotice(null);
              }}
              className={`min-h-11 rounded-[var(--r-xs)] px-3 text-[0.875rem] transition-colors ${
                building === b ? "bg-lime text-[var(--c-lime-ink)]" : "border border-line-strong text-ink-2 hover:text-ink"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setEvents([]);
            setNotice(null);
          }}
          className="inline-flex min-h-11 items-center gap-2 px-2 text-[0.875rem] text-ink-2 hover:text-ink"
        >
          <RotateCcw size={15} aria-hidden /> Reset
        </button>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="rounded-[var(--r-sm)] bg-void p-4">
          <p className="t-meta">{building}</p>
          <p className={`mt-1 font-display text-[1.375rem] ${tone[status]}`}>{status}</p>
          <ol className="mt-4 space-y-3 text-[0.9375rem]">
            {step("Building manager reviews controls", status === "Awaiting manager" ? "ready" : "done")}
            {step("Director completes the review", status === "Complete" ? "done" : status === "Ready for director" ? "ready" : "waiting")}
          </ol>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => sign("Manager")}
              className="min-h-11 rounded-[var(--r-sm)] border border-line-strong px-4 text-[0.875rem] transition-colors hover:border-ink-2"
            >
              Manager signs off
            </button>
            <button
              type="button"
              onClick={() => sign("Director")}
              className="min-h-11 rounded-[var(--r-sm)] border border-line-strong px-4 text-[0.875rem] transition-colors hover:border-ink-2"
            >
              Director approves
            </button>
          </div>
          <p aria-live="polite" className="mt-3 min-h-[2.75rem] text-[0.875rem] text-[var(--c-warn)]">
            {notice}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[var(--r-sm)] bg-void p-4">
            <p className="t-meta">Sign-off events (append-only)</p>
            {events.length === 0 ? (
              <p className="mt-2 text-[0.875rem] text-ink-2">No events yet.</p>
            ) : (
              <ol className="mt-2 space-y-1 font-mono text-[0.75rem] text-ink-2">
                {events.map((e) => (
                  <li key={e.seq}>
                    <span className="text-ink">#{String(e.seq).padStart(2, "0")}</span> {e.building} · {e.role} signed off
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div className="rounded-[var(--r-sm)] bg-void p-4">
            <p className="t-meta">ERM administrator roll-up</p>
            <p className="mt-1 text-[0.9375rem]">
              {complete} of {BUILDINGS.length} buildings complete
            </p>
            <ul className="mt-2 space-y-1 text-[0.875rem]">
              {BUILDINGS.map((b) => {
                const s = derive(events, b);
                return (
                  <li key={b} className="flex justify-between gap-4">
                    <span className="text-ink-2">{b}</span>
                    <span className={tone[s]}>{s}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      <p className="mt-4 font-mono text-[0.75rem] text-ink-2">status = derive(signOffEvents, building), never stored, always recomputed.</p>
    </div>
  );
}
