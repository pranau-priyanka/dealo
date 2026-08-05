import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/app-shell";
import { DealCard } from "@/components/deal-card";
import { getPublicDeals } from "@/features/deals/queries";

function normaliseSearch(value: string) {
  return value.trim().toLocaleLowerCase("en-GB");
}

export default async function DealsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: "en-GB" | "pt-PT" }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ locale }, { q }, t, result] = await Promise.all([
    params,
    searchParams,
    getTranslations("deals"),
    getPublicDeals(),
  ]);
  const query = typeof q === "string" ? q.trim().slice(0, 100) : "";
  const normalisedQuery = normaliseSearch(query);
  const deals = normalisedQuery
    ? result.deals.filter((deal) =>
        [deal.title, deal.description, deal.venueName, deal.city]
          .filter(Boolean)
          .some((value) =>
            normaliseSearch(value as string).includes(normalisedQuery),
          ),
      )
    : result.deals;

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
        <form
          className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
          role="search"
        >
          <label className="sr-only" htmlFor="deal-search">
            {t("searchLabel")}
          </label>
          <input
            className="bg-surface min-h-12 flex-1 rounded-[var(--radius-sm)] border px-4"
            defaultValue={query}
            id="deal-search"
            name="q"
            placeholder={t("searchPlaceholder")}
            type="search"
          />
          <button className="bg-brand hover:bg-brand-strong min-h-12 rounded-[var(--radius-sm)] px-5 font-semibold text-white">
            {t("searchAction")}
          </button>
        </form>
        {deals.length === 0 ? (
          <div className="bg-surface mt-8 rounded-[var(--radius-md)] border p-8">
            <h2 className="text-xl font-bold">
              {query ? t("empty.searchTitle") : t("empty.title")}
            </h2>
            <p className="text-foreground-muted mt-2">
              {query ? t("empty.searchDescription") : t("empty.description")}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <DealCard
                deal={deal}
                isSignedIn={result.isSignedIn}
                key={deal.id}
                locale={locale}
              />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
