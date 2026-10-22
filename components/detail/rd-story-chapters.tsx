import { Check, CircleCheck, CircleDashed, Clock } from "lucide-react";
import type { CapabilityStatus, Experience, Project } from "@/content/types";
import { experienceHref, knownList, projectHref, publishedProjects } from "@/lib/content";
import { formatRange } from "@/lib/format";
import { demos } from "@/components/showcases/demos";
import { SchematicLabel } from "@/components/ui/schematic-label";
import { Prose, type DetailSection } from "./detail-body";
import { Disclosure, FeatureList } from "./structured";
import { RelatedCards } from "./related-nav";

/*
 * Five chapters for work in progress: overview, problem, prototype concept,
 * engineering (mostly open questions), and what's next. Each pipeline stage
 * carries its status, so the page can't make unfinished work look finished.
 */

const STATUS: Record<CapabilityStatus, { label: string; icon: typeof Check; tone: string }> = {
  implemented: { label: "Implemented", icon: CircleCheck, tone: "text-lime" },
  "in-development": { label: "In development", icon: Clock, tone: "text-[var(--c-warn)]" },
  planned: { label: "Planned · design stage", icon: CircleDashed, tone: "text-ice" },
};

export function StatusTag({ status }: { status: CapabilityStatus }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[0.8125rem] ${s.tone}`}>
      <s.icon size={14} aria-hidden />
      {s.label}
    </span>
  );
}

export function rdStorySections(p: Project, roles: Experience[]): DetailSection[] {
  const s = p.rdStory!;
  const h = s.headings;
  const Explorer = demos[s.explorer];
  const Diagram = demos[s.next.diagram];
  const related = publishedProjects().filter((x) => s.related.includes(x.slug));

  return [
    {
      id: "overview",
      title: "Overview",
      heading: h.overview,
      body: (
        <div className="space-y-8">
          <Prose paragraphs={knownList(p.overview)} />
          <ul className="grid gap-3 md:grid-cols-3">
            {s.glance.map((g) => (
              <li key={g.label} data-reveal className="rounded-[var(--r-md)] bg-graphite p-5">
                <p className="t-meta text-ice">{g.label}</p>
                <p className="mt-2 text-[1.0625rem] leading-snug">{g.text}</p>
              </li>
            ))}
          </ul>
          <div data-reveal>
            <p className="t-meta mb-3">Where each part stands{p.development ? ` · updated ${p.development.updated}` : ""}</p>
            <ol className="overflow-hidden rounded-[var(--r-md)] border border-line">
              {s.stages.map((st, i) => (
                <li key={st.name} className="grid gap-x-6 gap-y-1 border-t border-line px-5 py-4 first:border-t-0 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:items-center">
                  <span className="t-meta">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block font-medium">{st.name}</span>
                    <span className="block text-[0.9375rem] text-ink-2">{st.what}</span>
                  </span>
                  <StatusTag status={st.status} />
                </li>
              ))}
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: "problem",
      title: "The problem",
      heading: h.problem,
      body: (
        <div className="space-y-8">
          <Prose paragraphs={s.problem.paragraphs} lead={false} />
          <div data-reveal className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[var(--r-md)] bg-graphite p-5">
              <p className="t-meta text-lime">Design hypothesis</p>
              <p className="mt-2 text-[1.0625rem] leading-snug">{s.problem.hypothesis}</p>
            </div>
            <div className="rounded-[var(--r-md)] border border-dashed border-line-strong p-5">
              <p className="t-meta">Not yet shown</p>
              <p className="mt-2 text-ink-2">{s.problem.caveat}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "prototype",
      title: "How the prototype works",
      heading: h.prototype,
      body: (
        <div className="space-y-5">
          <p className="max-w-[62ch] text-ink-2">{s.explorerIntro}</p>
          <SchematicLabel>{s.explorerNote}</SchematicLabel>
          <div data-reveal>
            <Explorer />
          </div>
        </div>
      ),
    },
    {
      id: "engineering",
      title: "Engineering",
      heading: h.engineering,
      body: (
        <div className="space-y-8">
          <p className="max-w-[62ch] text-ink-2">{s.engineeringIntro}</p>
          <div className="border-b border-line">
            {s.sections.map((sec) => (
              <Disclosure key={sec.id} summary={sec.title}>
                <div className="space-y-6">
                  <Prose paragraphs={sec.paragraphs} lead={false} />
                  {sec.points && sec.points.length > 0 && <FeatureList features={sec.points} />}
                </div>
              </Disclosure>
            ))}
          </div>
          <div data-reveal className="rounded-[var(--r-md)] bg-graphite p-5 sm:p-6">
            <p className="t-meta text-lime">Designing responsibly</p>
            <p className="mt-2 max-w-[60ch] text-ink-2">The project is in a public space, so these are the principles its design follows. They are intentions, not compliance claims.</p>
            <ul className="mt-4 grid gap-x-6 gap-y-2.5 md:grid-cols-2">
              {s.principles.map((pr) => (
                <li key={pr} className="flex gap-2.5">
                  <Check size={16} aria-hidden className="mt-1 shrink-0 text-lime" />
                  {pr}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "next",
      title: "What's next",
      heading: h.next,
      body: (
        <div className="space-y-8">
          <Prose paragraphs={s.next.paragraphs} lead={false} />
          <div data-reveal>
            <Diagram />
          </div>
          <div>
            <p className="t-meta mb-3">Any version of this would need</p>
            <ul className="flex flex-wrap gap-2">
              {s.next.guardrails.map((g) => (
                <li key={g} className="rounded-[var(--r-pill)] border border-line-strong px-3 py-1.5 text-[0.875rem]">
                  {g}
                </li>
              ))}
            </ul>
          </div>
          {(related.length > 0 || roles.length > 0) && (
            <div>
              <p className="t-meta mb-4">Related work</p>
              <RelatedCards
                items={[
                  ...related.map((x) => ({ href: projectHref(x), eyebrow: "Case study", title: x.title, text: x.summary })),
                  ...roles.map((e) => ({ href: experienceHref(e), eyebrow: formatRange(e.start, e.end), title: e.organisation, text: `${e.role}. ${e.summary}` })),
                ]}
              />
            </div>
          )}
        </div>
      ),
    },
  ];
}
