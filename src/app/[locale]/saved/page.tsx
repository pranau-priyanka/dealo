import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/app-shell";
export default async function SavedPage() {
  const t = await getTranslations("saved");
  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-4 py-16 pb-28 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black">{t("title")}</h1>
        <p className="text-foreground-muted mt-3">{t("description")}</p>
      </section>
    </AppShell>
  );
}
