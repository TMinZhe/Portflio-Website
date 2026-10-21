import type { PortfolioMedia, Showcase } from "@/content/types";
import { visibleMedia } from "@/lib/content";
import { showcases } from "@/components/showcases";
import { MediaFrame } from "@/components/media/media-frame";
import { SchematicLabel } from "@/components/ui/schematic-label";
import { ExpandingStage } from "@/components/sections/expanding-stage";

type Props = { cover?: PortfolioMedia; showcase?: Showcase };

/**
 * The large visual under a detail hero, in order of preference: an approved
 * cover image, the project's interactive schematic, or nothing. With neither,
 * the page simply moves on to its content rather than showing a stand-in.
 */
export function DetailCover({ cover, showcase }: Props) {
  const media = visibleMedia(cover ? [cover] : [])[0];
  const Show = showcase ? showcases[showcase] : undefined;

  if (media) {
    return (
      <figure className="shell mt-[clamp(2.5rem,6vw,5rem)]">
        <MediaFrame media={media} sizes="(min-width: 1520px) 1440px, 100vw" eager />
        {media.caption && <figcaption className="mt-3 text-[0.9375rem] text-ink-2">{media.caption}</figcaption>}
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

  return null;
}
