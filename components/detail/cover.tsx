import type { PortfolioMedia, Showcase } from "@/content/types";
import { visibleMedia } from "@/lib/content";
import { showcases } from "@/components/showcases";
import { previews } from "@/components/showcases/previews";
import { MediaFrame } from "@/components/media/media-frame";
import { MediaKind } from "@/components/media/media-kind";
import { SchematicLabel } from "@/components/ui/schematic-label";
import { ExpandingStage } from "@/components/sections/expanding-stage";

type Props = { cover?: PortfolioMedia; showcase?: Showcase; allowStill?: boolean };

/**
 * The large visual under a detail hero, in order of preference: an approved
 * cover image, the project's interactive schematic, its still schematic, or
 * nothing, in which case the page simply moves on to its content.
 */
export function DetailCover({ cover, showcase, allowStill = true }: Props) {
  // Only approved files can lead the page; pending ones fall back to the schematic.
  const media = visibleMedia(cover ? [cover] : []).find((m) => m.approved);
  const Show = showcase ? showcases[showcase] : undefined;
  const Still = showcase && allowStill ? previews[showcase] : undefined;

  if (media) {
    return (
      <figure className="shell mt-[clamp(2.5rem,6vw,5rem)]">
        <div className="rounded-[var(--r-lg)] bg-[#e9edf3] p-2 sm:p-3">
          <MediaFrame media={media} sizes="(min-width: 1520px) 1440px, 100vw" eager className="bg-white" />
        </div>
        <figcaption className="mt-3 space-y-1">
          <MediaKind media={media} />
          {media.caption && <span className="block text-[0.9375rem] text-ink-2">{media.caption}</span>}
        </figcaption>
      </figure>
    );
  }

  if (Show) {
    return (
      <ExpandingStage className="mt-[clamp(2.5rem,6vw,5rem)] bg-[var(--c-elevated)] py-[clamp(2rem,5vw,5rem)]">
        <div className="shell">
          <div className="mb-5">
            <SchematicLabel />
          </div>
          <Show headingLevel={2} />
        </div>
      </ExpandingStage>
    );
  }

  if (Still) {
    return (
      <div className="shell mt-[clamp(2.5rem,6vw,5rem)]">
        <div className="mb-3">
          <SchematicLabel />
        </div>
        <Still />
      </div>
    );
  }

  return null;
}
