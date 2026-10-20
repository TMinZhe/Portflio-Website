"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { EffectsToggle } from "./effects-toggle";

export const sections = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
] as const;

type Props = { mark: string; resumeHref: string | null };

export function Nav({ mark, resumeHref }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Active section: whichever tracked section crosses the upper third of the viewport.
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    const onScroll = () => {
      setScrolled(scrollY > 8);
      if (scrollY < innerHeight * 0.5) setActive(null);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      removeEventListener("scroll", onScroll);
    };
  }, []);

  // Mobile sheet: Escape closes, focus moves in and returns to the toggle.
  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    const first = sheetRef.current?.querySelector<HTMLElement>("a,button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      toggle?.focus();
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[var(--z-nav)] transition-[background-color,border-color] duration-[var(--d-base)] ${
        scrolled ? "border-b border-line bg-[rgb(9_11_17/0.82)] backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-10 focus:rounded-[var(--r-sm)] focus:bg-lime focus:px-4 focus:py-2 focus:text-[var(--c-lime-ink)]"
      >
        Skip to projects
      </a>
      <nav aria-label="Primary" className="shell flex h-[var(--nav-h)] items-center gap-6">
        <a href="#top" className="font-display text-[1.0625rem] font-medium tracking-[-0.02em]" aria-label={`${mark}, back to top`}>
          {mark}
        </a>

        <ul className="ml-auto hidden items-center gap-1 lg:flex">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={active === s.id ? "true" : undefined}
                className="relative block px-3 py-2 text-[0.9375rem] text-ink-2 transition-colors duration-[var(--d-fast)] hover:text-ink aria-[current]:text-ink"
              >
                {s.label}
                <span
                  aria-hidden
                  className={`absolute inset-x-3 -bottom-px h-px origin-left bg-lime transition-transform duration-[var(--d-base)] ease-[var(--ease-out-expo)] ${
                    active === s.id ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <span className="hidden lg:block">
            <EffectsToggle />
          </span>
          <ResumeLink href={resumeHref} />
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-[var(--r-sm)] border border-line-strong lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-sheet"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-sheet"
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-x-0 bottom-0 top-[var(--nav-h)] z-[var(--z-sheet)] flex flex-col bg-void px-[var(--gutter)] pb-8 pt-4 lg:hidden"
        >
          <ul className="flex flex-col border-t border-line">
            {sections.map((s) => (
              <li key={s.id} className="border-b border-line">
                <a
                  href={`#${s.id}`}
                  onClick={() => setOpen(false)}
                  className="block py-4 font-display text-[2rem] tracking-[-0.03em]"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex items-center justify-between gap-4">
            <EffectsToggle />
          </div>
        </div>
      )}
    </header>
  );
}

function ResumeLink({ href }: { href: string | null }) {
  if (!href) {
    return (
      <span
        aria-disabled="true"
        title="Résumé not uploaded yet"
        className="inline-flex min-h-11 cursor-not-allowed items-center rounded-[var(--r-sm)] border border-dashed border-line-strong px-4 text-[0.875rem] text-ink-2"
      >
        Résumé<span className="sr-only"> (not available yet)</span>
      </span>
    );
  }
  return (
    <a
      href={href}
      download
      className="inline-flex min-h-11 items-center rounded-[var(--r-sm)] bg-lime px-4 text-[0.875rem] font-medium text-[var(--c-lime-ink)] transition-colors hover:bg-[#c8ff6a]"
    >
      Résumé
    </a>
  );
}
