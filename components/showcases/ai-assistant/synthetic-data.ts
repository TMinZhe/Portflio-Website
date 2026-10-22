/*
 * Fictional operational data for the AI Operations Assistant demos. Every
 * store, product and figure here is invented and internally consistent; none
 * is derived from company data. Figures are what deterministic code would
 * compute from the records, which is the point the demo makes.
 */

export type StoreId = "Store A" | "Store B" | "Harbour East" | "Harbour West";

export type SalesPeriod = { revenue: number; transactions: number };
export type SalesWindow = { current: SalesPeriod; previous: SalesPeriod };

export const SALES: Record<"Store A" | "Store B", { lastWeek: SalesWindow; last30: SalesWindow }> = {
  "Store A": {
    lastWeek: { current: { revenue: 2450, transactions: 312 }, previous: { revenue: 2180, transactions: 287 } },
    last30: { current: { revenue: 10120.6, transactions: 1296 }, previous: { revenue: 9640.1, transactions: 1238 } },
  },
  "Store B": {
    lastWeek: { current: { revenue: 1890.4, transactions: 248 }, previous: { revenue: 1975.2, transactions: 261 } },
    last30: { current: { revenue: 8034.8, transactions: 1051 }, previous: { revenue: 8210.5, transactions: 1077 } },
  },
};

export type RestockLine = { product: string; onShelf: number; capacity: number; topUp: number };

export const RESTOCK: Record<"Store A" | "Store B", RestockLine[]> = {
  "Store A": [
    { product: "Sample Sparkling Water 330ml", onShelf: 2, capacity: 12, topUp: 9 },
    { product: "Sample Energy Drink 250ml", onShelf: 1, capacity: 10, topUp: 8 },
    { product: "Sample Rice Crackers 60g", onShelf: 3, capacity: 14, topUp: 9 },
    { product: "Sample Green Tea 500ml", onShelf: 4, capacity: 12, topUp: 6 },
  ],
  "Store B": [
    { product: "Sample Cup Noodles 70g", onShelf: 1, capacity: 10, topUp: 8 },
    { product: "Sample Chocolate Bar 45g", onShelf: 2, capacity: 16, topUp: 11 },
    { product: "Sample Isotonic 325ml", onShelf: 3, capacity: 12, topUp: 7 },
  ],
};

/** Last month. Gross profit = revenue − cost of goods; margin = profit / revenue. */
export const PROFIT: Record<"Store A" | "Store B", { revenue: number; cogs: number }> = {
  "Store A": { revenue: 9846.2, cogs: 5512.7 },
  "Store B": { revenue: 7912.3, cogs: 4589.1 },
};

export type Pair = { a: string; b: string; attach: number; lift: number };

export const BOUGHT_TOGETHER: Record<"Store A" | "Store B", Pair[]> = {
  "Store A": [
    { a: "Sample Cup Noodles 70g", b: "Sample Green Tea 500ml", attach: 0.31, lift: 2.4 },
    { a: "Sample Chocolate Bar 45g", b: "Sample Cola 320ml", attach: 0.22, lift: 1.8 },
    { a: "Sample Rice Crackers 60g", b: "Sample Juice Orange 350ml", attach: 0.18, lift: 1.5 },
  ],
  "Store B": [
    { a: "Sample Energy Drink 250ml", b: "Sample Chocolate Bar 45g", attach: 0.27, lift: 2.1 },
    { a: "Sample Cup Noodles 70g", b: "Sample Isotonic 325ml", attach: 0.19, lift: 1.6 },
  ],
};

export const STOCK: Record<"Harbour East" | "Harbour West", { product: string; onShelf: number; capacity: number }[]> = {
  "Harbour East": [
    { product: "Sample Cola 320ml", onShelf: 9, capacity: 12 },
    { product: "Sample Green Tea 500ml", onShelf: 2, capacity: 12 },
    { product: "Sample Chocolate Bar 45g", onShelf: 11, capacity: 16 },
  ],
  "Harbour West": [
    { product: "Sample Cola 320ml", onShelf: 4, capacity: 12 },
    { product: "Sample Cup Noodles 70g", onShelf: 7, capacity: 10 },
    { product: "Sample Rice Crackers 60g", onShelf: 1, capacity: 14 },
  ],
};

export const money = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const pct = (v: number) => `${v >= 0 ? "+" : "−"}${Math.abs(v * 100).toFixed(1)}%`;
