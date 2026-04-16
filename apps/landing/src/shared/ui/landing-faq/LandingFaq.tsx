import type { SupportedLocale } from "@/src/shared/config/metadata";
import { getLandingCopy } from "@/src/shared/i18n/landing-content";
import { getLandingFaqItems } from "@/src/shared/seo/landing-faq";

/** Видимый FAQ — совпадает с разметкой FAQPage в JSON-LD на главной. */
export function LandingFaq({ lang }: { lang: SupportedLocale }) {
  const copy = getLandingCopy(lang);
  const items = getLandingFaqItems(lang);

  return (
    <section
      id="faq"
      className="scroll-mt-28 border-t border-violet-100/90 py-16 sm:scroll-mt-32 sm:py-24"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2
          id="faq-heading"
          className="text-center font-[family-name:var(--font-syne)] text-3xl font-bold text-[var(--landing-ink)] sm:text-4xl"
        >
          {copy.faqHeading}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-[var(--landing-muted)]">
          {copy.faqSub}
        </p>
        <ul className="mt-10 space-y-3" aria-labelledby="faq-heading">
          {items.map((item) => (
            <li key={item.question}>
              <details className="landing-glass group rounded-2xl border border-violet-100/90 px-5 py-1 shadow-sm open:shadow-md">
                <summary className="cursor-pointer list-none py-4 font-semibold text-[var(--landing-ink)] marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-3">
                    <span>{item.question}</span>
                    <span className="mt-0.5 shrink-0 text-violet-500 transition group-open:rotate-180">
                      <i className="pi pi-chevron-down text-sm" aria-hidden />
                    </span>
                  </span>
                </summary>
                <p className="border-t border-violet-100/80 pb-4 pt-3 text-[var(--landing-muted)] leading-relaxed">
                  {item.answer}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
