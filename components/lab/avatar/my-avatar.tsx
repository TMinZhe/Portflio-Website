"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { avatarStore, clock, framingNow } from "./avatar-store";
import { GESTURES, envelope, type Anchors, type ArmPose } from "./gestures";
import { LookRig, aimBone, curlFinger, damp, rotateBoneWorld, twoBoneIK } from "./rig";

/** Built from avatar/Waving.fbx (Mixamo rig + clip) with the baked-light texture from lod_basic_shaded.fbx. */
export const AVATAR_URL = "/lab/avatar/me.glb";

/** The rig is in centimetres and 1.81 m tall; the framing presets are tuned for a ~1.6 m figure. */
const HEIGHT_SCALE = 0.01 * 0.88;

/**
 * How far the face turns toward the cursor, as a share of the natural range.
 * The mesh has no separate eyes, so head, neck and torso carry the whole look.
 * 0.5 caps it at about 30° to the side and 18° up or down.
 */
const LOOK_RANGE = 0.5;

type ArmBones = {
  upper: THREE.Bone;
  lower: THREE.Bone;
  hand: THREE.Bone;
  middle1: THREE.Bone;
  fingers: { index: THREE.Bone[]; others: THREE.Bone[][]; thumb: THREE.Bone[] };
};

/**
 * The owner's avatar on its Mixamo rig. Procedural idle, the owner's wave clip,
 * IK-blended placeholder gestures, layered cursor tracking and scroll-driven
 * framing, all in one useFrame.
 */
