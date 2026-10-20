"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { useEffects } from "@/lib/hooks/use-effects";
import { useDeviceTier } from "@/lib/hooks/use-device";
import { avatarStore, clock, type FramingKey } from "./avatar-store";
import { XbotAvatar } from "./xbot-avatar";
import { FaceRigCanvas } from "./face-rig";
import type { CueName, Gesture } from "./director";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Isolated interaction prototype for "The Digital Me". Not linked from the site. */
export function AvatarLab() {
  const effects = useEffects();
  const tier = useDeviceTier();
  const fadeRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const webgl = effects === "full" && tier !== null && tier !== "none";

  // Pointer → shared store (mouse/pen only; touch devices get the mobile behaviour).
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

  // Greeting once the character is on screen.
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => avatarStore.director.cue("greet", clock()), 600);
    return () => clearTimeout(t);
  }, [ready]);

  // Scroll: framing is scrubbed (then damped in the scene); gestures are cued.
  useGSAP(
    () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-frame]"));
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: () => {
          const anchor = scrollY + innerHeight * 0.55;
          let i = 0;
          sections.forEach((s, k) => {
            if (s.offsetTop <= anchor) i = k;
          });
          const cur = sections[i];
          const prev = sections[Math.max(0, i - 1)];
          const t = clamp01((anchor - cur.offsetTop) / (innerHeight * 0.35));
          avatarStore.framing = {
            from: prev.dataset.frame as FramingKey,
            to: cur.dataset.frame as FramingKey,
            t: i === 0 ? 1 : t,
          };
        },
      });

      document.querySelectorAll<HTMLElement>("[data-cue]").forEach((el) => {
        const cue = el.dataset.cue as CueName;
        const aim = () => {
          const target = el.querySelector<HTMLElement>("[data-point]") ?? el;
          const r = target.getBoundingClientRect();
          avatarStore.pointNdc = {
            x: ((r.left + r.width * 0.35) / innerWidth) * 2 - 1,
            y: -((r.top + r.height / 2) / innerHeight) * 2 + 1,
          };
        };
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 45%",
          onEnter: () => {
            aim();
            avatarStore.director.cue(cue, clock(), 1);
          },
          onEnterBack: () => {
            aim();
            avatarStore.director.cue(cue, clock(), -1);
          },
        });
      });

      // Farewell after Contact has been in view for 4 s.
      let timer: ReturnType<typeof setTimeout> | undefined;
      ScrollTrigger.create({
        trigger: "#lab-contact",
        start: "top 40%",
        onEnter: () => (timer = setTimeout(() => avatarStore.director.cue("farewell", clock()), 4000)),
        onLeaveBack: () => clearTimeout(timer),
      });
      return () => clearTimeout(timer);
    },
    { dependencies: [] },
  );

  const request = (g: Gesture) => avatarStore.director.request([g], clock());

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-[rgb(9_11_17/0.85)] backdrop-blur-md">
        <div className="shell flex min-h-14 flex-wrap items-center gap-x-4 gap-y-1 py-2">
          <Link href="/" className="text-[0.875rem] text-ink-2 hover:text-ink">
            Back to site
          </Link>
          <p className="font-display text-[1rem]">Digital Me, interaction prototype</p>
          <p className="ml-auto rounded-[var(--r-xs)] border border-dashed border-[var(--c-warn)]/60 px-2 py-0.5 text-[0.8125rem] text-[var(--c-warn)]">
            Placeholder character (Mixamo X Bot), not your avatar
          </p>
        </div>
      </header>

      {/* Avatar layer */}
      <div ref={fadeRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        {/* Mobile: the portrait fades out below the shoulders so copy never sits on the body. */}
        <div className="absolute inset-x-0 bottom-0 z-10 h-[62%] bg-[linear-gradient(to_top,var(--c-void)_55%,transparent)] md:hidden" />
        {webgl ? (
          <Canvas
            dpr={tier === "high" ? [1, 1.75] : [1, 1.25]}
            gl={{ antialias: tier === "high", alpha: true }}
            camera={{ fov: 30, position: [0, 1.38, 2.7] }}
            onCreated={({ camera }) => camera.lookAt(0, 1.38, 0)}
          >
            <ambientLight intensity={0.35} />
            <directionalLight position={[-2.5, 3.5, 3]} intensity={2.6} color="#eef1ff" />
            <directionalLight position={[2.5, 2, -2.5]} intensity={2.4} color="#8caeff" />
            <Suspense fallback={null}>
              <XbotAvatar fadeTarget={fadeRef} onReady={() => setReady(true)} />
            </Suspense>
          </Canvas>
        ) : (
          <div className="absolute right-[6vw] top-1/2 hidden w-72 -translate-y-1/2 rounded-[var(--r-md)] border border-dashed border-line-strong p-6 text-[0.9375rem] text-ink-2 md:block">
            Reduced effects or no WebGL: a still poster rendered from your final avatar appears here. No motion, no
            tracking.
          </div>
        )}
      </div>

      <main className="relative z-10">
        <section data-frame="hero" className="flex min-h-svh items-end pb-16 pt-24 md:items-center">
          <div className="shell w-full">
            <div className="max-w-xl">
              <p className="text-ink-2">Mock hero</p>
              <h1 className="t-h1 mt-3">Hi, I build software that people actually use.</h1>
              <p className="t-lead mt-5">
                Move your cursor: eyes lead, the head follows, the torso joins in for large movements. Stop moving and
                it drifts back to idle glances.
              </p>
              <button
                type="button"
                onClick={() => request("wave")}
                className="mt-6 inline-flex min-h-11 items-center rounded-[var(--r-sm)] border border-line-strong px-4 text-[0.9375rem] hover:border-ink-2"
              >
                Say hi to the avatar
              </button>
            </div>
          </div>
        </section>

        <section data-frame="work" data-cue="work" className="flex min-h-[90svh] items-center">
          <div className="shell w-full">
            <h2 data-point className="t-h1 max-w-[12ch]">
              Selected work
            </h2>
            <p className="t-lead mt-4 max-w-md">Entering this section cues the point gesture at the heading above.</p>
          </div>
        </section>

        <section data-frame="hidden" className="flex min-h-[120svh] items-center">
          <div className="shell w-full">
            <div className="grid min-h-[60svh] place-items-center rounded-[var(--r-lg)] border border-line bg-[var(--c-elevated)] p-8 text-center text-ink-2">
              Project stage. The avatar steps aside so the work has the screen.
            </div>
          </div>
        </section>

        <section data-frame="about" data-cue="about" className="flex min-h-[110svh] items-center">
          <div className="shell w-full">
            <div className="max-w-xl">
              <h2 data-point className="t-h1">
                About me
              </h2>
              <p className="t-lead mt-4">
                The avatar returns small and docked, thinks, then presents this text with an open palm.
              </p>
            </div>
          </div>
        </section>

        <section data-frame="hidden" className="flex min-h-[90svh] items-center">
          <div className="shell w-full">
            <h2 className="t-h2">Experience and skills</h2>
            <p className="t-lead mt-4 max-w-md">Dense content, so the avatar stays hidden.</p>
          </div>
        </section>

        <section id="lab-contact" data-frame="contact" data-cue="contact" className="flex min-h-svh items-center pb-24">
          <div className="shell w-full">
            <div className="max-w-xl">
              <h2 data-point className="t-hero text-[clamp(3rem,8vw,7rem)]">
                Let’s build the next one.
              </h2>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => avatarStore.director.cue("react", clock())}
                  className="inline-flex min-h-11 items-center rounded-[var(--r-sm)] bg-lime px-5 font-medium text-[var(--c-lime-ink)]"
                >
                  Trigger reaction (simulates copying your email)
                </button>
              </div>
              <p className="mt-4 text-[0.875rem] text-ink-2">Stay here for 4 seconds for a farewell wave.</p>
            </div>
          </div>
        </section>
      </main>

      {webgl && (
        <div
          ref={faceRef}
          className="fixed bottom-4 right-4 z-40 hidden h-64 w-56 overflow-hidden rounded-[var(--r-md)] border border-line bg-[var(--c-graphite)] md:block"
        >
          <p className="absolute inset-x-0 top-0 z-10 px-3 py-2 text-[0.75rem] text-ink-2">
            Facial rig test: ARKit 52 blendshapes (placeholder head)
          </p>
          <Suspense fallback={null}>
            <FaceRigCanvas containerRef={faceRef} />
          </Suspense>
        </div>
      )}

      <DebugPanel onRequest={request} />
    </>
  );
}

