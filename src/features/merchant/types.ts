export const dealStatuses = [
  "draft",
  "published",
  "paused",
  "expired",
] as const;

export type DealStatus = (typeof dealStatuses)[number];

export type MerchantVenue = {
  id: string;
  name: string;
  addressLine1: string;
  city: string;
  countryCode: string;
};

export type MerchantDeal = {
  id: string;
  title: string;
  status: DealStatus;
  discountPercent: number | null;
  startsAt: string;
  endsAt: string;
  venueName: string;
};

export type MerchantWorkspace = {
  merchant: { id: string; name: string } | null;
  venues: MerchantVenue[];
  deals: MerchantDeal[];
};

const statusTransitions: Record<DealStatus, DealStatus[]> = {
  draft: ["published", "expired"],
  published: ["paused", "expired"],
  paused: ["published", "expired"],
  expired: [],
};

export function getDealStatusTransitions(status: DealStatus) {
  return statusTransitions[status];
}

export function canChangeDealStatus(from: DealStatus, to: DealStatus) {
  return getDealStatusTransitions(from).includes(to);
}
