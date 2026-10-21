import type { ReactNode } from "react";
import { Toc } from "./toc";
import { RevealObserver } from "./reveal";

export type DetailSection = {
  id: string;
  title: string;
  /** Longer heading shown in the section; `title` stays the TOC label. */
  heading?: string;
  /** null or false = nothing confirmed to say; the section is left out entirely. */
  body: ReactNode;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The reading column of a detail page: sticky contents on desktop, a collapsed
 * "On this page" list on smaller screens, and numbered sections. Sections
 * without a body are dropped before numbering, so no empty headings render.
 */
export function DetailBody({ sections }: { sections: DetailSection[] }) {
  const shown = sections.filter((s) => s.body);
  const items = shown.map((s, i) => ({ id: s.id, label: s.title, n: pad(i + 1) }));

  return (
    <div className="shell grid-12 gap-y-8 pt-[clamp(3rem,7vw,6rem)]">
      <RevealObserver />
      <Toc items={items} />

      <div className="col-span-full lg:col-span-8 lg:col-start-5">
        <details className="group mb-10 rounded-[var(--r-md)] bg-graphite lg:hidden">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 font-medium [&::-webkit-details-marker]:hidden">
            On this page
            <span aria-hidden className="text-ink-2 transition-transform duration-[var(--d-fast)] group-open:rotate-45">
              +
            </span>
          </summary>
          <ol className="px-4 pb-3">
            {items.map((it) => (
              <li key={it.id}>
                <a href={`#${it.id}`} className="flex min-h-11 items-center gap-3 text-ink-2 hover:text-ink">
                  <span className="t-meta">{it.n}</span>
                  {it.label}
                </a>
              </li>
            ))}
          </ol>
        </details>

        {shown.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            aria-labelledby={`${s.id}-title`}
            className="border-t border-line pb-[clamp(3.5rem,7vw,6rem)] pt-6"
          >
            <div className="mb-8 flex items-baseline gap-4">
              <span className="t-meta w-8 shrink-0">{pad(i + 1)}</span>
              {s.heading ? (
                <div>
                  <p className="t-meta">{s.title}</p>
                  <h2 id={`${s.id}-title`} className="t-h3 mt-2 max-w-[26ch]">
                    {s.heading}
                  </h2>
                </div>
              ) : (
                <h2 id={`${s.id}-title`} className="t-h3">
                  {s.title}
                </h2>
              )}
            </div>
            <div className="md:pl-12">{s.body}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

/** Running text for a section: confirmed paragraphs, the first one larger. */
export function Prose({ paragraphs, lead = true }: { paragraphs: string[]; lead?: boolean }) {
  return (
    <div className="max-w-[62ch] space-y-5">
      {paragraphs.map((p, i) => (
        <p key={i} className={lead && i === 0 ? "t-lead text-ink" : "text-ink"}>
          {p}
        </p>
      ))}
    </div>
  );
}

/** Technology chips, as on the homepage skills list. */
export function Chips({ items, label }: { items: string[]; label: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {items.map((t) => (
        <li key={t} className="rounded-[var(--r-xs)] border border-line-strong px-2.5 py-1 text-[0.875rem]">
          {t}
        </li>
      ))}
    </ul>
  );
}
