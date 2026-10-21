"use client";

import { useReducer } from "react";
import { RotateCcw } from "lucide-react";
import { deliveryReducer, initialDelivery, type LogTone } from "./delivery-model";

/*
 * Offline Delivery Simulator: an office outbox delivering stock deltas to one
 * store that can go offline and can lose acknowledgements. Synthetic and
 * simplified; the model lives in delivery-model.ts.
 */

const toneClass: Record<LogTone, string> = {
  office: "text-ink-2",
  store: "text-ice",
  ok: "text-lime",
  warn: "text-ink",
  fail: "text-[var(--c-warn)]",
};

function Switch({ on, onClick, label, hint }: { on: boolean; onClick: () => void; label: string; hint?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className="flex min-h-11 items-center gap-3 rounded-[var(--r-sm)] px-1 text-left text-[0.875rem]"
    >
      <span aria-hidden className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${on ? "bg-lime" : "bg-line-strong"}`}>
        <span
          className={`absolute top-1 size-4 rounded-full bg-void transition-transform duration-[var(--d-fast)] ${on ? "translate-x-5" : "translate-x-1"}`}
        />
      </span>
      <span>
        {label}
        {hint && <span className="block text-[0.75rem] text-ink-2">{hint}</span>}
      </span>
    </button>
  );
}

const btn = "min-h-11 rounded-[var(--r-sm)] border border-line-strong px-4 text-[0.875rem] transition-colors hover:border-ink-2 disabled:opacity-40";

export function OfflineDelivery() {
  const [s, dispatch] = useReducer(deliveryReducer, undefined, () => initialDelivery());
  const pending = s.jobs.filter((j) => j.status === "pending");
  const worst = Math.max(0, ...Object.values(s.applied));

  return (
    <div className="rounded-[var(--r-md)] bg-graphite p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <Switch on={s.online} onClick={() => dispatch({ type: "toggle-online" })} label={s.online ? "Store C online" : "Store C offline"} />
          <Switch
            on={s.loseNextAck}
            onClick={() => dispatch({ type: "toggle-lose-ack" })}
            label="Lose the next acknowledgement"
            hint="The store commits, but the reply never arrives"
          />
          <Switch
            on={s.useMarker}
            onClick={() => dispatch({ type: "toggle-marker" })}
            label="Idempotency marker"
            hint={s.useMarker ? "As designed" : "Comparison: naive retry (resets)"}
          />
        </div>
        <button type="button" onClick={() => dispatch({ type: "reset" })} className="inline-flex min-h-11 items-center gap-2 px-2 text-[0.875rem] text-ink-2 hover:text-ink">
          <RotateCcw size={15} aria-hidden /> Reset
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => dispatch({ type: "queue" })} disabled={s.jobs.length >= 3} className={btn}>
          1 · Complete a top-up
        </button>
        <button type="button" onClick={() => dispatch({ type: "run-worker" })} disabled={s.jobs.length === 0} className={`${btn} border-lime/60`}>
          2 · Run delivery worker
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
        <section aria-label="Office" className="rounded-[var(--r-sm)] bg-void p-4">
          <p className="t-meta">Office database · outbox for Store C</p>
          {s.jobs.length === 0 ? (
            <p className="mt-3 text-[0.875rem] text-ink-2">Empty. Complete a top-up to queue a delivery.</p>
          ) : (
            <ol className="mt-3 space-y-2">
              {s.jobs.map((j) => (
                <li key={j.id} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-[var(--r-xs)] bg-graphite px-3 py-2 text-[0.8125rem]">
                  <span className="font-mono">
                    #{j.id}{" "}
                    <span className="text-ink-2">
                      {Object.entries(j.deltas)
                        .map(([p, n]) => `+${n} ${p}`)
                        .join(" · ")}
                    </span>
                  </span>
                  <span className={j.status === "sent" ? "text-lime" : "text-ink-2"}>
                    {j.status === "sent" ? "sent" : j.retryIn ? `pending · retry in ${j.retryIn}s` : "pending"}
                    {j.attempts > 0 && <span className="text-ink-2"> · {j.attempts} attempt{j.attempts === 1 ? "" : "s"}</span>}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <div aria-hidden className="flex items-center justify-center gap-2 lg:flex-col">
          <span className={`h-px w-10 lg:h-10 lg:w-px ${s.online ? "bg-ice" : "border-t border-dashed border-[var(--c-warn)] lg:border-l lg:border-t-0"}`} />
          <span className={`t-meta whitespace-nowrap ${s.online ? "text-ice" : "text-[var(--c-warn)]"}`}>{s.online ? "link up" : "no link"}</span>
          <span className={`h-px w-10 lg:h-10 lg:w-px ${s.online ? "bg-ice" : "border-t border-dashed border-[var(--c-warn)] lg:border-l lg:border-t-0"}`} />
        </div>

        <section aria-label="Store C" className={`rounded-[var(--r-sm)] bg-void p-4 transition-opacity ${s.online ? "" : "opacity-70"}`}>
          <p className="t-meta">Store C database {s.online ? "" : "· unreachable"}</p>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
            {Object.entries(s.stock).map(([pos, n]) => (
              <div key={pos} className="rounded-[var(--r-xs)] bg-graphite py-2">
                <dt className="t-meta">{pos}</dt>
                <dd className="font-display text-[1.5rem] tabular-nums">{n}</dd>
              </div>
            ))}
          </dl>
          <p className="t-meta mt-4">Applied-job markers</p>
          <p className="mt-1 font-mono text-[0.8125rem] text-ink-2">
            {!s.useMarker ? "Not used in this comparison" : s.markers.length ? s.markers.map((m) => `#${m}`).join("  ") : "None yet"}
          </p>
        </section>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_14rem]">
        <section aria-label="Event sequence" className="rounded-[var(--r-sm)] bg-void p-4">
          <p className="t-meta">Event sequence</p>
          {s.log.length === 0 ? (
            <p className="mt-2 text-[0.875rem] text-ink-2">
              Try this: complete a top-up while the store is offline, run the worker, bring the store back with a lost acknowledgement, then run the
              worker twice.
            </p>
          ) : (
            <ol className="mt-2 max-h-56 space-y-1.5 overflow-y-auto pr-2 text-[0.8125rem]" aria-live="polite">
              {s.log.map((e) => (
                <li key={e.seq} className="grid grid-cols-[2.75rem_1fr] gap-2">
                  <span className="font-mono text-ink-2">t+{e.t}s</span>
                  <span className={toneClass[e.tone]}>{e.text}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
        <section aria-label="Stock effects" className="rounded-[var(--r-sm)] bg-void p-4">
          <p className="t-meta">Stock effects per delivery</p>
          <p className={`mt-2 font-display text-[2.5rem] leading-none tabular-nums ${worst > 1 ? "text-[var(--c-warn)]" : "text-lime"}`}>
            {worst === 0 ? "0" : `${worst}×`}
          </p>
          <p className="mt-2 text-[0.8125rem] text-ink-2">
            {worst > 1
              ? "A replayed delivery changed stock twice. This is the failure the marker prevents."
              : `Most times any one delivery changed store stock. ${pending.length} job${pending.length === 1 ? "" : "s"} pending.`}
          </p>
        </section>
      </div>
    </div>
  );
}
