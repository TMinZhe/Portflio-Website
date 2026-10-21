import type { ReactNode } from "react";
import type { EngineeringChallenge, EngineeringDecision, Feature, Outcome } from "@/content/types";
import { known } from "@/lib/content";

/*
 * Structured section bodies. Each takes content that may still hold todo()
 * placeholders and renders only the confirmed parts.
 */

export const confirmedFeatures = (list: Feature[]) => list.filter((f) => known(f.what));
export const confirmedDecisions = (list: EngineeringDecision[]) => list.filter((d) => known(d.reason));
export const confirmedChallenges = (list: EngineeringChallenge[]) => list.filter((c) => known(c.approach));
export const confirmedOutcomes = (list: Outcome[]) => list.filter((o) => known(o.label));

export function FeatureList({ features }: { features: Feature[] }) {
  return (
    <ol className="border-b border-line">
      {features.map((f) => (
        <li key={f.name} data-reveal className="grid gap-x-8 gap-y-2 border-t border-line py-5 md:grid-cols-[minmax(0,15rem)_1fr]">
          <h3 className="text-[1.0625rem] font-medium">{f.name}</h3>
          <div className="max-w-[56ch] space-y-1">
            <p>{f.what as string}</p>
            {known(f.why) && <p className="text-ink-2">{f.why}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Native details/summary: expandable without script, keyboard and screen-reader friendly. */
export function Disclosure({ summary, children, open }: { summary: ReactNode; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-t border-line">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-3 text-[1.0625rem] font-medium [&::-webkit-details-marker]:hidden">
        {summary}
        <span aria-hidden className="text-[1.25rem] text-ink-2 transition-transform duration-[var(--d-fast)] group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="pb-6">{children}</div>
    </details>
  );
}

function Steps({ steps }: { steps: { label: string; value: string }[] }) {
  return (
    <dl className="grid gap-x-8 gap-y-4 md:grid-cols-[8rem_1fr]">
      {steps.map((s) => (
        <div key={s.label} className="contents">
          <dt className="t-meta pt-0.5">{s.label}</dt>
          <dd className="max-w-[56ch]">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DecisionList({ decisions }: { decisions: EngineeringDecision[] }) {
  return (
    <div className="border-b border-line">
      {decisions.map((d, i) => (
        <Disclosure key={d.decision} summary={d.decision} open={i === 0}>
          <Steps
            steps={[
              { label: "Reason", value: d.reason as string },
              ...(known(d.tradeoff) ? [{ label: "Trade-off", value: d.tradeoff }] : []),
              ...(known(d.result) ? [{ label: "Result", value: d.result }] : []),
            ]}
          />
        </Disclosure>
      ))}
    </div>
  );
}

export function ChallengeList({ challenges }: { challenges: EngineeringChallenge[] }) {
  return (
    <div className="border-b border-line">
      {challenges.map((c, i) => (
        <Disclosure key={c.challenge} summary={c.challenge} open={i === 0}>
          <Steps
            steps={[
              { label: "Approach", value: c.approach as string },
              ...(known(c.outcome) ? [{ label: "Outcome", value: c.outcome }] : []),
            ]}
          />
        </Disclosure>
      ))}
    </div>
  );
}

const kindLabel: Record<Outcome["kind"], string> = {
  scope: "Scope",
  capability: "Capability",
  measured: "Measured result",
};

/** Scope and capabilities are kept visibly apart from measured impact. */
export function OutcomeList({ outcomes }: { outcomes: Outcome[] }) {
  const measured = outcomes.some((o) => o.kind === "measured");
  return (
    <div>
      <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
        {outcomes.map((o, i) => (
          <li key={i} data-reveal className="border-t border-line pt-4">
            <p className="t-meta">{kindLabel[o.kind]}</p>
            {o.value && (
              <p className="mt-3 font-display text-[clamp(2.75rem,2rem+3vw,4.5rem)] leading-none tracking-[var(--track-display)]">
                {o.value}
              </p>
            )}
            <p className={o.value ? "mt-2 text-ink" : "mt-3 text-[1.125rem] text-ink"}>{o.label as string}</p>
          </li>
        ))}
      </ul>
      {!measured && (
        <p className="mt-8 max-w-[56ch] text-[0.9375rem] text-ink-2">
          These describe what the system covers and does. Measured impact will be added once it has been measured.
        </p>
      )}
    </div>
  );
}
