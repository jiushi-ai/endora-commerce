import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSessionCookie } from '../../../../../lib/session';
import { getBiddingCampaign } from '../../../../../lib/api/bidding';
import { SubmitBidForm } from '../../../../../components/bidding/SubmitBidForm';

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Campaign detail + submit form (Batch D / T15).
 */
export default async function AccountBiddingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<ReactNode> {
  const session = await getSessionCookie();
  if (!session) redirect('/login');
  const { id } = await params;

  let detail: Awaited<ReturnType<typeof getBiddingCampaign>>;
  try {
    detail = await getBiddingCampaign(session, id);
  } catch {
    notFound();
  }

  const { campaign, myReceipt } = detail;
  const open = campaign.status === 'published';

  return (
    <>
      <p>
        <Link href="/account/bidding">← Campaigns</Link>
      </p>
      <h2>{campaign.title}</h2>
      <p className="muted">
        <code>{campaign.code}</code> · {campaign.status} · closes{' '}
        {new Date(campaign.closesAt).toLocaleString()}
      </p>

      {myReceipt ? (
        <section className="mb-[16px]">
          <h3>Your receipt</h3>
          <p>
            Status: <strong>{myReceipt.status}</strong>
          </p>
          <p>
            Bid: {myReceipt.bidUnitPrice ?? '—'} × {myReceipt.bidQty ?? '—'}
          </p>
          {myReceipt.tradeId ? (
            <p>
              Trade id: <code>{myReceipt.tradeId}</code>
            </p>
          ) : null}
        </section>
      ) : null}

      {open && !myReceipt ? (
        <SubmitBidForm
          campaignId={campaign.id}
          hasIntentTemplate={Boolean(campaign.intentTemplateAssetId)}
        />
      ) : open && myReceipt && ['rejected', 'withdrawn'].includes(myReceipt.status) ? (
        <SubmitBidForm
          campaignId={campaign.id}
          hasIntentTemplate={Boolean(campaign.intentTemplateAssetId)}
        />
      ) : null}

      {!open && !myReceipt ? <p className="muted">This campaign is not open for new bids.</p> : null}
    </>
  );
}
