/*
 * Illustrative decision policy for the Ad Selection Explorer. The project's
 * real pace estimation and selection rules are still being designed, so this
 * is a concept, not a reproduction of code: pedestrians, estimates, pace
 * values, thresholds and advertisements are all fictional.
 *
 * Policy shown:
 * 1. Only pedestrians slower than the pace threshold count as viewers.
 * 2. Age-range estimates below the confidence floor are treated as unknown.
 * 3. The advertisement whose audience covers the most confident viewers wins.
 * 4. No viewers, or no confident estimates: the neutral fallback plays.
 */

export type AgeBand = "18-24" | "25-34" | "35-44" | "45-54" | "55+";

export type Pedestrian = {
  id: string;
  /** Lane 0–2, top to bottom of the scene. */
  lane: number;
  /** Pixels per second across the frame. Relative only: not a physical speed. */
  pace: number;
  age: AgeBand;
  /** Confidence of the age-range estimate, 0–1. */
  ageConf: number;
  /** Appearance-based estimate; shown for transparency, not used by this policy. */
  presentation: "feminine" | "masculine";
};

export type Ad = {
  id: string;
  brand: string;
  line: string;
  /** Intended audience; empty for the neutral fallback. */
  audience: AgeBand[];
  tone: "lime" | "ice" | "warm" | "neutral";
};

export const PACE_THRESHOLD = 120; // px/s, illustrative
export const CONFIDENCE_FLOOR = 0.6;

export const ADS: Ad[] = [
  { id: "library", brand: "Northpoint Library", line: "Borrow e-books free, any time.", audience: [], tone: "neutral" },
  { id: "trail", brand: "Trailhead Runners", line: "New season trail shoes.", audience: ["18-24", "25-34"], tone: "lime" },
  { id: "brunch", brand: "Level 2 Brunch Club", line: "Weekend brunch, two minutes away.", audience: ["25-34", "35-44"], tone: "warm" },
  { id: "health", brand: "Wellness Week", line: "Free health screening this Saturday.", audience: ["45-54", "55+"], tone: "ice" },
];

export const FALLBACK = ADS[0];

export type ScenarioId = "fast" | "slow" | "mixed";

export const SCENARIOS: { id: ScenarioId; label: string; blurb: string; concept?: boolean; people: Pedestrian[] }[] = [
  {
    id: "fast",
    label: "Fast-moving crowd",
    blurb: "Rush hour: most people move past the screen quickly.",
    people: [
      { id: "P1", lane: 0, pace: 290, age: "25-34", ageConf: 0.82, presentation: "masculine" },
      { id: "P2", lane: 1, pace: 315, age: "18-24", ageConf: 0.74, presentation: "feminine" },
      { id: "P3", lane: 2, pace: 260, age: "35-44", ageConf: 0.69, presentation: "masculine" },
      { id: "P4", lane: 0, pace: 340, age: "25-34", ageConf: 0.77, presentation: "feminine" },
      { id: "P5", lane: 2, pace: 280, age: "45-54", ageConf: 0.64, presentation: "feminine" },
      { id: "P6", lane: 1, pace: 305, age: "25-34", ageConf: 0.71, presentation: "masculine" },
    ],
  },
  {
    id: "slow",
    label: "Slower traffic",
    blurb: "Off-peak: a few people walk slowly past the screen.",
    people: [
      { id: "P1", lane: 0, pace: 70, age: "25-34", ageConf: 0.81, presentation: "feminine" },
      { id: "P2", lane: 1, pace: 85, age: "35-44", ageConf: 0.72, presentation: "masculine" },
      { id: "P3", lane: 2, pace: 60, age: "25-34", ageConf: 0.78, presentation: "masculine" },
    ],
  },
  {
    id: "mixed",
    label: "Mixed crowd",
    blurb: "Some people hurry, others linger, and one estimate is uncertain.",
    concept: true,
    people: [
      { id: "P1", lane: 0, pace: 75, age: "18-24", ageConf: 0.84, presentation: "masculine" },
      { id: "P2", lane: 1, pace: 95, age: "45-54", ageConf: 0.41, presentation: "feminine" },
      { id: "P3", lane: 2, pace: 300, age: "45-54", ageConf: 0.79, presentation: "masculine" },
      { id: "P4", lane: 0, pace: 270, age: "25-34", ageConf: 0.73, presentation: "feminine" },
      { id: "P5", lane: 2, pace: 90, age: "25-34", ageConf: 0.66, presentation: "feminine" },
    ],
  },
];

export const scenario = (id: ScenarioId) => SCENARIOS.find((s) => s.id === id)!;

export const isViewer = (p: Pedestrian) => p.pace < PACE_THRESHOLD;
export const isConfident = (p: Pedestrian) => p.ageConf >= CONFIDENCE_FLOOR;

export type Decision = {
  ad: Ad;
  fallback: boolean;
  viewers: Pedestrian[];
  counted: Pedestrian[];
  /** Confident viewers each advertisement's audience covers. */
  scores: Record<string, number>;
  reason: string;
};

export function decide(people: Pedestrian[]): Decision {
  const viewers = people.filter(isViewer);
  const counted = viewers.filter(isConfident);
  const scores = Object.fromEntries(ADS.map((a) => [a.id, counted.filter((p) => a.audience.includes(p.age)).length]));
  const best = ADS.filter((a) => a.audience.length).sort((a, b) => scores[b.id] - scores[a.id])[0];

  if (viewers.length === 0)
    return { ad: FALLBACK, fallback: true, viewers, counted, scores, reason: "Everyone is moving quickly, so nobody counts as a likely viewer. The neutral fallback plays." };
  if (!best || scores[best.id] === 0)
    return { ad: FALLBACK, fallback: true, viewers, counted, scores, reason: "There are slower pedestrians, but none of their estimates are confident enough to match. The neutral fallback plays." };

  const ignored = viewers.length - counted.length;
  return {
    ad: best,
    fallback: false,
    viewers,
    counted,
    scores,
    reason: `${viewers.length} of ${people.length} pedestrians are moving slowly enough to count as likely viewers${
      ignored ? `; ${ignored} with an uncertain estimate ${ignored === 1 ? "is" : "are"} left out` : ""
    }. The audience for ${best.brand} covers ${scores[best.id]} of the ${counted.length} counted, more than any other advertisement.`,
  };
}
