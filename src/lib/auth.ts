import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./env";
import { createServerSupabaseClient } from "./supabase/server";

export type AuthUser = Pick<User, "id" | "email" | "user_metadata">;

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}
