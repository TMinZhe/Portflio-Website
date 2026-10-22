import { Check, X } from "lucide-react";

/*
 * One basket, two ways to report it: built up from list prices, or allocated
 * down from the amount actually charged (the platform's approach). Fictional.
 */

const PAID = 5;
const LINES = [
  { item: "Product A", list: 3 },
  { item: "Product B", list: 2.5 },
];
const money = (v: number) => `$${v.toFixed(2)}`;

function allocate() {
  const total = LINES.reduce((n, l) => n + l.list, 0);
  let left = PAID;
  return LINES.map((l, i) => {
    // The last line takes the rounding remainder, so the parts add up exactly.
    const share = i === LINES.length - 1 ? left : Math.round((PAID * l.list * 100) / total) / 100;
    left = Math.round((left - share) * 100) / 100;
    return { ...l, share };
  });
}

export function RevenueExample() {
  const listTotal = LINES.reduce((n, l) => n + l.list, 0);
  const alloc = allocate();
  return (
    <div className="rounded-[var(--r-md)] bg-graphite p-4 sm:p-6">
      <p className="text-[1.125rem] font-medium leading-snug">
        The customer paid {money(PAID)}, but the listed prices add up to {money(listTotal)}. How do we avoid reporting revenue we never collected?
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-[var(--r-sm)] bg-void p-4">
          <p className="flex items-center gap-2 text-[0.9375rem] font-medium">
            <X size={16} aria-hidden className="text-[var(--c-warn)]" /> Add up the list prices
          </p>
          <ul className="mt-3 space-y-1 text-[0.9375rem] tabular-nums">
            {LINES.map((l) => (
              <li key={l.item} className="flex justify-between">
                <span className="text-ink-2">{l.item}</span>
                {money(l.list)}
              </li>
            ))}
            <li className="flex justify-between border-t border-line pt-1 font-medium">
              <span>Reported</span>
              <span className="text-[var(--c-warn)]">{money(listTotal)}</span>
            </li>
          </ul>
          <p className="mt-3 text-[0.875rem] text-ink-2">{money(listTotal - PAID)} more than the customer paid. The discount is invisible line by line.</p>
        </div>
        <div className="rounded-[var(--r-sm)] bg-void p-4 ring-1 ring-lime/60">
          <p className="flex items-center gap-2 text-[0.9375rem] font-medium">
            <Check size={16} aria-hidden className="text-lime" /> Split the amount actually paid
          </p>
          <ul className="mt-3 space-y-1 text-[0.9375rem] tabular-nums">
            {alloc.map((l) => (
              <li key={l.item} className="flex justify-between">
                <span className="text-ink-2">{l.item}</span>
                {money(l.share)}
              </li>
            ))}
            <li className="flex justify-between border-t border-line pt-1 font-medium">
              <span>Reported</span>
              <span className="text-lime">{money(alloc.reduce((n, l) => n + l.share, 0))}</span>
            </li>
          </ul>
          <p className="mt-3 text-[0.875rem] text-ink-2">List prices only decide the split. The lines always add up to the money taken.</p>
        </div>
      </div>
    </div>
  );
}
