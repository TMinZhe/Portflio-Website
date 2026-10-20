/** Mandatory disclosure on every illustrative showcase. */
export function SchematicLabel({ children }: { children?: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-[var(--r-xs)] border border-line-strong px-2.5 py-1 text-[0.8125rem] text-ink-2">
      <span aria-hidden className="size-1.5 rounded-full bg-ice" />
      {children ?? "Illustrative schematic with synthetic data. Not the production interface."}
    </p>
  );
}
