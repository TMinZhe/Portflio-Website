import { todo, type Project } from "./types";
import { enterpriseRiskManagement } from "./case-studies/enterprise-risk-management";
import { inventoryPlatform } from "./case-studies/inventory-platform";
import { aiOperationsAssistant } from "./case-studies/ai-operations-assistant";
import { scantry } from "./case-studies/scantry";
import { contextAwareAdvertising } from "./case-studies/context-aware-advertising";

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
  aiOperationsAssistant,
  enterpriseRiskManagement,
  scantry,
  contextAwareAdvertising,
  {
    ...empty,
    slug: "llm-rag",
    // Hidden until a RAG implementation is verified; none was found in the Unistop code.
    status: "hidden",
    title: "LLM application with retrieval",
    summary: "Language-model features grounded in an organisation's own documents through retrieval.",
    category: "Applied AI",
    organisation: "Unistop Tech",
    confidential: true,
    experience: ["unistop-tech"],
    // Open question: separate from the AI Operations Assistant, which is not RAG.
    role: todo("Your role and scope"),
    technologies: [todo("Model, embedding, vector store and framework — confirm")],
    showcase: "rag-pipeline",
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
