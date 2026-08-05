import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/app-shell";
import { DealCard } from "@/components/deal-card";
import { Link } from "@/i18n/navigation";
import { getPublicDeals } from "@/features/deals/queries";

const categoryIcons = ["⚡", "🏠", "🍽️", "✈️"];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: "en-GB" | "pt-PT" }>;
}) {
  const [{ locale }, t, result] = await Promise.all([
    params,
    getTranslations("home"),
    getPublicDeals(),
  ]);
  const recommendedDeals = result.deals.slice(0, 4);

  return (
    <AppShell>
      <section className="mx-auto max-w-[1240px] px-4 py-6 pb-20 sm:px-6 xl:py-6 xl:pb-8">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
          <section className="bg-brand-soft relative overflow-hidden rounded-[18px] px-6 py-9 sm:px-9 sm:py-10">
            <div className="relative z-10 max-w-lg">
              <p className="text-brand text-xs font-extrabold tracking-[0.16em] uppercase">
                {t("eyebrow")}
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.055em] text-balance sm:text-4xl">
                {t("dashboardTitle")}
              </h1>
              <p className="text-foreground-muted mt-3 max-w-md text-sm leading-6 sm:text-base">
                {t("dashboardDescription")}
              </p>
              <Link
                className="bg-brand hover:bg-brand-strong mt-6 inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-5 text-sm font-bold text-white shadow-sm"
                href="/deals"
              >
                {t("dashboardAction")}
              </Link>
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] sm:block"
            >
              <div className="bg-surface/75 absolute top-8 right-9 size-12 rounded-full" />
              <div className="bg-brand/15 absolute top-14 right-24 size-28 rounded-full" />
              <div className="bg-brand absolute right-12 bottom-[-54px] size-44 rounded-full" />
              <div className="bg-surface absolute right-20 bottom-10 grid size-24 place-items-center rounded-[28px] shadow-[var(--shadow-card)]">
                <span className="text-brand text-4xl">✦</span>
              </div>
            </div>
          </section>

          <aside className="bg-surface rounded-[18px] border p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-foreground-muted text-xs font-bold">
                  {t("liveOffers")}
                </p>
                <p className="mt-2 text-3xl font-black tracking-[-0.06em]">
                  {result.deals.length}
                </p>
              </div>
              <span className="bg-accent/10 text-accent grid size-10 place-items-center rounded-full text-lg">
                ↑
              </span>
            </div>
            <p className="text-foreground-muted mt-3 text-sm leading-6">
              {t("liveOffersDescription")}
            </p>
            <div className="mt-5 flex h-9 items-end gap-1.5" aria-hidden>
              {[30, 52, 40, 74, 58, 86, 100].map((height) => (
                <span
                  className="bg-accent/70 flex-1 rounded-t-full"
                  key={height}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </aside>
        </div>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-brand text-xs font-extrabold tracking-[0.16em] uppercase">
                {t("recommendedEyebrow")}
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.045em]">
                {t("recommendedTitle")}
              </h2>
            </div>
            <Link className="text-brand text-sm font-bold" href="/deals">
              {t("recommendedAction")}
            </Link>
          </div>

          {recommendedDeals.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {recommendedDeals.map((deal) => (
                <DealCard
                  deal={deal}
                  isSignedIn={result.isSignedIn}
                  key={deal.id}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {categoryIcons.map((icon, index) => (
                <Link
                  className="bg-surface hover:border-brand/30 rounded-[16px] border p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5"
                  href="/deals"
                  key={icon}
                >
                  <span
                    aria-hidden
                    className="bg-brand-soft grid size-12 place-items-center rounded-[14px] text-2xl"
                  >
                    {icon}
                  </span>
                  <h3 className="mt-5 font-extrabold tracking-[-0.02em]">
                    {t(`categories.${index}.title`)}
                  </h3>
                  <p className="text-foreground-muted mt-1 text-sm leading-6">
                    {t(`categories.${index}.description`)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          {["free", "safe", "updated", "community"].map((benefit) => (
            <article
              className="bg-surface flex items-start gap-3 rounded-[14px] border p-4"
              key={benefit}
            >
              <span className="bg-accent/10 text-accent grid size-9 shrink-0 place-items-center rounded-full text-sm">
                ✓
              </span>
              <div>
                <h2 className="text-sm font-extrabold">
                  {t(`benefits.${benefit}.title`)}
                </h2>
                <p className="text-foreground-muted mt-1 text-xs leading-5">
                  {t(`benefits.${benefit}.description`)}
                </p>
              </div>
            </article>
          ))}
        </section>
      </section>
    </AppShell>
  );
}
