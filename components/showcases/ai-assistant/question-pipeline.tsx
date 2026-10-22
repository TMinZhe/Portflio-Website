"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, CircleCheck, RotateCcw } from "lucide-react";
import { SALES, money, pct } from "./synthetic-data";

/*
 * One question traced through the real pipeline's stages: the model reads it,
 * Python validates it, deterministic code calculates, Python renders. All data
 * is fictional; the structured output follows the shape of the router's JSON.
 */

const Q = "How much did Store A sell last week?";
const W = SALES["Store A"].lastWeek;
const ANSWER = `Store A recorded ${money(W.current.revenue)} in sales from ${W.current.transactions} transactions last week, compared with ${money(
  W.previous.revenue,
)} the week before (${pct(W.current.revenue / W.previous.revenue - 1)}).`;

const ROUTER_JSON = `{
  "intent": "sales_summary",
  "stores": ["Store A"],
  "period": "last week",
  "product": null,
  "is_refinement": false,
  "confidence": "high"
}`;

type Step = { key: string; who: "Operator" | "Language model" | "Python" ; title: string; text: string };

const STEPS: Step[] = [
  { key: "ask", who: "Operator", title: "Ask a question", text: "The operator asks in everyday words instead of finding the right report." },
  { key: "understand", who: "Language model", title: "Understand the request", text: "The local language model reads the question and fills in a small, fixed form: what kind of question, which store, which period." },
  { key: "validate", who: "Python", title: "Check the interpretation", text: "Python checks the model's reading before anything runs. If something is off, it corrects it or asks the operator." },
  { key: "calculate", who: "Python", title: "Retrieve and calculate", text: "A predefined report fetches the records and calculates the totals. The model never produces the figures." },
  { key: "answer", who: "Python", title: "Produce the answer", text: "Most answers are written by Python from the calculated figures. For a few question types, the model narrates figures that were already calculated." },
];

const CHECKS = [
  "Store A is a known store",
  "A sales summary is a supported question",
  "“Last week” is turned into exact start and end dates",
  "Nothing is missing, so no clarifying question is needed",
];

export function QuestionPipeline() {
  const [i, setI] = useState(0);
  const [showJson, setShowJson] = useState(false);
  const step = STEPS[i];
  const done = i === STEPS.length - 1;

  return (
    <div className="rounded-[var(--r-md)] bg-graphite p-4 sm:p-6">
      <ol className="grid grid-cols-5 gap-1.5" aria-label="Pipeline steps">
        {STEPS.map((s, n) => (
          <li key={s.key}>
            <button
              type="button"
              onClick={() => setI(n)}
              aria-current={n === i ? "step" : undefined}
              aria-label={`Step ${n + 1}: ${s.title}`}
              className={`flex min-h-11 w-full flex-col items-center justify-center rounded-[var(--r-xs)] px-1 text-[0.75rem] leading-tight transition-colors ${
                n === i ? "bg-lime font-medium text-[var(--c-lime-ink)]" : n < i ? "bg-elevated" : "border border-line-strong text-ink-2 hover:text-ink"
              }`}
            >
              <span>{n + 1}</span>
              <span className="hidden md:block">{s.title.split(" ")[0]}</span>
            </button>
          </li>
        ))}
      </ol>

      <div aria-live="polite" className="mt-5 min-h-[7rem]">
        <p className="t-meta">
          Step {i + 1} of {STEPS.length} · <span className={step.who === "Language model" ? "text-ice" : step.who === "Python" ? "text-lime" : ""}>{step.who}</span>
        </p>
        <h4 className="mt-1 text-[1.25rem] font-medium leading-snug">{step.title}</h4>
        <p className="mt-2 max-w-[60ch] text-ink-2">{step.text}</p>
      </div>

      <div className="mt-4 min-h-[11rem] rounded-[var(--r-sm)] bg-void p-4">
        {step.key === "ask" && (
          <p className="ml-auto w-fit max-w-full rounded-[var(--r-md)] rounded-br-[var(--r-xs)] bg-elevated px-4 py-3 text-[1.0625rem]">{Q}</p>
        )}
        {step.key === "understand" && (
          <div>
            <dl className="grid gap-2 sm:grid-cols-3">
              {[
                ["Question type", "Sales summary"],
                ["Store", "Store A"],
                ["Period", "Last week"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-[var(--r-xs)] bg-graphite px-3 py-2.5">
                  <dt className="t-meta">{k}</dt>
                  <dd className="mt-0.5 text-[1.0625rem]">{v}</dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              aria-expanded={showJson}
              onClick={() => setShowJson((v) => !v)}
              className="mt-3 min-h-11 text-[0.8125rem] text-ink-2 underline-offset-4 hover:text-ink hover:underline"
            >
              {showJson ? "Hide" : "Show"} the structured output
            </button>
            {showJson && (
              <pre className="mt-1 overflow-x-auto rounded-[var(--r-xs)] bg-graphite p-3 font-mono text-[0.75rem] leading-relaxed text-ink-2">
                <code>{ROUTER_JSON}</code>
              </pre>
            )}
            {showJson && (
              <p className="mt-2 text-[0.75rem] text-ink-2">Simplified to show the shape of the router&apos;s output; the real field names differ.</p>
            )}
          </div>
        )}
        {step.key === "validate" && (
          <ul className="space-y-2">
            {CHECKS.map((c) => (
              <li key={c} className="flex items-start gap-2.5">
                <CircleCheck size={17} aria-hidden className="mt-0.5 shrink-0 text-lime" />
                {c}
              </li>
            ))}
          </ul>
        )}
        {step.key === "calculate" && (
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ["Last week", W.current],
              ["Week before", W.previous],
            ].map(([label, p]) => {
              const period = p as typeof W.current;
              return (
                <div key={label as string} className="rounded-[var(--r-xs)] bg-graphite px-3 py-3">
                  <p className="t-meta">{label as string}</p>
                  <p className="mt-1 font-display text-[1.5rem] tabular-nums">{money(period.revenue)}</p>
                  <p className="text-[0.8125rem] text-ink-2">{period.transactions} transactions</p>
                </div>
              );
            })}
            <p className="text-[0.875rem] text-ink-2 sm:col-span-2">
              Change: ({money(W.current.revenue)} − {money(W.previous.revenue)}) ÷ {money(W.previous.revenue)} = {pct(W.current.revenue / W.previous.revenue - 1)}
            </p>
          </div>
        )}
        {step.key === "answer" && <p className="max-w-[60ch] rounded-[var(--r-md)] rounded-bl-[var(--r-xs)] bg-graphite px-4 py-3 text-[1.0625rem]">{ANSWER}</p>}
      </div>

      {done && (
        <p className="mt-4 flex items-center gap-2 rounded-[var(--r-sm)] border border-lime/50 px-4 py-3 font-medium text-lime">
          <Check size={18} aria-hidden className="shrink-0" /> AI understands the question. Deterministic code calculates the answer.
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setI((n) => Math.max(0, n - 1))}
          disabled={i === 0}
          className="inline-flex min-h-11 items-center gap-2 rounded-[var(--r-sm)] border border-line-strong px-4 text-[0.875rem] hover:border-ink-2 disabled:opacity-40"
        >
          <ArrowLeft size={15} aria-hidden /> Back
        </button>
        {!done ? (
          <button
            type="button"
            onClick={() => setI((n) => n + 1)}
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--r-sm)] bg-lime px-5 text-[0.875rem] font-medium text-[var(--c-lime-ink)]"
          >
            Next <ArrowRight size={15} aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setI(0);
              setShowJson(false);
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
