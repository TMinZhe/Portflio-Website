import { Check, CircleDashed, CircleCheck, Minus } from "lucide-react";
import type { Experience, Project } from "@/content/types";
import { experienceHref, known, knownList, projectHref, publishedProjects, visibleMedia } from "@/lib/content";
import { formatRange } from "@/lib/format";
import { demos } from "@/components/showcases/demos";
import { SchematicLabel } from "@/components/ui/schematic-label";
import { Gallery } from "@/components/media/gallery";
import { Prose, type DetailSection } from "./detail-body";
import { DecisionList, Disclosure, FeatureList, confirmedDecisions, confirmedFeatures } from "./structured";
import { RelatedCards } from "./related-nav";

/*
 * Six chapters for a physical, field-tested project: overview, challenge, a
 * guided simulation, engineering stories, the real-world trial, and what came
 * after. Shorter than the software case studies; technical depth is opt-in.
 */

function Story({ st }: { st: NonNullable<Project["fieldStory"]>["stories"][number] }) {
  return (
    <article id={st.id} aria-labelledby={`${st.id}-h`} className="scroll-mt-[calc(var(--nav-h)+1.5rem)]">
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
}

export function fieldStorySections(p: Project, roles: Experience[]): DetailSection[] {
  const s = p.fieldStory!;
  const h = s.headings;
  const Simulator = demos[s.simulator];
  const decisions = confirmedDecisions(p.decisions);
  const limits = confirmedFeatures(p.nextSteps ?? []);
  const fieldMedia = visibleMedia(s.validation.media);
  const deckMedia = visibleMedia(s.startup.media);
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
              <Disclosure summary="What I was responsible for">
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
      id: "challenge",
      title: "The challenge",
      heading: h.challenge,
      body: (
        <div className="space-y-8">
          <Prose paragraphs={s.challenge.paragraphs} lead={false} />
          <div data-reveal className="overflow-hidden rounded-[var(--r-md)] border border-line">
            <div className="hidden grid-cols-2 bg-graphite md:grid">
              <p className="t-meta px-5 py-3">The difficulty</p>
              <p className="t-meta px-5 py-3 text-lime">How the kiosk handles it</p>
            </div>
            <ul>
              {s.challenge.pairs.map((pair) => (
                <li key={pair.problem} className="grid border-t border-line first:border-t-0 md:grid-cols-2 md:first:border-t">
                  <p className="flex gap-2.5 px-5 pb-1 pt-4 text-ink-2 md:py-4">
                    <Minus size={16} aria-hidden className="mt-1 shrink-0" />
                    <span>
                      <span className="sr-only">Difficulty: </span>
                      {pair.problem}
                    </span>
                  </p>
                  <p className="flex gap-2.5 px-5 pb-4 pt-1 md:border-l md:border-line md:py-4">
                    <CircleCheck size={16} aria-hidden className="mt-1 shrink-0 text-lime" />
                    <span>
                      <span className="sr-only">Response: </span>
                      {pair.response}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "how",
      title: "See how it works",
      heading: h.how,
      body: (
        <div className="space-y-5">
          <p className="max-w-[62ch] text-ink-2">{s.howIntro}</p>
          <SchematicLabel>{s.simulatorNote}</SchematicLabel>
          <div data-reveal>
            <Simulator />
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
          <p className="max-w-[62ch] text-ink-2">{s.engineeringIntro}</p>
          {s.stories.map((st) => (
            <Story key={st.id} st={st} />
          ))}
          {(decisions.length > 0 || limits.length > 0) && (
            <div>
              <p className="t-meta mb-2">More engineering detail</p>
              <div className="border-b border-line">
                {decisions.length > 0 && (
                  <Disclosure summary="Design trade-offs">
                    <DecisionList decisions={decisions} />
                  </Disclosure>
                )}
                {limits.length > 0 && (
                  <Disclosure summary="Known limitations">
                    <FeatureList features={limits} />
                  </Disclosure>
                )}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "validation",
      title: "Real-world validation",
      heading: h.validation,
      body: (
        <div className="space-y-10">
          <Prose paragraphs={s.validation.paragraphs} lead={false} />
          <dl className="grid gap-3 sm:grid-cols-3">
            {s.validation.facts.map((f) => (
              <div key={f.label} data-reveal className="rounded-[var(--r-md)] bg-graphite p-5">
                <dt className="t-meta">{f.label}</dt>
                <dd className="mt-3 font-display text-[clamp(1.625rem,1.3rem+1.2vw,2.25rem)] leading-none tracking-[var(--track-heading)]">{f.value}</dd>
                <dd className="mt-3 text-[0.8125rem] text-ink-2">{f.source}</dd>
              </div>
            ))}
          </dl>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="t-meta mb-3">Feedback and trials</p>
              <ul className="space-y-3">
                {s.validation.feedback.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Check size={17} aria-hidden className="mt-1 shrink-0 text-lime" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[var(--r-md)] border border-dashed border-line-strong p-5">
              <p className="t-meta mb-3">Not measured</p>
              <ul className="space-y-2 text-ink-2">
                {s.validation.unmeasured.map((u) => (
                  <li key={u} className="flex gap-2.5">
                    <CircleDashed size={15} aria-hidden className="mt-1 shrink-0" />
                    {u}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[0.8125rem] text-ink-2">No figures exist for these, so none are quoted.</p>
            </div>
          </div>
          {fieldMedia.length > 0 && <Gallery items={fieldMedia} />}
        </div>
      ),
    },
    {
      id: "startup",
      title: "From project to startup",
      heading: h.startup,
      body: (
        <div className="space-y-10">
          <Prose paragraphs={s.startup.paragraphs} lead={false} />
          <ol data-reveal className="grid gap-px overflow-hidden rounded-[var(--r-md)] bg-line sm:grid-cols-5">
            {s.startup.milestones.map((m, n) => (
              <li key={m.text} className={`p-4 ${n === s.startup.milestones.length - 1 ? "bg-elevated" : "bg-void"}`}>
                <p className={`t-meta ${n === s.startup.milestones.length - 1 ? "text-lime" : ""}`}>{m.when}</p>
                <p className="mt-2 text-[0.9375rem] leading-snug">{m.text}</p>
              </li>
            ))}
          </ol>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[var(--r-md)] bg-graphite p-5">
              <p className="t-meta text-lime">Built and used at the event</p>
              <ul className="mt-3 space-y-2">
                {s.startup.delivered.map((d) => (
                  <li key={d} className="flex gap-2.5">
                    <CircleCheck size={16} aria-hidden className="mt-1 shrink-0 text-lime" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[var(--r-md)] border border-dashed border-line-strong p-5">
              <p className="t-meta text-ice">Proposed for Scantry, not built</p>
              <ul className="mt-3 space-y-2 text-ink-2">
                {s.startup.proposed.map((d) => (
                  <li key={d} className="flex gap-2.5">
                    <CircleDashed size={16} aria-hidden className="mt-1 shrink-0 text-ice" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {deckMedia.length > 0 && (
            <div>
              <p className="t-meta mb-4">From the pitch deck</p>
              <Gallery items={deckMedia} />
            </div>
          )}
          <div>
            <p className="t-meta mb-3">Reflection</p>
            <div className="max-w-[62ch] space-y-4 border-l-2 border-lime pl-4">
              {s.reflection.map((r, i) => (
                <p key={i} className={i === 0 ? "text-[1.125rem] leading-snug" : "text-ink"}>
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
