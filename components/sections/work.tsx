import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/content/types";
import { homepageProjects, isDraft, known, knownList, projectHref } from "@/lib/content";
import { SchematicLabel } from "@/components/ui/schematic-label";
import { Action } from "@/components/ui/action";
import { showcases } from "@/components/showcases";
import { confirmedOutcomes } from "@/components/detail/structured";
import { ExpandingStage } from "./expanding-stage";

/** Scene E — selected work. Each project gets its own stage treatment. */
export function Work() {
  const list = homepageProjects();
  const lead = list.find((p) => p.featured) ?? list[0];
  const rest = list.filter((p) => p !== lead);
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

      {rest.length > 0 && (
        <div className="shell mt-[var(--section-y)]">
          <h3 className="t-h3 text-ink-2">More work</h3>
          <ul className="mt-6 border-t border-line">
            {rest.map((p) => (
              <li key={p.slug} className="border-b border-line">
                <a href={projectHref(p)} className="group grid-12 gap-y-1 py-6">
                  <span className="t-h3 col-span-full transition-colors group-hover:text-lime md:col-span-4">{p.title}</span>
                  <span className="col-span-full text-ink-2 md:col-span-5">{p.summary}</span>
                  <span className="t-meta col-span-full inline-flex items-start gap-2 md:col-span-3 md:justify-end">
                    {isDraft(p.status) && <span className="text-[var(--c-warn)]">draft</span>}
                    {p.organisation ?? "Personal"}
                    <ArrowUpRight size={15} aria-hidden className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function LeadProject({ project: p }: { project: Project }) {
  const Show = showcases[p.showcase];
  const stack = knownList(p.technologies).slice(0, 3);
  const outcome = confirmedOutcomes(p.outcomes)[0];
  const facts = [
    known(p.problemLine) && { title: "The problem", body: p.problemLine },
    known(p.builtLine) && { title: "What I built", body: p.builtLine },
    outcome && { title: "Outcome", body: `${outcome.value ? `${outcome.value} ` : ""}${outcome.label as string}` },
  ].filter(Boolean) as { title: string; body: string }[];

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
          <p className="t-lead mt-5 max-w-[44ch] text-ink">{p.summary}</p>
        </div>
        <div className="col-span-full self-end lg:col-span-4 lg:col-start-9">
          {stack.length > 0 && <p className="mb-5 text-[0.9375rem] text-ink-2">{stack.join(" · ")}</p>}
          <Action href={projectHref(p)} variant="primary">
            Explore project
          </Action>
        </div>
      </header>

      {Show && (
        <ExpandingStage className="mt-12 bg-[radial-gradient(80%_60%_at_20%_0%,rgb(140_174_255/0.08),transparent_60%),var(--c-elevated)] py-[clamp(2rem,5vw,5rem)]">
          <div className="shell">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <SchematicLabel />
            </div>
            <Show />
          </div>
        </ExpandingStage>
      )}

      {facts.length > 0 && (
        <div className="shell grid-12 mt-12 gap-y-10">
          {facts.map((f) => (
            <div key={f.title} className="col-span-full border-t border-line pt-4 md:col-span-4">
              <h4 className="mb-3 text-[0.9375rem] text-ink-2">{f.title}</h4>
              <p className="text-[1.0625rem] leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
