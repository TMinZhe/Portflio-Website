import * as THREE from "three";
import type { Gesture } from "./director";

/*
 * PLACEHOLDER gesture library. Each gesture is a small procedural timeline of
 * IK hand targets, finger curls, head offsets, gaze and face targets, solved on
 * top of the idle clip. It exists to prove the plumbing (cues → director →
 * blended skeletal motion). The final avatar replaces these with the owner's
 * own motion-captured clips played through the AnimationMixer.
 *
 * Coordinates are in the character's root space: +Z faces the viewer,
 * +Y is up, and the character's RIGHT hand side is -X (screen left), which is
 * where the page content sits.
 */

export type Anchors = {
  head: THREE.Vector3;
  shoulderR: THREE.Vector3;
  shoulderL: THREE.Vector3;
};

export type GestureCtx = {
  t: number;
  anchors: Anchors;
  /** Root-space point the avatar should point at (e.g. a section heading). */
  point: THREE.Vector3;
  /** Root-space position of the camera / viewer. */
  viewer: THREE.Vector3;
};

export type Curl = { index: number; others: number; thumb: number };
export type ArmPose = { target: THREE.Vector3; aim: THREE.Vector3; curl: Curl };
export type FaceTargets = { smile: number; browUp: number; press: number; lookUp: number };

export type GestureSpec = {
  duration: number;
  fadeIn?: number;
  fadeOut?: number;
  right?: (c: GestureCtx) => ArmPose;
  left?: (c: GestureCtx) => ArmPose;
  /** Additive head offsets (radians): x = pitch (+ looks down), z = roll. */
  head?: (c: GestureCtx) => { x?: number; z?: number };
  /** Where to look, and how strongly that overrides the cursor. */
  gaze?: (c: GestureCtx) => { target: THREE.Vector3; weight: number };
  face?: FaceTargets;
  /** Play the avatar's own clip of this name (blended over idle by the envelope) instead of IK. */
  clip?: string;
};

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const add = (a: THREE.Vector3, x: number, y: number, z: number) => a.clone().add(v(x, y, z));
const OPEN: Curl = { index: -0.08, others: -0.08, thumb: 0 };
const POINT: Curl = { index: -0.1, others: 1.25, thumb: 0.55 };
const LOOSE: Curl = { index: 0.45, others: 0.85, thumb: 0.3 };

const towardViewer = (c: GestureCtx, w = 1) => ({ target: c.viewer, weight: w });

export const GESTURES: Record<Gesture, GestureSpec> = {
  // The owner's own Mixamo "Waving" clip (avatar/Waving.fbx), blended over idle.
  wave: {
    duration: 4.7,
    fadeIn: 0.5,
    fadeOut: 0.6,
    clip: "wave",
    head: ({ t }) => ({ z: 0.05 * Math.min(1, t * 2) }),
    gaze: (c) => towardViewer(c, 0.9),
    face: { smile: 0.85, browUp: 0.45, press: 0, lookUp: 0 },
  },
  // Farewell: the first part of the same clip, faded out early.
  waveSmall: {
    duration: 2.8,
    fadeIn: 0.45,
    fadeOut: 0.7,
    clip: "wave",
    gaze: (c) => towardViewer(c, 0.9),
    face: { smile: 0.7, browUp: 0.2, press: 0, lookUp: 0 },
  },
  point: {
    duration: 1.8,
    right: ({ anchors, point }) => {
      const dir = point.clone().sub(anchors.shoulderR);
      dir.z = Math.max(dir.z, 0.25); // never point behind the body
      dir.normalize();
      const target = anchors.shoulderR.clone().addScaledVector(dir, 0.62);
      return { target, aim: anchors.shoulderR.clone().addScaledVector(dir, 3), curl: POINT };
    },
    // Eyes lead to the target, then come back to the viewer.
    gaze: (c) => ({ target: c.t < 1.15 ? c.point : c.viewer, weight: 0.8 }),
    face: { smile: 0.25, browUp: 0.3, press: 0, lookUp: 0 },
  },
  think: {
    duration: 1.7,
    right: ({ anchors }) => {
      const target = add(anchors.head, -0.03, -0.19, 0.12);
      return { target, aim: add(anchors.head, 0.02, -0.02, 0.2), curl: LOOSE };
    },
    head: () => ({ x: -0.1, z: -0.06 }),
    gaze: ({ anchors }) => ({ target: add(anchors.head, 0.8, 0.7, 1.4), weight: 0.85 }),
    face: { smile: 0, browUp: 0.35, press: 0.45, lookUp: 0.5 },
  },
  present: {
    duration: 1.7,
    right: ({ anchors }) => {
      const target = add(anchors.shoulderR, -0.3, -0.3, 0.32);
      return { target, aim: add(target, -0.35, 0.05, 0.12), curl: OPEN };
    },
    gaze: (c) => ({ target: c.t < 0.7 ? add(c.anchors.shoulderR, -0.9, -0.3, 1) : c.viewer, weight: 0.7 }),
    face: { smile: 0.45, browUp: 0.25, press: 0, lookUp: 0 },
  },
  presentBoth: {
    duration: 1.9,
    // "Here you go": both hands forward and slightly apart, palms open.
    right: ({ anchors }) => {
      const target = add(anchors.shoulderR, -0.1, -0.3, 0.38);
      return { target, aim: add(target, -0.18, -0.02, 0.3), curl: OPEN };
    },
    left: ({ anchors }) => {
      const target = add(anchors.shoulderL, 0.06, -0.32, 0.38);
      return { target, aim: add(target, 0.12, -0.02, 0.3), curl: OPEN };
    },
    gaze: (c) => towardViewer(c, 0.9),
    face: { smile: 0.75, browUp: 0.3, press: 0, lookUp: 0 },
  },
  nod: {
    duration: 1.3,
    // Two downward nods.
    head: ({ t }) => ({ x: 0.13 * Math.max(0, Math.sin((t / 0.55) * Math.PI)) }),
    gaze: (c) => towardViewer(c, 0.6),
    face: { smile: 0.5, browUp: 0.2, press: 0, lookUp: 0 },
  },
};

export const DURATIONS = Object.fromEntries(
  Object.entries(GESTURES).map(([k, s]) => [k, s.duration]),
) as Record<Gesture, number>;

/** 0 → 1 → 0 blend envelope with eased ends. */
export function envelope(t: number, spec: GestureSpec) {
  const fi = spec.fadeIn ?? 0.35;
  const fo = spec.fadeOut ?? 0.45;
  const a = THREE.MathUtils.smootherstep(t, 0, fi);
  const b = 1 - THREE.MathUtils.smootherstep(t, spec.duration - fo, spec.duration);
  return Math.min(a, b);
}

export const NEUTRAL_FACE: FaceTargets = { smile: 0, browUp: 0, press: 0, lookUp: 0 };
