import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SavedDeal = {
  id: string;
  title: string;
  description: string | null;
  discountPercent: number | null;
  endsAt: string;
  venueName: string;
};

export async function getSavedDeals(): Promise<SavedDeal[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("saved_deals")
    .select(
      "deals (id, title, description, discount_percent, ends_at, venues (name))",
    )
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  const rows = data as Array<{
    deals:
      | {
          id: string;
          title: string;
          description: string | null;
          discount_percent: number | null;
          ends_at: string;
          venues: { name: string } | { name: string }[] | null;
        }
      | {
          id: string;
          title: string;
          description: string | null;
          discount_percent: number | null;
          ends_at: string;
          venues: { name: string } | { name: string }[] | null;
        }[]
      | null;
  }>;
  return rows.flatMap((row) => {
    const deal = Array.isArray(row.deals) ? row.deals[0] : row.deals;
    if (!deal) return [];
    const venue = Array.isArray(deal.venues) ? deal.venues[0] : deal.venues;
    if (!venue) return [];
    return [
      {
        id: deal.id,
        title: deal.title,
        description: deal.description,
        discountPercent: deal.discount_percent,
        endsAt: deal.ends_at,
        venueName: venue.name,
      },
    ];
  });
}
