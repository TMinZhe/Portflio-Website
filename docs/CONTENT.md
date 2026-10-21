# Editing the portfolio's content

All copy lives in `content/`. Pages are built from it; you never need to touch a component to add or change a project, a role or a photo.

| File | Holds |
|---|---|
| `content/profile.ts` | Name, tagline, intro, links, site URL |
| `content/projects.ts` | Every project, in display order |
| `content/experience.ts` | Every role, newest first |
| `content/skills.ts` | The Technical Toolkit: skills by domain, each linked to the projects/roles that prove it |
| `content/about.ts` | The About paragraphs |
| `content/beyond.ts` | Beyond Code: entrepreneurship and leadership |
| `content/media.ts` | Helpers for image paths |
| `content/types.ts` | The shape of all of the above (your editor autocompletes from it) |

## The one rule

Only write what is true and confirmed. Anything you don't know yet stays as `todo("what's missing")`. A `todo` is **never shown on a detail page**: the sentence, list item or whole section simply doesn't render until you replace it. So a page with gaps is shorter, never padded.

## Publishing

Every project and role has a `status`:

| status | Homepage | Detail page | Sitemap |
|---|---|---|---|
| `"published"` | listed | live, indexed | yes |
| `"draft"` | only in `npm run dev`, tagged "draft" | only in `npm run dev`, with a draft banner, `noindex` | no |
| `"hidden"` | no | 404 everywhere | no |

To publish: change `"draft"` to `"published"`. To unpublish: change it back. In production, drafts return a real 404 (`proxy.ts`).

## Add a project

1. Copy an entry in `content/projects.ts` (the first one is the most complete example).
2. Give it a new `slug` (lowercase-with-dashes). Its page is `/projects/<slug>`.
3. Fill what you know; leave the rest as `todo(...)` or empty arrays.
4. Link it to the role it came from with `experience: ["<role-slug>"]`. That one field creates the link in both directions (the role page lists it under "Projects delivered").
5. Start as `status: "draft"`, check it at `http://localhost:3000/projects/<slug>`, then publish.

What each field becomes on the page:

| Field | Section |
|---|---|
| `title`, `summary`, `category`, `organisation`, `client`, `timeframe`, `technologies` | Hero |
| `outcomes[0]` with a `value` | The large figure in the hero |
| `overview` (2–4 sentences) | Overview |
| `problem` | The problem |
| `role` | My role. Say whether you worked alone or in a team, and which parts were yours |
| `solution`, `features` (`what` it does, `why` it matters) | Solution and features |
| `architecture` | Architecture diagram (see below) |
| `decisions` (decision → reason → trade-off → result) | Engineering decisions, expandable |
| `challenges` (challenge → approach → outcome) | Challenges, expandable |
| `outcomes` | Results |
| `cover`, `gallery` | Cover image, Screens and media |
| `lessons` | Lessons learned |
| `problemLine`, `builtLine` | The short lines on the homepage |

**Outcomes** have a `kind`, shown on the page so readers can tell them apart:
- `"scope"`: how far it reaches (13 stores). A fact, not an improvement.
- `"capability"`: something the system does.
- `"measured"`: a measured change (hours saved, error rate). Only with a real measurement.

**Architecture diagram**: list `nodes` (with `kind` data / service / client / external / output, an optional `tech`, and a grid position `col`, `row`: columns read left to right in the direction data flows) and `edges` (`from` → `to`). On phones it flips to top-to-bottom automatically. Only include components you can confirm.

**Featured / order**: the order of the array is the order everywhere. Up to three published projects with `featured: true` appear in Selected work on the homepage; every published project is listed at `/projects`.

**Homepage visual**: `showcase` picks the schematic. Its still preview is in `components/showcases/previews.tsx` (homepage); the interactive version, where one exists, is in `components/showcases/index.ts` (project page).

## Add a role

Copy an entry in `content/experience.ts`, give it a `slug` (its page is `/experience/<slug>`), and fill `organisation`, `role`, `start`/`end` (`"2025-12"`, or `"present"`), and `summary`. Then:

- `context`: what the company does and the domain you worked in.
- `responsibilities`: one line each.
- `contributions`: for each one, `work` (what you did), optional `objective`, `technologies`, `result`, and `project: "<project-slug>"` to link its case study.
- `technologies`: only tools you actually used in that role.
- `lessons`: what was hard and what you learned.

Don't paste the project's case study into the role. The role page says what you contributed; the project page says how the system was built.

## Photos and screenshots

1. Put the file in `public/images/projects/<project-slug>/` or `public/images/experience/<role-slug>/` (see `public/images/README.md` for sizes and naming).
2. Add it to the project's or role's `gallery` (or set it as `cover`):

