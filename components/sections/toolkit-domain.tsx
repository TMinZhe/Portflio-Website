"use client";

import { useId, useState } from "react";
import type { Evidence } from "@/lib/content";

type Domain = { id: string; name: string; skills: { name: string; evidence: Evidence[] }[] };

const kindLabel: Record<Evidence["kind"], string> = { project: "Project", role: "Role", site: "Code" };

/** One domain row. Skills are toggle buttons; the open one lists where it was used. */
export function ToolkitDomain({ domain }: { domain: Domain }) {
  const [open, setOpen] = useState<string | null>(null);
  const panelId = useId();
  const current = domain.skills.find((s) => s.name === open);

  return (
    <div className="grid gap-x-8 gap-y-3 border-t border-line py-6 md:grid-cols-[12rem_1fr]">
      <dt className="pt-2 text-ink-2">{domain.name}</dt>
      <dd>
        <ul className="flex flex-wrap gap-2">
          {domain.skills.map((s) => {
            const active = open === s.name;
            const usable = s.evidence.length > 0;
            return (
              <li key={s.name}>
                {usable ? (
                  <button
                    type="button"
                    aria-expanded={active}
                    aria-controls={panelId}
                    onClick={() => setOpen(active ? null : s.name)}
                    className={`min-h-11 rounded-[var(--r-xs)] border px-3 text-[0.9375rem] transition-colors duration-[var(--d-fast)] ${
                      active ? "border-lime bg-lime/10 text-ink" : "border-line-strong hover:border-ink-2"
                    }`}
                  >
                    {s.name}
                  </button>
                ) : (
                  <span className="inline-flex min-h-11 items-center rounded-[var(--r-xs)] border border-line px-3 text-[0.9375rem]">
                    {s.name}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <div id={panelId} aria-live="polite">
          {current && (
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]">
              {current.evidence.map((e) => (
                <li key={e.href}>
                  <span className="t-meta mr-2">{kindLabel[e.kind]}</span>
                  <a
                    href={e.href}
                    {...(e.kind === "site" ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                    className="underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-lime"
                  >
                    {e.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dd>
    </div>
  );
}
