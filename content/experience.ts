import { todo, type Experience } from "./types";

/** Newest first. Contributions are limited to what the owner has described. */
export const experience: Experience[] = [
  {
    id: "unistop",
    organisation: "Unistop Tech",
    role: "Intern",
    start: "2026-05",
    end: "present",
    context: todo("One line on what Unistop Tech does and which team you joined."),
    contributions: [
      "Built LLM applications with retrieval-augmented generation (RAG).",
      "Developed an inventory management system with stock top-up recommendations, purchase order generation and store-wide monitoring.",
      "Worked on computer vision applications for advertising.",
    ],
    technologies: [todo("Languages, frameworks and services used")],
    challenges: [todo("A technical problem you had to solve, and how")],
    outcomes: [todo("Verified outcomes only, e.g. adopted by which team")],
  },
  {
    id: "8pi",
    organisation: "8pi BizSolutions",
    role: "Intern",
    start: "2025-12",
    end: "present",
    context: todo("One line on 8pi BizSolutions and the client engagement."),
    contributions: [
      "Developed an enterprise risk management solution for GuocoLand on Microsoft Power Apps.",
      "Worked on risk creation, risk management, assignment of risk officers and audit trail functionality.",
    ],
    technologies: ["Microsoft Power Apps", todo("Data source, e.g. Dataverse or SharePoint — confirm")],
    challenges: [todo("A technical problem you had to solve, and how")],
    outcomes: [todo("Verified outcomes only")],
  },
];
