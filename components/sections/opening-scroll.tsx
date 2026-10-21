"use client";

import { gsap, useGSAP } from "@/lib/motion/gsap";
import { useEffects } from "@/lib/hooks/use-effects";

/**
 * Scroll choreography for the hero: the copy drifts up and fades as Selected
 * work arrives. With reduced effects nothing is scrubbed.
 */
export function OpeningScroll() {
  const effects = useEffects();

  useGSAP(
    () => {
      const root = document.querySelector<HTMLElement>("[data-opening]");
      if (!root || effects === "reduced") return;
      gsap.to("[data-hero-inner]", {
        yPercent: -12,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: () => `+=${innerHeight * 0.9}`, scrub: true },
      });
    },
    { dependencies: [effects], revertOnUpdate: true },
  );

  return null;
}
