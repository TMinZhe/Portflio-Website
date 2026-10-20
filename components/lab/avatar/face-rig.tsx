"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import type { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { avatarStore, clock } from "./avatar-store";
import { GESTURES, NEUTRAL_FACE, envelope, type FaceTargets } from "./gestures";
import { damp, soft } from "./rig";

export const FACE_URL = "/lab/placeholder/facecap.glb";
const deg = THREE.MathUtils.degToRad;

let ktx2: KTX2Loader | null = null;

/**
 * PLACEHOLDER face: an ARKit 52-blendshape head. Proves the facial layer the
 * final avatar will use, with the same shape names: eye-look follows the
 * cursor, procedural blinks, and expressions driven by the director's gestures.
 */
export function FaceRigCanvas({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <Canvas camera={{ fov: 22, position: [0, 0, 1] }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[-2, 2, 3]} intensity={2.2} />
      <directionalLight position={[2, 0.5, -2]} intensity={1.6} color="#8caeff" />
      <Face containerRef={containerRef} />
    </Canvas>
  );
}

function Face({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const gltf = useGLTF(FACE_URL, false, true, (loader) => {
    ktx2 ??= new KTX2Loader().setTranscoderPath("/lab/basis/").detectSupport(gl);
    (loader as unknown as GLTFLoader).setKTX2Loader(ktx2);
  });

  const parts = useMemo(() => {
    const head = gltf.scene.children[0];
    let face: THREE.Mesh | null = null;
    gltf.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.morphTargetDictionary && Object.keys(m.morphTargetDictionary).length > 40) face = m;
    });
    return {
      head,
      face: face as THREE.Mesh | null,
      eyeL: gltf.scene.getObjectByName("grp_eyeLeft"),
      eyeR: gltf.scene.getObjectByName("grp_eyeRight"),
    };
  }, [gltf]);

  // Fit the camera to the head once.
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const cam = camera as THREE.PerspectiveCamera;
    const dist = (size.y * 0.62) / Math.tan(deg(cam.fov / 2));
    cam.position.set(center.x, center.y + size.y * 0.05, center.z + dist);
    cam.lookAt(center.x, center.y + size.y * 0.05, center.z);
    cam.near = dist / 50;
    cam.far = dist * 10;
    cam.updateProjectionMatrix();
  }, [gltf, camera]);

  const st = useRef({
    yaw: 0,
    pitch: 0,
    eyeYaw: 0,
    eyePitch: 0,
    lastEyeYaw: 0,
    face: { ...NEUTRAL_FACE } as FaceTargets,
    blinkAt: 0,
    blinkStart: -1,
    double: false,
  });

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const now = clock();
    const { head, face, eyeL, eyeR } = parts;
    const v = st.current;
    if (!face?.morphTargetInfluences || !face.morphTargetDictionary) return;
    const dict = face.morphTargetDictionary;
    const set = (name: string, val: number) => {
      const i = dict[name];
      if (i !== undefined) face.morphTargetInfluences![i] = val;
    };

    // Gaze: global pointer relative to this inset's centre.
    const rect = containerRef.current?.getBoundingClientRect();
    const p = avatarStore.pointer;
    let ty = 0;
    let tp = 0;
    if (rect && p.inside && now - p.lastMove < 2.5) {
      const px = ((p.x + 1) / 2) * innerWidth;
      const py = ((1 - p.y) / 2) * innerHeight;
      const dx = (px - (rect.left + rect.width / 2)) / innerWidth;
      const dy = (py - (rect.top + rect.height / 2)) / innerHeight;
      ty = Math.atan2(dx * 1.6, 0.9);
      tp = -Math.atan2(dy * 1.2, 0.9);
    }
    // Head takes a damped share; eyes cover the rest and lead.
    v.yaw = damp(v.yaw, soft(ty * 0.55, deg(25)), 0.25, dt);
    v.pitch = damp(v.pitch, soft(tp * 0.5, deg(15)), 0.25, dt);
    v.eyeYaw = damp(v.eyeYaw, soft(ty - v.yaw, deg(28)), 0.05, dt);
    v.eyePitch = damp(v.eyePitch, soft(tp - v.pitch, deg(18)), 0.05, dt);
    head.rotation.set(-v.pitch, v.yaw, 0);
    for (const e of [eyeL, eyeR]) e?.rotation.set(-v.eyePitch, v.eyeYaw, 0);
    // Lids and surrounding skin follow the eyes via the ARKit look shapes.
    const k = 1 / deg(28);
    set("eyeLookOut_L", Math.max(0, v.eyeYaw) * k * 0.6);
    set("eyeLookIn_R", Math.max(0, v.eyeYaw) * k * 0.6);
    set("eyeLookIn_L", Math.max(0, -v.eyeYaw) * k * 0.6);
    set("eyeLookOut_R", Math.max(0, -v.eyeYaw) * k * 0.6);
    const up = Math.max(0, v.eyePitch) / deg(18);
    const down = Math.max(0, -v.eyePitch) / deg(18);

    // Expression from the director's current gesture.
    const perf = avatarStore.director.tick(now);
    let target = NEUTRAL_FACE;
    let w = 0;
    if (perf) {
      const spec = GESTURES[perf.gesture];
      w = envelope(now - perf.startedAt, spec);
      target = spec.face ?? NEUTRAL_FACE;
    }
    for (const key of Object.keys(v.face) as (keyof FaceTargets)[]) {
      v.face[key] = damp(v.face[key], target[key] * w, 0.15, dt);
    }
    set("mouthSmile_L", v.face.smile);
    set("mouthSmile_R", v.face.smile);
    set("cheekSquint_L", v.face.smile * 0.5);
    set("cheekSquint_R", v.face.smile * 0.5);
    set("browInnerUp", v.face.browUp);
    set("browOuterUp_L", v.face.browUp * 0.6);
    set("browOuterUp_R", v.face.browUp * 0.6);
    set("mouthPress_L", v.face.press);
    set("mouthPress_R", v.face.press);
    set("eyeLookUp_L", Math.min(1, up * 0.6 + v.face.lookUp));
    set("eyeLookUp_R", Math.min(1, up * 0.6 + v.face.lookUp));
    set("eyeLookDown_L", down * 0.6);
    set("eyeLookDown_R", down * 0.6);

    // Blinks: every 2–6 s, 15 % doubles, plus one on large gaze jumps.
    if (Math.abs(v.eyeYaw - v.lastEyeYaw) > deg(1.2) && now - v.blinkStart > 1) {
      v.blinkStart = now;
    }
    v.lastEyeYaw = v.eyeYaw;
    if (now > v.blinkAt && v.blinkStart < v.blinkAt) {
      v.blinkStart = now;
      v.double = Math.random() < 0.15;
      v.blinkAt = now + 2 + Math.random() * 4;
    }
    const bt = now - v.blinkStart;
    const one = (x: number) => (x < 0 ? 0 : x < 0.07 ? x / 0.07 : x < 0.12 ? 1 : x < 0.27 ? 1 - (x - 0.12) / 0.15 : 0);
    const blink = Math.max(one(bt), v.double ? one(bt - 0.32) : 0);
    const squint = v.face.smile * 0.3;
    set("eyeBlink_L", Math.max(blink, squint));
    set("eyeBlink_R", Math.max(blink, squint));
  });

  return <primitive object={gltf.scene} />;
}

