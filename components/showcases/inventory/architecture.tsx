"use client";

import { useState } from "react";

/*
 * Inventory platform architecture, drawn by hand because its paths run in
 * both directions (the sync service pulls from stores back into the office).
 * Four paths can be isolated: cached reads, background sync, queued writes
 * and live stock changes. Generic names only; no hosts, addresses or schema.
 */

type Flow = "cached" | "sync" | "queued" | "live";

const FLOWS: { id: Flow; label: string; desc: string; color: string; dash?: string }[] = [
  { id: "cached", label: "Cached reads", desc: "Lists, planning and reports read snapshots in the office database, so they keep working when a store is unreachable. Each store's sync status is shown alongside.", color: "var(--c-ice)" },
  { id: "sync", label: "Background sync", desc: "A separate service pulls each store into office snapshots, one store at a time, so one failing store doesn't stop the rest. A partial read never deletes office rows.", color: "var(--c-ice)", dash: "5 6" },
  { id: "queued", label: "Queued writes", desc: "Changes for stores go into a durable per-store outbox in the same transaction as the office change; a worker delivers them in order, retrying with backoff.", color: "var(--c-lime)" },
  { id: "live", label: "Live stock changes", desc: "Anything that could corrupt stock if it acted on stale data reads the store live, locks the row and checks the values the user expected.", color: "var(--c-lime)", dash: "5 6" },
];

const PATHS: { flow: Flow; d: string }[] = [
  { flow: "cached", d: "M390,215 C420,215 420,95 450,95" },
  { flow: "sync", d: "M840,170 C800,170 840,80 820,80" },
  { flow: "sync", d: "M660,80 L622,80" },
  { flow: "queued", d: "M390,250 L450,250" },
  { flow: "queued", d: "M620,240 L660,240" },
  { flow: "queued", d: "M820,240 L840,240" },
  { flow: "live", d: "M390,290 C420,290 420,345 460,345 L790,345 C820,345 820,320 840,320" },
];

type Box = { x: number; y: number; w: number; h: number; kicker: string; title: string; sub?: string; accent?: boolean };

const BOXES: Box[] = [
  { x: 20, y: 205, w: 150, h: 90, kicker: "CLIENT", title: "React app", sub: "Vite · Tailwind" },
  { x: 220, y: 185, w: 170, h: 130, kicker: "API", title: "Express API", sub: "Services · raw SQL", accent: true },
  { x: 450, y: 40, w: 172, h: 110, kicker: "DATA", title: "Office MySQL", sub: "Snapshots · ledger" },
  { x: 450, y: 205, w: 170, h: 80, kicker: "DATA", title: "Store write queue", sub: "Durable outbox" },
  { x: 450, y: 395, w: 170, h: 70, kicker: "DATA", title: "Pickup code DB", sub: "Shared by stores" },
  { x: 660, y: 40, w: 160, h: 80, kicker: "PROCESS", title: "Snapshot sync", sub: "Scheduled pull" },
  { x: 660, y: 200, w: 160, h: 80, kicker: "PROCESS", title: "Delivery worker", sub: "In order, retried", accent: true },
];

const STORES = [150, 225, 300];

