"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { sceneStore } from "@/lib/motion/scroll-store";
import { useEffects } from "@/lib/hooks/use-effects";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Owns the scroll choreography of Scenes A–B. GSAP measures progress and drives
 * DOM tweens; the monolith only reads the resulting values from sceneStore.
 * With reduced effects nothing is scrubbed and every stratum stays fully visible.
 */
export function OpeningScroll() {
  const effects = useEffects();

  useGSAP(
    () => {
      const root = document.querySelector<HTMLElement>("[data-opening]");
      const transform = root?.querySelector<HTMLElement>("[data-transform]");
      const items = Array.from(root?.querySelectorAll<HTMLElement>("[data-strata] [data-layer]") ?? []);
      if (!root || !transform) return;

      if (effects === "reduced") {
        delete root.dataset.js;
        sceneStore.set({ explode: 0.35, focus: 3 });
        return;
      }
      root.dataset.js = "";

      let lastFocus = -1;
      const setFocus = (layer: number) => {
        if (layer === lastFocus) return;
        lastFocus = layer;
        items.forEach((li) => {
          if (Number(li.dataset.layer) === layer) li.dataset.active = "";
          else delete li.dataset.active;
        });
      };
      setFocus(3);

      // Hero copy drifts up and fades as the transformation takes over.
      gsap.to("[data-hero-inner]", {
        yPercent: -12,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: () => `+=${innerHeight * 0.9}`, scrub: true },
      });

      // Stack explodes across the first part of the transformation, then the
      // highlighted stratum walks from the top layer down to the bottom.
      ScrollTrigger.create({
        trigger: transform,
        start: "top bottom",
        end: "bottom bottom",
        onUpdate: (self) => {
          const p = self.progress;
          const explode = clamp01(p / 0.4);
          const step = Math.min(3, Math.floor(clamp01((p - 0.32) / 0.6) * 4));
          const focus = 3 - step;
          setFocus(focus);
          sceneStore.set({ explode, focus });
        },
      });
    },
    { dependencies: [effects], revertOnUpdate: true },
  );

  return null;
}
