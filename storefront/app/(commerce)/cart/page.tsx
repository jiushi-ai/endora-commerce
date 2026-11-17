import type { ReactNode } from 'react';
import {
  CART_UNAVAILABLE,
  getCart,
  getCartUpsells,
  removeCartItem,
  updateCartItem,
  touchCart,
  applyCartCoupon,
  clearCartCoupon,
  convertCartToQuoteRequest,
  submitCartForApproval,
  saveCartItemToShoppingList,
  type CartCookieJar,
  type CartItem,
} from '../../../lib/api/cart';
import { listShoppingLists } from '../../../lib/api/shopping-lists';
import { getServerContext } from '../../../lib/server-context';
import {
  getAnonCartCookie,
  getSessionCookie,
  setAnonCartCookie,
} from '../../../lib/session';
import { StorefrontApiError } from '../../../lib/api/client';
import { OrganizationModerationBanner } from '../../../components/OrganizationModerationBanner';
import { CartLine, type CartLineViewModel } from '../../../components/CartLine';
import { CartTotals } from '../../../components/CartTotals';
import { UpsellStrip } from '../../../components/UpsellStrip';
import { CartCouponInput } from '../../../components/CartCouponInput';
import { CartConvertButtons } from '../../../components/CartConvertButtons';
import { CartDroppedLinesBanner } from '../../../components/CartDroppedLinesBanner';
import { CartApprovalBanner } from '../../../components/CartApprovalBanner';
import { CartPrimaryCta } from '../../../components/CartPrimaryCta';
import { getMe } from '../../../lib/api/account';
import { getProductDisplayMode, PRICING_UNAVAILABLE } from '../../../lib/api/pricing';
import { lineAmountHalfUp, type DisplayMode } from '@endora-commerce/contracts';
import type { Metadata } from 'next';
import {
  cartBlocksCheckout,
  cartLineDisplayName,
  cartLineEditError,
  cartLineEditErrorHref,
  parseCartQuantityEdit,
} from '../../../lib/cartMinimum';
import { droppedBelowMinimumReason } from '../../../lib/batchReport';
import { tForLocale } from '../../../lib/i18n/messages';
import { cartActionFailure } from '../../../lib/cart-action-failure';
import { localeRedirect } from '../../../lib/i18n/navigation';
import { LocalizedLink } from '../../../lib/i18n/localized-link';

