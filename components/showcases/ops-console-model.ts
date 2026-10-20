/**
 * Synthetic model behind the inventory schematic. None of these numbers come
 * from a real system — they exist only to make the three described features
 * (store-wide monitoring, top-up recommendations, purchase order drafting)
 * tangible. The recommendation rule is a generic reorder-point illustration,
 * not the production algorithm.
 */
export const STORES = ["Store A", "Store B", "Store C", "Store D"] as const;

export type Item = { sku: string; demand: number[]; start: number[] };

// Units sold per day and opening stock, per store.
export const ITEMS: Item[] = [
  { sku: "SKU-1041", demand: [6, 4, 9, 3], start: [80, 62, 96, 40] },
  { sku: "SKU-1187", demand: [2, 3, 2, 5], start: [30, 44, 26, 58] },
  { sku: "SKU-2210", demand: [11, 8, 6, 10], start: [120, 70, 90, 100] },
  { sku: "SKU-2295", demand: [1, 2, 1, 1], start: [14, 12, 20, 9] },
  { sku: "SKU-3302", demand: [5, 7, 4, 6], start: [44, 90, 52, 48] },
  { sku: "SKU-3318", demand: [3, 1, 4, 2], start: [36, 22, 30, 34] },
];

export const LEAD_DAYS = 3;
export const COVER_DAYS = 12;
export const CASE_SIZE = 6;
export const MAX_DAY = 10;

export type CellStatus = "ok" | "low" | "out";

export type Cell = {
  sku: string;
  store: string;
  stock: number;
  capacity: number;
  reorderPoint: number;
  status: CellStatus;
  /** Recommended top-up in units (multiple of CASE_SIZE), 0 if none. */
  topUp: number;
};

export function cellAt(item: Item, storeIndex: number, day: number): Cell {
  const d = item.demand[storeIndex];
  const stock = Math.max(0, item.start[storeIndex] - d * day);
  const reorderPoint = d * LEAD_DAYS + Math.ceil(d * 1.5);
  const target = d * COVER_DAYS;
  const status: CellStatus = stock === 0 ? "out" : stock <= reorderPoint ? "low" : "ok";
  const topUp = status === "ok" ? 0 : Math.ceil(Math.max(0, target - stock) / CASE_SIZE) * CASE_SIZE;
  return {
    sku: item.sku,
    store: STORES[storeIndex],
    stock,
    capacity: Math.max(item.start[storeIndex], target),
    reorderPoint,
    status,
    topUp,
  };
}

export function grid(day: number): Cell[][] {
  return ITEMS.map((item) => STORES.map((_, s) => cellAt(item, s, day)));
}
