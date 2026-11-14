'use client';

import { useMemo, useState, type ReactNode } from 'react';
import type {
  StorefrontBiddingCampaign,
  StorefrontBiddingReceipt,
} from '../../lib/api/bidding';
import { tForLocale } from '../../lib/i18n/messages';
import { LocalizedLink } from '../../lib/i18n/localized-link';

const PAGE_SIZES = [5, 10, 20] as const;

/**
 * Client desk for account bidding — styled Open CTA + local pagination
 * for campaigns and receipts (Batch D UI polish).
 */
export function BiddingDeskClient(props: {
  campaigns: StorefrontBiddingCampaign[];
  receipts: StorefrontBiddingReceipt[];
  loadError: string | null;
  locale: string;
}): ReactNode {
  const { campaigns, receipts, loadError, locale } = props;
  const t = tForLocale(locale);
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
      <h2>{t('account.bidding.title')}</h2>
      <p className="muted">{t('account.bidding.intro')}</p>
      {loadError ? <p role="alert">{loadError}</p> : null}
      <table className="b2b-account__table">
        <thead>
          <tr>
            <th scope="col">{t('account.bidding.code')}</th>
            <th scope="col">{t('account.bidding.titleCol')}</th>
            <th scope="col">{t('account.bidding.status')}</th>
            <th scope="col">{t('account.bidding.closesCol')}</th>
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
              <td>{new Date(c.closesAt).toLocaleString(locale)}</td>
              <td>
                <LocalizedLink href={`/account/bidding/${c.id}`} className="btn btn--dark btn--sm">
                  {t('account.bidding.open')}
                </LocalizedLink>
              </td>
            </tr>
          ))}
          {campaigns.length === 0 && !loadError ? (
            <tr>
              <td colSpan={5} className="muted">
                {t('account.bidding.emptyCampaigns')}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
      {campaigns.length > 0 ? (
        <LocalPager
          label={t('account.bidding.pagerCampaigns')}
          locale={locale}
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

      <h3 className="mt-[24px]">{t('account.bidding.receiptsHeading')}</h3>
      <table className="b2b-account__table">
        <thead>
          <tr>
            <th scope="col">{t('account.bidding.campaignCol')}</th>
            <th scope="col">{t('account.bidding.status')}</th>
            <th scope="col">{t('account.bidding.bid')}</th>
            <th scope="col">{t('account.bidding.tradeId')}</th>
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
                {t('account.bidding.emptyReceipts')}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
      {receipts.length > 0 ? (
        <LocalPager
          label={t('account.bidding.pagerReceipts')}
          locale={locale}
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
  locale: string;
  page: number;
  pageSize: (typeof PAGE_SIZES)[number];
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: (typeof PAGE_SIZES)[number]) => void;
}): ReactNode {
  const t = tForLocale(props.locale);
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
          {t('account.bidding.showing')
            .replace('{start}', String(start))
            .replace('{end}', String(end))
            .replace('{total}', String(props.total))}
        </span>
        <label className="flex items-center gap-1.5">
          {t('account.bidding.rowsPerPage')}
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
          {t('account.bidding.pageOf')
            .replace('{page}', String(safePage + 1))
            .replace('{total}', String(totalPages))}
        </span>
        <button
          type="button"
          className="btn btn--outline btn--sm"
          disabled={isFirst}
          onClick={() => props.onPageChange(Math.max(0, safePage - 1))}
        >
          {t('account.bidding.previous')}
        </button>
        <button
          type="button"
          className="btn btn--outline btn--sm"
          disabled={isLast}
          onClick={() => props.onPageChange(Math.min(totalPages - 1, safePage + 1))}
        >
          {t('account.bidding.next')}
        </button>
      </div>
    </nav>
  );
}
