import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/app-shell";
import { DealComments } from "@/components/deal-comments";
import { DealSaveControl } from "@/components/deal-save-control";
import { DealVoteControl } from "@/components/deal-vote-control";
import { getPublicDeal, getPublicDealComments } from "@/features/deals/queries";
import { Link } from "@/i18n/navigation";

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ locale: "en-GB" | "pt-PT"; id: string }>;
}) {
  const { locale, id } = await params;
  const [{ deal, isSignedIn }, t, community] = await Promise.all([
    getPublicDeal(id),
    getTranslations("dealDetail"),
    getTranslations("community"),
  ]);
  if (!deal) notFound();

  const comments = await getPublicDealComments(deal.id);

  const endsAt = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(deal.endsAt));
  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: deal.currency,
  });
  const returnTo = `/${locale}/deals/${deal.id}`;

  return (
    <AppShell>
      <section className="mx-auto max-w-4xl px-4 py-12 pb-28 sm:px-6 lg:px-8">
        <Link
          className="text-brand min-h-11 py-3 text-sm font-bold underline"
          href="/deals"
        >
          {t("back")}
        </Link>
        <article className="bg-surface mt-6 rounded-[var(--radius-lg)] border p-6 shadow-[var(--shadow-card)] sm:p-10">
          <p className="text-brand text-sm font-bold">
            {deal.venueName}
            {deal.city ? ` · ${deal.city}` : ""}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="bg-brand-soft text-brand rounded-full px-3 py-1 text-xs font-extrabold">
              {community(
                deal.source === "community" ? "communityDeal" : "merchantDeal",
              )}
            </span>
            {deal.category && (
              <span className="bg-background text-foreground-muted rounded-full px-3 py-1 text-xs font-bold">
                {community(`categories.${deal.category}`)}
              </span>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">{deal.title}</h1>
          <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-2">
            {deal.currentPrice && (
              <p className="text-foreground text-3xl font-black tracking-[-0.05em] sm:text-4xl">
                {currency.format(deal.currentPrice)}
              </p>
            )}
            {deal.previousPrice && (
              <p className="text-foreground-muted text-lg font-semibold line-through">
                {currency.format(deal.previousPrice)}
              </p>
            )}
            {deal.discountPercent && (
              <p className="text-brand text-lg font-black">
                {t("discount", { value: deal.discountPercent })}
              </p>
            )}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {deal.dealUrl && (
              <a
                className="bg-brand hover:bg-brand-strong inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-5 text-sm font-bold text-white"
                href={deal.dealUrl}
                rel="noreferrer"
                target="_blank"
              >
                {community("visitDeal")}
              </a>
            )}
            <DealVoteControl
              dealId={deal.id}
              isSignedIn={isSignedIn}
              locale={locale}
              returnTo={returnTo}
              score={deal.voteScore}
              userVote={deal.userVote}
            />
          </div>
          <dl className="bg-surface-muted mt-8 rounded-[var(--radius-md)] p-5">
            <dt className="text-foreground-muted text-sm font-semibold">
              {t("ends")}
            </dt>
            <dd className="mt-1 text-lg font-bold">{endsAt}</dd>
          </dl>
          {deal.description && (
            <section className="mt-8">
              <h2 className="text-xl font-bold">{t("about")}</h2>
              <p className="text-foreground-muted mt-3 leading-7">
                {deal.description}
              </p>
            </section>
          )}
          {deal.terms && (
            <section className="mt-8">
              <h2 className="text-xl font-bold">{t("terms")}</h2>
              <p className="text-foreground-muted mt-3 leading-7 whitespace-pre-line">
                {deal.terms}
              </p>
            </section>
          )}
          <DealSaveControl
            dealId={deal.id}
            isSaved={deal.isSaved}
            isSignedIn={isSignedIn}
            locale={locale}
            returnTo={returnTo}
          />
          <DealComments
            comments={comments}
            dealId={deal.id}
            isSignedIn={isSignedIn}
            locale={locale}
            returnTo={returnTo}
          />
        </article>
      </section>
    </AppShell>
  );
}
