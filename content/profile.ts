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
    "I build production software and applied AI systems, from retail operations and enterprise workflows to self-hosted language-model applications.",
  email: "minzhetan@gmail.com",
  location: "Singapore",
  links: {
    github: { label: "GitHub", href: "https://github.com/TMinZhe" },
    linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/in/tanminzhe" },
    resume: { label: "Résumé", href: null },
  },
  siteUrl: "https://example.vercel.app",
};
