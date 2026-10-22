import { Check } from "lucide-react";
import type { Experience, Project } from "@/content/types";
import { experienceHref, known, knownList, visibleMedia } from "@/lib/content";
import { formatRange } from "@/lib/format";
import { demos } from "@/components/showcases/demos";
import { SchematicLabel } from "@/components/ui/schematic-label";
import { Prose, type DetailSection } from "./detail-body";
import { CapabilityGrid, DecisionList, Disclosure, FeatureList, OutcomeList, confirmedDecisions, confirmedFeatures, confirmedOutcomes } from "./structured";
import { RelatedCards } from "./related-nav";
import { PlatformTour } from "./platform-tour";

/*
 * Six-chapter layout for a project with a `story`: the business story first,
 * guided demos second, and every piece of technical depth behind an opt-in
 * disclosure. Nothing technical is removed; it moves.
 */

const DEMO_NOTE = "Guided demonstration with made-up data, simplified from the production logic.";

/** The technical text of a deep dive, with its advanced demo, steps and limitations. */
function Mechanism({ project, diveId, demoLabel }: { project: Project; diveId: string; demoLabel?: string }) {
  const dive = project.deepDives?.find((d) => d.id === diveId);
  if (!dive) return null;
  const Demo = dive.demo ? demos[dive.demo] : null;
  const steps = knownList(dive.steps?.items);
  const limits = knownList(dive.limitations);
  return (
    <div className="space-y-6 pt-2">
      <Prose paragraphs={knownList(dive.intro)} lead={false} />
      {Demo && (
        <div>
          <div className="mb-3">
            <SchematicLabel>{demoLabel ?? dive.demoLabel ?? "Interactive technical demonstration. Synthetic and simplified."}</SchematicLabel>
          </div>
          <Demo />
        </div>
      )}
      {steps.length > 0 && (
        <div>
          <p className="t-meta mb-3">{dive.steps!.title}</p>
          <ol className="max-w-[62ch] space-y-2.5">
            {steps.map((s, i) => (
              <li key={s} className="flex gap-3 text-[0.9375rem]">
                <span className="t-meta w-6 shrink-0 pt-0.5 text-ice">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      )}
      {limits.length > 0 && (
        <aside aria-label="Current limitations" className="max-w-[62ch] border-l-2 border-[var(--c-warn)]/60 pl-4">
          <p className="t-meta mb-1">Current limitations</p>
          {limits.map((l) => (
            <p key={l} className="text-[0.9375rem]">
              {l}
            </p>
          ))}
        </aside>
      )}
    </div>
  );
}

export function storySections(p: Project, roles: Experience[]): DetailSection[] {
  const story = p.story!;
  const h = story.headings;
  const ownership = confirmedFeatures(p.ownership ?? []);
  const decisions = confirmedDecisions(p.decisions);
  const capabilities = confirmedFeatures(p.capabilities ?? []);
  const limits = confirmedFeatures(p.nextSteps ?? []);
  const outcomes = confirmedOutcomes(p.outcomes);
  const Problem = p.problemFigure ? demos[p.problemFigure] : null;
  const Architecture = p.architectureFigure ? demos[p.architectureFigure] : null;
  const FinanceLead = story.financeLead ? demos[story.financeLead] : null;

  // Only approved (or, in dev, pending) screens; never an empty media panel.
  const screens = (p.walkthrough ?? [])
    .filter((w) => visibleMedia([w.media]).length > 0 && w.media.approved)
    .map((w) => ({ media: w.media, title: w.media.title ?? w.title, caption: story.tourCaptions[w.media.id] ?? (w.does as string) }));
  const featured = story.tourFeatured.map((id) => screens.find((s) => s.media.id === id)).filter((s) => !!s);
  const more = screens.filter((s) => !story.tourFeatured.includes(s.media.id));

  return [
    {
      id: "project",
      title: "The project",
      heading: h.project,
      body: (
        <div className="space-y-8">
          <ul className="grid gap-3 md:grid-cols-3">
            {story.glance.map((g) => (
              <li key={g.label} data-reveal className="rounded-[var(--r-md)] bg-graphite p-5">
                <p className="t-meta text-ice">{g.label}</p>
                <p className="mt-2 text-[1.0625rem] leading-snug">{g.text}</p>
              </li>
            ))}
          </ul>
          {known(p.role) && ownership.length > 0 && (
            <div className="border-b border-line">
              <Disclosure summary="What I worked on">
                <div className="space-y-6">
                  <Prose paragraphs={[p.role]} lead={false} />
                  <FeatureList features={ownership} />
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
          <Prose paragraphs={knownList(p.problem)} lead={false} />
          {Problem && (
            <div data-reveal>
              <Problem />
            </div>
          )}
          <div>
            <p className="t-meta mb-3">What could go wrong</p>
            <ul className="grid gap-3 md:grid-cols-3">
              {story.problemPoints.map((pt, i) => (
                <li key={pt} data-reveal className="flex gap-3 rounded-[var(--r-md)] border border-line p-4 text-[0.9375rem]">
                  <span className="t-meta pt-0.5 text-[var(--c-warn)]">{String(i + 1).padStart(2, "0")}</span>
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "platform",
      title: "Inside the platform",
      heading: h.platform,
      body: featured.length > 0 && <PlatformTour featured={featured} more={more} />,
    },
    {
      id: "solution",
      title: "How I solved it",
      heading: h.solution,
      body: (
        <div className="space-y-[clamp(3.5rem,7vw,5.5rem)]">
          <p className="max-w-[62ch] text-ink-2">{story.solutionIntro}</p>
          {story.demos.map((d, n) => {
            const Guided = demos[d.guided];
            return (
              <article key={d.id} id={d.id} aria-labelledby={`${d.id}-q`} className="scroll-mt-[calc(var(--nav-h)+1.5rem)]">
                <p className="t-meta text-lime">Problem {n + 1}</p>
                <h3 id={`${d.id}-q`} className="mt-2 max-w-[28ch] text-[clamp(1.375rem,1.1rem+1vw,1.75rem)] font-medium leading-tight">
                  {d.question}
                </h3>
                <p className="mt-3 max-w-[60ch] text-ink-2">{d.context}</p>
                <div className="mt-6" data-reveal>
                  <div className="mb-3">
                    <SchematicLabel>{DEMO_NOTE}</SchematicLabel>
                  </div>
                  <Guided />
                </div>
                <div className="mt-6 border-b border-line">
                  <Disclosure summary={d.advancedLabel}>
                    <Mechanism project={p} diveId={d.deepDive} />
                  </Disclosure>
                </div>
              </article>
            );
          })}
        </div>
      ),
    },
    {
      id: "engineering",
      title: "Behind the engineering",
      heading: h.engineering,
      body: (
        <div>
          <p className="mb-6 max-w-[62ch] text-ink-2">{story.engineeringIntro}</p>
          <div className="border-b border-line">
            {Architecture && (
              <Disclosure summary="View architecture">
                <Architecture />
              </Disclosure>
            )}
            {story.financeDive && (
              <Disclosure summary="Accurate financial reporting">
                <div className="space-y-6">
                  {FinanceLead && <FinanceLead />}
                  <div className="rounded-[var(--r-md)] border border-line px-4">
                    <Disclosure summary="Cost of goods and the technical detail">
                      <Mechanism project={p} diveId={story.financeDive} />
                    </Disclosure>
                  </div>
                </div>
              </Disclosure>
            )}
            {decisions.length > 0 && (
              <Disclosure summary="Engineering decisions and trade-offs">
                <DecisionList decisions={decisions} />
              </Disclosure>
            )}
            {capabilities.length > 0 && (
              <Disclosure summary="Everything else the platform does">
                <CapabilityGrid items={capabilities} />
              </Disclosure>
            )}
            {limits.length > 0 && (
              <Disclosure summary="Technical considerations and known limits">
                <FeatureList features={limits} />
              </Disclosure>
            )}
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
          {outcomes.length > 0 && <OutcomeList outcomes={outcomes} />}
          {known(p.builtLine) && (
            <p className="flex max-w-[62ch] gap-3 border-l-2 border-lime pl-4">
              <Check size={18} aria-hidden className="mt-1 shrink-0 text-lime" />
              <span>
                <span className="t-meta mb-1 block">My contribution</span>
                {p.builtLine}
              </span>
            </p>
          )}
          {roles.length > 0 && (
            <div>
              <p className="t-meta mb-4">Where this was built</p>
              <RelatedCards
                items={roles.map((e) => ({
                  href: experienceHref(e),
                  eyebrow: formatRange(e.start, e.end),
                  title: e.organisation,
                  text: `${e.role}. ${e.summary}`,
                }))}
              />
            </div>
          )}
        </div>
      ),
    },
  ];
}
