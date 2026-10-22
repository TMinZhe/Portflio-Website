import { projectImage } from "../media";
import type { Project } from "../types";

/*
 * Scantry: the case-study content.
 *
 * Sources: the repository audit (Projects Audit/Scantry audit.md, 2026-10-22),
 * the owner's five fortnightly Major Project reflections (Apr–Jul 2023), the
 * Scantry pitch deck, and the owner's confirmations of 2026-10-22:
 * - a Temasek Polytechnic final-year Major Project (2023), team of three, owner
 *   was project lead;
 * - used for meal/dining access at WorldSkills ASEAN Singapore 2023;
 * - the team later received S$10,000 in pre-seed funding (the deck asks for
 *   S$9,000, so the S$10,000 is the owner's report, not the deck's).
 *
 * Event figures come from the deck (9 days, ~800–1,000 people/day, "no
 * queue"). They describe the event, never kiosk scans. No scan counts,
 * accuracy, verification time, uptime or queue measurements exist: never add
 * them. Never call five-frame voting liveness or anti-spoofing, or the
 * embeddings a model we trained. Teammates are described by role until they
 * agree to be named. Never publish face images, encodings, QR credentials,
 * participant data, endpoint names or the audit's security findings.
 * The owner approved all seven images on 2026-10-22 (logos, the team slide and
 * the demonstration photo included); they live in public/images/projects/scantry/.
 */

const SLUG = "scantry";

/** Approved by the owner on 2026-10-22. Set a file back to false to hide it in production. */
const approved = { approved: true } as const;

