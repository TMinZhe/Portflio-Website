import { todo, type Text } from "./types";

/**
 * About section, one paragraph per entry. Only confirmed facts are written
 * out; anything that needs your own words is a todo() and is not shown until
 * you replace it.
 */
export const about: { paragraphs: Text[] } = {
  paragraphs: [
    "Most of what I've built has had to work for people outside a classroom: a kiosk at a nine-day international event, a platform a chain of stores runs on, an assistant staff ask every day.",
    "It started at Temasek Polytechnic, where I studied Computer Engineering and led the three-person team behind Scantry, a QR and face-verification kiosk used for meal access at WorldSkills ASEAN Singapore 2023. Since then the work has moved into software businesses run on: quality inspection and inventory workflows at Collins Aerospace, a risk-management platform for a corporate client at 8pi BizSolutions, and retail operations and applied AI at Unistop Tech.",
    "Those projects taught me that the hard part is usually around the clever bit: stores that go offline, the checks around a language model, a name that doesn't fit on a kiosk screen. I'm now reading Computer Science at the National University of Singapore.",
    todo("What draws you to this kind of work, in your own words"),
    todo("What you want to work on next"),
  ],
};
