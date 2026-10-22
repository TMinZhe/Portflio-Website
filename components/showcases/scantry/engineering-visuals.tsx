"use client";

import { useState } from "react";
import { ArrowDown, ArrowRight, Camera, Cpu, Monitor, QrCode } from "lucide-react";
import { SchematicLabel } from "@/components/ui/schematic-label";
import { KioskScreen, Silhouette } from "./kiosk-parts";
import { TIMEOUT_S, VOTES_NEEDED } from "./access-model";

/*
 * Visuals for "Behind the engineering". The mechanisms (augmentation count,
 * threshold, votes, timeout, 15-minute bins, timeline dates) are real; every
 * number drawn from data is synthetic and every face is a silhouette.
 */

const panel = "rounded-[var(--r-md)] bg-graphite p-4 sm:p-6";

/* ---------- A. Computer vision ---------- */

/** Ten fixed variants standing in for the random augmentations. */
const VARIANTS = [
  "rotate(-8deg)",
  "rotate(6deg) scale(1.08)",
  "scaleX(-1)",
  "translateX(8%)",
  "scale(0.9)",
  "rotate(4deg) translateY(-6%)",
  "scaleX(-1) rotate(-5deg)",
  "scale(1.1)",
  "translateX(-8%) rotate(-3deg)",
  "rotate(9deg) scale(0.94)",
];
const FILTERS = ["", "brightness(1.2)", "", "blur(1px)", "brightness(0.8)", "", "brightness(1.15)", "blur(1px)", "", "brightness(0.85)"];

/** A deterministic, made-up 128-number encoding drawn as bars. */
const ENCODING = Array.from({ length: 32 }, (_, i) => 0.25 + 0.6 * Math.abs(Math.sin(i * 1.7 + 0.4)));

function Stage({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="rounded-[var(--r-sm)] bg-void p-4">
      <p className="t-meta">
        {n} · {title}
      </p>
      <div className="mt-3">{children}</div>
    </li>
  );
}

export function VisionPipeline() {
  return (
    <figure className={panel}>
      <SchematicLabel>Illustration of the real pipeline. Silhouettes and numbers are made up.</SchematicLabel>
      <ol className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Stage n={1} title="Enrol one photo">
          <div className="mx-auto grid aspect-square w-24 place-items-center overflow-hidden rounded-[var(--r-xs)] bg-elevated">
            <Silhouette className="h-full w-full" tone="#8caeff" />
          </div>
          <p className="mt-3 text-[0.875rem] text-ink-2">One reference photo per attendee.</p>
        </Stage>
        <Stage n={2} title="Ten varied copies">
          <div className="grid grid-cols-5 gap-1" aria-hidden>
            {VARIANTS.map((t, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-[3px] bg-elevated">
                <Silhouette className="h-full w-full" tone="#8caeff" style={{ transform: t, filter: FILTERS[i] || undefined }} />
              </div>
            ))}
          </div>
          <p className="mt-3 text-[0.875rem] text-ink-2">Rotated, shifted, scaled, mirrored, brightened or blurred at random.</p>
        </Stage>
        <Stage n={3} title="128 numbers each">
          <div className="flex h-16 items-end gap-[2px]" aria-hidden>
            {ENCODING.map((v, i) => (
              <span key={i} className="flex-1 rounded-t-[1px] bg-ice/80" style={{ height: `${v * 100}%` }} />
            ))}
          </div>
          <p className="mt-3 text-[0.875rem] text-ink-2">A pretrained model turns each face into an encoding. Nothing is trained here.</p>
        </Stage>
        <Stage n={4} title="Compare a live face">
          <dl className="space-y-2.5 text-[0.875rem]">
            <div>
              <dt>Pass holder</dt>
              <dd className="whitespace-nowrap font-mono tabular-nums text-lime">0.41 ≤ 0.512 · match</dd>
            </div>
            <div>
              <dt>Someone else</dt>
              <dd className="whitespace-nowrap font-mono tabular-nums text-ink-2">0.68 &gt; 0.512 · no</dd>
            </div>
          </dl>
          <p className="mt-3 text-[0.875rem] text-ink-2">Closer than 0.512, and it must be the person on the pass.</p>
        </Stage>
      </ol>

      <div className="mt-4 rounded-[var(--r-sm)] bg-void p-4">
        <p className="t-meta">
          5 · Confirm over several frames
        </p>
        <div className="relative mt-4 h-10" role="img" aria-label={`Five matching frames arrive within about ${TIMEOUT_S} seconds; a prompt to move closer appears at five seconds.`}>
          <div className="absolute inset-x-0 top-1/2 h-px bg-line-strong" />
          <span className="absolute top-0 h-full border-l border-dashed border-[var(--c-warn)]" style={{ left: "50%" }} />
          {[0.6, 1.1, 1.5, 2.0, 2.4].map((t, n) => (
            <span
              key={t}
              className="absolute top-1/2 grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-lime text-[0.625rem] font-semibold text-[var(--c-lime-ink)]"
              style={{ left: `${(t / TIMEOUT_S) * 100}%` }}
            >
              {n + 1}
            </span>
          ))}
          <span className="absolute right-0 top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-ink-2" />
        </div>
        <div className="mt-1 flex justify-between text-[0.75rem] text-ink-2">
          <span>0 s</span>
          <span className="text-[var(--c-warn)]">5 s · “move closer”</span>
          <span>~{TIMEOUT_S} s · see staff</span>
        </div>
        <p className="mt-3 max-w-[60ch] text-[0.875rem] text-ink-2">
          {VOTES_NEEDED} matching frames admit the guest. This reduces one-off false matches; it is not a liveness or anti-spoofing check.
        </p>
      </div>
    </figure>
  );
}

