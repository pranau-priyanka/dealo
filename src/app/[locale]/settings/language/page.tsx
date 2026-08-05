import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/app-shell";
import { LanguageSwitcher } from "@/components/language-switcher";
export default async function Page() {
  const t = await getTranslations("settings.language");
  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-4 py-12 pb-28 sm:px-6">
        <p className="text-brand text-sm font-bold">{t("breadcrumb")}</p>
        <h1 className="mt-2 text-3xl font-black">{t("title")}</h1>
        <p className="text-foreground-muted mt-3">{t("description")}</p>
        <div className="bg-surface mt-8 rounded-[var(--radius-md)] border p-5">
          <LanguageSwitcher />
          <p className="text-foreground-muted mt-3 text-sm">
            {t("persistence")}
          </p>
        </div>
      </section>
    </AppShell>
  );
}
