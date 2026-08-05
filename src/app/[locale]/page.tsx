import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/app-shell";
import { Link } from "@/i18n/navigation";
const categoryIcons = ["⚡", "🏠", "🍽️", "✈️"];
export default async function HomePage() {
  const t = await getTranslations("home");
  return (
    <AppShell>
      <section className="overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
          <div className="bg-brand-soft grid overflow-hidden rounded-[24px] lg:grid-cols-[1.1fr_.9fr]">
            <div className="px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
              <p className="text-brand mb-5 text-xs font-extrabold tracking-[0.16em] uppercase">
                {t("eyebrow")}
              </p>
              <h1 className="max-w-xl text-4xl font-black tracking-[-0.055em] text-balance sm:text-5xl lg:text-6xl">
                {t("title")}
              </h1>
              <p className="text-foreground-muted mt-5 max-w-xl text-base leading-7 sm:text-lg sm:leading-8">
                {t("subtitle")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="bg-brand hover:bg-brand-strong inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold text-white shadow-sm"
                  href="/deals"
                >
                  {t("primaryAction")}
                </Link>
                <Link
                  className="bg-surface hover:bg-surface-muted inline-flex min-h-12 items-center justify-center rounded-full border px-6 text-sm font-bold"
                  href="/login"
                >
                  {t("secondaryAction")}
                </Link>
              </div>
            </div>
            <div className="relative hidden min-h-[380px] lg:block" aria-hidden>
              <div className="bg-brand/10 absolute top-[8%] right-[8%] size-40 rounded-full" />
              <div className="bg-brand/15 absolute right-[23%] bottom-[8%] size-28 rounded-full" />
              <div className="bg-surface absolute top-[18%] right-[18%] w-64 rounded-[20px] border p-5 shadow-[var(--shadow-card)]">
                <div className="bg-brand-soft flex h-24 items-end rounded-[14px] p-3">
                  <span className="bg-brand h-10 w-1/4 rounded-t-full" />
                  <span className="bg-brand/75 ml-2 h-16 w-1/4 rounded-t-full" />
                  <span className="bg-brand/45 ml-2 h-7 w-1/4 rounded-t-full" />
                </div>
                <span className="bg-brand text-surface mt-4 inline-flex rounded-full px-3 py-1 text-xs font-extrabold">
                  {t("previewLabel")}
                </span>
                <p className="mt-3 text-3xl font-black tracking-[-0.06em]">
                  40%
                </p>
                <p className="mt-1 text-sm font-bold">{t("previewTitle")}</p>
                <p className="text-foreground-muted mt-1 text-xs">
                  {t("previewMeta")}
                </p>
              </div>
              <div className="bg-surface absolute right-[6%] bottom-[15%] rounded-[14px] border px-4 py-3 text-sm font-bold shadow-[var(--shadow-card)]">
                <span className="text-brand">●</span> {t("previewNewPlaces")}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 pb-28 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-brand text-xs font-extrabold tracking-[0.16em] uppercase">
              {t("categoriesEyebrow")}
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
              {t("categoriesTitle")}
            </h2>
          </div>
          <span className="text-foreground-muted text-sm">{t("location")}</span>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoryIcons.map((icon, index) => (
            <article
              className="bg-surface hover:border-brand/30 rounded-[var(--radius-md)] border p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-1"
              key={icon}
            >
              <span
                aria-hidden
                className="bg-brand-soft grid size-12 place-items-center rounded-[14px] text-2xl"
              >
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
