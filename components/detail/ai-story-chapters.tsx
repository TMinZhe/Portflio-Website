import { ArrowRight, Check } from "lucide-react";
import type { Experience, Project } from "@/content/types";
import { experienceHref, known, knownList, projectHref, publishedProjects } from "@/lib/content";
import { formatRange } from "@/lib/format";
import { demos } from "@/components/showcases/demos";
import { SchematicLabel } from "@/components/ui/schematic-label";
import { Prose, type DetailSection } from "./detail-body";
import { DecisionList, Disclosure, FeatureList, OutcomeList, confirmedDecisions, confirmedOutcomes } from "./structured";
import { RelatedCards } from "./related-nav";

/*
 * Six chapters for an applied-AI case study. The default path is the product
 * story and two guided interactions; technical depth sits in disclosures.
 */

function Flow({ label, steps, after }: { label: string; steps: string[]; after?: boolean }) {
  return (
    <div className="grid gap-3 md:grid-cols-[8rem_1fr]">
      <p className={`t-meta pt-3 ${after ? "text-lime" : ""}`}>{label}</p>
      <ol className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span className={`rounded-[var(--r-sm)] px-3 py-2.5 text-[0.9375rem] ${after ? "bg-elevated ring-1 ring-ice/40" : "bg-graphite text-ink-2"}`}>{s}</span>
            {i < steps.length - 1 && <ArrowRight size={15} aria-hidden className="hidden shrink-0 text-ink-2 sm:block" />}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function aiStorySections(p: Project, roles: Experience[]): DetailSection[] {
  const s = p.aiStory!;
  const h = s.headings;
  const Chat = demos[s.chat];
  const Pipeline = demos[s.pipeline];
  const decisions = confirmedDecisions(p.decisions);
  const limits = knownList((p.nextSteps ?? []).map((f) => (known(f.what) ? f.what : undefined)));
  const outcomes = confirmedOutcomes(p.outcomes);
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
          {known(p.role) && (p.ownership?.length ?? 0) > 0 && (
            <div className="border-b border-line">
              <Disclosure summary="What I built">
                <div className="space-y-6">
                  <Prose paragraphs={[p.role]} lead={false} />
                  <FeatureList features={p.ownership!} />
                </div>
              </Disclosure>
            </div>
          )}
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
          <figure className="space-y-5" data-reveal>
            <Flow label="Without it" steps={s.problem.before} />
            <Flow label="With it" steps={s.problem.after} after />
          </figure>
          <p className="max-w-[56ch] border-l-2 border-ice pl-4 text-[1.125rem] leading-snug">{s.problem.challenge}</p>
        </div>
      ),
    },
    {
      id: "try",
      title: "Try the assistant",
      heading: h.try,
      body: (
        <div className="space-y-5">
          <p className="max-w-[62ch] text-ink-2">{s.tryIntro}</p>
          <div data-reveal>
            <Chat />
          </div>
          <SchematicLabel>{s.chatNote}</SchematicLabel>
        </div>
      ),
    },
    {
      id: "how",
      title: "How it works",
      heading: h.how,
      body: (
        <div className="space-y-6">
          <p className="max-w-[62ch] text-ink-2">{s.howIntro}</p>
          <div data-reveal>
            <div className="mb-3">
              <SchematicLabel>Guided walkthrough of the real pipeline&apos;s stages, with made-up data.</SchematicLabel>
            </div>
            <Pipeline />
          </div>
          <div className="border-b border-line">
            <Disclosure summary="Explore the engineering">
              <FeatureList features={s.engineering} />
            </Disclosure>
          </div>
        </div>
      ),
    },
    {
      id: "engineering",
      title: "Behind the engineering",
      heading: h.engineering,
      body: (
        <div className="space-y-[clamp(3rem,6vw,4.5rem)]">
          {s.stories.map((st) => {
            return (
              <article key={st.id} id={st.id} aria-labelledby={`${st.id}-h`} className="scroll-mt-[calc(var(--nav-h)+1.5rem)]">
                <p className="t-meta text-lime">{st.kicker}</p>
                <h3 id={`${st.id}-h`} className="mt-2 max-w-[30ch] text-[clamp(1.375rem,1.1rem+1vw,1.75rem)] font-medium leading-tight">
                  {st.heading}
                </h3>
                <div className="mt-4">
                  <Prose paragraphs={st.paragraphs} lead={false} />
                </div>
                {(st.visuals ?? []).map((key) => {
                  const Visual = demos[key];
                  return (
                    <div key={key} className="mt-6" data-reveal>
                      <Visual />
                    </div>
                  );
                })}
                {st.details && st.details.length > 0 && (
                  <div className="mt-5 border-b border-line">
                    <Disclosure summary={st.detailsLabel ?? "Technical detail"}>
                      <FeatureList features={st.details} />
                    </Disclosure>
                  </div>
                )}
              </article>
            );
          })}
          <div>
            <p className="t-meta mb-2">More engineering detail</p>
            <div className="border-b border-line">
              {s.archive.map((a) => (
                <Disclosure key={a.label} summary={a.label}>
                  <FeatureList features={a.items} />
                </Disclosure>
              ))}
              {decisions.length > 0 && (
                <Disclosure summary="Architectural trade-offs">
                  <DecisionList decisions={decisions} />
                </Disclosure>
              )}
              {limits.length > 0 && (
                <Disclosure summary="Known limitations and next steps">
                  <FeatureList features={p.nextSteps ?? []} />
                </Disclosure>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "impact",
      title: "Impact and reflection",
      heading: h.impact,
      body: (
        <div className="space-y-10">
          <Prose paragraphs={knownList(p.resultsIntro)} />
          {outcomes.length > 0 && <OutcomeList outcomes={outcomes} note={false} />}
          <dl className="grid gap-3 sm:grid-cols-3">
            {s.measured.map((m) => (
              <div key={m.label} className="rounded-[var(--r-md)] bg-graphite p-4">
                <dt className="t-meta">{m.label}</dt>
                <dd className="mt-2 font-display text-[1.75rem] leading-none tabular-nums">{m.value}</dd>
                <dd className="mt-2 text-[0.8125rem] text-ink-2">{m.note}</dd>
              </div>
            ))}
          </dl>
          <div>
            <p className="t-meta mb-3">Reflection</p>
            <div className="max-w-[62ch] space-y-4 border-l-2 border-lime pl-4">
              {s.reflection.map((r, i) => (
                <p key={i} className={i === 0 ? "flex gap-2 text-[1.125rem] leading-snug" : "text-ink"}>
                  {i === 0 && <Check size={18} aria-hidden className="mt-1 shrink-0 text-lime" />}
                  {r}
                </p>
              ))}
            </div>
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
