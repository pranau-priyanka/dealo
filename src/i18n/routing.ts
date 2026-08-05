import { defineRouting } from "next-intl/routing";
export const routing = defineRouting({
  locales: ["en-GB", "pt-PT"],
  defaultLocale: "en-GB",
  localePrefix: "always",
  localeDetection: true,
  localeCookie: { name: "DEALO_LOCALE", maxAge: 31536000, sameSite: "lax" },
});
export type AppLocale = (typeof routing.locales)[number];
