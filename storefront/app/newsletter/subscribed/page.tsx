import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { getServerContext } from '../../../lib/server-context';
import { tForLocale } from '../../../lib/i18n/messages';

/**
 * Not indexed (`specs/098-storefront-ssr-seo-a11y-suite/`, FR-010): an
 * authenticated or transactional surface, of no use to a crawler and not a
 * page a search result should ever land a buyer on.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Newsletter signup outcome page (feature 048, US1). */
export default async function NewsletterSubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}): Promise<ReactNode> {
  const [{ locale }, { status }] = await Promise.all([getServerContext(), searchParams]);
  const t = tForLocale(locale);
  const messageKey =
    status === 'active'
      ? 'newsletter.signupOutcome.active'
      : status === 'error'
        ? 'newsletter.signupOutcome.error'
        : 'newsletter.signupOutcome.pending';
  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">{t('newsletter.title')}</h1>
      <p className="mt-4 text-muted-foreground">{t(messageKey)}</p>
    </main>
  );
}