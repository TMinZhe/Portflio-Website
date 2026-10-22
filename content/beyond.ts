import { todo, type Text } from "./types";

export type BeyondItem = {
  kind: string;
  title: string;
  /** Your role, e.g. "Co-founder" or "President". Not shown until confirmed. */
  role: Text;
  detail?: Text;
  /** Optional link, e.g. a published project page or an external site. */
  href?: string;
};

/** Beyond Code, in display order. */
export const beyond: BeyondItem[] = [
  {
    kind: "Entrepreneurship",
    title: "Scantry",
    role: "Co-founder",
    detail: "QR and facial-verification event access, from a polytechnic project used at WorldSkills ASEAN Singapore 2023 to a pre-seed-funded startup concept.",
    href: "/projects/scantry",
  },
  {
    kind: "Leadership",
    title: "NUS Helix Band",
    role: todo("Your leadership position"),
    detail: todo("One line on what you led"),
  },
  {
    kind: "Leadership",
    title: "Temasek Polytechnic Engineering Peer Mentors Club",
    role: todo("Your leadership position"),
    detail: todo("One line on what you led"),
  },
];
