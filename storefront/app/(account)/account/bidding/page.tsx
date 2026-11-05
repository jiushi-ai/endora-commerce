import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSessionCookie } from '../../../../lib/session';
import { getServerContext } from '../../../../lib/server-context';
import { listBiddingCampaigns, listMyBidReceipts } from '../../../../lib/api/bidding';
import { BiddingDeskClient } from '../../../../components/bidding/BiddingDeskClient';
import { tForLocale } from '../../../../lib/i18n/messages';

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
  const { locale } = await getServerContext();
  const t = tForLocale(locale);

  let campaigns: Awaited<ReturnType<typeof listBiddingCampaigns>> = [];
  let receipts: Awaited<ReturnType<typeof listMyBidReceipts>> = [];
  let loadError: string | null = null;
  try {
    [campaigns, receipts] = await Promise.all([
      listBiddingCampaigns(session),
      listMyBidReceipts(session),
    ]);
  } catch {
    loadError = t('account.bidding.unavailable');
  }

  return (
    <BiddingDeskClient
      campaigns={campaigns}
      receipts={receipts}
      loadError={loadError}
      locale={locale}
    />
  );
}
