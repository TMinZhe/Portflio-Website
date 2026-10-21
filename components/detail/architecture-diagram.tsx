"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Maximize2, X } from "lucide-react";
import type { ArchitectureData, ArchitectureNode } from "@/content/types";

const kindLabel: Record<ArchitectureNode["kind"], string> = {
  client: "Client",
  service: "Service",
  data: "Data",
  external: "External",
  output: "Output",
};

/**
 * Architecture drawn from content data: nodes sit on a grid (columns follow the
 * data flow), edges are measured and drawn in SVG. Below md the flow turns
 * vertical. "Expand" opens it in a fullscreen dialog for closer reading.
 */
export function ArchitectureDiagram({ data, title }: { data: ArchitectureData; title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (expanded && !d.open) d.showModal();
    if (!expanded && d.open) d.close();
  }, [expanded]);

  return (
    <figure>
      <div className="rounded-[var(--r-md)] bg-graphite p-4 md:p-8" data-reveal>
        <Diagram data={data} />
      </div>
      <figcaption className="mt-3 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        {typeof data.note === "string" && <span className="max-w-[56ch] text-[0.9375rem] text-ink-2">{data.note}</span>}
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="-mt-2 inline-flex min-h-11 items-center gap-2 rounded-[var(--r-sm)] px-3 text-[0.875rem] text-ink-2 transition-colors hover:bg-graphite hover:text-ink"
        >
          <Maximize2 size={15} aria-hidden />
          Expand diagram
        </button>
      </figcaption>

      <dialog
        ref={dialogRef}
        aria-label={`${title} architecture`}
        onClose={() => setExpanded(false)}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-void/95 p-0 text-ink backdrop:bg-black/70 open:flex open:flex-col"
      >
        <div className="flex min-h-14 items-center px-[var(--gutter)] py-2">
          <p className="font-medium">{title}: architecture</p>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setExpanded(false)}
            className="ml-auto inline-flex size-11 items-center justify-center rounded-[var(--r-sm)] bg-graphite hover:bg-elevated"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="grid flex-1 place-items-center overflow-auto p-[var(--gutter)]">
          {expanded && (
            <div className="w-full max-w-[72rem] min-w-[40rem]">
              <Diagram data={data} wide />
            </div>
          )}
        </div>
      </dialog>
    </figure>
  );
}

type Path = { d: string; key: string };

function Diagram({ data, wide }: { data: ArchitectureData; wide?: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<Path[]>([]);
  const markerId = useId().replace(/:/g, "");
  const cols = Math.max(...data.nodes.map((n) => n.col));
  const rows = Math.max(...data.nodes.map((n) => n.row));

  const measure = useCallback(() => {
    const box = boxRef.current;
    if (!box) return;
    const origin = box.getBoundingClientRect();
    const rect = (id: string) => box.querySelector<HTMLElement>(`[data-node="${id}"]`)?.getBoundingClientRect();
    const next: Path[] = [];
    for (const e of data.edges) {
      const a = rect(e.from);
      const b = rect(e.to);
      if (!a || !b) continue;
      const horizontal = b.left >= a.right - 1;
      if (horizontal) {
        const x1 = a.right - origin.left;
        const y1 = a.top + a.height / 2 - origin.top;
        const x2 = b.left - origin.left - 6;
        const y2 = b.top + b.height / 2 - origin.top;
        const mx = (x1 + x2) / 2;
        next.push({ key: `${e.from}-${e.to}`, d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}` });
      } else {
        const down = b.top >= a.bottom - 1;
        const x1 = a.left + a.width / 2 - origin.left;
        const y1 = (down ? a.bottom : a.top) - origin.top;
        const x2 = b.left + b.width / 2 - origin.left;
        const y2 = (down ? b.top - 6 : b.bottom + 6) - origin.top;
        const my = (y1 + y2) / 2;
        next.push({ key: `${e.from}-${e.to}`, d: `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}` });
      }
    }
    setPaths(next);
  }, [data.edges]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (boxRef.current) ro.observe(boxRef.current);
    return () => ro.disconnect();
  }, [measure]);

  // Wide (dialog) always flows left to right; inline flips to vertical below md.
  const place = wide
    ? "[grid-column:var(--c)] [grid-row:var(--r)]"
    : "[grid-column:var(--r)] [grid-row:var(--c)] md:[grid-column:var(--c)] md:[grid-row:var(--r)]";
  const template = wide
    ? { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }
    : ({ "--cols": cols, "--rows": rows } as React.CSSProperties);

  return (
    <div
      ref={boxRef}
      role="img"
      aria-label={describe(data)}
      className={`relative grid items-center gap-x-3 gap-y-6 md:gap-x-[clamp(2.5rem,6vw,6rem)] ${
        wide ? "" : "grid-cols-[repeat(var(--rows),minmax(0,1fr))] gap-y-12 md:grid-cols-[repeat(var(--cols),minmax(0,1fr))] md:gap-y-6"
      }`}
      style={template}
    >
      <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
        <defs>
          <marker id={markerId} viewBox="0 0 8 8" refX="4" refY="4" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="var(--c-ice)" />
          </marker>
        </defs>
        {paths.map((p) => (
          <path key={p.key} d={p.d} fill="none" stroke="var(--c-ice)" strokeOpacity="0.7" strokeWidth="1.5" markerEnd={`url(#${markerId})`} />
        ))}
      </svg>
      {data.nodes.map((n) => (
        <div
          key={n.id}
          data-node={n.id}
          className={`relative rounded-[var(--r-sm)] px-2.5 py-2.5 hyphens-auto [overflow-wrap:break-word] md:px-4 md:py-3 ${place} ${
            n.kind === "service" ? "bg-elevated ring-1 ring-ice/50" : n.kind === "output" ? "bg-void" : "bg-elevated"
          }`}
          style={{ "--c": n.col, "--r": n.row } as React.CSSProperties}
        >
          <p className="text-[0.75rem] text-ice">{kindLabel[n.kind]}</p>
          <p className="mt-0.5 text-[0.875rem] font-medium leading-snug md:text-[1rem]">{n.label}</p>
          {n.tech && <p className="mt-1 text-[0.8125rem] text-ink-2">{n.tech}</p>}
        </div>
      ))}
    </div>
  );
}

function describe(data: ArchitectureData) {
  const label = (id: string) => data.nodes.find((n) => n.id === id)?.label ?? id;
  return `Architecture diagram. ${data.edges.map((e) => `${label(e.from)} feeds ${label(e.to)}`).join(". ")}.`;
}
