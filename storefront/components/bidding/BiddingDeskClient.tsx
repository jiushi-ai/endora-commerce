'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import type {
  StorefrontBiddingCampaign,
  StorefrontBiddingReceipt,
} from '../../lib/api/bidding';

const PAGE_SIZES = [5, 10, 20] as const;

/**
 * Client desk for account bidding — styled Open CTA + local pagination
 * for campaigns and receipts (Batch D UI polish).
 */
export function BiddingDeskClient(props: {
  campaigns: StorefrontBiddingCampaign[];
  receipts: StorefrontBiddingReceipt[];
  loadError: string | null;
}): ReactNode {
  const { campaigns, receipts, loadError } = props;
  const [campaignPage, setCampaignPage] = useState(0);
  const [campaignPageSize, setCampaignPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);
  const [receiptPage, setReceiptPage] = useState(0);
  const [receiptPageSize, setReceiptPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);

  const campaignSlice = useMemo(() => {
    const start = campaignPage * campaignPageSize;
    return campaigns.slice(start, start + campaignPageSize);
  }, [campaigns, campaignPage, campaignPageSize]);

  const receiptSlice = useMemo(() => {
    const start = receiptPage * receiptPageSize;
    return receipts.slice(start, start + receiptPageSize);
  }, [receipts, receiptPage, receiptPageSize]);

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
          {campaignSlice.map((c) => (
            <tr key={c.id}>
              <td>
                <code>{c.code}</code>
              </td>
              <td>{c.title}</td>
              <td>{c.status}</td>
              <td>{new Date(c.closesAt).toLocaleString()}</td>
              <td>
                <Link href={`/account/bidding/${c.id}`} className="btn btn--dark btn--sm">
                  Open
                </Link>
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
      {campaigns.length > 0 ? (
        <LocalPager
          label="Campaigns"
          page={campaignPage}
          pageSize={campaignPageSize}
          total={campaigns.length}
          onPageChange={setCampaignPage}
          onPageSizeChange={(n) => {
            setCampaignPageSize(n);
            setCampaignPage(0);
          }}
        />
      ) : null}

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
          {receiptSlice.map((r) => (
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
      {receipts.length > 0 ? (
        <LocalPager
          label="Receipts"
          page={receiptPage}
          pageSize={receiptPageSize}
          total={receipts.length}
          onPageChange={setReceiptPage}
          onPageSizeChange={(n) => {
            setReceiptPageSize(n);
            setReceiptPage(0);
          }}
        />
      ) : null}
    </>
  );
}

function LocalPager(props: {
  label: string;
  page: number;
  pageSize: (typeof PAGE_SIZES)[number];
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: (typeof PAGE_SIZES)[number]) => void;
}): ReactNode {
  const totalPages = Math.max(1, Math.ceil(props.total / props.pageSize));
  const safePage = Math.min(props.page, totalPages - 1);
  const start = props.total === 0 ? 0 : safePage * props.pageSize + 1;
  const end = Math.min((safePage + 1) * props.pageSize, props.total);
  const isFirst = safePage === 0;
  const isLast = safePage >= totalPages - 1;

  return (
    <nav
      className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[12px] text-muted"
      aria-label={`${props.label} pagination`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span>
          Showing {start}–{end} of {props.total}
        </span>
        <label className="flex items-center gap-1.5">
          Rows per page
          <select
            className="b2b-field b2b-field--sm"
            value={props.pageSize}
            onChange={(ev) =>
              props.onPageSizeChange(Number(ev.target.value) as (typeof PAGE_SIZES)[number])
            }
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex items-center gap-2">
        <span>
          Page {safePage + 1} of {totalPages}
        </span>
        <button
          type="button"
          className="btn btn--outline btn--sm"
          disabled={isFirst}
          onClick={() => props.onPageChange(Math.max(0, safePage - 1))}
        >
          Previous
        </button>
        <button
          type="button"
          className="btn btn--outline btn--sm"
          disabled={isLast}
          onClick={() => props.onPageChange(Math.min(totalPages - 1, safePage + 1))}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
