import type { ReactNode } from 'react';
import { getSessionCookie } from '../../../lib/session';
import {
  getSelfNewsletter,
  selfSubscribeNewsletter,
  selfUnsubscribeNewsletter,
} from '../../../lib/api/newsletter';
import type { Metadata } from 'next';
import { localeRedirect } from '../../../lib/i18n/navigation';
import { getServerContext } from '../../../lib/server-context';
import { tForLocale } from '../../../lib/i18n/messages';

/**
 * Not indexed (`specs/098-storefront-ssr-seo-a11y-suite/`, FR-010): an
 * authenticated or transactional surface, of no use to a crawler and not a
 * page a search result should ever land a buyer on.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Customer account newsletter panel (feature 048, US9). Shows whether the
 * signed-in customer is subscribed and which tags they hold, and lets them
 * subscribe / unsubscribe (with an optional reason).
 *
 * Batch 63 — chrome via `tForLocale` (en / zh-CN / zh-TW / pl).
 */
export default async function AccountNewsletterPage(): Promise<ReactNode> {
  const session = await getSessionCookie();
  if (!session) return await localeRedirect('/login?next=/newsletter');

  const [{ locale }, status] = await Promise.all([getServerContext(), getSelfNewsletter(session)]);
  const t = tForLocale(locale);

  async function subscribe(): Promise<void> {
    'use server';
    const s = await getSessionCookie();
    if (!s) return await localeRedirect('/login?next=/newsletter');
    await selfSubscribeNewsletter(s);
    return await localeRedirect('/newsletter');
  }

  async function unsubscribe(formData: FormData): Promise<void> {
    'use server';
    const s = await getSessionCookie();
    if (!s) return await localeRedirect('/login?next=/newsletter');
    const reason = String(formData.get('reason') ?? '').trim();
    await selfUnsubscribeNewsletter(s, reason || undefined);
    return await localeRedirect('/newsletter');
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('newsletter.title')}</h1>
      {status.subscribed ? (
        <>
          <p className="text-sm">{t('newsletter.subscribed')}</p>
          {status.tags.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('newsletter.tags').replace('{tags}', status.tags.map((tag) => tag.name).join(', '))}
            </p>
          ) : null}
          <form action={unsubscribe} className="flex flex-col gap-2 sm:max-w-md">
            <textarea
              name="reason"
              rows={2}
              placeholder={t('newsletter.reasonPlaceholder')}
              className="rounded border px-3 py-2 text-sm"
            />
            <button type="submit" className="self-start rounded border px-4 py-2 text-sm font-medium">
              {t('newsletter.unsubscribe')}
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="text-sm">{t('newsletter.notSubscribed')}</p>
          <form action={subscribe}>
            <button type="submit" className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              {t('newsletter.subscribe')}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
