import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSessionCookie } from '../../../../lib/session';
import { listBiddingCampaigns, listMyBidReceipts } from '../../../../lib/api/bidding';
import { BiddingDeskClient } from '../../../../components/bidding/BiddingDeskClient';

/**
 * Not indexed — authenticated bidding desk for the buying organization.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Storefront bidding list (feature 165 / Batch D / T15) — open campaigns + my receipts.
 */
export default async function AccountBiddingPage(): Promise<ReactNode> {
  const session = await getSessionCookie();
  if (!session) redirect('/login');

  let campaigns: Awaited<ReturnType<typeof listBiddingCampaigns>> = [];
  let receipts: Awaited<ReturnType<typeof listMyBidReceipts>> = [];
  let loadError: string | null = null;
  try {
    [campaigns, receipts] = await Promise.all([
      listBiddingCampaigns(session),
      listMyBidReceipts(session),
    ]);
  } catch {
    loadError = 'Bidding is unavailable right now (module off or session).';
  }

  return (
    <BiddingDeskClient campaigns={campaigns} receipts={receipts} loadError={loadError} />
  );
}
