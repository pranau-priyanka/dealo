import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type DealCategory =
  | "technology"
  | "home"
  | "food"
  | "travel"
  | "fashion"
  | "beauty"
  | "sports"
  | "other";

export type PublicDeal = {
  id: string;
  title: string;
  description: string | null;
  terms: string | null;
  discountPercent: number | null;
  endsAt: string;
  venueName: string;
  city: string | null;
  source: "merchant" | "community";
  category: DealCategory | null;
  dealUrl: string | null;
  currentPrice: number | null;
  previousPrice: number | null;
  currency: string;
  voteScore: number;
  commentCount: number;
  userVote: -1 | 1 | null;
  isSaved: boolean;
};

export type DealComment = {
  id: string;
  body: string;
  createdAt: string;
};

type PublicDealRow = {
  id: string;
  title: string;
  description: string | null;
  terms: string | null;
  discount_percent: number | null;
  ends_at: string;
  source: "merchant" | "community";
  category: DealCategory | null;
  deal_url: string | null;
  retailer_name: string | null;
  current_price: number | string | null;
  previous_price: number | string | null;
  currency: string;
  vote_score: number;
  comment_count: number;
  venues:
    { name: string; city: string } | { name: string; city: string }[] | null;
};

const publicDealSelect =
  "id, title, description, terms, discount_percent, ends_at, source, category, deal_url, retailer_name, current_price, previous_price, currency, vote_score, comment_count, venues (name, city)";

function toPrice(value: number | string | null) {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function getUserDealState(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  dealIds: string[],
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || dealIds.length === 0) {
    return {
      isSignedIn: Boolean(user),
      savedDealIds: new Set<string>(),
      votes: new Map<string, -1 | 1>(),
    };
  }

  const [{ data: savedDeals }, { data: votes }] = await Promise.all([
    supabase.from("saved_deals").select("deal_id").in("deal_id", dealIds),
    supabase
      .from("deal_votes")
      .select("deal_id, value")
      .eq("user_id", user.id)
      .in("deal_id", dealIds),
  ]);

  return {
    isSignedIn: true,
    savedDealIds: new Set(
      (savedDeals ?? []).map((savedDeal) => savedDeal.deal_id),
    ),
    votes: new Map(
      (votes ?? []).flatMap((vote) =>
        vote.value === -1 || vote.value === 1
          ? [[vote.deal_id, vote.value] as const]
          : [],
      ),
    ),
  };
}

function mapPublicDeals(
  rows: PublicDealRow[],
  savedDealIds: Set<string>,
  votes: Map<string, -1 | 1>,
) {
  return rows.flatMap((deal) => {
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
        userVote: votes.get(deal.id) ?? null,
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
    .order("vote_score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(24);
  if (error || !data) return { deals: [], isSignedIn: false };

  const rows = data as PublicDealRow[];
  const userState = await getUserDealState(
    supabase,
    rows.map((deal) => deal.id),
  );
  return {
    deals: mapPublicDeals(rows, userState.savedDealIds, userState.votes),
    isSignedIn: userState.isSignedIn,
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

  const userState = await getUserDealState(supabase, [data.id]);
  return {
    deal:
      mapPublicDeals(
        [data as PublicDealRow],
        userState.savedDealIds,
        userState.votes,
      )[0] ?? null,
    isSignedIn: userState.isSignedIn,
  };
}

export async function getPublicDealComments(
  dealId: string,
): Promise<DealComment[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("deal_comments")
    .select("id, body, created_at")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];

  return data.map((comment) => ({
    id: comment.id,
    body: comment.body,
    createdAt: comment.created_at,
  }));
}
