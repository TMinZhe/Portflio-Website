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
        title: "Inventory forecasting and replenishment",
        work: "Built the replenishment engine behind forecasting, top-up recommendations and purchase-order generation for 13 retail stores.",
        technologies: ["Node.js", "Express", "MariaDB"],
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
    technologies: ["Node.js", "Express", "MariaDB", "SQL", todo("LLM and computer-vision stack — confirm")],
    lessons: [todo("What was hard about the role, how you approached unfamiliar problems, what you learned")],
    outcomes: [{ kind: "scope", value: "13", label: "retail stores on the replenishment platform" }],
    gallery: [],
  },
  {
    slug: "8pi-bizsolutions",
    status: "draft",
    organisation: "8pi BizSolutions",
    role: "Software Developer",
    start: "2025-12",
    end: "present",
    summary: "Developing enterprise risk management applications and workflow automation.",
    context: todo("One line on 8pi BizSolutions and the GuocoLand engagement"),
    responsibilities: [todo("Your main responsibilities")],
    contributions: [
      {
        title: "Enterprise risk management application",
        work: "Built a Power Apps application for GuocoLand covering risk creation, risk management, risk-officer assignment and an audit trail.",
        technologies: ["Microsoft Power Apps"],
        project: "enterprise-risk-management",
      },
      {
        title: "Workflow automation",
        work: "Automated assignments and notifications with Power Automate.",
        technologies: ["Power Automate"],
        project: "enterprise-risk-management",
      },
      {
        title: "Reporting",
        work: "Developed reporting functionality with Excel VBA.",
        technologies: ["Excel VBA"],
      },
    ],
    technologies: ["Microsoft Power Apps", "Power Automate", "Excel VBA", todo("Data source, e.g. Dataverse or SharePoint — confirm")],
    lessons: [],
    outcomes: [],
    gallery: [],
  },
  {
    slug: "collins-aerospace",
    status: "draft",
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