/**
 * Not indexed (`specs/098-storefront-ssr-seo-a11y-suite/`, FR-010): an
 * authenticated or transactional surface, of no use to a crawler and not a
 * page a search result should ever land a buyer on.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Cart page — Industria-themed (feature 027 T045 / T046 / T059 / T074 / T096).
 *
 * Layout mirrors the Industria checkout step-0 in
 * `specs/b2b-platform-storefront-ui/project/industria-views-checkout.jsx`:
 * a two-column grid with the cart card on the left (lines + footer
 * actions) and a sticky `.cart-summary` aside on the right (totals +
 * coupon + delivery hint + checkout CTA).
 *
 * Touches `POST /api/v1/cart/touch` on mount (reactivates abandoned
 * carts per FR-002).
 */

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    /** U4 — the line whose quantity edit `error` refuses; the sentence renders beside it. */
    errorItem?: string;
    /** U4 — what the buyer typed into that line, kept in its field. */
    typed?: string;
    couponError?: string;
    couponShortfall?: string;
    couponShortfallCurrency?: string;
    qrCreated?: string;
    listAdded?: string;
    conversionDropped?: string;
  }>;
}): Promise<ReactNode> {
  const params = await searchParams;
  const jar = await readJar();

  // Activity bookkeeping — reactivates an abandoned cart. Never blocks
  // the render (the backend route is a 200/no-op when no cart exists).
  await touchCart(jar).catch(() => undefined);

  const result = await getCart(jar);
  if (result === CART_UNAVAILABLE) {
    // `carts` is not present (issue #132). The page renders the absence rather
    // than a Next error page: an empty cart is a cart, and this is not one.
    const { locale: absentLocale } = await getServerContext();
    const absentStrings = STRINGS(absentLocale);
    return (
      <div className="mx-auto max-w-[1360px] px-[24px]">
        <Breadcrumbs strings={absentStrings.breadcrumbs} />
        <div className="rounded-md border border-line bg-surface px-[24px] py-[48px] text-center">
          <h1 className="m-0 mb-2 text-[22px] font-semibold text-fg">
            {absentStrings.unavailable.heading}
          </h1>
          <p className="m-0 mb-[18px] text-[14px] text-muted">
            {absentStrings.unavailable.body}
          </p>
          <LocalizedLink href="/catalog" className="btn btn--dark">
            {absentStrings.browseCatalog}
          </LocalizedLink>
        </div>
      </div>
    );
  }
  if (result.newAnonCookie) await setAnonCartCookie(result.newAnonCookie);
  const cart = result.cart;

  const session = await getSessionCookie();
  const me = session
    ? await getMe(session).catch(() => null)
    : null;
  const canTransact = me?.organization?.canTransact ?? true;
  // Heuristic until the backend `/me` payload exposes
  // `requiresCartApproval`: any non-`not_required` approval state on
  // the cart means the policy was on at submission time.
  const requiresApproval =
    cart.approvalStatus !== undefined && cart.approvalStatus !== 'not_required';

  const { locale, ctx } = await getServerContext();

  // Resolve ONE price display mode for the whole cart so the net/gross
  // presentation matches the PDP and product cards. It is resolved for the
  // buyer in front of the page (issue #271): `ctx` carries their session, so
  // the endpoint walks the same Product → Category → Organization → Settings
  // chain the resolved price on the PDP walks, for the same viewer. Before
  // that, this call forwarded no credential and the endpoint answered as a
  // guest, so a signed-in buyer whose deployment sets the two `pricing.*` keys
  // differently read one convention here and the other on the product page.
  // Resolved from the first line's product; falls back to net when unreachable.
  //
  // Absent `price_lists` resolves to net too, and that is a decision rather than
  // a fallback (issue #124): a cart line carries the net price that was quoted
  // when it was added, which is a real figure, while a gross presentation would
  // have to be derived from a tax authority this deployment is not serving.
  // Showing what was quoted is honest; deriving a gross total from it would not
  // be.
  const resolvedDisplayMode =
    cart.items.length > 0 && cart.items[0]
      ? await getProductDisplayMode(cart.items[0].productId, ctx)
      : null;
  const displayMode: DisplayMode =
    resolvedDisplayMode && resolvedDisplayMode !== PRICING_UNAVAILABLE
      ? resolvedDisplayMode.displayMode
      : 'net_only';

  const upsells = cart.items.length > 0 ? await getCartUpsells(jar).catch(() => []) : [];

  const strings = STRINGS(locale);

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-[1360px] px-[24px]">
        <Breadcrumbs strings={strings.breadcrumbs} />
        <div className="rounded-md border border-line bg-surface px-[24px] py-[48px] text-center">
          <h1 className="m-0 mb-2 text-[22px] font-semibold text-fg">{strings.heading}</h1>
          <p className="m-0 mb-[18px] text-[14px] text-muted">{strings.empty}</p>
          <LocalizedLink href="/catalog" className="btn btn--dark">
            {strings.browseCatalog}
          </LocalizedLink>
        </div>
      </div>
    );
  }

  const primaryCta = cart.primaryCta ?? (canTransact ? 'checkout' : 'blocked_by_organization');
  const submitForApprovalNeeded = requiresApproval && cart.approvalStatus === 'not_required';

  return (
    <div className="mx-auto max-w-[1360px] px-[24px] pt-[8px] pb-[64px]">
      <Breadcrumbs strings={strings.breadcrumbs} />
      <header className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h1 className="m-0 text-[24px] font-semibold tracking-[-0.02em] text-fg">{strings.heading}</h1>
          <p className="mt-1 text-[13px] text-muted">{strings.subheading(cart.items.length)}</p>
        </div>
      </header>

      <OrganizationModerationBanner
        status={me?.organization?.status}
        message={me?.organization?.moderationMessage ?? null}
      />

      {/* Feature 027 — approval-state banner (US4). */}
      {cart.approvalStatus ? (
        <CartApprovalBanner
          approvalStatus={cart.approvalStatus}
          policyOn={requiresApproval}
          rejectedReason={null}
          submitForApprovalAction={submitForApprovalAction}
          linesBlockedNote={cartBlocksCheckout(cart) ? tForLocale(locale)('cart.approvalBlocked') : null}
          strings={strings.approvalBanner}
        />
      ) : null}

      {/* Conversion-redirect banners */}
      {params.qrCreated ? (
        <div className="mb-3 rounded-md border border-[#bbf7d0] bg-[#ecfdf3] px-[14px] py-[10px] text-[13px] text-ok" role="status">
          {strings.banner.qrCreated}
        </div>
      ) : null}
      {params.listAdded ? (
        <div className="mb-3 rounded-md border border-[#bbf7d0] bg-[#ecfdf3] px-[14px] py-[10px] text-[13px] text-ok" role="status">
          {strings.banner.listAdded(params.listAdded)}
        </div>
      ) : null}
      {params.conversionDropped === '1' && (cart.droppedLines?.length ?? 0) > 0 ? (
        <CartDroppedLinesBanner
          droppedLines={(cart.droppedLines ?? []).map((d) => ({
            productId: d.productId,
            productName: d.productName,
            reason: d.reason,
            minimum: d.minimum,
          }))}
          strings={strings.dropped}
        />
      ) : null}

      {params.error && !cart.items.some((it) => cartLineEditError(params, it.id) !== null) ? (
        <div className="mb-3 rounded-md border border-[#fecaca] bg-[#fef2f2] px-[14px] py-[10px] text-[13px] text-[#b91c1c]" role="alert">
          {params.error}
        </div>
      ) : null}

      <div className="grid grid-cols-[1fr_380px] items-start gap-8 max-[960px]:grid-cols-1">
        <div>
          <div className="overflow-hidden rounded-md border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-[22px] py-[18px]">
              <h2 className="m-0 text-[18px] font-semibold text-fg">{strings.cardHeading}</h2>
              <span className="font-mono text-[12px] text-muted">
                {strings.itemCount(cart.items.length)}
              </span>
            </div>

            {cart.items.map((it) => (
              <CartLine
                key={it.id}
                line={toViewModel(it, locale)}
                updateAction={updateAction}
                removeAction={removeAction}
                saveToListAction={saveToListAction}
                locale={locale}
                displayMode={displayMode}
                editError={cartLineEditError(params, it.id)}
                strings={strings.line}
              />
            ))}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-[22px] py-[18px]">
              <LocalizedLink href="/catalog" className="btn btn--ghost">
                ← {strings.continueShopping}
              </LocalizedLink>
              <CartConvertButtons
                disabled={cart.items.length === 0}
                disabledReason={null}
                convertToQrAction={convertToQrAction}
                strings={strings.convertButtons}
              />
            </div>
          </div>

          <UpsellStrip upsells={upsells} locale={locale} strings={strings.upsells} />
        </div>

        <aside className="sticky top-[96px] rounded-md border border-line bg-surface p-[20px]">
          <h3 className="m-0 mb-[14px] text-[14px] font-semibold text-fg">{strings.summary.heading}</h3>

          <CartTotals
            subtotal={cart.subtotal}
            discount={cart.discount ?? null}
            grandTotal={cart.grandTotal ?? cart.subtotal}
            itemCount={cart.items.length}
            locale={locale}
            displayMode={displayMode}
            strings={strings.totals}
          />

          <CartCouponInput
            appliedCode={cart.discount?.code ?? null}
            droppedOnRead={cart.couponDroppedThisRead ?? null}
            applyError={
              params.couponError
                ? {
                    reason: params.couponError as
                      | 'invalid_code'
                      | 'expired'
                      | 'below_min_spend'
                      | 'wrong_channel'
                      | 'wrong_customer_group'
                      | 'wrong_organization'
                      | 'coupon_format_invalid',
                    ...(params.couponShortfall && params.couponShortfallCurrency
                      ? {
                          shortfall: {
                            amount: Number(params.couponShortfall),
                            currency: params.couponShortfallCurrency,
                          },
                        }
                      : {}),
                  }
                : null
            }
            applyAction={applyCouponAction}
            clearAction={clearCouponAction}
            strings={strings.coupon}
          />

          <div className="mt-4">
            <CartPrimaryCta
              cta={primaryCta}
              authenticated={me !== null}
              submitForApprovalNeeded={submitForApprovalNeeded}
              canTransact={canTransact}
              moderationMessage={me?.organization?.moderationMessage ?? null}
              submitAction={submitForApprovalAction}
              linesBlockCheckout={cartBlocksCheckout(cart)}
              linesBlockedNote={tForLocale(locale)('cart.checkoutBlocked')}
              approvalBlockedNote={tForLocale(locale)('cart.approvalBlocked')}
              strings={strings.cta}
            />
          </div>

          <div className="mt-[14px] flex items-start gap-2 border-t border-line pt-[14px] text-[12px] text-muted [&_svg]:mt-[2px] [&_svg]:h-[14px] [&_svg]:w-[14px] [&_svg]:shrink-0 [&_svg]:text-ok">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>{strings.taxesNote}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Renders a Home / Cart breadcrumb above the main heading. */
function Breadcrumbs({
  strings,
}: {
  strings: { home: string; cart: string };
}): ReactNode {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        fontSize: 13,
        color: 'var(--ink-500)',
        margin: '8px 0 16px',
        display: 'flex',
        gap: 6,
      }}
    >
      <LocalizedLink href="/" style={{ color: 'inherit' }}>
        {strings.home}
      </LocalizedLink>
      <span aria-hidden="true">/</span>
      <span style={{ color: 'var(--ink-900)' }}>{strings.cart}</span>
    </nav>
  );
}

