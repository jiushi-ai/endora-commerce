import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSessionCookie } from '../../../../../lib/session';
import { getServerContext } from '../../../../../lib/server-context';
import { getBiddingCampaign } from '../../../../../lib/api/bidding';
import { SubmitBidForm } from '../../../../../components/bidding/SubmitBidForm';
import { tForLocale } from '../../../../../lib/i18n/messages';
import { localeRedirect } from '../../../../../lib/i18n/navigation';
import { LocalizedLink } from '../../../../../lib/i18n/localized-link';

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
  if (!session) return await localeRedirect('/login');
  const { id } = await params;
  const { locale } = await getServerContext();
  const t = tForLocale(locale);

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
        <LocalizedLink href="/account/bidding">{t('account.bidding.back')}</LocalizedLink>
      </p>
      <h2>{campaign.title}</h2>
      <p className="muted">
        <code>{campaign.code}</code> · {campaign.status} · {t('account.bidding.closes')}{' '}
        {new Date(campaign.closesAt).toLocaleString(locale)}
      </p>

      {myReceipt ? (
        <section className="mb-[16px]">
          <h3>{t('account.bidding.receipt')}</h3>
          <p>
            {t('account.bidding.status')}: <strong>{myReceipt.status}</strong>
          </p>
          <p>
            {t('account.bidding.bid')}: {myReceipt.bidUnitPrice ?? '—'} × {myReceipt.bidQty ?? '—'}
          </p>
          {myReceipt.tradeId ? (
            <p>
              {t('account.bidding.tradeId')}: <code>{myReceipt.tradeId}</code>
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

      {!open && !myReceipt ? <p className="muted">{t('account.bidding.closed')}</p> : null}
    </>
  );
}