```ts
import { projectImage } from "./media";

gallery: [
  projectImage("inventory-replenishment", "monitoring-dashboard.png", {
    alt: "Stock levels for each store, with low items highlighted",
    title: "Store monitoring",
    caption: "Sanitised screenshot; product names replaced.",
    category: "screenshot",
    approved: true,
  }),
],
```

- **Reorder**: move entries in the array. The first item leads the grid when there are three or more.
- **Replace**: overwrite the file with the same name, or change the file name in the entry.
- **Remove**: delete the entry (and the file).
- **`approved: true`** only when you may publish it: your own photo, or a screenshot the client has approved and you've sanitised. Unapproved media shows in dev with a warning tag and never in production.
- **`isIllustrative: true`** for mockups and schematics, so they're labelled as such.
- **`alt`** says what the image shows, for someone who can't see it. Use `""` only for purely decorative images.
- Videos: `.mp4`/`.webm`, with `poster` (an image path), and `captionsSrc` (a `.vtt` file) or `transcript` if there is speech.
- A missing or broken file shows a quiet "image unavailable" panel, never a broken-image icon.

## Client screenshots (confidential work)

1. Keep originals in `Project Screenshots/` (git-ignored, never under `public/`).
2. Make a sanitized copy: paint over or replace names, emails, client-specific risk data, financial figures and identifiers with solid fills or clearly fictional text (no blur), and save as a fresh WebP so no metadata carries over. Drafts go in `Project Screenshots/ERM sanitized drafts/`.
3. Reference the file in content with `approved: false`. Pending screenshots are never requested by the browser; in dev they show an "awaiting approval" panel, in production they and their walkthrough entries are omitted.
4. Only after approval: copy the WebP into `public/images/projects/<slug>/` and set `approved: true`.
5. Never name the client in copy, alt text, captions or file names.

### Interface recreations (the inventory platform)

When a screen is full of live business data, rebuild it instead of redacting it. The inventory platform does this:

1. Read-only captures go in `Project Screenshots/inventory-platform/originals-PRIVATE/`. They are for reference only and never published.
2. `Project Screenshots/inventory-platform/recreation/screens.html` rebuilds each layout with synthetic data. Render it to WebP (with no metadata) using `node "Project Screenshots/inventory-platform/recreation/render.mjs"`. The output goes in `recreation/candidates/`.
3. Review the files in `Project Screenshots/inventory-platform/REVIEW.html`.
4. To publish:
   - Copy the approved files into `public/images/projects/inventory-replenishment/`.
   - Set `APPROVED = true` in `content/case-studies/inventory-platform.ts`.
   - Recreations are labelled "Interface recreation · synthetic data" automatically (`isIllustrative: true`).
5. To swap in a real sanitized screenshot later, add the file with its own `projectImage(...)` entry, leave out `isIllustrative`, and it will be labelled as a real application screenshot.

## Case-study blocks

A project can also use optional blocks (see `content/case-studies/enterprise-risk-management.ts` for a complete example): `headline`, `homeHeadline`, `highlights`, `facts`, `headings`, `workflow` (before/after), `ownership`, `walkthrough` (real screens with does/why/engineering), `deepDives` (with an interactive `demo`, `steps`, `limitations`), `architectureNotes`, `decisions[].basis` ("verified" or "inferred"), `resultsIntro`, `nextSteps`, `problemFigure` (a static figure under the problem), `architectureFigure` (a bespoke diagram in place of the generic one), `capabilities` (a compact grid after the decisions), and on a deep dive `demoLabel` and `steps.collapsed`. Interactive demos are registered in `components/showcases/demos.ts` and must use synthetic data.

## About, Toolkit, Beyond Code

- **About** (`content/about.ts`): one string per paragraph. The first is set large. Paragraphs still marked `todo(...)` are not shown.
- **Toolkit** (`content/skills.ts`): each skill lists `usedIn` slugs; selecting it on the homepage shows those projects/roles (published ones only). `"this-site"` links to your GitHub. `verified: false` keeps a skill off the page.
- **Beyond Code** (`content/beyond.ts`): `kind`, `title`, `role`, `detail`, optional `href`. Unconfirmed `role`/`detail` are hidden.

## Résumé and contact

Put the PDF at `public/resume.pdf` and set `links.resume.href` to `"/resume.pdf"` in `content/profile.ts`. Until then every résumé button is hidden. The email, GitHub and LinkedIn in `profile.ts` drive the Contact section.

## Technologies

Edit the `technologies` array on the project or role. The hero shows them all; the homepage shows the first three of the lead project, so put the most important first.

## Checking your changes

```bash
npm run dev                                   # preview, drafts included
npx tsc --noEmit                              # catches typos in field names
node scripts/qa/detail-qa.mjs qa-out/detail   # screenshots + checks (dev server on :3000)
npm run build                                 # what production will serve
```