/** Maps a CartItem to the view-model the CartLine component expects. */
function toViewModel(it: CartItem, locale: string): CartLineViewModel {
  return {
    id: it.id,
    productId: it.productId,
    variantId: it.variantId,
    // Backend resolves `productName` from Product.name against the
    // request's Accept-Language. Feature 043 — prefer `displayName`, which
    // already appends the packaging-unit name (e.g. "… (Paleta)"). When
    // unknown (a deleted product, FR-037) fall back to the SKU, then to a
    // sentence — never to the raw product id.
    productName: cartLineDisplayName(it, locale),
    sku: it.productSku ?? null,
    productSlug: it.productSlug ?? null,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    lineTotal: it.lineTotal ?? {
      amount: Number(lineAmountHalfUp(it.unitPrice.amount, it.quantity)),
      currency: it.unitPrice.currency,
    },
    ...(it.unavailable !== undefined ? { unavailable: it.unavailable } : {}),
    ...(it.unavailableReason !== undefined ? { unavailableReason: it.unavailableReason } : {}),
    // Feature 155 — the input floor and the server's below-minimum verdict.
    packagingUnitName: it.packagingUnitName ?? null,
    minOrderQuantity: it.minOrderQuantity ?? null,
    belowMinimum: it.belowMinimum ?? null,
  };
}

