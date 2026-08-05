import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";
export async function AppShell({ children }: { children: ReactNode }) {
  const t = await getTranslations("navigation");
  return (
    <div className="min-h-screen">
      <a
        className="focus:bg-surface sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:p-3"
        href="#main-content"
      >
        {t("skip")}
      </a>
      <header className="bg-surface/95 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            className="text-brand text-xl font-black tracking-[-0.04em]"
            href="/"
            aria-label="Dealo home"
          >
            dealo<span className="text-accent">.</span>
          </Link>
          <nav
            aria-label={t("primary")}
            className="hidden items-center gap-6 md:flex"
          >
            <Link className="hover:text-brand text-sm font-semibold" href="/">
              {t("discover")}
            </Link>
            <Link
              className="hover:text-brand text-sm font-semibold"
              href="/saved"
            >
              {t("saved")}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link
              className="bg-brand hover:bg-brand-strong hidden min-h-11 items-center rounded-[var(--radius-sm)] px-4 text-sm font-semibold text-white sm:inline-flex"
              href="/login"
            >
              {t("signIn")}
            </Link>
          </div>
        </div>
      </header>
      <main id="main-content">{children}</main>
      <nav
        aria-label={t("mobile")}
        className="bg-surface fixed inset-x-0 bottom-0 z-40 flex justify-around border-t p-2 md:hidden"
      >
        <Link
          className="min-h-11 rounded-lg px-4 py-3 text-sm font-semibold"
          href="/"
        >
          {t("discover")}
        </Link>
        <Link
          className="min-h-11 rounded-lg px-4 py-3 text-sm font-semibold"
          href="/saved"
        >
          {t("saved")}
        </Link>
        <Link
          className="min-h-11 rounded-lg px-4 py-3 text-sm font-semibold"
          href="/settings/language"
        >
          {t("settings")}
        </Link>
      </nav>
    </div>
  );
}
