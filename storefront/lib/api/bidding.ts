import { apiGet } from './client';
import type { RequestContext } from './client';
import { apiGetAuthed, apiMutate } from './mutations';

/**
 * Storefront bidding client (feature 165 / Batch D).
 *
 * `apiGetAuthed` / `apiMutate` already unwrap the `{ data }` envelope.
 */

export interface StorefrontBiddingCampaign {
  id: string;
  code: string;
  title: string;
  status: string;
  opensAt: string;
  closesAt: string;
  qty: number;
  intentTemplateAssetId?: string | null;
}

/** Anonymous homepage strip + featured published campaign. */
export interface StorefrontBiddingHomepageSummary {
  openCampaignCount: number;
  participatingOrgCount: number;
  fulfilledDealCount: number;
  windowHours: number | null;
  featured: {
    id: string;
    code: string;
    title: string;
    qty: number;
    opensAt: string;
    closesAt: string;
  } | null;
}

export async function getBiddingHomepageSummary(
  ctx: RequestContext = {},
): Promise<StorefrontBiddingHomepageSummary> {
  const res = await apiGet<{ data: StorefrontBiddingHomepageSummary }>(
    '/api/v1/bidding/homepage-summary',
    ctx,
    { revalidate: 60, tags: ['bidding:homepage'] },
  );
  return res.data;
}

export interface StorefrontBiddingReceipt {
  id: string;
  campaignId: string;
  status: string;
  bidUnitPrice: string | null;
  bidQty: number | null;
  tradeId: string | null;
}

export async function listBiddingCampaigns(
  sessionCookie: string,
): Promise<StorefrontBiddingCampaign[]> {
  return apiGetAuthed<StorefrontBiddingCampaign[]>({
    path: '/api/v1/bidding/campaigns',
    sessionCookie,
  });
}

export async function getBiddingCampaign(
  sessionCookie: string,
  id: string,
): Promise<{
  campaign: StorefrontBiddingCampaign;
  myReceipt: {
    id: string;
    status: string;
    bidUnitPrice: string | null;
    bidQty: number | null;
    tradeId: string | null;
  } | null;
}> {
  return apiGetAuthed<{
    campaign: StorefrontBiddingCampaign;
    myReceipt: {
      id: string;
      status: string;
      bidUnitPrice: string | null;
      bidQty: number | null;
      tradeId: string | null;
    } | null;
  }>({
    path: `/api/v1/bidding/campaigns/${encodeURIComponent(id)}`,
    sessionCookie,
  });
}

export async function listMyBidReceipts(
  sessionCookie: string,
): Promise<StorefrontBiddingReceipt[]> {
  return apiGetAuthed<StorefrontBiddingReceipt[]>({
    path: '/api/v1/bidding/receipts/mine',
    sessionCookie,
  });
}

export async function submitBidReceipt(
  sessionCookie: string,
  campaignId: string,
  body: { bidUnitPrice: string; bidQty: number; attachmentAssetIds: string[] },
): Promise<StorefrontBiddingReceipt> {
  const res = await apiMutate<StorefrontBiddingReceipt>({
    method: 'POST',
    path: `/api/v1/bidding/campaigns/${encodeURIComponent(campaignId)}/receipts`,
    sessionCookie,
    body,
  });
  if (!res.data) {
    throw new Error('Submit returned no receipt');
  }
  return res.data;
}
