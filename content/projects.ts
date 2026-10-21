import { todo, type Project } from "./types";
import { enterpriseRiskManagement } from "./case-studies/enterprise-risk-management";

/**
 * Order here is the order everywhere (homepage, prev/next links).
 * status: "published" = public; "draft" = only visible in `next dev`;
 * "hidden" = not shown anywhere. Unknown facts stay as todo() and are
 * simply not rendered — never fill them with guesses.
 */

/** Fields every project starts with; override what you know. */
const empty = {
  overview: [],
  problem: [],
  features: [],
  decisions: [],
  challenges: [],
  outcomes: [],
  lessons: [],
  gallery: [],
  links: { demo: null, repo: null },
} satisfies Partial<Project>;

export const projects: Project[] = [
  {
    ...empty,
    slug: "inventory-replenishment",
    status: "published",
    featured: true,
    title: "Inventory Replenishment Platform",
    summary: "A replenishment engine for inventory forecasting, stock recommendations and purchase-order generation across 13 retail stores.",
    category: "Operations software",
    organisation: "Unistop Tech",
    confidential: true,
    experience: ["unistop-tech"],
    timeframe: todo("When you built it, e.g. May 2026 – present"),
    role: todo("Your role and scope: built it alone or in a team, and which parts were yours"),
    problemLine: todo("The problem in one sentence: what went wrong with ordering before"),
    builtLine:
      "Built a replenishment engine using Node.js, Express and MariaDB for inventory forecasting, stock recommendations and purchase-order generation across 13 retail stores.",
    overview: [
      "The platform watches stock across 13 retail stores, forecasts inventory, recommends top-ups and turns those recommendations into purchase orders.",
      todo("Who uses it day to day, and what they did before it existed"),
    ],
    problem: [
      todo("The original ordering workflow and its limits"),
      todo("Why it mattered: stockouts, overstock, staff time"),
      todo("Constraints: data quality, store differences, supplier rules"),
    ],
    features: [
      { name: "Inventory forecasting", what: "Forecasts inventory for the stores the platform covers.", why: todo("Why forecasting mattered here") },
      { name: "Store-wide stock monitoring", what: "Tracks stock levels across all 13 stores in one place.", why: todo("Why one view mattered") },
      { name: "Top-up recommendations", what: "Recommends which products each store should restock.", why: todo("How recommendations changed the ordering decision") },
      { name: "Purchase-order generation", what: "Turns recommendations into purchase orders.", why: todo("What this replaced") },
    ],
    technologies: ["Node.js", "Express", "MariaDB"],
    architecture: {
      nodes: [
        { id: "db", label: "Inventory database", kind: "data", tech: "MariaDB", col: 1, row: 2 },
        { id: "engine", label: "Replenishment engine", kind: "service", tech: "Node.js · Express", col: 2, row: 2 },
        { id: "forecast", label: "Forecasts", kind: "output", col: 3, row: 1 },
        { id: "recs", label: "Top-up recommendations", kind: "output", col: 3, row: 2 },
        { id: "po", label: "Purchase orders", kind: "output", col: 3, row: 3 },
      ],
      edges: [
        { from: "db", to: "engine" },
        { from: "engine", to: "forecast" },
        { from: "engine", to: "recs" },
        { from: "recs", to: "po" },
      ],
      note: "Confirmed components only. Hosting, integrations and the user interface are not shown.",
    },
    // TODO decisions: how recommendations are calculated and why; how forecasts handle gaps in sales data.
    // TODO challenges: real difficulties, as challenge → approach → outcome.
    outcomes: [
      { kind: "scope", value: "13", label: "retail stores covered" },
      { kind: "capability", label: "Stock recommendations turn into purchase orders" },
    ],
    lessons: [todo("What you learned building it, and what you would change")],
    showcase: "ops-console",
  },
  {
    ...empty,
    slug: "nl-analytics-assistant",
    status: "published",
    featured: true,
    title: "Natural-Language Analytics Assistant",
    summary: "A self-hosted LLM application that turns natural-language questions into SQL and explains the results.",
    category: "Applied AI",
    organisation: "Unistop Tech",
    confidential: true,
    experience: ["unistop-tech"],
    role: todo("Your role and scope"),
    builtLine:
      "Developed a self-hosted LLM application that translates natural-language questions into SQL queries and explains results using sales and inventory records.",
    problemLine: todo("The question users needed answered and why they couldn't before"),
    overview: [
      "A self-hosted LLM application for asking questions about sales and inventory in plain language. It translates each question into a SQL query and explains the results.",
      todo("Who uses it, and what they did before it existed"),
    ],
    features: [
      { name: "Plain-language questions", what: "People ask about sales and inventory in their own words instead of writing SQL." },
      { name: "Text-to-SQL", what: "Each question is translated into a SQL query over the sales and inventory records." },
      { name: "Explained results", what: "The results come back with an explanation, not just a table." },
      { name: "Self-hosted model", what: "The language model runs self-hosted.", why: todo("Why self-hosting: data privacy, cost, control") },
    ],
    // TODO decisions: how generated SQL is kept safe (read-only access, validation), model choice.
    technologies: ["SQL", todo("Model, serving stack and framework — confirm")],
    showcase: "text-to-sql",
  },
  enterpriseRiskManagement,
  {
    ...empty,
    slug: "vision-advertising",
    status: "draft",
    title: "Computer Vision for Advertising",
    summary: "Computer vision applications built for an advertising use case.",
    category: "Computer vision",
    organisation: "Unistop Tech",
    confidential: true,
    experience: ["unistop-tech"],
    role: todo("Your role and scope"),
    technologies: [todo("Models and libraries — confirm")],
    showcase: "detection-frame",
  },
  {
    ...empty,
    slug: "llm-rag",
    status: "draft",
    title: "LLM application with retrieval",
    summary: "Language-model features grounded in an organisation's own documents through retrieval.",
    category: "Applied AI",
    organisation: "Unistop Tech",
    confidential: true,
    experience: ["unistop-tech"],
    // Open question: is this the same work as the Natural-Language Analytics Assistant?
    role: todo("Your role and scope"),
    technologies: [todo("Model, embedding, vector store and framework — confirm")],
    showcase: "rag-pipeline",
  },
  {
    ...empty,
    slug: "scantry",
    status: "draft",
    title: "Scantry",
    summary: "Automated event access.",
    category: "Event access",
    organisation: null,
    confidential: false,
    experience: [],
    role: todo("Your role and scope"),
    technologies: [],
    showcase: "none",
  },
  {
    ...empty,
    slug: "client-engagement-chatbot",
    status: "hidden",
    title: "AI-Powered Client Engagement Chatbot",
    summary: "Details to be confirmed.",
    category: "Applied AI",
    organisation: null,
    confidential: false,
    experience: [],
    role: todo("Role"),
    technologies: [],
    showcase: "none",
  },
  {
    ...empty,
    slug: "hhn-iot-experience",
    status: "hidden",
    title: "Halloween Horror Nights IoT Experience",
    summary: "Details to be confirmed.",
    category: "IoT",
    organisation: null,
    confidential: false,
    experience: [],
    role: todo("Role"),
    technologies: [],
    showcase: "none",
  },
];
