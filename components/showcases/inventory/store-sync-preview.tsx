/*
 * Still preview for the homepage and the case-study cover: an office outbox
 * holding deliveries for a store that is offline, next to stores that have
 * already received theirs. Synthetic data, labelled by the caller.
 */

const ROWS = [
  { store: "Store A", job: "#38", what: "+6 → P-04 · +2 → P-11", state: "sent", note: "applied once" },
  { store: "Store B", job: "#39", what: "+3 → P-02", state: "sent", note: "applied once" },
  { store: "Store C", job: "#41", what: "+4 → P-12 · +2 → P-07", state: "queued", note: "offline · retry in 20s" },
  { store: "Store C", job: "#42", what: "+3 → P-03", state: "waiting", note: "ordered behind #41" },
] as const;

export function StoreSyncPreview() {
  return (
    <div aria-hidden className="flex h-full flex-col gap-4 rounded-[var(--r-md)] bg-[var(--c-graphite)] p-4 sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-[1.125rem]">Store deliveries</p>
        <p className="t-meta">Office outbox</p>
      </div>
      <ol className="space-y-2">
        {ROWS.map((r) => (
          <li
            key={r.job}
            className={`grid grid-cols-[4.5rem_2.5rem_1fr] items-center gap-3 rounded-[var(--r-sm)] px-3 py-2.5 text-[0.8125rem] sm:grid-cols-[5rem_2.75rem_1fr_auto] ${
              r.state === "sent" ? "bg-[var(--c-void)]" : "bg-[var(--c-void)] ring-1 ring-[var(--c-warn)]/40"
            }`}
          >
            <span>{r.store}</span>
            <span className="font-mono text-ink-2">{r.job}</span>
            <span className="truncate font-mono">{r.what}</span>
            <span className={`col-span-full text-[0.75rem] sm:col-span-1 sm:text-right ${r.state === "sent" ? "text-lime" : "text-[var(--c-warn)]"}`}>
              {r.state === "sent" ? "✓ " : ""}
              {r.note}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-auto grid grid-cols-3 gap-2 text-center">
        {[
          { k: "Delivery", v: "at-least-once" },
          { k: "Stock effect", v: "exactly once" },
          { k: "Replay guard", v: "job marker" },
        ].map((m) => (
          <div key={m.k} className="rounded-[var(--r-sm)] bg-[var(--c-void)] px-2 py-2.5">
            <p className="t-meta text-[0.625rem]">{m.k}</p>
            <p className="mt-1 text-[0.8125rem] text-ice">{m.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
