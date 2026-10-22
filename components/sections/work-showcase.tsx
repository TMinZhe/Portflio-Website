"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/motion/gsap";
import { useEffects } from "@/lib/hooks/use-effects";

/*
 * Selected work as a horizontal showcase. The cards are rendered on the
 * server, in reading order, inside one track; this component only decides how
 * the track moves:
 * - pin:      desktop with room to spare. The section pins and vertical scroll
 *             moves the track; it unpins after the last card, so scrolling
 *             continues into Experience. Travel is measured from the cards.
 * - carousel: everywhere else. A native, snap-scrolling track (touch and
 *             trackpad scroll it directly; vertical swipes pass through).
 * - list:     reduced effects. CSS turns the track into a vertical list.
 * Controls, the counter and the skip link work in pin and carousel modes.
 */

/** Pinning needs width for the 80vw cards and height for the tallest card plus the header (checked down to 1100×760). */
const PIN_QUERY = "(min-width: 1100px) and (min-height: 760px)";
/** Vertical scroll per pixel of horizontal travel: under 1 keeps the pinned stretch short. */
const SCROLL_PER_PX = 0.65;

type Mode = "pin" | "carousel" | "list";
type Item = { slug: string; label: string };

const pad = (n: number) => String(n).padStart(2, "0");

