import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { knownList, projectHref, publishedProjects } from "@/lib/content";
import { DevelopmentBadge } from "@/components/detail/detail-hero";

export const metadata: Metadata = {
  title: "Projects",
  description: "Every published project: what it is, where it was built and the technologies behind it.",
  alternates: { canonical: "/projects" },
};

/** All published projects, in content order. */
export default function ProjectsIndex() {
  const projects = publishedProjects();
  return (
    <main id="content" className="pb-[clamp(4rem,8vw,7rem)]">
      <header className="shell pt-[calc(var(--nav-h)+clamp(2rem,6vh,4.5rem))]">
        <Link href="/#work" className="inline-flex min-h-11 items-center gap-2 text-[0.9375rem] text-ink-2 transition-colors hover:text-ink">
          <ArrowLeft size={16} aria-hidden />
          Selected work
        </Link>
        <h1 className="t-h1 mt-6">Projects</h1>
        <p className="t-lead mt-5 max-w-[52ch]">
          Each one opens a case study: what I built, how it fits together and the technologies behind it.
        </p>
      </header>

      <ol className="shell mt-[clamp(3rem,6vw,5rem)]">
        {projects.map((p, i) => {
          const stack = knownList(p.technologies).slice(0, 4);
          return (
            <li key={p.slug} className="border-t border-line last:border-b">
              <a href={projectHref(p)} className="group grid-12 gap-y-3 py-8">
                <span className="t-meta col-span-full pt-2 md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                <span className="col-span-full md:col-span-7 lg:col-span-6">
                  <span className="t-h3 flex items-start gap-2 transition-colors group-hover:text-lime">
                    {p.title}
                    <ArrowUpRight size={20} aria-hidden className="mt-1 shrink-0 text-ink-2 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lime" />
                  </span>
                  {p.development && <DevelopmentBadge className="mt-3 w-fit">{p.development.label}</DevelopmentBadge>}
                  <span className="mt-2 block max-w-[56ch] text-ink">{p.summary}</span>
                </span>
                <span className="col-span-full text-[0.9375rem] text-ink-2 md:col-span-8 md:col-start-2 lg:col-span-4 lg:col-start-9 lg:pt-2">
                  {[p.organisation, p.category].filter(Boolean).join(" · ")}
                  {p.collaboration && <span className="mt-1 block">Industry collaboration: {p.collaboration}</span>}
                  {stack.length > 0 && <span className="mt-1 block">{stack.join(" · ")}</span>}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
