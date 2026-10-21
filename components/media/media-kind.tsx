import type { PortfolioMedia } from "@/content/types";

/** Says what a screen is: a sanitized capture of the real system, or a recreation with synthetic data. */
export function MediaKind({ media }: { media: PortfolioMedia }) {
  const recreation = media.isIllustrative;
  return (
    <span className="t-meta inline-flex items-center gap-2 text-[0.6875rem]">
      <span aria-hidden className={`size-1.5 rounded-full ${recreation ? "bg-ice" : "bg-lime"}`} />
      {recreation ? "Interface recreation · synthetic data" : "Real application screenshot · sanitized"}
    </span>
  );
}
