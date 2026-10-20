"use client";

import { useSyncExternalStore } from "react";

/**
 * Effects preference: "full" or "reduced". Defaults to the OS
 * prefers-reduced-motion setting; a stored manual choice wins. The value is
 * mirrored on <html data-effects> (an inline script in layout.tsx sets it
 * before first paint, so CSS can react without a flash).
 */
export type Effects = "full" | "reduced";

const KEY = "atelier:effects";
const listeners = new Set<() => void>();

function read(): Effects {
  if (typeof document === "undefined") return "full";
  return document.documentElement.dataset.effects === "reduced" ? "reduced" : "full";
}

export function setEffects(next: Effects) {
  document.documentElement.dataset.effects = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* storage unavailable: preference lasts for this page view */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onChange = () => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {}
    if (!stored) {
      document.documentElement.dataset.effects = mq.matches ? "reduced" : "full";
      l();
    }
  };
  mq.addEventListener("change", onChange);
  return () => {
    listeners.delete(l);
    mq.removeEventListener("change", onChange);
  };
}

export function useEffects(): Effects {
  return useSyncExternalStore(subscribe, read, () => "full");
}

/** Inline script body, run before paint. Kept as a string for <script>. */
export const effectsBootScript = `(()=>{try{var s=localStorage.getItem("${KEY}");var r=s?s==="reduced":matchMedia("(prefers-reduced-motion: reduce)").matches;document.documentElement.dataset.effects=r?"reduced":"full"}catch(e){document.documentElement.dataset.effects="full"}})()`;
