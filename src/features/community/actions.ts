"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { DealCategory } from "@/features/deals/queries";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const locales = z.enum(["en-GB", "pt-PT"]);
const categories = [
  "technology",
  "home",
  "food",
  "travel",
  "fashion",
  "beauty",
  "sports",
  "other",
] as const satisfies readonly DealCategory[];

const optionalPrice = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().positive().max(999_999).optional(),
);

const submissionSchema = z
  .object({
    locale: locales,
    title: z.string().trim().min(2).max(160),
    retailerName: z.string().trim().min(2).max(120),
    dealUrl: z
      .string()
      .trim()
      .url()
      .max(2_048)
      .refine((value) => {
        try {
          return new URL(value).protocol === "https:";
        } catch {
          return false;
        }
      }),
    category: z.enum(categories),
    currentPrice: z.coerce.number().positive().max(999_999),
    previousPrice: optionalPrice,
    description: z.string().trim().max(2_000).optional(),
  })
  .refine(
    (data) =>
      data.previousPrice === undefined ||
      data.previousPrice >= data.currentPrice,
    { path: ["previousPrice"] },
  );

const voteSchema = z.object({
  dealId: z.string().uuid(),
  locale: locales,
  returnTo: z.string().optional(),
  value: z.coerce.number().refine((value) => value === -1 || value === 1),
});

const commentSchema = z.object({
  dealId: z.string().uuid(),
  locale: locales,
  returnTo: z.string().optional(),
  body: z.string().trim().min(1).max(2_000),
});

function getSafeReturnPath(value: string | undefined, locale: string) {
  const fallback = `/${locale}/deals`;
  return value?.startsWith(`/${locale}/`) && !value.startsWith("//")
    ? value
    : fallback;
}

async function getSignedInCommunityContext(
  locale: "en-GB" | "pt-PT",
  nextPath = `/${locale}/submit`,
) {
  if (!isSupabaseConfigured()) {
    redirect(`/${locale}/login?message=not-configured`);
  }
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/${locale}/login?message=sign-in-required&next=${encodeURIComponent(nextPath)}`,
    );
  }
  return { supabase, user };
}

function submissionPath(locale: "en-GB" | "pt-PT", notice?: string) {
  return notice ? `/${locale}/submit?notice=${notice}` : `/${locale}/submit`;
}

export async function submitCommunityDeal(formData: FormData) {
  const parsed = submissionSchema.safeParse({
    locale: formData.get("locale"),
    title: formData.get("title"),
    retailerName: formData.get("retailerName"),
    dealUrl: formData.get("dealUrl"),
    category: formData.get("category"),
    currentPrice: formData.get("currentPrice"),
    previousPrice: formData.get("previousPrice"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    const locale = locales.safeParse(formData.get("locale")).data ?? "en-GB";
    redirect(submissionPath(locale, "invalid"));
  }

  const { supabase, user } = await getSignedInCommunityContext(
    parsed.data.locale,
  );
  const endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1_000);
  const { error } = await supabase.from("deals").insert({
    source: "community",
    submitted_by: user.id,
    status: "draft",
    moderation_status: "pending",
    title: parsed.data.title,
    retailer_name: parsed.data.retailerName,
    deal_url: parsed.data.dealUrl,
    category: parsed.data.category,
    current_price: parsed.data.currentPrice,
    previous_price: parsed.data.previousPrice ?? null,
    description: parsed.data.description || null,
    starts_at: new Date().toISOString(),
    ends_at: endsAt.toISOString(),
  });
  if (error) redirect(submissionPath(parsed.data.locale, "failed"));

  revalidatePath(`/${parsed.data.locale}`);
  revalidatePath(`/${parsed.data.locale}/deals`);
  redirect(submissionPath(parsed.data.locale, "submitted"));
}

export async function voteOnDeal(formData: FormData) {
  const parsed = voteSchema.safeParse({
    dealId: formData.get("dealId"),
    locale: formData.get("locale"),
    returnTo: formData.get("returnTo") || undefined,
    value: formData.get("value"),
  });
  if (!parsed.success) throw new Error("Invalid deal vote");

  const returnTo = getSafeReturnPath(parsed.data.returnTo, parsed.data.locale);
  const { supabase, user } = await getSignedInCommunityContext(
    parsed.data.locale,
    returnTo,
  );
  const { data: existing, error: existingError } = await supabase
    .from("deal_votes")
    .select("value")
    .eq("user_id", user.id)
    .eq("deal_id", parsed.data.dealId)
    .maybeSingle();
  if (existingError) throw new Error("Unable to load your vote");

  const { error } =
    existing?.value === parsed.data.value
      ? await supabase
          .from("deal_votes")
          .delete()
          .eq("user_id", user.id)
          .eq("deal_id", parsed.data.dealId)
      : await supabase.from("deal_votes").upsert(
          {
            user_id: user.id,
            deal_id: parsed.data.dealId,
            value: parsed.data.value,
          },
          { onConflict: "user_id,deal_id" },
        );
  if (error) throw new Error("Unable to record your vote");

  revalidatePath(returnTo);
  revalidatePath(`/${parsed.data.locale}`);
  revalidatePath(`/${parsed.data.locale}/deals`);
}

export async function addDealComment(formData: FormData) {
  const parsed = commentSchema.safeParse({
    dealId: formData.get("dealId"),
    locale: formData.get("locale"),
    returnTo: formData.get("returnTo") || undefined,
    body: formData.get("body"),
  });
  if (!parsed.success) throw new Error("Invalid deal comment");

  const returnTo = getSafeReturnPath(parsed.data.returnTo, parsed.data.locale);
  const { supabase, user } = await getSignedInCommunityContext(
    parsed.data.locale,
    returnTo,
  );
  const { error } = await supabase.from("deal_comments").insert({
    deal_id: parsed.data.dealId,
    author_id: user.id,
    body: parsed.data.body,
  });
  if (error) throw new Error("Unable to add your comment");

  revalidatePath(returnTo);
  revalidatePath(`/${parsed.data.locale}`);
  revalidatePath(`/${parsed.data.locale}/deals`);
}
