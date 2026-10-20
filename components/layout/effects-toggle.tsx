"use client";

import { setEffects, useEffects } from "@/lib/hooks/use-effects";

/** Switch between full cinematic effects and a calmer, static experience. */
export function EffectsToggle({ className = "" }: { className?: string }) {
  const effects = useEffects();
  const reduced = effects === "reduced";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={reduced}
      onClick={() => setEffects(reduced ? "full" : "reduced")}
      className={`inline-flex min-h-11 items-center gap-2.5 rounded-[var(--r-sm)] px-3 text-[0.875rem] text-ink-2 transition-colors hover:text-ink ${className}`}
    >
      <span
        aria-hidden
        className={`relative h-[18px] w-8 rounded-full border transition-colors duration-[var(--d-fast)] ${
          reduced ? "border-lime bg-lime/15" : "border-line-strong"
        }`}
      >
        <span
          className={`absolute top-[3px] size-2.5 rounded-full transition-[left,background-color] duration-[var(--d-base)] ease-[var(--ease-out-expo)] ${
            reduced ? "left-[17px] bg-lime" : "left-[3px] bg-ink-2"
          }`}
        />
      </span>
      Reduce effects
    </button>
  );
}
