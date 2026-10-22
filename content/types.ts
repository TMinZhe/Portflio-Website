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
  /**
   * verified = the reasoning is documented (audit or owner confirmation).
   * inferred = a reading of the design; labelled as such on the page.
   */
  basis?: "verified" | "inferred";
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

/* ---------- Case-study blocks (all optional on a project) ---------- */

/** Before/after process, drawn as two rows of steps. Always labelled illustrative. */
export type WorkflowCompare = { before: string[]; after: string[]; note?: Text };

/** One real screen in the walkthrough: what it does, why it matters, and how it works. */
export type WalkthroughItem = {
  media: PortfolioMedia;
  title: string;
  does: Text;
  why: Text;
  engineering?: Text;
};

/** Interactive synthetic demonstrations, registered in components/showcases/demos.ts. */
export type DemoKey =
  | "risk-matrix"
  | "signoff-workflow"
  | "audit-timeline"
  | "store-topology"
  | "offline-delivery"
  | "stock-placement"
  | "cogs-ledger"
  | "inventory-architecture"
  | "guided-delivery"
  | "forecast-guide"
  | "shelf-guard"
  | "revenue-example"
  | "ai-chat"
  | "ai-pipeline"
  | "ai-guardrails"
  | "ai-inference"
  | "ai-latency"
  | "ai-eval"
  | "scantry-access"
  | "scantry-vision"
  | "scantry-kiosk"
  | "scantry-system"
  | "scantry-timeline"
  | "ad-explorer"
  | "ad-composition";

/** An engineering highlight with its own section, optional demo and steps. */
export type DeepDive = {
  id: string;
  /** Short name for the table of contents. */
  label: string;
  heading: string;
  intro: Text[];
  demo?: DemoKey;
  /** Disclosure shown above the demo; defaults to the client-recreation label. */
  demoLabel?: string;
  /** Ordered mechanism, e.g. an algorithm's steps. Starts open unless collapsed. */
  steps?: { title: string; items: Text[]; collapsed?: boolean };
  /** What the current implementation does not do yet. */
  limitations?: Text[];
};

/** Section ids on a project page, for custom headings. */
export type ProjectSectionId =
  | "overview"
  | "problem"
  | "role"
  | "solution"
  | "walkthrough"
  | "architecture"
  | "decisions"
  | "capabilities"
  | "challenges"
  | "results"
  | "next-steps"
  | "gallery"
  | "lessons"
  | "context";

/* ---------- Guided story (six-chapter case study) ---------- */

/** One guided demo in "How I solved it": a plain question first, the mechanism behind a disclosure. */
export type StoryDemo = {
  /** Anchor id for the subsection. */
  id: string;
  question: string;
  /** One or two plain sentences before the demo. */
  context: string;
  guided: DemoKey;
  /** The deep dive (in `deepDives`) whose technical text and advanced demo sit behind the disclosure. */
  deepDive: string;
  /** Disclosure label, e.g. "Explore the technical mechanism". */
  advancedLabel: string;
};

/**
 * Plain-language layer for a case study. When present, the project page
 * renders six chapters (project, problem, platform, solution, engineering,
 * impact) and moves technical material into opt-in disclosures.
 */
export type CaseStudyStory = {
  /** Three short "at a glance" cards in chapter 1. */
  glance: { label: string; text: string }[];
  /** What could go wrong, in plain words, under the problem. */
  problemPoints: string[];
  /** Media ids (from `walkthrough`) shown large in the tour; the rest go in a gallery. */
  tourFeatured: string[];
  /** One-line purpose per screen, keyed by media id. */
  tourCaptions: Record<string, string>;
  solutionIntro: string;
  demos: StoryDemo[];
  engineeringIntro: string;
  /** Deep dive id shown under "Accurate financial reporting". */
  financeDive?: string;
  financeLead?: DemoKey;
  /** Short chapter headings, keyed by chapter id. */
  headings: Record<"project" | "problem" | "platform" | "solution" | "engineering" | "impact", string>;
};

/** Six-chapter layout for an applied-AI case study: overview, problem, try it, how it works, engineering, impact. */
export type AiStory = {
  headings: Record<"overview" | "problem" | "try" | "how" | "engineering" | "impact", string>;
  glance: { label: string; text: string }[];
  problem: { paragraphs: string[]; before: string[]; after: string[]; challenge: string };
  tryIntro: string;
  chat: DemoKey;
  chatNote: string;
  howIntro: string;
  pipeline: DemoKey;
  /** Technical terms behind "Explore the engineering", each explained. */
  engineering: Feature[];
  /** The principal engineering stories, each with an optional visual and opt-in detail. */
  stories: { id: string; kicker: string; heading: string; paragraphs: string[]; visuals?: DemoKey[]; details?: Feature[]; detailsLabel?: string }[];
  /** Optional technical archive: one disclosure per group. */
  archive: { label: string; items: Feature[] }[];
  /** Short labelled facts under the outcome. */
  measured: { label: string; value: string; note: string }[];
  reflection: string[];
  /** Related project slugs. */
  related: string[];
};

