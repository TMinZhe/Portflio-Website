import { Bot, Calculator } from "lucide-react";
import { SALES, money, pct } from "./synthetic-data";

/*
 * Still preview for the homepage card and the case-study cover: one fictional
 * exchange with the assistant. Decorative to assistive tech; the caller labels
 * it as a recreation with synthetic data.
 */

const W = SALES["Store A"].lastWeek;

export function AiChatPreview() {
  return (
    <div aria-hidden className="flex h-full flex-col gap-4 rounded-[var(--r-md)] bg-[var(--c-graphite)] p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[0.9375rem]">
          <span className="size-2 rounded-full bg-lime" />
          Operations Assistant
        </p>
        <p className="t-meta">Local model</p>
      </div>
      <p className="ml-auto max-w-[85%] rounded-[var(--r-md)] rounded-br-[var(--r-xs)] bg-[var(--c-elevated)] px-4 py-3 text-[0.9375rem]">
        How did Store A perform last week?
      </p>
      <div className="flex max-w-[92%] gap-2.5">
        <Bot size={18} className="mt-2 shrink-0 text-ice" />
        <div className="rounded-[var(--r-md)] rounded-bl-[var(--r-xs)] bg-[var(--c-void)] px-4 py-3 text-[0.9375rem]">
          <p>
            Store A recorded <b>{money(W.current.revenue)}</b> in sales from {W.current.transactions} transactions last week, compared with{" "}
            {money(W.previous.revenue)} the week before ({pct(W.current.revenue / W.previous.revenue - 1)}).
          </p>
          <p className="mt-3 flex items-center gap-2 border-t border-[var(--c-line)] pt-2 text-[0.75rem] text-ink-2">
            <Calculator size={13} className="text-ice" />
            Understood as Sales summary · Store A · last week. Figures calculated by code.
          </p>
        </div>
      </div>
      <p className="pv-optional ml-auto max-w-[85%] rounded-[var(--r-md)] rounded-br-[var(--r-xs)] bg-[var(--c-elevated)] px-4 py-3 text-[0.9375rem]">What about Store B?</p>
      <div className="mt-auto grid grid-cols-3 gap-2 text-center">
        {[
          ["Understands", "the language model"],
          ["Checks", "Python guardrails"],
          ["Calculates", "deterministic code"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-[var(--r-sm)] bg-[var(--c-void)] px-2 py-2.5">
            <p className="t-meta text-[0.625rem]">{k}</p>
            <p className="mt-1 text-[0.8125rem] text-ice">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
