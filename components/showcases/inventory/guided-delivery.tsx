"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Package, RotateCcw, Store, Building2, WifiOff, Wifi } from "lucide-react";
import { deliveryReducer, initialDelivery, type DeliveryAction, type DeliveryState } from "./delivery-model";

/*
 * Guided, five-step version of the Offline Delivery Simulator. Every step is a
 * real snapshot of delivery-model.ts after a scripted set of actions, so the
 * story can't drift from the mechanism the advanced view exposes.
 */

const CAPACITY = 12;
const SHELF = "P-12";

function run(actions: DeliveryAction[]) {
  return actions.reduce(deliveryReducer, initialDelivery());
}

type Where = "none" | "office" | "store" | "lost" | "done";
type Step = { title: string; text: string; state: DeliveryState; pkg: Where; office: string; officeOk?: boolean; highlight?: boolean };

const s1 = initialDelivery();
const s2 = run([{ type: "queue" }, { type: "run-worker" }]);
const s3 = run([{ type: "queue" }, { type: "run-worker" }, { type: "toggle-online" }, { type: "toggle-lose-ack" }, { type: "run-worker" }]);
const s5 = deliveryReducer(s3, { type: "run-worker" });
const STOCK_BEFORE = s1.stock[SHELF];

const STEPS: Step[] = [
  {
    title: "Store C goes offline",
    text: "Store C's connection drops. Its shelf holds 3 units of Product A, and it keeps selling on its own.",
    state: s1,
    pkg: "none",
    office: "Nothing to send yet",
  },
  {
    title: "Head office saves a delivery",
    text: "Staff complete a top-up of 4 units. The store can't be reached, so the delivery is saved at head office and retried later instead of being lost.",
    state: s2,
    pkg: "office",
    office: "Saved, waiting for Store C",
  },
  {
    title: "Store C reconnects and receives the stock",
    text: "The connection returns. The delivery reaches the store, which adds 4 units to the shelf and records that it has applied this delivery.",
    state: s3,
    pkg: "store",
    office: "Sent, waiting for confirmation",
  },
  {
    title: "The confirmation gets lost, so head office retries",
    text: "The store's “done” message never arrives. From head office it looks as if the delivery failed, so it sends the same delivery again.",
    state: s3,
    pkg: "lost",
    office: "No confirmation, retrying",
  },
  {
    title: "The store recognises the delivery and skips it",
    text: "Store C sees it has already applied this delivery, so it doesn't add the stock again. It confirms, and head office marks it delivered.",
    state: s5,
    pkg: "done",
    office: "Delivered",
    officeOk: true,
    highlight: true,
  },
];

