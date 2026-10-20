# ATELIER / SYSTEM — portfolio

Personal portfolio for an NUS Computer Science student. Next.js 16 (App Router), TypeScript, Tailwind CSS 4, React Three Fiber, GSAP ScrollTrigger and Motion.

> **Status: visual checkpoint.** The hero, the scroll transformation and one project showcase (inventory) are built. Experience, About, Skills and Contact are interim versions; case-study pages come next.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm run start   # production build
```

Useful query flags: `?tier=high|low|none` forces a 3D capability tier (`none` shows the static drawing).

## Edit your content

Everything you write lives in `/content`:

| File | What it holds |
|---|---|
| `content/profile.ts` | Name, intro, email, GitHub, LinkedIn, résumé link, site URL |
| `content/experience.ts` | Roles, dates, contributions |
| `content/projects.ts` | Projects, their status (`published` / `draft` / `hidden`) and showcase type |
| `content/skills.ts` | Skill domains; each skill links to where it was used |

Anything wrapped in `todo("…")` is a placeholder and shows in dashed amber on the site. Replace it with real text. A link set to `href: null` shows as a disabled "pending" control rather than a dead link.

**Résumé:** put the PDF at `public/resume.pdf`, then set `links.resume.href` to `"/resume.pdf"` in `content/profile.ts`.

**Screenshots:** add approved images under `public/projects/<slug>/` and reference them in that project's `images` array (`src`, `alt`). Until `src` is set, a labelled placeholder frame is shown. Do not add screenshots of client systems without approval.

## Project structure

```
app/                 routes, layout, global CSS
content/             all editable copy (typed)
components/
  layout/            nav, effects switch, providers
  sections/          homepage scenes
  showcases/         per-project interactive schematics
  three/             the monolith (WebGL scene, SVG fallback, shared layer spec)
  ui/                primitives
lib/                 motion tokens, GSAP setup, scroll→3D store, hooks
styles/tokens.css    design tokens
docs/design-system.md
```

## Deploy (Vercel)

1. Push this repository to GitHub.
2. In Vercel, "Add New → Project", import the repo; the defaults for Next.js work as-is.
3. After the first deploy, set `siteUrl` in `content/profile.ts` to the deployment URL and redeploy.
