import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/app-shell";
import { Link } from "@/i18n/navigation";
import { getPublicDeals } from "@/features/deals/queries";

export default async function DealsPage() {
  const [t, deals] = await Promise.all([
    getTranslations("deals"),
    getPublicDeals(),
  ]);
  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-4 py-12 pb-28 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-brand text-sm font-bold">{t("eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">{t("title")}</h1>
          <p className="text-foreground-muted mt-3 text-lg">
            {t("description")}
          </p>
        </div>
        {deals.length === 0 ? (
          <div className="bg-surface mt-8 rounded-[var(--radius-md)] border p-8">
            <h2 className="text-xl font-bold">{t("empty.title")}</h2>
            <p className="text-foreground-muted mt-2">
              {t("empty.description")}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <article
                className="bg-surface rounded-[var(--radius-md)] border p-5 shadow-sm"
                key={deal.id}
              >
                <p className="text-brand text-sm font-bold">
                  {deal.venueName} · {deal.city}
                </p>
                <h2 className="mt-2 text-xl font-bold">{deal.title}</h2>
                {deal.discountPercent && (
                  <p className="mt-4 text-2xl font-black">
                    {t("discount", { value: deal.discountPercent })}
                  </p>
                )}
                <p className="text-foreground-muted mt-2 text-sm">
                  {deal.description}
                </p>
                <Link
                  className="text-brand mt-5 inline-block text-sm font-bold underline"
                  href="/signup"
                >
                  {t("savePrompt")}
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
