"use client";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("language");
  const [isPending, startTransition] = useTransition();
  async function changeLocale(nextLocale: AppLocale) {
    document.cookie = `DEALO_LOCALE=${nextLocale};path=/;max-age=31536000;samesite=lax`;
    await fetch("/api/profile/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    });
    startTransition(() => router.replace(pathname, { locale: nextLocale }));
  }
  return (
    <label className="text-foreground-muted flex items-center gap-2 text-sm font-medium">
      <span className="sr-only">{t("label")}</span>
      <select
        aria-label={t("label")}
        className="bg-surface text-foreground min-h-10 rounded-full border px-3 text-xs font-semibold shadow-sm"
        disabled={isPending}
        onChange={(event) => changeLocale(event.target.value as AppLocale)}
        value={locale}
      >
        <option value="en-GB">English (UK)</option>
        <option value="pt-PT">Português (Portugal)</option>
      </select>
    </label>
  );
}
