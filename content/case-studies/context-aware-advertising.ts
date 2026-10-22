import type { Project } from "../types";

/*
 * Context-Aware Digital Advertising: an R&D project in progress.
 *
 * Sources: the owner's brief and answers of 2026-10-22:
 * - developed at Unistop Tech in collaboration with the Intel team;
 * - the owner develops the computer-vision and advertising side themself;
 * - walking-pace estimation and ad selection are at the design stage: no code
 *   exists yet, so nothing about them may be described as working;
 * - it is unrelated to the kiosk's demographic pipeline in Unistopapp_Deployment
 *   (a colleague's work): never borrow its models, OpenVINO or its features here.
 *
 * Never claim: deployment at a station, live passengers, engagement or sales
 * uplift, accuracy, identification of individuals, real-world speeds (m/s),
 * Intel ownership or endorsement, specific Intel contributions, or Intel
 * hardware. No technologies are listed until the owner confirms them. Every
 * visual is synthetic and labelled. Update `stages` and `development.updated`
 * as work progresses.
 */

export const contextAwareAdvertising: Project = {
  slug: "context-aware-advertising",
  status: "published",
  title: "Context-Aware Digital Advertising",
  category: "Computer Vision · Applied AI · R&D",
  organisation: "Unistop Tech",
  collaboration: "Intel team",
  development: { label: "In development", stage: "Applied AI R&D", updated: "October 2026" },
  confidential: true,
  experience: ["unistop-tech"],
  timeframe: "2026 – present",
  ctaLabel: "Explore R&D project",

  summary:
    "A computer-vision system in development at Unistop Tech, in collaboration with the Intel team, that would let a digital sign choose its advertisement from how people are moving past it and their estimated audience characteristics.",
  headline: "Digital signage that responds to pedestrian movement.",
  homeHeadline: "Digital signage that responds to pedestrian movement.",
  builtLine:
    "Developing a computer-vision advertising system at Unistop Tech in collaboration with the Intel team. It is designed to analyse pedestrian movement and estimated audience characteristics, then select advertisements from a predefined library.",
  coverNote: "Concept illustration with fictional pedestrians and advertisements. Not a camera feed or a deployed screen.",
  facts: [
    { label: "Role", value: "AI Engineer · developing the vision and ad-selection system" },
    { label: "Built at", value: "Unistop Tech" },
    { label: "Industry collaboration", value: "Intel team" },
    { label: "Status", value: "In development · applied AI R&D" },
    { label: "Last updated", value: "October 2026" },
  ],
  technologies: [],

  overview: [
    "At Unistop Tech, I'm developing a system that lets a digital advertising screen respond to the people walking past it. A camera watches pedestrian traffic; the system estimates how quickly people are moving and their likely audience characteristics, then picks a suitable advertisement from an existing library.",
    "It's developed at Unistop Tech in collaboration with the Intel team, and it's unfinished: I'm building the computer-vision side now, while walking-pace estimation and ad selection are still being designed. This page shows where it stands and where it's heading.",
  ],
  role: "I develop the computer-vision and advertising side of the project myself, at Unistop Tech, in collaboration with the Intel team.",

  problem: [],
  features: [],

  rdStory: {
    headings: {
      overview: "Making digital signage responsive to its surroundings.",
      problem: "Most digital advertisements don't adapt to who's passing by.",
      prototype: "From pedestrian movement to advertisement selection.",
      engineering: "Engineering behind the prototype.",
      next: "Beyond selecting ads: toward AI-assisted creative composition.",
    },
    glance: [
      { label: "The idea", text: "A screen that shows the advertisement most likely to suit the people walking past it right now." },
      { label: "My part", text: "Developing the computer-vision and advertising side, at Unistop Tech with the Intel team." },
      { label: "Where it stands", text: "In development. Vision is being built; pace estimation and ad selection are being designed." },
    ],
    stages: [
      { name: "Detect people", what: "Find pedestrians in the camera's view.", status: "in-development" },
      { name: "Estimate audience", what: "Appearance-based estimates of age range and gender presentation.", status: "in-development" },
      { name: "Measure walking pace", what: "How fast each person moves across the frame.", status: "planned" },
      { name: "Select an advertisement", what: "Choose from a predefined library, with a fallback.", status: "planned" },
      { name: "Show it on signage", what: "Switch the creative on the display.", status: "planned" },
    ],
    problem: {
      paragraphs: [
        "Digital displays usually play content on a schedule or a fixed campaign loop. The same advertisement runs whether the space in front of it is empty, packed with commuters rushing to a train, or full of people waiting.",
        "This project explores letting the screen take its surroundings into account: how people are moving past it, and the estimated make-up of the audience, so that the choice of advertisement fits the moment better.",
      ],
      hypothesis:
        "Someone hurrying past has little chance to notice a screen, while someone walking slowly may have time to take it in. So walking pace is a useful signal for when an advertisement has a real chance of being seen.",
      caveat: "That is a design hypothesis, not a measured result. Not everyone who walks slowly will look at the screen, and the project has no engagement or sales figures.",
    },
    explorerIntro:
      "Choose a scene to see which advertisement the intended design would pick, and why. The pedestrians, estimates and advertisements are all made up, and the selection rules are an illustration of the design, not finished code.",
    explorer: "ad-explorer",
    explorerNote: "Concept demonstration: fictional pedestrians, estimates and advertisements. Not connected to a camera or a display.",
    engineeringIntro:
      "These are the engineering problems the project has to solve. Most are open: they describe what is being worked out, not what has been finished.",
    sections: [
      {
        id: "vision",
        title: "Computer-vision pipeline",
        paragraphs: [
          "The planned pipeline finds the people in each camera frame, follows them from frame to frame, estimates their age range and gender presentation, measures how they move, and passes that to the selection rules. I'm building the vision stages now; no accuracy figures exist yet.",
        ],
        points: [
          { name: "Estimates, not facts", what: "Age range and gender presentation are guesses from appearance. They are never treated as someone's actual age or gender." },
          { name: "Low confidence", what: "When an estimate is uncertain, the design treats it as unknown rather than forcing a category." },
          { name: "No identification", what: "The system is meant to describe passing traffic, not to recognise who anyone is." },
        ],
      },
      {
        id: "pace",
        title: "Walking-pace estimation",
        paragraphs: [
          "The camera only sees pixels. A person's movement between frames depends on how far they are from the camera and the angle they cross it at, so pixel speed is not walking speed.",
          "Until the camera is calibrated, the system can only compare people's pace relative to each other in the same view, and it won't report speeds in metres per second.",
        ],
        points: [
          { name: "Pixel displacement", what: "The starting signal: how far a tracked person moves across the image per second." },
          { name: "Perspective", what: "People far from the camera appear to move more slowly than people close to it." },
          { name: "Calibration", what: "Mapping image positions to real floor distances would allow physical speed. It is not built yet." },
          { name: "Thresholds", what: "What counts as “slow enough” has to be tuned on authorised footage from the real setting." },
        ],
      },
      {
        id: "selection",
        title: "Advertisement selection",
        paragraphs: [
          "The selection policy is still being designed. The explorer above shows one illustrative version; these are the questions the real design has to answer.",
        ],
        points: [
          { name: "Eligibility", what: "Which pedestrians count as a viewing opportunity, and how slow is slow enough." },
          { name: "Several people", what: "How to combine many pedestrians with different paces and estimates into one choice." },
          { name: "Default creative", what: "What plays when nobody qualifies or the estimates are too uncertain." },
          { name: "Switching", what: "How often the screen may change, so it doesn't flicker between advertisements as people come and go." },
        ],
      },
      {
        id: "collaboration",
        title: "Intel collaboration",
        paragraphs: ["The project is developed at Unistop Tech in collaboration with the Intel team. It is Unistop's project; it isn't an Intel product."],
      },
      {
        id: "challenges",
        title: "Open challenges",
        paragraphs: ["None of these are solved yet."],
        points: [
          { name: "Camera placement", what: "Finding a view that sees enough of the walkway without capturing more than it needs to." },
          { name: "Crowds", what: "Detecting and following people reliably when they overlap or pass behind each other." },
          { name: "Pace", what: "Turning pixel movement into a pace signal that is comparable across the frame." },
          { name: "Uncertainty", what: "Appearance-based estimates vary with lighting, angle and distance, and can be wrong for some groups more than others." },
          { name: "Real-time", what: "Keeping the whole pipeline fast enough for the screen to react while people are still in front of it." },
          { name: "Privacy", what: "Meeting the privacy requirements of a public space before any real footage is used." },
        ],
      },
    ],
    principles: [
      "Use synthetic or consented imagery during development and in anything published.",
      "Don't store identifiable face images; keep only what the decision needs, for as short a time as possible.",
      "Prefer aggregate movement and traffic signals over individual profiles.",
      "Fall back to a neutral advertisement whenever the estimates are uncertain.",
      "Avoid sensitive, discriminatory or intrusive targeting.",
      "Review camera permissions and the applicable privacy requirements before any deployment.",
    ],
    next: {
      label: "Future concept · not yet implemented",
      paragraphs: [
        "Today's design picks from complete, predefined advertisements. A later milestone could go further: instead of choosing a finished advertisement, an AI component would assemble one from brand-approved parts (product images, backgrounds, copy, typography and layout templates) to suit the aggregated traffic in front of the screen.",
        "None of this exists yet. It is where the project could head once selection works.",
      ],
      diagram: "ad-composition",
      guardrails: [
        "Only brand-approved assets and templates",
        "Brand guidelines checked before anything is shown",
        "Content review, with a human in the loop",
        "Fallback to predefined advertisements",
        "No sensitive or inappropriate targeting",
        "Aggregated traffic signals where possible",
      ],
    },
    related: ["ai-operations-assistant"],
  },

  decisions: [],
  challenges: [],
  outcomes: [],
  lessons: [],

  showcase: "ad-pipeline",
  gallery: [],
  links: { demo: null, repo: null },
};
