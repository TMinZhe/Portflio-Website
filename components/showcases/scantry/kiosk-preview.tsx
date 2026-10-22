import { KioskDevice, KioskScreen, PseudoQr } from "./kiosk-parts";

/*
 * Still preview for the homepage and the case-study cover: the kiosk as a
 * physical unit, mid-way through admitting a fictional guest. Decorative to
 * assistive tech; the caller labels it as an illustration.
 */

export function KioskPreview() {
  return (
    <div aria-hidden className="relative flex h-full flex-col overflow-hidden rounded-[var(--r-md)] bg-[radial-gradient(120%_80%_at_50%_0%,#1d2733_0%,var(--c-graphite)_55%,var(--c-void)_100%)] p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[0.9375rem]">
          <span className="size-2 rounded-full bg-lime" />
          Dining entrance · kiosk 2
        </p>
        <p className="t-meta">Lunch 11:30–14:00</p>
      </div>

      <div className="relative mt-5 grid flex-1 items-end gap-5 sm:grid-cols-[1fr_9rem]">
        <KioskDevice>
          <KioskScreen mark="tick" tone="ok" title="Welcome, Priya!" line="Enjoy your lunch." />
        </KioskDevice>
        <div className="hidden flex-col gap-2 sm:flex">
          <div className="rounded-[var(--r-sm)] bg-white p-2 text-[#14181d]">
            <PseudoQr seed="D-0142" className="w-full" />
          </div>
          <p className="t-meta text-center text-[0.625rem]">Pass D-0142</p>
        </div>
      </div>

      <div className="pv-optional mt-5 grid grid-cols-3 gap-2 text-center">
        {[
          ["Scan", "QR pass"],
          ["Verify", "5 matching frames"],
          ["Admit", "and log it"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-[var(--r-sm)] bg-[var(--c-void)] px-2 py-2.5">
            <p className="t-meta text-[0.625rem]">{k}</p>
            <p className="mt-1 text-[0.8125rem] text-ice">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