export function GuidedDelivery() {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const stock = step.state.stock[SHELF];
  const online = step.state.online;
  const added = stock - STOCK_BEFORE;

  return (
    <div className="rounded-[var(--r-md)] bg-graphite p-4 sm:p-6">
      <ol className="grid grid-cols-5 gap-1.5" aria-label="Steps">
        {STEPS.map((s, n) => (
          <li key={s.title}>
            <button
              type="button"
              onClick={() => setI(n)}
              aria-current={n === i ? "step" : undefined}
              aria-label={`Step ${n + 1}: ${s.title}`}
              className={`flex min-h-11 w-full items-center justify-center rounded-[var(--r-xs)] text-[0.8125rem] transition-colors ${
                n === i ? "bg-lime font-medium text-[var(--c-lime-ink)]" : n < i ? "bg-elevated text-ink" : "border border-line-strong text-ink-2 hover:text-ink"
              }`}
            >
              {n + 1}
            </button>
          </li>
        ))}
      </ol>

      <div aria-live="polite" className="mt-5 min-h-[7.5rem]">
        <p className="t-meta">
          Step {i + 1} of {STEPS.length}
        </p>
        <h4 className="mt-1 text-[1.25rem] font-medium leading-snug">{step.title}</h4>
        <p className="mt-2 max-w-[60ch] text-ink-2">{step.text}</p>
      </div>

      <div className="mt-4 grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-[var(--r-sm)] bg-void p-4">
          <p className="flex items-center gap-2 text-[0.9375rem] font-medium">
            <Building2 size={17} aria-hidden className="text-ice" /> Head office
          </p>
          <p className="t-meta mt-3">{step.pkg === "none" ? "Deliveries for Store C" : "Delivery of 4 units"}</p>
          <p className={`mt-1 flex items-center gap-2 ${step.officeOk ? "text-lime" : step.pkg === "lost" ? "text-[var(--c-warn)]" : ""}`}>
            {step.officeOk && <Check size={16} aria-hidden />}
            {step.office}
          </p>
          {step.pkg === "office" && <Parcel label="Waiting to be sent" />}
          {step.pkg === "lost" && <Parcel label="Sending again" />}
        </div>

        <div className="flex items-center justify-center gap-2 py-1 sm:flex-col sm:px-2">
          {online ? <Wifi size={18} aria-hidden className="text-ice" /> : <WifiOff size={18} aria-hidden className="text-[var(--c-warn)]" />}
          <span className={`text-[0.8125rem] ${online ? "text-ice" : "text-[var(--c-warn)]"}`}>{online ? "Connected" : "Offline"}</span>
        </div>

        <div className={`rounded-[var(--r-sm)] bg-void p-4 ${step.highlight ? "ring-1 ring-lime" : ""}`}>
          <p className="flex items-center gap-2 text-[0.9375rem] font-medium">
            <Store size={17} aria-hidden className="text-ice" /> Store C
          </p>
          <p className="t-meta mt-3">Product A on the shelf</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-[2.25rem] leading-none tabular-nums">{stock}</span>
            <span className="text-ink-2">of {CAPACITY}</span>
            {added > 0 && <span className="text-lime">+{added} received</span>}
          </p>
          <div className="mt-3 flex h-3 gap-0.5" aria-hidden>
            {Array.from({ length: CAPACITY }, (_, n) => (
              <span
                key={n}
                className={`flex-1 rounded-[2px] ${n < STOCK_BEFORE ? "bg-ink-2/60" : n < stock ? "bg-lime" : "bg-graphite"}`}
              />
            ))}
          </div>
          {step.pkg === "store" && <Parcel label="Delivery applied, record kept" />}
          {step.pkg === "done" && <Parcel label="Repeat recognised, skipped" />}
        </div>
      </div>

      {step.highlight && (
        <div className="mt-4 rounded-[var(--r-sm)] border border-lime/50 bg-void p-4">
          <p className="flex items-center gap-2 font-medium text-lime">
            <Check size={18} aria-hidden /> The store received the stock only once, even though the delivery was sent twice.
          </p>
          <p className="mt-1.5 text-[0.9375rem] text-ink-2">
            Shelf: {STOCK_BEFORE} → {stock}. Without the store&apos;s record of applied deliveries, the retry would have made it{" "}
            {stock + (stock - STOCK_BEFORE)}, stock that doesn&apos;t exist.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setI((n) => Math.max(0, n - 1))}
          disabled={i === 0}
          className="inline-flex min-h-11 items-center gap-2 rounded-[var(--r-sm)] border border-line-strong px-4 text-[0.875rem] hover:border-ink-2 disabled:opacity-40"
        >
          <ArrowLeft size={15} aria-hidden /> Back
        </button>
        {i < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setI((n) => n + 1)}
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--r-sm)] bg-lime px-5 text-[0.875rem] font-medium text-[var(--c-lime-ink)]"
          >
            Next <ArrowRight size={15} aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setI(0)}
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--r-sm)] bg-lime px-5 text-[0.875rem] font-medium text-[var(--c-lime-ink)]"
          >
            <RotateCcw size={15} aria-hidden /> Restart
          </button>
        )}
      </div>
    </div>
  );
}

function Parcel({ label }: { label: string }) {
  return (
    <p className="mt-3 inline-flex items-center gap-2 rounded-[var(--r-xs)] bg-elevated px-2.5 py-1.5 text-[0.8125rem]">
      <Package size={15} aria-hidden className="text-lime" /> {label}
    </p>
  );
}
