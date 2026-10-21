import { about } from "@/content/about";
import { knownList } from "@/lib/content";

/** About: a short narrative. Only confirmed paragraphs render. */
export function About() {
  const paragraphs = knownList(about.paragraphs);
  if (!paragraphs.length) return null;
  return (
    <section id="about" aria-labelledby="about-title" className="relative z-[var(--z-content)] bg-void pt-[var(--section-y)]">
      <div className="shell grid-12 gap-y-8">
        <h2 id="about-title" className="t-h1 col-span-full">
          About
        </h2>
        <div data-reveal className="col-span-full space-y-6 lg:col-span-8 lg:col-start-4">
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] leading-snug tracking-[-0.02em]" : "t-lead max-w-[56ch] text-ink"}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
