import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Project } from "@/content/types";
import { featuredProjects, known, knownList, projectHref, publishedProjects } from "@/lib/content";
import { Action } from "@/components/ui/action";
import { previews } from "@/components/showcases/previews";
import { confirmedOutcomes } from "@/components/detail/structured";
import { MediaFrame } from "@/components/media/media-frame";

/** Selected work: up to three featured projects as alternating editorial spreads. */
export function Work() {
  const featured = featuredProjects();
  const more = publishedProjects().length > featured.length;
  return (
    <section id="work" aria-labelledby="work-title" className="relative z-[var(--z-content)] bg-void pt-[var(--section-y)]">
      <div className="shell grid-12 items-end gap-y-6">
        <h2 id="work-title" className="t-h1 col-span-full lg:col-span-7">
          Selected work
        </h2>
        <p className="col-span-full max-w-[44ch] text-ink-2 lg:col-span-4 lg:col-start-9">
          Most of this work belongs to clients, so the visuals are schematics of what each system does, drawn with
          synthetic data. No private screens are shown.
        </p>
      </div>

      <div className="mt-[clamp(3rem,7vw,7rem)] space-y-[clamp(5rem,10vw,10rem)]">
        {featured.map((p, i) => (
          <Feature key={p.slug} project={p} n={i + 1} flip={i % 2 === 1} />
        ))}
      </div>

      <div className="shell mt-[clamp(4rem,8vw,8rem)]">
        <Link
          href="/projects"
          className="group flex items-center justify-between gap-6 border-y border-line py-6 transition-colors hover:text-lime"
        >
          <span className="t-h3">{more ? "View all projects" : "All projects"}</span>
          <ArrowRight size={22} aria-hidden className="shrink-0 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}

function Feature({ project: p, n, flip }: { project: Project; n: number; flip: boolean }) {
  const Preview = previews[p.showcase];
  // A real, approved screenshot leads when there is one; otherwise the schematic.
  const shot = p.cover && p.cover.approved && p.cover.type === "image" ? p.cover : null;
  const stack = knownList(p.technologies).slice(0, p.highlights?.length ? 6 : 3);
  const scope = confirmedOutcomes(p.outcomes).find((o) => o.value && o.kind !== "capability");
  const href = projectHref(p);
  const org = [p.organisation, p.client && `for ${p.client}`].filter(Boolean).join(" ");
  const lead = p.homeHeadline ?? (known(p.problemLine) ? p.problemLine : null);

  return (
    <article aria-labelledby={`p-${p.slug}`} className="shell grid-12 items-center gap-y-8">
      {(shot || Preview) && (
        // Duplicate of the title link for pointer users; hidden from keyboard and screen readers.
        <a
          href={href}
          tabIndex={-1}
          aria-hidden
          data-reveal
          className={`group col-span-full block max-lg:order-2 lg:col-span-7 lg:row-start-1 ${flip ? "lg:col-start-6" : "lg:col-start-1"}`}
        >
          <div className="transition-transform duration-[var(--d-slow)] ease-[var(--ease-out-expo)] group-hover:-translate-y-1.5">
            {shot ? (
              <div className="rounded-[var(--r-md)] bg-[#e9edf3] p-1.5 sm:p-2">
                <MediaFrame media={shot} sizes="(min-width: 1024px) 55vw, 100vw" fit="contain" className="bg-white" />
              </div>
            ) : (
              Preview && <Preview />
            )}
          </div>
          <p className="mt-3 text-[0.8125rem] text-ink-2">
            {shot ? "The real application, with client details removed." : "Illustrative schematic, synthetic data."}
          </p>
        </a>
      )}

      <div
        data-reveal
        className={`col-span-full lg:col-span-5 lg:row-start-1 ${flip ? "lg:col-start-1 lg:pr-6" : "lg:col-start-8 lg:pl-6"}`}
      >
        <p className="t-meta">
          {String(n).padStart(2, "0")} / {p.category}
        </p>
        <h3 id={`p-${p.slug}`} className="mt-4 font-display text-[clamp(2rem,1.4rem+2.2vw,3.25rem)] font-medium leading-[1.02] tracking-[var(--track-heading)]">
          <a href={href} className="transition-colors hover:text-lime">
            {p.title}
          </a>
        </h3>
        {org && <p className="mt-3 text-ink-2">{org}</p>}
        {lead && <p className="mt-6 text-[1.1875rem] leading-snug text-ink">{lead}</p>}
        <p className="mt-4 max-w-[52ch] leading-relaxed text-ink-2">{known(p.builtLine) ? p.builtLine : p.summary}</p>
        {p.highlights && p.highlights.length > 0 && (
          <ul className="mt-5 space-y-1.5 text-[0.9375rem]">
            {p.highlights.slice(0, 3).map((h) => (
              <li key={h} className="flex gap-2.5">
                <span aria-hidden className="text-ice">
                  /
                </span>
                {h}
              </li>
            ))}
          </ul>
        )}
        {stack.length > 0 && <p className="mt-5 text-[0.875rem] text-ink-2">{stack.join(" · ")}</p>}
        {scope ? (
          <p className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-[clamp(2.5rem,2rem+2vw,3.5rem)] leading-none tracking-[var(--track-display)] text-lime">
              {scope.value}
            </span>
            <span className="max-w-[18ch] text-[0.9375rem]">{scope.label as string}</span>
          </p>
        ) : (
          known(p.outcomeLine) && (
            <p className="mt-6 flex gap-2.5 text-[0.9375rem]">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-lime" />
              {p.outcomeLine}
            </p>
          )
        )}
        <div className="mt-8">
          <Action href={href} variant="secondary">
            Explore case study
          </Action>
        </div>
      </div>
    </article>
  );
}
