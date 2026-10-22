"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CircleCheck, CircleX, RotateCcw } from "lucide-react";
import {
  EVENT,
  LOG_HISTORY,
  MEAL,
  NOW,
  RESULT,
  SCENARIOS,
  TIMEOUT_S,
  VOTES_NEEDED,
  reason,
  scenario,
  verified,
  votes,
  type Frame,
  type Scenario,
  type ScenarioId,
} from "./access-model";
import { KioskDevice, KioskScreen, PseudoQr, Silhouette } from "./kiosk-parts";

/*
 * Guided walk through the kiosk's five stages for one fictional attendee. No
 * camera is requested: the face check is drawn, frame by frame, from the
 * scenario's scripted results.
 */

const STEPS = [
  { key: "scan", title: "Scan a QR code", short: "Scan" },
  { key: "lookup", title: "Check registration and meal", short: "Check" },
  { key: "face", title: "Verify the attendee's face", short: "Face" },
  { key: "decide", title: "Decide whether to admit", short: "Decide" },
  { key: "record", title: "Record the outcome", short: "Record" },
] as const;

const reducedMotion = () => typeof window !== "undefined" && document.documentElement.dataset.effects === "reduced";

/** Plays the scripted frames one at a time; shows the end state at once with reduced motion. */
function useFramePlayback(frames: Frame[] | null, active: boolean, run: number) {
  const [shown, setShown] = useState(0);
  const total = frames?.length ?? 0;
  useEffect(() => {
    if (!active || !total) return;
    if (reducedMotion()) {
      const t = window.setTimeout(() => setShown(total), 0);
      return () => window.clearTimeout(t);
    }
    let n = 0;
    const tick = () => setShown(++n);
    const t0 = window.setTimeout(() => setShown(0), 0);
    const id = window.setInterval(() => {
      tick();
      if (n >= total) window.clearInterval(id);
    }, 380);
    return () => {
      window.clearTimeout(t0);
      window.clearInterval(id);
    };
  }, [active, total, run]);
  return active ? Math.min(shown, total) : 0;
}

