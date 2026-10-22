import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Project } from "@/content/types";
import { featuredProjects, knownList, projectHref, publishedProjects } from "@/lib/content";
import { previews } from "@/components/showcases/previews";
import { MediaFrame } from "@/components/media/media-frame";
import { MediaKind } from "@/components/media/media-kind";
import { WorkShowcase } from "./work-showcase";

/*
 * Selected work: the featured projects as a horizontal showcase. Each card
 * says what was built, why it matters and one proof point, then links to the
 * case study; everything else lives there.
 */
export function Work() {
  const featured = featuredProjects();
  const others = publishedProjects().filter((p) => !featured.includes(p));
  const inDev = others.filter((p) => p.development).length;
  const note = others.length > 0 && `${others.length} more${inDev ? ` (${inDev === others.length ? "in development" : `${inDev} in development`})` : ""}`;
  return (
    <section id="work" aria-labelledby="work-title" className="relative z-[var(--z-content)] bg-void">
      <WorkShowcase items={featured.map((p) => ({ slug: p.slug, label: p.homeCard?.label ?? p.title }))}>
        {featured.map((p, i) => (
          <WorkCard key={p.slug} project={p} n={i + 1} total={featured.length} />
        ))}
      </WorkShowcase>

      <div className="shell mt-[clamp(3rem,6vw,5rem)]">
        <Link href="/projects" className="group flex items-center justify-between gap-6 border-y border-line py-6 transition-colors hover:text-lime">
          <span className="t-h3">
            View all projects
            {note && <span className="ml-3 align-middle text-[0.9375rem] text-ink-2">{note}</span>}
          </span>
          <ArrowRight size={22} aria-hidden className="shrink-0 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}

/** Each card gets its own light: a soft glow in a different corner and accent. */
const GLOWS = [
  "radial-gradient(70% 60% at 0% 0%, rgb(182 255 59 / 0.07), transparent 70%)",
  "radial-gradient(70% 60% at 100% 0%, rgb(140 174 255 / 0.09), transparent 70%)",
  "radial-gradient(70% 60% at 0% 100%, rgb(140 174 255 / 0.07), transparent 70%)",
  "radial-gradient(70% 60% at 100% 100%, rgb(182 255 59 / 0.07), transparent 70%)",
];

function WorkCard({ project: p, n, total }: { project: Project; n: number; total: number }) {
  const c = p.homeCard;
  const Preview = previews[p.showcase];
  const shot = p.cover && p.cover.approved && p.cover.type === "image" ? p.cover : null;
  const href = projectHref(p);
  const flip = n % 2 === 0;
  const tags = (c?.tags ?? knownList(p.technologies)).slice(0, 3);
  const org = [p.organisation, p.collaboration && `in collaboration with the ${p.collaboration}`].filter(Boolean).join(" · ");

  return (
    <li className="work-card">
      <article
        aria-labelledby={`p-${p.slug}`}
        className="@container h-full rounded-[var(--r-lg)] bg-graphite p-4 ring-1 ring-line sm:p-5 xl:p-6"
        style={{ backgroundImage: GLOWS[(n - 1) % GLOWS.length] }}
      >
        <p className="t-meta flex flex-wrap gap-x-3 gap-y-1">
          <span className="text-ink">
            {String(n).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <span>{c?.category ?? p.category}</span>
        </p>

        <div className="mt-4 grid gap-x-8 gap-y-5 @3xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] @3xl:items-center">
          <figure className={flip ? "@3xl:order-2" : undefined}>
            {/* Decorative duplicate of the title link for pointer users. */}
            <a href={href} tabIndex={-1} aria-hidden className="group block">
              <div className="work-visual relative aspect-[16/10] overflow-hidden rounded-[var(--r-md)] transition-transform duration-[var(--d-slow)] ease-[var(--ease-out-expo)] group-hover:-translate-y-1">
                {shot ? (
                  <div className="h-full rounded-[var(--r-md)] bg-[#e9edf3] p-1.5">
                    <MediaFrame media={{ ...shot, aspect: "auto" }} sizes="(min-width: 1024px) 45vw, 86vw" fit="contain" eager={n === 1} tags={false} className="h-full bg-white" />
                  </div>
                ) : (
                  Preview && (
                    <div className="pv-zoom">
                      <Preview />
                    </div>
                  )
                )}
              </div>
            </a>
            <figcaption className="mt-2.5">
              {shot ? (
                <MediaKind media={shot} />
              ) : (
                <span className="t-meta inline-flex items-center gap-2 text-[0.6875rem]">
                  <span aria-hidden className="size-1.5 rounded-full bg-ice" />
                  {c?.visualNote ?? "Illustrative schematic · synthetic data"}
                </span>
              )}
            </figcaption>
          </figure>

          <div>
            <h3 id={`p-${p.slug}`} className="font-display text-[clamp(1.75rem,1.2rem+1.3vw,2.75rem)] font-medium leading-[1.02] tracking-[var(--track-heading)]">
              <a href={href} className="transition-colors hover:text-lime">
                {p.title}
              </a>
            </h3>
            {org && <p className="mt-2 text-[0.9375rem] text-ink-2">{org}</p>}
            <p data-copy className="mt-3 text-[1.125rem] leading-snug">{c?.headline ?? p.homeHeadline ?? p.summary}</p>
            {c?.summary && <p data-copy className="mt-3 max-w-[52ch] text-[0.9375rem] leading-normal text-ink-2">{c.summary}</p>}
            {tags.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Key technologies">
                {tags.map((t) => (
                  <li key={t} className="rounded-[var(--r-xs)] border border-line-strong px-2 py-1 text-[0.8125rem]">
                    {t}
                  </li>
                ))}
              </ul>
            )}
            {c?.proof && (
              <p data-copy className="mt-4 flex gap-2.5 text-[0.9375rem]">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-lime" />
                {c.proof}
              </p>
            )}
            <a
              href={href}
              className="group/cta mt-4 inline-flex min-h-11 items-center gap-2 rounded-[var(--r-sm)] border border-line-strong px-4 text-[0.9375rem] font-medium transition-colors hover:border-lime hover:text-lime"
            >
              {p.ctaLabel ?? "Explore case study"}
              <span className="sr-only">: {p.title}</span>
              <ArrowRight size={16} aria-hidden className="transition-transform group-hover/cta:translate-x-0.5" />
            </a>
          </div>
        </div>
      </article>
    </li>
  );
}
