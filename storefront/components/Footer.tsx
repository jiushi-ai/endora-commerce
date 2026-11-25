import type { ReactNode } from 'react';
import { tForLocale } from '../lib/i18n/messages';
import { LocalizedAnchor, LocalizedForm } from '../lib/i18n/localized-link';

/**
 * Industria-themed footer. Five-column dark layout with brand panel,
 * shop, account, support, and a newsletter sign-up.
 *
 * Batch 63 — Shop L1 categories from Admin catalog (not hardcoded
 * fasteners/tools demo slugs). B2B account matches the open-source demo
 * (no invoices / credit-limit footer links). Terms / Privacy / Cookies
 * stay hidden while those routes 404.
 *
 * Batch 64 — Shop lists children under a single catalog root; Mobii Green
 * Energy copyright (tax ID 28010606); blurb uses live L1 names; Support
 * shows disabled grey items with Contact live; newsletter posts to
 * `/newsletter/subscribe`.
 */

const COL_HEADING =
  'mb-[14px] font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#fafafa]';
const COL_LINK = 'block py-[5px] text-[13px] text-[#a1a1aa] hover:text-white';
/** Batch 64 — Support items that have no page yet: visible but not clickable. */
const COL_DISABLED = 'block py-[5px] text-[13px] text-[#52525b] cursor-not-allowed select-none';

/** One top-level category for the Shop column (batch 63/64). */
export interface FooterShopCategory {
  slug: string;
  name: string;
}

/** Storefront brand mark — same asset as Admin (`/brand/mobii.png`). */
function MobiiBrandMark(props: { className?: string; label: string }): ReactNode {
  return (
    <img
      className={props.className}
      src="/brand/mobii.png"
      alt={props.label}
      width={28}
      height={28}
      decoding="async"
    />
  );
}

const DISABLED_SUPPORT_KEYS = [
  'footer.complaints',
  'footer.delivery',
  'footer.certificates',
  'footer.helpCenter',
] as const;

export function Footer(props: {
  locale: string;
  /** Level-1 catalog categories from Admin; empty ⇒ Shop shows Catalog + Quick order only. */
  shopCategories?: readonly FooterShopCategory[];
  cmsLinks?: Array<{ path: string; title: string }>;
  top?: ReactNode;
  bottom?: ReactNode;
  copyright?: ReactNode;
}): ReactNode {
  const t = tForLocale(props.locale);
  const shopCategories = props.shopCategories ?? [];
  const categoryList =
    shopCategories.length > 0
      ? shopCategories.map((c) => c.name).join(props.locale.startsWith('zh') ? '、' : ', ')
      : t('footer.blurbCategoriesFallback');
  const blurb = t('footer.blurb').replace('{categories}', categoryList);
  const copyrightLine = t('footer.copyright').replace('{year}', String(new Date().getFullYear()));

  // Batch 64 — Contact stays live; other Support entries are grey placeholders.
  const contactLinks =
    props.cmsLinks && props.cmsLinks.length > 0
      ? props.cmsLinks
      : [{ path: 'kontakt', title: t('footer.contact') }];

  return (
    <footer className="mt-[64px] bg-[#18181b] pt-[56px] pb-[28px] text-[#d4d4d8] dark:bg-[#050507]">
      <div className="mx-auto max-w-[1360px] px-[24px]">
        {props.top}
        <div className="grid grid-cols-[2fr_repeat(4,1fr)] gap-8 border-b border-white/8 pb-9 max-[920px]:grid-cols-2">
          <div>
            <div className="flex items-center gap-2.5">
              <MobiiBrandMark
                className="h-7 w-7 shrink-0 rounded-md object-cover"
                label={t('chrome.brand.text')}
              />
              <strong className="text-[16px] text-white">
                {t('chrome.brand.textPrimary')}{' '}
                <span className="text-accent">{t('chrome.brand.textAccent')}</span>
              </strong>
            </div>
            <p className="mt-[14px] max-w-[280px] leading-[1.5] text-[#a1a1aa]">{blurb}</p>
          </div>

          <div>
            <h5 className={COL_HEADING}>{t('footer.shop')}</h5>
            <LocalizedAnchor className={COL_LINK} href="/catalog">
              {t('footer.catalog')}
            </LocalizedAnchor>
            {shopCategories.map((c) => (
              <LocalizedAnchor key={c.slug} className={COL_LINK} href={`/c/${c.slug}`}>
                {c.name}
              </LocalizedAnchor>
            ))}
            <LocalizedAnchor className={COL_LINK} href="/quick-order">
              {t('nav.quickOrder')}
            </LocalizedAnchor>
          </div>

          <div>
            <h5 className={COL_HEADING}>{t('footer.account')}</h5>
            <LocalizedAnchor className={COL_LINK} href="/account">
              {t('footer.myAccount')}
            </LocalizedAnchor>
            <LocalizedAnchor className={COL_LINK} href="/orders">
              {t('footer.orders')}
            </LocalizedAnchor>
            <LocalizedAnchor className={COL_LINK} href="/quote-requests">
              {t('footer.rfq')}
            </LocalizedAnchor>
            <LocalizedAnchor className={COL_LINK} href="/shopping-lists">
              {t('footer.shoppingLists')}
            </LocalizedAnchor>
          </div>

          <div>
            <h5 className={COL_HEADING}>{t('footer.support')}</h5>
            {contactLinks.map((l) => (
              <LocalizedAnchor key={l.path} className={COL_LINK} href={`/${l.path}`}>
                {l.title}
              </LocalizedAnchor>
            ))}
            {DISABLED_SUPPORT_KEYS.map((key) => (
              <span key={key} className={COL_DISABLED} aria-disabled="true">
                {t(key)}
              </span>
            ))}
          </div>

          <div>
            <h5 className={COL_HEADING}>{t('footer.newsletter')}</h5>
            <p className="mb-3 text-[12px] text-[#a1a1aa]">{t('footer.newsletterHint')}</p>
            <LocalizedForm action="/newsletter/subscribe" method="POST">
              <input type="hidden" name="consent" value="on" />
              <input type="hidden" name="language" value={props.locale} />
              <input type="hidden" name="returnTo" value="/newsletter/subscribed" />
              <input
                className="mb-2 w-full rounded-md border border-white/12 bg-white/4 px-2.5 py-2 text-[13px] text-white placeholder:text-[#71717a]"
                type="email"
                name="email"
                placeholder={t('footer.newsletterPlaceholder')}
                required
              />
              <button type="submit" className="btn btn--primary btn--block btn--sm">
                {t('footer.newsletterSubmit')}
              </button>
            </LocalizedForm>
          </div>
        </div>

        {props.bottom}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-[22px] text-[12px] text-[#71717a]">
          <span>{copyrightLine}</span>
          {props.copyright}
          {/* Batch 63 — Terms / Privacy / Cookies hidden while those routes 404. */}
        </div>

        <p
          className="mt-[22px] flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 border-t border-white/8 pt-[22px] text-[15px] font-semibold text-[#d4d4d8]"
          data-testid="footer-platform-brand"
        >
          <MobiiBrandMark
            className="h-7 w-7 shrink-0 rounded-md object-cover"
            label={t('chrome.brand.text')}
          />
          <span>
            {t('chrome.brand.textPrimary')}{' '}
            <span className="text-accent">{t('chrome.brand.textAccent')}</span>
          </span>
        </p>
      </div>
    </footer>
  );
}
