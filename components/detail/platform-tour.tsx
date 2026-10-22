"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import type { PortfolioMedia } from "@/content/types";
import { MediaFrame } from "@/components/media/media-frame";
import { MediaKind } from "@/components/media/media-kind";
import { Lightbox } from "@/components/media/lightbox";

type Item = { media: PortfolioMedia; title: string; caption: string };

/**
 * A short tour of the product: a few screens large with one-line captions,
 * the rest as smaller tiles. One lightbox covers every screen in order.
 */
export function PlatformTour({ featured, more }: { featured: Item[]; more: Item[] }) {
  const all = [...featured, ...more];
  const [open, setOpen] = useState<number | null>(null);

  const tile = (it: Item, i: number, small: boolean) => (
    <figure key={it.media.id} data-reveal>
      <button
        type="button"
        onClick={() => setOpen(i)}
        aria-label={`Enlarge screen: ${it.title}`}
        className="group relative block w-full cursor-zoom-in rounded-[var(--r-md)] bg-[#e9edf3] p-1 text-left sm:p-1.5"
      >
        <MediaFrame
          media={it.media}
          controls={false}
          sizes={small ? "(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
          fit="contain"
          tags={false}
          className="bg-white"
        />
        <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-[var(--r-xs)] bg-void/85 px-2 py-1 text-[0.75rem] text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Maximize2 size={12} aria-hidden /> Enlarge
        </span>
      </button>
      <figcaption className="mt-2.5">
        <span className={`block font-medium ${small ? "text-[0.9375rem]" : "text-[1.0625rem]"}`}>{it.title}</span>
        <span className={`mt-0.5 block text-ink-2 ${small ? "text-[0.8125rem]" : "text-[0.9375rem]"}`}>{it.caption}</span>
      </figcaption>
    </figure>
  );

  return (
    <>
      <div className="mb-5">
        {featured[0] && <MediaKind media={featured[0].media} />}
      </div>
      <div className="grid gap-x-5 gap-y-9 sm:grid-cols-2">{featured.map((it, i) => tile(it, i, false))}</div>
      {more.length > 0 && (
        <div className="mt-12">
          <p className="t-meta mb-4">More screens</p>
          <div className="grid gap-x-4 gap-y-7 sm:grid-cols-3">{more.map((it, i) => tile(it, featured.length + i, true))}</div>
        </div>
      )}
      <Lightbox items={all.map((it) => it.media)} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
