import { profile } from "@/content/profile";
import { Action } from "@/components/ui/action";

/** Contact: the closing call to action. Links that don't exist yet are left out. */
export function Contact() {
  const { email, links } = profile;
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative z-[var(--z-content)] bg-void pb-[clamp(4rem,8vw,7rem)] pt-[var(--section-y)]">
      <div className="shell">
        <h2 id="contact-title" className="t-hero max-w-[12ch]">
          Let’s build the next one.
        </h2>
        {email && (
          <p className="mt-10">
            <a href={`mailto:${email}`} className="t-h3 underline decoration-line-strong underline-offset-[0.2em] transition-colors hover:text-lime hover:decoration-lime">
              {email}
            </a>
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {links.github.href && (
            <Action href={links.github.href} external>
              GitHub
            </Action>
          )}
          {links.linkedin.href && (
            <Action href={links.linkedin.href} external>
              LinkedIn
            </Action>
          )}
          {links.resume.href && (
            <Action href={links.resume.href} download>
              Résumé
            </Action>
          )}
        </div>
      </div>
    </section>
  );
}
