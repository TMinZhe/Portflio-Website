"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { easing } from "maath";
import { sceneStore } from "@/lib/motion/scroll-store";
import { damp } from "@/lib/motion/tokens";
import type { DeviceTier } from "@/lib/hooks/use-device";
import { DEPTH, LAYERS, SEALED_Y, TRACES, WIDTH, explodedOffset, layerPattern } from "./layers";

const ICE = new THREE.Color("#8caeff");
const LIME = new THREE.Color("#b6ff3b");
const METAL = ["#2a333e", "", "#36424f", "#3d4a59"];

type Props = {
  tier: Exclude<DeviceTier, "none">;
  /** Called after the first frame has rendered, so the fallback can fade out. */
  onReady?: () => void;
};

/**
 * WebGL scene for the Exploded Monolith. Rendered in demand mode: a frame is
 * only drawn when scroll, pointer or an unsettled damp needs one, and never
 * while the canvas is off-screen or the tab is hidden.
 */
export default function MonolithScene({ tier, onReady }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={wrapRef} className="absolute inset-0 touch-pan-y">
      <Canvas
        frameloop="demand"
        dpr={tier === "high" ? [1, 1.75] : [1, 1.25]}
        gl={{ antialias: tier === "high", powerPreference: "high-performance", alpha: true }}
        camera={{ fov: 30, position: [0, 1.4, 9.5], near: 0.1, far: 50 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
        aria-hidden
      >
        <Rig tier={tier} container={wrapRef} onReady={onReady} />
      </Canvas>
    </div>
  );
}

function Rig({
  tier,
  container,
  onReady,
}: {
  tier: Props["tier"];
  container: React.RefObject<HTMLDivElement | null>;
  onReady?: () => void;
}) {
  const { invalidate, size, gl } = useThree();
  const group = useRef<THREE.Group>(null);
  const layerRefs = useRef<(THREE.Group | null)[]>([]);
  const edgeMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const etchMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const traceRef = useRef<THREE.InstancedMesh>(null);
  const keyLight = useRef<THREE.DirectionalLight>(null);

  // Animated values (current) and their targets.
  const v = useRef({ intro: 0, explode: 0, focus: 3, tiltX: 0, tiltY: 0, drag: 0 });
  const target = useRef({ tiltX: 0, tiltY: 0, drag: 0 });
  const visible = useRef(true);
  const readied = useRef(false);
  const traces = tier === "high";
  const scratch = useMemo(
    () => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), sc: new THREE.Vector3() }),
    [],
  );

  const traceMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uAmount: { value: 0 },
          uLime: { value: LIME },
          uIce: { value: ICE },
        },
        vertexShader: /* glsl */ `
          varying float vY;
          varying float vSeed;
          attribute float seed;
          void main() {
            vY = position.y + 0.5;
            vSeed = seed;
            gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform float uAmount; uniform vec3 uLime; uniform vec3 uIce;
          varying float vY; varying float vSeed;
          void main() {
            float p = fract(vY * 0.9 - uTime * 0.32 + vSeed);
            float pulse = smoothstep(0.0, 0.05, p) * (1.0 - smoothstep(0.05, 0.2, p));
            vec3 col = mix(uIce * 0.35, uLime, pulse);
            float a = (0.18 + pulse * 0.95) * uAmount;
            gl_FragColor = vec4(col, a);
          }`,
      }),
    [],
  );

  const traceGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.011, 0.011, 1, 6, 1, true);
    return g;
  }, []);

  const traceObject = useMemo(() => {
    const mesh = new THREE.InstancedMesh(traceGeo, traceMat, TRACES.length);
    const seeds = new Float32Array(TRACES.length);
    TRACES.forEach((_, i) => (seeds[i] = (i * 0.37) % 1));
    traceGeo.setAttribute("seed", new THREE.InstancedBufferAttribute(seeds, 1));
    mesh.frustumCulled = false;
    return mesh;
  }, [traceGeo, traceMat]);

  // Shared geometries per layer: outline edges and etched top pattern.
  const layerGeo = useMemo(
    () =>
      LAYERS.map((l) => {
        const w = WIDTH - l.inset * 2;
        const d = DEPTH - l.inset * 2;
        const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(w + 0.004, l.height + 0.004, d + 0.004));
        const segs = layerPattern(l.id, w, d);
        const pos = new Float32Array(segs.length * 6);
        const y = l.height / 2 + 0.003;
        segs.forEach(([x1, z1, x2, z2], i) => pos.set([x1, y, z1, x2, y, z2], i * 6));
        const etch = new THREE.BufferGeometry();
        etch.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        return { w, d, edges, etch };
      }),
    [],
  );

  useEffect(() => {
    const unsub = sceneStore.subscribe(() => invalidate());

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.current.tiltY = (e.clientX / innerWidth - 0.5) * 2;
      target.current.tiltX = (e.clientY / innerHeight - 0.5) * 2;
      invalidate();
    };
    addEventListener("pointermove", onPointer, { passive: true });

    // Drag to inspect: horizontal drag spins the stack, it springs back on release.
    const el = gl.domElement;
    let dragging = false;
    let lastX = 0;
    const down = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      target.current.drag = THREE.MathUtils.clamp(target.current.drag + (e.clientX - lastX) * 0.009, -1.6, 1.6);
      lastX = e.clientX;
      invalidate();
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      target.current.drag = 0;
      el.style.cursor = "";
      invalidate();
    };
    el.addEventListener("pointerdown", down);
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);

    const io = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      if (entry.isIntersecting) invalidate();
    });
    if (container.current) io.observe(container.current);
    const onVis = () => !document.hidden && invalidate();
    document.addEventListener("visibilitychange", onVis);

    return () => {
      unsub();
      removeEventListener("pointermove", onPointer);
      el.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", up);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [invalidate, gl, container]);

  const wide = size.width / size.height > 1.05;

  useFrame((state, dt) => {
    const delta = Math.min(dt, 1 / 30); // avoid jumps after a stalled frame
    const s = sceneStore.get();
    const cur = v.current;
    const t = target.current;
    let moving = false;
    const step = (key: keyof typeof cur, to: number, smooth: number) => {
      const before = cur[key];
      easing.damp(cur, key, to, smooth, delta);
      if (Math.abs(cur[key] - before) > damp.epsilon || Math.abs(cur[key] - to) > damp.epsilon) moving = true;
    };

    step("intro", 1, 0.55);
    step("explode", s.explode, damp.scroll);
    step("focus", s.focus, damp.scroll);
    step("tiltX", t.tiltX, damp.pointer);
    step("tiltY", t.tiltY, damp.pointer);
    step("drag", t.drag, damp.drag);

    const g = group.current;
    if (g) {
      const e = cur.explode;
      g.rotation.x = 0.36 + cur.tiltX * 0.07 - e * 0.1;
      g.rotation.y = -0.62 + e * 1.75 + cur.tiltY * 0.14 + cur.drag;
      g.position.x = wide ? 1.75 - e * 0.35 : 0;
      g.position.y = (wide ? 0.2 : 1.0 - e * 0.05) + (1 - cur.intro) * -0.5;
      const narrow = THREE.MathUtils.clamp(size.width / 690, 0.56, 0.8);
      const sc = (wide ? 1 - e * 0.14 : narrow - e * 0.14) * (0.92 + cur.intro * 0.08);
      g.scale.setScalar(sc);
    }

    LAYERS.forEach((_, i) => {
      const ref = layerRefs.current[i];
      if (!ref) return;
      const o = explodedOffset(i, cur.explode);
      ref.position.set(o.x, SEALED_Y[i] + o.y, 0);
      ref.rotation.y = o.yaw;
      const near = Math.max(0, 1 - Math.abs(cur.focus - i));
      const em = edgeMats.current[i];
      if (em) em.opacity = (0.16 + near * 0.55 * cur.explode) * cur.intro;
      const et = etchMats.current[i];
      if (et) et.opacity = (0.12 + cur.explode * 0.25 + near * 0.4 * cur.explode) * cur.intro;
    });

    if (keyLight.current) keyLight.current.intensity = 3.4 * cur.intro;

    const traceMesh = traceRef.current;
    if (traces && traceMesh) {
      const uniforms = (traceMesh.material as THREE.ShaderMaterial).uniforms;
      uniforms.uTime.value = state.clock.elapsedTime;
      uniforms.uAmount.value = cur.intro * (0.25 + cur.explode * 0.75);
      // Traces span the exploded stack height.
      const top = SEALED_Y[3] + explodedOffset(3, cur.explode).y + 0.2;
      const bottom = SEALED_Y[0] + explodedOffset(0, cur.explode).y - 0.2;
      const { m, p, q, sc } = scratch;
      sc.set(1, top - bottom, 1);
      TRACES.forEach(([x, z], i) => {
        traceMesh.setMatrixAt(i, m.compose(p.set(x, (top + bottom) / 2, z), q, sc));
      });
      traceMesh.instanceMatrix.needsUpdate = true;
    }

    if (!readied.current) {
      readied.current = true;
      onReady?.();
    }

    const awake = visible.current && !document.hidden;
    if (awake && (moving || traces)) invalidate();
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight ref={keyLight} position={[-4, 6, 3]} intensity={0} color="#e8eeff" />
      <directionalLight position={[5, 1.5, -4]} intensity={2.2} color="#8caeff" />
      <Environment resolution={tier === "high" ? 256 : 64} frames={1}>
        <Lightformer form="rect" intensity={4} position={[0, 5, -2]} scale={[10, 1.6, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.2} position={[0, 1, 6]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#8caeff" position={[-5, 1, 1]} scale={[3, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={0.35} color="#b6ff3b" position={[5, -1, 2]} scale={[2, 3, 1]} rotation-y={-Math.PI / 2} />
      </Environment>

      <group ref={group}>
        {LAYERS.map((l, i) => {
          const geo = layerGeo[i];
          const accent = l.id === "logic";
          return (
            <group key={l.id} ref={(el) => void (layerRefs.current[i] = el)}>
              <RoundedBox args={[geo.w, l.height, geo.d]} radius={Math.min(0.035, l.height / 3)} smoothness={tier === "high" ? 4 : 2}>
                {l.tone === "glass" ? (
                  <meshStandardMaterial color="#0e1622" metalness={0.2} roughness={0.15} transparent opacity={0.62} emissive="#8caeff" emissiveIntensity={0.06} />
                ) : (
                  <meshStandardMaterial color={METAL[i]} metalness={0.78} roughness={i === 3 ? 0.42 : 0.34} envMapIntensity={1.25} />
                )}
              </RoundedBox>
              <lineSegments geometry={geo.edges}>
                <lineBasicMaterial
                  ref={(m) => void (edgeMats.current[i] = m)}
                  color={accent ? LIME : ICE}
                  transparent
                  opacity={0}
                  toneMapped={false}
                />
              </lineSegments>
              <lineSegments geometry={geo.etch}>
                <lineBasicMaterial
                  ref={(m) => void (etchMats.current[i] = m)}
                  color={l.id === "interface" ? LIME : ICE}
                  transparent
                  opacity={0}
                  toneMapped={false}
                />
              </lineSegments>
            </group>
          );
        })}
        {traces && <primitive ref={traceRef} object={traceObject} />}
      </group>
    </>
  );
}
