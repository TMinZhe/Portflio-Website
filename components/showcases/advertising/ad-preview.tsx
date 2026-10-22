import { ArrowRight } from "lucide-react";
import { decide, scenario } from "./explorer-model";
import { AdCreative, Walkway } from "./ad-parts";

/*
 * Still preview for the homepage card and the case-study cover: camera view →
 * pedestrian analysis → advertisement selection → display, with fictional
 * data. Decorative to assistive tech; the caller labels it as a concept.
 */

const s = scenario("slow");
const d = decide(s.people);

export function AdPipelinePreview() {
  return (
    <div aria-hidden className="flex h-full flex-col gap-4 rounded-[var(--r-md)] bg-[linear-gradient(160deg,#121922_0%,var(--c-graphite)_60%)] p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[0.9375rem]">
          <span className="size-2 rounded-full bg-[var(--c-warn)]" />
          Concept · in development
        </p>
        <p className="t-meta">Fictional scene</p>
      </div>
      <div className="grid flex-1 items-center gap-3 sm:grid-cols-[minmax(0,1.5fr)_auto_minmax(0,0.75fr)]">
        <div>
          <Walkway people={s.people} animate={false} label="Camera view" />
          <div className="mt-2 grid grid-cols-2 gap-2 text-[0.75rem]">
            <span className="rounded-[var(--r-xs)] bg-void px-2 py-1.5">
              <span className="text-lime">{d.viewers.length}</span> slow walkers
            </span>
            <span className="rounded-[var(--r-xs)] bg-void px-2 py-1.5">Est. audience 25–44</span>
          </div>
        </div>
        <ArrowRight size={18} className="hidden text-ink-2 sm:block" />
        <div className="rounded-[12px] bg-[#0f1318] p-1.5 ring-1 ring-line-strong">
          <div className="aspect-[4/5] overflow-hidden rounded-[7px]">
            <AdCreative ad={d.ad} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {["Detect", "Measure pace", "Select", "Display"].map((k, i) => (
          <div key={k} className="rounded-[var(--r-sm)] bg-[var(--c-void)] px-1 py-2">
            <p className="t-meta text-[0.5625rem]">0{i + 1}</p>
            <p className="mt-0.5 text-[0.75rem] text-ice">{k}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