async function readJar(): Promise<CartCookieJar> {
  const session = await getSessionCookie();
  const anon = await getAnonCartCookie();
  return {
    ...(session ? { session } : {}),
    ...(anon ? { anon } : {}),
  };
}

async function updateAction(formData: FormData): Promise<void> {
  'use server';
  const itemId = (formData.get('itemId') as string) ?? '';
  // A stepper button posts `step`; the typed input and the one-step fix post `quantity`.
  const step = formData.get('step');
  const typed = formData.get('quantity');
  const edit = parseCartQuantityEdit({
    step: typeof step === 'string' ? step : null,
    quantity: typeof typed === 'string' ? typed : null,
  });
  const typedValue = step === null && typeof typed === 'string' ? typed : null;
  // The backend words its refusal (the minimum sentence) in the language it is asked in.
  const { locale, ctx } = await getServerContext();
  const t = tForLocale(locale);
  if (edit.kind === 'invalid') return await localeRedirect(cartLineEditErrorHref(itemId, t('cart.line.quantityInvalid'), typedValue));
  try {
    // `quantity: 0` removes the line (FR-007, contract §2), whatever its minimum.
    const quantity = edit.kind === 'remove' ? 0 : edit.quantity;
    const result = await updateCartItem(await readJar(), itemId, quantity, ctx);
    if (result.newAnonCookie) await setAnonCartCookie(result.newAnonCookie);
  } catch (err) {
    const message = err instanceof StorefrontApiError ? err.detail : t('cart.line.updateFailed');
    return await localeRedirect(cartLineEditErrorHref(itemId, message, typedValue));
  }
  return await localeRedirect('/cart');
}

