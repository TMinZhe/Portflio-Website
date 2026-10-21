/**
 * Content model. All portfolio copy lives in /content and is typed here.
 *
 * Integrity rule: a value that has not been confirmed by the owner is written
 * as a `Placeholder` (via `todo()`) or left out. Detail pages skip placeholders
 * entirely, so a TODO never reaches a public page as a fake claim. Never
 * replace a placeholder with plausible-sounding fiction.
 */

/** A string that still needs real content. */
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

/**
 * published = public, linked and in the sitemap.
 * draft     = only routable in `next dev`, with a draft banner and noindex.
 * hidden    = never routable or listed.
 */
export type ContentStatus = "published" | "draft" | "hidden";

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

/* ---------- Media ---------- */

export type MediaCategory =
  | "screenshot"
  | "architecture"
  | "diagram"
  | "workplace"
  | "event"
  | "demo"
  | "certificate"
  | "other";

/**
 * One image or video. Files live in /public/images (see its README); arrays of
 * media are shown in array order.
 */
export type PortfolioMedia = {
  id: string;
  /** Path under /public, e.g. "/images/projects/inventory-replenishment/dashboard.png". */
  src: string;
  type: "image" | "video";
  /** Required for informative images. Use "" only for purely decorative ones. */
  alt: string;
  title?: string;
  caption?: string;
  category?: MediaCategory;
  /** A mockup, schematic or synthetic demo rather than the real system. Labelled on the page. */
  isIllustrative?: boolean;
  /** Video poster or a lighter thumbnail for the grid. */
  poster?: string;
  /** CSS aspect ratio of the file, e.g. "16/10" (default) or "4/3". */
  aspect?: string;
  /** Load eagerly (use for the cover only). */
  priority?: boolean;
  /**
   * You have permission to publish this file (your own photo, or a client-approved,
   * sanitised screenshot). Unapproved media never renders in production.
   */
  approved: boolean;
  /** WebVTT captions for a video. */
  captionsSrc?: string;
  /** Plain-text transcript for a video. */
  transcript?: string;
};

/* ---------- Shared structured content ---------- */

export type Feature = {
  name: string;
  /** What it does. */
  what: Text;
  /** Why it matters. */
  why?: Text;
};

export type ArchitectureNode = {
  id: string;
  label: string;
  kind: "client" | "service" | "data" | "external" | "output";
  /** Technology, shown under the label. Only confirmed technologies. */
  tech?: string;
  /** Grid position, 1-based. Columns read left to right as data flows. */
  col: number;
  row: number;
};

export type ArchitectureData = {
  nodes: ArchitectureNode[];
  edges: { from: string; to: string; label?: string }[];
  /** One line on what the diagram does and doesn't show. */
  note?: Text;
};

/** Decision → Reason → Trade-off → Result. */
export type EngineeringDecision = {
  decision: string;
  reason: Text;
  tradeoff?: Text;
  result?: Text;
};

/** Challenge → Approach → Outcome. */
export type EngineeringChallenge = {
  challenge: string;
  approach: Text;
  outcome?: Text;
};

/**
 * scope      = how far the work reaches (e.g. 13 stores). A fact, not an improvement.
 * measured   = a measured change (e.g. hours saved). Only with a real measurement.
 * capability = something the system now does.
 */
export type Outcome = {
  kind: "scope" | "measured" | "capability";
  label: Text;
  /** Short figure shown large, e.g. "13". */
  value?: string;
};

/* ---------- Experience ---------- */

export type Contribution = {
  title: string;
  objective?: Text;
  work: Text;
  technologies?: string[];
  result?: Text;
  /** Slug of the project this contribution produced, if it has a case study. */
  project?: string;
};

export type Experience = {
  slug: string;
  status: ContentStatus;
  organisation: string;
  role: string;
  start: string; // "2025-12"
  end: string | "present";
  location?: Text;
  /** One sentence for the homepage and the page hero. */
  summary: string;
  /** What the organisation does and the domain you worked in. */
  context: Text;
  responsibilities: Text[];
  contributions: Contribution[];
  /** Only tools actually used in this role. */
  technologies: Text[];
  /** What was challenging and what you learned. */
  lessons: Text[];
  outcomes: Outcome[];
  cover?: PortfolioMedia;
  gallery: PortfolioMedia[];
};

/* ---------- Projects ---------- */

export type Showcase = "ops-console" | "rag-pipeline" | "risk-lifecycle" | "detection-frame" | "none";

export type Project = {
  slug: string;
  status: ContentStatus;
  /** Shown as a large editorial feature on the homepage. */
  featured?: boolean;
  title: string;
  /** One sentence: what it is. */
  summary: string;
  category: string;
  organisation: string | null;
  /** End client, when different from the organisation. */
  client?: string;
  confidential: boolean;
  /** Slugs of the roles this project came from. The only place this link is stored. */
  experience: string[];
  timeframe?: Text;
  role: Text;
  /** Homepage: the problem in one sentence. */
  problemLine?: Text;
  /** Homepage: what you built, one or two sentences. */
  builtLine?: Text;
  /** 2–4 sentences: what, for whom, which problem, what it does. */
  overview: Text[];
  /** Original workflow, why it mattered, constraints, stakeholders. */
  problem: Text[];
  solution?: Text;
  features: Feature[];
  technologies: Text[];
  architecture?: ArchitectureData;
  decisions: EngineeringDecision[];
  challenges: EngineeringChallenge[];
  outcomes: Outcome[];
  lessons: Text[];
  /** Interactive schematic used as the cover when there is no approved cover image. */
  showcase: Showcase;
  cover?: PortfolioMedia;
  gallery: PortfolioMedia[];
  links: { demo: Link | null; repo: Link | null };
};

/* ---------- Skills ---------- */

export type SkillDomain = {
  id: string;
  name: string;
  skills: Skill[];
};

export type Skill = {
  name: string;
  /** Project or experience slugs where this skill was used. */
  usedIn: string[];
  verified: boolean;
};
