"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { canChangeDealStatus, dealStatuses, type DealStatus } from "./types";

const localeSchema = z.enum(["en-GB", "pt-PT"]);
const merchantSchema = z.object({
  name: z.string().trim().min(2).max(120),
});
const venueSchema = z.object({
  name: z.string().trim().min(2).max(120),
  addressLine1: z.string().trim().min(2).max(200),
  city: z.string().trim().min(2).max(120),
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/),
});
const dealSchema = z
  .object({
    venueId: z.string().uuid(),
    title: z.string().trim().min(2).max(160),
    description: z.string().trim().max(2_000).optional(),
    terms: z.string().trim().max(2_000).optional(),
    discountPercent: z.coerce.number().int().min(1).max(100),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
  })
  .refine((deal) => deal.endsAt > deal.startsAt, {
    message: "end-must-follow-start",
    path: ["endsAt"],
  });

function localeFrom(formData: FormData) {
  return localeSchema.safeParse(formData.get("locale")).data ?? "en-GB";
}

function merchantPath(locale: string, key?: string) {
  const query = key ? `?notice=${encodeURIComponent(key)}` : "";
  return `/${locale}/merchant${query}`;
}

async function requireMerchantUser(locale: string) {
  if (!isSupabaseConfigured())
    redirect(`/${locale}/login?error=not-configured`);

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/${locale}/login?message=sign-in-required&next=${encodeURIComponent(`/${locale}/merchant`)}`,
    );
  }
  return { supabase, user };
}

async function getOwnedMerchantId(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
) {
  const { data } = await supabase
    .from("merchants")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

export async function createMerchant(formData: FormData) {
  const locale = localeFrom(formData);
  const parsed = merchantSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) redirect(merchantPath(locale, "invalid-merchant"));

  const { supabase, user } = await requireMerchantUser(locale);
  const existingMerchant = await getOwnedMerchantId(supabase);
  if (existingMerchant) redirect(merchantPath(locale, "merchant-exists"));

  const { error } = await supabase
    .from("merchants")
    .insert({ name: parsed.data.name, owner_id: user.id });
  if (error) redirect(merchantPath(locale, "merchant-create-failed"));

  revalidatePath(`/${locale}/merchant`);
  redirect(merchantPath(locale, "merchant-created"));
}

export async function createVenue(formData: FormData) {
  const locale = localeFrom(formData);
  const parsed = venueSchema.safeParse({
    name: formData.get("name"),
    addressLine1: formData.get("addressLine1"),
    city: formData.get("city"),
    countryCode: formData.get("countryCode"),
  });
  if (!parsed.success) redirect(merchantPath(locale, "invalid-venue"));

  const { supabase } = await requireMerchantUser(locale);
  const merchantId = await getOwnedMerchantId(supabase);
  if (!merchantId) redirect(merchantPath(locale, "merchant-required"));

  const { error } = await supabase.from("venues").insert({
    merchant_id: merchantId,
    name: parsed.data.name,
    address_line_1: parsed.data.addressLine1,
    city: parsed.data.city,
    country_code: parsed.data.countryCode,
  });
  if (error) redirect(merchantPath(locale, "venue-create-failed"));

  revalidatePath(`/${locale}/merchant`);
  redirect(merchantPath(locale, "venue-created"));
}

export async function createDeal(formData: FormData) {
  const locale = localeFrom(formData);
  const parsed = dealSchema.safeParse({
    venueId: formData.get("venueId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    terms: formData.get("terms") || undefined,
    discountPercent: formData.get("discountPercent"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  });
  if (!parsed.success) redirect(merchantPath(locale, "invalid-deal"));

  const { supabase } = await requireMerchantUser(locale);
  const merchantId = await getOwnedMerchantId(supabase);
  if (!merchantId) redirect(merchantPath(locale, "merchant-required"));

  const { data: venue } = await supabase
    .from("venues")
    .select("id")
    .eq("id", parsed.data.venueId)
    .eq("merchant_id", merchantId)
    .maybeSingle();
  if (!venue) redirect(merchantPath(locale, "venue-required"));

  const { error } = await supabase.from("deals").insert({
    venue_id: venue.id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    terms: parsed.data.terms || null,
    discount_percent: parsed.data.discountPercent,
    starts_at: parsed.data.startsAt.toISOString(),
    ends_at: parsed.data.endsAt.toISOString(),
    status: "draft",
  });
  if (error) redirect(merchantPath(locale, "deal-create-failed"));

  revalidatePath(`/${locale}/merchant`);
  redirect(merchantPath(locale, "deal-created"));
}

export async function changeDealStatus(formData: FormData) {
  const locale = localeFrom(formData);
  const dealId = z.string().uuid().safeParse(formData.get("dealId"));
  const nextStatus = z.enum(dealStatuses).safeParse(formData.get("status"));
  if (!dealId.success || !nextStatus.success) {
    redirect(merchantPath(locale, "invalid-status"));
  }

  const { supabase } = await requireMerchantUser(locale);
  const { data: deal } = await supabase
    .from("deals")
    .select("id, status")
    .eq("id", dealId.data)
    .maybeSingle();
  if (
    !deal ||
    !canChangeDealStatus(deal.status as DealStatus, nextStatus.data)
  ) {
    redirect(merchantPath(locale, "invalid-status"));
  }

  const { error } = await supabase
    .from("deals")
    .update({ status: nextStatus.data })
    .eq("id", deal.id);
  if (error) redirect(merchantPath(locale, "status-update-failed"));

  revalidatePath(`/${locale}/merchant`);
  revalidatePath(`/${locale}/deals`);
  redirect(merchantPath(locale, "status-updated"));
}