async function removeAction(formData: FormData): Promise<void> {
  'use server';
  const itemId = (formData.get('itemId') as string) ?? '';
  const { locale, ctx } = await getServerContext();
  try {
    const result = await removeCartItem(await readJar(), itemId, ctx);
    if (result.newAnonCookie) await setAnonCartCookie(result.newAnonCookie);
  } catch (err) {
    const message =
      err instanceof StorefrontApiError ? err.detail : tForLocale(locale)('cart.line.removeFailed');
    return await localeRedirect(`/cart?error=${encodeURIComponent(message)}`);
  }
  return await localeRedirect('/cart');
}

async function saveToListAction(formData: FormData): Promise<void> {
  'use server';
  const itemId = (formData.get('itemId') as string) ?? '';
  const jar = await readJar();
  if (!jar.session) {
    return await localeRedirect('/cart?error=' + encodeURIComponent('Sign in to save to a list.'));
  }
  try {
    const lists = await listShoppingLists(jar.session ?? '').catch(() => []);
    if (lists.length === 0) {
      return await localeRedirect(
        '/cart?error=' +
          encodeURIComponent(
            'You have no shopping list yet. Create one from the account menu.',
          ),
      );
    }
    const target = lists[0]!;
    await saveCartItemToShoppingList(jar, itemId, target.id);
    return await localeRedirect(`/cart?listAdded=${encodeURIComponent(target.name)}`);
  } catch (err) {
    const message =
      err instanceof StorefrontApiError ? err.detail : 'Could not save line to list.';
    return await localeRedirect(`/cart?error=${encodeURIComponent(message)}`);
  }
}

async function applyCouponAction(formData: FormData): Promise<void> {
  'use server';
  const code = ((formData.get('code') as string) ?? '').trim().toUpperCase();
  if (!code) return await localeRedirect('/cart?couponError=coupon_format_invalid');
  try {
    const result = await applyCartCoupon(await readJar(), code);
    if (result.outcome === 'rejected') {
      const qs = new URLSearchParams({ couponError: result.reason });
      if (result.shortfall) {
        qs.set('couponShortfall', String(result.shortfall.amount));
        qs.set('couponShortfallCurrency', result.shortfall.currency);
      }
      return await localeRedirect(`/cart?${qs.toString()}`);
    }
  } catch (err) {
    const message =
      err instanceof StorefrontApiError ? err.detail : 'Could not apply coupon.';
    return await localeRedirect(`/cart?error=${encodeURIComponent(message)}`);
  }
  return await localeRedirect('/cart');
}

async function clearCouponAction(): Promise<void> {
  'use server';
  try {
    await clearCartCoupon(await readJar());
  } catch {
    // Idempotent — silent fall-through is the spec.
  }
  return await localeRedirect('/cart');
}

