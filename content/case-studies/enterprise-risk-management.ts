import type { PortfolioMedia, Project } from "../types";
import { projectImage } from "../media";

/*
 * Enterprise Risk Management Platform: the case-study content.
 *
 * Confidentiality: the client is never named. Use "a corporate client" or
 * "a real-estate client" in copy, alt text, captions and file names.
 *
 * Sources: owner-confirmed facts and the technical audit summary in the owner's
 * brief. Anything that needs the full audit report is left out, not guessed.
 * Screenshots are sanitized copies (originals stay in the git-ignored
 * "Project Screenshots" folder). All four were approved by the owner.
 */

const SLUG = "enterprise-risk-management";

// Approved by the owner on 2026-10-21 after review of the sanitized copies.
const shot = (file: string, aspect: string, meta: Omit<PortfolioMedia, "id" | "src" | "type" | "category" | "approved" | "aspect">): PortfolioMedia =>
  projectImage(SLUG, file, { ...meta, category: "screenshot", approved: true, aspect });

const riskRegister = shot("risk-register-matrix.webp", "1592/820", {
  alt: "Risk register table beside a five-by-five likelihood and impact matrix, with dashed markers and arrows showing risks that moved since last quarter",
  title: "Risk register and matrix",
  caption: "Real application screen. Risk names, financial and score totals, and rating thresholds are redacted.",
});

