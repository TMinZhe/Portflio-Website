/*
 * Scripted conversation engine for the synthetic chat demo. Preset questions
 * only: nothing here understands free text. It mirrors the real assistant's
 * shape: a question is read into an intent with a store and a period, a
 * follow-up reuses the previous turn's context, an ambiguous store name gets
 * a "which one?" question, and every figure comes from the fixed dataset.
 */

import { BOUGHT_TOGETHER, PROFIT, RESTOCK, SALES, STOCK, type Pair, type RestockLine, type SalesWindow } from "./synthetic-data";

export type Intent = "sales" | "restock" | "profit" | "bought_together" | "stock";
export type Period = "last week" | "last 30 days" | "last month";
type MainStore = "Store A" | "Store B";
type HarbourStore = "Harbour East" | "Harbour West";

export type Context = { intent: Intent; store: string; period: Period } | null;

export const INTENT_LABEL: Record<Intent, string> = {
  sales: "Sales summary",
  restock: "Restocking list",
  profit: "Store profit",
  bought_together: "Bought together",
  stock: "Store stock",
};

/** What the system understood, shown under each answer. */
export type Understood = { intent: Intent; store: string; period?: Period; carried?: ("store" | "intent" | "period")[] };

export type Answer =
  | { kind: "sales"; u: Understood; window: SalesWindow }
  | { kind: "restock"; u: Understood; lines: RestockLine[] }
  | { kind: "profit"; u: Understood; revenue: number; cogs: number }
  | { kind: "bought_together"; u: Understood; pairs: Pair[] }
  | { kind: "stock"; u: Understood; lines: { product: string; onShelf: number; capacity: number }[] };

export type Clarify = { term: string; options: HarbourStore[]; intent: Intent };

export type Message = { id: number; role: "user"; text: string } | { id: number; role: "assistant"; answer?: Answer; clarify?: Clarify };

export type Preset = { id: string; text: string; group: string };

export const PRESETS: Preset[] = [
  { id: "sales-a", text: "How did Store A perform last week?", group: "Sales" },
  { id: "restock", text: "Which products need restocking?", group: "Inventory" },
  { id: "profit-a", text: "What's the profit for Store A?", group: "Profitability" },
  { id: "together", text: "Which products are bought together?", group: "Products" },
  { id: "sales-30", text: "Show sales for the last 30 days.", group: "Sales" },
  { id: "stock-harbour", text: "Show the stock for Harbour.", group: "Clarification" },
];

/** The follow-up chip offered after an answer about a main store. */
export function followUp(ctx: Context): Preset | null {
  if (!ctx || (ctx.store !== "Store A" && ctx.store !== "Store B")) return null;
  const other = ctx.store === "Store A" ? "Store B" : "Store A";
  return { id: `follow-${other}`, text: `What about ${other}?`, group: "Follow-up" };
}

function answer(intent: Intent, store: MainStore, period: Period, carried?: Understood["carried"]): Answer {
  const u: Understood = { intent, store, period: intent === "restock" || intent === "bought_together" ? undefined : period, carried };
  switch (intent) {
    case "sales":
      return { kind: "sales", u, window: period === "last week" ? SALES[store].lastWeek : SALES[store].last30 };
    case "restock":
      return { kind: "restock", u, lines: RESTOCK[store] };
    case "profit":
      return { kind: "profit", u: { ...u, period: "last month" }, ...PROFIT[store] };
    case "bought_together":
      return { kind: "bought_together", u: { ...u, period: "last 30 days" }, pairs: BOUGHT_TOGETHER[store] };
    case "stock":
      throw new Error("stock is answered per Harbour store");
  }
}

const mainStore = (s: string | undefined): MainStore => (s === "Store B" ? "Store B" : "Store A");

/** Run a preset against the current context. Returns the reply and the new context. */
export function ask(id: string, ctx: Context): { reply: Omit<Extract<Message, { role: "assistant" }>, "id">; ctx: Context } {
  if (id.startsWith("follow-")) {
    // Follow-up: only the store changes; intent and period carry over.
    const store = id.slice("follow-".length) as MainStore;
    const intent = ctx?.intent ?? "sales";
    const period = ctx?.period ?? "last week";
    return { reply: { role: "assistant", answer: answer(intent, store, period, ["intent", "period"]) }, ctx: { intent, store, period } };
  }
  switch (id) {
    case "sales-a":
      return { reply: { role: "assistant", answer: answer("sales", "Store A", "last week") }, ctx: { intent: "sales", store: "Store A", period: "last week" } };
    case "sales-30": {
      // No store named: reuse the store from the conversation, defaulting to Store A.
      const store = mainStore(ctx?.store);
      const carried: Understood["carried"] = ctx?.store === store ? ["store"] : undefined;
      return { reply: { role: "assistant", answer: answer("sales", store, "last 30 days", carried) }, ctx: { intent: "sales", store, period: "last 30 days" } };
    }
    case "restock": {
      const store = mainStore(ctx?.store);
      const carried: Understood["carried"] = ctx?.store === store ? ["store"] : undefined;
      return { reply: { role: "assistant", answer: answer("restock", store, "last week", carried) }, ctx: { intent: "restock", store, period: ctx?.period ?? "last week" } };
    }
    case "profit-a":
      return { reply: { role: "assistant", answer: answer("profit", "Store A", "last month") }, ctx: { intent: "profit", store: "Store A", period: "last month" } };
    case "together": {
      const store = mainStore(ctx?.store);
      const carried: Understood["carried"] = ctx?.store === store ? ["store"] : undefined;
      return { reply: { role: "assistant", answer: answer("bought_together", store, "last 30 days", carried) }, ctx: { intent: "bought_together", store, period: "last 30 days" } };
    }
    case "stock-harbour":
      // Two stores share the word "Harbour": ask instead of guessing. Context is kept.
      return { reply: { role: "assistant", clarify: { term: "Harbour", options: ["Harbour East", "Harbour West"], intent: "stock" } }, ctx };
    default:
      throw new Error(`unknown preset ${id}`);
  }
}

/** The operator picked a store from a "which one?" question. */
export function choose(store: HarbourStore): { reply: Omit<Extract<Message, { role: "assistant" }>, "id">; ctx: Context } {
  return {
    reply: { role: "assistant", answer: { kind: "stock", u: { intent: "stock", store }, lines: STOCK[store] } },
    ctx: { intent: "stock", store, period: "last week" },
  };
}