async function convertToQrAction(formData: FormData): Promise<void> {
  'use server';
  const note = ((formData.get('note') as string) ?? '').trim() || null;
  try {
    const result = await convertCartToQuoteRequest(await readJar(), note);
    return await localeRedirect(`/quote-requests/${result.quoteRequestSlug}?from=cart`);
  } catch (err) {
    const message =
      err instanceof StorefrontApiError
        ? err.detail
        : 'Could not convert cart to a quote request.';
    return await localeRedirect(`/cart?error=${encodeURIComponent(message)}`);
  }
}

async function submitForApprovalAction(): Promise<void> {
  'use server';
  // `ctx` carries the storefront's language: without it the backend worded its refusal
  // in its own default, whatever language the page was in (U4).
  const { locale, ctx } = await getServerContext();
  try {
    await submitCartForApproval(await readJar(), ctx);
  } catch (err) {
    // A refusal the backend worded (FR-039's minimum refusal, in the request's
    // language) passes through; anything else is the catalogue's sentence.
    const message = cartActionFailure(err, locale, 'cart.submitForApprovalFailed');
    return await localeRedirect(`/cart?error=${encodeURIComponent(message)}`);
  }
  return await localeRedirect('/cart');
}

/* === Locale string catalogue (batch 40 — via messages.ts) ============= */

