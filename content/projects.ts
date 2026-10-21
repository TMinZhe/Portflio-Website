import { todo, type Project } from "./types";
import { enterpriseRiskManagement } from "./case-studies/enterprise-risk-management";
import { inventoryPlatform } from "./case-studies/inventory-platform";

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
  inventoryPlatform,
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
