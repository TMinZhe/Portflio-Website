/**
 * The Exploded Monolith: four strata of a software system, bottom to top.
 * Shared by the WebGL scene and the SVG fallback. Each layer carries an
 * etched top-face pattern that hints at what it is (a UI wireframe, a node
 * graph, a table, a rack of services).
 */
export type LayerId = "models" | "data" | "logic" | "interface";

export type LayerSpec = {
  id: LayerId;
  label: string;
  height: number;
  /** Inset relative to the full footprint, so the stack reads as machined, not extruded. */
  inset: number;
  tone: "metal" | "glass";
};

export const WIDTH = 3.2;
export const DEPTH = 2.2;
export const SEAL_GAP = 0.018;
/** Vertical distance between layer centres added at full explode. */
export const EXPLODE_SPREAD = 0.82;

export const LAYERS: LayerSpec[] = [
  { id: "models", label: "Models & services", height: 0.42, inset: 0, tone: "metal" },
  { id: "data", label: "Data", height: 0.22, inset: 0.06, tone: "glass" },
  { id: "logic", label: "Logic", height: 0.3, inset: 0.03, tone: "metal" },
  { id: "interface", label: "Interface", height: 0.12, inset: 0.12, tone: "metal" },
];

/** Resting y (centre) of each layer in the sealed state, stack centred on 0. */
export const SEALED_Y: number[] = (() => {
  const total = LAYERS.reduce((s, l) => s + l.height, 0) + SEAL_GAP * (LAYERS.length - 1);
  let y = -total / 2;
  return LAYERS.map((l) => {
    const c = y + l.height / 2;
    y += l.height + SEAL_GAP;
    return c;
  });
})();

/** Exploded-state offsets per layer, as functions of explode t ∈ [0, 1]. */
export function explodedOffset(index: number, t: number) {
  const k = index - (LAYERS.length - 1) / 2; // -1.5 … 1.5
  return {
    y: t * k * EXPLODE_SPREAD,
    x: t * k * 0.16,
    yaw: t * k * 0.16,
  };
}

type Seg = [number, number, number, number]; // x1, z1, x2, z2 in top-face space

const rect = (x: number, z: number, w: number, d: number): Seg[] => [
  [x, z, x + w, z],
  [x + w, z, x + w, z + d],
  [x + w, z + d, x, z + d],
  [x, z + d, x, z],
];

/** Etched pattern per layer, in a unit space of WIDTH × DEPTH centred at 0. */
export function layerPattern(id: LayerId, w: number, d: number): Seg[] {
  const x0 = -w / 2 + 0.16;
  const z0 = -d / 2 + 0.16;
  const iw = w - 0.32;
  const id_ = d - 0.32;
  switch (id) {
    case "interface": {
      // App wireframe: frame, header, sidebar, cards, text rows.
      const segs: Seg[] = [...rect(x0, z0, iw, id_)];
      segs.push([x0, z0 + 0.22, x0 + iw, z0 + 0.22]);
      segs.push([x0 + 0.62, z0 + 0.22, x0 + 0.62, z0 + id_]);
      for (let i = 0; i < 3; i++) segs.push(...rect(x0 + 0.78 + i * 0.66, z0 + 0.38, 0.56, 0.5));
      for (let i = 0; i < 4; i++) segs.push([x0 + 0.78, z0 + 1.06 + i * 0.16, x0 + 0.78 + (i % 2 ? 1.2 : 1.8), z0 + 1.06 + i * 0.16]);
      for (let i = 0; i < 5; i++) segs.push([x0 + 0.1, z0 + 0.38 + i * 0.16, x0 + 0.46, z0 + 0.38 + i * 0.16]);
      return segs;
    }
    case "logic": {
      // Node graph with orthogonal routing.
      const nodes: [number, number][] = [
        [-1.1, -0.5], [-1.1, 0.45], [-0.25, 0], [0.55, -0.55], [0.55, 0.5], [1.2, 0],
      ];
      const s = 0.09;
      const segs: Seg[] = nodes.flatMap(([x, z]) => rect(x - s, z - s, s * 2, s * 2));
      const link = (a: number, b: number): Seg[] => {
        const [ax, az] = nodes[a];
        const [bx, bz] = nodes[b];
        const mx = (ax + bx) / 2;
        return [[ax + s, az, mx, az], [mx, az, mx, bz], [mx, bz, bx - s, bz]];
      };
      segs.push(...link(0, 2), ...link(1, 2), ...link(2, 3), ...link(2, 4), ...link(3, 5), ...link(4, 5));
      return segs;
    }
    case "data": {
      // Table: rows and column dividers.
      const segs: Seg[] = [...rect(x0, z0, iw, id_)];
      for (let r = 1; r < 7; r++) segs.push([x0, z0 + (id_ / 7) * r, x0 + iw, z0 + (id_ / 7) * r]);
      for (const c of [0.28, 0.55, 0.78]) segs.push([x0 + iw * c, z0, x0 + iw * c, z0 + id_]);
      return segs;
    }
    case "models": {
      // Service rack: long slots with vents.
      const segs: Seg[] = [];
      for (let i = 0; i < 4; i++) {
        const z = z0 + i * (id_ / 4) + 0.06;
        segs.push(...rect(x0, z, iw, id_ / 4 - 0.12));
        for (let v = 0; v < 6; v++) segs.push([x0 + iw - 0.7 + v * 0.1, z + 0.08, x0 + iw - 0.7 + v * 0.1, z + id_ / 4 - 0.2]);
      }
      return segs;
    }
  }
}

/** Vertical signal traces (x, z) that pass through every layer. */
export const TRACES: [number, number][] = [
  [-1.38, -0.86], [1.38, -0.86], [-1.38, 0.86], [1.38, 0.86], [-0.25, 0], [0.55, 0.5],
];
