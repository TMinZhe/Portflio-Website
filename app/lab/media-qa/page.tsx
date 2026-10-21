import type { Metadata } from "next";
import type { PortfolioMedia } from "@/content/types";
import { Gallery } from "@/components/media/gallery";
import { MediaFrame } from "@/components/media/media-frame";

export const metadata: Metadata = {
  title: "Media system QA (lab)",
  robots: { index: false, follow: false },
};

/** Synthetic test cards for checking the gallery, lightbox and fallbacks. Not portfolio content. */
const items: PortfolioMedia[] = [
  { id: "wide", src: "/lab/media-qa/qa-wide.png", type: "image", alt: "Wide test card", title: "Wide", caption: "16:10 screenshot, contain fit.", category: "screenshot", approved: true },
  { id: "tall", src: "/lab/media-qa/qa-tall.png", type: "image", alt: "Tall test card", title: "Tall", caption: "Portrait image in a 16:10 frame: nothing cropped.", category: "screenshot", approved: true },
  { id: "square", src: "/lab/media-qa/qa-square.png", type: "image", alt: "Square test card", title: "Illustrative", caption: "Marked as illustrative.", isIllustrative: true, approved: true, aspect: "1/1" },
  { id: "missing", src: "/lab/media-qa/does-not-exist.png", type: "image", alt: "Missing file", title: "Missing file", caption: "Should show the fallback panel, never a broken image.", approved: true },
  { id: "video", src: "/lab/media-qa/does-not-exist.mp4", type: "video", alt: "Video without a file", title: "Video", caption: "Poster in the grid; fallback in the viewer.", poster: "/lab/media-qa/qa-poster.png", approved: true },
  { id: "unapproved", src: "/lab/media-qa/qa-wide.png", type: "image", alt: "Unapproved test card", title: "Unapproved", caption: "Tagged in dev, removed in production.", approved: false },
];

export default function MediaQaPage() {
  return (
    <main className="shell py-16">
      <h1 className="t-h2">Media system QA</h1>
      <p className="mt-3 max-w-[60ch] text-ink-2">Synthetic test cards. Not linked from the site.</p>
      <section aria-labelledby="g" className="mt-12">
        <h2 id="g" className="t-h3 mb-6">Gallery</h2>
        <Gallery items={items} />
      </section>
      <section aria-labelledby="f" className="mt-16 max-w-xl">
        <h2 id="f" className="t-h3 mb-6">Single frame, missing file</h2>
        <MediaFrame media={items[3]} sizes="600px" />
      </section>
    </main>
  );
}
