"use client";

import { useEffect } from "react";

/**
 * Marks [data-reveal] elements with data-in once they scroll into view; CSS in
 * globals.css does the rise. Content is only held back while full effects are
 * on and this script has run, so it never stays hidden.
 */
export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => (el.dataset.in = ""));
      return;
    }
    // Anything already on screen is shown as-is, so nothing flickers on load.
    for (const el of els) if (el.getBoundingClientRect().top < innerHeight) el.dataset.in = "";
    root.dataset.reveal = "";
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.in = "";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      delete root.dataset.reveal;
    };
  }, []);
  return null;
}
