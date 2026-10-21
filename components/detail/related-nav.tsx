import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

export type RelatedLink = { href: string; eyebrow: string; title: string; text?: string };

/** Card links to related pages. The whole card is the link; nothing inside is interactive. */
export function RelatedCards({ items }: { items: RelatedLink[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((it) => (
        <li key={it.href}>
          <a
            href={it.href}
            className="group flex h-full flex-col rounded-[var(--r-md)] bg-graphite p-5 transition-colors duration-[var(--d-fast)] hover:bg-elevated md:p-6"
          >
            <span className="t-meta">{it.eyebrow}</span>
            <span className="mt-3 flex items-start justify-between gap-4">
              <span className="text-[1.25rem] font-medium leading-snug">{it.title}</span>
              <ArrowUpRight
                size={20}
                aria-hidden
                className="mt-1 shrink-0 text-ink-2 transition-transform duration-[var(--d-fast)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lime"
              />
            </span>
            {it.text && <span className="mt-2 text-[0.9375rem] text-ink-2">{it.text}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}

type Adjacent = { href: string; title: string } | undefined;

/** Closing navigation: previous / next, and the way back to the homepage section. */
export function PageFooterNav({
  prev,
  next,
  back,
  kind,
}: {
  prev: Adjacent;
  next: Adjacent;
  back: { href: string; label: string };
  kind: string;
}) {
  return (
    <nav aria-label={`More ${kind}`} className="shell pb-[clamp(4rem,8vw,7rem)]">
      {(prev || next) && (
        <div className="grid border-y border-line md:grid-cols-2">
          {prev ? (
            <a href={prev.href} className="group flex flex-col gap-2 py-8 md:pr-8">
              <span className="inline-flex items-center gap-2 text-[0.875rem] text-ink-2">
                <ArrowLeft size={15} aria-hidden className="transition-transform group-hover:-translate-x-1" />
                Previous {kind}
              </span>
              <span className="t-h3 transition-colors group-hover:text-lime">{prev.title}</span>
            </a>
          ) : (
            <span />
          )}
          {next && (
            <a
              href={next.href}
              className="group flex flex-col gap-2 border-t border-line py-8 md:items-end md:border-l md:border-t-0 md:pl-8 md:text-right"
            >
              <span className="inline-flex items-center gap-2 text-[0.875rem] text-ink-2">
                Next {kind}
                <ArrowRight size={15} aria-hidden className="transition-transform group-hover:translate-x-1" />
              </span>
              <span className="t-h3 transition-colors group-hover:text-lime">{next.title}</span>
            </a>
          )}
        </div>
      )}
      <a
        href={back.href}
        className="mt-8 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] text-ink-2 transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} aria-hidden />
        {back.label}
      </a>
    </nav>
  );
}
