"use client";

import { useState } from "react";
import { CircleCheck, CircleDashed, Info } from "lucide-react";
import { useEffects } from "@/lib/hooks/use-effects";
import { ADS, CONFIDENCE_FLOOR, PACE_THRESHOLD, SCENARIOS, decide, isConfident, isViewer, scenario, type ScenarioId } from "./explorer-model";
import { AdCreative, Walkway } from "./ad-parts";

/*
 * Ad Selection Explorer: three fictional scenes and the advertisement an
 * illustrative policy would pick for each. Not connected to a camera or display.
 */

export function AdExplorer() {
  const [id, setId] = useState<ScenarioId>("slow");
  const [details, setDetails] = useState(false);
  const animate = useEffects() === "full";
  const s = scenario(id);
  const d = decide(s.people);

  return (
    <div className="rounded-[var(--r-md)] bg-graphite p-4 sm:p-6">
      <fieldset>
        <legend className="t-meta mb-3">Scene</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {SCENARIOS.map((sc) => (
            <label
              key={sc.id}
              className={`flex min-h-11 cursor-pointer items-center justify-center rounded-[var(--r-sm)] px-3 text-center text-[0.875rem] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--c-focus)] ${
                sc.id === id ? "bg-ice font-medium text-void" : "border border-line-strong text-ink-2 hover:text-ink"
              }`}
            >
              <input type="radio" name="ad-scene" value={sc.id} checked={sc.id === id} onChange={() => setId(sc.id)} className="sr-only" />
              {sc.label}
            </label>
          ))}
        </div>
        <p className="mt-2.5 text-[0.875rem] text-ink-2">{s.blurb}</p>
      </fieldset>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
        <div>
          <Walkway key={id} people={s.people} animate={animate} aspect="aspect-[4/3]" />
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem] text-ink-2">
            <span>Top-down view, fictional</span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-full bg-lime" /> Slow enough to count
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-full bg-ink-3" /> Moving quickly
            </span>
          </p>
          <p className="sr-only">
            {d.viewers.length} of {s.people.length} fictional pedestrians are moving slowly.
          </p>
        </div>

        <figure className="mx-auto w-full max-w-[19rem] lg:max-w-none">
          <div className="rounded-[14px] bg-[#0f1318] p-2 ring-1 ring-line-strong">
            <div className="aspect-[4/5] overflow-hidden rounded-[8px]">
              <AdCreative key={d.ad.id} ad={d.ad} className="animate-[ad-swap_var(--d-slow)_var(--ease-out-expo)]" />
            </div>
          </div>
          <figcaption className="mt-2 flex items-center justify-between gap-3 text-[0.8125rem]">
            <span className="text-ink-2">On screen</span>
            <span className={d.fallback ? "text-ink-2" : "text-lime"}>{d.fallback ? "Fallback advertisement" : "Selected from the library"}</span>
          </figcaption>
        </figure>
      </div>

      <div aria-live="polite" className="mt-5 rounded-[var(--r-sm)] bg-void p-4">
        <p className="t-meta">Why this advertisement</p>
        <p className="mt-1.5 max-w-[62ch] text-[1.0625rem] leading-snug">{d.reason}</p>
        {s.concept && (
          <p className="mt-3 flex gap-2 text-[0.8125rem] text-ink-2">
            <Info size={15} aria-hidden className="mt-0.5 shrink-0 text-ice" />
            How several people combine into one choice hasn&apos;t been designed yet. This is an illustrative decision-policy concept.
          </p>
        )}
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Advertisement library (fictional)">
        {ADS.map((a) => (
          <li key={a.id} className={`rounded-[var(--r-sm)] p-1.5 ${a.id === d.ad.id ? "bg-elevated ring-1 ring-lime/60" : "bg-void"}`}>
            <div className="aspect-[4/3] overflow-hidden rounded-[5px]" aria-hidden>
              <AdCreative ad={a} />
            </div>
            <p className="mt-1.5 px-1 text-[0.8125rem] leading-tight">
              {a.brand}
              {a.id === d.ad.id && <span className="sr-only"> (on screen)</span>}
            </p>
            <p className="px-1 text-[0.75rem] text-ink-2">{a.audience.length ? `Audience ${a.audience.join(", ")}` : "Fallback · everyone"}</p>
          </li>
        ))}
      </ul>

      <button
        type="button"
        aria-expanded={details}
        aria-controls="ad-details"
        onClick={() => setDetails((v) => !v)}
        className="mt-5 inline-flex min-h-11 items-center rounded-[var(--r-sm)] border border-line-strong px-4 text-[0.875rem] hover:border-ink-2"
      >
        {details ? "Hide technical details" : "Explore technical details"}
      </button>

      {details && (
        <div id="ad-details" className="mt-4 space-y-4">
          <div className="overflow-x-auto rounded-[var(--r-sm)] bg-void">
            <table className="w-full min-w-[34rem] text-left text-[0.8125rem] tabular-nums">
              <caption className="sr-only">Fictional per-pedestrian values used by the illustrative policy</caption>
              <thead className="t-meta">
                <tr>
                  {["Person", "Pace (px/s)", "Counts?", "Est. age range", "Confidence", "Est. presentation"].map((h) => (
                    <th key={h} scope="col" className="whitespace-nowrap px-3 py-2 font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.people.map((p) => {
                  const counts = isViewer(p) && isConfident(p);
                  return (
                    <tr key={p.id} className="border-t border-line">
                      <td className="px-3 py-2 font-mono">{p.id}</td>
                      <td className="px-3 py-2">{p.pace}</td>
                      <td className="px-3 py-2">
                        {counts ? (
                          <span className="inline-flex items-center gap-1 text-lime">
                            <CircleCheck size={13} aria-hidden /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-ink-2">
                            <CircleDashed size={13} aria-hidden /> {isViewer(p) ? "Uncertain" : "Too fast"}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">{p.age}</td>
                      <td className={`px-3 py-2 ${isConfident(p) ? "" : "text-[var(--c-warn)]"}`}>{p.ageConf.toFixed(2)}</td>
                      <td className="px-3 py-2 text-ink-2">{p.presentation}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ol className="list-decimal space-y-1.5 pl-5 text-[0.875rem] text-ink-2">
            <li>Only people slower than {PACE_THRESHOLD} px/s count as likely viewers. Pixels per second are relative to this camera view, not a walking speed.</li>
            <li>Age-range estimates below {CONFIDENCE_FLOOR.toFixed(2)} confidence are treated as unknown.</li>
            <li>Each advertisement scores one point per counted viewer in its audience; the highest score plays.</li>
            <li>No counted viewers: the neutral fallback plays. Estimated presentation is shown for transparency and isn&apos;t used.</li>
          </ol>
          <p className="text-[0.8125rem] text-ink-2">
            Scores here: {ADS.filter((a) => a.audience.length).map((a) => `${a.brand} ${d.scores[a.id]}`).join(" · ")}. Every value is fictional, and the real thresholds are still to be designed.
          </p>
        </div>
      )}
    </div>
  );
}
