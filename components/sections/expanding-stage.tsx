"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { useEffects } from "@/lib/hooks/use-effects";

/**
 * Full-bleed stage that opens from an inset, rounded frame to the full width
 * as it scrolls into view (Scene E). Pure clip-path, so layout never shifts.
 */
export function ExpandingStage({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const effects = useEffects();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || effects === "reduced") return;
      gsap.fromTo(
        el,
        { clipPath: "inset(6% 9% 6% 9% round 28px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 95%", end: "top 25%", scrub: true },
        },
      );
    },
    { dependencies: [effects], revertOnUpdate: true },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
