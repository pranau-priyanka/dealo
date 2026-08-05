import { getTranslations } from "next-intl/server";
import type { PublicDeal } from "@/features/deals/queries";
import { Link } from "@/i18n/navigation";
import { DealVoteControl } from "./deal-vote-control";
import { DealSaveControl } from "./deal-save-control";

type Props = {
  deal: PublicDeal;
  isSignedIn: boolean;
  locale: "en-GB" | "pt-PT";
};

export async function DealCard({ deal, isSignedIn, locale }: Props) {
  const t = await getTranslations("deals");
  const community = await getTranslations("community");
  const dealPath = `/deals/${deal.id}`;
  const returnTo = `/${locale}${dealPath}`;
  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: deal.currency,
  });

  return (
    <article className="bg-surface hover:border-brand/30 flex h-full flex-col overflow-hidden rounded-[var(--radius-md)] border shadow-[var(--shadow-card)] transition hover:-translate-y-0.5">
      <div className="bg-brand-soft relative min-h-32 p-4">
        {deal.discountPercent && (
          <span className="bg-brand absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-extrabold text-white">
            {t("discount", { value: deal.discountPercent })}
          </span>
        )}
        {deal.category && (
          <span className="bg-surface text-foreground-muted absolute top-4 right-4 rounded-full px-3 py-1 text-[0.65rem] font-extrabold tracking-[0.08em] uppercase">
            {community(`categories.${deal.category}`)}
          </span>
        )}
        <span className="text-brand/30 absolute right-4 bottom-[-12px] text-7xl font-black tracking-[-0.1em]">
          {deal.venueName.slice(0, 1).toUpperCase()}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-foreground-muted text-xs font-bold tracking-[0.08em] uppercase">
          {deal.venueName}
          {deal.city ? ` · ${deal.city}` : ""}
        </p>
        <h2 className="mt-2 text-lg font-extrabold tracking-[-0.03em]">
          {deal.title}
        </h2>
        {deal.description && (
          <p className="text-foreground-muted mt-2 text-sm leading-6">
            {deal.description}
          </p>
        )}
        {deal.currentPrice && (
          <div className="mt-4 flex items-baseline gap-2">
            <p className="text-xl font-black tracking-[-0.04em]">
              {currency.format(deal.currentPrice)}
            </p>
            {deal.previousPrice && (
              <p className="text-foreground-muted text-xs font-semibold line-through">
                {currency.format(deal.previousPrice)}
              </p>
            )}
          </div>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
          <DealVoteControl
            dealId={deal.id}
            isSignedIn={isSignedIn}
            locale={locale}
            returnTo={returnTo}
            score={deal.voteScore}
            userVote={deal.userVote}
          />
          <Link
            className="text-foreground-muted hover:text-brand min-h-10 py-2 text-xs font-bold"
            href={`${dealPath}#comments`}
          >
            {community("comments", { count: deal.commentCount })}
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pt-2">
          <Link
            className="text-brand min-h-11 py-3 text-sm font-bold"
            href={dealPath}
          >
            {t("viewDeal")}
          </Link>
          <DealSaveControl
            dealId={deal.id}
            isSaved={deal.isSaved}
            isSignedIn={isSignedIn}
            locale={locale}
            returnTo={returnTo}
          />
        </div>
      </div>
    </article>
  );
}
