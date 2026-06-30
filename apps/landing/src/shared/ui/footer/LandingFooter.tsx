import Link from "next/link";
import type { SupportedLocale } from "@/src/shared/config/metadata";
import { getFooterCopy } from "@/src/shared/i18n/footer-copy";

export function LandingFooter({ lang }: { lang: SupportedLocale }) {
  const copy = getFooterCopy(lang);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-violet-100/80 bg-white/70 py-4 text-center text-sm text-[var(--landing-muted)] backdrop-blur-sm pb-24 sm:pb-5">
      <p>
        {copy.copyright} {year} Movie Match ·{" "}
        <Link
          href={`/${lang}/privacy`}
          className="font-medium text-violet-600 underline-offset-4 hover:text-violet-800 hover:underline"
          aria-label={copy.privacyPolicyAria}
        >
          {copy.privacyPolicy}
        </Link>
      </p>
    </footer>
  );
}
