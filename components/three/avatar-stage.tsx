"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useDeviceTier } from "@/lib/hooks/use-device";
import { useEffects } from "@/lib/hooks/use-effects";

const AvatarScene = dynamic(() => import("./avatar-scene"), { ssr: false });

/**
 * Backdrop for the opening: the owner's avatar. The 3D bundle and model are
 * fetched only after the page is idle, then fade in. With reduced effects or
 * no WebGL only the ambient light remains.
 */
export function AvatarStage() {
  const tier = useDeviceTier();
  const effects = useEffects();
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);

  const webgl = effects === "full" && tier !== null && tier !== "none";

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

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-0" style={{ background: "var(--ambient-ice), var(--ambient-lime)" }} />
      {webgl && load && (
        <div className={`absolute inset-0 transition-opacity duration-[var(--d-cinematic)] ${ready ? "opacity-100" : "opacity-0"}`}>
          <AvatarScene tier={tier as "high" | "low"} onReady={() => setReady(true)} />
        </div>
      )}
    </div>
  );
}
