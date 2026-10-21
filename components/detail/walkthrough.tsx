"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import type { WalkthroughItem } from "@/content/types";
import { MediaFrame } from "@/components/media/media-frame";
import { Lightbox } from "@/components/media/lightbox";

type Item = Omit<WalkthroughItem, "does" | "why" | "engineering"> & { does: string; why: string; engineering?: string };

/**
 * Real application screens, each paired with what it does, why it matters and
 * the engineering behind it. Screens alternate sides on desktop; any screen
 * opens the shared lightbox for a closer look.
 */
export function Walkthrough({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <ol className="space-y-[clamp(3rem,6vw,5rem)]">
        {items.map((it, i) => (
          <li key={it.media.id} data-reveal>
            <figure>
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`Enlarge screenshot: ${it.title}`}
                className="group relative block w-full cursor-zoom-in rounded-[var(--r-md)] bg-[#e9edf3] p-1.5 text-left sm:p-2"
              >
                <MediaFrame media={it.media} controls={false} sizes="(min-width: 1024px) 66vw, 100vw" fit="contain" className="bg-white" />
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-[var(--r-xs)] bg-void/85 px-2 py-1 text-[0.75rem] text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Maximize2 size={12} aria-hidden /> Enlarge
                </span>
              </button>
              {it.media.caption && <figcaption className="mt-2.5 text-[0.8125rem] text-ink-2">{it.media.caption}</figcaption>}
            </figure>
            <div className="mt-6 grid gap-x-8 gap-y-3 md:grid-cols-[minmax(0,1.2fr)_1fr]">
              <div>
                <p className="t-meta">Screen {String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 text-[1.375rem] font-medium leading-snug">{it.title}</h3>
                <p className="mt-3">{it.does}</p>
                <p className="mt-2 text-ink-2">{it.why}</p>
              </div>
              {it.engineering && (
                <p className="self-end border-l-2 border-ice/60 pl-3 text-[0.9375rem]">
                  <span className="t-meta mb-1 block text-ice">Engineering</span>
                  {it.engineering}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
      <Lightbox items={items.map((it) => it.media)} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
