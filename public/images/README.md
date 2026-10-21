# Portfolio media

Files here are served as-is from `/images/...` and listed in `content/projects.ts` or `content/experience.ts`. Full guide: `docs/CONTENT.md`.

```
public/images/
  projects/<project-slug>/      e.g. projects/inventory-replenishment/monitoring.png
  experience/<role-slug>/       e.g. experience/unistop-tech/team-demo.jpg
  about/
```

- **Names**: lowercase-with-dashes, describing the content (`purchase-order-draft.png`, not `Screenshot 2026-05-03.png`).
- **Screenshots**: PNG or WebP, at least 1600px wide, captured at 2x if you can. They're shown whole (never cropped), so trim browser chrome yourself.
- **Photographs**: JPG or WebP, at least 2000px on the long side. These fill their frame and may be cropped at the edges.
- **Aspect ratio**: frames default to 16:10. Set `aspect: "4/3"` (or whatever the file is) in the entry when it differs.
- **Video**: MP4 (H.264) or WebM, short and muted unless speech matters, plus a poster image.
- **Size**: keep each image under ~1.5 MB; Next.js serves resized versions automatically.
- **Permission**: only files you may publish. Client screens must be approved and sanitised (no customer names, prices, internal URLs or records). Mark them `approved: true` in content; anything else stays out of production.
