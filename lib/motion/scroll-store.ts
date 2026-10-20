/**
 * Tiny mutable store that carries scroll progress from GSAP ScrollTrigger to
 * the R3F scene without React re-renders. GSAP writes; the canvas reads inside
 * useFrame and is notified so a demand-mode canvas can invalidate.
 */
type Listener = () => void;

export type SceneState = {
  /** 0 = sealed monolith (hero), 1 = fully exploded (transformation end). */
  explode: number;
  /** Layer index (0 bottom … 3 top) currently highlighted; fractional while moving. */
  focus: number;
};

const state: SceneState = { explode: 0, focus: 3 };
const listeners = new Set<Listener>();

export const sceneStore = {
  get: () => state,
  set(patch: Partial<SceneState>) {
    let changed = false;
    for (const key of Object.keys(patch) as (keyof SceneState)[]) {
      const v = patch[key];
      if (v !== undefined && v !== state[key]) {
        state[key] = v;
        changed = true;
      }
    }
    if (changed) listeners.forEach((l) => l());
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
