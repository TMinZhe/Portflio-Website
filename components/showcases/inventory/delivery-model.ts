/*
 * Simplified model of offline-safe stock delivery, for the Offline Delivery
 * Simulator. Mechanism, as described in the technical audit:
 *
 * - Completing a top-up writes the stock deltas and an outbox job in the same
 *   office transaction, so a delivery can never exist without its job.
 * - A worker drains each store's jobs in id order. A transient failure (store
 *   unreachable, lost acknowledgement) stops that store's drain, so later jobs
 *   wait behind it; retries back off exponentially up to a cap.
 * - The store applies a job inside one store transaction: it checks for an
 *   idempotency marker keyed by job id, applies the deltas, and inserts the
 *   marker before committing. A replay that finds the marker settles the
 *   office side without touching stock again.
 *
 * This gives exactly-once stock effects through idempotent processing; the
 * transport itself is at-least-once. Synthetic data, simplified timing.
 */

export type Deltas = Record<string, number>;
export type Job = { id: number; deltas: Deltas; status: "pending" | "sent"; attempts: number; retryIn: number | null };
export type LogTone = "office" | "store" | "fail" | "ok" | "warn";
export type LogEntry = { seq: number; t: number; tone: LogTone; text: string };

export type DeliveryState = {
  online: boolean;
  loseNextAck: boolean;
  /** Turning the marker off shows what a naive retry would do. */
  useMarker: boolean;
  clock: number;
  jobs: Job[];
  stock: Record<string, number>;
  markers: number[];
  /** How many times each job's deltas changed store stock. Should never exceed 1. */
  applied: Record<number, number>;
  log: LogEntry[];
};

export type DeliveryAction =
  | { type: "toggle-online" }
  | { type: "toggle-lose-ack" }
  | { type: "toggle-marker" }
  | { type: "queue" }
  | { type: "run-worker" }
  | { type: "reset" };

const SAMPLE_DELIVERIES: Deltas[] = [{ "P-12": 4 }, { "P-03": 3 }, { "P-12": 1, "P-03": 2 }];
const BASE_BACKOFF = 5;
const MAX_BACKOFF = 60;
const fmt = (d: Deltas) => Object.entries(d).map(([p, n]) => `+${n} → ${p}`).join(", ");

export const initialDelivery = (useMarker = true): DeliveryState => ({
  online: false,
  loseNextAck: false,
  useMarker,
  clock: 0,
  jobs: [],
  stock: { "P-03": 5, "P-07": 2, "P-12": 3 },
  markers: [],
  applied: {},
  log: [],
});

function push(s: DeliveryState, tone: LogTone, text: string): DeliveryState {
  return { ...s, log: [...s.log, { seq: s.log.length + 1, t: s.clock, tone, text }] };
}

export function deliveryReducer(s: DeliveryState, a: DeliveryAction): DeliveryState {
  switch (a.type) {
    case "reset":
      return initialDelivery(s.useMarker);
    case "toggle-online":
      return push({ ...s, online: !s.online }, s.online ? "fail" : "ok", s.online ? "Store C went offline." : "Store C is reachable again.");
    case "toggle-lose-ack":
      return { ...s, loseNextAck: !s.loseNextAck };
    case "toggle-marker":
      return { ...initialDelivery(!s.useMarker) };
    case "queue": {
      const id = 41 + s.jobs.length;
      const deltas = SAMPLE_DELIVERIES[s.jobs.length % SAMPLE_DELIVERIES.length];
      const job: Job = { id, deltas, status: "pending", attempts: 0, retryIn: null };
      return push({ ...s, jobs: [...s.jobs, job] }, "office", `Top-up completed. Deltas (${fmt(deltas)}) and outbox job #${id} committed in one office transaction.`);
    }
    case "run-worker":
      return drain({ ...s, clock: s.clock + 5 });
  }
}

/** One pass of the per-store drain: deliver pending jobs in id order until one fails. */
function drain(start: DeliveryState): DeliveryState {
  let s = start;
  const pending = s.jobs.filter((j) => j.status === "pending");
  if (pending.length === 0) return push(s, "office", "Worker: nothing pending for Store C.");

  for (const job of pending) {
    if (!s.online) {
      const attempts = job.attempts + 1;
      const retryIn = Math.min(BASE_BACKOFF * 2 ** (attempts - 1), MAX_BACKOFF);
      s = updateJob(s, job.id, { attempts, retryIn });
      const behind = pending.length - 1;
      return push(
        s,
        "fail",
        `Job #${job.id}: connection to Store C timed out. Transient failure, so the job stays pending and retries in ${retryIn}s.${
          behind > 0 ? ` ${behind} later job${behind === 1 ? "" : "s"} wait${behind === 1 ? "s" : ""} behind it.` : ""
        }`,
      );
    }

    s = updateJob(s, job.id, { attempts: job.attempts + 1, retryIn: null });

    if (s.useMarker && s.markers.includes(job.id)) {
      s = updateJob(s, job.id, { status: "sent" });
      s = push(s, "warn", `Job #${job.id}: marker already present, so the store committed earlier and only the acknowledgement was lost. Office settled from the recorded plan; store stock untouched.`);
      continue;
    }

    // Store transaction: apply the deltas and (with the marker) record the job id, then commit.
    const stock = { ...s.stock };
    for (const [pos, n] of Object.entries(job.deltas)) stock[pos] = (stock[pos] ?? 0) + n;
    const count = (s.applied[job.id] ?? 0) + 1;
    s = {
      ...s,
      stock,
      markers: s.useMarker ? [...s.markers, job.id] : s.markers,
      applied: { ...s.applied, [job.id]: count },
    };
    s = push(
      s,
      count > 1 ? "fail" : "store",
      `Job #${job.id}: store transaction applied ${fmt(job.deltas)}${s.useMarker ? ` and inserted marker #${job.id}` : ""}, then committed.${
        count > 1 ? ` The same delivery has now changed stock ${count} times.` : ""
      }`,
    );

    if (s.loseNextAck) {
      s = { ...s, loseNextAck: false };
      return push(s, "fail", `Job #${job.id}: acknowledgement lost on the way back. The office still sees it as pending and will retry.`);
    }
    s = updateJob(s, job.id, { status: "sent" });
    s = push(s, "ok", `Job #${job.id}: acknowledged. Office deltas marked applied, job marked sent.`);
  }
  return s;
}

function updateJob(s: DeliveryState, id: number, patch: Partial<Job>): DeliveryState {
  return { ...s, jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)) };
}