function STRINGS(locale: string): {
  heading: string;
  subheading: (n: number) => string;
  empty: string;
  /** Issue #132 — the `carts` module is absent; distinct from an empty cart. */
  unavailable: { heading: string; body: string };
  browseCatalog: string;
  cardHeading: string;
  itemCount: (n: number) => string;
  continueShopping: string;
  taxesNote: string;
  breadcrumbs: { home: string; cart: string };
  summary: { heading: string };
  line: Parameters<typeof CartLine>[0]['strings'];
  totals: Parameters<typeof CartTotals>[0]['strings'];
  coupon: Parameters<typeof CartCouponInput>[0]['strings'];
  convertButtons: Parameters<typeof CartConvertButtons>[0]['strings'];
  dropped: Parameters<typeof CartDroppedLinesBanner>[0]['strings'];
  approvalBanner: Parameters<typeof CartApprovalBanner>[0]['strings'];
  upsells: Parameters<typeof UpsellStrip>[0]['strings'];
  banner: { qrCreated: string; listAdded: (listName: string) => string };
  cta: {
    checkout: string;
    submitForApproval: string;
    awaitingApproval: string;
    blockedByOrganization: string;
  };
} {
  const t = tForLocale(locale);
  return {
    heading: t('cart.heading'),
    subheading: (n: number) =>
      n === 1
        ? t('cart.subheading.one')
        : t('cart.subheading.many').replace('{count}', String(n)),
    empty: t('cart.empty'),
    unavailable: {
      heading: t('cart.unavailable.heading'),
      body: t('cart.unavailable.body'),
    },
    browseCatalog: t('cart.browseCatalog'),
    cardHeading: t('cart.cardHeading'),
    itemCount: (n: number) =>
      n === 1
        ? t('cart.itemCount.one')
        : t('cart.itemCount.many').replace('{count}', String(n)),
    continueShopping: t('cart.continueShopping'),
    taxesNote: t('cart.taxesNote'),
    breadcrumbs: { home: t('nav.home'), cart: t('cart.breadcrumb') },
    summary: { heading: t('cart.summary.heading') },
    line: {
      qtyLabel: t('cart.line.qtyLabel'),
      unitPriceLabel: t('cart.line.unitPriceLabel'),
      lineTotalLabel: t('cart.line.lineTotalLabel'),
      removeLabel: t('cart.line.removeLabel'),
      saveToListLabel: t('cart.line.saveToListLabel'),
      updateLabel: t('cart.line.updateLabel'),
      netSuffix: t('cart.line.netSuffix'),
      grossSuffix: t('cart.line.grossSuffix'),
      unavailable: {
        out_of_stock: t('cart.line.unavailable.outOfStock'),
        not_purchasable: t('cart.line.unavailable.notPurchasable'),
        no_price_in_customer_list: t('cart.line.unavailable.noPrice'),
      },
    },
    totals: {
      subtotalLabel: (n: number) =>
        n === 1
          ? t('cart.totals.subtotal.one')
          : t('cart.totals.subtotal.many').replace('{count}', String(n)),
      discountLabel: (code: string | null) =>
        code
          ? t('cart.totals.discountCoded').replace('{code}', code)
          : t('cart.totals.discount'),
      grandTotalLabel: t('cart.totals.grandTotal'),
      deliveryLabel: t('cart.totals.delivery'),
      deliveryValue: t('cart.totals.deliveryValue'),
      netSuffix: t('cart.line.netSuffix'),
      grossSuffix: t('cart.line.grossSuffix'),
    },
    coupon: {
      label: t('cart.coupon.label'),
      placeholder: t('cart.coupon.placeholder'),
      applyButton: t('cart.coupon.apply'),
      clearButton: t('cart.coupon.clear'),
      activeCode: (_code: string) => t('cart.coupon.active'),
      autoDropped: (code: string, _reason: string) =>
        t('cart.coupon.autoDropped').replace('{code}', code),
      rejectedReason: (reason: string, shortfall?: { amount: number; currency: string }) => {
        switch (reason) {
          case 'invalid_code':
            return t('cart.coupon.rejected.invalid');
          case 'expired':
            return t('cart.coupon.rejected.expired');
          case 'below_min_spend':
            return shortfall
              ? t('cart.coupon.rejected.belowMin')
                  .replace('{amount}', shortfall.amount.toFixed(2))
                  .replace('{currency}', shortfall.currency)
              : t('cart.coupon.rejected.belowMinBare');
          case 'wrong_channel':
            return t('cart.coupon.rejected.wrongChannel');
          case 'wrong_customer_group':
            return t('cart.coupon.rejected.wrongGroup');
          case 'wrong_organization':
            return t('cart.coupon.rejected.wrongOrg');
          case 'coupon_format_invalid':
            return t('cart.coupon.rejected.format');
          default:
            return t('cart.coupon.rejected.generic');
        }
      },
    },
    convertButtons: {
      convertToQrLabel: t('cart.convert.toQr'),
      convertToQrHint: t('cart.convert.toQrHint'),
    },
    dropped: {
      heading: t('cart.dropped.heading'),
      intro: t('cart.dropped.intro'),
      reasonNotPurchasable: t('cart.dropped.notPurchasable'),
      reasonOutOfStock: t('cart.dropped.outOfStock'),
      reasonNoPriceInCustomerList: t('cart.dropped.noPrice'),
      reasonRemovedByConversion: t('cart.dropped.removedByConversion'),
      reasonBelowMinimum: (minimum: number | undefined) => droppedBelowMinimumReason(minimum, locale),
    },
    approvalBanner: {
      pending: t('cart.approval.pending'),
      approved: t('cart.approval.approved'),
      rejected: (reason: string | null) =>
        reason
          ? t('cart.approval.rejectedReason').replace('{reason}', reason)
          : t('cart.approval.rejected'),
      policyOn: t('cart.approval.policyOn'),
      submitButton: t('cart.approval.submit'),
    },
    upsells: {
      heading: t('cart.upsells.heading'),
      noPriceLabel: t('cart.upsells.noPrice'),
    },
    banner: {
      qrCreated: t('cart.banner.qrCreated'),
      listAdded: (listName: string) => t('cart.banner.listAdded').replace('{name}', listName),
    },
    cta: {
      checkout: t('cart.cta.checkout'),
      submitForApproval: t('cart.cta.submitForApproval'),
      awaitingApproval: t('cart.cta.awaitingApproval'),
      blockedByOrganization: t('cart.cta.blockedByOrganization'),
    },
  };
}
