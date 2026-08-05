import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { DealoMark } from "./dealo-mark";

type Props = {
  children: ReactNode;
  merchantName: string;
};

export async function PartnerShell({ children, merchantName }: Props) {
  const t = await getTranslations("partnerShell");

  return (
    <div className="bg-background min-h-screen lg:flex">
      <a
        className="focus:bg-surface sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:p-3"
        href="#partner-main-content"
      >
        {t("skip")}
      </a>
      <aside className="bg-surface hidden w-64 shrink-0 border-r lg:flex lg:flex-col">
        <div className="bg-[#101828] px-5 py-6">
          <DealoMark inverse />
          <p className="mt-4 text-xs font-semibold tracking-[0.12em] text-slate-300 uppercase">
            {t("eyebrow")}
          </p>
        </div>
        <nav
          aria-label={t("primary")}
          className="flex flex-1 flex-col gap-1 p-4"
        >
          <a
            className="bg-brand-soft text-brand rounded-[var(--radius-sm)] px-4 py-3 text-sm font-bold"
            href="#overview"
          >
            {t("overview")}
          </a>
          <a
            className="hover:bg-surface-muted rounded-[var(--radius-sm)] px-4 py-3 text-sm font-semibold"
            href="#venues"
          >
            {t("venues")}
          </a>
          <a
            className="hover:bg-surface-muted rounded-[var(--radius-sm)] px-4 py-3 text-sm font-semibold"
            href="#offers"
          >
            {t("offers")}
          </a>
          <div className="mt-auto border-t pt-4">
            <Link
              className="hover:bg-surface-muted block rounded-[var(--radius-sm)] px-4 py-3 text-sm font-semibold"
              href="/"
            >
              {t("viewSite")}
            </Link>
          </div>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="bg-surface flex min-h-[72px] items-center justify-between gap-4 border-b px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <DealoMark showWordmark={false} />
            <p className="text-sm font-extrabold">{t("overview")}</p>
          </div>
          <div className="hidden lg:block">
            <p className="text-foreground-muted text-xs font-bold tracking-[0.1em] uppercase">
              {t("eyebrow")}
            </p>
            <p className="mt-1 text-sm font-bold">{merchantName}</p>
          </div>
          <Link
            className="bg-brand hover:bg-brand-strong inline-flex min-h-10 items-center rounded-full px-4 text-sm font-bold text-white shadow-sm"
            href="/merchant#create-offer"
          >
            {t("createOffer")}
          </Link>
        </header>
        <main id="partner-main-content">{children}</main>
      </div>
    </div>
  );
}
