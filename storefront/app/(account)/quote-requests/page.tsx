import type { ReactNode } from 'react';
import { listRfqs, type RfqStatus, type RfqSummary } from '../../../lib/api/rfq';
import { getSessionCookie } from '../../../lib/session';
import { getServerContext } from '../../../lib/server-context';
import { formatMoney } from '../../../lib/i18n/money';
import { tForLocale, type MessageKey } from '../../../lib/i18n/messages';
import { RfqValidityMeta } from '../../../components/rfq/RfqValidityMeta';
import type { Metadata } from 'next';
import { localeRedirect } from '../../../lib/i18n/navigation';
import { LocalizedLink } from '../../../lib/i18n/localized-link';

/**
 * Not indexed (`specs/098-storefront-ssr-seo-a11y-suite/`, FR-010): an
 * authenticated or transactional surface, of no use to a crawler and not a
 * page a search result should ever land a buyer on.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Customer Quote Requests list (feature 008 / T033).
 */
export default async function QuoteRequestsPage(): Promise<ReactNode> {
  const session = await getSessionCookie();
  if (!session) return await localeRedirect('/login?next=/quote-requests');
  const rfqs = await listRfqs(session);
  const { locale } = await getServerContext();
  const t = tForLocale(locale);
  const now = new Date();

  return (
    <div className="mx-auto max-w-[1360px] px-[24px]" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 18,
        }}
      >
        <h1>{t('account.rfq.title')}</h1>
        <LocalizedLink href="/catalog" className="btn btn--outline btn--sm">
          {t('account.rfq.browse')}
        </LocalizedLink>
      </div>

      {rfqs.length === 0 ? (
        <p className="muted">{t('account.rfq.empty')}</p>
      ) : (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
          }}
        >
          <table className="industria-orders" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>{t('account.rfq.number')}</th>
                <th>{t('account.rfq.date')}</th>
                <th>{t('account.rfq.lines')}</th>
                <th>{t('account.rfq.value')}</th>
                <th>{t('account.rfq.status')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rfqs.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>#{r.businessId}</strong>
                  </td>
                  <td>{new Date(r.createdAt).toLocaleDateString(locale)}</td>
                  <td>{r.lineCount}</td>
                  <td style={{ fontWeight: 600 }}>{formatTotal(r, locale)}</td>
                  <td>
                    <RfqStatusBadge
                      status={r.status}
                      awaiting={r.awaitingCustomerRevisionAcceptance}
                      locale={locale}
                    />
                    <RfqValidityMeta
                      expiresAt={r.expiresAt}
                      now={now}
                      locale={locale}
                      display="block"
                    />
                  </td>
                  <td>
                    <LocalizedLink href={`/quote-requests/${r.id}`} className="btn btn--outline btn--sm">
                      {t('account.rfq.details')}
                    </LocalizedLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatTotal(r: RfqSummary, locale: string): string {
  const total = r.totalAtAgreedPrice ?? r.totalAtCustomerPrice;
  if (total === null) return '—';
  return formatMoney(total, r.currency, locale);
}

function RfqStatusBadge({
  status,
  awaiting,
  locale,
}: {
  status: RfqStatus;
  awaiting: boolean;
  locale: string;
}): ReactNode {
  const t = tForLocale(locale);
  if (awaiting) {
    return (
      <span className="industria-status industria-status--processing">
        {t('account.rfq.status.awaiting')}
      </span>
    );
  }
  const cls: Record<RfqStatus, string> = {
    Pending: 'industria-status--processing',
    'Created from admin': 'industria-status--processing',
    Approved: 'industria-status--paid',
    Completed: 'industria-status--delivered',
    Canceled: 'industria-status--draft',
    Expired: 'industria-status--draft',
  };
  const key = `account.rfq.status.${status}` as MessageKey;
  const label = t(key);
  return (
    <span className={`industria-status ${cls[status] ?? 'industria-status--draft'}`}>
      {label === key ? status : label}
    </span>
  );
}