function subscribePin(onChange: () => void) {
  const mq = window.matchMedia(PIN_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const pinMatches = () => window.matchMedia(PIN_QUERY).matches;

export function WorkShowcase({ items, children }: { items: Item[]; children: ReactNode }) {
  const effects = useEffects();
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const travelPx = useRef(0);
  // Mode follows the effects preference and the viewport. The server renders the carousel.
  const pinFits = useSyncExternalStore(subscribePin, pinMatches, () => false);
  const mode: Mode = effects === "reduced" ? "list" : pinFits ? "pin" : "carousel";
  const [active, setActive] = useState(0);
  const n = items.length;

  const cards = () => Array.from(track.current?.querySelectorAll<HTMLElement>(":scope > li") ?? []);
  const gutter = () => parseFloat(getComputedStyle(track.current!).paddingLeft) || 0;

  /** Horizontal offset that brings card i to the left gutter, capped at the end of the track. */
  const offsetFor = useCallback((i: number, travel: number) => {
    const el = cards()[i];
    return el ? Math.min(Math.max(0, el.offsetLeft - gutter()), travel) : 0;
  }, []);

  // Pinned horizontal travel. useGSAP reverts the tween and trigger on mode change and unmount.
  useGSAP(
    () => {
      if (mode !== "pin" || !root.current || !track.current) return;
      const t = track.current;
      const travel = () => {
        const last = cards().at(-1);
        travelPx.current = last ? Math.max(0, last.offsetLeft + last.offsetWidth + gutter() - document.documentElement.clientWidth) : 0;
        return travelPx.current;
      };
      const tween = gsap.to(t, {
        x: () => -travel(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          pin: true,
          start: "top top",
          end: () => `+=${Math.round(travel() * SCROLL_PER_PX)}`,
          scrub: 0.4,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (st) => {
            const p = st.progress;
            if (bar.current) bar.current.style.transform = `scaleX(${p})`;
            const x = p * travelPx.current;
            // The active card is the last one whose left edge has reached the gutter (with a little lead).
            const i = cards().reduce((acc, _, k) => (offsetFor(k, travelPx.current) <= x + 120 ? k : acc), 0);
            setActive((a) => (a === i ? a : i));
          },
        },
      });
      trigger.current = tween.scrollTrigger ?? null;
      // Images can change card heights after load; re-measure once they settle.
      const imgs = Array.from(t.querySelectorAll("img"));
      const onLoad = () => ScrollTrigger.refresh();
      imgs.forEach((img) => img.complete || img.addEventListener("load", onLoad, { once: true }));
      return () => {
        imgs.forEach((img) => img.removeEventListener("load", onLoad));
        trigger.current = null;
      };
    },
    { dependencies: [mode], revertOnUpdate: true, scope: root },
  );

  // Carousel: the active card follows native scrolling.
  useEffect(() => {
    if (mode !== "carousel" || !track.current) return;
    const t = track.current;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = t.scrollWidth - t.clientWidth;
        const p = max > 0 ? t.scrollLeft / max : 0;
        if (bar.current) bar.current.style.transform = `scaleX(${p})`;
        const x = t.scrollLeft;
        const i = cards().reduce((acc, el, k) => (el.offsetLeft - gutter() <= x + el.offsetWidth / 2 ? k : acc), 0);
        setActive((a) => (a === i ? a : i));
      });
    };
    onScroll();
    t.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      t.removeEventListener("scroll", onScroll);
    };
  }, [mode]);

  // The card in view is marked for styling (pin mode dims the others).
  useEffect(() => {
    cards().forEach((el, k) => el.toggleAttribute("data-active", k === active));
  }, [active, mode]);

  const go = useCallback(
    (i: number, behavior: ScrollBehavior = "smooth") => {
      const k = Math.max(0, Math.min(n - 1, i));
      if (mode === "pin" && trigger.current) {
        // Pinned scroll maps linearly onto horizontal travel.
        const st = trigger.current;
        const travel = travelPx.current;
        const ratio = travel > 0 ? (st.end - st.start) / travel : 0;
        window.scrollTo({ top: Math.round(st.start + offsetFor(k, travel) * ratio), behavior });
      } else if (mode === "carousel" && track.current) {
        const el = cards()[k];
        if (el) track.current.scrollTo({ left: el.offsetLeft - gutter(), behavior });
      }
    },
    [mode, n, offsetFor],
  );

  // Keyboard users: tabbing into a card that is off to the side brings it into view.
  useEffect(() => {
    const t = track.current;
    if (!t || mode === "list") return;
    const onFocus = (e: FocusEvent) => {
      const li = (e.target as HTMLElement).closest(".work-card");
      const i = cards().indexOf(li as HTMLElement);
      if (i < 0) return;
      const r = (li as HTMLElement).getBoundingClientRect();
      if (r.left < 0 || r.right > window.innerWidth) go(i, "auto");
    };
    t.addEventListener("focusin", onFocus);
    return () => t.removeEventListener("focusin", onFocus);
  }, [mode, go]);

  return (
    <div
      ref={root}
      data-mode={mode}
      // Clip the moving track so it never widens the page while pinned.
      className={mode === "pin" ? "flex h-svh flex-col overflow-x-clip pb-5 pt-[calc(var(--nav-h)+1rem)]" : "pt-[var(--section-y)]"}
    >
      <div className="shell flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h2
            id="work-title"
            className={mode === "pin" ? "font-display text-[clamp(2.25rem,1.6rem+1.6vw,3.25rem)] font-medium leading-none tracking-[var(--track-display)]" : "t-h1"}
          >
            Selected work
          </h2>
          <p className={`max-w-[60ch] text-[0.875rem] text-ink-2 ${mode === "pin" ? "mt-2" : "mt-3"}`}>
            Visuals are sanitized application screenshots or clearly labeled recreations using synthetic data.
          </p>
        </div>
        <div data-work-controls className="flex w-full items-center gap-2 sm:w-auto">
          <p className="t-meta mr-2 whitespace-nowrap tabular-nums" aria-hidden>
            <span className="text-ink">{pad(active + 1)}</span> / {pad(n)}
          </p>
          <button
            type="button"
            onClick={() => go(active - 1)}
            disabled={active === 0}
            aria-label="Previous project"
            className="grid size-11 place-items-center rounded-full border border-line-strong transition-colors hover:border-ink-2 disabled:opacity-35"
          >
            <ArrowLeft size={17} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            disabled={active === n - 1}
            aria-label="Next project"
            className="grid size-11 place-items-center rounded-full border border-line-strong transition-colors hover:border-ink-2 disabled:opacity-35"
          >
            <ArrowRight size={17} aria-hidden />
          </button>
          <a
            href="#experience"
            className="ml-auto inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[0.875rem] text-ink-2 underline-offset-4 transition-colors hover:text-ink hover:underline sm:ml-2"
          >
            Skip to Experience <ArrowDown size={14} aria-hidden />
          </a>
        </div>
      </div>

      <nav data-work-controls aria-label="Selected projects" className={`shell ${mode === "pin" ? "mt-3" : "mt-4"}`}>
        <ol className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
          {items.map((it, i) => (
            <li key={it.slug} className="shrink-0">
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={i === active ? "true" : undefined}
                className={`min-h-10 rounded-full px-3 text-[0.8125rem] transition-colors ${i === active ? "bg-elevated text-ink" : "text-ink-2 hover:text-ink"}`}
              >
                <span className="t-meta mr-1.5 text-[0.6875rem]">{pad(i + 1)}</span>
                {it.label}
              </button>
            </li>
          ))}
        </ol>
        <span aria-hidden className="mt-2 block h-px overflow-hidden bg-line">
          <span ref={bar} className="block h-full origin-left scale-x-0 bg-lime" />
        </span>
      </nav>

      <ol ref={track} className={`work-track ${mode === "pin" ? "mt-4 min-h-0 flex-1 items-center" : "mt-6"}`}>
        {children}
      </ol>
    </div>
  );
}
