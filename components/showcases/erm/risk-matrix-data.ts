/*
 * Synthetic data for the risk-matrix demo. Fictional risks and positions only;
 * nothing here comes from the client's register.
 */

export type Quarter = "Q1 2026" | "Q2 2026" | "Q3 2026" | "Q4 2026";
export const QUARTERS: Quarter[] = ["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026"];

export type DemoRisk = { id: string; name: string };
export type Position = { likelihood: number; impact: number };

export const RISKS: DemoRisk[] = [
  { id: "SR-01", name: "Supplier delay" },
  { id: "SR-02", name: "Data loss" },
  { id: "SR-03", name: "Key-person dependency" },
  { id: "SR-04", name: "Regulatory change" },
  { id: "SR-05", name: "Cost overrun" },
  { id: "SR-06", name: "System outage" },
  // Contains characters that must be escaped in SVG markup (step 9).
  { id: "SR-07", name: "R&D milestone <phase 2> slip" },
  { id: "SR-08", name: "Vendor lock-in" },
];

/** likelihood and impact, 1–5, per quarter. */
export const POSITIONS: Record<Quarter, Record<string, Position>> = {
  "Q1 2026": {
    "SR-01": { likelihood: 2, impact: 2 },
    "SR-02": { likelihood: 2, impact: 4 },
    "SR-03": { likelihood: 3, impact: 3 },
    "SR-04": { likelihood: 2, impact: 3 },
    "SR-05": { likelihood: 3, impact: 2 },
    "SR-06": { likelihood: 1, impact: 4 },
    "SR-07": { likelihood: 2, impact: 3 },
    "SR-08": { likelihood: 1, impact: 2 },
  },
  "Q2 2026": {
    "SR-01": { likelihood: 4, impact: 2 },
    "SR-02": { likelihood: 2, impact: 4 },
    "SR-03": { likelihood: 3, impact: 3 },
    "SR-04": { likelihood: 2, impact: 3 },
    "SR-05": { likelihood: 3, impact: 3 },
    "SR-06": { likelihood: 1, impact: 4 },
    "SR-07": { likelihood: 2, impact: 3 },
    "SR-08": { likelihood: 1, impact: 2 },
  },
  "Q3 2026": {
    "SR-01": { likelihood: 3, impact: 2 },
    "SR-02": { likelihood: 2, impact: 4 },
    "SR-03": { likelihood: 2, impact: 3 },
    "SR-04": { likelihood: 2, impact: 3 },
    "SR-05": { likelihood: 3, impact: 3 },
    "SR-06": { likelihood: 2, impact: 5 },
    "SR-07": { likelihood: 2, impact: 3 },
    "SR-08": { likelihood: 1, impact: 2 },
  },
  "Q4 2026": {
    "SR-01": { likelihood: 2, impact: 2 },
    "SR-02": { likelihood: 1, impact: 4 },
    "SR-03": { likelihood: 2, impact: 3 },
    "SR-04": { likelihood: 4, impact: 4 },
    "SR-05": { likelihood: 2, impact: 3 },
    "SR-06": { likelihood: 2, impact: 5 },
    "SR-07": { likelihood: 2, impact: 3 },
    "SR-08": { likelihood: 1, impact: 2 },
  },
};

export const LIKELIHOOD_LABELS = ["Remote", "Unlikely", "Possible", "Likely", "Almost certain"];
export const IMPACT_LABELS = ["Insignificant", "Minor", "Moderate", "Major", "Severe"];
