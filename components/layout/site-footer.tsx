import { profile } from "@/content/profile";
import { plain } from "@/components/ui/content-text";
import { EffectsToggle } from "./effects-toggle";

/** Shared footer on every site page. Holds the reduce-effects setting. */
export function SiteFooter() {
  return (
    <footer className="relative z-[var(--z-content)] bg-void">
      <div className="shell flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-line py-6 text-[0.875rem] text-ink-2">
        <p>
          {plain(profile.name)}, {plain(profile.location)}. Built with Next.js, React Three Fiber and GSAP.
        </p>
        <div className="flex items-center gap-2" role="group" aria-label="Accessibility settings">
          <span>Accessibility:</span>
          <EffectsToggle className="-mx-1" />
        </div>
      </div>
    </footer>
  );
}
