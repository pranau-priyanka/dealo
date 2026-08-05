import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DealStatus, MerchantWorkspace } from "./types";

type MerchantDealRow = {
  id: string;
  title: string;
  status: DealStatus;
  discount_percent: number | null;
  starts_at: string;
  ends_at: string;
  venues: { name: string } | { name: string }[] | null;
};

export async function getMerchantWorkspace(): Promise<MerchantWorkspace> {
  const emptyWorkspace: MerchantWorkspace = {
    merchant: null,
    venues: [],
    deals: [],
  };
  if (!isSupabaseConfigured()) return emptyWorkspace;

  const supabase = await createServerSupabaseClient();
  const { data: merchant, error: merchantError } = await supabase
    .from("merchants")
    .select("id, name")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (merchantError || !merchant) return emptyWorkspace;

  const { data: venues } = await supabase
    .from("venues")
    .select("id, name, address_line_1, city, country_code")
    .eq("merchant_id", merchant.id)
    .order("created_at", { ascending: true });

  const mappedVenues = (venues ?? []).map((venue) => ({
    id: venue.id,
    name: venue.name,
    addressLine1: venue.address_line_1,
    city: venue.city,
    countryCode: venue.country_code,
  }));
  if (mappedVenues.length === 0) {
    return { merchant, venues: mappedVenues, deals: [] };
  }

  const { data: deals } = await supabase
    .from("deals")
    .select(
      "id, title, status, discount_percent, starts_at, ends_at, venues (name)",
    )
    .in(
      "venue_id",
      mappedVenues.map((venue) => venue.id),
    )
    .order("updated_at", { ascending: false });

  const mappedDeals = ((deals ?? []) as MerchantDealRow[]).flatMap((deal) => {
    const venue = Array.isArray(deal.venues) ? deal.venues[0] : deal.venues;
    if (!venue) return [];
    return [
      {
        id: deal.id,
        title: deal.title,
        status: deal.status,
        discountPercent: deal.discount_percent,
        startsAt: deal.starts_at,
        endsAt: deal.ends_at,
        venueName: venue.name,
      },
    ];
  });

  return { merchant, venues: mappedVenues, deals: mappedDeals };
}