export function InventoryArchitecture() {
  // Clicking pins a path; hovering previews one without changing the pin.
  const [pinned, setPinned] = useState<Flow | null>(null);
  const [hover, setHover] = useState<Flow | null>(null);
  const focus = hover ?? pinned;
  const dim = (f: Flow) => (focus && focus !== f ? 0.12 : 1);

  return (
    <figure className="rounded-[var(--r-md)] bg-graphite p-4 sm:p-6">
      <div role="group" aria-label="Highlight a path" className="flex flex-wrap gap-1.5">
        {FLOWS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={pinned === f.id}
            onClick={() => setPinned((x) => (x === f.id ? null : f.id))}
            onMouseEnter={() => setHover(f.id)}
            onMouseLeave={() => setHover(null)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-[var(--r-xs)] border px-3 text-[0.8125rem] transition-colors ${
              focus === f.id ? "border-ink-2 text-ink" : "border-line-strong text-ink-2 hover:text-ink"
            }`}
          >
            <svg aria-hidden width="22" height="6">
              <line x1="0" y1="3" x2="22" y2="3" stroke={f.color} strokeWidth="2" strokeDasharray={f.dash} />
            </svg>
            {f.label}
          </button>
        ))}
      </div>

      <svg
        viewBox="0 0 990 480"
        className="mt-5 hidden h-auto w-full md:block"
        role="img"
        aria-label="Architecture. The React app calls the Express API. The API reads office snapshots in Office MySQL, writes stock changes to a durable store write queue in the same transaction, and checks live store stock with row locks for sensitive edits. A delivery worker drains the queue to each store database in order. A separate snapshot sync service pulls each store into Office MySQL. Pickup codes live in a shared database."
      >
        <defs>
          {FLOWS.map((f) => (
            <marker key={f.id} id={`arch-${f.id}`} viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill={f.color} />
            </marker>
          ))}
        </defs>

        <path d="M390,305 C420,305 420,430 450,430" fill="none" stroke="var(--c-line-strong)" strokeWidth="1.5" opacity={focus ? 0.12 : 1} />

        {PATHS.map((p, i) => {
          const f = FLOWS.find((x) => x.id === p.flow)!;
          return (
            <path
              key={i}
              d={p.d}
              fill="none"
              stroke={f.color}
              strokeWidth={focus === p.flow ? 2.5 : 1.75}
              strokeDasharray={f.dash}
              markerEnd={`url(#arch-${p.flow})`}
              opacity={dim(p.flow)}
              className="transition-opacity duration-[var(--d-fast)]"
            />
          );
        })}

        {BOXES.map((b) => (
          <g key={b.title}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="9" fill="var(--c-elevated)" stroke={b.accent ? "var(--c-ice)" : "var(--c-line-strong)"} strokeOpacity={b.accent ? 0.55 : 1} />
            <text x={b.x + 14} y={b.y + 24} fill="var(--c-ice)" fontSize="12" letterSpacing="0.08em">
              {b.kicker}
            </text>
            <text x={b.x + 14} y={b.y + 48} fill="var(--c-text)" fontSize="18">
              {b.title}
            </text>
            {b.sub && (
              <text x={b.x + 14} y={b.y + 69} fill="var(--c-text-2)" fontSize="14">
                {b.sub}
              </text>
            )}
          </g>
        ))}

        <text x="842" y="128" fill="var(--c-ice)" fontSize="12" letterSpacing="0.08em">
          STORES
        </text>
        {STORES.map((y, i) => (
          <g key={y}>
            <rect x="842" y={y} width="132" height="44" rx="8" fill="var(--c-void)" stroke={i === 1 ? "var(--c-warn)" : "var(--c-line-strong)"} strokeDasharray={i === 1 ? "4 4" : undefined} />
            <text x="854" y={y + 28} fill={i === 1 ? "var(--c-text-2)" : "var(--c-text)"} fontSize="15">
              Store {String.fromCharCode(65 + i)} · MySQL
            </text>
          </g>
        ))}
        <text x="842" y="374" fill="var(--c-text-2)" fontSize="13">
          One DB per store;
        </text>
        <text x="842" y="392" fill="var(--c-text-2)" fontSize="13">
          any may be offline
        </text>
        <text x="460" y="336" fill="var(--c-text-2)" fontSize="13" opacity={dim("live")}>
          live read · row lock · expected-value check
        </text>
        <text x="425" y="232" fill="var(--c-text-2)" fontSize="10" opacity={dim("queued")} transform="rotate(-90 425 232)">
          same txn
        </text>
      </svg>

      <ol className="mt-5 space-y-2 md:hidden" aria-label="Components">
        {[
          "React app → Express API",
          "API reads office snapshots in Office MySQL",
          "API writes stock deltas and an outbox job in one transaction",
          "Delivery worker drains the outbox to each store, in order",
          "Sensitive edits read the store live, with a row lock",
          "Snapshot sync pulls each store back into Office MySQL",
        ].map((t) => (
          <li key={t} className="rounded-[var(--r-sm)] bg-void px-3 py-2.5 text-[0.875rem]">
            {t}
          </li>
        ))}
      </ol>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        {FLOWS.map((f) => (
          <div key={f.id} className={`rounded-[var(--r-sm)] bg-void p-3 transition-opacity ${focus && focus !== f.id ? "opacity-40" : ""}`}>
            <dt className="flex items-center gap-2 text-[0.875rem] font-medium">
              <svg aria-hidden width="22" height="6">
                <line x1="0" y1="3" x2="22" y2="3" stroke={f.color} strokeWidth="2" strokeDasharray={f.dash} />
              </svg>
              {f.label}
            </dt>
            <dd className="mt-1 text-[0.8125rem] text-ink-2">{f.desc}</dd>
          </div>
        ))}
      </dl>
      <figcaption className="mt-4 text-[0.875rem] text-ink-2">
        Simplified, with generic names. Store databases are reached over a private network; addresses, hosts and schema details are left out.
      </figcaption>
    </figure>
  );
}