export const scantry: Project = {
  slug: SLUG,
  status: "published",
  featured: true,
  title: "Scantry",
  category: "Computer Vision · Embedded Systems · Entrepreneurship",
  organisation: "Temasek Polytechnic",
  confidential: false,
  experience: [],
  timeframe: "2023",

  homeCard: {
    label: "Scantry",
    category: "Computer Vision / Entrepreneurship",
    headline: "From final-year prototype to real-world event deployment.",
    summary: "Led a three-person team developing a QR and facial-verification kiosk for WorldSkills ASEAN Singapore 2023, later evolving the project into a funded startup concept.",
    proof: "Real-world event trial; reported S$10,000 pre-seed funding.",
    tags: ["Python", "OpenCV", "Jetson Nano"],
    visualNote: "Illustration · fictional attendee",
  },

  summary:
    "A portable QR and facial-verification kiosk built by a three-person team for event dining access, used at WorldSkills ASEAN Singapore 2023 and later developed into a visitor-management startup concept.",
  headline: "From a final-year prototype to a real-world event deployment.",
  homeHeadline: "From a student prototype to event deployment and a funded startup concept.",
  builtLine:
    "Led a three-person team developing a portable QR and facial-verification kiosk for event dining access at WorldSkills ASEAN Singapore 2023. The project later evolved into Scantry, a visitor-management startup concept that secured a reported S$10,000 in pre-seed funding.",
  highlights: [
    "Team lead of a three-person engineering team.",
    "Used at a real nine-day event for meal access.",
    "Reported S$10,000 pre-seed funding for the team.",
  ],
  outcomeLine: "Deployed at WorldSkills ASEAN Singapore 2023, where the team observed smooth entry without visible queues.",
  coverNote: "Illustration of the kiosk's entry flow, with a fictional attendee. Not a photograph of the deployed system.",
  facts: [
    { label: "Role", value: "Project lead · three-person team" },
    { label: "Origin", value: "Temasek Polytechnic final-year Major Project, 2023" },
    { label: "Used at", value: "WorldSkills ASEAN Singapore 2023 · meal access" },
    { label: "Afterwards", value: "Scantry startup concept · reported S$10,000 pre-seed funding" },
  ],
  technologies: ["Python", "OpenCV", "face_recognition", "NVIDIA Jetson Nano", "Tkinter", "PHP", "MySQL"],

  overview: [
    "Scantry began as our final-year Major Project at Temasek Polytechnic: a self-service kiosk that lets event guests into a meal session by scanning a QR pass and confirming, on camera, that they are the person the pass belongs to.",
    "It ran on NVIDIA Jetson Nano kiosks with a camera and a QR scanner, and the team used it for dining access at WorldSkills ASEAN Singapore 2023. Afterwards we turned it into Scantry, a visitor-management startup concept, and pitched it for pre-seed funding.",
  ],
  role:
    "I led a team of three. I built the kiosk software: the QR-scanner input, the full-screen Tkinter interface and its states, face verification with OpenCV and face_recognition, the image augmentation and matching threshold, and the timing rules on the live camera. I integrated the kiosk with the server a teammate built and maintained, wrote the PHP and SQL attendance charts, and handled testing, debugging and coordination with the organisers. Teammates owned the server and database and the admin web app, and the kiosk's visual design came from our designer.",
  ownership: [
    { name: "Kiosk application", what: "Python and Tkinter: full-screen kiosk, QR-scanner input, and the scan, camera, welcome and rejection screens." },
    { name: "Face verification", what: "OpenCV and face_recognition: enrolment augmentation, distance-based matching, threshold tuning, and the five-frame confirmation with a time limit." },
    { name: "Server integration", what: "Connecting the kiosk to a teammate's server: attendee lookup, meal windows, entry times and outcome logging." },
    { name: "Attendance charts", what: "PHP and SQL: event, date and meal filters, attendance split, arrivals per 15 minutes, and counts by role and date." },
    { name: "Hardware bring-up", what: "Setting up and repairing the Jetson Nano kiosks with the team, and testing them against the server." },
    { name: "Leading the team", what: "Planning and splitting the work, briefing teammates, demonstrating to the organisers and acting on their feedback." },
  ],

  problem: [],
  features: [],

  fieldStory: {
    headings: {
      overview: "We built it for an event. Then we tested it in the real world.",
      challenge: "Getting people through check-in without slowing the event down.",
      how: "See how it works.",
      engineering: "Behind the engineering.",
      validation: "Built for a deadline. Tested with real event attendees.",
      startup: "The project didn't end with the demonstration.",
    },
    glance: [
      { label: "The challenge", text: "Let event guests into meal sessions quickly, while checking that each pass is used by the person it was issued to." },
      { label: "What we built", text: "A portable kiosk: scan a QR pass, look at the camera, get a clear yes or no, and the visit is recorded for organisers." },
      { label: "What happened next", text: "Used for meal access at WorldSkills ASEAN Singapore 2023, then pitched as the Scantry startup concept." },
    ],
    challenge: {
      paragraphs: [
        "At a large multi-day event, guests arrive for meals in waves. A QR pass tells you which registration is in front of you, but not who is holding it, and asking staff to check every face takes time and people.",
        "The kiosk had to be fast enough not to create a queue, clear enough that a guest knows immediately whether they can go in, and useful to organisers afterwards.",
      ],
      pairs: [
        { problem: "Guests arrive at uneven rates, so a slow check quickly becomes a queue.", response: "Self-service kiosks with a bounded check: a decision within about ten seconds at most." },
        { problem: "A QR code identifies a registration, but it can be shared or photographed.", response: "The face on camera must match the person registered to that pass." },
        { problem: "Checking identity by hand takes staff time at every entrance.", response: "The kiosk checks, and staff step in only when it asks a guest to see them." },
        { problem: "A guest needs to know straight away whether they may enter.", response: "Full-screen welcome and rejection screens, each with one clear instruction." },
        { problem: "Organisers need to know who came, and when.", response: "Every outcome is logged and shown on an attendance dashboard." },
      ],
    },
    howIntro:
      "Follow one fictional attendee through the kiosk. Choose a different scenario to see how it handles an invalid pass, a face that doesn't match, or someone coming back for a second meal.",
    simulator: "scantry-access",
    simulatorNote: "Simulation with fictional attendees and passes. No camera is used, and timings are illustrative.",
    engineeringIntro:
      "Four parts made the kiosk work: face verification, the hardware and interface, the connection to the event's records, and three months of iteration. The technical detail is optional.",
    stories: [
      {
        id: "vision",
        kicker: "Computer vision",
        heading: "Checking the face against the pass, not against everyone.",
        paragraphs: [
          "We didn't train a face-recognition network. The kiosk uses face_recognition, a library built on dlib's pretrained model, which turns a face into 128 numbers so that two photos of the same person end up close together.",
          "Each attendee was enrolled from one reference photo, which I expanded into ten varied copies to give the matcher more examples. At the kiosk, the camera's face is compared with the enrolled faces, and it only counts when the closest match is the person registered to the scanned pass. Five matching frames admit the guest; if they don't arrive within about ten seconds, the kiosk sends the guest to staff.",
        ],
        visuals: ["scantry-vision"],
        detailsLabel: "How the matching works",
        details: [
          { name: "Pretrained embeddings", what: "face_recognition (dlib) produces a 128-dimensional encoding per face. No model was trained or fine-tuned for this project." },
          { name: "Enrolment augmentation", what: "Each reference photo becomes ten variants with small random rotation, shift, scale, mirroring, brightness change and blur, and each variant is encoded. Faces that can't be detected are skipped." },
          { name: "Live detection", what: "Faces are detected on a quarter-size copy of the cropped camera frame for speed, then encoded at full size." },
          { name: "Distance threshold", what: "A face matches when its Euclidean distance to the nearest enrolled encoding is at most 0.512, stricter than the library's usual 0.6. I started at 0.6 and tightened it so that unknown people were reported as unknown instead of as the nearest known person." },
          { name: "Claimed identity", what: "A match only counts if it is the attendee the server returned for that pass, so resembling some other guest doesn't help." },
          { name: "Five frames, ten seconds", what: "An early version accepted after two matching frames; the final kiosk needs five, with a prompt to move closer at five seconds and a timeout at about ten." },
          { name: "What it isn't", what: "Five-frame confirmation reduces one-off false matches. It is not liveness or anti-spoofing detection, and accuracy was never formally measured." },
        ],
      },
      {
        id: "hardware",
        kicker: "Hardware and interface",
        heading: "A kiosk, not a laptop demo.",
        paragraphs: [
          "Each kiosk was an NVIDIA Jetson Nano with a camera, a QR scanner and a display, and the team prepared four sets for the event. Getting them to run reliably took real work: re-flashing crashed SD cards, an old Python 3.6 on one board when the code needed 3.11, and OpenCV installs that wouldn't resolve.",
          "The interface is a full-screen Tkinter app. A guest never touches a keyboard: the scanner's input goes into an invisible field, and the screen moves through scan, look at the camera, and a large welcome or rejection. After the organisers saw it, long names were overflowing the welcome screen, so the text now shrinks to fit.",
        ],
        visuals: ["scantry-kiosk"],
        detailsLabel: "Interface and performance detail",
        details: [
          { name: "Hidden input field", what: "In full screen there was nowhere to type, so the scanner writes into an entry box styled to be invisible; the kiosk reads a pass once the whole payload has arrived and clears junk input." },
          { name: "Screen updates", what: "Result screens weren't appearing before the reset to the home screen. Forcing Tk to redraw fixed it, at some cost in speed." },
          { name: "Camera in Tkinter", what: "The live camera feed is drawn into a Tkinter label, frame by frame, with the face box and name overlaid." },
          { name: "Performance", what: "Detecting on a quarter-size crop kept the feed responsive on the Jetson Nano. No frame-rate figures were recorded." },
          { name: "Designs and feedback", what: "Screens were reworked twice: once from our designer's new design, and again after supervisor and organiser feedback." },
        ],
      },
      {
        id: "integration",
        kicker: "System integration",
        heading: "Connecting the kiosk to the event's records.",
        paragraphs: [
          "The kiosk keeps no attendee list of its own. A scan carries only a pass ID and the event; the kiosk asks the server who that is and which meal is being served now, then applies the entry rules and records the outcome. The server and database were built and run by a teammate; I wrote the kiosk's side of every call.",
          "Early on, the plan was a background job that uploaded entries in batches. We switched to writing each entry the moment it happened, which cost me a rewrite but kept the server current and the Jetson Nano lighter. For organisers, I built the attendance dashboard in PHP: pick an event, date and meal, and see who has eaten and when people arrived.",
        ],
        visuals: ["scantry-system"],
        detailsLabel: "Entry rules and data",
        details: [
          { name: "Pass format", what: "The QR code carries a JSON payload with only an ID and the event, so no names are printed in the code." },
          { name: "Meal windows", what: "Meal times are defined on the server; the kiosk finds the window that is open now, so schedules change without updating kiosks." },
          { name: "Dining window", what: "A first scan starts a dining window. Coming back within it means another face check; scanning after it has closed is refused." },
          { name: "Outcome log", what: "Every scan is logged as admitted, over time, face not verified or unknown pass." },
          { name: "Dashboard", what: "Cascading event, date and meal filters; entered versus not entered; arrivals in 15-minute intervals; entries by role and by date." },
          { name: "What isn't here", what: "The server endpoints aren't in the repository that survives, so how the server stored entries and prevented duplicates can't be shown." },
        ],
      },
      {
        id: "iteration",
        kicker: "Iteration",
        heading: "Three months from a QR test to an event.",
        paragraphs: [
          "The kiosk changed shape several times between April and July 2023. The dates below come from my fortnightly project reflections.",
        ],
        visuals: ["scantry-timeline"],
      },
    ],
    validation: {
      paragraphs: [
        "WorldSkills ASEAN Singapore 2023 ran for nine days, and the kiosks handled meal access for the event. The pitch deck we wrote afterwards records about 800 to 1,000 people a day at the event and our observation that there was no queue at all.",
        "Before the event, we demonstrated the system to the organisers. They were satisfied that it was fast and seamless, and asked for one change: long names were being cut off on the welcome screen. Later, the kiosk was tried again at Temasek Polytechnic's Staff Appreciation Day.",
      ],
      facts: [
        { label: "Event duration", value: "9 days", source: "WorldSkills ASEAN Singapore 2023, per the pitch deck." },
        { label: "Event attendance", value: "~800–1,000 / day", source: "Reported for the event as a whole, not counted kiosk scans." },
        { label: "At the dining entrance", value: "No visible queue", source: "The team's own observation, not a measured queue time." },
      ],
      feedback: [
        "Organisers' demonstration, 5 July 2023: they found the kiosk fast and seamless, and asked us to fix long names overflowing the welcome screen.",
        "TP Staff Appreciation Day: a second trial, with about 200 staff attending, according to the pitch deck.",
      ],
      unmeasured: [
        "How many guests the kiosks admitted",
        "Face-verification accuracy or acceptance rate",
        "Average time from scan to decision",
        "Uptime, or queue length over time",
      ],
      media: [
        projectImage(SLUG, "kiosk-home-screen.webp", {
          ...approved,
          alt: "The kiosk's home screen: event and polytechnic logos, a fork icon, and the instruction to scan a QR code to enter.",
          title: "The real kiosk home screen",
          caption: "From my project reflection, June 2023.",
          category: "screenshot",
          aspect: "1471/786",
        }),
        projectImage(SLUG, "deck-real-event-trials.webp", {
          ...approved,
          alt: "Pitch-deck slide titled Tried and Tested, summarising the WorldSkills ASEAN Singapore 2023 and TP Staff Appreciation Day trials.",
          title: "Event trials, as the pitch deck recorded them",
          caption: "Pitch-deck slide, not a photograph.",
          category: "other",
          aspect: "16/9",
        }),
      ],
    },
    startup: {
      paragraphs: [
        "After the event, the team decided to keep going. We gave the project a name, Scantry, and widened the idea from meal access to visitor management for events: pre-registered guests and walk-ins, a portable gantry, and live attendance for organisers.",
        "We built an early MVP in October 2023 and pitched it, asking for S$9,000 to fund hardware and software. The team went on to receive S$10,000 in pre-seed funding. Our co-founder roles split along the same lines as the project: UI and UX design, AI and web development (me), and databases and servers.",
      ],
      delivered: [
        "QR pass scan with face verification at a self-service kiosk",
        "Meal-window and repeat-meal rules",
        "Outcome logging and an attendance dashboard",
        "Used at WorldSkills ASEAN Singapore 2023, then at TP Staff Appreciation Day",
      ],
      proposed: [
        "Online pre-registration, plus walk-in visitors",
        "A portable gantry that opens after verification",
        "Personal e-badges carrying the QR code",
        "Host notifications and a client app for event organisers",
        "A cloud-hosted server",
      ],
      milestones: [
        { when: "Jul 2023", text: "Meal access at WorldSkills ASEAN Singapore 2023" },
        { when: "Later", text: "Second trial at TP Staff Appreciation Day" },
        { when: "Oct 2023", text: "Early Scantry MVP, per the pitch deck" },
        { when: "Pitch", text: "Asked for S$9,000 in pre-seed funding" },
        { when: "Funding", text: "The team received S$10,000 in pre-seed funding (reported)" },
      ],
      media: [
        projectImage(SLUG, "deck-product-intro.webp", {
          ...approved,
          alt: "Pitch-deck title slide: Scantry, a visitor management system using QR codes and facial recognition, beside a clip-art gantry illustration.",
          title: "Product introduction",
          caption: "Pitch-deck slide. The gantry is an illustration, not our hardware.",
          category: "other",
          aspect: "16/9",
        }),
        projectImage(SLUG, "deck-product-demonstration.webp", {
          ...approved,
          alt: "Pitch-deck slide titled Product Demonstration: a person standing at a laptop in a computer lab during a demonstration.",
          title: "Product demonstration",
          caption: "Pitch-deck slide with a photo from a lab demonstration.",
          category: "event",
          aspect: "16/9",
        }),
        projectImage(SLUG, "deck-proposed-visitor-flow.webp", {
          ...approved,
          alt: "Pitch-deck slide titled How It Works: two circular flows for scheduled visits and walk-up visits, from registration to gantry and real-time records.",
          title: "Proposed visitor flow",
          caption: "The startup's proposed flow. Most of it was a plan, not built.",
          category: "diagram",
          aspect: "16/9",
        }),
        projectImage(SLUG, "deck-team.webp", {
          ...approved,
          alt: "Pitch-deck slide titled Our Team, with photos and roles of the three co-founders.",
          title: "The team",
          caption: "The three co-founders, as introduced in the pitch deck.",
          category: "other",
          aspect: "16/9",
        }),
        projectImage(SLUG, "deck-funding-ask.webp", {
          ...approved,
          alt: "Pitch-deck slide asking for S$9,000 in pre-seed funding, split across hardware, software and other costs.",
          title: "The funding pitch",
          caption: "The deck's ask was S$9,000; the team later received S$10,000.",
          category: "other",
          aspect: "16/9",
        }),
      ],
    },
    reflection: [
      "Scantry is where I first led a team on something real people would use, with a fixed date it had to work by.",
      "Leading meant splitting the work clearly, briefing teammates on what each piece had to do, and making calls that cost me time, like rewriting the upload logic early because it was the right design. Integrating software with hardware taught me patience: a lot of those weeks went on Jetson Nanos, not on code.",
      "Showing it to the organisers changed what I thought mattered. They cared that it was fast and that names fit on the screen, not about the threshold I had spent days tuning. And taking it from a school project to a pitch made me think about who would pay for it, and what we could honestly say it had done.",
    ],
    related: ["ai-operations-assistant"],
  },

  decisions: [
    {
      decision: "A pretrained face model instead of training our own",
      basis: "verified",
      reason: "We had one photo per attendee and a few months. Pretrained 128-number encodings meant enrolment in seconds and no training data.",
      tradeoff: "Accuracy depends on lighting and pose, and I noticed it recognised some faces less reliably than others.",
    },
    {
      decision: "Check the face against the pass holder, not the whole gallery",
      basis: "verified",
      reason: "Only the person registered to the scanned pass can be admitted, so a guest who resembles someone else is still rejected.",
      tradeoff: "It still searches the whole gallery for the closest face rather than comparing with that one person directly.",
    },
    {
      decision: "Write each entry immediately instead of uploading in batches",
      basis: "verified",
      reason: "Batches would have loaded the Jetson Nano and the server all at once; writing per entry keeps the server current.",
      tradeoff: "The kiosk depends on the network; there is no offline mode.",
    },
    {
      decision: "Five frames within a time limit",
      basis: "verified",
      reason: "One good frame can be a fluke; requiring five, with a ten-second cap, makes a match more deliberate and bounds the wait.",
      tradeoff: "It adds a few seconds per guest, and it is not a defence against a printed photo.",
    },
  ],
  challenges: [],

  resultsIntro: [],
  outcomes: [],
  nextSteps: [
    { name: "Measure it", what: "No accuracy, throughput or queue figures were recorded; a consented test set and scan-to-decision timings would be first." },
    { name: "Liveness", what: "Five-frame confirmation isn't liveness detection; a printed photo could pass." },
    { name: "Tests and hardening", what: "The project has no automated tests, and the matching code and the PHP web layer have known defects I would fix before any reuse." },
    { name: "Model updates", what: "Rebuilding the enrolment file automatically each night was started but never finished." },
  ],
  lessons: [],

  showcase: "scantry-kiosk",
  gallery: [],
  links: { demo: null, repo: null },
};
