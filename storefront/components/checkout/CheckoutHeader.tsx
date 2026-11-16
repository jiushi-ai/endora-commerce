import type { ReactNode } from 'react';
import { LocalizedLink } from '../../lib/i18n/localized-link';
import { tForLocale } from '../../lib/i18n/messages';

/**
 * Minimal checkout chrome (feature 036, US5). On `/checkout*` routes the root
 * layout swaps the full storefront header (nav, search, mega-menu, cart) for
 * this single-element header — only the brand logo — to remove distractions
 * from the buyer's path to "Place order".
 *
 * Brand mark matches the full storefront Header / Footer (Mobii), not the
 * upstream Industria placeholder.
 */
export function CheckoutHeader({ locale }: { locale: string }): ReactNode {
  const t = tForLocale(locale);
  return (
    <header className="industria-header b2b-checkout-header" role="banner">
      <div className="mx-auto flex h-[64px] max-w-[1360px] items-center justify-center px-[24px]">
        <LocalizedLink
          href="/"
          className="industria-header__brand"
          aria-label={t('chrome.brand.text')}
        >
          <img
            className="industria-header__mark h-8 w-8 rounded-md object-cover"
            src="/brand/mobii.png"
            alt={t('chrome.brand.text')}
            width={32}
            height={32}
            decoding="async"
          />
          <span className="industria-header__brand__name">
            {t('chrome.brand.textPrimary')}{' '}
            <span className="text-accent">{t('chrome.brand.textAccent')}</span>
            <small>{t('chrome.brandTagline')}</small>
          </span>
        </LocalizedLink>
      </div>
    </header>
  );
}
