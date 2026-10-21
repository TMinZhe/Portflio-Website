"use client";

import { useState } from "react";
import type { PortfolioMedia } from "@/content/types";
import { MediaFrame } from "./media-frame";
import { Lightbox } from "./lightbox";

/**
 * Media grid in content order. With three or more items the first one leads
 * at double width. Every tile opens the lightbox at that item.
 */
export function Gallery({ items }: { items: PortfolioMedia[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const lead = items.length >= 3;

  return (
    <>
      <ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2">
        {items.map((m, i) => (
          <li key={m.id} className={lead && i === 0 ? "sm:col-span-2" : undefined}>
            <figure>
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="group block w-full cursor-zoom-in rounded-[var(--r-md)] text-left"
                aria-label={`Open ${m.type === "video" ? "video" : "image"} ${i + 1} of ${items.length}${m.title ? `: ${m.title}` : ""}`}
              >
                <MediaFrame
                  media={m}
                  controls={false}
                  sizes={lead && i === 0 ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"}
                  className="transition-transform duration-[var(--d-base)] ease-[var(--ease-out-expo)] group-hover:scale-[1.01]"
                />
              </button>
              {(m.title || m.caption) && (
                <figcaption className="mt-3 max-w-[60ch] text-[0.9375rem]">
                  {m.title && <span className="font-medium">{m.title}. </span>}
                  {m.caption && <span className="text-ink-2">{m.caption}</span>}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
      <Lightbox items={items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
