"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfiguration } from "@/lib/env";

export function createBrowserSupabaseClient() {
  const { url, publishableKey } = getSupabaseConfiguration();
  return createBrowserClient(url, publishableKey);
}
