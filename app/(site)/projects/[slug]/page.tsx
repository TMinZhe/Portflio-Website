import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  adjacentProjects,
  experienceForProject,
  experienceHref,
  getProject,
  isDraft,
  known,
  knownList,
  projectHref,
  routableProjects,
  visibleMedia,
} from "@/lib/content";
import { formatRange } from "@/lib/format";
import { Action } from "@/components/ui/action";
import { DetailHero } from "@/components/detail/detail-hero";
import { DetailCover } from "@/components/detail/cover";
import { DetailBody, Prose, type DetailSection } from "@/components/detail/detail-body";
import {
  ChallengeList,
  DecisionList,
  FeatureList,
  OutcomeList,
  confirmedChallenges,
  confirmedDecisions,
  confirmedFeatures,
  confirmedOutcomes,
} from "@/components/detail/structured";
import { ArchitectureDiagram } from "@/components/detail/architecture-diagram";
import { Gallery } from "@/components/media/gallery";
import { Walkthrough } from "@/components/detail/walkthrough";
import { DeepDiveBody, WorkflowDiagram } from "@/components/detail/case-study";
import { PageFooterNav, RelatedCards } from "@/components/detail/related-nav";

type Props = { params: Promise<{ slug: string }> };

/**
 * Every routable slug is prerendered, so letting the route block costs nothing
 * and the page can read params directly. Unknown and draft slugs are turned
 * away with a real 404 in proxy.ts before this renders; notFound() below is
 * the backstop.
 */
export const instant = false;

