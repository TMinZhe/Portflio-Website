/*
 * Demonstration replenishment policy for the Forecast Explorer.
 *
 * It follows the structure of the production calculation (stockout-corrected
 * demand, a variance floor, z-score safety stock, reorder point and an
 * order-up-to target bounded by shelf capacity) but every constant here is an
 * illustrative demo value. The production weights, caps and service levels are
 * not published.
 */

export const DEMO_POLICY = {
  /** The correction only trusts availability down to this share of days. */
  minAvailability: 0.4,
  /** Days of cover added beyond the next visit. */
  bufferDays: 2,
  /** Minimum units kept on the shelf. */
  minFacing: 1,
} as const;

/**
 * Inverse of the standard normal CDF (Acklam's rational approximation,
 * relative error below 1.15e-9). Written in-line rather than pulling in a
 * statistics dependency.
 */
export function inverseNormal(p: number): number {
  if (p <= 0 || p >= 1) throw new RangeError("p must be in (0, 1)");
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const low = 0.02425;
  if (p < low) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - low) return -inverseNormal(1 - p);
  const q = p - 0.5;
  const r = q * q;
  return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

export type ForecastInput = {
  /** Units sold per calendar day over the window. */
  observedRate: number;
  /** Share of days the product was actually on sale, 0–1. */
  availability: number;
  /** Variance-to-mean ratio of daily sales; 1 = Poisson. */
  dispersion: number;
  /** Target probability of not running out before the next visit, 0–1. */
  serviceLevel: number;
  /** Days until the next restocking visit. */
  visitDays: number;
  shelfCapacity: number;
  currentStock: number;
};

export type ForecastResult = {
  /** Demand per day the product was in stock. */
  demand: number;
  uplift: number;
  variance: number;
  z: number;
  coverDays: number;
  reorderPoint: number;
  target: number;
  safetyStock: number;
  triggered: boolean;
  recommended: number;
  /** What a plain sales average would target over the same cover, for comparison. */
  naiveTarget: number;
  capped: boolean;
};

export function forecast(i: ForecastInput): ForecastResult {
  const p = DEMO_POLICY;
  // Sales only happen on in-stock days, so divide by those, not calendar days.
  const exposure = Math.max(i.availability, p.minAvailability);
  const demand = i.observedRate / exposure;
  const uplift = demand / Math.max(i.observedRate, 1e-9);
  // Never assume less variability than a Poisson process.
  const variance = Math.max(i.dispersion, 1) * demand;
  const z = inverseNormal(i.serviceLevel);
  const R = i.visitDays;
  const P = R + p.bufferDays;

  const rawReorder = Math.ceil(demand * R + z * Math.sqrt(variance * R));
  const rawTarget = Math.ceil(demand * P + z * Math.sqrt(variance * P));
  const target = clamp(rawTarget, p.minFacing, i.shelfCapacity);
  const reorderPoint = clamp(rawReorder, p.minFacing, target);
  const triggered = i.currentStock < reorderPoint;
  const recommended = triggered ? Math.max(0, target - i.currentStock) : 0;

  return {
    demand,
    uplift: i.observedRate > 0 ? uplift : 1,
    variance,
    z,
    coverDays: P,
    reorderPoint,
    target,
    safetyStock: Math.max(0, target - Math.ceil(demand * P)),
    triggered,
    recommended,
    naiveTarget: clamp(Math.ceil(i.observedRate * P), p.minFacing, i.shelfCapacity),
    capped: rawTarget > i.shelfCapacity,
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));
