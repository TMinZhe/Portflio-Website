import { skillDomains } from "@/content/skills";
import { profile } from "@/content/profile";
import { resolveEvidence } from "@/lib/content";
import { ToolkitDomain } from "./toolkit-domain";

/** Technical Toolkit: verified skills by domain; each one opens where it was used. */
export function Toolkit() {
  const domains = skillDomains
    .map((d) => ({
      id: d.id,
      name: d.name,
      skills: d.skills
        .filter((s) => s.verified)
        .map((s) => ({ name: s.name, evidence: resolveEvidence(s.usedIn, profile.links.github.href) })),
    }))
    .filter((d) => d.skills.length > 0);

  return (
    <section id="skills" aria-labelledby="skills-title" className="relative z-[var(--z-content)] bg-void pt-[var(--section-y)]">
      <div className="shell grid-12 gap-y-10">
        <div className="col-span-full lg:col-span-4">
          <h2 id="skills-title" className="t-h1">
            Technical toolkit
          </h2>
          <p className="mt-5 max-w-[34ch] text-ink-2">Select a tool to see the project or role where I used it.</p>
        </div>
        <dl className="col-span-full lg:col-span-8">
          {domains.map((d) => (
            <ToolkitDomain key={d.id} domain={d} />
          ))}
        </dl>
      </div>
    </section>
  );
}
