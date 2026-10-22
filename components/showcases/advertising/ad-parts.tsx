import type { CSSProperties } from "react";
import type { Ad, Pedestrian } from "./explorer-model";
import { PACE_THRESHOLD, isViewer } from "./explorer-model";

/*
 * Drawn parts shared by the explorer, the homepage still and the composition
 * concept: a top-down walkway with abstract pedestrians, and fictional poster
 * creatives. No real people, places or brands.
 */

const TONES: Record<Ad["tone"], { bg: string; ink: string; accent: string }> = {
  lime: { bg: "linear-gradient(150deg,#1b2a10 0%,#2f4a12 55%,#b6ff3b 140%)", ink: "#f4f5f7", accent: "#b6ff3b" },
  ice: { bg: "linear-gradient(150deg,#101a33 0%,#1f3566 60%,#8caeff 150%)", ink: "#f4f5f7", accent: "#8caeff" },
  warm: { bg: "linear-gradient(150deg,#2a1710 0%,#5a2d16 60%,#ffb547 150%)", ink: "#fff6ea", accent: "#ffb547" },
  neutral: { bg: "linear-gradient(150deg,#1d232b 0%,#2b333d 100%)", ink: "#f4f5f7", accent: "#c9d2dd" },
};

/** A fictional advertisement, sized by its container (cqw units). */
export function AdCreative({ ad, className = "" }: { ad: Ad; className?: string }) {
  const t = TONES[ad.tone];
  return (
    <div className={`relative size-full overflow-hidden [container-type:size] ${className}`} style={{ background: t.bg, color: t.ink }}>
      <span aria-hidden className="absolute -right-[12%] -top-[18%] aspect-square w-[62%] rounded-full opacity-25" style={{ background: t.accent }} />
      <span aria-hidden className="absolute left-[7%] top-[10%] aspect-square w-[18%] rounded-[18%] border-2 opacity-60" style={{ borderColor: t.accent }} />
      <div className="absolute inset-x-[7%] bottom-[8%]">
        <p className="text-[5.5cqw] font-medium uppercase tracking-[0.12em]" style={{ color: t.accent }}>
          {ad.brand}
        </p>
        <p className="mt-[1.5cqw] max-w-[85%] text-[9cqw] font-semibold leading-[1.05]">{ad.line}</p>
      </div>
    </div>
  );
}

/** One abstract pedestrian: a dot with a motion trail whose length follows its pace. */
export function Walker({ p, x, animate, highlight }: { p: Pedestrian; x: number; animate: boolean; highlight: boolean }) {
  const viewer = isViewer(p);
  const trail = Math.min(64, Math.round(p.pace / 5));
  const style: CSSProperties = {
    left: `${x}%`,
    top: `${18 + p.lane * 30}%`,
    ...(animate ? { animationDuration: `${Math.round(1_800_000 / p.pace)}ms`, animationDelay: `-${Math.round((x / 100) * (1_800_000 / p.pace))}ms` } : {}),
  };
  return (
    <span className={`absolute -translate-y-1/2 ${animate ? "ad-walker" : ""}`} style={style} aria-hidden>
      <span
        className="absolute right-full top-1/2 h-[3px] -translate-y-1/2 rounded-full"
        style={{ width: trail, background: `linear-gradient(to right, transparent, ${viewer ? "var(--c-lime)" : "var(--c-text-3)"})` }}
      />
      <span
        className={`relative block size-3.5 rounded-full ring-2 ${viewer ? "bg-lime ring-lime/30" : "bg-ink-3 ring-transparent"} ${highlight && viewer ? "outline outline-1 outline-offset-4 outline-lime/60" : ""}`}
      />
      <span className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap font-mono text-[0.625rem] text-ink-2">{p.id}</span>
    </span>
  );
}

/** Top-down walkway in front of the screen, with the "viewing zone" marked. */
export function Walkway({ people, animate, label, aspect = "aspect-[16/7]" }: { people: Pedestrian[]; animate: boolean; label?: string; aspect?: string }) {
  return (
    <div data-walkway className={`relative overflow-hidden rounded-[var(--r-sm)] bg-[#0d1218] ring-1 ring-line ${aspect}`}>
      <div aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_39px,rgb(244_245_247/0.04)_39px_40px)]" />
      {[0, 1, 2].map((l) => (
        <span key={l} aria-hidden className="absolute inset-x-0 border-t border-dashed border-line" style={{ top: `${18 + l * 30}%` }} />
      ))}
      <span aria-hidden className="absolute inset-y-0 left-[38%] w-[24%] bg-lime/[0.05] ring-1 ring-inset ring-lime/15" />
      <span className="t-meta absolute left-[38%] top-1.5 px-2 text-[0.5625rem] text-lime/80">viewing zone</span>
      <span aria-hidden className="absolute bottom-0 left-[42%] h-1.5 w-[16%] rounded-t-[2px] bg-ice" />
      <span className="t-meta absolute bottom-2 left-[42%] w-[16%] text-center text-[0.5625rem] text-ice">screen</span>
      {label && <span className="t-meta absolute bottom-2 left-2 text-[0.5625rem]">{label}</span>}
      {people.map((p, i) => (
        <Walker key={p.id} p={p} x={8 + ((i * 37) % 84)} animate={animate} highlight={!animate} />
      ))}
    </div>
  );
}

export const paceLabel = (pace: number) => (pace < PACE_THRESHOLD ? "slow" : "fast");