export function AccessSimulator() {
  const [id, setId] = useState<ScenarioId>("approved");
  const [i, setI] = useState(0);
  const [run, setRun] = useState(0);
  const s = scenario(id);
  const step = STEPS[i];
  const done = i === STEPS.length - 1;
  const shown = useFramePlayback(s.frames, step.key === "face", run);

  return (
    <div className="rounded-[var(--r-md)] bg-graphite p-4 sm:p-6">
      <fieldset>
        <legend className="t-meta mb-3">Scenario</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SCENARIOS.map((sc) => (
            <label
              key={sc.id}
              className={`flex min-h-11 cursor-pointer items-center justify-center rounded-[var(--r-sm)] px-3 text-center text-[0.875rem] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--c-focus)] ${
                sc.id === id ? "bg-ice font-medium text-void" : "border border-line-strong text-ink-2 hover:text-ink"
              }`}
            >
              <input
                type="radio"
                name="scantry-scenario"
                value={sc.id}
                checked={sc.id === id}
                onChange={() => {
                  setId(sc.id);
                  setRun((r) => r + 1);
                }}
                className="sr-only"
              />
              {sc.label}
              {sc.id === "approved" && <span className="sr-only"> (default)</span>}
            </label>
          ))}
        </div>
        <p className="mt-2.5 text-[0.875rem] text-ink-2">{s.blurb}</p>
      </fieldset>

      <ol className="mt-5 grid grid-cols-5 gap-1.5" aria-label="Kiosk steps">
        {STEPS.map((st, n) => (
          <li key={st.key}>
            <button
              type="button"
              onClick={() => setI(n)}
              aria-current={n === i ? "step" : undefined}
              aria-label={`Step ${n + 1}: ${st.title}`}
              className={`flex min-h-11 w-full flex-col items-center justify-center rounded-[var(--r-xs)] px-1 text-[0.75rem] leading-tight transition-colors ${
                n === i ? "bg-lime font-medium text-[var(--c-lime-ink)]" : n < i ? "bg-elevated" : "border border-line-strong text-ink-2 hover:text-ink"
              }`}
            >
              <span>{n + 1}</span>
              <span className="hidden sm:block">{st.short}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-start">
        <div aria-live="polite">
          <p className="t-meta">
            Step {i + 1} of {STEPS.length}
          </p>
          <h4 className="mt-1 text-[1.25rem] font-medium leading-snug">{step.title}</h4>
          <div className="mt-4">
            <Behind s={s} stepKey={step.key} shown={shown} onReplay={() => setRun((r) => r + 1)} />
          </div>
        </div>
        <div>
          <KioskDevice label="What the guest sees">
            <Screen s={s} stepKey={step.key} shown={shown} />
          </KioskDevice>
        </div>
      </div>

      {done && (
        <p className="mt-6 flex items-start gap-2 rounded-[var(--r-sm)] border border-lime/50 px-4 py-3 font-medium text-lime">
          <Check size={18} aria-hidden className="mt-0.5 shrink-0" /> The QR pass says which registration it is. The face says it&apos;s the right person. The kiosk admits only when both agree.
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setI((n) => Math.max(0, n - 1))}
          disabled={i === 0}
          className="inline-flex min-h-11 items-center gap-2 rounded-[var(--r-sm)] border border-line-strong px-4 text-[0.875rem] hover:border-ink-2 disabled:opacity-40"
        >
          <ArrowLeft size={15} aria-hidden /> Back
        </button>
        {!done ? (
          <button
            type="button"
            onClick={() => setI((n) => n + 1)}
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--r-sm)] bg-lime px-5 text-[0.875rem] font-medium text-[var(--c-lime-ink)]"
          >
            Next <ArrowRight size={15} aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setI(0);
              setRun((r) => r + 1);
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--r-sm)] bg-lime px-5 text-[0.875rem] font-medium text-[var(--c-lime-ink)]"
          >
            <RotateCcw size={15} aria-hidden /> Restart
          </button>
        )}
      </div>
    </div>
  );
}

type PanelProps = { s: Scenario; stepKey: (typeof STEPS)[number]["key"]; shown: number };

const card = "rounded-[var(--r-sm)] bg-void p-4";

