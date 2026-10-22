import type { CSSProperties, ReactNode } from "react";
import { ArrowDown, Check, ScanLine, Utensils, X } from "lucide-react";

/*
 * Drawn parts of the kiosk, shared by the simulator, the screen recreations and
 * the homepage still. The screens follow the real kiosk's layout (white screen,
 * fork mark, one instruction) with the event and school logos replaced by a
 * neutral wordmark. Faces are a generic silhouette and the QR pattern is
 * decorative: it does not decode.
 */

/** The physical unit: a bezel with a camera above the screen and a scanner window below. */
export function KioskDevice({ children, label, className = "" }: { children: ReactNode; label?: string; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[26rem] ${className}`}>
      <div className="rounded-[22px] bg-[#0f1318] p-2.5 shadow-[0_24px_60px_-30px_rgb(0_0_0/0.9)] ring-1 ring-line-strong sm:p-3">
        <div className="mb-2 flex items-center justify-center gap-1.5" aria-hidden>
          <span className="size-2 rounded-full bg-[#1d2630] ring-2 ring-[#2a3541]" />
          <span className="t-meta text-[0.5625rem] text-ink-3">camera</span>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-[10px] bg-white text-[#14181d]">{children}</div>
        <div className="mx-auto mt-2.5 flex h-6 w-2/5 items-center justify-center rounded-[6px] bg-[#1a2129] ring-1 ring-[#2a3541]" aria-hidden>
          <span className="h-0.5 w-3/5 rounded-full bg-lime/70" />
        </div>
      </div>
      <div aria-hidden className="mx-auto h-5 w-16 bg-gradient-to-b from-[#1a2129] to-transparent" />
      {label && <p className="t-meta mt-1 text-center">{label}</p>}
    </div>
  );
}

function Wordmark() {
  return <p className="absolute left-[5%] top-[6%] text-[2.6cqw] font-semibold tracking-wide text-[#14181d]/70">DEMO EXPO · DINING</p>;
}

/** Real-kiosk-style screen: instruction on the left, a large mark on the right. */
export function KioskScreen({
  mark,
  title,
  line,
  tone = "neutral",
  children,
}: {
  /** "camera" is drawn by the caller as a live-feed view. */
  mark: "fork" | "tick" | "cross" | "scan" | "camera";
  title: string;
  line?: string;
  tone?: "neutral" | "ok" | "stop";
  children?: ReactNode;
}) {
  const ring = tone === "ok" ? "#2f9e44" : tone === "stop" ? "#d9480f" : "#14181d";
  // Long names shrink to fit, as the organisers asked. Sizes follow the screen (cqw), not the page.
  const size = title.length > 18 ? "text-[5cqw]" : "text-[6.4cqw]";
  return (
    <div className="absolute inset-0 [container-type:size]">
      <Wordmark />
      <div className="absolute bottom-[6%] left-[5%] top-[16%] flex w-[50%] flex-col justify-center gap-[1.5cqw]">
        <p className={`${size} font-bold leading-[1.15]`}>{title}</p>
        {line && <p className="text-[3.6cqw] leading-snug text-[#14181d]/75">{line}</p>}
        {mark === "fork" && <ArrowDown aria-hidden className="mt-[1cqw] size-[7cqw] text-[#d9480f]" strokeWidth={3} />}
      </div>
      <div className="absolute bottom-[6%] right-[5%] top-[16%] flex w-[36%] items-center justify-center">
        {children ?? (
          <span className="grid aspect-square w-[78%] place-items-center rounded-full border-[3px]" style={{ borderColor: ring, color: ring }} aria-hidden>
            {mark === "fork" && <Utensils className="size-1/2" strokeWidth={1.6} />}
            {mark === "tick" && <Check className="size-1/2" strokeWidth={2.4} />}
            {mark === "cross" && <X className="size-1/2" strokeWidth={2.4} />}
            {mark === "scan" && <ScanLine className="size-1/2" strokeWidth={1.6} />}
          </span>
        )}
      </div>
    </div>
  );
}

/** A head-and-shoulders silhouette standing in for a face. */
export function Silhouette({ className = "", tone = "#8b9db5", style }: { className?: string; tone?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <circle cx="50" cy="38" r="17" fill={tone} />
      <path d="M18 100c0-20 14-33 32-33s32 13 32 33z" fill={tone} />
    </svg>
  );
}

/** A decorative QR-like pattern from a seed. It is not a valid code. */
export function PseudoQr({ seed, className = "" }: { seed: string; className?: string }) {
  const n = 17;
  let h = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const cells: [number, number][] = [];
  const finder = (x: number, y: number) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      h = (h * 1103515245 + 12345) >>> 0;
      if (!finder(x, y) && (h >> 16) % 2) cells.push([x, y]);
    }
  const box = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x + 0.5} y={y + 0.5} width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="currentColor" />
    </g>
  );
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} className={className} aria-hidden shapeRendering="crispEdges">
      <rect x="-1" y="-1" width={n + 2} height={n + 2} fill="white" />
      {box(0, 0)}
      {box(n - 7, 0)}
      {box(0, n - 7)}
      {cells.map(([x, y]) => (
        <rect key={`${x}.${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
      ))}
    </svg>
  );
}
