"use client";

import { useEffect, useState } from "react";

export type DeviceTier = "high" | "low" | "none";

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Coarse capability tier for the 3D scene.
 * - none: no WebGL → static SVG fallback
 * - low: few cores, low memory or a narrow touch screen → fewer details, no traces, lower DPR
 * - high: everything on
 * Override for testing with ?tier=low|high|none.
 */
export function detectTier(): DeviceTier {
  const forced = new URLSearchParams(location.search).get("tier");
  if (forced === "low" || forced === "high" || forced === "none") return forced;
  if (!hasWebGL()) return "none";
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  const coarse = matchMedia("(pointer: coarse)").matches;
  if (cores <= 4 || memory <= 4 || (coarse && innerWidth < 768)) return "low";
  return "high";
}

/** null until mounted (so SSR and first client render match). */
export function useDeviceTier(): DeviceTier | null {
  const [tier, setTier] = useState<DeviceTier | null>(null);
  useEffect(() => {
    // Detection touches window/navigator, so it must run after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTier(detectTier());
  }, []);
  return tier;
}
