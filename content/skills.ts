import type { SkillDomain } from "./types";

/**
 * Only list skills you can point to evidence for. `usedIn` links a skill to
 * project slugs or experience ids. `verified: false` renders as pending.
 */
export const skillDomains: SkillDomain[] = [
  {
    id: "ai",
    name: "AI and machine learning",
    skills: [
      { name: "Large language models", usedIn: ["llm-rag", "nl-analytics-assistant", "unistop-tech"], verified: true },
      { name: "Retrieval-augmented generation", usedIn: ["llm-rag", "unistop-tech"], verified: true },
      { name: "Computer vision", usedIn: ["vision-advertising", "unistop-tech"], verified: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise and business systems",
    skills: [
      { name: "Microsoft Power Apps", usedIn: ["enterprise-risk-management", "8pi-bizsolutions"], verified: true },
      { name: "Inventory and purchasing workflows", usedIn: ["inventory-replenishment", "unistop-tech"], verified: true },
    ],
  },
  {
    id: "data",
    name: "Data and BI",
    skills: [{ name: "Power BI", usedIn: [], verified: false }],
  },
  {
    id: "frontend",
    name: "Frontend",
    skills: [
      // Evidence: this site's own source code.
      { name: "TypeScript", usedIn: ["this-site"], verified: true },
      { name: "React and Next.js", usedIn: ["this-site"], verified: true },
      { name: "Three.js / React Three Fiber", usedIn: ["this-site"], verified: true },
      { name: "GSAP", usedIn: ["this-site"], verified: true },
    ],
  },
];
