import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  changeDealStatus,
  createDeal,
  createMerchant,
  createVenue,
} from "@/features/merchant/actions";
import { getMerchantWorkspace } from "@/features/merchant/queries";
import {
  getDealStatusTransitions,
  type DealStatus,
} from "@/features/merchant/types";
import { getCurrentUser } from "@/lib/auth";

type Locale = "en-GB" | "pt-PT";

function toDateTimeInputValue(date: Date) {
  return date.toISOString().slice(0, 16);
}

function noticeMessage(
  t: Awaited<ReturnType<typeof getTranslations>>,
  notice: string | undefined,
) {
  const messages: Record<string, string> = {
    "merchant-created": t("feedback.merchantCreated"),
    "venue-created": t("feedback.venueCreated"),
    "deal-created": t("feedback.dealCreated"),
    "status-updated": t("feedback.statusUpdated"),
    "invalid-merchant": t("feedback.invalidMerchant"),
    "invalid-venue": t("feedback.invalidVenue"),
    "invalid-deal": t("feedback.invalidDeal"),
    "merchant-exists": t("feedback.merchantExists"),
    "merchant-required": t("feedback.merchantRequired"),
    "venue-required": t("feedback.venueRequired"),
    "invalid-status": t("feedback.invalidStatus"),
    "merchant-create-failed": t("feedback.merchantCreateFailed"),
    "venue-create-failed": t("feedback.venueCreateFailed"),
    "deal-create-failed": t("feedback.dealCreateFailed"),
    "status-update-failed": t("feedback.statusUpdateFailed"),
  };
  return notice ? messages[notice] : undefined;
}

function DealStatusBadge({
  status,
  label,
}: {
  status: DealStatus;
  label: string;
}) {
  const styles: Record<DealStatus, string> = {
    draft: "bg-surface-muted text-foreground-muted",
    published: "bg-brand-soft text-brand-strong",
    paused: "bg-amber-100 text-amber-900",
    expired: "bg-stone-200 text-stone-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles[status]}`}
    >
      {label}
    </span>
  );
}