/** Six-chapter layout for a physical, field-tested project: overview, challenge, how it works, engineering, validation, startup. */
export type FieldStory = {
  headings: Record<"overview" | "challenge" | "how" | "engineering" | "validation" | "startup", string>;
  glance: { label: string; text: string }[];
  /** Each difficulty beside the response the system gives it. */
  challenge: { paragraphs: string[]; pairs: { problem: string; response: string }[] };
  howIntro: string;
  simulator: DemoKey;
  simulatorNote: string;
  engineeringIntro: string;
  /** Same shape as the applied-AI stories: kicker, heading, prose, optional visual and opt-in detail. */
  stories: { id: string; kicker: string; heading: string; paragraphs: string[]; visuals?: DemoKey[]; details?: Feature[]; detailsLabel?: string }[];
  validation: {
    paragraphs: string[];
    /** Labelled facts; `source` says where each comes from. */
    facts: { label: string; value: string; source: string }[];
    feedback: string[];
    /** What was never measured, stated plainly. */
    unmeasured: string[];
    media: PortfolioMedia[];
  };
  startup: {
    paragraphs: string[];
    /** What ran at the event, beside what the startup only proposed. */
    delivered: string[];
    proposed: string[];
    milestones: { when: string; text: string }[];
    media: PortfolioMedia[];
  };
  reflection: string[];
  related: string[];
};

/** Where a capability stands. Only "implemented" may be described as working. */
export type CapabilityStatus = "implemented" | "in-development" | "planned";

/** Five-chapter layout for work in progress: overview, problem, prototype, engineering, what's next. */
export type RdStory = {
  headings: Record<"overview" | "problem" | "prototype" | "engineering" | "next", string>;
  glance: { label: string; text: string }[];
  /** The intended pipeline, each stage with its honest status. Update as work progresses. */
  stages: { name: string; what: string; status: CapabilityStatus }[];
  problem: { paragraphs: string[]; hypothesis: string; caveat: string };
  explorerIntro: string;
  explorer: DemoKey;
  explorerNote: string;
  engineeringIntro: string;
  /** Expandable engineering sections, each with optional named points. */
  sections: { id: string; title: string; paragraphs: string[]; points?: Feature[] }[];
  /** Design commitments, stated as intentions rather than achievements. */
  principles: string[];
  next: { label: string; paragraphs: string[]; diagram: DemoKey; guardrails: string[] };
  related: string[];
};

/* ---------- Projects ---------- */

/** The schematic used for a project: interactive on its page, a still preview on the homepage. */
export type Showcase = "ops-console" | "store-sync" | "ai-chat" | "text-to-sql" | "rag-pipeline" | "risk-matrix" | "detection-frame" | "scantry-kiosk" | "ad-pipeline" | "none";

export type Project = {
  slug: string;
  status: ContentStatus;
  /** Shown as a large editorial feature on the homepage. */
  featured?: boolean;
  title: string;
  /** One sentence: what it is. Also the meta description. */
  summary: string;
  /** Hero line under the title. */
  headline?: string;
  /** Homepage line under the title (falls back to problemLine). */
  homeHeadline?: string;
  /** Up to three engineering highlights for the homepage. */
  highlights?: string[];
  /** Hero facts replacing the default meta rows, e.g. Role, Client industry, Status. */
  facts?: { label: string; value: string }[];
  /** Homepage outcome line when there is no figure. */
  outcomeLine?: Text;
  /** Applied-AI six-chapter layout; see AiStory. */
  aiStory?: AiStory;
  /** Physical-product six-chapter layout; see FieldStory. */
  fieldStory?: FieldStory;
  /** Work-in-progress five-chapter layout; see RdStory. */
  rdStory?: RdStory;
  /** Industry collaborator, e.g. "Intel team". Never implies ownership or endorsement. */
  collaboration?: string;
  /** Present on active, unfinished work: shown as a badge everywhere the project appears. */
  development?: { label: string; stage: string; updated: string };
  /** Call-to-action label on project cards; defaults to "Explore case study". */
  ctaLabel?: string;
  /**
   * The Selected work card: short copy only (aim for 35–55 visible words in
   * headline + summary + proof). Everything else belongs on the case study.
   */
  homeCard?: {
    /** Short name for the showcase's project navigation. */
    label: string;
    category: string;
    headline: string;
    summary: string;
    proof: string;
    /** At most three. */
    tags: string[];
    /** Short disclosure beside a schematic visual; images use their own media label. */
    visualNote?: string;
  };
  /** Disclosure shown with the cover visual when it is a recreation. */
  coverNote?: string;
  /** Plain-language six-chapter layout; see CaseStudyStory. */
  story?: CaseStudyStory;
  /** Longer section headings, keyed by section; the TOC keeps the short name. */
  headings?: Partial<Record<ProjectSectionId, string>>;
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
  workflow?: WorkflowCompare;
  /** A static figure under the problem, e.g. a topology sketch. */
  problemFigure?: DemoKey;
  /** Areas of work owned, rendered under My role. */
  ownership?: Feature[];
  solution?: Text;
  features: Feature[];
  walkthrough?: WalkthroughItem[];
  deepDives?: DeepDive[];
  /** Explanations under the architecture diagram. */
  architectureNotes?: Feature[];
  technologies: Text[];
  architecture?: ArchitectureData;
  /** A bespoke architecture figure, used instead of the generic diagram. */
  architectureFigure?: DemoKey;
  decisions: EngineeringDecision[];
  /** Supporting capabilities, shown compactly after the decisions. */
  capabilities?: Feature[];
  challenges: EngineeringChallenge[];
  outcomes: Outcome[];
  /** Short framing above the outcomes. */
  resultsIntro?: Text[];
  /** Current constraints and planned improvements. */
  nextSteps?: Feature[];
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
