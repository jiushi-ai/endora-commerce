import type { ReactNode } from 'react';
import { getSessionCookie } from '../../../lib/session';
import { getServerContext } from '../../../lib/server-context';
import { getMe } from '../../../lib/api/account';
import { tForLocale } from '../../../lib/i18n/messages';
import type { Metadata } from 'next';
import { localeRedirect } from '../../../lib/i18n/navigation';

/**
 * Not indexed (`specs/098-storefront-ssr-seo-a11y-suite/`, FR-010): an
 * authenticated or transactional surface, of no use to a crawler and not a
 * page a search result should ever land a buyer on.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Organization summary (T155). Read-only view of the registered org —
 * admin tools (members + addresses) live in nested routes.
 */
export default async function OrganizationPage(): Promise<ReactNode> {
  const session = await getSessionCookie();
  if (!session) return await localeRedirect('/login');
  const me = await getMe(session);
  const o = me.organization;
  if (!o) return await localeRedirect('/account');
  const { locale } = await getServerContext();
  const t = tForLocale(locale);
  return (
    <>
      <h2>{o.name}</h2>
      <table className="b2b-account__table">
        <tbody>
          <tr>
            <th scope="row">{t('account.org.taxId')}</th>
            <td>{o.taxId}</td>
          </tr>
          <tr>
            <th scope="row">{t('account.org.status')}</th>
            <td>{o.status}</td>
          </tr>
          <tr>
            <th scope="row">{t('account.org.vatStatus')}</th>
            <td>{o.vatStatus}</td>
          </tr>
          <tr>
            <th scope="row">{t('account.org.registeredAddress')}</th>
            <td>
              {o.registeredAddress.street}
              <br />
              {o.registeredAddress.postalCode} {o.registeredAddress.city}
              <br />
              {o.registeredAddress.country}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
