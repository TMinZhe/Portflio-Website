"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { DeviceTier } from "@/lib/hooks/use-device";
import { avatarStore, clock } from "@/components/lab/avatar/avatar-store";
import { MyAvatar } from "@/components/lab/avatar/my-avatar";

type Props = {
  tier: Exclude<DeviceTier, "none">;
  /** Called after the first frame has rendered, so the stage can fade it in. */
  onReady?: () => void;
};

/**
 * WebGL scene for the owner's avatar in the opening. Feeds the cursor into the
 * shared avatar store, greets once on screen, and stops rendering while the
 * opening is scrolled out of view or the tab is hidden.
 */
export default function AvatarScene({ tier, onReady }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  // Pointer → shared store (mouse/pen only; touch devices get the mobile framing).
  useEffect(() => {
    const mq = matchMedia("(max-width: 767px), (pointer: coarse)");
    const setMobile = () => (avatarStore.mobile = mq.matches);
    setMobile();
    mq.addEventListener("change", setMobile);
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const p = avatarStore.pointer;
      p.x = (e.clientX / innerWidth) * 2 - 1;
      p.y = -(e.clientY / innerHeight) * 2 + 1;
      p.lastMove = clock();
      p.inside = true;
    };
    const leave = (e: MouseEvent) => {
      if (!e.relatedTarget) avatarStore.pointer.inside = false;
    };
    addEventListener("pointermove", move, { passive: true });
    document.addEventListener("mouseout", leave);
    return () => {
      mq.removeEventListener("change", setMobile);
      removeEventListener("pointermove", move);
      document.removeEventListener("mouseout", leave);
    };
  }, []);

  // Pause when off-screen or the tab is hidden.
  useEffect(() => {
    const el = wrapRef.current?.closest("[data-opening]");
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      update();
    });
    if (el) io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  // Greeting once the character is on screen.
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => avatarStore.director.cue("greet", clock()), 600);
    return () => clearTimeout(t);
  }, [ready]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      {/* Mobile: the portrait fades out below the shoulders so copy never sits on the body. */}
      <div className="absolute inset-x-0 bottom-0 z-10 h-[62%] bg-[linear-gradient(to_top,var(--c-void)_55%,transparent)] md:hidden" />
      <div ref={fadeRef} className="absolute inset-0">
        <Canvas
          frameloop={visible ? "always" : "never"}
          dpr={tier === "high" ? [1, 1.75] : [1, 1.25]}
          gl={{ antialias: tier === "high", alpha: true }}
          camera={{ fov: 30, position: [0, 1.38, 2.7] }}
          onCreated={({ camera }) => camera.lookAt(0, 1.38, 0)}
        >
          <ambientLight intensity={0.35} />
          <directionalLight position={[-2.5, 3.5, 3]} intensity={2.6} color="#eef1ff" />
          <directionalLight position={[2.5, 2, -2.5]} intensity={2.4} color="#8caeff" />
          <Suspense fallback={null}>
            <MyAvatar
              fadeTarget={fadeRef}
              onReady={() => {
                setReady(true);
                onReady?.();
              }}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
