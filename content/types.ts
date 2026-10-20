/**
 * Content model. All portfolio copy lives in /content and is typed here.
 *
 * Integrity rule: a value that has not been confirmed by the owner is written
 * as a `Placeholder` (or left `null`) so the UI can render it as visibly
 * pending. Never replace a placeholder with plausible-sounding fiction.
 */

/** A string that still needs real content. Rendered with dashed amber styling. */
export type Placeholder = { placeholder: string };
export type Text = string | Placeholder;

export const isPlaceholder = (v: unknown): v is Placeholder =>
  typeof v === "object" && v !== null && "placeholder" in v;

export const todo = (placeholder: string): Placeholder => ({ placeholder });

export type Link = {
  label: string;
  /** null = not available yet; rendered as a disabled "pending" control. */
  href: string | null;
};

export type Profile = {
  name: Text;
  /** Short form used in the nav mark and page titles. */
  shortName: Text;
  study: string;
  positioning: string;
  intro: Text;
  email: string | null;
  location: Text;
  links: { github: Link; linkedin: Link; resume: Link };
  /** Absolute site URL, used for metadata and sitemap. */
  siteUrl: string;
};

export type Experience = {
  id: string;
  organisation: string;
  role: string;
  start: string; // "2025-12"
  end: string | "present";
  context: Text;
  /** Only work the owner has described. */
  contributions: string[];
  technologies: Text[];
  challenges: Text[];
  outcomes: Text[];
};

export type ProjectStatus = "published" | "draft" | "hidden";

export type ImageAsset = {
  /** null until a real, approved screenshot exists. */
  src: string | null;
  alt: string;
  /** Describes what the eventual image will show, for the placeholder frame. */
  pendingLabel: string;
  width?: number;
  height?: number;
};

export type Showcase = "ops-console" | "rag-pipeline" | "risk-lifecycle" | "detection-frame" | "none";

export type Project = {
  slug: string;
  status: ProjectStatus;
  title: string;
  oneLiner: string;
  category: string;
  organisation: string | null;
  confidential: boolean;
  role: Text;
  problem: Text;
  users: Text;
  /** What was built — facts from the owner only. */
  built: string[];
  technologies: Text[];
  decisions: Text[];
  challenges: Text[];
  outcomes: Text[];
  showcase: Showcase;
  images: ImageAsset[];
  links: { demo: Link | null; repo: Link | null };
};

export type SkillDomain = {
  id: string;
  name: string;
  skills: Skill[];
};

export type Skill = {
  name: string;
  /** Project slugs / experience ids where this skill was used. */
  usedIn: string[];
  verified: boolean;
};