const GESTURE_BUTTONS: Gesture[] = ["wave", "point", "think", "present", "presentBoth", "nod"];

function useTick(ms: number) {
  return useSyncExternalStore(
    (l) => {
      const id = setInterval(l, ms);
      return () => clearInterval(id);
    },
    () => Math.floor(performance.now() / ms),
    () => 0,
  );
}

function DebugPanel({ onRequest }: { onRequest: (g: Gesture) => void }) {
  useTick(150);
  // Collapsed by default on small screens so it never covers the content.
  const [open, setOpen] = useState(true);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (innerWidth < 768) setOpen(false);
  }, []);
  const snap = avatarStore.director.snapshot();
  const d = avatarStore.debug;
  const f = avatarStore.framing;
  const toDeg = (r: number) => `${((r * 180) / Math.PI).toFixed(1)}°`;
  const names = ["torso", "neck", "head", "eyes"];
  const now = clock();
  return (
    <aside
      aria-label="Prototype debug panel"
      className="fixed bottom-4 left-4 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-[var(--r-md)] border border-line bg-[rgb(23_30_36/0.92)] text-[0.8125rem] backdrop-blur"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-2 text-left font-medium"
      >
        Director and rig <span className="t-meta">{open ? "hide" : "show"}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-line px-3 pb-3 pt-2">
          <dl className="grid grid-cols-[6rem_1fr] gap-y-1 font-mono text-[0.75rem]">
            <dt className="text-ink-2">framing</dt>
            <dd>
              {f.from} → {f.to} ({f.t.toFixed(2)})
            </dd>
            <dt className="text-ink-2">gesture</dt>
            <dd>
              {snap.current
                ? `${snap.current.gesture} ${(((now - snap.current.startedAt) / snap.current.duration) * 100).toFixed(0)}%`
                : "idle"}{" "}
              <span className="text-ink-2">w {d.gestureWeight.toFixed(2)}</span>
            </dd>
            <dt className="text-ink-2">queued</dt>
            <dd>{snap.queued.join(", ") || "none"}</dd>
            {d.layers.map((l, i) => (
              <div key={i} className="contents">
                <dt className="text-ink-2">{names[i]}</dt>
                <dd>
                  yaw {toDeg(l.yaw)} pitch {toDeg(l.pitch)}
                </dd>
              </div>
            ))}
            <dt className="text-ink-2">fps</dt>
            <dd>{d.fps.toFixed(0)}</dd>
          </dl>
          <div>
            <p className="mb-1 text-ink-2">Cue log</p>
            <ul className="space-y-0.5 font-mono text-[0.7rem] text-ink-2">
              {snap.log.length ? snap.log.map((l, i) => <li key={i}>{l}</li>) : <li>none yet</li>}
            </ul>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {GESTURE_BUTTONS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onRequest(g)}
                className="rounded-[var(--r-xs)] border border-line-strong px-2 py-1 font-mono text-[0.75rem] hover:border-lime hover:text-lime"
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
