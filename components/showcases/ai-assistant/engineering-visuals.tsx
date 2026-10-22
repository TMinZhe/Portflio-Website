import { ArrowDown, ArrowRight, Check, X } from "lucide-react";

/*
 * Static explainers for "Behind the engineering". Guardrail and evaluation
 * examples are fictional but follow failure modes and checks documented in
 * the audit. Latency figures are the project's own benchmark (audited).
 */

/* ---------- Guardrails ---------- */

const CASES = [
  {
    title: "Ambiguous location",
    question: "Show the stock for Harbour.",
    model: "Store: “Harbour”",
    after: "Two stores share the word “Harbour”, so the assistant asks: Harbour East or Harbour West?",
  },
  {
    title: "A store the model made up",
    question: "Which products sell best?",
    model: "Store: “Store Z”",
    after: "The question named no store and “Store Z” doesn't exist, so the invented store is removed and the report covers every store.",
  },
  {
    title: "A short follow-up",
    question: "How did Store A do last week? … And Store B?",
    model: "Follow-up, store: Store B (question type and period missing)",
    after: "Python fills in what wasn't repeated from the previous question: Sales summary · Store B · last week.",
  },
];

export function GuardrailGallery() {
  return (
    <ul className="grid gap-3 lg:grid-cols-3">
      {CASES.map((c) => (
        <li key={c.title} className="flex flex-col rounded-[var(--r-md)] bg-graphite p-4">
          <p className="font-medium">{c.title}</p>
          <p className="mt-3 rounded-[var(--r-sm)] bg-elevated px-3 py-2 text-[0.875rem]">&ldquo;{c.question}&rdquo;</p>
          <div className="mt-3 rounded-[var(--r-sm)] border border-[var(--c-warn)]/40 px-3 py-2">
            <p className="t-meta flex items-center gap-1.5 text-[var(--c-warn)]">
              <X size={13} aria-hidden /> Model&apos;s reading
            </p>
            <p className="mt-1 text-[0.875rem]">{c.model}</p>
          </div>
          <ArrowDown size={16} aria-hidden className="mx-auto my-1.5 text-ink-2" />
          <div className="flex-1 rounded-[var(--r-sm)] border border-lime/50 px-3 py-2">
            <p className="t-meta flex items-center gap-1.5 text-lime">
              <Check size={13} aria-hidden /> After the checks
            </p>
            <p className="mt-1 text-[0.875rem]">{c.after}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Inference ---------- */

function Box({ kicker, title, note, accent }: { kicker: string; title: string; note?: string; accent?: boolean }) {
  return (
    <div className={`rounded-[var(--r-sm)] bg-elevated px-4 py-3 ${accent ? "ring-1 ring-ice/50" : ""}`}>
      <p className="text-[0.75rem] text-ice">{kicker}</p>
      <p className="font-medium">{title}</p>
      {note && <p className="mt-0.5 text-[0.8125rem] text-ink-2">{note}</p>}
    </div>
  );
}

export function InferenceArchitecture() {
  return (
    <figure className="rounded-[var(--r-md)] bg-graphite p-4 sm:p-6">
      <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1.4fr]">
        <Box kicker="Chat" title="Open WebUI" note="Staff ask in a browser" />
        <ArrowRight size={18} aria-hidden className="mx-auto rotate-90 text-ink-2 md:rotate-0" />
        <Box kicker="Assistant" title="Python pipeline" note="One conversation per chat; reports read the database through a read-only account" />
        <ArrowRight size={18} aria-hidden className="mx-auto rotate-90 text-ink-2 md:rotate-0" />
        <div className="rounded-[var(--r-sm)] border border-line-strong p-3">
          <p className="text-[0.75rem] text-ice">Local model service</p>
          <p className="font-medium">Qwen3-30B-A3B INT4 · OpenVINO GenAI</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Box kicker="Preferred" title="Intel Arc GPU" note="Takes each request first" accent />
            <Box kicker="Overflow" title="Intel NPU" note="Used when the GPU is busy" />
          </div>
          <p className="mt-3 text-[0.8125rem] text-ink-2">
            A copy of the model stays loaded on each device. The long, fixed start of the routing prompt is cached, and answers stream back as they are
            written.
          </p>
        </div>
      </div>
      <figcaption className="mt-4 text-[0.875rem] text-ink-2">
        Simplified, with generic names. Everything runs on one local machine; no cloud API is involved.
      </figcaption>
    </figure>
  );
}

/* ---------- Latency ---------- */

const RUNS = [
  { label: "Before", setup: "CPU · Ollama · Aug 2026", mean: 56.7, median: 52.0, p95: 81.0, router: 24.9, narrator: 1.0 },
  { label: "After", setup: "Intel Arc GPU · OpenVINO GenAI · Oct 2026", mean: 10.7, median: 9.8, p95: 25.2, router: 3.75, narrator: 0.58 },
];

export function LatencyComparison() {
  const max = RUNS[0].mean;
  return (
    <figure className="rounded-[var(--r-md)] bg-graphite p-4 sm:p-6">
      <figcaption className="t-meta">Mean time to answer one question, historical benchmark</figcaption>
      <div className="mt-4 space-y-4">
        {RUNS.map((r) => (
          <div key={r.label}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 text-[0.875rem]">
              <span>
                <span className="font-medium">{r.label}</span> <span className="text-ink-2">· {r.setup}</span>
              </span>
              <span className="font-display text-[1.5rem] tabular-nums">{r.mean.toFixed(1)}s</span>
            </div>
            <div className="mt-1.5 h-3 rounded-full bg-void" aria-hidden>
              <div className={`h-full rounded-full ${r.label === "After" ? "bg-lime" : "bg-ink-2/60"}`} style={{ width: `${(r.mean / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <table className="mt-5 w-full text-[0.8125rem] tabular-nums">
        <caption className="sr-only">Benchmark detail</caption>
        <thead className="t-meta text-left">
          <tr>
            <th className="py-1 font-normal">Measure</th>
            <th className="text-right font-normal">Before</th>
            <th className="text-right font-normal">After</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Median per question", "52.0s", "9.8s"],
            ["Slowest 5% (p95)", "81.0s", "25.2s"],
            ["Understanding step (mean)", "24.9s", "3.75s"],
            ["Model write-ups per question", "1.00", "0.58"],
          ].map(([k, b, a]) => (
            <tr key={k} className="border-t border-line">
              <td className="py-1.5 text-ink-2">{k}</td>
              <td className="text-right">{b}</td>
              <td className="text-right">{a}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-5 border-l-2 border-[var(--c-warn)]/60 pl-4 text-[0.875rem]">
        <p className="t-meta mb-1">Read this carefully</p>
        <p>
          The two runs used different hardware and software, so this is not a hardware-only comparison. The gain combines keeping the model loaded instead
          of reloading it, faster inference on the GPU, and fewer model calls because Python now writes most answers. The sample is small: 12 benchmark
          questions (12 runs before, 36 after). The October run used the earlier Qwen3-8B model; the current Qwen3-30B-A3B setup has not been benchmarked
          the same way.
        </p>
      </div>
    </figure>
  );
}

/* ---------- Evaluation ---------- */

const FLOW = ["Test question", "Expected answer type", "What the system chose", "Compare", "Review misses"];

export function EvalWorkflow() {
  return (
    <figure className="space-y-4">
      <ol className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {FLOW.map((f, i) => (
          <li key={f} className="flex items-center gap-2">
            <span className="rounded-[var(--r-sm)] bg-graphite px-3 py-2.5 text-[0.9375rem]">
              <span className="t-meta mr-2 text-ice">{i + 1}</span>
              {f}
            </span>
            {i < FLOW.length - 1 && <ArrowRight size={15} aria-hidden className="hidden shrink-0 text-ink-2 sm:block" />}
          </li>
        ))}
      </ol>
      <div className="rounded-[var(--r-md)] bg-graphite p-4">
        <p className="t-meta mb-3">One fictional test case</p>
        <p className="rounded-[var(--r-sm)] bg-elevated px-3 py-2 text-[0.9375rem]">&ldquo;What sold best at Store B yesterday?&rdquo;</p>
        <dl className="mt-3 grid gap-2 text-[0.875rem] sm:grid-cols-3">
          <div className="rounded-[var(--r-sm)] bg-void px-3 py-2">
            <dt className="t-meta">Expected</dt>
            <dd className="mt-0.5">Product sales · Store B · yesterday</dd>
          </div>
          <div className="rounded-[var(--r-sm)] bg-void px-3 py-2">
            <dt className="t-meta flex items-center gap-1.5 text-[var(--c-warn)]">
              <X size={13} aria-hidden /> Model alone
            </dt>
            <dd className="mt-0.5">Sales summary · Store B · yesterday</dd>
          </div>
          <div className="rounded-[var(--r-sm)] bg-void px-3 py-2">
            <dt className="t-meta flex items-center gap-1.5 text-lime">
              <Check size={13} aria-hidden /> After the checks
            </dt>
            <dd className="mt-0.5">Product sales · Store B · yesterday</dd>
          </div>
        </dl>
        <p className="mt-3 text-[0.8125rem] text-ink-2">
          The evaluation scores both: what the model chose on its own, and what the system finally did after its checks. The second is the number to protect.
        </p>
      </div>
      <figcaption className="text-[0.875rem] text-ink-2">The test case is invented for illustration; the evaluation set itself stays private.</figcaption>
    </figure>
  );
}
