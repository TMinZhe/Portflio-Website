"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useDeviceTier } from "@/lib/hooks/use-device";
import { useEffects } from "@/lib/hooks/use-effects";
import { sceneStore } from "@/lib/motion/scroll-store";
import { MonolithFallback } from "./monolith-fallback";

const MonolithScene = dynamic(() => import("./monolith-scene"), { ssr: false });

/** Explode value for the SVG fallback when it stands in for WebGL. */
function useStoreExplode(enabled: boolean) {
  return useSyncExternalStore(
    (l) => (enabled ? sceneStore.subscribe(l) : () => {}),
    () => (enabled ? Math.round(sceneStore.get().explode * 40) / 40 : 0),
    () => 0,
  );
}

/**
 * Chooses between the WebGL monolith and its SVG drawing.
 * The SVG renders on the server so the hero is never empty; the 3D bundle is
 * fetched only after the page is idle, then cross-fades in over the drawing.
 */
export function MonolithStage() {
  const tier = useDeviceTier();
  const effects = useEffects();
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);

  const webgl = effects === "full" && tier !== null && tier !== "none";
  const explode = useStoreExplode(effects === "full" && !webgl);

  useEffect(() => {
    if (!webgl) return;
    const start = () => setLoad(true);
    const ric = window.requestIdleCallback;
    if (ric) {
      const id = ric(start, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(start, 300);
    return () => clearTimeout(t);
  }, [webgl]);

  const showScene = webgl && load;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-0" style={{ background: "var(--ambient-ice), var(--ambient-lime)" }} />
      <div
        className={`absolute inset-0 flex items-start justify-center pt-[calc(var(--nav-h)+2vh)] transition-opacity duration-[var(--d-cinematic)] lg:items-center lg:justify-end lg:pr-[4vw] lg:pt-0 ${
          showScene && ready ? "opacity-0" : "opacity-100"
        }`}
      >
        <MonolithFallback
          explode={effects === "reduced" ? 0.35 : explode}
          className="h-auto w-[min(88vw,30rem)] md:w-[min(70vw,34rem)] lg:w-[min(46vw,40rem)]"
        />
      </div>
      {showScene && (
        <div
          className={`pointer-events-auto absolute inset-0 transition-opacity duration-[var(--d-cinematic)] ${ready ? "opacity-100" : "opacity-0"}`}
        >
          <MonolithScene tier={tier as "high" | "low"} onReady={() => setReady(true)} />
        </div>
      )}
    </div>
  );
}
