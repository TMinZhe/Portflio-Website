import type { MetadataRoute } from "next";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { experience } from "@/content/experience";

/** Published pages only — never drafts, even in development. */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, profile.siteUrl).toString();
  return [
    { url: url("/"), priority: 1 },
    ...projects.filter((p) => p.status === "published").map((p) => ({ url: url(`/projects/${p.slug}`), priority: 0.8 })),
    ...experience.filter((e) => e.status === "published").map((e) => ({ url: url(`/experience/${e.slug}`), priority: 0.6 })),
  ];
}
