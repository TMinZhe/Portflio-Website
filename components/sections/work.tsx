import { visibleProjects } from "@/content/projects";
import type { Project } from "@/content/types";
import { T } from "@/components/ui/content-text";
import { SchematicLabel } from "@/components/ui/schematic-label";
import { OpsConsole } from "@/components/showcases/ops-console";
import { ExpandingStage } from "./expanding-stage";

/** Scene E — selected work. Each project gets its own stage treatment. */
export function Work() {
  const [lead, ...rest] = visibleProjects;
  return (
    <section id="work" aria-labelledby="work-title" className="relative z-[var(--z-content)] bg-void pt-[var(--section-y)]">
      <div className="shell grid-12 items-end gap-y-6">
        <h2 id="work-title" className="t-h1 col-span-full lg:col-span-7">
          Selected work
        </h2>
        <p className="col-span-full max-w-[46ch] text-ink-2 lg:col-span-4 lg:col-start-9">
          Most of this work belongs to clients, so the interactive pieces are schematics of what each system does,
          rebuilt with synthetic data. No private screens are shown.
        </p>
      </div>

      {lead && <LeadProject project={lead} />}

      <div className="shell mt-[var(--section-y)]">
        <h3 className="t-h3 text-ink-2">Also in progress</h3>
        <ul className="mt-6 border-t border-line">
          {rest.map((p) => (
            <li key={p.slug} className="grid-12 gap-y-1 border-b border-line py-6">
              <span className="t-h3 col-span-full md:col-span-4">{p.title}</span>
              <span className="col-span-full text-ink-2 md:col-span-5">{p.oneLiner}</span>
              <span className="t-meta col-span-full md:col-span-3 md:text-right">
                {p.organisation ?? "Personal"}, showcase in progress
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function LeadProject({ project: p }: { project: Project }) {
  return (
    <article aria-labelledby={`p-${p.slug}`} className="mt-[clamp(3rem,6vw,6rem)]">
      <header className="shell grid-12 gap-y-6">
        <div className="col-span-full lg:col-span-7">
          <p className="mb-4 text-[0.9375rem] text-ink-2">
            {p.category}, {p.organisation}
          </p>
          <h3 id={`p-${p.slug}`} className="t-h2 max-w-[18ch]">
            {p.title}
          </h3>
          <p className="t-lead mt-5 max-w-[44ch] text-ink">{p.oneLiner}</p>
        </div>
        <dl className="col-span-full grid grid-cols-2 gap-x-6 gap-y-4 self-end border-t border-line pt-5 text-[0.9375rem] lg:col-span-4 lg:col-start-9">
          <div>
            <dt className="text-ink-2">Role</dt>
            <dd className="mt-1">
              <T value={p.role} />
            </dd>
          </div>
          <div>
            <dt className="text-ink-2">Case study</dt>
            <dd className="mt-1">In progress</dd>
          </div>
        </dl>
      </header>

      <ExpandingStage className="mt-12 bg-[radial-gradient(80%_60%_at_20%_0%,rgb(140_174_255/0.08),transparent_60%),var(--c-elevated)] py-[clamp(2rem,5vw,5rem)]">
        <div className="shell">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <SchematicLabel />
          </div>
          <OpsConsole />
        </div>
      </ExpandingStage>

      <div className="shell grid-12 mt-12 gap-y-10">
        <Fact title="The problem" className="lg:col-span-4">
          <T value={p.problem} />
        </Fact>
        <Fact title="What I built" className="lg:col-span-4">
          <ul className="space-y-1">
            {p.built.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </Fact>
        <Fact title="Outcome" className="lg:col-span-4">
          {p.outcomes.map((o, i) => (
            <T key={i} value={o} />
          ))}
        </Fact>
      </div>
    </article>
  );
}

function Fact({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`col-span-full border-t border-line pt-4 md:col-span-4 ${className}`}>
      <h4 className="mb-3 text-[0.9375rem] text-ink-2">{title}</h4>
      <div className="text-[1.0625rem] leading-relaxed">{children}</div>
    </div>
  );
}
