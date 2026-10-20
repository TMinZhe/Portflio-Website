import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "quiet";

const base =
  "group relative inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--r-sm)] px-5 text-[0.9375rem] font-medium tracking-[-0.01em] transition-[background-color,color,border-color,transform] duration-[var(--d-fast)] ease-[var(--ease-standard)] active:translate-y-px";

const variants: Record<Variant, string> = {
  primary: "bg-lime text-[var(--c-lime-ink)] hover:bg-[#c8ff6a]",
  secondary: "border border-line-strong text-ink hover:border-ink-2 hover:bg-white/[0.04]",
  quiet: "px-2 text-ink-2 hover:text-ink underline-offset-4 hover:underline",
};

type Props = {
  href: string | null;
  variant?: Variant;
  children: ReactNode;
  /** Shown to assistive tech and as tooltip when href is null. */
  pendingNote?: string;
  external?: boolean;
  className?: string;
} & Omit<ComponentProps<"a">, "href" | "children" | "className">;

/**
 * Link styled as a button. When href is null the control renders disabled with
 * a "pending" note instead of linking nowhere — no dead links.
 */
export function Action({ href, variant = "secondary", children, pendingNote, external, className = "", ...rest }: Props) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (!href) {
    return (
      <span
        role="link"
        aria-disabled="true"
        title={pendingNote ?? "Not available yet"}
        className={`${base} cursor-not-allowed border border-dashed border-line-strong text-ink-2 ${className}`}
      >
        {children}
        <span className="t-meta text-[0.6875rem]">pending</span>
      </span>
    );
  }
  return (
    <a
      href={href}
      className={cls}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      {...rest}
    >
      {children}
      {external && <span className="sr-only">(opens in a new tab)</span>}
    </a>
  );
}
