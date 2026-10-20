"use client";

import { MotionConfig } from "motion/react";
import { useEffects } from "@/lib/hooks/use-effects";

/** Keeps Motion's micro-interactions in step with the Reduce effects switch. */
export function Providers({ children }: { children: React.ReactNode }) {
  const effects = useEffects();
  return <MotionConfig reducedMotion={effects === "reduced" ? "always" : "user"}>{children}</MotionConfig>;
}
