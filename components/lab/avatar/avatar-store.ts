import { AvatarDirector } from "./director";
import { DURATIONS } from "./gestures";

/*
 * Shared, non-React state for the avatar prototype. GSAP and DOM handlers
 * write here; the R3F components read it inside useFrame. Same contract as
 * lib/motion/scroll-store.ts on the live site.
 */
export type FramingKey = "hero" | "work" | "hidden" | "about" | "contact";

export type Framing = { x: number; y: number; z: number; scale: number; yaw: number; opacity: number };

export const FRAMING_DESKTOP: Record<FramingKey, Framing> = {
  hero: { x: 0.62, y: 0, z: 0, scale: 1, yaw: -0.22, opacity: 1 },
  work: { x: 0.58, y: 0, z: 0, scale: 1, yaw: -0.32, opacity: 1 },
  hidden: { x: 0.95, y: -0.08, z: -0.4, scale: 0.85, yaw: -0.32, opacity: 0 },
  about: { x: 0.8, y: 0.36, z: 0, scale: 0.72, yaw: -0.2, opacity: 1 },
  contact: { x: 0.48, y: 0.04, z: 0, scale: 0.95, yaw: -0.12, opacity: 1 },
};

/** Mobile is a different layout, not a shrunken one: hero portrait and a contact cameo only. */
export const FRAMING_MOBILE: Record<FramingKey, Framing> = {
  hero: { x: 0, y: 0.98, z: 0, scale: 0.52, yaw: 0, opacity: 1 },
  work: { x: 0, y: 0.5, z: -0.6, scale: 0.7, yaw: 0, opacity: 0 },
  hidden: { x: 0, y: 0.5, z: -0.6, scale: 0.7, yaw: 0, opacity: 0 },
  about: { x: 0, y: 0.5, z: -0.6, scale: 0.7, yaw: 0, opacity: 0 },
  contact: { x: 0, y: 1.1, z: 0, scale: 0.42, yaw: 0, opacity: 1 },
};

type Listener = () => void;

/** One clock (seconds) shared by both canvases, the director and DOM handlers. */
export const clock = () => performance.now() / 1000;

export const avatarStore = {
  framing: { from: "hero" as FramingKey, to: "hero" as FramingKey, t: 0 },
  pointer: { x: 0, y: 0, lastMove: -Infinity, inside: false },
  /** Normalised device coords of the element to point at (set when a cue fires). */
  pointNdc: { x: -0.6, y: 0.3 },
  mobile: false,
  showDebug: false,
  director: new AvatarDirector(DURATIONS),
  /** Live readouts for the debug panel, written by the avatar each frame. */
  debug: { layers: [] as { yaw: number; pitch: number }[], gestureWeight: 0, fps: 0 },
  listeners: new Set<Listener>(),
  emit() {
    this.listeners.forEach((l) => l());
  },
};

export function framingNow(): Framing {
  const set = avatarStore.mobile ? FRAMING_MOBILE : FRAMING_DESKTOP;
  const { from, to, t } = avatarStore.framing;
  const a = set[from];
  const b = set[to];
  const k = t * t * (3 - 2 * t);
  const mix = (p: keyof Framing) => a[p] + (b[p] - a[p]) * k;
  return { x: mix("x"), y: mix("y"), z: mix("z"), scale: mix("scale"), yaw: mix("yaw"), opacity: mix("opacity") };
}
