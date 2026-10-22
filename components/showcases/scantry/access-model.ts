/*
 * The kiosk's entry rules, reduced to four fictional scenarios. It follows the
 * real flow (scan → lookup and meal window → face check → decision → log) but
 * not the original server's behaviour, timings or data. Every attendee, pass
 * and record is made up.
 */

export type ScenarioId = "approved" | "invalid" | "mismatch" | "repeat";

export type Outcome = "admitted" | "unknown-pass" | "face-not-verified" | "over-time";

/** What one frame of the five-frame check saw. */
export type Frame = "match" | "other" | "none";

export type Scenario = {
  id: ScenarioId;
  label: string;
  /** One line under the scenario picker. */
  blurb: string;
  pass: string;
  attendee: { name: string; role: string } | null;
  /** The earlier dining window, for a returning guest. */
  earlier?: { scanned: string; closed: string };
  /** Frames the camera reports, in order; null when the face check is skipped. */
  frames: Frame[] | null;
  /** Simulated seconds the face check takes. */
  seconds: number;
  outcome: Outcome;
};

export const MEAL = { name: "Lunch", opens: "11:30", closes: "14:00" } as const;
export const NOW = "12:42";
export const EVENT = "Demo Expo 2023";

/** Five matching frames admit; about ten seconds without them sends the guest to staff. */
export const VOTES_NEEDED = 5;
export const TIMEOUT_S = 10;

export const SCENARIOS: Scenario[] = [
  {
    id: "approved",
    label: "First visit",
    blurb: "A registered guest arrives for lunch for the first time today.",
    pass: "D-0142",
    attendee: { name: "Priya Raman", role: "Competitor" },
    frames: ["none", "match", "match", "match", "match", "match"],
    seconds: 2.4,
    outcome: "admitted",
  },
  {
    id: "invalid",
    label: "Invalid pass",
    blurb: "Someone scans a code the event has no record of.",
    pass: "D-9917",
    attendee: null,
    frames: null,
    seconds: 0,
    outcome: "unknown-pass",
  },
  {
    id: "mismatch",
    label: "Face mismatch",
    blurb: "A real pass, but the person holding it isn't the one registered.",
    pass: "D-0208",
    attendee: { name: "Marcus Lim", role: "Expert" },
    frames: ["none", "other", "other", "none", "other", "other", "other", "none", "other", "other", "other", "other"],
    seconds: TIMEOUT_S,
    outcome: "face-not-verified",
  },
  {
    id: "repeat",
    label: "Second lunch",
    blurb: "A guest who already ate comes back after their dining window closed.",
    pass: "D-0077",
    attendee: { name: "Aisha Rahman", role: "Volunteer" },
    earlier: { scanned: "11:41", closed: "12:26" },
    frames: null,
    seconds: 0,
    outcome: "over-time",
  },
];

export const scenario = (id: ScenarioId) => SCENARIOS.find((s) => s.id === id)!;

/** Running vote count after each frame, capped at the number needed. */
export function votes(frames: Frame[]) {
  let n = 0;
  return frames.map((f) => (n = Math.min(VOTES_NEEDED, n + (f === "match" ? 1 : 0))));
}

export const verified = (frames: Frame[] | null) => !!frames && votes(frames).at(-1) === VOTES_NEEDED;

/** The kiosk screen a guest sees at the end, and the log code organisers see. */
export const RESULT: Record<Outcome, { title: string; line: string; log: string; ok: boolean }> = {
  admitted: { title: "Welcome!", line: "Enjoy your lunch.", log: "Admitted", ok: true },
  "unknown-pass": { title: "Invalid code", line: "Please approach a staff member for help.", log: "Unknown pass", ok: false },
  "face-not-verified": { title: "We couldn't verify you", line: "Please approach a staff member for help.", log: "Face not verified", ok: false },
  "over-time": { title: "You've had lunch today", line: "Your dining window has closed.", log: "Over time", ok: false },
};

/** Plain-English reason for the decision in step 4. */
export function reason(s: Scenario): string {
  switch (s.outcome) {
    case "admitted":
      return `The pass is registered, lunch is being served, this is ${s.attendee!.name.split(" ")[0]}'s first lunch scan, and the face matched the pass holder in ${VOTES_NEEDED} frames.`;
    case "unknown-pass":
      return "The server has no attendee for this pass, so there is nobody to compare a face with. The kiosk stops and sends the guest to staff.";
    case "face-not-verified":
      return `The pass is real, but the face on camera never matched ${s.attendee!.name}. After ${TIMEOUT_S} seconds without ${VOTES_NEEDED} matches, the kiosk gives up and sends the guest to staff.`;
    case "over-time":
      return `${s.attendee!.name.split(" ")[0]} first scanned in at ${s.earlier!.scanned}, which opened a dining window that closed at ${s.earlier!.closed}. Scanning again after it closed is refused, without a face check.`;
  }
}

/** Earlier rows in the fictional attendance log. */
export const LOG_HISTORY = [
  { time: "11:41", pass: "D-0077", name: "Aisha Rahman", result: "Admitted" },
  { time: "12:38", pass: "D-0391", name: "Daniel Koh", result: "Admitted" },
  { time: "12:39", pass: "D-0516", name: "Siti Nur", result: "Admitted" },
] as const;
