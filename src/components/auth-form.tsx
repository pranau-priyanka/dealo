import { getLocale, getTranslations } from "next-intl/server";
import { signIn, signUp } from "@/features/auth/actions";
import { Link } from "@/i18n/navigation";
import { isSupabaseConfigured } from "@/lib/env";

type AuthMode = "login" | "signup";

export async function AuthForm({
  mode,
  notice,
}: {
  mode: AuthMode;
  notice?: { error?: string; message?: string; next?: string };
}) {
  const t = await getTranslations("auth");
  const locale = await getLocale();
  const configured = isSupabaseConfigured();
  const action = mode === "login" ? signIn : signUp;
  const feedbackKey = notice?.error ?? notice?.message;
  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <section className="bg-surface w-full max-w-md rounded-[var(--radius-lg)] border p-6 shadow-[var(--shadow-card)] sm:p-8">
        <Link className="text-brand text-xl font-black" href="/">
          dealo<span className="text-accent">.</span>
        </Link>
        <h1 className="mt-8 text-3xl font-black">{t(`${mode}.title`)}</h1>
        <p className="text-foreground-muted mt-2">{t(`${mode}.description`)}</p>
        <form action={action} className="mt-8 space-y-4">
          <input name="locale" type="hidden" value={locale} />
          <input name="next" type="hidden" value={notice?.next ?? ""} />
          <label className="block text-sm font-semibold">
            {t("email")}
            <input
              autoComplete="email"
              className="mt-2 min-h-12 w-full rounded-[var(--radius-sm)] border px-3"
              name="email"
              required
              type="email"
            />
          </label>
          <label className="block text-sm font-semibold">
            {t("password")}
            <input
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              className="mt-2 min-h-12 w-full rounded-[var(--radius-sm)] border px-3"
              minLength={8}
              name="password"
              required
              type="password"
            />
          </label>
          <button
            className="bg-brand hover:bg-brand-strong min-h-12 w-full rounded-[var(--radius-sm)] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!configured}
            type="submit"
          >
            {t(`${mode}.action`)}
          </button>
        </form>
        {feedbackKey && (
          <p
            aria-live="polite"
            className="bg-brand-soft text-brand-strong mt-5 rounded-lg p-3 text-sm"
          >
            {t(`feedback.${feedbackKey}`)}
          </p>
        )}
        {!configured && (
          <p className="bg-surface-muted text-foreground-muted mt-5 rounded-lg p-3 text-sm">
            {t("setupRequired")}
          </p>
        )}
        <p className="text-foreground-muted mt-6 text-sm">
          {mode === "login"
            ? t("login.alternatePrompt")
            : t("signup.alternatePrompt")}{" "}
          <Link
            className="text-brand font-semibold underline"
            href={
              notice?.next
                ? `${mode === "login" ? "/signup" : "/login"}?next=${encodeURIComponent(notice.next)}`
                : mode === "login"
                  ? "/signup"
                  : "/login"
            }
          >
            {mode === "login"
              ? t("login.alternateAction")
              : t("signup.alternateAction")}
          </Link>
        </p>
      </section>
    </main>
  );
}
