import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/app-shell";
import { DealSaveControl } from "@/components/deal-save-control";
import { getPublicDeal } from "@/features/deals/queries";
import { Link } from "@/i18n/navigation";

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ locale: "en-GB" | "pt-PT"; id: string }>;
}) {
  const { locale, id } = await params;
  const [{ deal, isSignedIn }, t] = await Promise.all([
    getPublicDeal(id),
    getTranslations("dealDetail"),
  ]);
  if (!deal) notFound();

  const endsAt = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(deal.endsAt));
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
            {deal.venueName} · {deal.city}
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">{deal.title}</h1>
          {deal.discountPercent && (
            <p className="text-brand mt-6 text-3xl font-black sm:text-4xl">
              {t("discount", { value: deal.discountPercent })}
            </p>
          )}
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
        </article>
      </section>
    </AppShell>
  );
}
