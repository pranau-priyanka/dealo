import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/app-shell";
import { Link } from "@/i18n/navigation";
const categoryIcons = ["☕", "🍽️", "🎟️", "🛍️"];
export default async function HomePage() {
  const t = await getTranslations("home");
  return (
    <AppShell>
      <section className="bg-surface overflow-hidden border-b">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.15fr_.85fr] lg:px-8">
          <div className="max-w-2xl">
            <p className="bg-brand-soft text-brand-strong mb-4 inline-flex rounded-full px-3 py-1 text-sm font-bold">
              {t("eyebrow")}
            </p>
            <h1 className="text-4xl font-black tracking-[-0.045em] text-balance sm:text-6xl">
              {t("title")}
            </h1>
            <p className="text-foreground-muted mt-5 max-w-xl text-lg leading-8">
              {t("subtitle")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="bg-brand hover:bg-brand-strong inline-flex min-h-12 items-center justify-center rounded-[var(--radius-sm)] px-6 font-bold text-white"
                href="/deals"
              >
                {t("primaryAction")}
              </Link>
              <Link
                className="bg-surface hover:bg-surface-muted inline-flex min-h-12 items-center justify-center rounded-[var(--radius-sm)] border px-6 font-bold"
                href="/login"
              >
                {t("secondaryAction")}
              </Link>
            </div>
          </div>
          <div className="bg-brand relative min-h-72 rounded-[var(--radius-lg)] p-6 text-white shadow-[var(--shadow-card)]">
            <div className="absolute inset-0 [background-image:radial-gradient(circle_at_20%_30%,white_0,transparent_30%),radial-gradient(circle_at_80%_70%,#f6be4f_0,transparent_30%)] opacity-20" />
            <div className="relative flex h-full flex-col justify-between">
              <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
                {t("previewLabel")}
              </span>
              <div>
                <p className="text-5xl font-black">40%</p>
                <h2 className="mt-2 text-2xl font-bold">{t("previewTitle")}</h2>
                <p className="mt-1 text-white/75">{t("previewMeta")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 pb-28 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-brand text-sm font-bold tracking-widest uppercase">
              {t("categoriesEyebrow")}
            </p>
            <h2 className="mt-2 text-2xl font-black">{t("categoriesTitle")}</h2>
          </div>
          <span className="text-foreground-muted text-sm">{t("location")}</span>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoryIcons.map((icon, index) => (
            <article
              className="bg-surface rounded-[var(--radius-md)] border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
              key={icon}
            >
              <span aria-hidden className="text-3xl">
                {icon}
              </span>
              <h3 className="mt-5 font-bold">
                {t(`categories.${index}.title`)}
              </h3>
              <p className="text-foreground-muted mt-1 text-sm">
                {t(`categories.${index}.description`)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
