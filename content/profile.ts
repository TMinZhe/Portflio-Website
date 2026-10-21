import type { Profile } from "./types";

/**
 * Edit this file first. Replace each `todo(...)` with real content and each
 * `href: null` with a URL. Nulls render as disabled "pending" controls.
 * Put your résumé at /public/resume.pdf and set links.resume.href to "/resume.pdf".
 */
export const profile: Profile = {
  name: "Tan Min Zhe",
  shortName: "TMZ",
  study: "Computer Science, National University of Singapore",
  positioning: "Software Engineering & AI.",
  intro:
    "I build full-stack applications, AI-powered tools, and enterprise systems that solve real operational problems. Computer Science undergraduate at NUS, with hands-on experience developing risk management applications, inventory systems, and LLM-powered solutions through roles at 8pi BizSolutions and Unistop Tech.",
  email: null,
  location: "Singapore",
  links: {
    github: { label: "GitHub", href: "https://github.com/TMinZhe" },
    linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/in/tanminzhe" },
    resume: { label: "Résumé", href: null },
  },
  siteUrl: "https://example.vercel.app",
};