export function MyAvatar({ onReady, fadeTarget }: { onReady?: () => void; fadeTarget: React.RefObject<HTMLDivElement | null> }) {
  const { scene, animations } = useGLTF(AVATAR_URL);
  const { camera } = useThree();
  const root = useRef<THREE.Group>(null);

  const get = (n: string) => (scene.getObjectByName(`mixamorig${n}`) ?? scene.getObjectByName(`mixamorig:${n}`)) as THREE.Bone;

  const rig = useMemo(() => LookRig.mixamo((n) => scene.getObjectByName(n) ?? undefined, LOOK_RANGE), [scene]);

  const arms = useMemo(() => {
    const arm = (side: "Right" | "Left"): ArmBones => ({
      upper: get(`${side}Arm`),
      lower: get(`${side}ForeArm`),
      hand: get(`${side}Hand`),
      // The rig has a single (index) finger chain; it also gives the hand's direction.
      middle1: get(`${side}HandIndex1`),
      fingers: { index: [1, 2, 3].map((i) => get(`${side}HandIndex${i}`)).filter(Boolean), others: [], thumb: [] },
    });
    return { right: arm("Right"), left: arm("Left") };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  // Bind pose, restored every frame before idle, clip, IK and look layers apply.
  const rest = useMemo(() => {
    const bones: { bone: THREE.Bone; q: THREE.Quaternion; p: THREE.Vector3 }[] = [];
    scene.traverse((o) => {
      const b = o as THREE.Bone;
      if (b.isBone) bones.push({ bone: b, q: b.quaternion.clone(), p: b.position.clone() });
      const mesh = o as THREE.SkinnedMesh;
      if (mesh.isSkinnedMesh) mesh.frustumCulled = false;
    });
    return bones;
  }, [scene]);

  // Clips are sampled directly rather than through an AnimationMixer: the mixer
  // skips writing a bone whose value hasn't changed since its last write, which
  // fights the per-frame reset to the bind pose (bones snap back to rest).
  const clips = useMemo(() => {
    const out = new Map<string, { duration: number; samplers: { target: THREE.Vector3 | THREE.Quaternion; sample: (t: number) => ArrayLike<number> }[] }>();
    for (const clip of animations) {
      const samplers = [];
      for (const track of clip.tracks) {
        const { nodeName, propertyName } = THREE.PropertyBinding.parseTrackName(track.name);
        const node = scene.getObjectByName(nodeName);
        if (!node || (propertyName !== "quaternion" && propertyName !== "position")) continue;
        const size = track.getValueSize();
        const Interp = propertyName === "quaternion" ? THREE.QuaternionLinearInterpolant : THREE.LinearInterpolant;
        const interp = new Interp(track.times, track.values, size, new Float32Array(size));
        samplers.push({ target: node[propertyName], sample: (t: number) => interp.evaluate(t) });
      }
      out.set(clip.name, { duration: clip.duration, samplers });
    }
    return out;
  }, [scene, animations]);

  const idle = useMemo(
    () => ({
      hips: get("Hips"),
      spine: get("Spine"),
      spine1: get("Spine1"),
      spine2: get("Spine2"),
      q: new THREE.Quaternion(),
      axis: new THREE.Vector3(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scene],
  );

  const state = useRef({
    anchors: null as Anchors | null,
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
      pose: new Map<THREE.Bone, { q: THREE.Quaternion; p: THREE.Vector3 }>(),
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

  // Click (or tap) the avatar to make it wave. The canvas sits under the page and
  // takes no pointer events, so hits are tested against the mesh from window events;
  // clicks on links, buttons and form controls are left alone.
  useEffect(() => {
    let mesh: THREE.SkinnedMesh | undefined;
    scene.traverse((o) => {
      if ((o as THREE.SkinnedMesh).isSkinnedMesh) mesh ??= o as THREE.SkinnedMesh;
    });
    if (!mesh) return;
    const avatar = mesh;
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const interactive = "a, button, input, select, textarea, label, summary, [role='button'], [tabindex]";

    const hit = (e: PointerEvent | MouseEvent) => {
      if (state.current.framing.opacity < 0.5) return false;
      if ((e.target as Element | null)?.closest?.(interactive)) return false;
      ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      return ray.intersectObject(avatar, false).length > 0;
    };

    const click = (e: MouseEvent) => {
      if (!hit(e)) return;
      const cur = avatarStore.director.snapshot().current?.gesture;
      if (cur === "wave" || cur === "waveSmall") return;
      avatarStore.director.request(["wave"], clock());
    };

    // Pointer cursor over the avatar, tested at most every 120 ms.
    let last = 0;
    let over = false;
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch" || e.timeStamp - last < 120) return;
      last = e.timeStamp;
      const now = hit(e);
      if (now !== over) document.body.style.cursor = (over = now) ? "pointer" : "";
    };

    addEventListener("click", click);
    addEventListener("pointermove", move, { passive: true });
    return () => {
      removeEventListener("click", click);
      removeEventListener("pointermove", move);
      if (over) document.body.style.cursor = "";
    };
  }, [scene, camera]);

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

    // 1. Procedural idle: back to the bind pose, then breathe and shift weight.
    // Rotations are about the character's own axes, so bone conventions don't matter.
    for (const r of rest) {
      r.bone.quaternion.copy(r.q);
      r.bone.position.copy(r.p);
    }
    g.updateMatrixWorld(true);
    g.getWorldQuaternion(tmp.rootQ);
    const breath = Math.sin(now * ((Math.PI * 2) / 4.2));
    const shift = Math.sin(now * ((Math.PI * 2) / 8.5));
    const turn = (bone: THREE.Bone, x: number, y: number, z: number) => {
      for (const [ax, a] of [[0, x], [1, y], [2, z]] as const) {
        if (!a) continue;
        idle.axis.set(+(ax === 0), +(ax === 1), +(ax === 2)).applyQuaternion(tmp.rootQ);
        rotateBoneWorld(bone, idle.q.setFromAxisAngle(idle.axis, a));
      }
    };
    turn(idle.hips, 0, shift * 0.025, shift * 0.018);
    turn(idle.spine, -breath * 0.006, 0, -shift * 0.012);
    turn(idle.spine1, breath * 0.012, 0, -shift * 0.006);
    turn(idle.spine2, breath * 0.01, 0, 0);

    const perf = avatarStore.director.tick(now);
    const spec = perf ? GESTURES[perf.gesture] : null;
    const t = perf ? now - perf.startedAt : 0;
    const weight = spec ? envelope(t, spec) : 0;

    // 1b. Clip gestures: sample the clip at gesture time, then blend it over idle.
    const clip = spec?.clip ? clips.get(spec.clip) : undefined;
    if (clip && weight > 0.001) {
      for (const r of rest) {
        const s = tmp.pose.get(r.bone) ?? { q: new THREE.Quaternion(), p: new THREE.Vector3() };
        s.q.copy(r.bone.quaternion);
        s.p.copy(r.bone.position);
        tmp.pose.set(r.bone, s);
      }
      const ct = Math.min(t, clip.duration);
      for (const c of clip.samplers) c.target.fromArray(c.sample(ct) as number[]);
      for (const r of rest) {
        const s = tmp.pose.get(r.bone)!;
        r.bone.quaternion.slerpQuaternions(s.q, r.bone.quaternion.clone(), weight);
        r.bone.position.lerpVectors(s.p, r.bone.position.clone(), weight);
      }
    }
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
    let gaze: { target: THREE.Vector3; weight: number } | null = null;
    rig.offset.set(0, 0, 0);
    if (spec) {
      const ctx = { t, anchors, point, viewer };
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
      <group scale={HEIGHT_SCALE}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

const _base = new Map<THREE.Object3D, THREE.Quaternion>();

/** Solve one arm at full weight, then blend every touched bone back toward the idle pose. */
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

useGLTF.preload(AVATAR_URL);
