# Session handoff — read this first

## 0a. Inventory flagship case study (2026-10-21)

- **Content:** `content/case-studies/inventory-platform.ts` (slug unchanged: `inventory-replenishment`). It is the first featured project.
- **Sources:** the audit in `Projects Audit/Inventory Replenishment Audit/Inventory.md`, plus the owner's confirmations:
  - the core-module commits are theirs;
  - 13 stores may be published;
  - production forecast constants must not be published.
- **Demos:** in `components/showcases/inventory/`. Each has a pure model with node tests in the session scratchpad. They are:
  - offline delivery simulator
  - forecast explorer (demo policy only)
  - stock placement
  - COGS ledger
  - architecture diagram
  - store topology
  - homepage still
- **Template additions:** `problemFigure`, `architectureFigure`, `capabilities`, `demoLabel`, `steps.collapsed`, and the `MediaKind` badge (real screenshot vs interface recreation).
- **Screens:** seven synthetic recreations, approved by the owner on 2026-10-22 and published from `public/images/projects/inventory-replenishment/`. The review sheet is `Project Screenshots/inventory-platform/REVIEW.html`; the workflow is in docs/CONTENT.md.
- **QA:** `node scripts/qa/inventory-qa.mjs qa-out/inventory` against a server on :3123. It covers 4 widths, every demo, and reduced motion.
- **UX refinement (2026-10-22):** the page is now six chapters, rendered by `components/detail/story-chapters.tsx` whenever a project has `story`.
  - Guided demos: `guided-delivery`, `forecast-guide`, `shelf-guard`, plus the `revenue-example` lead for the financial section.
  - The earlier demos and all the deep-dive text now sit behind disclosures.
  - The forecast demo caps the stockout correction at 2×, as audited.
  - `forecast-explorer` was removed, since its controls now live in the guide's Advanced settings.
  - QA (49 checks) covers each guided step, every advanced view, and overflow with disclosures open.
- **AI Operations Assistant (2026-10-22):** `content/case-studies/ai-operations-assistant.ts`, slug `ai-operations-assistant`. It replaced `nl-analytics-assistant` (the old URL now 404s). It is the second featured project.
  - Layout: six chapters via `aiStory`, rendered by `components/detail/ai-story-chapters.tsx`.
  - Demos: in `components/showcases/ai-assistant/`, all synthetic, all client-side. They are the chat (scripted engine in `chat-model.ts`), the pipeline stepper, and the engineering visuals.
  - Owner confirmed: sole developer; in daily production use; now runs Qwen3-30B-A3B INT4. The audited benchmark and device numbers are from the earlier Qwen3-8B setup and are labelled that way.
  - Never claim RAG, text-to-SQL, a routing accuracy figure, a live WhatsApp channel, or automatic POs.
  - QA: `node scripts/qa/ai-assistant-qa.mjs qa-out/ai` (47 checks).
- **Scantry (2026-10-22):** `content/case-studies/scantry.ts`, slug `scantry`, fourth in the Selected work showcase. Six chapters via `fieldStory`, rendered by `components/detail/field-story-chapters.tsx`.
  - Sources: `Projects Audit/Scantry audit.md` (lists security weaknesses: never commit or publish), the five fortnightly reflections and the pitch deck (copies in `Project Screenshots/scantry/originals-PRIVATE/`).
  - Demos in `components/showcases/scantry/`: the guided access simulator (`access-model.ts` + `access-simulator.tsx`, four scenarios, no camera), vision pipeline, kiosk screens, system map with a synthetic dashboard, dated timeline, and the homepage still (`kiosk-preview.tsx`).
  - Media: the owner approved all seven candidates on 2026-10-22 (logos, team slide and demo photo included). They are live from `public/images/projects/scantry/`; originals and `REVIEW.html` stay in `Project Screenshots/scantry/`. No photo of the physical kiosk or event exists yet.
  - Teammates are described by role, not name, until they consent. S$10,000 is the owner's reported funding (the deck asks for S$9,000). Event attendance (~800–1,000/day, 9 days) is never presented as kiosk scans.
  - QA: `node scripts/qa/scantry-qa.mjs qa-out/scantry` against a production server on :3123 (74 checks).
- **Context-Aware Digital Advertising (2026-10-22):** `content/case-studies/context-aware-advertising.ts`, slug `context-aware-advertising` (replaces the `vision-advertising` draft, which now 404s). Listed on `/projects` only (not the homepage). Five chapters via `rdStory`, rendered by `components/detail/rd-story-chapters.tsx`.
  - Owner confirmed: developed at Unistop Tech in collaboration with the Intel team; the owner develops the vision and advertising side; walking pace and ad selection are at the design stage (no code). It is unrelated to `demographic/app.py` in Unistopapp_Deployment (a colleague's kiosk work): never borrow its models, OpenVINO or features.
  - No technologies listed until the owner confirms them. Stage statuses: detection and audience estimation "in development", the rest "planned".
  - Demos in `components/showcases/advertising/`: the Ad Selection Explorer (`explorer-model.ts` illustrative policy + `ad-explorer.tsx`), the composition concept, and the homepage still. CSS `ad-walk` / `ad-swap` keyframes in `app/globals.css` (walkers stop under reduced effects).
  - Intel wording also added to the AI Operations Assistant (facts, overview line, homepage card) and the Unistop role (two contributions only).
  - QA: `node scripts/qa/advertising-qa.mjs qa-out/advertising` (83 checks).
- **Homepage refinement (2026-10-22):** Selected work is a horizontal showcase of four (`featuredProjects()`: Inventory, AI assistant, ERM, Scantry). The More work row is gone; Context-Aware Digital Advertising is on `/projects` only and its page returns there.
  - `components/sections/work.tsx` renders the cards from each project's `homeCard` (label, category, headline, summary, proof, ≤3 tags, visualNote). `work-showcase.tsx` picks the mode: **pin** (GSAP, ≥1100×760, travel measured from the cards, 0.65px of scroll per px of travel), **carousel** (native scroll-snap; everything smaller), **list** (reduced effects). CSS is in `app/globals.css` under "Selected work showcase"; previews shrink in short frames via `.pv-zoom` / `.pv-optional`.
  - Controls: counter, prev/next, project-name tabs, progress line, "Skip to Experience". Focusing an off-screen card brings it into view.
  - RAG removed: no implementation exists in the Unistop code. The Unistop contribution is gone, the skill is `verified: false`, and `llm-rag` is hidden.
  - Hero intro shortened; About rewritten from verified facts (the third paragraph paraphrases the case-study reflections; confirm wording).
  - QA: `node scripts/qa/home-qa.mjs qa-out/home` (136 checks); the ai-assistant, scantry, advertising and inventory suites were updated and pass.
- **Unused now:** `ops-console*` (the old inventory showcase) is no longer referenced by any project.

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
