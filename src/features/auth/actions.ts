"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { env, isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  locale: z.enum(["en-GB", "pt-PT"]),
  next: z.string().optional(),
});

function getSafeNext(value: string | undefined, locale: string) {
  return value?.startsWith(`/${locale}/`) && !value.startsWith("//")
    ? value
    : `/${locale}`;
}

function authPath(
  type: "login" | "signup",
  locale: string,
  key: "error" | "message",
  value: string,
  next?: string,
) {
  const query = new URLSearchParams({ [key]: value });
  if (next) query.set("next", next);
  return `/${locale}/${type}?${query.toString()}`;
}

function parseCredentials(formData: FormData) {
  return credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    locale: formData.get("locale"),
    next: formData.get("next") || undefined,
  });
}

export async function signIn(formData: FormData) {
  const parsed = parseCredentials(formData);
  if (!parsed.success)
    redirect(authPath("login", "en-GB", "error", "invalid-credentials"));
  if (!isSupabaseConfigured())
    redirect(authPath("login", parsed.data.locale, "error", "not-configured"));

  const next = getSafeNext(parsed.data.next, parsed.data.locale);
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error)
    redirect(
      authPath("login", parsed.data.locale, "error", "sign-in-failed", next),
    );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user)
    await supabase
      .from("profiles")
      .upsert({ id: user.id, locale: parsed.data.locale });
  redirect(next);
}

export async function signUp(formData: FormData) {
  const parsed = parseCredentials(formData);
  if (!parsed.success)
    redirect(authPath("signup", "en-GB", "error", "invalid-credentials"));
  if (!isSupabaseConfigured())
    redirect(authPath("signup", parsed.data.locale, "error", "not-configured"));

  const next = getSafeNext(parsed.data.next, parsed.data.locale);
  const forwardedHost = (await headers()).get("x-forwarded-host");
  const origin = forwardedHost
    ? `https://${forwardedHost}`
    : env.NEXT_PUBLIC_APP_URL;
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      data: { locale: parsed.data.locale },
    },
  });
  if (error)
    redirect(
      authPath("signup", parsed.data.locale, "error", "sign-up-failed", next),
    );
  redirect(
    authPath("signup", parsed.data.locale, "message", "check-email", next),
  );
}

export async function signOut(formData: FormData) {
  const locale = formData.get("locale") === "pt-PT" ? "pt-PT" : "en-GB";
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }
  redirect(`/${locale}`);
}
