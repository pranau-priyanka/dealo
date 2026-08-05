"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const savedDealSchema = z.object({
  dealId: z.string().uuid(),
  locale: z.enum(["en-GB", "pt-PT"]),
  returnTo: z.string().optional(),
});

function getSafeReturnPath(value: string | undefined, locale: string) {
  const fallback = `/${locale}/deals`;
  return value?.startsWith(`/${locale}/`) && !value.startsWith("//")
    ? value
    : fallback;
}

async function getSavedDealInput(formData: FormData) {
  const parsed = savedDealSchema.safeParse({
    dealId: formData.get("dealId"),
    locale: formData.get("locale"),
    returnTo: formData.get("returnTo") || undefined,
  });
  if (!parsed.success) throw new Error("Invalid saved deal request");

  const returnTo = getSafeReturnPath(parsed.data.returnTo, parsed.data.locale);
  if (!isSupabaseConfigured()) redirect(returnTo);

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/${parsed.data.locale}/login?message=sign-in-required&next=${encodeURIComponent(returnTo)}`,
    );
  }

  return { ...parsed.data, returnTo, supabase, user };
}

export async function saveDeal(formData: FormData) {
  const { dealId, returnTo, supabase, user } =
    await getSavedDealInput(formData);
  const { data: deal, error: dealError } = await supabase
    .from("deals")
    .select("id")
    .eq("id", dealId)
    .maybeSingle();
  if (dealError || !deal) throw new Error("Deal is not available");

  const { error } = await supabase
    .from("saved_deals")
    .upsert(
      { user_id: user.id, deal_id: dealId },
      { onConflict: "user_id,deal_id" },
    );
  if (error) throw new Error("Unable to save deal");

  revalidatePath(returnTo);
  revalidatePath(`/en-GB/saved`);
  revalidatePath(`/pt-PT/saved`);
}

export async function unsaveDeal(formData: FormData) {
  const { dealId, returnTo, supabase, user } =
    await getSavedDealInput(formData);
  const { error } = await supabase
    .from("saved_deals")
    .delete()
    .eq("user_id", user.id)
    .eq("deal_id", dealId);
  if (error) throw new Error("Unable to remove saved deal");

  revalidatePath(returnTo);
  revalidatePath(`/en-GB/saved`);
  revalidatePath(`/pt-PT/saved`);
}
