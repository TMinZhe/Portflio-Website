# ATELIER / SYSTEM — design system (v1, checkpoint)

The source of truth for values is `styles/tokens.css` (CSS) and `lib/motion/tokens.ts` (JS motion mirror).
This document explains how to use them. `DESIGN.md` in the repo root is a separate reference analysis and is not this system.

## Principles

1. **Proof over adjectives.** Every visual device should carry information: a date, a layer name, a status. Decoration that says nothing gets cut.
2. **One bold thing per scene.** The hero has the monolith and the name; the work section has the stage. Everything around them stays quiet.
3. **Lime means "look here".** It marks the primary action, the active state, and live signal. It is never a background wash or a section colour.
4. **Honest placeholders.** Missing content renders in dashed amber (`.placeholder`) so it can never be mistaken for a real claim.
5. **Motion explains change.** Scroll motion shows structure (the stack separating); interaction motion shows cause and effect (a PO assembling). No ambient fade-ups on every block.

## Colour

| Token | Value | Use | Contrast on void |
|---|---|---|---|
| `--c-void` | `#090B11` | Page background | — |
| `--c-graphite` | `#171E24` | Panels | — |
| `--c-elevated` | `#222B34` | Raised surfaces, stages | — |
| `--c-text` | `#F4F5F7` | Primary text | 18.0:1 (13.2 on elevated) |
| `--c-text-2` | `#8B9DB5` | Secondary text, meta | 7.1:1 (5.2 on elevated) |
| `--c-text-3` | `#5F6F84` | Decorative only, never body text | 3.8:1 |
| `--c-lime` | `#B6FF3B` | Focal accent, primary CTA, focus ring | 16.3:1 |
| `--c-lime-ink` | `#0D1400` | Text on lime | 15.5:1 on lime |
| `--c-ice` | `#8CAEFF` | Diagrams, schematics, secondary data | 9.0:1 |
| `--c-warn` | `#FFB547` | Placeholders, out-of-stock | 11.2:1 |
| `--c-line` / `--c-line-strong` | 9% / 18% white | Hairlines, control borders | — |

## Typography

| Role | Family | Token | Size (360 → 1600px) |
|---|---|---|---|
| Hero | Space Grotesk 500 | `--t-hero` | 56 → 160px, line-height 0.92, tracking −0.045em |
| Section heading | Space Grotesk 500 | `--t-h1` | 44 → 88px |
| Project title | Space Grotesk 500 | `--t-h2` | 32 → 64px |
| Sub-heading | Space Grotesk 500 | `--t-h3` | 22 → 32px |
| Lead | Inter | `--t-lead` | 18 → 22px |
| Body | Inter | `--t-body` | 16 → 18px, line-height 1.6 |
| Data / meta | JetBrains Mono 400 | `--t-meta` | 13px |

Rules: sentence case everywhere; no all-caps eyebrows; mono only for real data (dates, SKUs, layer names, day counters); headings use `text-wrap: balance`; body measure ≤ 52ch.

## Space and layout

- 4px base scale: `--s-1` (4) … `--s-11` (192).
- `--gutter` 16 → 40px; `--section-y` 96 → 192px; max width 1520px.
- Grid (`.grid-12`): 4 columns < 768px, 8 columns 768–1023px, 12 columns ≥ 1024px.
- Desktop compositions switch on at `lg` (1024px). Below that, layouts stack and the 3D object moves above the copy.

## Radii — tied to hierarchy

`--r-xs` 4px data cells and chips · `--r-sm` 8px controls · `--r-md` 14px panels · `--r-lg` 28px stages · `--r-pill`.

## Components and states

| Component | File | States |
|---|---|---|
| Action (link-as-button) | `components/ui/action.tsx` | primary / secondary / quiet; hover; focus-visible (lime ring); active (1px press); **pending** (null href → dashed, disabled, "pending" tag, no dead link) |
| Content text | `components/ui/content-text.tsx` | real text / placeholder |
| Schematic label | `components/ui/schematic-label.tsx` | required on every illustrative showcase |
| Nav | `components/layout/nav.tsx` | transparent at top, blurred bar after scroll; active section underline (lime); mobile sheet < 1024px with focus management and Escape |
| Effects toggle | `components/layout/effects-toggle.tsx` | `role="switch"`, off / on |
| Ops console | `components/showcases/ops-console.tsx` | idle, auto-demo once on first view, user-driven, drafted, stale draft, empty |

## Motion

| Token | Value | Use |
|---|---|---|
| `--d-instant` | 90ms | press feedback |
| `--d-fast` | 160ms | hover colour |
| `--d-base` | 280ms | state changes |
| `--d-slow` | 520ms | bars, panels |
| `--d-cinematic` | 1100ms | canvas cross-fade |
| `--ease-out-expo` | `cubic-bezier(.16,1,.3,1)` | entrances |
| `--ease-in-out-quart` | `cubic-bezier(.76,0,.24,1)` | scene transitions |
| `damp.scroll` / `pointer` / `drag` | 0.28 / 0.18 / 0.12s | 3D damping half-lives |

**Ownership** (one owner per property, never two):

- GSAP ScrollTrigger — scroll-linked progress and scrubbed DOM tweens. Writes scene values to `sceneStore`.
- React Three Fiber — the 3D scene. Reads `sceneStore` in `useFrame`, damps toward targets, renders on demand only.
- Motion — component micro-interactions (purchase-order lines).
- CSS — hover, focus, simple transitions.

Native scrolling only. Pins are CSS `position: sticky`, so anchor links and keyboard scrolling are never trapped.

## Reduced effects

`<html data-effects="full|reduced">` is set before first paint from `prefers-reduced-motion`, and can be overridden with the nav switch (stored in `localStorage`). Reduced mode: no WebGL (static SVG drawing of the same object), no scroll scrubbing, all strata fully visible, CSS transitions cut to ~0, Motion set to `reducedMotion="always"`, no console auto-demo.

## 3D capability tiers

`lib/hooks/use-device.ts`: `none` (no WebGL → SVG), `low` (≤ 4 cores, ≤ 4GB, or small touch screen → DPR ≤ 1.25, no antialias, no signal traces, scene idles when settled), `high`. Force one for testing with `?tier=low|high|none`.

## Keeping layouts varied

Each project gets its own stage (console, pipeline, state machine, detection frame) instead of a shared card. Sections alternate between a dense, full-bleed moment and an open typographic one. Avoid: identical cards, a numbered eyebrow above every heading, gradient washes as decoration.
