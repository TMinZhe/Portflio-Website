"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { avatarStore, clock, framingNow } from "./avatar-store";
import { GESTURES, envelope, type Anchors, type ArmPose } from "./gestures";
import { LookRig, aimBone, curlFinger, damp, twoBoneIK } from "./rig";
import type { Gesture } from "./director";

export const XBOT_URL = "/lab/placeholder/xbot.glb";

type ArmBones = {
  upper: THREE.Bone;
  lower: THREE.Bone;
  hand: THREE.Bone;
  middle1: THREE.Bone;
  fingers: { index: THREE.Bone[]; others: THREE.Bone[][]; thumb: THREE.Bone[] };
};

/**
 * PLACEHOLDER body: Mixamo "X Bot". Demonstrates the final avatar's runtime:
 * idle clip + additive clips through AnimationMixer, IK-blended gestures,
 * layered cursor tracking and scroll-driven framing, all in one useFrame.
 */
export function XbotAvatar({ onReady, fadeTarget }: { onReady?: () => void; fadeTarget: React.RefObject<HTMLDivElement | null> }) {
  const { scene, animations } = useGLTF(XBOT_URL);
  const { camera } = useThree();
  const root = useRef<THREE.Group>(null);

  const get = (n: string) => (scene.getObjectByName(`mixamorig${n}`) ?? scene.getObjectByName(`mixamorig:${n}`)) as THREE.Bone;

  const rig = useMemo(() => LookRig.mixamo((n) => scene.getObjectByName(n) ?? undefined), [scene]);

  const arms = useMemo(() => {
    const arm = (side: "Right" | "Left"): ArmBones => {
      const f = (name: string) => [1, 2, 3].map((i) => get(`${side}Hand${name}${i}`)).filter(Boolean);
      return {
        upper: get(`${side}Arm`),
        lower: get(`${side}ForeArm`),
        hand: get(`${side}Hand`),
        middle1: get(`${side}HandMiddle1`),
        fingers: { index: f("Index"), others: [f("Middle"), f("Ring"), f("Pinky")], thumb: f("Thumb") },
      };
    };
    return { right: arm("Right"), left: arm("Left") };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  const { mixer, nodAction } = useMemo(() => {
    const m = new THREE.AnimationMixer(scene);
    const idle = THREE.AnimationClip.findByName(animations, "idle")!;
    m.clipAction(idle).play();
    const agreeSrc = THREE.AnimationClip.findByName(animations, "agree")!.clone();
    THREE.AnimationUtils.makeClipAdditive(agreeSrc);
    const nod = m.clipAction(agreeSrc);
    nod.blendMode = THREE.AdditiveAnimationBlendMode;
    nod.setLoop(THREE.LoopOnce, 1);
    nod.clampWhenFinished = false;
    return { mixer: m, nodAction: nod };
  }, [scene, animations]);

  // Restyle the mannequin to sit in the site's palette, and keep it obviously a stand-in.
  useEffect(() => {
    scene.traverse((o) => {
      const mesh = o as THREE.SkinnedMesh;
      if (!mesh.isSkinnedMesh) return;
      mesh.frustumCulled = false;
      const joints = mesh.name.toLowerCase().includes("joint");
      mesh.material = new THREE.MeshStandardMaterial({
        color: joints ? "#1c232b" : "#55606d",
        roughness: joints ? 0.5 : 0.62,
        metalness: joints ? 0.4 : 0.05,
      });
    });
  }, [scene]);

  const state = useRef({
    anchors: null as Anchors | null,
    lastGesture: null as { g: Gesture; at: number } | null,
    framing: { ...framingNow() },
    idleGlance: new THREE.Vector3(),
    nextGlance: 0,
    readied: false,
  });

  const tmp = useMemo(
    () => ({
      ray: new THREE.Raycaster(),
      plane: new THREE.Plane(),
      hit: new THREE.Vector3(),
      ndc: new THREE.Vector2(),
      rootQ: new THREE.Quaternion(),
      v: new THREE.Vector3(),
    }),
    [],
  );

  /** NDC → world point on a camera-facing plane through `through`. */
  const ndcToWorld = (x: number, y: number, through: THREE.Vector3, out: THREE.Vector3) => {
    tmp.ndc.set(x, y);
    tmp.ray.setFromCamera(tmp.ndc, camera);
    const n = camera.getWorldDirection(tmp.v).negate();
    tmp.plane.setFromNormalAndCoplanarPoint(n, through);
    return tmp.ray.ray.intersectPlane(tmp.plane, out) ?? out.copy(through);
  };

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const now = clock();
    const g = root.current;
    if (!g) return;
    const st = state.current;

    // 4. Framing (applied first so this frame's IK uses the new root transform).
    const f = framingNow();
    for (const k of Object.keys(f) as (keyof typeof f)[]) {
      st.framing[k] = damp(st.framing[k], f[k], k === "opacity" ? 0.18 : 0.32, dt);
    }
    g.position.set(st.framing.x, st.framing.y, st.framing.z);
    g.scale.setScalar(st.framing.scale);
    g.rotation.y = st.framing.yaw;
    if (fadeTarget.current) fadeTarget.current.style.opacity = st.framing.opacity.toFixed(3);

    // 1. Skeletal clips.
    mixer.update(dt);
    g.updateMatrixWorld(true);

    if (!st.anchors) {
      const toRoot = (b: THREE.Object3D) => g.worldToLocal(b.getWorldPosition(new THREE.Vector3()));
      st.anchors = { head: toRoot(get("Head")), shoulderR: toRoot(arms.right.upper), shoulderL: toRoot(arms.left.upper) };
    }
    const anchors = st.anchors;
    const viewer = g.worldToLocal(camera.position.clone());
    const headWorld = get("Head").getWorldPosition(new THREE.Vector3());
    const point = g.worldToLocal(ndcToWorld(avatarStore.pointNdc.x, avatarStore.pointNdc.y, headWorld, new THREE.Vector3()).clone());

    // 2. Gesture layer (IK over the idle pose, blended by envelope weight).
    const perf = avatarStore.director.tick(now);
    let weight = 0;
    let gaze: { target: THREE.Vector3; weight: number } | null = null;
    rig.offset.set(0, 0, 0);
    if (perf) {
      const spec = GESTURES[perf.gesture];
      const t = now - perf.startedAt;
      weight = envelope(t, spec);
      const ctx = { t, anchors, point, viewer };
      if (spec.clip === "agree" && st.lastGesture?.at !== perf.startedAt) {
        nodAction.reset().setEffectiveWeight(1).fadeIn(0.15).play();
        nodAction.fadeOut(spec.duration);
      }
      st.lastGesture = { g: perf.gesture, at: perf.startedAt };
      if (spec.right) solveArm(arms.right, spec.right(ctx), weight, g, -1);
      if (spec.left) solveArm(arms.left, spec.left(ctx), weight, g, 1);
      const h = spec.head?.(ctx);
      if (h) rig.offset.set((h.x ?? 0) * weight, 0, (h.z ?? 0) * weight);
      const gz = spec.gaze?.(ctx);
      if (gz) gaze = { target: gz.target, weight: gz.weight * weight };
    }

    // 3. Look layer: cursor (or idle glances), blended with the gesture's gaze.
    const p = avatarStore.pointer;
    const tracking = !avatarStore.mobile && p.inside && now - p.lastMove < 2.5;
    let look: THREE.Vector3;
    if (tracking) {
      look = g.worldToLocal(ndcToWorld(p.x, p.y, headWorld, new THREE.Vector3()).clone());
    } else {
      if (now > st.nextGlance) {
        st.idleGlance.set((Math.random() - 0.5) * 0.5, (Math.random() - 0.4) * 0.25, 0);
        st.nextGlance = now + 1.5 + Math.random() * 2.5;
      }
      look = viewer.clone().add(st.idleGlance);
    }
    if (gaze) look.lerp(gaze.target, gaze.weight);
    const d = look.sub(anchors.head);
    const yaw = Math.atan2(d.x, d.z);
    const pitch = Math.atan2(d.y, Math.hypot(d.x, d.z));
    g.getWorldQuaternion(tmp.rootQ);
    rig.update(yaw, pitch, tmp.rootQ, dt);

    avatarStore.debug.layers = rig.layers.map((l) => ({ yaw: l.curYaw, pitch: l.curPitch }));
    avatarStore.debug.gestureWeight = weight;
    avatarStore.debug.fps = damp(avatarStore.debug.fps, 1 / Math.max(rawDt, 1e-3), 0.5, dt);

    if (!st.readied) {
      st.readied = true;
      onReady?.();
    }
  });

  return (
    <group ref={root}>
      <primitive object={scene} />
    </group>
  );
}