export function generateStaticParams() {
  return routableProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  const cover = visibleMedia(p.cover ? [p.cover] : []).find((m) => m.approved && m.type === "image");
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: projectHref(p) },
    openGraph: {
      type: "article",
      title: p.title,
      description: p.summary,
      url: projectHref(p),
      ...(cover ? { images: [{ url: cover.src, alt: cover.alt }] } : {}),
    },
    ...(isDraft(p.status) ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const roles = experienceForProject(p);
  const { prev, next } = adjacentProjects(p.slug);
  const technologies = knownList(p.technologies);
  const features = confirmedFeatures(p.features);
  const decisions = confirmedDecisions(p.decisions);
  const challenges = confirmedChallenges(p.challenges);
  const outcomes = confirmedOutcomes(p.outcomes);
  const gallery = visibleMedia(p.gallery);
  const figure = outcomes.find((o) => o.value && o.kind !== "capability");

  const solution = known(p.solution) ? p.solution : null;
  const h = p.headings ?? {};
  const ownership = confirmedFeatures(p.ownership ?? []);
  const walkthrough = (p.walkthrough ?? [])
    .filter((w) => visibleMedia([w.media]).length > 0 && known(w.does) && known(w.why))
    .map((w) => ({ ...w, does: w.does as string, why: w.why as string, engineering: known(w.engineering) ? w.engineering : undefined }));
  const archNotes = confirmedFeatures(p.architectureNotes ?? []);
  const nextSteps = confirmedFeatures(p.nextSteps ?? []);
  const resultsIntro = knownList(p.resultsIntro);

  const sections: DetailSection[] = [
    { id: "overview", title: "Overview", body: knownList(p.overview).length > 0 && <Prose paragraphs={knownList(p.overview)} /> },
    {
      id: "problem",
      title: "The problem",
      heading: h.problem,
      body: knownList(p.problem).length > 0 && (
        <>
          <Prose paragraphs={knownList(p.problem)} lead={false} />
          {p.workflow && <WorkflowDiagram workflow={p.workflow} />}
        </>
      ),
    },
    {
      id: "role",
      title: "My role",
      heading: h.role,
      body: known(p.role) && (
        <div className="space-y-8">
          <Prose paragraphs={[p.role]} lead={false} />
          {ownership.length > 0 && <FeatureList features={ownership} />}
        </div>
      ),
    },
    {
      id: "solution",
      title: "Solution and features",
      heading: h.solution,
      body: (solution || features.length > 0) && (
        <div className="space-y-8">
          {solution && <Prose paragraphs={[solution]} lead={false} />}
          {features.length > 0 && <FeatureList features={features} />}
        </div>
      ),
    },
    { id: "walkthrough", title: "Walkthrough", heading: h.walkthrough, body: walkthrough.length > 0 && <Walkthrough items={walkthrough} /> },
    ...(p.deepDives ?? []).map((d) => ({ id: d.id, title: d.label, heading: d.heading, body: <DeepDiveBody dive={d} /> })),
    {
      id: "architecture",
      title: "Architecture",
      heading: h.architecture,
      body: p.architecture && (
        <div className="space-y-8">
          <ArchitectureDiagram data={p.architecture} title={p.title} />
          {archNotes.length > 0 && <FeatureList features={archNotes} />}
        </div>
      ),
    },
    { id: "decisions", title: "Engineering decisions", heading: h.decisions, body: decisions.length > 0 && <DecisionList decisions={decisions} /> },
    { id: "challenges", title: "Challenges", heading: h.challenges, body: challenges.length > 0 && <ChallengeList challenges={challenges} /> },
    {
      id: "results",
      title: "Results",
      heading: h.results,
      body: outcomes.length > 0 && (
        <div className="space-y-8">
          {resultsIntro.length > 0 && <Prose paragraphs={resultsIntro} />}
          <OutcomeList outcomes={outcomes} />
        </div>
      ),
    },
    { id: "next-steps", title: "Constraints and next steps", heading: h["next-steps"], body: nextSteps.length > 0 && <FeatureList features={nextSteps} /> },
    { id: "gallery", title: "Screens and media", heading: h.gallery, body: gallery.length > 0 && <Gallery items={gallery} /> },
    { id: "lessons", title: "Reflection", heading: h.lessons, body: knownList(p.lessons).length > 0 && <Prose paragraphs={knownList(p.lessons)} lead={false} /> },
    {
      id: "context",
      title: "Where this was built",
      heading: h.context,
      body: roles.length > 0 && (
        <RelatedCards
          items={roles.map((e) => ({
            href: experienceHref(e),
            eyebrow: formatRange(e.start, e.end),
            title: e.organisation,
            text: `${e.role}. ${e.summary}`,
          }))}
        />
      ),
    },
  ];

  const org = [p.organisation, p.client && `for ${p.client}`].filter(Boolean).join(" ");
  const repo = p.links.repo;
  const demo = p.links.demo;

  return (
    <main id="content">
      <DetailHero
        draft={isDraft(p.status)}
        back={{ href: "/#work", label: "Selected work" }}
        eyebrow={p.facts ? p.category : [p.category, org].filter(Boolean).join(" · ")}
        title={p.title}
        headline={p.headline}
        summary={p.summary}
        figure={figure?.value ? { value: figure.value, label: figure.label as string } : undefined}
        meta={p.facts ?? [
          ...(org ? [{ label: "Built at", value: org }] : []),
          ...(known(p.timeframe) ? [{ label: "When", value: p.timeframe }] : []),
          { label: "Category", value: p.category },
          ...(p.confidential ? [{ label: "Visuals", value: "Client work: schematics use synthetic data" }] : []),
        ]}
        chips={technologies}
        actions={
          (demo?.href || repo?.href) && (
            <>
              {demo?.href && (
                <Action href={demo.href} variant="primary" external>
                  {demo.label}
                </Action>
              )}
              {repo?.href && (
                <Action href={repo.href} external>
                  {repo.label}
                </Action>
              )}
            </>
          )
        }
      />
      <DetailCover cover={p.cover} showcase={p.showcase} allowStill={!p.deepDives?.some((d) => d.demo)} />
      <DetailBody sections={sections} />
      <PageFooterNav
        kind="project"
        prev={prev && { href: projectHref(prev), title: prev.title }}
        next={next && { href: projectHref(next), title: next.title }}
        back={{ href: "/#work", label: "Back to selected work" }}
      />
    </main>
  );
}
