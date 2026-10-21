/*
 * The shape of the problem: one office platform, many stores, each with its
 * own database, any of which may be unreachable at a given moment. Generic
 * names only; not the real network.
 */

const STORES = [
  { name: "Store A", state: "online", y: 40 },
  { name: "Store B", state: "online", y: 120 },
  { name: "Store C", state: "offline", y: 200 },
  { name: "Store D", state: "stale", y: 280 },
] as const;

const stateLabel = { online: "reachable", offline: "unreachable", stale: "snapshot 3 h old" } as const;

export function StoreTopology() {
  return (
    <figure className="rounded-[var(--r-md)] bg-graphite p-4 sm:p-6">
      <svg
        viewBox="0 0 640 330"
        className="hidden h-auto w-full sm:block"
        role="img"
        aria-label="One office platform connected to four stores, each with its own database. Stores A and B are reachable, Store C is unreachable, and Store D's cached snapshot is three hours old."
      >
        <rect x="10" y="105" width="210" height="120" rx="10" fill="var(--c-elevated)" stroke="var(--c-ice)" strokeOpacity="0.5" />
        <text x="30" y="140" fill="var(--c-ice)" fontSize="12">
          OFFICE
        </text>
        <text x="30" y="166" fill="var(--c-text)" fontSize="17">
          Management platform
        </text>
        <text x="30" y="190" fill="var(--c-text-2)" fontSize="13">
          Office DB · snapshots · outbox
        </text>

        {STORES.map((s) => {
          const off = s.state === "offline";
          const stroke = off ? "var(--c-warn)" : s.state === "stale" ? "var(--c-text-2)" : "var(--c-ice)";
          return (
            <g key={s.name}>
              <path
                d={`M220,165 C320,165 320,${s.y + 22} 410,${s.y + 22}`}
                fill="none"
                stroke={stroke}
                strokeOpacity={off ? 0.9 : 0.6}
                strokeWidth="1.5"
                strokeDasharray={off ? "4 6" : s.state === "stale" ? "2 4" : undefined}
              />
              <rect x="410" y={s.y} width="220" height="44" rx="8" fill="var(--c-void)" stroke={off ? "var(--c-warn)" : "var(--c-line-strong)"} strokeOpacity={off ? 0.7 : 1} />
              <text x="426" y={s.y + 27} fill={off ? "var(--c-text-2)" : "var(--c-text)"} fontSize="14">
                {s.name} · own MySQL
              </text>
              <circle cx="612" cy={s.y + 22} r="4" fill={off ? "var(--c-warn)" : s.state === "stale" ? "var(--c-text-2)" : "var(--c-lime)"} />
              <text x="410" y={s.y - 6} fill={off ? "var(--c-warn)" : "var(--c-text-2)"} fontSize="11">
                {stateLabel[s.state]}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="sm:hidden">
        <div className="rounded-[var(--r-sm)] bg-elevated p-3 ring-1 ring-ice/40">
          <p className="t-meta text-ice">Office</p>
          <p className="font-medium">Management platform</p>
          <p className="text-[0.8125rem] text-ink-2">Office DB · snapshots · outbox</p>
        </div>
        <ul className="ml-4 mt-2 space-y-2 border-l border-dashed border-line-strong pl-4">
          {STORES.map((s) => (
            <li key={s.name} className="flex items-center justify-between gap-3 rounded-[var(--r-sm)] bg-void px-3 py-2 text-[0.875rem]">
              <span>{s.name} · own MySQL</span>
              <span className={`text-[0.75rem] ${s.state === "offline" ? "text-[var(--c-warn)]" : "text-ink-2"}`}>{stateLabel[s.state]}</span>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="mt-3 text-[0.875rem] text-ink-2">
        Simplified sketch with generic names. Each store keeps the source of truth for its own shelves; the office works from cached snapshots and live reads.
      </figcaption>
    </figure>
  );
}
