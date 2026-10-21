"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PortfolioMedia } from "@/content/types";

type Props = {
  media: PortfolioMedia;
  /** Responsive `sizes` for next/image. */
  sizes: string;
  /** contain keeps every pixel of a screenshot; cover suits photographs. Defaults by category. */
  fit?: "contain" | "cover";
  /** Show video controls (false in grid thumbnails, where the lightbox plays it). */
  controls?: boolean;
  eager?: boolean;
  className?: string;
};

const photoCategories = new Set(["workplace", "event"]);

/**
 * One image or video in a fixed-ratio box. A missing or broken file swaps to a
 * quiet fallback panel, so a broken-image icon never shows.
 */
export function MediaFrame({ media, sizes, fit, controls = true, eager, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const objectFit = fit ?? (media.category && photoCategories.has(media.category) ? "cover" : "contain");

  // An image that failed before hydration never fires onError; catch it here.
  useEffect(() => {
    const img = boxRef.current?.querySelector("img");
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <div
      ref={boxRef}
      className={`relative overflow-hidden rounded-[var(--r-md)] bg-graphite ${className}`}
      style={{ aspectRatio: media.aspect ?? "16/10" }}
    >
      {failed ? (
        <MediaFallback label={media.title ?? media.alt} />
      ) : media.type === "video" ? (
        controls ? (
          <video
            className="absolute inset-0 size-full"
            style={{ objectFit }}
            controls
            playsInline
            preload="metadata"
            poster={media.poster}
            aria-label={media.alt || undefined}
            onError={() => setFailed(true)}
          >
            <source src={media.src} onError={() => setFailed(true)} />
            {media.captionsSrc && <track kind="captions" src={media.captionsSrc} srcLang="en" label="English" default />}
          </video>
        ) : media.poster ? (
          <Image src={media.poster} alt={media.alt} fill sizes={sizes} className="object-cover" onError={() => setFailed(true)} />
        ) : (
          <MediaFallback label={media.title ?? "Video"} />
        )
      ) : (
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes={sizes}
          unoptimized={media.src.endsWith(".svg")}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
          style={{ objectFit }}
          onError={() => setFailed(true)}
        />
      )}
      <MediaTags media={media} />
    </div>
  );
}

export function MediaTags({ media }: { media: PortfolioMedia }) {
  if (!media.isIllustrative && media.approved) return null;
  return (
    <span className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
      {media.isIllustrative && (
        <span className="rounded-[var(--r-xs)] bg-void/85 px-2 py-0.5 text-[0.75rem] text-ink-2">Illustrative</span>
      )}
      {!media.approved && (
        <span className="rounded-[var(--r-xs)] bg-void/85 px-2 py-0.5 text-[0.75rem] text-[var(--c-warn)]">
          Not approved: hidden in production
        </span>
      )}
    </span>
  );
}

export function MediaFallback({ label }: { label?: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center p-6 text-center">
      <p className="max-w-[32ch] text-[0.875rem] text-ink-2">
        {label ? `${label}: ` : ""}
        image unavailable
      </p>
    </div>
  );
}
