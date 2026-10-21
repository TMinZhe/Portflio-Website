import { experienceHref, isDraft, routableExperience } from "@/lib/content";
import { skillDomains } from "@/content/skills";
import { profile } from "@/content/profile";
import { T } from "@/components/ui/content-text";
import { Action } from "@/components/ui/action";
import { formatRange } from "@/lib/format";

/*
 * Interim versions of Scenes C, D, F and G for the visual checkpoint.
 * They hold real (or clearly placeholder) content so every nav link lands on
 * something readable. Phase 2 replaces them with the full designs.
 */

export function ExperienceInterim() {
  return (
    <section id="experience" aria-labelledby="exp-title" className="relative z-[var(--z-content)] bg-void py-[var(--section-y)]">
      <div className="shell grid-12 gap-y-10">
        <h2 id="exp-title" className="t-h1 col-span-full lg:col-span-4">
          Experience
        </h2>
        <ol className="col-span-full border-t border-line lg:col-span-8">
          {routableExperience().map((e) => (
            <li key={e.slug} className="grid gap-x-8 gap-y-3 border-b border-line py-8 md:grid-cols-[12rem_1fr]">
              <p className="t-meta">
                {formatRange(e.start, e.end)}
                {isDraft(e.status) && <span className="ml-2 text-[var(--c-warn)]">draft</span>}
              </p>
              <div>
                <h3 className="t-h3">{e.organisation}</h3>
                <p className="text-ink-2">{e.role}</p>
                <p className="mt-4 max-w-[56ch]">{e.summary}</p>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-2 marker:text-ink-2">
                  {e.contributions.slice(0, 3).map((c) => (
                    <li key={c.title}>{c.title}</li>
                  ))}
                </ul>
                <a
                  href={experienceHref(e)}
                  className="mt-5 inline-flex min-h-11 items-center text-[0.9375rem] underline decoration-line-strong underline-offset-4 hover:decoration-lime"
                >
                  View experience
                </a>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function AboutInterim() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative z-[var(--z-content)] bg-void py-[var(--section-y)]">
      <div className="shell grid-12 gap-y-8">
        <h2 id="about-title" className="t-h1 col-span-full lg:col-span-4">
          About
        </h2>
        <div className="col-span-full space-y-5 text-[1.25rem] leading-relaxed lg:col-span-7">
          <p>
            <T value={{ placeholder: "Why computer science: a specific moment or problem that pulled you in" }} />
          </p>
          <p>
            <T value={{ placeholder: "What kind of problems you enjoy, and how you approach them" }} />
          </p>
          <p>
            <T value={{ placeholder: "What you are learning now and where you want to go next" }} />
          </p>
        </div>
      </div>
    </section>
  );
}

export function SkillsInterim() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="relative z-[var(--z-content)] bg-void py-[var(--section-y)]">
      <div className="shell grid-12 gap-y-10">
        <h2 id="skills-title" className="t-h1 col-span-full lg:col-span-4">
          Skills
        </h2>
        <dl className="col-span-full grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:col-span-8">
          {skillDomains.map((d) => (
            <div key={d.id} className="border-t border-line pt-4">
              <dt className="text-ink-2">{d.name}</dt>
              <dd className="mt-3 flex flex-wrap gap-2">
                {d.skills.map((s) => (
                  <span
                    key={s.name}
                    className={`rounded-[var(--r-xs)] border px-2.5 py-1 text-[0.9375rem] ${
                      s.verified ? "border-line-strong" : "placeholder border-dashed border-[var(--c-warn)]/50"
                    }`}
                    title={s.verified ? undefined : "Not yet verified with a project"}
                  >
                    {s.name}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function ContactInterim() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative z-[var(--z-content)] bg-void pb-16 pt-[var(--section-y)]">
      <div className="shell">
        <h2 id="contact-title" className="t-hero max-w-[12ch]">
          Let’s build the next one.
        </h2>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          {profile.email ? (
            <Action href={`mailto:${profile.email}`} variant="primary">
              {profile.email}
            </Action>
          ) : (
            <Action href={null} pendingNote="Email not added yet">
              Email
            </Action>
          )}
          <Action href={profile.links.github.href} external>
            GitHub
          </Action>
          <Action href={profile.links.linkedin.href} external>
            LinkedIn
          </Action>
          <Action href={profile.links.resume.href} download>
            Résumé
          </Action>
        </div>
        <p className="mt-16 border-t border-line pt-6 text-[0.875rem] text-ink-2">
          <T value={profile.name} />, <T value={profile.location} />. Built with Next.js, React Three Fiber and GSAP.
        </p>
      </div>
    </section>
  );
}
