"use client";

import { useId, useState } from "react";

/*
 * Period-boundary FIFO over a frozen delivery-cost ledger, plus revenue
 * allocated down from the amount actually charged. All figures are fictional.
 *
 * Sales rows don't name a batch, so cost is matched at the period boundary:
 * units sold before the period are skipped off the front of the ledger, then
 * the period's units consume the next landed costs. Units the ledger can't
 * cover use a fallback cost and are reported as a coverage percentage.
 */

const LEDGER = [
  { lot: "Delivery 1", units: 10, cost: 1.2 },
  { lot: "Delivery 2", units: 10, cost: 1.35 },
  { lot: "Delivery 3", units: 10, cost: 1.5 },
];
const FALLBACK = 1.6;
const money = (v: number) => `$${v.toFixed(2)}`;

function fifo(before: number, during: number) {
  let skip = before;
  let need = during;
  const used: { lot: string; units: number; cost: number }[] = [];
  for (const l of LEDGER) {
    const avail = Math.max(0, l.units - skip);
    skip = Math.max(0, skip - l.units);
    const take = Math.min(avail, need);
    if (take > 0) used.push({ lot: l.lot, units: take, cost: l.cost });
    need -= take;
  }
  const covered = during - need;
  const cogs = used.reduce((n, u) => n + u.units * u.cost, 0) + need * FALLBACK;
  return { used, fallbackUnits: need, cogs, coverage: during ? covered / during : 1 };
}

/** Basket: two items whose list prices sum to more than the customer paid. */
const BASKET = { charged: 5.0, lines: [{ item: "Sample Product A", list: 3.0 }, { item: "Sample Product B", list: 2.5 }] };

function allocate() {
  const total = BASKET.lines.reduce((n, l) => n + l.list, 0);
  let left = BASKET.charged;
  return BASKET.lines.map((l, i) => {
    // The last line absorbs the rounding remainder so the parts sum exactly.
    const share = i === BASKET.lines.length - 1 ? left : Math.round((BASKET.charged * l.list * 100) / total) / 100;
    left = Math.round((left - share) * 100) / 100;
    return { ...l, revenue: share };
  });
}

export function CogsLedger() {
  const id = useId();
  const [before, setBefore] = useState(8);
  const [during, setDuring] = useState(14);
  const r = fifo(before, during);
  const alloc = allocate();
  const listTotal = BASKET.lines.reduce((n, l) => n + l.list, 0);

  return (
    <div className="grid gap-4 rounded-[var(--r-md)] bg-graphite p-4 sm:p-6 lg:grid-cols-2">
      <section aria-labelledby={`${id}-c`} className="rounded-[var(--r-sm)] bg-void p-4">
        <p id={`${id}-c`} className="t-meta">
          Cost of goods sold · one product, one store
        </p>
        {[
          { label: "Sold before this period", value: before, set: setBefore, max: 30 },
          { label: "Sold in this period", value: during, set: setDuring, max: 20 },
        ].map((c) => (
          <div key={c.label} className="mt-3">
            <div className="flex justify-between text-[0.875rem]">
              <label htmlFor={`${id}-${c.label}`}>{c.label}</label>
              <output className="tabular-nums text-ink-2">{c.value} units</output>
            </div>
            <input id={`${id}-${c.label}`} type="range" className="ops-range w-full" min={0} max={c.max} value={c.value} onChange={(e) => c.set(Number(e.target.value))} />
          </div>
        ))}
        <table className="mt-3 w-full text-[0.8125rem] tabular-nums">
          <caption className="sr-only">Frozen delivery ledger and the units this period consumes</caption>
          <thead className="t-meta text-left">
            <tr>
              <th className="py-1 font-normal">Ledger</th>
              <th className="font-normal">Landed cost</th>
              <th className="text-right font-normal">This period</th>
            </tr>
          </thead>
          <tbody>
            {LEDGER.map((l) => {
              const u = r.used.find((x) => x.lot === l.lot)?.units ?? 0;
              return (
                <tr key={l.lot} className="border-t border-line">
                  <td className="py-1.5">
                    {l.lot} <span className="text-ink-2">· {l.units} units</span>
                  </td>
                  <td>{money(l.cost)}</td>
                  <td className={`text-right ${u ? "text-lime" : "text-ink-2"}`}>{u ? `${u} × ${money(l.cost)}` : "—"}</td>
                </tr>
              );
            })}
            {r.fallbackUnits > 0 && (
              <tr className="border-t border-line text-[var(--c-warn)]">
                <td className="py-1.5">Not in the ledger</td>
                <td>{money(FALLBACK)} fallback</td>
                <td className="text-right">{r.fallbackUnits} units</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
          <p>
            <span className="t-meta block">COGS this period</span>
            <span className="font-display text-[1.75rem] tabular-nums">{money(r.cogs)}</span>
          </p>
          <p className="text-right">
            <span className="t-meta block">Ledger coverage</span>
            <span className={`font-display text-[1.75rem] tabular-nums ${r.coverage < 0.5 ? "text-[var(--c-warn)]" : "text-lime"}`}>
              {Math.round(r.coverage * 100)}%
            </span>
          </p>
        </div>
        <p className="mt-2 text-[0.8125rem] text-ink-2">
          Costs were frozen when each delivery was made, so this figure doesn&apos;t change if prices or tax rates change later.
        </p>
      </section>

      <section aria-labelledby={`${id}-r`} className="rounded-[var(--r-sm)] bg-void p-4">
        <p id={`${id}-r`} className="t-meta">
          Revenue · one basket
        </p>
        <p className="mt-2 text-[0.875rem] text-ink-2">
          The list prices add up to {money(listTotal)}, but the customer was charged {money(BASKET.charged)}. The discount isn&apos;t visible line by line,
          so revenue is allocated down from the charged amount, using list prices only as weights.
        </p>
        <table className="mt-4 w-full text-[0.8125rem] tabular-nums">
          <caption className="sr-only">Revenue allocated from the charged amount</caption>
          <thead className="t-meta text-left">
            <tr>
              <th className="py-1 font-normal">Item</th>
              <th className="text-right font-normal">List</th>
              <th className="text-right font-normal">Allocated</th>
            </tr>
          </thead>
          <tbody>
            {alloc.map((l) => (
              <tr key={l.item} className="border-t border-line">
                <td className="py-1.5">{l.item}</td>
                <td className="text-right text-ink-2">{money(l.list)}</td>
                <td className="text-right text-lime">{money(l.revenue)}</td>
              </tr>
            ))}
            <tr className="border-t border-line-strong">
              <td className="py-1.5">Total</td>
              <td className="text-right text-[var(--c-warn)]">{money(listTotal)}</td>
              <td className="text-right text-lime">{money(alloc.reduce((n, l) => n + l.revenue, 0))}</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-[0.8125rem] text-ink-2">
          Built up from list prices, this basket would report {money(listTotal - BASKET.charged)} of revenue that was never collected. Allocated down, the
          lines always add up to the money actually taken.
        </p>
      </section>
    </div>
  );
}
