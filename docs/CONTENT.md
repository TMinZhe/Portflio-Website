# Editing the portfolio's content

All copy lives in `content/`. Pages are built from it; you never need to touch a component to add or change a project, a role or a photo.

| File | Holds |
|---|---|
| `content/profile.ts` | Name, tagline, intro, links, site URL |
| `content/projects.ts` | Every project, in display order |
| `content/experience.ts` | Every role, newest first |
| `content/skills.ts` | Skills, each linked to the projects/roles that prove it |
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

**Featured / order**: the order of the array is the order everywhere. `featured: true` makes a project the large lead on the homepage.

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

## Technologies

Edit the `technologies` array on the project or role. The hero shows them all; the homepage shows the first three of the lead project, so put the most important first.

## Checking your changes

```bash
npm run dev                                   # preview, drafts included
npx tsc --noEmit                              # catches typos in field names
node scripts/qa/detail-qa.mjs qa-out/detail   # screenshots + checks (dev server on :3000)
npm run build                                 # what production will serve
```
