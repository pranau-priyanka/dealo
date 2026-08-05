import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/features/auth/actions";
import { getCurrentUser } from "@/lib/auth";
import { DealoMark } from "./dealo-mark";
import { LanguageSwitcher } from "./language-switcher";
export async function AppShell({ children }: { children: ReactNode }) {
  const t = await getTranslations("navigation");
  const user = await getCurrentUser();
  const locale = await getLocale();
  return (
    <div className="bg-background min-h-screen">
      <a
        className="focus:bg-surface sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:p-3"
        href="#main-content"
      >
        {t("skip")}
      </a>
      <header className="bg-surface/95 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link className="shrink-0" href="/" aria-label="Dealo home">
            <DealoMark />
          </Link>
          <nav
            aria-label={t("primary")}
            className="hidden items-center gap-5 lg:flex"
          >
            <Link className="hover:text-brand text-sm font-semibold" href="/">
              {t("home")}
            </Link>
            <Link
              className="hover:text-brand text-sm font-semibold"
              href="/deals"
            >
              {t("discover")}
            </Link>
            <Link
              className="hover:text-brand text-sm font-semibold"
              href="/saved"
            >
              {t("saved")}
            </Link>
            <Link
              className="hover:text-brand text-sm font-semibold"
              href="/settings/language"
            >
              {t("settings")}
            </Link>
            <Link
              className="hover:text-brand text-sm font-semibold"
              href="/merchant"
            >
              {t("merchant")}
            </Link>
          </nav>
          <div className="ml-auto hidden max-w-64 flex-1 lg:block">
            <form action={`/${locale}/deals`} role="search">
              <label className="sr-only" htmlFor="shell-search">
                {t("searchLabel")}
              </label>
              <input
                className="bg-background placeholder:text-foreground-muted focus:border-brand h-10 w-full rounded-full border px-4 text-sm outline-none"
                id="shell-search"
                name="q"
                placeholder={t("searchPlaceholder")}
                type="search"
              />
            </form>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher />
            {user ? (
              <>
                <span
                  aria-label={t("signedInUser")}
                  className="bg-brand-soft text-brand hidden size-10 items-center justify-center rounded-full text-sm font-bold sm:inline-flex"
                >
                  {user.email?.slice(0, 1).toUpperCase() ?? "D"}
                </span>
                <form action={signOut} className="hidden xl:block">
                  <input name="locale" type="hidden" value={locale} />
                  <button className="hover:bg-surface-muted min-h-10 rounded-full px-3 text-sm font-semibold">
                    {t("signOut")}
                  </button>
                </form>
              </>
            ) : (
              <Link
                className="bg-brand hover:bg-brand-strong hidden min-h-10 items-center rounded-full px-4 text-sm font-semibold text-white shadow-sm sm:inline-flex"
                href="/login"
              >
                {t("signIn")}
              </Link>
            )}
          </div>
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="bg-[#101828] pb-24 text-slate-200 md:pb-8">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_.8fr] lg:px-8">
          <div>
            <DealoMark inverse />
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
              {t("footerDescription")}
            </p>
          </div>
          <div className="flex items-start gap-7 text-sm font-semibold">
            <Link className="hover:text-white" href="/deals">
              {t("discover")}
            </Link>
            <Link className="hover:text-white" href="/merchant">
              {t("merchant")}
            </Link>
            <Link className="hover:text-white" href="/settings/language">
              {t("settings")}
            </Link>
          </div>
        </div>
      </footer>
      <nav
        aria-label={t("mobile")}
        className="bg-surface/95 fixed inset-x-0 bottom-0 z-40 flex justify-around border-t p-2 backdrop-blur md:hidden"
      >
        <Link
          className="min-h-11 rounded-[var(--radius-sm)] px-3 py-3 text-sm font-semibold"
          href="/"
        >
          {t("home")}
        </Link>
        <Link
          className="min-h-11 rounded-[var(--radius-sm)] px-3 py-3 text-sm font-semibold"
          href="/deals"
        >
          {t("discover")}
        </Link>
        <Link
          className="min-h-11 rounded-[var(--radius-sm)] px-3 py-3 text-sm font-semibold"
          href="/saved"
        >
          {t("saved")}
        </Link>
        <Link
          className="min-h-11 rounded-[var(--radius-sm)] px-3 py-3 text-sm font-semibold"
          href="/merchant"
        >
          {t("merchant")}
        </Link>
      </nav>
    </div>
  );
}
