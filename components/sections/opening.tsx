import { profile } from "@/content/profile";
import { routableExperience } from "@/lib/content";
import { T } from "@/components/ui/content-text";
import { Action } from "@/components/ui/action";
import { AvatarStage } from "@/components/three/avatar-stage";
import { OpeningScroll } from "./opening-scroll";
import { formatMonth } from "@/lib/format";

/** Layers, top of the stack first. Evidence lines only restate the owner's described work. */
const strata = [
  {
    layer: 3,
    name: "01 / EXPERIENCE",
    line: "Built for real-world challenges.",
    evidence:
      "From enterprise risk management to inventory operations, I develop applications that support real business workflows.",
  },
  {
    layer: 2,
    name: "02 / ENGINEERING",
    line: "From requirements to working systems.",
    evidence:
      "I translate business needs into functional software, connecting interfaces, application logic, and data.",
  },
  {
    layer: 1,
    name: "03 / INTELLIGENCE",
    line: "Making data useful, not just available.",
    evidence:
      "I build solutions that support better decisions through stock recommendations, retrieval-augmented AI, and computer vision.",
  },
  {
    layer: 0,
    name: "04 / MINDSET",
    line: "Curious by nature. Practical by design.",
    evidence:
      "I approach engineering with a focus on understanding the problem, making thoughtful trade-offs, and building something people can actually use.",
  },
];

/**
 * Scene A + B. The avatar sits in a sticky layer behind two blocks of content:
 * the hero (identity, first viewport) and the transformation (the four strata
 * are walked through). Content is plain, readable HTML; motion
 * only enhances it.
 */
export function Opening() {
  const currentRoles = routableExperience().filter((e) => e.end === "present");
  return (
    <div id="top" data-opening className="relative">
      <div className="sticky top-0 -mb-[100svh] h-svh overflow-hidden">
        <AvatarStage />
      </div>

      {/* Scene A — hero */}
      <section aria-labelledby="hero-name" className="relative z-[var(--z-content)] flex min-h-svh flex-col">
        <div data-hero-inner className="shell grid-12 flex-1 content-end gap-y-8 pb-[clamp(2rem,6vh,5rem)] pt-[calc(var(--nav-h)+30svh)] md:pt-[calc(var(--nav-h)+40svh)] lg:pt-[calc(var(--nav-h)+8vh)]">
          <div className="col-span-full lg:col-span-8">
            <p className="mb-5 text-[0.9375rem] text-ink-2">{profile.study}</p>
            <h1 id="hero-name" className="t-hero">
              <T value={profile.name} />
            </h1>
            <p className="t-h3 mt-5 max-w-[22ch] text-ink md:mt-8">{profile.positioning}</p>
            <p className="t-lead mt-5 max-w-[52ch]">
              <T value={profile.intro} />
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Action href="#work" variant="primary">
                View work
              </Action>
              <Action href={profile.links.resume.href} pendingNote="Résumé not uploaded yet" download>
                Résumé
              </Action>
              <span className="mx-1 hidden h-6 w-px bg-line-strong xs:block" aria-hidden />
              <Action href={profile.links.github.href} variant="quiet" external>
                GitHub
              </Action>
              <Action href={profile.links.linkedin.href} variant="quiet" external>
                LinkedIn
              </Action>
            </div>
          </div>

          <aside aria-label="Current roles" className="col-span-full self-end lg:col-span-3 lg:col-start-10">
            <p className="mb-3 text-[0.875rem] text-ink-2">Currently</p>
            <ul className="divide-y divide-line border-y border-line">
              {currentRoles.map((e) => (
                <li key={e.slug} className="flex items-baseline justify-between gap-4 py-3">
                  <span>
                    <span className="block text-[0.9375rem] font-medium">{e.organisation}</span>
                    <span className="text-[0.875rem] text-ink-2">{e.role}</span>
                  </span>
                  <span className="t-meta shrink-0">since {formatMonth(e.start)}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* Scene B — transformation */}
      <section
        aria-labelledby="stack-title"
        data-transform
        className="relative z-[var(--z-content)] min-h-[220svh] md:min-h-[300svh]"
      >
        <div className="sticky top-0 flex h-svh items-end lg:items-center lg:pt-[var(--nav-h)]">
          <div className="shell grid-12 pb-8 lg:pb-0">
            <div className="col-span-full rounded-[var(--r-md)] bg-[linear-gradient(to_top,var(--c-void)_60%,transparent)] pt-10 lg:col-span-5 lg:bg-none lg:pt-0">
              <h2 id="stack-title" className="t-h2 max-w-[24ch]">
                I build systems that turn complex problems into practical solutions.
              </h2>
              <ol className="mt-6 max-w-[40rem] md:mt-8" data-strata>
                {strata.map((s) => (
                  <li
                    key={s.name}
                    data-layer={s.layer}
                    className="group grid grid-cols-[9.5rem_1fr] gap-x-4 border-t border-line py-2.5 transition-opacity duration-[var(--d-base)] md:py-3 [[data-js]_&]:opacity-55 [[data-js]_&[data-active]]:opacity-100"
                  >
                    <span className="t-meta pt-1 group-data-[active]:text-lime!">{s.name}</span>
                    <span>
                      <span className="block text-[1rem] font-medium md:text-[1.125rem]">{s.line}</span>
                      <span className="mt-1 hidden text-[0.9375rem] text-ink-2 sm:block">{s.evidence}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <OpeningScroll />
    </div>
  );
}
