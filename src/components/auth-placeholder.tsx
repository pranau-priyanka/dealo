import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
export async function AuthPlaceholder({ mode }: { mode: "login" | "signup" }) {
  const t = await getTranslations("auth");
  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <section className="bg-surface w-full max-w-md rounded-[var(--radius-lg)] border p-6 shadow-[var(--shadow-card)] sm:p-8">
        <Link className="text-brand text-xl font-black" href="/">
          dealo<span className="text-accent">.</span>
        </Link>
        <h1 className="mt-8 text-3xl font-black">{t(`${mode}.title`)}</h1>
        <p className="text-foreground-muted mt-2">{t(`${mode}.description`)}</p>
        <form className="mt-8 space-y-4">
          <label className="block text-sm font-semibold">
            {t("email")}
            <input
              className="mt-2 min-h-12 w-full rounded-[var(--radius-sm)] border px-3"
              disabled
              name="email"
              type="email"
            />
          </label>
          <button
            className="bg-brand min-h-12 w-full rounded-[var(--radius-sm)] font-bold text-white opacity-60"
            disabled
            type="submit"
          >
            {t(`${mode}.action`)}
          </button>
        </form>
        <p className="bg-surface-muted text-foreground-muted mt-5 rounded-lg p-3 text-sm">
          {t("placeholder")}
        </p>
      </section>
    </main>
  );
}
