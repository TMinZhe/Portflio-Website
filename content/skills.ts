import type { SkillDomain } from "./types";

/**
 * The Technical Toolkit. Only list skills you can point to evidence for:
 * `usedIn` holds project or experience slugs (or "this-site" for this
 * portfolio's own code). `verified: false` keeps a skill off the page.
 */
export const skillDomains: SkillDomain[] = [
  {
    id: "languages",
    name: "Languages",
    skills: [
      { name: "Python", usedIn: ["collins-aerospace"], verified: true },
      { name: "SQL", usedIn: ["nl-analytics-assistant", "unistop-tech", "collins-aerospace"], verified: true },
      { name: "TypeScript", usedIn: ["this-site"], verified: true },
      { name: "JavaScript", usedIn: ["inventory-replenishment", "unistop-tech"], verified: true },
    ],
  },
  {
    id: "backend",
    name: "Backend",
    skills: [
      { name: "Node.js", usedIn: ["inventory-replenishment", "unistop-tech"], verified: true },
      { name: "Express", usedIn: ["inventory-replenishment", "unistop-tech"], verified: true },
    ],
  },
  {
    id: "data",
    name: "Databases",
    skills: [{ name: "MySQL", usedIn: ["inventory-replenishment", "unistop-tech"], verified: true }],
  },
  {
    id: "ai",
    name: "AI and ML",
    skills: [
      { name: "Self-hosted LLMs", usedIn: ["nl-analytics-assistant", "unistop-tech"], verified: true },
      { name: "Text-to-SQL", usedIn: ["nl-analytics-assistant", "unistop-tech"], verified: true },
      { name: "Retrieval-augmented generation", usedIn: ["llm-rag", "unistop-tech"], verified: true },
      { name: "Computer vision", usedIn: ["vision-advertising", "unistop-tech"], verified: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise automation",
    skills: [
      { name: "Microsoft Power Apps", usedIn: ["enterprise-risk-management", "8pi-bizsolutions"], verified: true },
      { name: "Power Fx", usedIn: ["enterprise-risk-management", "8pi-bizsolutions"], verified: true },
      { name: "SharePoint", usedIn: ["enterprise-risk-management", "8pi-bizsolutions"], verified: true },
      // Not verified by the ERM audit: the reminder flow's deployment is unconfirmed.
      { name: "Power Automate", usedIn: [], verified: false },
      { name: "Excel VBA", usedIn: ["enterprise-risk-management", "8pi-bizsolutions"], verified: true },
      { name: "Outlook automation", usedIn: ["collins-aerospace"], verified: true },
      { name: "Power BI", usedIn: ["enterprise-risk-management", "8pi-bizsolutions"], verified: true },
    ],
  },
  {
    id: "frontend",
    name: "Frontend",
    skills: [
      // Evidence: this site's own source code, and the inventory platform's React/Vite frontend.
      { name: "React and Next.js", usedIn: ["inventory-replenishment", "this-site"], verified: true },
      { name: "Tailwind CSS", usedIn: ["inventory-replenishment", "this-site"], verified: true },
      { name: "Three.js / React Three Fiber", usedIn: ["this-site"], verified: true },
      { name: "GSAP", usedIn: ["this-site"], verified: true },
    ],
  },
];
