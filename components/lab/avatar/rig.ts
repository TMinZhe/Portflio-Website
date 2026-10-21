import * as THREE from "three";

/*
 * Post-animation rig layers. Everything here runs *after* AnimationMixer.update,
 * on top of whatever pose the clips produced, and works in world space so it
 * does not depend on a particular skeleton's bone-axis conventions.
 */

const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _pq = new THREE.Quaternion();
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();

/** Apply a world-space rotation to a bone, keeping it expressed in local space. */
export function rotateBoneWorld(bone: THREE.Object3D, qWorld: THREE.Quaternion) {
  bone.getWorldQuaternion(_q2);
  bone.parent!.getWorldQuaternion(_pq);
  bone.quaternion.copy(_pq.invert().multiply(_q.copy(qWorld).multiply(_q2)));
  bone.updateMatrixWorld(true);
}

/** Rotate `bone` so the direction bone→`from` points at `to` (both world positions). */
export function aimBone(bone: THREE.Object3D, from: THREE.Vector3, to: THREE.Vector3) {
  const origin = bone.getWorldPosition(_v1);
  const cur = _v2.subVectors(from, origin).normalize();
  const want = _v3.subVectors(to, origin).normalize();
  if (cur.lengthSq() < 1e-8 || want.lengthSq() < 1e-8) return;
  rotateBoneWorld(bone, new THREE.Quaternion().setFromUnitVectors(cur, want));
}

/** Smoothly limit a value to ±limit (soft knee instead of a hard clamp). */
export const soft = (v: number, limit: number) => limit * Math.tanh(v / limit);

/** Frame-rate independent damping toward a target with a half-life in seconds. */
export const damp = (cur: number, to: number, halfLife: number, dt: number) =>
  to + (cur - to) * Math.pow(2, -dt / Math.max(halfLife, 1e-4));

const deg = THREE.MathUtils.degToRad;

export type LookLayer = {
  bones: THREE.Object3D[];
  /** Max yaw / pitch for this layer, radians. */
  yaw: number;
  pitch: number;
  halfLife: number;
  /** Share of the remaining look this layer takes (eyes take what is left). */
  share: number;
  /** Below this fraction of the head limit the layer stays still (torso). */
  engageAbove?: number;
};

export type LookState = { curYaw: number; curPitch: number };

/**
 * Layered gaze: torso → neck → head → eyes. Each layer takes a damped share of
 * the total look, so the eyes (fastest) lead and the head and torso catch up —
 * the eyes then counter-rotate back toward centre, as real eyes do.
 */
export class LookRig {
  layers: (LookLayer & LookState)[];
  /** Additive head offsets for nods / tilts, in radians (pitch, yaw, roll). */
  offset = new THREE.Euler();

  constructor(layers: LookLayer[]) {
    this.layers = layers.map((l) => ({ ...l, curYaw: 0, curPitch: 0 }));
  }

  /** @param range scales the torso / neck / head limits (1 = full natural range) */
  static mixamo(get: (n: string) => THREE.Object3D | undefined, range = 1) {
    const b = (n: string) => get(`mixamorig${n}`) ?? get(`mixamorig:${n}`);
    const eyes = [b("LeftEye"), b("RightEye")].filter(Boolean) as THREE.Object3D[];
    const r = (d: number) => deg(d) * range;
    return new LookRig([
      { bones: [b("Spine2")!], yaw: r(10), pitch: r(5), halfLife: 0.6, share: 0.18, engageAbove: 0.6 },
      { bones: [b("Neck")!], yaw: r(20), pitch: r(12), halfLife: 0.3, share: 0.3 },
      { bones: [b("Head")!], yaw: r(35), pitch: r(20), halfLife: 0.22, share: 0.52 },
      { bones: eyes, yaw: deg(28), pitch: deg(18), halfLife: 0.05, share: 1 },
    ]);
  }

