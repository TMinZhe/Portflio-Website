/*
 * Simplified model of how a completed top-up reaches the shelf, following the
 * mechanism described in the technical audit:
 *
 * 1. Completion re-reads live stock and caps the delivery at
 *    min(requested, capacity room, target room), so a plan made from a cached
 *    snapshot can only shrink, never over-fill.
 * 2. The safe quantity is planned fill-first across the product's positions and
 *    queued as per-position deltas ("+N to position P").
 * 3. When the store applies the deltas, pass one puts each delta into its own
 *    position, capped at full (an inactive position holds the units off sale).
 *    Pass two spills any overflow into the product's other active positions.
 *    Whatever still does not fit is recorded as an issue, never silently lost.
 *
 * Synthetic and simplified: one product, a handful of positions.
 */

export type Position = { id: string; capacity: number; qty: number; active: boolean };

export function safeDeliveryQuantity(requested: number, target: number, positions: Position[]) {
  const live = positions.reduce((n, p) => n + p.qty, 0);
  const capacityRoom = positions.filter((p) => p.active).reduce((n, p) => n + Math.max(0, p.capacity - p.qty), 0);
  const targetRoom = Math.max(0, target - live);
  return { live, capacityRoom, targetRoom, safe: Math.max(0, Math.min(requested, capacityRoom, targetRoom)) };
}

/** Fill-first: top up the first active position before moving to the next. */
export function fillFirstPlan(quantity: number, positions: Position[]): Record<string, number> {
  const plan: Record<string, number> = {};
  let left = quantity;
  for (const p of positions) {
    if (!p.active || left <= 0) continue;
    const add = Math.min(left, Math.max(0, p.capacity - p.qty));
    if (add > 0) plan[p.id] = add;
    left -= add;
  }
  return plan;
}

export type Placement = {
  /** Units added to each position's sellable stock. */
  placed: Record<string, number>;
  /** Units added to an inactive position's held (off-sale) quantity. */
  held: Record<string, number>;
  /** Units that moved from their own position to another one. */
  spilled: { from: string; to: string; units: number }[];
  unplaced: number;
  log: string[];
};

/** Two-pass application of queued deltas against the store's live positions. */
export function applyDeltas(deltas: Record<string, number>, positions: Position[]): Placement {
  const room = new Map(positions.map((p) => [p.id, Math.max(0, p.capacity - p.qty)]));
  const placed: Record<string, number> = {};
  const held: Record<string, number> = {};
  const spilled: Placement["spilled"] = [];
  const log: string[] = [];
  const overflow: { from: string; units: number }[] = [];

  // Pass 1: each delta goes to its own position first.
  for (const [id, units] of Object.entries(deltas)) {
    const pos = positions.find((p) => p.id === id);
    if (!pos) {
      overflow.push({ from: id, units });
      log.push(`${id} no longer exists: ${units} to place elsewhere`);
      continue;
    }
    if (!pos.active) {
      held[id] = (held[id] ?? 0) + units;
      log.push(`${id} is inactive: ${units} held off sale`);
      continue;
    }
    const fit = Math.min(units, room.get(id)!);
    if (fit > 0) {
      placed[id] = (placed[id] ?? 0) + fit;
      room.set(id, room.get(id)! - fit);
    }
    log.push(fit === units ? `${id}: +${fit}` : `${id}: +${fit}, ${units - fit} overflow`);
    if (units - fit > 0) overflow.push({ from: id, units: units - fit });
  }

  // Pass 2: overflow spills into other active positions, in position order.
  // Running it only after pass 1 means it never takes room another delta needed.
  let unplaced = 0;
  for (const o of overflow) {
    let left = o.units;
    for (const p of positions) {
      if (left <= 0) break;
      if (!p.active || p.id === o.from) continue;
      const fit = Math.min(left, room.get(p.id)!);
      if (fit <= 0) continue;
      placed[p.id] = (placed[p.id] ?? 0) + fit;
      room.set(p.id, room.get(p.id)! - fit);
      spilled.push({ from: o.from, to: p.id, units: fit });
      log.push(`spill ${o.from} → ${p.id}: +${fit}`);
      left -= fit;
    }
    if (left > 0) {
      unplaced += left;
      log.push(`${left} unit${left === 1 ? "" : "s"} could not be placed → issue recorded`);
    }
  }
  return { placed, held, spilled, unplaced, log };
}
