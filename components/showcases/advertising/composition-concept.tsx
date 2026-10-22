import { ArrowDown, ArrowRight, ShieldCheck, Sparkles, Users } from "lucide-react";

/*
 * Future concept: assembling an advertisement from brand-approved parts.
 * Nothing here is implemented; the inputs and the assembled poster are
 * fictional concept artwork.
 */

const INPUTS = [
  { name: "Product image", body: <span className="mx-auto block aspect-square w-10 rounded-[30%] bg-gradient-to-br from-lime to-[#4d7a14]" /> },
  { name: "Background", body: <span className="block h-10 w-full rounded-[4px] bg-[linear-gradient(135deg,#1b2a10,#2f4a12)]" /> },
  { name: "Headline", body: <span className="block text-[0.8125rem] font-semibold leading-tight">Run the city.</span> },
  { name: "Call to action", body: <span className="inline-block rounded-full bg-lime px-2 py-0.5 text-[0.6875rem] font-semibold text-[var(--c-lime-ink)]">Try them on, Level 1</span> },
  { name: "Brand style", body: <span className="flex gap-1">{["#b6ff3b", "#0d1400", "#f4f5f7"].map((c) => <span key={c} className="size-4 rounded-full ring-1 ring-line-strong" style={{ background: c }} />)}</span> },
];

const STEPS = [
  { icon: Users, name: "Audience context", text: "Aggregated traffic: how busy, how fast, broad audience mix." },
  { icon: Sparkles, name: "AI-assisted layout", text: "Chooses and arranges approved parts for the moment." },
  { icon: ShieldCheck, name: "Brand validation", text: "Checks guidelines; review before anything is shown." },
];

function Arrow() {
  return (
    <span className="flex items-center justify-center text-ink-2" aria-hidden>
      <ArrowDown size={16} className="lg:hidden" />
      <ArrowRight size={16} className="hidden lg:block" />
    </span>
  );
}

export function CompositionConcept() {
  return (
    <figure className="rounded-[var(--r-md)] border border-dashed border-ice/40 bg-graphite p-4 sm:p-6">
      <p className="inline-flex items-center gap-2 rounded-[var(--r-xs)] bg-ice px-2.5 py-1 text-[0.8125rem] font-medium text-void">Future concept · not yet implemented</p>
      <div className="mt-5 grid items-center gap-3 lg:grid-cols-[minmax(0,1.1fr)_auto_minmax(0,1fr)_auto_minmax(0,0.9fr)]">
        <div>
          <p className="t-meta mb-2">Approved assets</p>
          <ul className="grid grid-cols-2 gap-2">
            {INPUTS.map((i) => (
              <li key={i.name} className="rounded-[var(--r-sm)] bg-void p-2.5 last:col-span-2">
                <p className="t-meta mb-1.5 text-[0.5625rem]">{i.name}</p>
                {i.body}
              </li>
            ))}
          </ul>
        </div>
        <Arrow />
        <ol className="space-y-2">
          {STEPS.map((s) => (
            <li key={s.name} className="rounded-[var(--r-sm)] bg-void p-3">
              <p className="flex items-center gap-2 font-medium">
                <s.icon size={15} aria-hidden className="text-ice" />
                {s.name}
              </p>
              <p className="mt-0.5 text-[0.8125rem] text-ink-2">{s.text}</p>
            </li>
          ))}
        </ol>
        <Arrow />
        <div>
          <p className="t-meta mb-2">Digital signage</p>
          <div className="rounded-[12px] bg-[#0f1318] p-1.5 ring-1 ring-line-strong">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[7px] bg-[linear-gradient(160deg,#1b2a10_0%,#2f4a12_70%,#4d7a14_100%)] [container-type:size]" aria-hidden>
              <span className="absolute right-[10%] top-[12%] aspect-square w-[46%] rotate-[-12deg] rounded-[30%] bg-gradient-to-br from-lime to-[#4d7a14] shadow-[0_20px_40px_-10px_rgb(0_0_0/0.6)]" />
              <p className="absolute left-[8%] top-[8%] text-[6cqw] font-medium uppercase tracking-[0.14em] text-lime">Trailhead</p>
              <p className="absolute bottom-[22%] left-[8%] text-[13cqw] font-semibold leading-none text-white">Run the city.</p>
              <span className="absolute bottom-[8%] left-[8%] rounded-full bg-lime px-[4cqw] py-[1.5cqw] text-[5cqw] font-semibold text-[var(--c-lime-ink)]">Try them on, Level 1</span>
            </div>
          </div>
          <p className="mt-2 text-[0.75rem] text-ink-2">Concept artwork, not system output.</p>
        </div>
      </div>
      <figcaption className="sr-only">
        Future concept: approved assets such as a product image, background, headline, call to action and brand style pass through audience context, AI-assisted layout and brand validation before reaching digital signage.
      </figcaption>
    </figure>
  );
}