  /**
   * @param totalYaw/totalPitch desired look relative to the character's facing, radians
   * @param rootQ world rotation of the character root (defines "up" and "right")
   */
  update(totalYaw: number, totalPitch: number, rootQ: THREE.Quaternion, dt: number, weight = 1) {
    const headLimit = this.layers[2]?.yaw ?? deg(35);
    let usedYaw = 0;
    let usedPitch = 0;
    const up = _v1.set(0, 1, 0).applyQuaternion(rootQ);
    const last = this.layers.length - 1;

    this.layers.forEach((l, i) => {
      let ty: number;
      let tp: number;
      if (i === last) {
        // Eyes: whatever the (damped, slower) body layers have not covered yet.
        ty = soft(totalYaw - usedYaw, l.yaw);
        tp = soft(totalPitch - usedPitch, l.pitch);
      } else {
        const engage = l.engageAbove
          ? THREE.MathUtils.smoothstep(Math.abs(totalYaw) / headLimit, l.engageAbove, 1)
          : 1;
        ty = soft(totalYaw * l.share, l.yaw) * engage;
        tp = soft(totalPitch * l.share, l.pitch) * engage;
      }
      l.curYaw = damp(l.curYaw, ty * weight, l.halfLife, dt);
      l.curPitch = damp(l.curPitch, tp * weight, l.halfLife, dt);
      usedYaw += l.curYaw;
      usedPitch += l.curPitch;

      if (!l.bones.length) return;
      // Yaw about the character's up axis, pitch about the character's right axis
      // after yaw. A positive pitch looks up (rotating +Z toward +Y is about -X).
      const right = _v2.set(1, 0, 0).applyQuaternion(rootQ);
      const qYaw = new THREE.Quaternion().setFromAxisAngle(up, l.curYaw);
      right.applyQuaternion(qYaw);
      const qPitch = new THREE.Quaternion().setFromAxisAngle(right, -l.curPitch);
      const qWorld = qPitch.multiply(qYaw);
      if (i === 2 && (this.offset.x || this.offset.y || this.offset.z)) {
        const fwd = _v3.set(0, 0, 1).applyQuaternion(rootQ);
        qWorld
          .premultiply(new THREE.Quaternion().setFromAxisAngle(right, -this.offset.x))
          .premultiply(new THREE.Quaternion().setFromAxisAngle(fwd, this.offset.z));
      }
      for (const bone of l.bones) rotateBoneWorld(bone, qWorld);
    });
  }

  get eyes() {
    return this.layers[this.layers.length - 1];
  }
}

/**
 * Analytic two-bone IK in world space: rotates `upper` and `lower` so the end
 * effector (`end`) reaches `target`, with the elbow bending toward `pole`.
 */
export function twoBoneIK(
  upper: THREE.Object3D,
  lower: THREE.Object3D,
  end: THREE.Object3D,
  target: THREE.Vector3,
  pole: THREE.Vector3,
) {
  const a = upper.getWorldPosition(new THREE.Vector3());
  const b = lower.getWorldPosition(new THREE.Vector3());
  const c = end.getWorldPosition(new THREE.Vector3());
  const l1 = a.distanceTo(b);
  const l2 = b.distanceTo(c);
  const toT = new THREE.Vector3().subVectors(target, a);
  const d = THREE.MathUtils.clamp(toT.length(), Math.abs(l1 - l2) + 1e-3, l1 + l2 - 1e-3);
  const n = toT.normalize();
  const along = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(l1 * l1 - along * along, 0));
  const poleDir = new THREE.Vector3().subVectors(pole, a);
  poleDir.sub(n.clone().multiplyScalar(poleDir.dot(n))).normalize();
  const elbow = a.clone().addScaledVector(n, along).addScaledVector(poleDir, h);
  aimBone(upper, b, elbow);
  const c2 = end.getWorldPosition(new THREE.Vector3());
  aimBone(lower, c2, a.clone().addScaledVector(n, d));
}

/**
 * Curl a finger chain (3 joints). Positive amount curls toward the palm,
 * negative straightens. The bend axis comes from the chain's own current
 * shape, so it works for either hand without knowing bone axes.
 */
export function curlFinger(chain: THREE.Object3D[], amount: number, fallbackAxis: THREE.Vector3) {
  if (chain.length < 3 || amount === 0) return;
  const p0 = chain[0].getWorldPosition(new THREE.Vector3());
  const p1 = chain[1].getWorldPosition(new THREE.Vector3());
  const p2 = chain[2].getWorldPosition(new THREE.Vector3());
  const axis = new THREE.Vector3().crossVectors(p1.clone().sub(p0), p2.clone().sub(p1));
  if (axis.lengthSq() < 1e-10) axis.copy(fallbackAxis);
  axis.normalize();
  const q = new THREE.Quaternion().setFromAxisAngle(axis, amount);
  for (const j of chain) rotateBoneWorld(j, q);
}