const _base = new Map<THREE.Object3D, THREE.Quaternion>();

/** Solve one arm at full weight, then blend every touched bone back toward the clip pose. */
function solveArm(arm: ArmBones, pose: ArmPose, weight: number, root: THREE.Object3D, sideSign: number) {
  if (weight <= 0.001 || !arm.upper) return;
  const chain = [arm.upper, arm.lower, arm.hand, ...arm.fingers.index, ...arm.fingers.others.flat(), ...arm.fingers.thumb];
  for (const b of chain) _base.set(b, (_base.get(b) ?? new THREE.Quaternion()).copy(b.quaternion));

  const toWorld = (p: THREE.Vector3) => root.localToWorld(p.clone());
  const shoulder = arm.upper.getWorldPosition(new THREE.Vector3());
  // Elbow hint: down, back and outward from the shoulder.
  const pole = root.localToWorld(root.worldToLocal(shoulder.clone()).add(new THREE.Vector3(0.35 * sideSign, -0.6, -0.45)));
  twoBoneIK(arm.upper, arm.lower, arm.hand, toWorld(pose.target), pole);
  aimBone(arm.hand, arm.middle1.getWorldPosition(new THREE.Vector3()), toWorld(pose.aim));

  const side = new THREE.Vector3(1, 0, 0).transformDirection(root.matrixWorld);
  curlFinger(arm.fingers.index, pose.curl.index, side);
  for (const f of arm.fingers.others) curlFinger(f, pose.curl.others, side);
  curlFinger(arm.fingers.thumb, pose.curl.thumb, side);

  for (const b of chain) b.quaternion.slerpQuaternions(_base.get(b)!, b.quaternion.clone(), weight);
  arm.upper.updateMatrixWorld(true);
}

useGLTF.preload(XBOT_URL);
