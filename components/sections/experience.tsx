import { ArrowUpRight } from "lucide-react";
import { experienceHref, known, publishedExperience } from "@/lib/content";
import { confirmedOutcomes } from "@/components/detail/structured";
import { formatRange } from "@/lib/format";

/** Experience: one editorial row per role, newest first, each linking to its page. */
export function Experience() {
  const roles = publishedExperience();
  return (
    <section id="experience" aria-labelledby="exp-title" className="relative z-[var(--z-content)] bg-void pt-[var(--section-y)]">
      <div className="shell grid-12 gap-y-10">
        <h2 id="exp-title" className="t-h1 col-span-full">
          Experience
        </h2>
        <ol className="col-span-full lg:col-span-9 lg:col-start-4">
          {roles.map((e) => {
            const outcome = confirmedOutcomes(e.outcomes).find((o) => o.value);
            return (
              <li key={e.slug} data-reveal className="grid gap-x-8 gap-y-4 border-t border-line py-10 md:grid-cols-[10rem_1fr]">
                <p className="t-meta pt-1.5">{formatRange(e.start, e.end)}</p>
                <div>
                  <h3 className="t-h3">
                    <a href={experienceHref(e)} className="group inline-flex items-start gap-2 transition-colors hover:text-lime">
                      {e.organisation}
                      <ArrowUpRight size={20} aria-hidden className="mt-1 shrink-0 text-ink-2 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lime" />
                    </a>
                  </h3>
                  <p className="mt-1 text-ink-2">{e.role}</p>
                  <p className="mt-5 max-w-[56ch] text-[1.0625rem]">{e.summary}</p>
                  <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.9375rem] text-ink-2">
                    {e.contributions.slice(0, 3).map((c) => (
                      <li key={c.title} className="before:mr-2 before:text-ice before:content-['/']">
                        {c.title}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
                    {outcome && known(outcome.label) && (
                      <p className="flex items-baseline gap-3">
                        <span className="font-display text-[2.25rem] leading-none tracking-[var(--track-display)] text-lime">{outcome.value}</span>
                        <span className="max-w-[24ch] text-[0.9375rem]">{outcome.label}</span>
                      </p>
                    )}
                    <a
                      href={experienceHref(e)}
                      className="inline-flex min-h-11 items-center text-[0.9375rem] underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-lime"
                    >
                      View experience<span className="sr-only">: {e.organisation}</span>
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