/** The left column: what the kiosk and server are doing, in plain words. */
function Behind({ s, stepKey, shown, onReplay }: PanelProps & { onReplay: () => void }) {
  const first = s.attendee?.name.split(" ")[0];
  const result = RESULT[s.outcome];

  if (stepKey === "scan")
    return (
      <div className="space-y-3">
        <p className="max-w-[52ch] text-ink-2">The guest holds their pass under the scanner. The code carries only a pass number and the event, never a name.</p>
        <dl className={`${card} grid grid-cols-2 gap-3`}>
          <div>
            <dt className="t-meta">Pass</dt>
            <dd className="mt-0.5 font-mono text-[1.0625rem]">{s.pass}</dd>
          </div>
          <div>
            <dt className="t-meta">Event</dt>
            <dd className="mt-0.5 text-[1.0625rem]">{EVENT}</dd>
          </div>
        </dl>
      </div>
    );

  if (stepKey === "lookup")
    return (
      <div className="space-y-3">
        <p className="max-w-[52ch] text-ink-2">The kiosk asks the event server who holds this pass, which meal is being served now, and whether they have already eaten.</p>
        <ul className={`${card} space-y-2.5 text-[0.9375rem]`}>
          <Check2 ok={!!s.attendee}>
            {s.attendee ? (
              <>
                Registered: <b className="font-medium">{s.attendee.name}</b> · {s.attendee.role}
              </>
            ) : (
              <>No attendee is registered to {s.pass}</>
            )}
          </Check2>
          {s.attendee && (
            <Check2 ok>
              {MEAL.name} is being served ({MEAL.opens}–{MEAL.closes}); it&apos;s {NOW}
            </Check2>
          )}
          {s.attendee && (
            <Check2 ok={!s.earlier}>
              {s.earlier ? `Already scanned in at ${s.earlier.scanned}; dining window closed at ${s.earlier.closed}` : "No lunch scan yet today"}
            </Check2>
          )}
        </ul>
      </div>
    );

  if (stepKey === "face") {
    if (!s.frames)
      return (
        <p className={`${card} max-w-[52ch] text-ink-2`}>
          {s.attendee
            ? `Skipped. ${first}'s dining window has already closed, so there's nothing to verify.`
            : "Skipped. With no registered attendee, there's no face to compare with."}
        </p>
      );
    const v = votes(s.frames.slice(0, shown)).at(-1) ?? 0;
    const finished = shown >= s.frames.length;
    const secs = finished ? s.seconds : (s.seconds * shown) / s.frames.length;
    return (
      <div className="space-y-3">
        <p className="max-w-[52ch] text-ink-2">
          The camera compares each frame with the face enrolled for {s.attendee!.name}. It needs {VOTES_NEEDED} matching frames within about {TIMEOUT_S} seconds.
        </p>
        <div className={card}>
          <p className="t-meta">Matching frames</p>
          <div className="mt-2 flex gap-1.5" role="img" aria-label={`${v} of ${VOTES_NEEDED} matching frames`}>
            {Array.from({ length: VOTES_NEEDED }, (_, n) => (
              <span key={n} className={`h-3 flex-1 rounded-full transition-colors duration-[var(--d-fast)] ${n < v ? "bg-lime" : "bg-elevated"}`} />
            ))}
          </div>
          <p className="t-meta mt-4">Time</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-elevated">
            <div className={`h-full rounded-full ${s.outcome === "face-not-verified" ? "bg-[var(--c-warn)]" : "bg-ice"}`} style={{ width: `${(secs / TIMEOUT_S) * 100}%` }} />
          </div>
          <p className="mt-2 text-[0.8125rem] text-ink-2 tabular-nums">
            {secs.toFixed(1)} s of {TIMEOUT_S} s{s.outcome === "face-not-verified" && " · sped up"}
          </p>
          {finished && (
            <p className={`mt-3 text-[0.9375rem] ${verified(s.frames) ? "text-lime" : "text-[var(--c-warn)]"}`}>
              {verified(s.frames) ? `Verified: ${VOTES_NEEDED} matching frames.` : `Not verified: time ran out without ${VOTES_NEEDED} matches.`}
            </p>
          )}
        </div>
        <button type="button" onClick={onReplay} className="min-h-11 text-[0.8125rem] text-ink-2 underline-offset-4 hover:text-ink hover:underline">
          Replay the check
        </button>
      </div>
    );
  }

  if (stepKey === "decide")
    return (
      <div className="space-y-3">
        <p className={`inline-flex items-center gap-2 rounded-[var(--r-xs)] px-2.5 py-1 text-[0.9375rem] font-medium ${result.ok ? "bg-lime text-[var(--c-lime-ink)]" : "bg-[var(--c-warn)] text-void"}`}>
          {result.ok ? <CircleCheck size={16} aria-hidden /> : <CircleX size={16} aria-hidden />}
          {result.ok ? "Approved" : s.outcome === "unknown-pass" ? "Invalid code" : s.outcome === "face-not-verified" ? "Face mismatch" : "Dining allowance expired"}
        </p>
        <p className="max-w-[52ch]">{reason(s)}</p>
        {result.ok && <p className="max-w-[52ch] text-ink-2">The kiosk also starts {first}&apos;s dining window, so stepping out and coming back during lunch still works.</p>}
      </div>
    );

  return (
    <div className="space-y-3">
      <p className="max-w-[52ch] text-ink-2">Every scan is logged, admitted or not, so organisers can see who came and when.</p>
      <div className={`${card} overflow-x-auto p-0`}>
        <table className="w-full min-w-[22rem] text-left text-[0.8125rem]">
          <caption className="sr-only">Fictional attendance log</caption>
          <thead className="t-meta">
            <tr>
              <th scope="col" className="px-3 py-2 font-normal">Time</th>
              <th scope="col" className="px-3 py-2 font-normal">Pass</th>
              <th scope="col" className="px-3 py-2 font-normal">Name</th>
              <th scope="col" className="px-3 py-2 font-normal">Result</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {LOG_HISTORY.map((r) => (
              <tr key={r.time + r.pass} className="border-t border-line text-ink-2">
                <td className="px-3 py-2">{r.time}</td>
                <td className="whitespace-nowrap px-3 py-2 font-mono">{r.pass}</td>
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{r.result}</td>
              </tr>
            ))}
            <tr className="border-t border-line bg-elevated">
              <td className="px-3 py-2">{NOW}</td>
              <td className="whitespace-nowrap px-3 py-2 font-mono">{s.pass}</td>
              <td className="px-3 py-2">{s.attendee?.name ?? "—"}</td>
              <td className={`px-3 py-2 font-medium ${result.ok ? "text-lime" : "text-[var(--c-warn)]"}`}>{result.log}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Check2({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      {ok ? <CircleCheck size={17} aria-hidden className="mt-0.5 shrink-0 text-lime" /> : <CircleX size={17} aria-hidden className="mt-0.5 shrink-0 text-[var(--c-warn)]" />}
      <span>{children}</span>
    </li>
  );
}

/** The right column: the kiosk's own screen at this step. Decorative; the left column says the same. */
function Screen({ s, stepKey, shown }: PanelProps) {
  const result = RESULT[s.outcome];
  const first = s.attendee?.name.split(" ")[0];

  if (stepKey === "scan")
    return (
      <KioskScreen mark="fork" title="Please scan your QR code to enter">
        <PseudoQr seed={s.pass} className="w-[70%] text-[#14181d]" />
      </KioskScreen>
    );
  if (stepKey === "lookup") return <KioskScreen mark="scan" title="Checking your pass…" />;

  if (stepKey === "face") {
    if (!s.frames) return <KioskScreen mark="scan" title="Checking your pass…" />;
    const frame = shown > 0 ? s.frames[shown - 1] : "none";
    const v = votes(s.frames.slice(0, shown)).at(-1) ?? 0;
    const box = frame === "match" ? "#2f9e44" : frame === "other" ? "#d9480f" : "transparent";
    return (
      <div className="absolute inset-0 bg-[#1b232c]">
        <Silhouette className="absolute bottom-0 left-1/2 h-[88%] -translate-x-1/2" tone="#55657a" />
        <span
          className="absolute left-1/2 top-[20%] h-[42%] w-[30%] -translate-x-1/2 rounded-[4px] border-2 transition-colors duration-[var(--d-instant)]"
          style={{ borderColor: box }}
        >
          {frame !== "none" && (
            <span className="absolute -top-5 left-0 whitespace-nowrap rounded-[2px] px-1 text-[0.625rem] font-semibold text-white" style={{ background: box }}>
              {frame === "match" ? s.attendee!.name : "Not the pass holder"}
            </span>
          )}
        </span>
        <p className="absolute bottom-[4%] left-[4%] rounded-[3px] bg-black/60 px-1.5 py-0.5 text-[clamp(0.625rem,1.8vw,0.8125rem)] font-semibold text-white">Please look at the camera</p>
        <p className="absolute bottom-[4%] right-[4%] rounded-[3px] bg-black/60 px-1.5 py-0.5 text-[0.625rem] text-white tabular-nums">
          {v}/{VOTES_NEEDED}
        </p>
      </div>
    );
  }

  if (stepKey === "decide")
    return (
      <KioskScreen
        mark={result.ok ? "tick" : "cross"}
        tone={result.ok ? "ok" : "stop"}
        title={result.ok ? `Welcome, ${first}!` : result.title}
        line={result.line}
      />
    );

  return <KioskScreen mark="fork" title="Please scan your QR code to enter" />;
}
