import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { getSessionCookie, clearSessionCookie } from '../../lib/session';
import { getMe } from '../../lib/api/account';
import { logoutCustomer } from '../../lib/api/auth';
import { StorefrontApiError } from '../../lib/api/client';
import { ImpersonationBanner } from '../../components/ImpersonationBanner';
import { SignOutButton } from '../../components/account/SignOutButton';
import { getServerContext } from '../../lib/server-context';
import { tForLocale } from '../../lib/i18n/messages';

/**
 * Authenticated route-group layout (T154 + T155). Loads `/me` once for the
 * sidebar so individual pages don't have to re-fetch the customer just to
 * render the navigation. If the session is missing or expired, the layout
 * redirects to `/login?next=...` instead of leaking a half-rendered page.
 */
export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactNode> {
  const session = await getSessionCookie();
  if (!session) redirect('/login?next=/account');

  const { locale } = await getServerContext();
  const t = tForLocale(locale);

  let me;
  try {
    me = await getMe(session);
  } catch (err) {
    if (err instanceof StorefrontApiError && err.status === 401) {
      redirect('/session-expired?next=/account');
    }
    throw err;
  }

  const isAdmin = me.customerAccount.role === 'organization_admin';

  return (
    <section className="b2b-account">
      {me.impersonation ? (
        <div style={{ gridColumn: '1 / -1' }}>
          <ImpersonationBanner
            impersonatorAdminUserId={me.impersonation.impersonatorAdminUserId}
          />
        </div>
      ) : null}
      <aside className="b2b-account__nav" aria-label={t('account.nav.aria')}>
        <strong>
          {me.customerAccount.firstName} {me.customerAccount.lastName}
        </strong>
        {me.organization ? <span className="muted">{me.organization.name}</span> : null}
        <Link href="/account">{t('account.nav.profile')}</Link>
        <Link href="/addresses">{t('account.nav.addresses')}</Link>
        <Link href="/account/password">{t('account.nav.password')}</Link>
        {me.organization ? (
          <>
            <Link href="/orders">{t('account.nav.orders')}</Link>
            <Link href="/returns">{t('account.nav.returns')}</Link>
            <Link href="/quote-requests">{t('account.nav.quoteRequests')}</Link>
            <Link href="/account/bidding">{t('account.nav.bidding')}</Link>
            <Link href="/shopping-lists">{t('account.nav.shoppingLists')}</Link>
            <Link href="/quick-order">{t('account.nav.quickOrder')}</Link>
            <Link href="/organization">{t('account.nav.organization')}</Link>
            <Link href="/organization/addresses">{t('account.nav.orgAddresses')}</Link>
            {isAdmin ? <Link href="/organization/members">{t('account.nav.members')}</Link> : null}
          </>
        ) : null}
        <SignOutButton signOut={logoutAction} label={t('account.nav.signOut')} />
      </aside>
      <div className="b2b-account__panel">{children}</div>
    </section>
  );
}

async function logoutAction(): Promise<void> {
  'use server';
  const session = await getSessionCookie();
  await logoutCustomer(session);
  await clearSessionCookie();
  redirect('/login');
}
