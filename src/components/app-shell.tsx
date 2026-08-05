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
      <div className="mx-auto max-w-[1540px] xl:grid xl:grid-cols-[230px_minmax(0,1fr)] xl:gap-6 xl:px-5 xl:py-6">
        <aside className="bg-surface hidden min-h-[calc(100vh-3rem)] rounded-[18px] border p-4 shadow-[var(--shadow-card)] xl:flex xl:flex-col">
          <Link className="px-2 py-1" href="/" aria-label="Dealo home">
            <DealoMark />
          </Link>
          <nav aria-label={t("primary")} className="mt-8 space-y-1">
            <Link
              className="bg-brand-soft text-brand flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-bold"
              href="/"
            >
              <span aria-hidden>⌂</span>
              {t("home")}
            </Link>
            <Link
              className="hover:bg-surface-muted flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-semibold"
              href="/deals"
            >
              <span aria-hidden>⌕</span>
              {t("discover")}
            </Link>
            <Link
              className="hover:bg-surface-muted flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-semibold"
              href="/saved"
            >
              <span aria-hidden>♡</span>
              {t("saved")}
            </Link>
            <Link
              className="hover:bg-surface-muted flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-semibold"
              href="/merchant"
            >
              <span aria-hidden>▦</span>
              {t("merchant")}
            </Link>
          </nav>
          <div className="mt-auto border-t pt-4">
            <Link
              className="hover:bg-surface-muted flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-semibold"
              href="/settings/language"
            >
              <span aria-hidden>⚙</span>
              {t("settings")}
            </Link>
          </div>
        </aside>
        <div className="min-w-0">
          <header className="bg-surface/95 sticky top-0 z-40 border-b backdrop-blur xl:static xl:rounded-[18px] xl:border">
            <div className="flex min-h-[70px] items-center gap-3 px-4 sm:px-6 xl:px-7">
              <Link
                className="shrink-0 xl:hidden"
                href="/"
                aria-label="Dealo home"
              >
                <DealoMark />
              </Link>
              <div className="hidden max-w-xl flex-1 xl:block">
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
              <nav
                aria-label={t("primary")}
                className="hidden items-center gap-4 lg:flex xl:hidden"
              >
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
                  href="/merchant"
                >
                  {t("merchant")}
                </Link>
              </nav>
              <div className="ml-auto flex shrink-0 items-center gap-2">
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
          <footer className="mb-24 rounded-none bg-[#111827] text-slate-200 md:mb-0 xl:mt-6 xl:rounded-[18px]">
            <div className="flex flex-col justify-between gap-6 px-6 py-8 sm:flex-row sm:items-end">
              <div>
                <DealoMark inverse />
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
                  {t("footerDescription")}
                </p>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
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
        </div>
      </div>
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
