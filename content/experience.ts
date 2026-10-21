import { todo, type Experience } from "./types";

/**
 * Newest first. Contributions are limited to what the owner has described.
 * Which projects came from a role is stored on the project (`experience`),
 * not here. Unknown facts stay as todo() and are not rendered.
 */
export const experience: Experience[] = [
  {
    slug: "unistop-tech",
    status: "published",
    organisation: "Unistop Tech Pte. Ltd.",
    role: "AI Engineer",
    start: "2026-05",
    end: "present",
    summary: "Developing inventory management and applied AI solutions for retail operations.",
    context: todo("What Unistop Tech does, at a high level, and which team you joined"),
    responsibilities: [todo("Your main responsibilities, one outcome-oriented line each")],
    contributions: [
      {
        title: "Inventory & Retail Operations Platform",
        work: "Developed the majority of the production platform that runs warehouse stock, replenishment, purchasing and reporting for 13 automated stores, including its statistical forecast and offline-tolerant store delivery.",
        technologies: ["React", "Node.js", "Express", "MySQL"],
        project: "inventory-replenishment",
      },
      {
        title: "Natural-language analytics",
        work: "Developed a self-hosted LLM application that answers natural-language questions by writing SQL against sales and inventory records, then explains the results.",
        technologies: ["SQL"],
        project: "nl-analytics-assistant",
      },
      {
        title: "Retrieval-augmented LLM features",
        work: "Built LLM applications with retrieval-augmented generation (RAG).",
        project: "llm-rag",
      },
      {
        title: "Computer vision for advertising",
        work: "Worked on computer vision applications for advertising.",
        project: "vision-advertising",
      },
    ],
    technologies: ["React", "Node.js", "Express", "MySQL", "SQL", todo("LLM and computer-vision stack — confirm")],
    lessons: [todo("What was hard about the role, how you approached unfamiliar problems, what you learned")],
    outcomes: [{ kind: "scope", value: "13", label: "automated stores operated from the inventory platform" }],
    gallery: [],
  },
  {
    slug: "8pi-bizsolutions",
    status: "published",
    organisation: "8pi BizSolutions",
    role: "Software Developer",
    start: "2025-12",
    end: "present",
    summary: "Developing enterprise risk management applications and workflow automation.",
    context: todo("One line on 8pi BizSolutions and the client engagement"),
    responsibilities: [todo("Your main responsibilities")],
    contributions: [
      {
        title: "Enterprise Risk Management Platform",
        work: "Sole developer of a Power Apps application for a corporate client in real estate: risk register and scoring, controls and mitigation, delegation, multi-stage approvals, field-level audit trail and quarterly history.",
        technologies: ["Power Apps", "Power Fx", "SharePoint"],
        project: "enterprise-risk-management",
      },
      {
        title: "Review notifications",
        work: "Review releases and reminders sent from the app through the Office 365 Outlook connector.",
        technologies: ["Office 365 Outlook"],
        project: "enterprise-risk-management",
      },
      {
        title: "Reporting",
        work: "Risk reporting with a Power BI semantic model (DAX, Power Query) and Excel/VBA reports.",
        technologies: ["Power BI", "Excel VBA"],
      },
    ],
    technologies: ["Power Apps", "Power Fx", "SharePoint", "Office 365 Outlook", "Power BI", "Excel VBA"],
    lessons: [],
    outcomes: [],
    gallery: [],
  },
  {
    slug: "collins-aerospace",
    status: "published",
    organisation: "Collins Aerospace",
    role: "Quality Intern",
    start: "2023-06",
    end: "2023-12",
    summary: "Developed software to improve quality inspection and inventory workflows.",
    context: todo("Which site and team, and what the quality function does"),
    responsibilities: [],
    contributions: [
      {
        title: "Inspection monitoring",
        work: "Built quality-inspection monitoring with Python and SQL.",
        technologies: ["Python", "SQL"],
      },
      {
        title: "Inventory automation",
        work: "Automated an inventory workflow integrated with Outlook.",
        technologies: ["Outlook"],
      },
      {
        title: "Paper workflow digitisation",
        work: "Digitised paper-based workflows.",
      },
    ],
    technologies: ["Python", "SQL", "Outlook"],
    lessons: [],
    outcomes: [],
    gallery: [],
  },
];
