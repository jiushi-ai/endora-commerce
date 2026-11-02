import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSessionCookie } from '../../../../lib/session';
import { listBiddingCampaigns, listMyBidReceipts } from '../../../../lib/api/bidding';

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
    <>
      <h2>Bidding campaigns</h2>
      <p className="muted">Scarce-stock campaigns visible to your organization.</p>
      {loadError ? <p role="alert">{loadError}</p> : null}
      <table className="b2b-account__table">
        <thead>
          <tr>
            <th scope="col">Code</th>
            <th scope="col">Title</th>
            <th scope="col">Status</th>
            <th scope="col">Closes</th>
            <th scope="col" />
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr key={c.id}>
              <td>
                <code>{c.code}</code>
              </td>
              <td>{c.title}</td>
              <td>{c.status}</td>
              <td>{new Date(c.closesAt).toLocaleString()}</td>
              <td>
                <Link href={`/account/bidding/${c.id}`}>Open</Link>
              </td>
            </tr>
          ))}
          {campaigns.length === 0 && !loadError ? (
            <tr>
              <td colSpan={5} className="muted">
                No open campaigns.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <h3 className="mt-[24px]">My receipts</h3>
      <table className="b2b-account__table">
        <thead>
          <tr>
            <th scope="col">Campaign</th>
            <th scope="col">Status</th>
            <th scope="col">Bid</th>
            <th scope="col">Trade id</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((r) => (
            <tr key={r.id}>
              <td>
                <code>{r.campaignId.slice(0, 8)}…</code>
              </td>
              <td>{r.status}</td>
              <td>
                {r.bidUnitPrice ?? '—'} × {r.bidQty ?? '—'}
              </td>
              <td>{r.tradeId ?? '—'}</td>
            </tr>
          ))}
          {receipts.length === 0 && !loadError ? (
            <tr>
              <td colSpan={4} className="muted">
                No receipts yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </>
  );
}