/* ---------- B. Hardware and interface ---------- */

const PARTS = [
  { icon: QrCode, name: "QR scanner", text: "Reads the pass; input goes to an invisible field" },
  { icon: Camera, name: "Camera", text: "Live feed for the face check" },
  { icon: Cpu, name: "Jetson Nano", text: "Runs the Python kiosk app" },
  { icon: Monitor, name: "Display", text: "Full-screen Tkinter interface" },
];

const SCREENS: { name: string; props: Parameters<typeof KioskScreen>[0] }[] = [
  { name: "Home", props: { mark: "fork", title: "Please scan your QR code to enter" } },
  { name: "Look at the camera", props: { mark: "camera", title: "Please look at the camera" } },
  { name: "Welcome", props: { mark: "tick", tone: "ok", title: "Welcome, Priya!", line: "Enjoy your lunch." } },
  { name: "Long name, shrunk to fit", props: { mark: "tick", tone: "ok", title: "Welcome, Maximiliana Rosalind!", line: "Enjoy your lunch." } },
  { name: "Invalid code", props: { mark: "cross", tone: "stop", title: "Invalid code", line: "Please approach a staff member for help." } },
  { name: "Already eaten", props: { mark: "cross", tone: "stop", title: "You've had lunch today", line: "Your dining window has closed." } },
];

