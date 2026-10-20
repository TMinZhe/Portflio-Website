import { todo, type Profile } from "./types";

/**
 * Edit this file first. Replace each `todo(...)` with real content and each
 * `href: null` with a URL. Nulls render as disabled "pending" controls.
 * Put your résumé at /public/resume.pdf and set links.resume.href to "/resume.pdf".
 */
export const profile: Profile = {
  name: todo("Your Name"),
  shortName: todo("YN"),
  study: "Computer Science, National University of Singapore",
  positioning: "I build software that turns data and code into decisions people actually use.",
  intro: todo(
    "One or two sentences in your own voice: what you are studying, what you build, and what you want to work on next.",
  ),
  email: null,
  location: "Singapore",
  links: {
    github: { label: "GitHub", href: null },
    linkedin: { label: "LinkedIn", href: null },
    resume: { label: "Résumé", href: null },
  },
  siteUrl: "https://example.vercel.app",
};
