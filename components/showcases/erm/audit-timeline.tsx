"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

/*
 * Synthetic demo of field-level change events and quarterly snapshots, using
 * confirmed behaviour only: edits are compared field by field and each
 * difference is recorded with old and new values; deletions are soft; each risk
 * keeps one snapshot per quarter (overwritten within the quarter); past
 * quarters are read-only. Field names and values are fictional.
 */

type Fields = {
  likelihood: number;
  impact: number;
  controlDescription: string;
  controlFrequency: string;
  controlDeleted: boolean;
};

const Q1_SNAPSHOT: Fields = {
  likelihood: 2,
  impact: 3,
  controlDescription: "Quarterly policy review",
  controlFrequency: "Quarterly",
  controlDeleted: false,
};

const LABELS: Record<keyof Fields, string> = {
  likelihood: "Likelihood",
  impact: "Impact",
  controlDescription: "Control description",
  controlFrequency: "Control frequency",
  controlDeleted: "Control deleted",
};

type ChangeEvent = { seq: number; field: keyof Fields; from: string; to: string };

const EDITS: { label: string; patch: Partial<Fields> }[] = [
  { label: "Raise likelihood to 3", patch: { likelihood: 3 } },
  { label: "Update the control description", patch: { controlDescription: "Monthly policy review with sign-off" } },
  { label: "Change frequency to monthly", patch: { controlFrequency: "Monthly" } },
  { label: "Delete the control (soft)", patch: { controlDeleted: true } },
];

const show = (v: Fields[keyof Fields]) => (typeof v === "boolean" ? (v ? "true" : "false") : String(v));

/** Compare old and new field by field; one event per difference. */
function diff(before: Fields, after: Fields, start: number): ChangeEvent[] {
  return (Object.keys(LABELS) as (keyof Fields)[])
    .filter((k) => before[k] !== after[k])
    .map((k, i) => ({ seq: start + i, field: k, from: show(before[k]), to: show(after[k]) }));
}

export function AuditTimeline() {
  const [current, setCurrent] = useState<Fields>(Q1_SNAPSHOT);
  const [events, setEvents] = useState<ChangeEvent[]>([]);
  const [view, setView] = useState<"Q1 2026" | "Q2 2026">("Q2 2026");
  const shown = view === "Q1 2026" ? Q1_SNAPSHOT : current;
  const readOnly = view === "Q1 2026";

  const edit = (patch: Partial<Fields>) => {
    const next = { ...current, ...patch };
    const changes = diff(current, next, events.length + 1);
    if (!changes.length) return;
    setCurrent(next);
    setEvents((ev) => [...ev, ...changes]);
  };

  return (
    <div className="rounded-[var(--r-md)] bg-graphite p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Snapshot" className="flex flex-wrap gap-1.5">
          {(["Q1 2026", "Q2 2026"] as const).map((q) => (
            <button
              key={q}
              type="button"
              role="radio"
              aria-checked={view === q}
              onClick={() => setView(q)}
              className={`min-h-11 rounded-[var(--r-xs)] px-3 text-[0.875rem] transition-colors ${
                view === q ? "bg-lime text-[var(--c-lime-ink)]" : "border border-line-strong text-ink-2 hover:text-ink"
              }`}
            >
              {q}
              {q === "Q2 2026" ? " (current)" : ""}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setCurrent(Q1_SNAPSHOT);
            setEvents([]);
          }}
          className="inline-flex min-h-11 items-center gap-2 px-2 text-[0.875rem] text-ink-2 hover:text-ink"
        >
          <RotateCcw size={15} aria-hidden /> Reset
        </button>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="rounded-[var(--r-sm)] bg-void p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="t-meta">SR-04 · Regulatory change</p>
            <p className={`text-[0.8125rem] ${readOnly ? "text-ice" : "text-ink-2"}`}>{readOnly ? "Read-only snapshot" : "Editable"}</p>
          </div>
          <dl className="mt-3 divide-y divide-line text-[0.9375rem]">
            {(Object.keys(LABELS) as (keyof Fields)[]).map((k) => (
              <div key={k} className="grid grid-cols-[9.5rem_1fr] gap-3 py-2">
                <dt className="text-ink-2">{LABELS[k]}</dt>
                <dd className={k === "controlDeleted" && shown[k] ? "text-[var(--c-warn)]" : ""}>{show(shown[k])}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            {EDITS.map((e) => (
              <button
                key={e.label}
                type="button"
                disabled={readOnly}
                onClick={() => edit(e.patch)}
                className="min-h-11 rounded-[var(--r-sm)] border border-line-strong px-3 text-[0.8125rem] transition-colors hover:border-ink-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {e.label}
              </button>
            ))}
          </div>
          {readOnly && <p className="mt-3 text-[0.875rem] text-ink-2">Past quarters can be viewed, not edited.</p>}
        </div>

        <div className="rounded-[var(--r-sm)] bg-void p-4">
          <p className="t-meta">Change events</p>
          {events.length === 0 ? (
            <p className="mt-2 text-[0.875rem] text-ink-2">No edits yet. Each edit records one event per changed field.</p>
          ) : (
            <ol aria-live="polite" className="mt-2 space-y-2 text-[0.875rem]">
              {events.map((e) => (
                <li key={e.seq} className="rounded-[var(--r-xs)] bg-graphite px-3 py-2">
                  <span className="font-mono text-[0.75rem] text-ink-2">#{String(e.seq).padStart(2, "0")} · Q2 2026 · </span>
                  {LABELS[e.field]}
                  <span className="mt-0.5 block font-mono text-[0.75rem]">
                    <span className="text-ink-2 line-through decoration-[var(--c-warn)]/70">{e.from}</span>
                    <span className="mx-1.5 text-ink-2">→</span>
                    <span className="text-lime">{e.to}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-4 text-[0.8125rem] text-ink-2">
            The Q2 snapshot is overwritten on each edit within the quarter; the Q1 snapshot stays as it was.
          </p>
        </div>
      </div>
    </div>
  );
}
