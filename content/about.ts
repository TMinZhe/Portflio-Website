import { todo, type Text } from "./types";

/**
 * About section, one paragraph per entry. Only confirmed facts are written
 * out; anything that needs your own words is a todo() and is not shown until
 * you replace it.
 */
export const about: { paragraphs: Text[] } = {
  paragraphs: [
    "I studied Computer Engineering at Temasek Polytechnic, and I'm now reading Computer Science at the National University of Singapore.",
    "My engineering work has crossed quite different industries: quality inspection and inventory workflows at Collins Aerospace, enterprise risk management for a real-estate client at 8pi BizSolutions, and retail inventory and applied AI at Unistop Tech.",
    todo("What draws you to this kind of work, in your own words"),
    todo("What you want to work on next"),
  ],
};
