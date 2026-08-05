import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { submitCommunityDeal } from "@/features/community/actions";
import { getCurrentUser } from "@/lib/auth";

const categories = [
  "technology",
  "home",
  "food",
  "travel",
  "fashion",
  "beauty",
  "sports",
  "other",
] as const;

export default async function SubmitDealPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: "en-GB" | "pt-PT" }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const [{ locale }, { notice }, user, t] = await Promise.all([
    params,
    searchParams,
    getCurrentUser(),
    getTranslations("community"),
  ]);
  if (!user) {
    redirect(
      `/${locale}/login?message=sign-in-required&next=${encodeURIComponent(`/${locale}/submit`)}`,
    );
  }

  const feedback =
    notice === "submitted"
      ? t("submissionSubmitted")
      : notice === "invalid"
        ? t("submissionInvalid")
        : notice === "failed"
          ? t("submissionFailed")
          : null;

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-4 py-10 pb-28 sm:px-6 lg:px-8">
        <p className="text-brand text-xs font-extrabold tracking-[0.16em] uppercase">
          {t("submissionEyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-4xl">
          {t("submissionTitle")}
        </h1>
        <p className="text-foreground-muted mt-3 max-w-2xl leading-7">
          {t("submissionDescription")}
        </p>
        {feedback && (
          <p
            className="bg-brand-soft text-brand mt-6 rounded-[var(--radius-sm)] p-4 text-sm font-semibold"
            role="status"
          >
            {feedback}
          </p>
        )}
        <form
          action={submitCommunityDeal}
          className="bg-surface mt-8 space-y-5 rounded-[var(--radius-lg)] border p-6 shadow-[var(--shadow-card)] sm:p-8"
        >
          <input name="locale" type="hidden" value={locale} />
          <label className="block text-sm font-semibold" htmlFor="deal-title">
            {t("submissionTitleLabel")}
            <input
              className="bg-background mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border px-3"
              id="deal-title"
              maxLength={160}
              name="title"
              required
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label
              className="block text-sm font-semibold"
              htmlFor="retailer-name"
            >
              {t("retailerLabel")}
              <input
                className="bg-background mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border px-3"
                id="retailer-name"
                maxLength={120}
                name="retailerName"
                required
              />
            </label>
            <label
              className="block text-sm font-semibold"
              htmlFor="deal-category"
            >
              {t("categoryLabel")}
              <select
                className="bg-background mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border px-3"
                defaultValue="technology"
                id="deal-category"
                name="category"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {t(`categories.${category}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-sm font-semibold" htmlFor="deal-url">
            {t("dealUrlLabel")}
            <input
              className="bg-background mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border px-3"
              id="deal-url"
              inputMode="url"
              maxLength={2_048}
              name="dealUrl"
              placeholder="https://"
              required
              type="url"
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label
              className="block text-sm font-semibold"
              htmlFor="current-price"
            >
              {t("currentPriceLabel")}
              <input
                className="bg-background mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border px-3"
                id="current-price"
                inputMode="decimal"
                min="0.01"
                name="currentPrice"
                required
                step="0.01"
                type="number"
              />
            </label>
            <label
              className="block text-sm font-semibold"
              htmlFor="previous-price"
            >
              {t("previousPriceLabel")}
              <input
                className="bg-background mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border px-3"
                id="previous-price"
                inputMode="decimal"
                min="0.01"
                name="previousPrice"
                step="0.01"
                type="number"
              />
            </label>
          </div>
          <label
            className="block text-sm font-semibold"
            htmlFor="deal-description"
          >
            {t("submissionDescriptionLabel")}
            <textarea
              className="bg-background mt-2 min-h-28 w-full rounded-[var(--radius-sm)] border p-3"
              id="deal-description"
              maxLength={2_000}
              name="description"
            />
          </label>
          <p className="text-foreground-muted text-sm leading-6">
            {t("submissionModerationNote")}
          </p>
          <Button type="submit">{t("submissionAction")}</Button>
        </form>
      </section>
    </AppShell>
  );
}