export default async function MerchantPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const [{ locale }, { notice }, user] = await Promise.all([
    params,
    searchParams,
    getCurrentUser(),
  ]);
  if (!user) {
    redirect(
      `/${locale}/login?message=sign-in-required&next=${encodeURIComponent(`/${locale}/merchant`)}`,
    );
  }

  const [t, workspace] = await Promise.all([
    getTranslations("merchant"),
    getMerchantWorkspace(),
  ]);
  const message = noticeMessage(t, notice);

  if (!workspace.merchant) {
    return (
      <AppShell>
        <section className="mx-auto max-w-2xl px-4 py-12 pb-28 sm:px-6 lg:px-8">
          <p className="text-brand text-sm font-bold">{t("eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            {t("onboarding.title")}
          </h1>
          <p className="text-foreground-muted mt-3 text-lg">
            {t("onboarding.description")}
          </p>
          {message && (
            <p
              className="bg-brand-soft text-brand-strong mt-6 rounded-[var(--radius-sm)] p-4 text-sm font-semibold"
              role="status"
            >
              {message}
            </p>
          )}
          <form
            action={createMerchant}
            className="bg-surface mt-8 rounded-[var(--radius-lg)] border p-6 shadow-[var(--shadow-card)] sm:p-8"
          >
            <input name="locale" type="hidden" value={locale} />
            <label className="block text-sm font-bold" htmlFor="merchant-name">
              {t("onboarding.businessName")}
            </label>
            <input
              className="bg-surface mt-2 min-h-12 w-full rounded-[var(--radius-sm)] border px-4"
              id="merchant-name"
              maxLength={120}
              name="name"
              required
            />
            <p className="text-foreground-muted mt-2 text-sm">
              {t("onboarding.businessHint")}
            </p>
            <Button className="mt-6" type="submit">
              {t("onboarding.action")}
            </Button>
          </form>
        </section>
      </AppShell>
    );
  }

  const now = new Date();
  const defaultStart = new Date(now.getTime() + 60 * 60 * 1_000);
  const defaultEnd = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1_000);
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-4 py-12 pb-28 sm:px-6 lg:px-8">
        <p className="text-brand text-sm font-bold">{t("eyebrow")}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black sm:text-4xl">
              {t("title", { name: workspace.merchant.name })}
            </h1>
            <p className="text-foreground-muted mt-3 text-lg">
              {t("description")}
            </p>
          </div>
          <p className="bg-brand-soft text-brand-strong rounded-full px-4 py-2 text-sm font-bold">
            {t("merchantLabel")}
          </p>
        </div>
        {message && (
          <p
            className="bg-brand-soft text-brand-strong mt-6 rounded-[var(--radius-sm)] p-4 text-sm font-semibold"
            role="status"
          >
            {message}
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <article className="bg-surface rounded-[var(--radius-md)] border p-5">
            <p className="text-foreground-muted text-sm font-semibold">
              {t("summary.venues")}
            </p>
            <p className="mt-2 text-3xl font-black">
              {workspace.venues.length}
            </p>
          </article>
          <article className="bg-surface rounded-[var(--radius-md)] border p-5">
            <p className="text-foreground-muted text-sm font-semibold">
              {t("summary.liveDeals")}
            </p>
            <p className="mt-2 text-3xl font-black">
              {
                workspace.deals.filter((deal) => deal.status === "published")
                  .length
              }
            </p>
          </article>
          <article className="bg-surface rounded-[var(--radius-md)] border p-5">
            <p className="text-foreground-muted text-sm font-semibold">
              {t("summary.totalDeals")}
            </p>
            <p className="mt-2 text-3xl font-black">{workspace.deals.length}</p>
          </article>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="bg-surface rounded-[var(--radius-lg)] border p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-xl font-black">{t("venues.title")}</h2>
            <p className="text-foreground-muted mt-2">
              {t("venues.description")}
            </p>
            {workspace.venues.length > 0 && (
              <ul className="mt-5 space-y-3">
                {workspace.venues.map((venue) => (
                  <li
                    className="bg-surface-muted rounded-[var(--radius-sm)] p-4"
                    key={venue.id}
                  >
                    <p className="font-bold">{venue.name}</p>
                    <p className="text-foreground-muted mt-1 text-sm">
                      {venue.addressLine1}, {venue.city}, {venue.countryCode}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <form action={createVenue} className="mt-6 space-y-4 border-t pt-6">
              <input name="locale" type="hidden" value={locale} />
              <h3 className="font-bold">{t("venues.addTitle")}</h3>
              <label
                className="block text-sm font-semibold"
                htmlFor="venue-name"
              >
                {t("venues.name")}
                <input
                  className="bg-surface mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border px-3"
                  id="venue-name"
                  maxLength={120}
                  name="name"
                  required
                />
              </label>
              <label
                className="block text-sm font-semibold"
                htmlFor="venue-address"
              >
                {t("venues.address")}
                <input
                  className="bg-surface mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border px-3"
                  id="venue-address"
                  maxLength={200}
                  name="addressLine1"
                  required
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
                <label
                  className="block text-sm font-semibold"
                  htmlFor="venue-city"
                >
                  {t("venues.city")}
                  <input
                    className="bg-surface mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border px-3"
                    id="venue-city"
                    maxLength={120}
                    name="city"
                    required
                  />
                </label>
                <label
                  className="block text-sm font-semibold"
                  htmlFor="venue-country"
                >
                  {t("venues.country")}
                  <input
                    className="bg-surface mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border px-3 uppercase"
                    defaultValue={locale === "pt-PT" ? "PT" : "GB"}
                    id="venue-country"
                    maxLength={2}
                    name="countryCode"
                    required
                  />
                </label>
              </div>
              <Button type="submit" variant="secondary">
                {t("venues.action")}
              </Button>
            </form>
          </section>

          <section className="bg-surface rounded-[var(--radius-lg)] border p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-xl font-black">{t("deals.title")}</h2>
            <p className="text-foreground-muted mt-2">
              {t("deals.description")}
            </p>
            {workspace.venues.length === 0 ? (
              <p className="bg-surface-muted mt-6 rounded-[var(--radius-sm)] p-4 text-sm font-semibold">
                {t("deals.venueFirst")}
              </p>
            ) : (
              <form
                action={createDeal}
                className="mt-6 space-y-4 border-t pt-6"
              >
                <input name="locale" type="hidden" value={locale} />
                <h3 className="font-bold">{t("deals.addTitle")}</h3>
                <label
                  className="block text-sm font-semibold"
                  htmlFor="deal-title"
                >
                  {t("deals.name")}
                  <input
                    className="bg-surface mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border px-3"
                    id="deal-title"
                    maxLength={160}
                    name="title"
                    required
                  />
                </label>
                <label
                  className="block text-sm font-semibold"
                  htmlFor="deal-venue"
                >
                  {t("deals.venue")}
                  <select
                    className="bg-surface mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border px-3"
                    id="deal-venue"
                    name="venueId"
                    required
                  >
                    {workspace.venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name} · {venue.city}
                      </option>
                    ))}
                  </select>
                </label>
                <label
                  className="block text-sm font-semibold"
                  htmlFor="deal-discount"
                >
                  {t("deals.discount")}
                  <input
                    className="bg-surface mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border px-3"
                    id="deal-discount"
                    max={100}
                    min={1}
                    name="discountPercent"
                    required
                    type="number"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label
                    className="block text-sm font-semibold"
                    htmlFor="deal-start"
                  >
                    {t("deals.starts")}
                    <input
                      className="bg-surface mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border px-3"
                      defaultValue={toDateTimeInputValue(defaultStart)}
                      id="deal-start"
                      name="startsAt"
                      required
                      type="datetime-local"
                    />
                  </label>
                  <label
                    className="block text-sm font-semibold"
                    htmlFor="deal-end"
                  >
                    {t("deals.ends")}
                    <input
                      className="bg-surface mt-2 min-h-11 w-full rounded-[var(--radius-sm)] border px-3"
                      defaultValue={toDateTimeInputValue(defaultEnd)}
                      id="deal-end"
                      name="endsAt"
                      required
                      type="datetime-local"
                    />
                  </label>
                </div>
                <label
                  className="block text-sm font-semibold"
                  htmlFor="deal-description"
                >
                  {t("deals.descriptionLabel")}
                  <textarea
                    className="bg-surface mt-2 min-h-24 w-full rounded-[var(--radius-sm)] border p-3"
                    id="deal-description"
                    maxLength={2_000}
                    name="description"
                  />
                </label>
                <label
                  className="block text-sm font-semibold"
                  htmlFor="deal-terms"
                >
                  {t("deals.terms")}
                  <textarea
                    className="bg-surface mt-2 min-h-24 w-full rounded-[var(--radius-sm)] border p-3"
                    id="deal-terms"
                    maxLength={2_000}
                    name="terms"
                  />
                </label>
                <Button type="submit">{t("deals.createAction")}</Button>
              </form>
            )}
          </section>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-black">{t("dealList.title")}</h2>
          {workspace.deals.length === 0 ? (
            <p className="bg-surface text-foreground-muted mt-5 rounded-[var(--radius-md)] border p-6">
              {t("dealList.empty")}
            </p>
          ) : (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {workspace.deals.map((deal) => {
                const transitions = getDealStatusTransitions(deal.status);
                return (
                  <article
                    className="bg-surface rounded-[var(--radius-md)] border p-5"
                    key={deal.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold">{deal.title}</h3>
                        <p className="text-foreground-muted mt-1 text-sm">
                          {deal.venueName}
                          {deal.discountPercent
                            ? ` · ${t("dealList.discount", {
                                value: deal.discountPercent,
                              })}`
                            : ""}
                        </p>
                      </div>
                      <DealStatusBadge
                        label={t(`status.${deal.status}`)}
                        status={deal.status}
                      />
                    </div>
                    <p className="text-foreground-muted mt-4 text-sm">
                      {t("dealList.ends", {
                        date: dateFormatter.format(new Date(deal.endsAt)),
                      })}
                    </p>
                    {transitions.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {transitions.map((status) => (
                          <form action={changeDealStatus} key={status}>
                            <input name="locale" type="hidden" value={locale} />
                            <input
                              name="dealId"
                              type="hidden"
                              value={deal.id}
                            />
                            <input name="status" type="hidden" value={status} />
                            <Button
                              type="submit"
                              variant={
                                status === "expired" ? "quiet" : "secondary"
                              }
                            >
                              {t(`actions.${status}`)}
                            </Button>
                          </form>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </AppShell>
  );
}
