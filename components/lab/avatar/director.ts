/**
 * AvatarDirector — framework-free state machine that decides *which* gesture
 * plays and *when*. It knows nothing about three.js: the avatar component asks
 * it every frame what to perform and reports nothing back except time.
 *
 * Rules (docs/avatar/digital-me-plan.md §3):
 * - a cue fires its full gesture once per scroll direction; re-crossing plays a
 *   subtle acknowledgement instead
 * - a global cooldown separates gestures; while cooling down only the most
 *   recent request is kept
 * - multi-step cues (think → present) run back to back without a cooldown
 * - the greeting plays once per session
 */
export type Gesture = "wave" | "waveSmall" | "point" | "think" | "present" | "presentBoth" | "nod";
export type CueName = "greet" | "work" | "about" | "contact" | "react" | "farewell";

type CueSpec = { forward: Gesture[]; back: Gesture[]; repeatable?: boolean };

const CUES: Record<CueName, CueSpec> = {
  greet: { forward: ["wave"], back: [] },
  work: { forward: ["point"], back: ["nod"] },
  about: { forward: ["think", "present"], back: ["nod"] },
  contact: { forward: ["presentBoth"], back: [] },
  react: { forward: ["nod"], back: ["nod"], repeatable: true },
  farewell: { forward: ["waveSmall"], back: [] },
};

export type Performance = { gesture: Gesture; startedAt: number; duration: number };

export type DirectorSnapshot = {
  current: Performance | null;
  queued: Gesture[];
  log: string[];
};

const GREETED_KEY = "atelier:greeted";

export class AvatarDirector {
  private current: Performance | null = null;
  private sequence: Gesture[] = [];
  private queued: Gesture[] = [];
  private lastEnd = -Infinity;
  private fired = new Set<string>();
  private log: string[] = [];
  private listeners = new Set<() => void>();

  constructor(
    private durations: Record<Gesture, number>,
    private cooldown = 2.5,
  ) {}

  /** Scroll or interaction cue. `dir` is +1 scrolling down / forward, -1 back up. */
  cue(name: CueName, now: number, dir: 1 | -1 = 1) {
    const spec = CUES[name];
    if (name === "greet") {
      if (sessionGet(GREETED_KEY)) return this.note(`greet skipped (session)`);
      sessionSet(GREETED_KEY);
    }
    const key = `${name}:${dir}`;
    const seen = this.fired.has(key);
    this.fired.add(key);
    let gestures = dir === 1 ? spec.forward : spec.back;
    if (seen && !spec.repeatable) gestures = gestures.length ? ["nod"] : []; // acknowledge, don't repeat
    if (!gestures.length) return this.note(`${key} → nothing`);
    this.note(`${key} → ${gestures.join(" → ")}${seen ? " (ack)" : ""}`);
    this.request(gestures, now);
  }

  /** Direct request, e.g. from the lab's debug buttons. Bypasses once-rules, not the cooldown. */
  request(gestures: Gesture[], now: number) {
    if (this.current || now - this.lastEnd < this.cooldown) {
      this.queued = gestures; // keep only the latest intent
      this.emit();
      return;
    }
    this.start(gestures, now);
  }

  /** Called every frame. Returns the active performance, if any. */
  tick(now: number): Performance | null {
    const c = this.current;
    if (c && now - c.startedAt >= c.duration) {
      const next = this.sequence.shift();
      if (next) {
        this.current = { gesture: next, startedAt: now, duration: this.durations[next] };
      } else {
        this.current = null;
        this.lastEnd = now;
      }
      this.emit();
    }
    if (!this.current && this.queued.length && now - this.lastEnd >= this.cooldown) {
      const q = this.queued;
      this.queued = [];
      this.start(q, now);
    }
    return this.current;
  }

  snapshot(): DirectorSnapshot {
    return { current: this.current, queued: [...this.queued], log: [...this.log] };
  }

  subscribe(l: () => void) {
    this.listeners.add(l);
    return () => void this.listeners.delete(l);
  }

  private start(gestures: Gesture[], now: number) {
    const [first, ...rest] = gestures;
    this.current = { gesture: first, startedAt: now, duration: this.durations[first] };
    this.sequence = rest;
    this.emit();
  }

  private note(msg: string) {
    this.log = [msg, ...this.log].slice(0, 6);
    this.emit();
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }
}

function sessionGet(k: string) {
  try {
    return sessionStorage.getItem(k);
  } catch {
    return null;
  }
}
function sessionSet(k: string) {
  try {
    sessionStorage.setItem(k, "1");
  } catch {}
}
