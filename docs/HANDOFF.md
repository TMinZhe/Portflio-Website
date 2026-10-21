# Session handoff — read this first

## 0. Latest (2026-10-20, supersedes the sections below where they conflict)

- **Homepage restructure (2026-10-21):** Hero → Selected work (3 featured, still previews in `components/showcases/previews.tsx`) → Experience → About → Technical toolkit → Beyond code → Contact, then `SiteFooter` (holds Reduce effects) on every site page. Strata section and `interim.tsx` removed. Nav: Work · Experience · About · Contact; Résumé hidden until `links.resume.href` is set. `/projects` index added. Public lists use `publishedProjects()` / `publishedExperience()` (no drafts even in dev). Inventory simulator now lives only on its project page.

- **Avatar is live on the homepage.** `components/three/avatar-stage.tsx` + `avatar-scene.tsx` replaced the monolith in `components/sections/opening.tsx`, reusing `components/lab/avatar/my-avatar.tsx`. The monolith files remain but are unused.
- **Detail pages track** (plan: `C:\Users\minzh\.claude\plans\pasted-content-id-ccdb-master-compressed-alpaca.md`). Phase 1 (audit + content model) and Phase 2 (templates, media system, one pilot pair) are **done and awaiting the user's visual review**. Next: Phase 3 (homepage Work/Experience redesign), then Phase 5 (remaining pages).
  - Routes: `app/(site)/projects/[slug]`, `app/(site)/experience/[slug]`, `app/sitemap.ts`, `app/robots.ts`, `proxy.ts` (real 404 for unknown/hidden/prod-draft slugs; streamed pages can't change status after the shell).
  - Content rules and selectors: `lib/content.ts` (`isRoutable`: published, or draft in dev). Model: `content/types.ts`. Guide for the owner: `docs/CONTENT.md`; media: `public/images/README.md`.
  - Components: `components/detail/*` (hero, body + TOC + progress, structured lists, architecture diagram, cover, related nav, reveal), `components/media/*` (frame with fallback, gallery, lightbox), `components/showcases/index.ts` (registry, `headingLevel` prop).
  - Published pilot: `inventory-replenishment` + `unistop-tech`. Everything else is draft/hidden until the owner reviews.
  - QA: `node scripts/qa/detail-qa.mjs <out>` against the dev server (uses installed Chrome via `CHANNEL`, default `chrome`). Fixture for the gallery: `/lab/media-qa` (synthetic cards in `public/lab/media-qa/`).
  - Gotchas: Next 16 `cacheComponents` + `partialPrefetching` flags reading `params` outside Suspense; detail pages export `instant = false` (all slugs are prerendered, so blocking is free). `next/image` `priority` is deprecated; use `loading`/`fetchPriority`. SVGs go through `unoptimized`.
- Owner decisions on record: titles AI Engineer (Unistop), Software Developer (8pi), Quality Intern (Collins); facts in the master brief are confirmed; drafts are dev-only.

---

Last updated: 2026-10-20. Paused partway through **Phase 1 (foundation + visual checkpoint)**, before the user's visual approval.

## 1. Where things stand

- **Approved plan:** `C:\Users\minzh\.claude\plans\pasted-content-id-b424-master-robust-clover.md` (rev 2). The original brief is the "MASTER PROMPT: Build a Cinematic, Interactive Computer Science Portfolio". `PRODUCT.md` holds the recruiter-focused product constraints.
- **The user's instruction:** build Phase 1 (hero + one showcase), then **stop for their visual approval** before Phase 2. Do not build the remaining sections until they approve.
- **Phase 1 status: COMPLETE, awaiting the user's visual approval.** Tablet and mobile are re-verified. The keyboard pass (`scripts/qa/keyboard.mjs`) found: tab order correct, skip link visible, every nav anchor lands (Contact needs about 1.6 s of smooth scroll over about 7,000px), mobile sheet focus-in, Escape and focus-return all working, slider operable with the keyboard. The explode spread is now a shared constant (`EXPLODE_SPREAD` in `layers.ts`).
- **Git:** repository initialised, **nothing committed** (the user hasn't asked).
- **Next step:** get the user's feedback or approval. Then Phase 2 (section 6), applying any changes they asked for first.

## 1b. NEW TRACK: "Digital Me" avatar (2026-10-20) — awaiting approval

- The user wants to replace the Exploded Monolith with an interactive, likeness-based 3D avatar of themself. **Do not replace the monolith until they approve.**
- The plan, covering all seven requested items, is in `docs/avatar/digital-me-plan.md`.
- The isolated prototype is at `/lab/avatar`: noindex, not linked from the site, no site nav. Code is in `components/lab/avatar/`:
  - `director.ts`: cue state machine
  - `rig.ts`: layered look-at, two-bone IK and finger curl, all in world space
  - `gestures.ts`: placeholder IK gestures
  - `avatar-store.ts`: framing presets, shared clock
  - `xbot-avatar.tsx`
  - `face-rig.tsx`: ARKit blendshapes
  - `avatar-lab.tsx`
- **Placeholder assets** are in `public/lab/placeholder/` (Mixamo X Bot, and the facecap ARKit head; licence notes in that folder's README). The Basis transcoder is in `public/lab/basis/`.
- QA: `node scripts/qa/avatar-lab.mjs qa-out/<dir>`. The last run had no errors and held 60 fps; tracking, every cue and the mobile layout were verified with screenshots.
- To keep the site nav off lab pages, the site moved into the `app/(site)/` route group (`layout.tsx` renders Nav). The root `app/layout.tsx` no longer renders Nav.
- `eslint.config.mjs` turns off `react-hooks/immutability` for `components/lab/**` only, because R3F mutates three.js objects inside `useFrame` by design.
- **Waiting on the user:** approval of the plan; DIY or commission; reference photo and video set (plan section 7).

## 2. Decisions already made (don't re-litigate)

- **Signature 3D:** "Exploded Monolith", chosen over "Lattice" and "Contour Field" (comparison in the plan). It is four strata, bottom to top: Models & services / Data / Logic / Interface. Each top face carries an etched pattern: a rack, a table, a node graph, a UI wireframe. Lime signal traces run vertically between layers (high tier only).
- **Positioning:** a blend of SWE, data/BI and AI/ML. The hero line is "I build software that turns data and code into decisions people actually use."
- **Identity:** the user said they'd type in their name, email and links but hasn't yet. Everything is a `todo()` placeholder in `content/profile.ts` and renders in dashed amber. Missing links render as disabled "pending" controls, so there are no dead links.
- **Section order:** Hero → Transformation → Work → Experience → About → Skills → Contact.
- **Project showcases are illustrative schematics on synthetic data**, each labelled with `SchematicLabel`. Planned treatments:
  - Inventory: ops console (**built**)
  - LLM/RAG: retrieval pipeline
  - Risk management: lifecycle state machine with audit log
  - CV: detection frame
  - Personal project: `hidden`
- **Case studies:** every project has `status: "draft"`. The future `/projects/[slug]` route shows a draft banner, sets `noindex`, and is left out of the sitemap.
- **Animation ownership:** GSAP ScrollTrigger owns scroll progress and writes it to `lib/motion/scroll-store.ts`. R3F reads that store in `useFrame` and damps toward it (maath). Motion owns micro-interactions, and CSS owns hover and focus. Pins use CSS `sticky`, not GSAP pin. Scrolling is native.
- **`DESIGN.md` in the root is the user's Apple design-analysis reference, not ours.** Don't overwrite it. Our system lives in `docs/design-system.md`.

## 3. Map of the code

| Area | Files |
|---|---|
| Tokens | `styles/tokens.css`, `lib/motion/tokens.ts`, `app/globals.css` (Tailwind v4 `@theme` mapping, `.t-*` type classes, `.placeholder`, `.grid-12`, `.ops-range`) |
| Content | `content/types.ts` (`todo()`, `Text`, `Project.status`), `profile.ts`, `experience.ts`, `projects.ts`, `skills.ts` |
| Layout | `app/layout.tsx` (fonts, effects boot script, Providers, Nav), `components/layout/nav.tsx`, `effects-toggle.tsx`, `providers.tsx` |
| Opening (Scenes A+B) | `components/sections/opening.tsx` (hero + strata list; the sticky stage sits behind them), `opening-scroll.tsx` (GSAP: hero fade, explode 0→1, focus layer 3→0, `data-active` on strata) |
| 3D | `components/three/layers.ts` (shared spec), `monolith-scene.tsx` (Canvas, demand frameloop, pointer tilt, drag-to-spin with spring-back, IO pause), `monolith-fallback.tsx` (SVG axonometric drawing), `monolith-stage.tsx` (tier/effects choice, idle-load, cross-fade) |
| Work (Scene E) | `components/sections/work.tsx`, `expanding-stage.tsx` (clip-path reveal), `components/showcases/ops-console.tsx` + `ops-console-model.ts` |
| Interim sections | `components/sections/interim.tsx` (Experience, About, Skills, Contact). To be replaced in Phase 2 |
| Hooks | `lib/hooks/use-effects.ts` (`html[data-effects]` + localStorage), `use-device.ts` (tier detection; `?tier=` override) |
| QA | `scripts/qa/shots.mjs` (screenshot matrix), `scripts/qa/motion-qa.mjs` (frame pacing + WebGL draw counts) |

## 4. Verified so far

- `tsc --noEmit` clean. `eslint components lib app content` clean. `npm run build` passes (static `/`).
- No horizontal overflow and no console errors at 375, 768, 1280 and 1920.
- Motion QA on the real GPU (Intel Arc 140V, `GPU=1`):
  - p95 frame time is 16.8 ms while scrolling the opening, even with CPU throttled 4–6×.
  - Zero draws while the scene is off-screen. The low tier draws nothing once settled.
  - The high tier keeps drawing while in view, by design, because the traces animate.
- Reduced effects (`prefers-reduced-motion`, or the nav switch) shows the static SVG with all strata visible. `?tier=none` shows the same SVG.

## 5. Gotchas

- **Next.js 16.4 + React 19.3.** Read `node_modules/next/dist/docs/` before using Next APIs (see `AGENTS.md`). `cacheComponents` and `partialPrefetching` are on, so routes stay mounted under `<Activity>`.
- `LayoutProps` global type only exists after typegen. Typing children inline was fine.
- **Port 3123 often stays held after stopping the background server.** Free it in PowerShell: `Get-NetTCPConnection -LocalPort 3123 -State Listen | % { Stop-Process -Id $_.OwningProcess -Force }`. Rebuild only after the old server is stopped.
- Screenshots: run `node scripts/qa/shots.mjs qa-out/<name>` from the repo root, with the server on :3123. Use real-GPU launch args. SwiftShader makes frame timings meaningless.
- The draw counter has to patch `drawArrays*` as well, because RoundedBox and line segments are non-indexed.
- The React Compiler lint (`react-hooks/immutability`) forbids mutating `useMemo` objects inside `useFrame`. Mutate through refs instead (see `traceRef`).
- `.agents/` and `.claude/` (skills the user installed) are excluded in `eslint.config.mjs` and `tsconfig.json`.

## 6. Phase 2 (only after approval)

Remaining showcases: RagPipeline, RiskLifecycle, DetectionFrame. The layouts should vary: horizontal pipeline, split diagram, letterbox frame. Also:

- Full Experience timeline with expandable detail
- About: scroll-highlighted editorial text and the monolith docking into an ice-blue diagram (S2)
- Skills explorer: filter by domain, click a skill to see where it was used
- Contact finale: magnetic CTA, copy email with a toast, monolith re-assembles small (S3)
- `/projects/[slug]` draft case studies
- `/design-system` route (noindex)
- SEO: metadata, `opengraph-image`, JSON-LD, `sitemap.ts`, `robots.ts`
- `not-found`, `error` and `loading` pages, and a back-to-top control

Then **Phase 3**: the full QA matrix, Lighthouse, and a visual critique pass.
