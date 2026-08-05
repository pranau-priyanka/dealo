import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DealCard } from "@/components/deal-card";
import { getCurrentUser } from "@/lib/auth";
import { getSavedDeals } from "@/features/saved/queries";

export default async function SavedPage({
  params,
}: {
  params: Promise<{ locale: "en-GB" | "pt-PT" }>;
}) {
  const { locale } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login?message=sign-in-required`);
  const [t, deals] = await Promise.all([
    getTranslations("saved"),
    getSavedDeals(),
  ]);
  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 py-16 pb-28 sm:px-6 lg:px-8">
        <p className="text-brand text-sm font-bold">{t("eyebrow")}</p>
        <h1 className="mt-2 text-3xl font-black">{t("title")}</h1>
        <p className="text-foreground-muted mt-3">{t("description")}</p>
        {deals.length === 0 ? (
          <div className="bg-surface mt-8 rounded-[var(--radius-md)] border p-8">
            <h2 className="text-xl font-bold">{t("empty.title")}</h2>
            <p className="text-foreground-muted mt-2">
              {t("empty.description")}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {deals.map((deal) => (
              <DealCard deal={deal} isSignedIn key={deal.id} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
