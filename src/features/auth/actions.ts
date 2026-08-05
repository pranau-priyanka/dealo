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
});

function loginPath(locale: string, key: "error" | "message", value: string) {
  return `/${locale}/login?${key}=${encodeURIComponent(value)}`;
}

function signupPath(locale: string, key: "error" | "message", value: string) {
  return `/${locale}/signup?${key}=${encodeURIComponent(value)}`;
}

function parseCredentials(formData: FormData) {
  return credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    locale: formData.get("locale"),
  });
}

export async function signIn(formData: FormData) {
  const parsed = parseCredentials(formData);
  if (!parsed.success)
    redirect(loginPath("en-GB", "error", "invalid-credentials"));
  if (!isSupabaseConfigured())
    redirect(loginPath(parsed.data.locale, "error", "not-configured"));

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) redirect(loginPath(parsed.data.locale, "error", "sign-in-failed"));
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user)
    await supabase
      .from("profiles")
      .upsert({ id: user.id, locale: parsed.data.locale });
  redirect(`/${parsed.data.locale}`);
}

export async function signUp(formData: FormData) {
  const parsed = parseCredentials(formData);
  if (!parsed.success)
    redirect(signupPath("en-GB", "error", "invalid-credentials"));
  if (!isSupabaseConfigured())
    redirect(signupPath(parsed.data.locale, "error", "not-configured"));

  const forwardedHost = (await headers()).get("x-forwarded-host");
  const origin = forwardedHost
    ? `https://${forwardedHost}`
    : env.NEXT_PUBLIC_APP_URL;
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/${parsed.data.locale}`,
      data: { locale: parsed.data.locale },
    },
  });
  if (error)
    redirect(signupPath(parsed.data.locale, "error", "sign-up-failed"));
  redirect(signupPath(parsed.data.locale, "message", "check-email"));
}

export async function signOut(formData: FormData) {
  const locale = formData.get("locale") === "pt-PT" ? "pt-PT" : "en-GB";
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }
  redirect(`/${locale}`);
}
