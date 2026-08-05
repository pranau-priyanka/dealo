import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type PublicDeal = {
  id: string;
  title: string;
  description: string | null;
  terms: string | null;
  discountPercent: number | null;
  endsAt: string;
  venueName: string;
  city: string;
  isSaved: boolean;
};

type PublicDealRow = {
  id: string;
  title: string;
  description: string | null;
  terms: string | null;
  discount_percent: number | null;
  ends_at: string;
  venues:
    { name: string; city: string } | { name: string; city: string }[] | null;
};

const publicDealSelect =
  "id, title, description, terms, discount_percent, ends_at, venues (name, city)";

async function getSavedDealIds(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  dealIds: string[],
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || dealIds.length === 0)
    return { isSignedIn: Boolean(user), ids: new Set<string>() };

  const { data } = await supabase
    .from("saved_deals")
    .select("deal_id")
    .in("deal_id", dealIds);
  return {
    isSignedIn: true,
    ids: new Set((data ?? []).map((savedDeal) => savedDeal.deal_id)),
  };
}

function mapPublicDeals(rows: PublicDealRow[], savedDealIds: Set<string>) {
  return rows.flatMap((deal) => {
    const venue = Array.isArray(deal.venues) ? deal.venues[0] : deal.venues;
    if (!venue) return [];
    return [
      {
        id: deal.id,
        title: deal.title,
        description: deal.description,
        terms: deal.terms,
        discountPercent: deal.discount_percent,
        endsAt: deal.ends_at,
        venueName: venue.name,
        city: venue.city,
        isSaved: savedDealIds.has(deal.id),
      },
    ];
  });
}

export async function getPublicDeals(): Promise<{
  deals: PublicDeal[];
  isSignedIn: boolean;
}> {
  if (!isSupabaseConfigured()) return { deals: [], isSignedIn: false };
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("deals")
    .select(publicDealSelect)
    .order("ends_at", { ascending: true })
    .limit(24);
  if (error || !data) return { deals: [], isSignedIn: false };

  const rows = data as PublicDealRow[];
  const savedDeals = await getSavedDealIds(
    supabase,
    rows.map((deal) => deal.id),
  );
  return {
    deals: mapPublicDeals(rows, savedDeals.ids),
    isSignedIn: savedDeals.isSignedIn,
  };
}

export async function getPublicDeal(id: string): Promise<{
  deal: PublicDeal | null;
  isSignedIn: boolean;
}> {
  if (!isSupabaseConfigured()) return { deal: null, isSignedIn: false };
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("deals")
    .select(publicDealSelect)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return { deal: null, isSignedIn: false };

  const savedDeals = await getSavedDealIds(supabase, [data.id]);
  return {
    deal: mapPublicDeals([data as PublicDealRow], savedDeals.ids)[0] ?? null,
    isSignedIn: savedDeals.isSignedIn,
  };
}
