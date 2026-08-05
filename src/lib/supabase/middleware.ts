import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabaseConfiguration, isSupabaseConfigured } from "@/lib/env";

export async function refreshSupabaseSession(
  request: NextRequest,
  response: NextResponse,
) {
  if (!isSupabaseConfigured()) return response;
  const { url, publishableKey } = getSupabaseConfiguration();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser validates the token with Supabase; do not trust getSession in route guards.
  await supabase.auth.getUser();
  return response;
}
