"use client";

import { useEffect, useState } from "react";

type Item = { id: string; label: string; n: string };

/**
 * Desktop contents column: follows the reader, marks the section in view, and
 * drives a thin reading-progress bar under the nav.
 */
export function Toc({ items }: { items: Item[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const els = items.map((it) => document.getElementById(it.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        setProgress(max > 0 ? Math.min(1, scrollY / max) : 0);
      });
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, [items]);

  return (
    <>
      <div
        aria-hidden
        className="fixed inset-x-0 top-[var(--nav-h)] z-[var(--z-nav)] h-0.5 origin-left bg-lime"
        style={{ transform: `scaleX(${progress})` }}
      />
      <nav aria-label="On this page" className="hidden lg:col-span-3 lg:block">
        <ol className="sticky top-[calc(var(--nav-h)+2rem)] border-l border-line">
          {items.map((it) => (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                aria-current={active === it.id ? "location" : undefined}
                className="-ml-px flex min-h-10 items-center gap-3 border-l border-transparent pl-4 text-[0.9375rem] text-ink-2 transition-colors duration-[var(--d-fast)] hover:text-ink aria-[current]:border-lime aria-[current]:text-ink"
              >
                <span className="t-meta">{it.n}</span>
                {it.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
