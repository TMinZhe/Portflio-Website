import { ArrowRight } from "lucide-react";
import type { DeepDive, WorkflowCompare } from "@/content/types";
import { known, knownList } from "@/lib/content";
import { demos } from "@/components/showcases/demos";
import { SchematicLabel } from "@/components/ui/schematic-label";
import { Prose } from "./detail-body";

/** Before and after as two rows of steps. Always labelled as a reconstruction. */
export function WorkflowDiagram({ workflow }: { workflow: WorkflowCompare }) {
  const row = (label: string, steps: string[], after: boolean) => (
    <div data-reveal className="grid gap-3 md:grid-cols-[6rem_1fr]">
      <p className={`t-meta pt-3 ${after ? "text-lime" : ""}`}>{label}</p>
      <ol className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span
              className={`rounded-[var(--r-sm)] px-3 py-2.5 text-[0.9375rem] ${
                after ? "bg-elevated text-ink ring-1 ring-ice/40" : "bg-graphite text-ink-2"
              }`}
            >
              {s}
            </span>
            {i < steps.length - 1 && <ArrowRight size={15} aria-hidden className="hidden shrink-0 text-ink-2 sm:block" />}
          </li>
        ))}
      </ol>
    </div>
  );
  return (
    <figure className="mt-10 space-y-5">
      {row("Before", workflow.before, false)}
      {row("After", workflow.after, true)}
      {known(workflow.note) && <figcaption className="text-[0.875rem] text-ink-2 md:pl-[7.5rem]">{workflow.note}</figcaption>}
    </figure>
  );
}

/** One engineering highlight: the explanation, the synthetic demo, its steps and its limits. */
export function DeepDiveBody({ dive }: { dive: DeepDive }) {
  const Demo = dive.demo ? demos[dive.demo] : null;
  const steps = knownList(dive.steps?.items);
  const limits = knownList(dive.limitations);
  return (
    <div className="space-y-8">
      <Prose paragraphs={knownList(dive.intro)} />
      {Demo && (
        <div data-reveal>
          <div className="mb-3">
            <SchematicLabel>{dive.demoLabel ?? "Interactive recreation with synthetic data. Not the client's system or records."}</SchematicLabel>
          </div>
          <Demo />
        </div>
      )}
      {steps.length > 0 && (
        <details className="group rounded-[var(--r-md)] bg-graphite" open={!dive.steps!.collapsed}>
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 font-medium [&::-webkit-details-marker]:hidden">
            {dive.steps!.title}
            <span aria-hidden className="text-[1.25rem] text-ink-2 transition-transform duration-[var(--d-fast)] group-open:rotate-45">
              +
            </span>
          </summary>
          <ol className={`grid gap-x-8 gap-y-3 px-5 pb-6 ${dive.steps!.collapsed ? "" : "sm:grid-cols-2"}`}>
            {steps.map((s, i) => (
              <li key={s} className="flex gap-3 text-[0.9375rem]">
                <span className="t-meta w-6 shrink-0 pt-0.5 text-ice">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </details>
      )}
      {limits.length > 0 && (
        <aside aria-label="Current limitations" className="max-w-[62ch] border-l-2 border-[var(--c-warn)]/60 pl-4">
          <p className="t-meta mb-1">Current limitations</p>
          {limits.map((l) => (
            <p key={l} className="text-[0.9375rem] text-ink">
              {l}
            </p>
          ))}
        </aside>
      )}
    </div>
  );
}
