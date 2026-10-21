import { profile } from "@/content/profile";
import { publishedExperience } from "@/lib/content";
import { T } from "@/components/ui/content-text";
import { Action } from "@/components/ui/action";
import { AvatarStage } from "@/components/three/avatar-stage";
import { OpeningScroll } from "./opening-scroll";
import { formatMonth } from "@/lib/format";

/**
 * The hero: identity, positioning and current roles over the avatar. Content
 * is plain, readable HTML; motion only enhances it.
 */
export function Opening() {
  const currentRoles = publishedExperience().filter((e) => e.end === "present");
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
              {profile.links.resume.href && (
                <Action href={profile.links.resume.href} download>
                  Résumé
                </Action>
              )}
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

      <OpeningScroll />
    </div>
  );
}