export const enterpriseRiskManagement: Project = {
  slug: SLUG,
  status: "published",
  featured: true,
  title: "Enterprise Risk Management Platform",
  category: "Enterprise Software / Workflow Automation",
  organisation: "8pi BizSolutions",
  client: "a corporate client in real estate",
  confidential: true,
  experience: ["8pi-bizsolutions"],

  summary:
    "I independently developed and deployed an enterprise risk management application that centralizes risk records, coordinates multi-stage reviews, tracks changes, and supports structured reporting.",
  headline: "Engineering a structured risk-management workflow from a spreadsheet-driven process.",
  homeHeadline: "From spreadsheet-based risk tracking to a centralized review platform.",
  builtLine:
    "Independently developed and deployed a Microsoft Power Apps application for a corporate client, replacing spreadsheet-and-email coordination with centralized risk tracking, review workflows, delegated responsibilities and historical records.",
  highlights: [
    "Multi-stage approvals and delegation workflows.",
    "Field-level audit trails and quarterly snapshots.",
    "Custom risk-matrix visualization with historical movement indicators.",
  ],
  outcomeLine: "Deployed to a corporate client, reducing manual review coordination.",
  facts: [
    { label: "Role", value: "Sole developer" },
    { label: "Built at", value: "8pi BizSolutions" },
    { label: "Client", value: "Real-estate company" },
    { label: "Status", value: "Deployed to the client" },
  ],
  technologies: ["Power Apps", "Power Fx", "SharePoint", "Office 365 Outlook", "Power BI", "Excel VBA"],

  headings: {
    problem: "When risk management depends on spreadsheets and email.",
    role: "End-to-end ownership of the application.",
    solution: "One place for risks, reviews and their history.",
    walkthrough: "A closer look at the system.",
    architecture: "Engineering within Microsoft Power Platform constraints.",
    decisions: "Decisions and their trade-offs.",
    results: "From manual coordination to a deployed workflow.",
    "next-steps": "Current constraints and next steps.",
    lessons: "What building this system taught me.",
  },

  overview: [],
  problem: [
    "The client managed enterprise risks in a single Excel spreadsheet. The ERM administrator maintained the risk information by hand, emailed risk officers one by one to request updates, followed up repeatedly, coordinated review and approval, and consolidated the results for reporting.",
    "Coordination lived in the spreadsheet and the administrator's inbox, and the review process had little structure of its own.",
  ],
  workflow: {
    before: ["Excel risk register", "Manual email requests", "Officer updates", "Repeated follow-ups", "Consolidated review"],
    after: ["Centralized risk records", "Review release and assignments", "Officer updates", "Tiered sign-offs", "History and reporting"],
    note: "Illustrative reconstruction of the process, not a client document.",
  },

  role: "I was the sole developer: I designed and built the application and delivered it to the client. The work covered every layer the system has.",
  ownership: [
    { name: "Interfaces and Power Fx logic", what: "About 11 screens with role-specific views for administrators and risk officers, and the business rules behind them." },
    { name: "Data model on SharePoint", what: "Risks, controls, sign-offs and history across 19 SharePoint lists, related to one another in app logic." },
    { name: "Risk workflows", what: "Registering and scoring risks, assigning responsible officers, and tracking controls and mitigation." },
    { name: "Approvals and delegation", what: "Multi-stage sign-off, and delegation of control mitigations with due dates and reminders." },
    { name: "Change tracking and history", what: "Field-level change events and one snapshot per risk per quarter." },
    { name: "Risk visualization", what: "A likelihood × impact matrix generated as SVG in Power Fx." },
    { name: "Notifications", what: "Review releases and reminders sent from the app through the Office 365 Outlook connector." },
    { name: "Reporting", what: "A Power BI semantic model with DAX measures and Power Query, and Excel/VBA reports including a risk-matrix view and grouped controls." },
  ],

  solution:
    "A Microsoft Power Apps canvas app replaces the spreadsheet with structured records and review workflows. The administrator releases reviews to officers with due dates, officers update their controls in the app, sign-offs move through defined stages, and edits to risks and controls leave a field-level trace.",
  features: [
    { name: "Risk register and scoring", what: "Register and manage risks, scored on likelihood and impact." },
    { name: "Responsible officers", what: "Assign officers to risks and controls." },
    { name: "Controls and mitigation", what: "Track the controls and mitigation measures for each risk." },
    { name: "Delegation", what: "Officers delegate control mitigations and track them to completion." },
    { name: "Multi-stage approvals", what: "Reviews pass through defined sign-off stages." },
    { name: "Deadlines and notifications", what: "Review releases carry due dates; reminders go out by email from the app." },
    { name: "Audit trail and quarterly history", what: "Field-level changes are recorded, and each quarter's state is kept." },
    { name: "Reporting", what: "Power BI and Excel/VBA reports draw on the same data." },
  ],

  walkthrough: [
    {
      media: riskRegister,
      title: "Risk register and matrix",
      does: "Lists each risk with its likelihood, impact and residual score beside a five-by-five matrix, filterable by quarter.",
      why: "The administrator sees current exposure, and which risks moved since last quarter, on one screen.",
      engineering: "The matrix is SVG generated in Power Fx: dashed markers show a risk's previous position and arrows show the move.",
    },
    {
      media: shot("controls-mitigation.webp", "1594/822", {
        alt: "A risk's description and consequences above its controls, grouped, with control frequency, the risk owner's assessment, actions and the assigned officer",
        title: "Controls and mitigation",
        caption: "Real application screen with test data. The officer's email is replaced with a fictional address.",
      }),
      title: "Controls and mitigation",
      does: "Shows a risk's description and consequences, then its controls in groups with frequency, the risk owner's assessment and the assigned officer.",
      why: "Officers update controls in one structured place instead of replying to email.",
      engineering: "Controls can be searched, sorted and grouped, and the ERM administrator can be re-notified from the same screen.",
    },
    {
      media: shot("review-release.webp", "1417/807", {
        alt: "Release review dialog: risk officers selected on the left, a due date and release queue on the right, and an optional message for the email",
        title: "Release a review",
        caption: "Real application screen with test officers. The loaded-officer count is redacted.",
      }),
      title: "Releasing a review",
      does: "The administrator selects risk officers, sets their due dates and releases the review, with an optional message added to the email.",
      why: "One release step replaces individual emails to each officer.",
      engineering: "Each officer's current status is shown before release; emails go out through the Office 365 Outlook connector.",
    },
    {
      media: shot("delegation-tracker.webp", "1419/809", {
        alt: "Delegation tracker with counts of open, overdue, unacknowledged, in-progress and completed delegations, and overdue items with a Remind button",
        title: "Delegation tracker",
        caption: "Real application screen. A person's name, emails and risk names are replaced or removed.",
      }),
      title: "Delegation and reminders",
      does: "Tracks control mitigations that officers have delegated: who holds them, when they are due and which are overdue.",
      why: "Following up becomes a filter and a Remind button rather than a search through email.",
      engineering: "Reminders can go to one item or to every overdue item at once.",
    },
  ],

  deepDives: [
    {
      id: "approvals",
      label: "Multi-stage approvals",
      heading: "Modelling approvals as a state-driven workflow.",
      intro: [
        "Facilities reviews pass through three roles. The building manager reviews the controls for their building, the director completes the final review, and the ERM administrator sees the status roll up across buildings.",
        "The app doesn't store each workflow status as a field anyone can overwrite. It derives the current state from the history of sign-off events, so a director's review only becomes possible once the manager's sign-off for that building exists.",
        "The real workflow also applies sign-off validity windows and handles buildings that are self-managed. The demo leaves those rules out.",
      ],
      demo: "signoff-workflow",
      limitations: [
        "Planned next: tie each sign-off event to an explicit review cycle, and confirm signers through Microsoft 365 single sign-on.",
      ],
    },
    {
      id: "traceability",
      label: "Audit trail and history",
      heading: "Designing for traceability over time.",
      intro: [
        "When a risk or control is edited, the app compares the old and new values field by field and records a change event for each difference, with the previous and updated values. Nine control fields are compared on every edit. Deletions are soft deletes.",
        "Each risk keeps one snapshot per quarter, and past quarters open as read-only views. Values for older risks are backfilled lazily rather than migrated up front.",
      ],
      demo: "audit-timeline",
      limitations: ["Not every action is logged: creating a record is not logged at field level."],
    },
    {
      id: "matrix",
      label: "Custom risk matrix",
      heading: "Building a risk visualization in Power Fx.",
      intro: [
        "The risk matrix isn't a chart control. It's an SVG document generated by a Power Fx formula, which gives full control over how several risks share a cell and how movement between quarters is drawn.",
      ],
      demo: "risk-matrix",
      steps: {
        title: "How the matrix is drawn",
        items: [
          "Place each risk by its likelihood and impact.",
          "Group the risks that land in the same cell.",
          "Give each risk in a cell its own slot.",
          "Look up each risk's position in the previous quarter.",
          "Draw a dashed ghost marker where a risk used to be.",
          "Work out which way it moved.",
          "Draw an arrow from the old position to the new one.",
          "Trim the arrow so it starts and ends at the marker edges.",
          "Escape any user-entered text before it goes into the SVG.",
        ],
      },
    },
  ],

  architecture: {
    nodes: [
      { id: "app", label: "Canvas app", kind: "client", tech: "Power Apps · Power Fx", col: 1, row: 2 },
      { id: "lists", label: "SharePoint Online lists", kind: "data", tech: "19 lists", col: 2, row: 2 },
      { id: "mail", label: "Email", kind: "external", tech: "Office 365 Outlook connector", col: 2, row: 1 },
      { id: "pbi", label: "Power BI reports", kind: "output", tech: "Semantic model · DAX · Power Query", col: 3, row: 2 },
      { id: "vba", label: "Excel reports", kind: "output", tech: "VBA", col: 3, row: 3 },
    ],
    edges: [
      { from: "app", to: "lists" },
      { from: "app", to: "mail" },
      { from: "lists", to: "pbi" },
      { from: "lists", to: "vba" },
    ],
    note: "Simplified. The app reads and writes SharePoint directly; the reports read SharePoint separately. There is no custom backend API or transactional database.",
  },
  architectureNotes: [
    { name: "Business logic in the client", what: "Workflow rules, validation and derived state run in Power Fx inside the canvas app." },
    { name: "Persistence", what: "Records live in SharePoint Online lists; relationships across lists are maintained by the app, not by the database." },
    { name: "Read models", what: "Derived data and summaries are precomputed into local collections so screens don't repeat the same lookups." },
    { name: "Change events", what: "Field-level changes and sign-off events are stored in a change-log list." },
    { name: "Notifications", what: "Emails are sent from the app through the Office 365 Outlook connector." },
    { name: "Reporting", what: "Power BI and Excel/VBA read the same SharePoint data for reports." },
  ],

  decisions: [
    {
      decision: "SharePoint lists instead of Dataverse",
      basis: "verified",
      reason: "Microsoft 365 licensing constraints shaped the choice of data store.",
      tradeoff: "SharePoint doesn't enforce relational integrity or support transactions across lists, and large queries have to stay within delegation limits.",
    },
    {
      decision: "Derive workflow state from sign-off events",
      basis: "inferred",
      reason: "A history of sign-off events records who signed off and when, and the current state can be computed from it instead of trusted from a mutable status field.",
      tradeoff: "The change log also carries other events, so the sign-off history shares an overloaded log.",
    },
    {
      decision: "One snapshot per risk per quarter",
      basis: "inferred",
      reason: "Quarter-over-quarter comparison, including the matrix's movement arrows, becomes a lookup of two snapshots.",
      tradeoff: "Changes within a quarter overwrite that quarter's snapshot, so intermediate states aren't kept.",
    },
    {
      decision: "Generate the matrix as SVG",
      basis: "inferred",
      reason: "Full control over marker layout within a cell and over how movement is drawn.",
      tradeoff: "The rendering lives in one long Power Fx formula that is harder to read and maintain.",
    },
    {
      decision: "Precompute into local collections",
      basis: "inferred",
      reason: "Summaries computed once avoid repeated lookups across lists.",
      tradeoff: "The collections have to be refreshed carefully to stay in sync with SharePoint.",
    },
  ],
  // TODO challenges: add only those confirmed by the audit report (problem → approach → result).
  challenges: [],

  resultsIntro: [
    "The application is deployed to the client. Risk records, officer updates, sign-offs and their history now live in one structured system instead of a spreadsheet and an inbox, which reduces the need for manual follow-up.",
  ],
  outcomes: [
    { kind: "capability", label: "Deployed to the client" },
    { kind: "capability", label: "One centralized risk register in place of a spreadsheet" },
    { kind: "capability", label: "Reviews released, tracked and signed off in the app" },
    { kind: "capability", label: "Field-level history and a quarterly snapshot for each risk" },
  ],
  nextSteps: [
    { name: "Single sign-on", what: "Move sign-in to Microsoft 365 single sign-on and tighten access control at the data layer." },
    { name: "Safer multi-list writes", what: "SharePoint has no transactions across lists, so a related set of writes can partly succeed." },
    { name: "Delegation limits", what: "Keep heavier queries within SharePoint's delegation limits as the data grows." },
    { name: "Automated testing", what: "Automated test coverage is limited." },
  ],
  lessons: [
    "Turning an administrator's spreadsheet-and-email routine into explicit records, assignments and approval steps meant deciding what the system should know, not just what it should show.",
    "Working inside Power Platform and SharePoint made every data-model choice a trade-off between what the licence allowed and what integrity required.",
    "Designing for traceability from the start, with field changes and quarterly snapshots, was easier than adding history later.",
  ],

  showcase: "risk-matrix",
  cover: riskRegister,
  gallery: [],
  links: { demo: null, repo: null },
};
