"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Calculator, RotateCcw, User } from "lucide-react";
import { INTENT_LABEL, PRESETS, ask, choose, followUp, type Answer, type Context, type Message } from "./chat-model";
import { money, pct } from "./synthetic-data";

/*
 * Synthetic recreation of the assistant's chat experience. Preset questions
 * drive a scripted engine (chat-model.ts) over fictional data. No model,
 * database or company system is involved.
 */

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function AnswerBody({ a }: { a: Answer }) {
  switch (a.kind) {
    case "sales": {
      const { current: c, previous: p } = a.window;
      const change = c.revenue / p.revenue - 1;
      const label = a.u.period === "last week" ? "last week" : "in the last 30 days";
      const prev = a.u.period === "last week" ? "the week before" : "the 30 days before";
      return (
        <>
          <p>
            {a.u.store} recorded <b>{money(c.revenue)}</b> in sales from {c.transactions.toLocaleString()} transactions {label}, compared with{" "}
            {money(p.revenue)} from {p.transactions.toLocaleString()} {prev} ({pct(change)}).
          </p>
          <p className="mt-1.5 text-ink-2">Average basket: {money(c.revenue / c.transactions)}.</p>
        </>
      );
    }
    case "restock":
      return (
        <>
          <p>
            {a.lines.length} products at {a.u.store} are below their reorder point:
          </p>
          <ul className="mt-2 space-y-1">
            {a.lines.map((l) => (
              <li key={l.product} className="flex flex-wrap justify-between gap-x-4">
                <span>{l.product}</span>
                <span className="tabular-nums text-ink-2">
                  {l.onShelf} of {l.capacity} on shelf · <span className="text-lime">top up {l.topUp}</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      );
    case "profit": {
      const gp = a.revenue - a.cogs;
      return (
        <>
          <p>{a.u.store}, last month:</p>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-0.5 tabular-nums">
            <dt className="text-ink-2">Revenue</dt>
            <dd className="text-right">{money(a.revenue)}</dd>
            <dt className="text-ink-2">Cost of goods</dt>
            <dd className="text-right">{money(a.cogs)}</dd>
            <dt>Gross profit</dt>
            <dd className="text-right font-medium">
              {money(gp)} <span className="text-ink-2">({((gp / a.revenue) * 100).toFixed(1)}% margin)</span>
            </dd>
          </dl>
        </>
      );
    }
    case "bought_together":
      return (
        <>
          <p>Products most often bought together at {a.u.store} in the last 30 days:</p>
          <ol className="mt-2 space-y-1.5">
            {a.pairs.map((p) => (
              <li key={p.a + p.b}>
                {p.a} + {p.b}
                <span className="block text-[0.8125rem] text-ink-2">
                  together in {Math.round(p.attach * 100)}% of baskets with the first item · {p.lift.toFixed(1)}× more often than chance
                </span>
              </li>
            ))}
          </ol>
        </>
      );
    case "stock":
      return (
        <>
          <p>Stock at {a.u.store}:</p>
          <ul className="mt-2 space-y-1">
            {a.lines.map((l) => (
              <li key={l.product} className="flex justify-between gap-4">
                <span>{l.product}</span>
                <span className={`tabular-nums ${l.onShelf / l.capacity < 0.25 ? "text-[var(--c-warn)]" : "text-ink-2"}`}>
                  {l.onShelf} of {l.capacity}
                  {l.onShelf / l.capacity < 0.25 ? " · low" : ""}
                </span>
              </li>
            ))}
          </ul>
        </>
      );
  }
}

function UnderstoodLine({ a }: { a: Answer }) {
  const parts = [INTENT_LABEL[a.u.intent], a.u.store, a.u.period].filter(Boolean);
  const carried = a.u.carried?.length ? `${a.u.carried.join(" and ")} carried over from the previous question` : null;
  return (
    <p className="mt-3 flex items-start gap-2 border-t border-line pt-2 text-[0.75rem] text-ink-2">
      <Calculator size={13} aria-hidden className="mt-0.5 shrink-0 text-ice" />
      <span>
        Understood as <span className="text-ink">{parts.join(" · ")}</span>
        {carried && <> ({carried})</>}. Figures calculated by code.
      </span>
    </p>
  );
}

export function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [ctx, setCtx] = useState<Context>(null);
  const [busy, setBusy] = useState(false);
  const seq = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion() ? "auto" : "smooth" });
  }, [messages, busy]);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const respond = (question: string, run: () => ReturnType<typeof ask>) => {
    if (busy) return;
    const result = run();
    setMessages((m) => [...m, { id: ++seq.current, role: "user", text: question }]);
    setBusy(true);
    timer.current = window.setTimeout(
      () => {
        setMessages((m) => [...m, { id: ++seq.current, ...result.reply }]);
        setCtx(result.ctx);
        setBusy(false);
      },
      reducedMotion() ? 0 : 650,
    );
  };

  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    setMessages([]);
    setCtx(null);
    setBusy(false);
  };

  const last = messages[messages.length - 1];
  const pending = last?.role === "assistant" && last.clarify && !busy ? last.clarify : null;
  const follow = !busy && !pending ? followUp(ctx) : null;

  return (
    <div className="overflow-hidden rounded-[var(--r-md)] bg-graphite">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <p className="flex items-center gap-2 whitespace-nowrap text-[0.875rem]">
          <span aria-hidden className="size-2 shrink-0 rounded-full bg-lime" />
          Operations Assistant
          <span className="t-meta hidden text-[0.6875rem] sm:inline">local model · demo data</span>
        </p>
        <button type="button" onClick={reset} aria-label="Reset conversation" className="inline-flex min-h-11 shrink-0 items-center gap-2 px-2 text-[0.8125rem] text-ink-2 hover:text-ink">
          <RotateCcw size={14} aria-hidden />
          <span>
            Reset<span className="hidden sm:inline"> conversation</span>
          </span>
        </button>
      </div>

      <div ref={logRef} role="log" aria-live="polite" aria-label="Conversation" className="h-[22rem] space-y-4 overflow-y-auto px-4 py-5 sm:h-[26rem] sm:px-6">
        {messages.length === 0 && (
          <div className="grid h-full place-items-center text-center">
            <p className="max-w-[34ch] text-ink-2">Pick a question below to see how the assistant answers. Then try the follow-up.</p>
          </div>
        )}
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end gap-2.5">
              <p className="max-w-[85%] rounded-[var(--r-md)] rounded-br-[var(--r-xs)] bg-elevated px-4 py-2.5">{m.text}</p>
              <User size={18} aria-label="Operator" className="mt-2 shrink-0 text-ink-2" />
            </div>
          ) : (
            <div key={m.id} className="flex gap-2.5">
              <Bot size={18} aria-label="Assistant" className="mt-2 shrink-0 text-ice" />
              <div className="max-w-[92%] rounded-[var(--r-md)] rounded-bl-[var(--r-xs)] bg-void px-4 py-3 text-[0.9375rem]">
                {m.answer && (
                  <>
                    <AnswerBody a={m.answer} />
                    <UnderstoodLine a={m.answer} />
                  </>
                )}
                {m.clarify && (
                  <>
                    <p>
                      I found two stores matching &ldquo;{m.clarify.term}&rdquo;. Which one did you mean?
                    </p>
                    <p className="mt-3 border-t border-line pt-2 text-[0.75rem] text-ink-2">
                      The name was ambiguous, so the assistant asked instead of guessing.
                    </p>
                  </>
                )}
              </div>
            </div>
          ),
        )}
        {busy && (
          <div className="flex gap-2.5" aria-label="Assistant is answering">
            <Bot size={18} aria-hidden className="mt-2 shrink-0 text-ice" />
            <p className="rounded-[var(--r-md)] bg-void px-4 py-3 text-ink-2">
              <span className="motion-safe:animate-pulse">Working out the answer…</span>
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-line px-4 py-4 sm:px-6">
        {pending ? (
          <>
            <p className="t-meta mb-2">Choose a store</p>
            <div className="flex flex-wrap gap-2">
              {pending.options.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => respond(s, () => choose(s))}
                  className="min-h-11 rounded-[var(--r-sm)] bg-lime px-4 text-[0.875rem] font-medium text-[var(--c-lime-ink)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {follow && (
              <div className="mb-3">
                <p className="t-meta mb-2">Try a follow-up</p>
                <button
                  type="button"
                  onClick={() => respond(follow.text, () => ask(follow.id, ctx))}
                  className="min-h-11 rounded-[var(--r-sm)] bg-lime px-4 text-[0.875rem] font-medium text-[var(--c-lime-ink)]"
                >
                  {follow.text}
                </button>
              </div>
            )}
            <p className="t-meta mb-2">{messages.length ? "Or ask something else" : "Example questions"}</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={busy}
                  onClick={() => respond(p.text, () => ask(p.id, ctx))}
                  className="min-h-11 rounded-[var(--r-sm)] border border-line-strong px-3.5 text-left text-[0.875rem] transition-colors hover:border-ink-2 disabled:opacity-40"
                >
                  {p.text}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
