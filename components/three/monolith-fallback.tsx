import { DEPTH, LAYERS, SEALED_Y, WIDTH, explodedOffset, layerPattern } from "./layers";

/**
 * Static axonometric drawing of the same monolith, generated from the shared
 * layer spec. Used before WebGL loads, without WebGL, and with reduced effects.
 * `explode` (0–1) separates the layers, matching the 3D scene's states.
 */
const S = 62; // px per scene unit
const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);
const pt = (x: number, y: number, z: number) => [(x - z) * COS * S, ((x + z) * SIN - y) * S] as const;
const poly = (pts: (readonly [number, number])[]) => pts.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ");

export function MonolithFallback({ explode = 0, className = "" }: { explode?: number; className?: string }) {
  return (
    <svg viewBox="-260 -230 520 420" className={className} role="img" aria-label="Illustration of a layered monolith: interface, logic, data, and models and services, stacked">
      <defs>
        <linearGradient id="mf-top" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#2b3642" />
          <stop offset="1" stopColor="#1a222b" />
        </linearGradient>
        <linearGradient id="mf-left" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#171e25" />
          <stop offset="1" stopColor="#0f141a" />
        </linearGradient>
        <linearGradient id="mf-right" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#222c37" />
          <stop offset="1" stopColor="#141a21" />
        </linearGradient>
      </defs>
      {LAYERS.map((l, i) => {
        const w = (WIDTH - l.inset * 2) / 2;
        const d = (DEPTH - l.inset * 2) / 2;
        const yc = SEALED_Y[i] + explodedOffset(i, explode).y;
        const top = yc + l.height / 2;
        const bot = yc - l.height / 2;
        const glass = l.tone === "glass";
        const stroke = l.id === "logic" ? "#b6ff3b" : "#8caeff";
        const etch = layerPattern(l.id, w * 2, d * 2);
        return (
          <g key={l.id} opacity={glass ? 0.85 : 1}>
            {/* left face (z = +d) and right face (x = +w) */}
            <polygon points={poly([pt(-w, top, d), pt(w, top, d), pt(w, bot, d), pt(-w, bot, d)])} fill={glass ? "#0e1622" : "url(#mf-left)"} />
            <polygon points={poly([pt(w, top, d), pt(w, top, -d), pt(w, bot, -d), pt(w, bot, d)])} fill={glass ? "#121c2a" : "url(#mf-right)"} />
            <polygon
              points={poly([pt(-w, top, -d), pt(w, top, -d), pt(w, top, d), pt(-w, top, d)])}
              fill={glass ? "#132033" : "url(#mf-top)"}
              stroke={stroke}
              strokeOpacity={0.35}
              strokeWidth={0.8}
            />
            <polyline
              points={poly([pt(-w, top, d), pt(-w, bot, d), pt(w, bot, d), pt(w, bot, -d), pt(w, top, -d)])}
              fill="none"
              stroke={stroke}
              strokeOpacity={0.22}
              strokeWidth={0.8}
            />
            <path
              d={etch.map(([x1, z1, x2, z2]) => `M${poly([pt(x1, top, z1)])}L${poly([pt(x2, top, z2)])}`).join("")}
              stroke={l.id === "interface" ? "#b6ff3b" : "#8caeff"}
              strokeOpacity={0.3 + explode * 0.2}
              strokeWidth={0.6}
              fill="none"
            />
          </g>
        );
      })}
    </svg>
  );
}
