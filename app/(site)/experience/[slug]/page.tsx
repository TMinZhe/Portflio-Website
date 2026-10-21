import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  experienceHref,
  getExperience,
  isDraft,
  known,
  knownList,
  projectHref,
  projectsForExperience,
  routableExperience,
  visibleMedia,
} from "@/lib/content";
import { formatRange } from "@/lib/format";
import { DetailHero } from "@/components/detail/detail-hero";
import { DetailCover } from "@/components/detail/cover";
import { Chips, DetailBody, Prose, type DetailSection } from "@/components/detail/detail-body";
import { OutcomeList, confirmedOutcomes } from "@/components/detail/structured";
import { Gallery } from "@/components/media/gallery";
import { PageFooterNav, RelatedCards } from "@/components/detail/related-nav";
import type { Contribution } from "@/content/types";

type Props = { params: Promise<{ slug: string }> };

/**
 * Every routable slug is prerendered, so letting the route block costs nothing
 * and the page can read params directly. Unknown and draft slugs are turned
 * away with a real 404 in proxy.ts before this renders; notFound() below is
 * the backstop.
 */
export const instant = false;

export function generateStaticParams() {
  return routableExperience().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const e = getExperience(slug);
  if (!e) return {};
  const title = `${e.role}, ${e.organisation}`;
  return {
    title,
    description: e.summary,
    alternates: { canonical: experienceHref(e) },
    openGraph: { type: "profile", title, description: e.summary, url: experienceHref(e) },
    ...(isDraft(e.status) ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function ExperiencePage({ params }: Props) {
  const { slug } = await params;
  const e = getExperience(slug);
  if (!e) notFound();

  const projects = projectsForExperience(e.slug);
  const routableSlugs = new Set(projects.map((p) => p.slug));
  const outcomes = confirmedOutcomes(e.outcomes);
  const gallery = visibleMedia(e.gallery);
  const technologies = knownList(e.technologies);
  const figure = outcomes.find((o) => o.value && o.kind !== "capability");

  const roles = routableExperience();
  const i = roles.findIndex((r) => r.slug === e.slug);
  const prev = roles[i - 1];
  const next = roles[i + 1];

  const sections: DetailSection[] = [
    { id: "context", title: "Company and work", body: known(e.context) && <Prose paragraphs={[e.context]} /> },
    {
      id: "responsibilities",
      title: "Responsibilities",
      body: knownList(e.responsibilities).length > 0 && (
        <ul className="max-w-[62ch] list-disc space-y-2 pl-5 marker:text-ink-2">
          {knownList(e.responsibilities).map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ),
    },
    {
      id: "contributions",
      title: "Contributions",
      body: e.contributions.length > 0 && <ContributionList items={e.contributions} linkable={routableSlugs} />,
    },
    {
      id: "projects",
      title: "Projects delivered",
      body: projects.length > 0 && (
        <RelatedCards
          items={projects.map((p) => ({ href: projectHref(p), eyebrow: p.category, title: p.title, text: p.summary }))}
        />
      ),
    },
    { id: "skills", title: "Technologies", body: technologies.length > 0 && <Chips items={technologies} label="Technologies used in this role" /> },
    { id: "learning", title: "Challenges and learning", body: knownList(e.lessons).length > 0 && <Prose paragraphs={knownList(e.lessons)} lead={false} /> },
    { id: "outcomes", title: "Outcomes", body: outcomes.length > 0 && <OutcomeList outcomes={outcomes} /> },
    { id: "gallery", title: "Gallery", body: gallery.length > 0 && <Gallery items={gallery} /> },
  ];

  return (
    <main id="content">
      <DetailHero
        draft={isDraft(e.status)}
        back={{ href: "/#experience", label: "Experience" }}
        eyebrow={`${e.role} · ${formatRange(e.start, e.end)}`}
        title={e.organisation}
        summary={e.summary}
        figure={figure?.value ? { value: figure.value, label: figure.label as string } : undefined}
        meta={[
          { label: "Position", value: e.role },
          { label: "Dates", value: formatRange(e.start, e.end) },
          ...(known(e.location) ? [{ label: "Location", value: e.location }] : []),
        ]}
        chips={technologies}
      />
      <DetailCover cover={e.cover} />
      <DetailBody sections={sections} />
      <PageFooterNav
        kind="role"
        prev={prev && { href: experienceHref(prev), title: prev.organisation }}
        next={next && { href: experienceHref(next), title: next.organisation }}
        back={{ href: "/#experience", label: "Back to experience" }}
      />
    </main>
  );
}

/** Editorial rows: what the work was, the tools, and a link to the case study when there is one. */
function ContributionList({ items, linkable }: { items: Contribution[]; linkable: Set<string> }) {
  return (
    <ol className="border-b border-line">
      {items.map((c) => (
        <li key={c.title} data-reveal className="grid gap-x-8 gap-y-3 border-t border-line py-6 md:grid-cols-[minmax(0,15rem)_1fr]">
          <h3 className="text-[1.0625rem] font-medium">{c.title}</h3>
          <div className="max-w-[58ch] space-y-3">
            {known(c.objective) && <p className="text-ink-2">{c.objective}</p>}
            {known(c.work) && <p>{c.work}</p>}
            {known(c.result) && <p className="text-ink">{c.result}</p>}
            {(c.technologies?.length || (c.project && linkable.has(c.project))) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {c.technologies && c.technologies.length > 0 && (
                  <p className="text-[0.875rem] text-ink-2">{c.technologies.join(" · ")}</p>
                )}
                {c.project && linkable.has(c.project) && (
                  <a href={projectHref({ slug: c.project })} className="text-[0.9375rem] text-ink underline decoration-line-strong underline-offset-4 hover:decoration-lime">
                    Read the case study
                  </a>
                )}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
