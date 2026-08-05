import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getSupabaseConfiguration, isSupabaseConfigured } from "@/lib/env";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/en-GB";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = safeNext(requestUrl.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(next, requestUrl.origin));
  const code = requestUrl.searchParams.get("code");
  if (!code || !isSupabaseConfigured()) return response;

  const { url, publishableKey } = getSupabaseConfiguration();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return (
          request.headers
            .get("cookie")
            ?.split("; ")
            .map((cookie) => {
              const [name, ...value] = cookie.split("=");
              return { name, value: value.join("=") };
            }) ?? []
        );
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  await supabase.auth.exchangeCodeForSession(code);
  return response;
}
