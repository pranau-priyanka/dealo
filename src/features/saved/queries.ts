import type { PublicDeal } from "@/features/deals/queries";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function toPrice(value: number | string | null) {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function getSavedDeals(): Promise<PublicDeal[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("saved_deals")
    .select(
      "deals (id, title, description, terms, discount_percent, ends_at, source, category, deal_url, retailer_name, current_price, previous_price, currency, vote_score, comment_count, venues (name, city))",
    )
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  const rows = data as Array<{
    deals:
      | {
          id: string;
          title: string;
          description: string | null;
          terms: string | null;
          discount_percent: number | null;
          ends_at: string;
          source: "merchant" | "community";
          category: PublicDeal["category"];
          deal_url: string | null;
          retailer_name: string | null;
          current_price: number | string | null;
          previous_price: number | string | null;
          currency: string;
          vote_score: number;
          comment_count: number;
          venues:
            | { name: string; city: string }
            | { name: string; city: string }[]
            | null;
        }
      | {
          id: string;
          title: string;
          description: string | null;
          terms: string | null;
          discount_percent: number | null;
          ends_at: string;
          source: "merchant" | "community";
          category: PublicDeal["category"];
          deal_url: string | null;
          retailer_name: string | null;
          current_price: number | string | null;
          previous_price: number | string | null;
          currency: string;
          vote_score: number;
          comment_count: number;
          venues:
            | { name: string; city: string }
            | { name: string; city: string }[]
            | null;
        }[]
      | null;
  }>;

  return rows.flatMap((row) => {
    const deal = Array.isArray(row.deals) ? row.deals[0] : row.deals;
    if (!deal) return [];
    const venue = Array.isArray(deal.venues) ? deal.venues[0] : deal.venues;
    const venueName = venue?.name ?? deal.retailer_name;
    if (!venueName) return [];

    return [
      {
        id: deal.id,
        title: deal.title,
        description: deal.description,
        terms: deal.terms,
        discountPercent: deal.discount_percent,
        endsAt: deal.ends_at,
        venueName,
        city: venue?.city ?? null,
        source: deal.source,
        category: deal.category,
        dealUrl: deal.deal_url,
        currentPrice: toPrice(deal.current_price),
        previousPrice: toPrice(deal.previous_price),
        currency: deal.currency,
        voteScore: deal.vote_score,
        commentCount: deal.comment_count,
        userVote: null,
        isSaved: true,
      },
    ];
  });
}
