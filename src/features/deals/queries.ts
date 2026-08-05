import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type PublicDeal = {
  id: string;
  title: string;
  description: string | null;
  discountPercent: number | null;
  endsAt: string;
  venueName: string;
  city: string;
};

export async function getPublicDeals(): Promise<PublicDeal[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("deals")
    .select(
      "id, title, description, discount_percent, ends_at, venues (name, city)",
    )
    .order("ends_at", { ascending: true })
    .limit(24);
  if (error || !data) return [];

  const rows = data as Array<{
    id: string;
    title: string;
    description: string | null;
    discount_percent: number | null;
    ends_at: string;
    venues:
      { name: string; city: string } | { name: string; city: string }[] | null;
  }>;
  return rows.flatMap((deal) => {
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
        city: venue.city,
      },
    ];
  });
}
