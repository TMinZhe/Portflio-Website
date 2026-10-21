"use client";

import { useId, useMemo, useState } from "react";
import { IMPACT_LABELS, LIKELIHOOD_LABELS, QUARTERS, type Quarter } from "./risk-matrix-data";
import { GRID, MARKER, VIEW, band, layout, markerSvg, movements, previousQuarter, type Marker } from "./risk-matrix-geometry";

const bandFill: Record<ReturnType<typeof band>, string> = {
  low: "rgb(140 174 255 / 0.10)",
  medlow: "rgb(140 174 255 / 0.22)",
  medhigh: "rgb(255 181 71 / 0.22)",
  high: "rgb(255 107 107 / 0.26)",
};
const arrowColour = { worse: "var(--c-warn)", better: "var(--c-lime)", sideways: "var(--c-ice)" };

/**
 * Interactive recreation of the ERM risk matrix on synthetic data: quarterly
 * movement with ghost markers and trimmed arrows. `still` renders a static
 * frame for the homepage.
 */
export function RiskMatrix({ still = false }: { still?: boolean }) {
  const [quarter, setQuarter] = useState<Quarter>(still ? "Q2 2026" : "Q4 2026");
  const [arrows, setArrows] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const markerId = useId().replace(/:/g, "");

  const markers = useMemo(() => layout(quarter), [quarter]);
  const moves = useMemo(() => movements(quarter, markers), [quarter, markers]);
  const prev = previousQuarter(quarter);
  const focus = active ? markers.find((m) => m.id === active && !m.ghost) : undefined;
  const focusGhost = active ? markers.find((m) => m.id === active && m.ghost) : undefined;
  const focusMove = active ? moves.find((m) => m.id === active) : undefined;

  const svg = (
    <svg
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      className="h-auto w-full select-none"
      role="img"
      aria-label={`Synthetic risk matrix for ${quarter}: ${markers.filter((m) => !m.ghost).length} risks, ${moves.length} moved since ${prev ?? "the previous quarter"}.`}
    >
      <defs>
        {(["worse", "better", "sideways"] as const).map((d) => (
          <marker key={d} id={`${markerId}-${d}`} viewBox="0 0 8 8" refX="4" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill={arrowColour[d]} />
          </marker>
        ))}
      </defs>

      {/* Axes */}
      <text x={GRID.left + (GRID.cols * GRID.cellW) / 2} y={15} textAnchor="middle" className="fill-[var(--c-text-2)] text-[13px]">
        Impact →
      </text>
      {IMPACT_LABELS.map((l, i) => (
        <text key={l} x={GRID.left + i * GRID.cellW + GRID.cellW / 2} y={36} textAnchor="middle" className="fill-[var(--c-text-2)] text-[12px]">
          {l}
        </text>
      ))}
      {LIKELIHOOD_LABELS.map((l, i) => (
        <text
          key={l}
          x={GRID.left - 8}
          y={GRID.top + (GRID.rows - 1 - i) * GRID.cellH + GRID.cellH / 2 + 4}
          textAnchor="end"
          className="fill-[var(--c-text-2)] text-[12px]"
        >
          {l}
        </text>
      ))}

      {/* Cells */}
      {Array.from({ length: GRID.rows * GRID.cols }, (_, k) => {
        const col = k % GRID.cols;
        const row = Math.floor(k / GRID.cols);
        const pos = { likelihood: GRID.rows - row, impact: col + 1 };
        return (
          <g key={k}>
            <rect
              x={GRID.left + col * GRID.cellW + 1}
              y={GRID.top + row * GRID.cellH + 1}
              width={GRID.cellW - 2}
              height={GRID.cellH - 2}
              rx={4}
              fill={bandFill[band(pos)]}
            />
            <text x={GRID.left + col * GRID.cellW + 8} y={GRID.top + row * GRID.cellH + 16} className="fill-[var(--c-text-3)] text-[11px] tabular-nums">
              {pos.likelihood * pos.impact}
            </text>
          </g>
        );
      })}

      {/* Arrows (steps 6–8) */}
      {arrows &&
        moves.map((mv) => (
          <path
            key={mv.id}
            d={mv.path}
            stroke={arrowColour[mv.direction]}
            strokeWidth={active === mv.id ? 2.25 : 1.5}
            strokeOpacity={active && active !== mv.id ? 0.25 : 0.95}
            markerEnd={`url(#${markerId}-${mv.direction})`}
            className="transition-[stroke-opacity] duration-[var(--d-fast)]"
          />
        ))}

      {/* Markers (steps 3 and 5) */}
      {markers.map((m) => (
        <MarkerShape
          key={`${m.id}-${m.ghost ? "g" : "c"}`}
          m={m}
          dim={!!active && active !== m.id}
          on={active === m.id}
          interactive={!still}
          onActive={setActive}
        />
      ))}

      {/* Legend */}
      <g transform={`translate(${GRID.left}, ${VIEW.h - 18})`} className="text-[12px]">
        <ellipse cx={10} cy={0} rx={10} ry={5} fill="none" stroke="var(--c-text-2)" strokeDasharray="3 2" />
        <text x={26} y={4} className="fill-[var(--c-text-2)]">
          previous quarter
        </text>
        <ellipse cx={138} cy={0} rx={10} ry={5} fill="var(--c-text)" />
        <text x={154} y={4} className="fill-[var(--c-text-2)]">
          current
        </text>
        <line x1={232} y1={0} x2={256} y2={0} stroke="var(--c-warn)" strokeWidth={1.5} />
        <text x={262} y={4} className="fill-[var(--c-text-2)]">
          worse
        </text>
        <line x1={318} y1={0} x2={342} y2={0} stroke="var(--c-lime)" strokeWidth={1.5} />
        <text x={348} y={4} className="fill-[var(--c-text-2)]">
          better
        </text>
      </g>
    </svg>
  );

  if (still) return <div className="rounded-[var(--r-md)] bg-graphite p-3 sm:p-5">{svg}</div>;

  return (
    <div className="rounded-[var(--r-md)] bg-graphite p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Quarter" className="flex flex-wrap gap-1.5">
          {QUARTERS.map((q) => (
            <button
              key={q}
              type="button"
              role="radio"
              aria-checked={quarter === q}
              onClick={() => setQuarter(q)}
              className={`min-h-11 rounded-[var(--r-xs)] px-3 text-[0.875rem] transition-colors ${
                quarter === q ? "bg-lime text-[var(--c-lime-ink)]" : "border border-line-strong text-ink-2 hover:text-ink"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-[0.875rem] text-ink-2">
          <input type="checkbox" checked={arrows} onChange={(e) => setArrows(e.target.checked)} className="size-4 accent-[var(--c-lime)]" />
          Movement arrows
        </label>
      </div>

      {/* Phones scroll the matrix sideways inside its panel rather than shrinking the labels. */}
      <div className="mt-4 overflow-x-auto overscroll-x-contain" tabIndex={0} aria-label="Risk matrix, scrollable">
        <div className="min-w-[36rem]">{svg}</div>
      </div>

      <div aria-live="polite" className="mt-4 grid gap-4 rounded-[var(--r-sm)] bg-void p-4 md:grid-cols-[1fr_1.3fr]">
        {focus ? (
          <>
            <div>
              <p className="t-meta">{focus.id}</p>
              <p className="mt-1 font-medium">{focus.name}</p>
              <p className="mt-2 text-[0.9375rem] text-ink-2">
                Likelihood {focus.pos.likelihood} × impact {focus.pos.impact} = {focus.pos.likelihood * focus.pos.impact}
                {focusGhost && (
                  <>
                    <br />
                    In {prev}: {focusGhost.pos.likelihood} × {focusGhost.pos.impact} ={" "}
                    {focusGhost.pos.likelihood * focusGhost.pos.impact}
                    {focusMove && <span style={{ color: arrowColour[focusMove.direction] }}> · {focusMove.direction}</span>}
                  </>
                )}
                {!focusGhost && prev && (
                  <>
                    <br />
                    Unchanged since {prev}
                  </>
                )}
              </p>
            </div>
            <div className="min-w-0">
              <p className="t-meta mb-1.5">Generated markup, text escaped (step 9)</p>
              <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-[0.75rem] leading-relaxed text-ink-2">
                <code>{markerSvg(focus)}</code>
              </pre>
            </div>
          </>
        ) : (
          <p className="text-[0.9375rem] text-ink-2 md:col-span-2">
            {prev
              ? `${moves.length} of 8 risks moved since ${prev}. Hover or focus a marker to trace it; SR-07's name shows why text is escaped.`
              : "Q1 2026 has no earlier quarter, so nothing has moved yet. Pick a later quarter."}
          </p>
        )}
      </div>
    </div>
  );
}

function MarkerShape({
  m,
  dim,
  on,
  interactive,
  onActive,
}: {
  m: Marker;
  dim: boolean;
  on: boolean;
  interactive: boolean;
  onActive: (id: string | null) => void;
}) {
  const events = interactive
    ? {
        tabIndex: m.ghost ? -1 : 0,
        role: m.ghost ? undefined : "button",
        "aria-label": m.ghost ? undefined : `${m.id}, ${m.name}: likelihood ${m.pos.likelihood}, impact ${m.pos.impact}`,
        onMouseEnter: () => onActive(m.id),
        onMouseLeave: () => onActive(null),
        onFocus: () => onActive(m.id),
        onBlur: () => onActive(null),
        onClick: () => onActive(on ? null : m.id),
      }
    : {};
  return (
    <g
      {...events}
      className={`outline-none transition-[transform,opacity] duration-[var(--d-slow)] ease-[var(--ease-out-expo)] ${interactive && !m.ghost ? "cursor-pointer" : ""}`}
      style={{ transform: `translate(${m.x}px, ${m.y}px)`, opacity: dim ? 0.3 : 1 }}
    >
      <ellipse
        rx={MARKER.rx}
        ry={MARKER.ry}
        fill={m.ghost ? "transparent" : on ? "var(--c-lime)" : "var(--c-text)"}
        stroke={m.ghost ? (on ? "var(--c-lime)" : "var(--c-text-2)") : "var(--c-void)"}
        strokeDasharray={m.ghost ? "3 2" : undefined}
        strokeWidth={m.ghost ? 1.25 : 1}
      />
      <text textAnchor="middle" y={3.5} className={`text-[10px] font-medium ${m.ghost ? "fill-[var(--c-text-2)]" : "fill-[var(--c-void)]"}`}>
        {m.id.replace("SR-", "")}
      </text>
    </g>
  );
}
