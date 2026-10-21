import { projects } from "@/content/projects";
import { experience } from "@/content/experience";
import { type ContentStatus, type PortfolioMedia, type Project, type Text } from "@/content/types";

/*
 * Read-side helpers over /content. Pages and sections go through these so the
 * publishing rules live in one place.
 */

const dev = process.env.NODE_ENV === "development";

/** Published always; drafts only in `next dev`; hidden never. */
export const isRoutable = (status: ContentStatus) => status === "published" || (dev && status === "draft");

export const isDraft = (status: ContentStatus) => status === "draft";

/** Confirmed text only: drops todo() placeholders and empty strings. */
export const known = (v: Text | undefined | null): v is string => typeof v === "string" && v.trim().length > 0;
export const knownList = (list: readonly (Text | undefined)[] | undefined) => (list ?? []).filter(known);

/** Media allowed on the page: approved files, plus unapproved ones in dev for review. */
export const visibleMedia = (list: readonly PortfolioMedia[] | undefined) =>
  (list ?? []).filter((m) => m.approved || dev);

/* ---------- Projects ---------- */

export const routableProjects = () => projects.filter((p) => isRoutable(p.status));
export const homepageProjects = routableProjects;
export const getProject = (slug: string) => routableProjects().find((p) => p.slug === slug);

/** Previous and next routable project, wrapping around. */
export function adjacentProjects(slug: string) {
  const list = routableProjects();
  const i = list.findIndex((p) => p.slug === slug);
  if (i < 0 || list.length < 2) return { prev: undefined, next: undefined };
  return { prev: list[(i - 1 + list.length) % list.length], next: list[(i + 1) % list.length] };
}

export const projectHref = (p: Pick<Project, "slug">) => `/projects/${p.slug}`;

/* ---------- Experience ---------- */

export const routableExperience = () => experience.filter((e) => isRoutable(e.status));
export const getExperience = (slug: string) => routableExperience().find((e) => e.slug === slug);
export const experienceHref = (e: { slug: string }) => `/experience/${e.slug}`;

/** Projects delivered in a role. The link is stored on the project only. */
export const projectsForExperience = (slug: string) => routableProjects().filter((p) => p.experience.includes(slug));

export const experienceForProject = (p: Project) =>
  routableExperience().filter((e) => p.experience.includes(e.slug));
