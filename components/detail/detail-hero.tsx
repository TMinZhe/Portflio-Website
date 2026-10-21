import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Chips } from "./detail-body";

type Meta = { label: string; value: ReactNode };

type Props = {
  back: { href: string; label: string };
  eyebrow: string;
  title: string;
  /** Optional line between the title and the summary. */
  headline?: string;
  summary: string;
  meta: Meta[];
  chips?: string[];
  /** A headline figure, e.g. an outcome. */
  figure?: { value: string; label: string };
  actions?: ReactNode;
  draft?: boolean;
};

/** Opening of a project or experience page: identity left, facts right. */
export function DetailHero({ back, eyebrow, title, headline, summary, meta, chips, figure, actions, draft }: Props) {
  return (
    <header className="shell grid-12 gap-y-10 pt-[calc(var(--nav-h)+clamp(2rem,6vh,4.5rem))]">
      <div className="col-span-full lg:col-span-8">
        {draft && <DraftBanner />}
        <a
          href={back.href}
          className="inline-flex min-h-11 items-center gap-2 text-[0.9375rem] text-ink-2 transition-colors hover:text-ink"
        >
          <ArrowLeft size={16} aria-hidden />
          {back.label}
        </a>
        <p className="t-meta mt-8">{eyebrow}</p>
        <h1 className="t-h1 mt-4 max-w-[18ch]">{title}</h1>
        {headline && <p className="t-h3 mt-6 max-w-[30ch] text-ink">{headline}</p>}
        <p className="t-lead mt-5 max-w-[56ch] text-ink">{summary}</p>
        {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
      </div>

      <aside aria-label="Key facts" className="col-span-full self-end lg:col-span-4 lg:col-start-9">
        {figure && (
          <p className="mb-6 flex items-baseline gap-4">
            <span className="font-display text-[clamp(3.5rem,2.5rem+4vw,6rem)] leading-none tracking-[var(--track-display)] text-lime">
              {figure.value}
            </span>
            <span className="max-w-[16ch] text-[1rem] text-ink">{figure.label}</span>
          </p>
        )}
        <dl className="divide-y divide-line border-y border-line">
          {meta.map((m) => (
            <div key={m.label} className="grid grid-cols-[7rem_1fr] gap-4 py-3">
              <dt className="text-[0.875rem] text-ink-2">{m.label}</dt>
              <dd className="text-[0.9375rem]">{m.value}</dd>
            </div>
          ))}
        </dl>
        {chips && chips.length > 0 && (
          <div className="mt-5">
            <Chips items={chips} label="Technologies" />
          </div>
        )}
      </aside>
    </header>
  );
}

function DraftBanner() {
  return (
    <p className="mb-6 inline-flex rounded-[var(--r-xs)] border border-dashed border-[var(--c-warn)]/60 px-3 py-1.5 text-[0.875rem] text-[var(--c-warn)]">
      Draft: visible in development only. Not linked, not indexed.
    </p>
  );
}