export function KioskHardware() {
  return (
    <figure className={panel}>
      <SchematicLabel>Drawn recreation of the kiosk screens. Event and school logos replaced; names are fictional.</SchematicLabel>
      <ul className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {PARTS.map((p) => (
          <li key={p.name} className="rounded-[var(--r-sm)] bg-void p-3.5">
            <p className="flex items-center gap-2 font-medium">
              <p.icon size={16} aria-hidden className="text-ice" />
              {p.name}
            </p>
            <p className="mt-1 text-[0.8125rem] text-ink-2">{p.text}</p>
          </li>
        ))}
      </ul>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SCREENS.map((sc) => (
          <li key={sc.name}>
            <div className="relative aspect-[16/10] overflow-hidden rounded-[8px] bg-white text-[#14181d] ring-4 ring-[#0f1318]" aria-hidden>
              {sc.props.mark === "camera" ? (
                <div className="absolute inset-0 bg-[#1b232c]">
                  <Silhouette className="absolute bottom-0 left-1/2 h-[88%] -translate-x-1/2" tone="#55657a" />
                  <p className="absolute bottom-[4%] left-[4%] rounded-[3px] bg-black/60 px-1.5 py-0.5 text-[0.6875rem] font-semibold text-white">Please look at the camera</p>
                </div>
              ) : (
                <KioskScreen {...sc.props} />
              )}
            </div>
            <p className="mt-2 text-[0.8125rem] text-ink-2">{sc.name}</p>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/* ---------- C. System integration ---------- */

const FLOW = [
  { name: "QR pass", tech: "Pass ID + event", mine: false },
  { name: "Kiosk", tech: "Python · Jetson Nano", mine: true },
  { name: "Event server", tech: "PHP API · teammate", mine: false },
  { name: "Database", tech: "MySQL · teammate", mine: false },
  { name: "Attendance dashboard", tech: "PHP · Google Charts", mine: true },
];

/** Fictional arrivals per 15 minutes, for two meals. */
const ARRIVALS = {
  Lunch: { start: "11:30", counts: [14, 38, 61, 72, 55, 41, 23, 12, 6, 3] },
  Dinner: { start: "18:00", counts: [9, 27, 49, 66, 70, 44, 25, 14, 5, 2] },
} as const;
type Meal = keyof typeof ARRIVALS;

const addMinutes = (hhmm: string, m: number) => {
  const [h, mm] = hhmm.split(":").map(Number);
  const t = h * 60 + mm + m;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

export function SystemMap() {
  const [meal, setMeal] = useState<Meal>("Lunch");
  const a = ARRIVALS[meal];
  const max = Math.max(...a.counts);
  const total = a.counts.reduce((x, y) => x + y, 0);
  const registered = 400;

  return (
    <figure className={panel}>
      <SchematicLabel>System map of the real components; dashboard drawn with made-up attendance.</SchematicLabel>
      <ol className="mt-5 flex flex-col gap-2 lg:flex-row lg:items-stretch">
        {FLOW.map((f, n) => (
          <li key={f.name} className="flex flex-col items-center gap-2 lg:flex-1 lg:flex-row">
            <div className={`w-full rounded-[var(--r-sm)] p-3 lg:h-full ${f.mine ? "bg-elevated ring-1 ring-lime/50" : "bg-void"}`}>
              <p className="font-medium">{f.name}</p>
              <p className="mt-0.5 text-[0.8125rem] text-ink-2">{f.tech}</p>
            </div>
            {n < FLOW.length - 1 && (
              <>
                <ArrowDown size={15} aria-hidden className="shrink-0 text-ink-2 lg:hidden" />
                <ArrowRight size={15} aria-hidden className="hidden shrink-0 text-ink-2 lg:block" />
              </>
            )}
          </li>
        ))}
      </ol>
      <p className="mt-2 flex items-center gap-2 text-[0.8125rem] text-ink-2">
        <span aria-hidden className="size-2 rounded-full ring-1 ring-lime" /> Parts I built
      </p>

      <div className="mt-5 rounded-[var(--r-sm)] bg-void p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-[var(--r-xs)] border border-line-strong px-2.5 py-1.5 text-[0.8125rem]">Demo Expo 2023</span>
          <span className="rounded-[var(--r-xs)] border border-line-strong px-2.5 py-1.5 text-[0.8125rem]">Day 3</span>
          <div role="radiogroup" aria-label="Meal" className="flex gap-1">
            {(Object.keys(ARRIVALS) as Meal[]).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={m === meal}
                onClick={() => setMeal(m)}
                className={`min-h-9 rounded-[var(--r-xs)] px-3 text-[0.8125rem] ${m === meal ? "bg-ice font-medium text-void" : "border border-line-strong text-ink-2 hover:text-ink"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-5 md:grid-cols-[10rem_1fr]">
          <div>
            <p className="t-meta">Entered</p>
            <p className="mt-1 font-display text-[2rem] leading-none tabular-nums">{Math.round((total / registered) * 100)}%</p>
            <p className="mt-1 text-[0.8125rem] text-ink-2 tabular-nums">
              {total} of {registered} registered
            </p>
          </div>
          <div>
            <p className="t-meta">Arrivals per 15 minutes</p>
            <div className="mt-2 flex h-28 items-end gap-1" role="img" aria-label={`Fictional ${meal.toLowerCase()} arrivals peak at ${max} in one 15-minute interval.`}>
              {a.counts.map((c, n) => (
                <span key={n} className={`flex-1 rounded-t-[2px] ${c === max ? "bg-lime" : "bg-ice/70"}`} style={{ height: `${(c / max) * 100}%` }} />
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[0.75rem] text-ink-2 tabular-nums">
              <span>{a.start}</span>
              <span>{addMinutes(a.start, 15 * a.counts.length)}</span>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}

/* ---------- D. Iteration ---------- */

/** Dated from the owner's fortnightly Major Project reflections and the pitch deck. */
const TIMELINE = [
  { when: "Apr 2023", title: "QR scanner and a local prototype", text: "A Python QR scanner linked to a Tkinter app, with a local SQLite database on the Jetson Nano. First client meeting: handle 1,000+ guests without long queues." },
  { when: "May 2023", title: "Connected to the server", text: "Kiosk reads and updates a teammate's server, writing each entry as it happens. Three Jetson Nanos re-flashed and tested together." },
  { when: "Late May 2023", title: "Face verification added", text: "Ten augmented copies per enrolled photo, encodings saved to a file, and new full-screen designs with camera screens." },
  { when: "Jun 2023", title: "Tighter matching, mid-term review", text: "Threshold tightened so strangers read as unknown, a server-lookup bug fixed, and 800+ QR passes generated." },
  { when: "Jul 2023", title: "Dashboard, organiser demo, the event", text: "Attendance charts built, the system shown to the organisers on 5 July, and then used for meal access at WorldSkills ASEAN Singapore 2023." },
  { when: "Oct 2023", title: "Startup pitch", text: "An early Scantry MVP and a pitch for pre-seed funding." },
];

export function ProjectTimeline() {
  return (
    <ol className="relative border-l border-line-strong pl-6">
      {TIMELINE.map((t, n) => (
        <li key={t.when} data-reveal className={n ? "mt-7" : ""}>
          <span aria-hidden className={`absolute -left-[5px] mt-1.5 size-2.5 rounded-full ${n === TIMELINE.length - 2 ? "bg-lime" : "bg-ice"}`} />
          <p className="t-meta">{t.when}</p>
          <h4 className="mt-1 text-[1.0625rem] font-medium">{t.title}</h4>
          <p className="mt-1 max-w-[56ch] text-ink-2">{t.text}</p>
        </li>
      ))}
    </ol>
  );
}
