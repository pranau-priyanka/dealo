import { getTranslations } from "next-intl/server";
import type { PublicDeal } from "@/features/deals/queries";
import { Link } from "@/i18n/navigation";
import { DealSaveControl } from "./deal-save-control";

type Props = {
  deal: PublicDeal;
  isSignedIn: boolean;
  locale: "en-GB" | "pt-PT";
};

export async function DealCard({ deal, isSignedIn, locale }: Props) {
  const t = await getTranslations("deals");
  const dealPath = `/deals/${deal.id}`;
  const returnTo = `/${locale}${dealPath}`;

  return (
    <article className="bg-surface flex h-full flex-col rounded-[var(--radius-md)] border p-5 shadow-sm">
      <p className="text-brand text-sm font-bold">
        {deal.venueName} · {deal.city}
      </p>
      <h2 className="mt-2 text-xl font-bold">{deal.title}</h2>
      {deal.discountPercent && (
        <p className="mt-4 text-2xl font-black">
          {t("discount", { value: deal.discountPercent })}
        </p>
      )}
      {deal.description && (
        <p className="text-foreground-muted mt-2 text-sm">{deal.description}</p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-1 pt-5">
        <Link
          className="text-brand min-h-11 py-3 text-sm font-bold underline"
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
    </article>
  );
}
