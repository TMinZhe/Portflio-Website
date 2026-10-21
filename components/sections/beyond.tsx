import { beyond } from "@/content/beyond";
import { known } from "@/lib/content";

/** Beyond Code: entrepreneurship and leadership, as a short editorial list. */
export function Beyond() {
  return (
    <section id="beyond" aria-labelledby="beyond-title" className="relative z-[var(--z-content)] bg-void pt-[var(--section-y)]">
      <div className="shell grid-12 gap-y-10">
        <h2 id="beyond-title" className="t-h1 col-span-full">
          Beyond code
        </h2>
        <ul className="col-span-full lg:col-span-9 lg:col-start-4">
          {beyond.map((b) => (
            <li key={b.title} data-reveal className="grid gap-x-8 gap-y-2 border-t border-line py-8 md:grid-cols-[12rem_1fr]">
              <p className="t-meta pt-1.5">{b.kind}</p>
              <div>
                <h3 className="t-h3">
                  {b.href ? (
                    <a href={b.href} className="transition-colors hover:text-lime">
                      {b.title}
                    </a>
                  ) : (
                    b.title
                  )}
                </h3>
                {known(b.role) && <p className="mt-1 text-ink-2">{b.role}</p>}
                {known(b.detail) && <p className="mt-3 max-w-[56ch]">{b.detail}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
