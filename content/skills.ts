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
      { name: "Large language models", usedIn: ["llm-rag", "unistop"], verified: true },
      { name: "Retrieval-augmented generation", usedIn: ["llm-rag", "unistop"], verified: true },
      { name: "Computer vision", usedIn: ["vision-advertising", "unistop"], verified: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise and business systems",
    skills: [
      { name: "Microsoft Power Apps", usedIn: ["risk-management", "8pi"], verified: true },
      { name: "Inventory and purchasing workflows", usedIn: ["inventory-top-up", "unistop"], verified: true },
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
