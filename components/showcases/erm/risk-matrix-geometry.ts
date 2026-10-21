import { POSITIONS, QUARTERS, RISKS, type Position, type Quarter } from "./risk-matrix-data";

/*
 * The nine steps of the matrix, as pure functions. This is a recreation of the
 * documented steps for the portfolio, written in TypeScript, not the client's
 * Power Fx source.
 */

export const GRID = { left: 118, top: 44, cellW: 116, cellH: 80, cols: 5, rows: 5 };
// Three markers per row must fit a cell: 3 × 2rx + 2 × gapX < cellW.
export const MARKER = { rx: 16, ry: 9, perRow: 3, gapX: 5, gapY: 6, padTop: 26 };
export const VIEW = { w: GRID.left + GRID.cols * GRID.cellW + 8, h: GRID.top + GRID.rows * GRID.cellH + 48 };

export type Marker = {
  id: string;
  name: string;
  x: number;
  y: number;
  ghost: boolean;
  pos: Position;
};

export type Movement = {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  direction: "worse" | "better" | "sideways";
  path: string;
};

const score = (p: Position) => p.likelihood * p.impact;

/** Step 1: a position's cell, row 0 at the top (highest likelihood). */
export const cellOf = (p: Position) => ({ col: p.impact - 1, row: GRID.rows - p.likelihood });

const key = (p: Position) => `${p.likelihood}-${p.impact}`;

/** Step 4: where each risk was in the previous quarter, if there was one. */
export function previousQuarter(q: Quarter): Quarter | null {
  const i = QUARTERS.indexOf(q);
  return i > 0 ? QUARTERS[i - 1] : null;
}

/** Steps 2, 3 and 5: group by cell, then give current markers and ghosts their own slots. */
export function layout(q: Quarter): Marker[] {
  const now = POSITIONS[q];
  const prevQ = previousQuarter(q);
  const before = prevQ ? POSITIONS[prevQ] : null;

  const cells = new Map<string, { pos: Position; entries: { id: string; ghost: boolean }[] }>();
  const add = (pos: Position, id: string, ghost: boolean) => {
    const k = key(pos);
    if (!cells.has(k)) cells.set(k, { pos, entries: [] });
    cells.get(k)!.entries.push({ id, ghost });
  };
  for (const r of RISKS) add(now[r.id], r.id, false);
  if (before) {
    for (const r of RISKS) if (key(before[r.id]) !== key(now[r.id])) add(before[r.id], r.id, true);
  }

  const markers: Marker[] = [];
  for (const { pos, entries } of cells.values()) {
    // Current markers first, ghosts after them, each group in id order.
    entries.sort((a, b) => Number(a.ghost) - Number(b.ghost) || a.id.localeCompare(b.id));
    const { col, row } = cellOf(pos);
    entries.forEach((e, i) => {
      const slotCol = i % MARKER.perRow;
      const slotRow = Math.floor(i / MARKER.perRow);
      const rowWidth = MARKER.perRow * MARKER.rx * 2 + (MARKER.perRow - 1) * MARKER.gapX;
      const x0 = GRID.left + col * GRID.cellW + (GRID.cellW - rowWidth) / 2 + MARKER.rx;
      markers.push({
        id: e.id,
        name: RISKS.find((r) => r.id === e.id)!.name,
        ghost: e.ghost,
        pos,
        x: x0 + slotCol * (MARKER.rx * 2 + MARKER.gapX),
        y: GRID.top + row * GRID.cellH + MARKER.padTop + MARKER.ry + slotRow * (MARKER.ry * 2 + MARKER.gapY),
      });
    });
  }
  return markers;
}

/** Distance from an ellipse's centre to its edge along a unit vector. */
function edge(ux: number, uy: number) {
  return 1 / Math.sqrt((ux / MARKER.rx) ** 2 + (uy / MARKER.ry) ** 2);
}

/** Steps 6–8: direction, arrow, and trimming the arrow to both marker edges. */
export function movements(q: Quarter, markers: Marker[]): Movement[] {
  const prevQ = previousQuarter(q);
  if (!prevQ) return [];
  const out: Movement[] = [];
  for (const ghost of markers.filter((m) => m.ghost)) {
    const cur = markers.find((m) => m.id === ghost.id && !m.ghost)!;
    const dx = cur.x - ghost.x;
    const dy = cur.y - ghost.y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const trimStart = edge(ux, uy) + 1;
    const trimEnd = edge(ux, uy) + 4; // leave room for the arrowhead
    const from = { x: ghost.x + ux * trimStart, y: ghost.y + uy * trimStart };
    const to = { x: cur.x - ux * trimEnd, y: cur.y - uy * trimEnd };
    const delta = score(cur.pos) - score(ghost.pos);
    out.push({
      id: ghost.id,
      from,
      to,
      direction: delta > 0 ? "worse" : delta < 0 ? "better" : "sideways",
      path: `M${from.x.toFixed(1)},${from.y.toFixed(1)} L${to.x.toFixed(1)},${to.y.toFixed(1)}`,
    });
  }
  return out;
}

/** Step 9: escape user-entered text before it is placed in SVG markup. */
export const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** The markup a marker becomes, shown in the demo to make step 9 visible. */
export const markerSvg = (m: Marker) =>
  `<g><title>${escapeXml(`${m.id} · ${m.name}`)}</title><ellipse cx="${m.x.toFixed(0)}" cy="${m.y.toFixed(0)}" rx="${MARKER.rx}" ry="${MARKER.ry}"${
    m.ghost ? ' stroke-dasharray="3 2"' : ""
  }/><text>${escapeXml(m.id)}</text></g>`;

export const band = (p: Position) => {
  const s = score(p);
  return s >= 15 ? "high" : s >= 8 ? "medhigh" : s >= 4 ? "medlow" : "low";
};
