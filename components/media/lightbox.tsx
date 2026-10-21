"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import type { PortfolioMedia } from "@/content/types";
import { MediaFallback, MediaTags } from "./media-frame";

type Props = {
  items: PortfolioMedia[];
  /** Open item, or null when closed. */
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
};

/**
 * Fullscreen viewer on a native <dialog>: focus is trapped and restored by the
 * browser, Escape closes. Arrow keys and swipes move between items; zoom
 * doubles the image and lets native scrolling pan it.
 */
export function Lightbox({ items, index, onIndex, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState<{ index: number; on: boolean }>({ index: -1, on: false });
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const open = index !== null;
  const item = open ? items[index] : null;
  const zoomed = zoom.on && zoom.index === index;
  const count = items.length;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Centre the view when zooming in.
  useEffect(() => {
    const s = stageRef.current;
    if (zoomed && s) s.scrollTo({ left: (s.scrollWidth - s.clientWidth) / 2, top: (s.scrollHeight - s.clientHeight) / 2 });
  }, [zoomed]);

  const go = (step: number) => {
    if (index === null || count < 2) return;
    onIndex((index + step + count) % count);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
  };

  return (
    <dialog
      ref={ref}
      aria-label={item ? `${item.title ?? item.alt}, ${index! + 1} of ${count}` : "Media viewer"}
      onClose={onClose}
      onKeyDown={onKey}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-void/95 p-0 text-ink backdrop:bg-black/70 open:flex open:flex-col"
    >
      {item && (
        <>
          <div className="flex min-h-14 items-center gap-2 px-[var(--gutter)] py-2">
            <p className="t-meta">
              {index! + 1} / {count}
            </p>
            <div className="ml-auto flex items-center gap-1">
              {item.type === "image" && (
                <IconButton
                  label={zoomed ? "Zoom out" : "Zoom in"}
                  onClick={() => setZoom({ index: index!, on: !zoomed })}
                >
                  {zoomed ? <ZoomOut size={18} aria-hidden /> : <ZoomIn size={18} aria-hidden />}
                </IconButton>
              )}
              <IconButton label="Close" onClick={onClose}>
                <X size={18} aria-hidden />
              </IconButton>
            </div>
          </div>

          <div className="relative min-h-0 flex-1">
            <div
              ref={stageRef}
              className={`absolute inset-0 ${zoomed ? "overflow-auto" : "overflow-hidden touch-pan-y"}`}
              onDragStart={(e) => e.preventDefault()}
              onPointerDown={(e) => {
                if (!zoomed) swipe.current = { x: e.clientX, y: e.clientY };
              }}
              onPointerUp={(e) => {
                const s = swipe.current;
                swipe.current = null;
                if (!s) return;
                const dx = e.clientX - s.x;
                if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y)) go(dx < 0 ? 1 : -1);
              }}
            >
              <div className={`relative ${zoomed ? "h-[200%] w-[200%]" : "size-full"}`}>
                {failedSrc === item.src ? (
                  <MediaFallback label={item.title ?? item.alt} />
                ) : item.type === "video" ? (
                  <video
                    key={item.src}
                    className="absolute inset-0 size-full object-contain"
                    controls
                    playsInline
                    autoPlay
                    poster={item.poster}
                    aria-label={item.alt || undefined}
                    onError={() => setFailedSrc(item.src)}
                  >
                    <source src={item.src} onError={() => setFailedSrc(item.src)} />
                    {item.captionsSrc && <track kind="captions" src={item.captionsSrc} srcLang="en" label="English" default />}
                  </video>
                ) : (
                  <Image
                    key={item.src}
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes={zoomed ? "200vw" : "100vw"}
                    unoptimized={item.src.endsWith(".svg")}
                    draggable={false}
                    className={`object-contain select-none ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
                    onClick={() => setZoom({ index: index!, on: !zoomed })}
                    onError={() => setFailedSrc(item.src)}
                  />
                )}
              </div>
            </div>
            <MediaTags media={item} />
            {count > 1 && (
              <>
                <IconButton label="Previous" onClick={() => go(-1)} className="absolute left-[var(--gutter)] top-1/2 -translate-y-1/2">
                  <ChevronLeft size={20} aria-hidden />
                </IconButton>
                <IconButton label="Next" onClick={() => go(1)} className="absolute right-[var(--gutter)] top-1/2 -translate-y-1/2">
                  <ChevronRight size={20} aria-hidden />
                </IconButton>
              </>
            )}
          </div>

          <div className="mx-auto w-full max-w-[68ch] px-[var(--gutter)] py-4 text-center">
            {item.title && <p className="font-medium">{item.title}</p>}
            {item.caption && <p className="mt-1 text-[0.9375rem] text-ink-2">{item.caption}</p>}
            {item.transcript && (
              <details className="mt-3 text-left text-[0.9375rem] text-ink-2">
                <summary className="cursor-pointer text-ink">Transcript</summary>
                <p className="mt-2 whitespace-pre-line">{item.transcript}</p>
              </details>
            )}
          </div>
        </>
      )}
    </dialog>
  );
}

function IconButton({
  label,
  onClick,
  children,
  className = "",
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`inline-flex size-11 items-center justify-center rounded-[var(--r-sm)] bg-graphite/90 text-ink transition-colors duration-[var(--d-fast)] hover:bg-elevated ${className}`}
    >
      {children}
    </button>
  );
}
