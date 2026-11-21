import { Fragment, type ReactNode } from 'react';
import { revalidatePath } from 'next/cache';
import {
  clearShoppingListItems,
  convertShoppingListToCart,
  convertShoppingListToRfq,
  getShoppingList,
  removeShoppingListItem,
  renameShoppingList,
  updateShoppingListItem,
} from '../../../../lib/api/shopping-lists';
import { getSessionCookie } from '../../../../lib/session';
import { StorefrontApiError } from '../../../../lib/api/client';
import { getServerContext } from '../../../../lib/server-context';
import { getProductBySlug } from '../../../../lib/api/catalog';
import { ClearListButton } from '../../../../components/shopping-lists/ClearListButton';
import {
  decodeConversionSkips,
  encodeConversionSkips,
  reportMoreText,
  shoppingListSkipLabel,
} from '../../../../lib/batchReport';
import { tForLocale } from '../../../../lib/i18n/messages';
import { LIST_QUANTITY_MAX, parseListQuantity } from '../../../../lib/shoppingListQuantity';
import type { Metadata } from 'next';
import { localeRedirect } from '../../../../lib/i18n/navigation';
import { LocalizedLink } from '../../../../lib/i18n/localized-link';
import { getCommerceAbilitiesAction } from '../../../../lib/actions/cart';

/**
 * Not indexed (`specs/098-storefront-ssr-seo-a11y-suite/`, FR-010): an
 * authenticated or transactional surface, of no use to a crawler and not a
 * page a search result should ever land a buyer on.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Minimal product info shown for a shopping-list row. */
interface ResolvedProduct {
  name: string;
  sku: string;
  slug: string;
}

/**
 * Shopping list detail (T205). Items can be edited inline; "Convert all
 * to cart" / "Convert all to RFQ" run the bulk conversion. Per-item
 * checkboxes feed an `itemIds` array to the server actions for the
 * "Convert selected" variant; archived skips are surfaced via a banner
 * after conversion.
 *
 * `specs/170-organization-roles/` (FR-057): rename / qty / remove / clear need
 * `shopping_lists.create`; convert-to-cart and convert-to-quote each need their
 * own ability. A read-only member still sees the list.
 */

export default async function ShoppingListDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    cartAdded?: string;
    cartSkipped?: string;
    /** Feature 155 — the conversion's `skipped[]`, carried across the redirect (base64url JSON). */
    cartSkips?: string;
    rfqId?: string;
    rfqAdded?: string;
    rfqSkipped?: string;
    /** U4 — the row whose quantity edit was refused; the page words why beside its input. */
    qtyError?: string;
  }>;
}): Promise<ReactNode> {
  const session = await getSessionCookie();
  const { id } = await params;
  if (!session) return await localeRedirect(`/login?next=/account/shopping-lists/${id}`);
  const sp = await searchParams;
  let list;
  try {
    list = await getShoppingList(session, id);
  } catch (err) {
    if (err instanceof StorefrontApiError && err.status === 404) {
      const { locale: notFoundLocale } = await getServerContext();
      const tn = tForLocale(notFoundLocale);
      return (
        <div>
          <h2>{tn('shoppingList.notFound.title')}</h2>
          <p className="b2b-auth__error">{tn('shoppingList.notFound.body')}</p>
        </div>
      );
    }
    throw err;
  }

  // Resolve each item's product so the table can show a name + SKU and link to
  // the product card (the item row only carries the product UUID). The detail
  // endpoint accepts an id or a slug; failures (archived / removed) fall back
  // to the raw id so the row still renders.
  const { ctx, locale } = await getServerContext();
  const t = tForLocale(locale);
  const abilities = await getCommerceAbilitiesAction();
  const canEdit = abilities.editShoppingLists;
  // Feature 155 (FR-011) — which rows the conversion left out, and why (a minimum included).
  // Carried capped (the first rows plus a count), so the URL stays bounded.
  const cartSkipReport = sp.cartAdded !== undefined ? decodeConversionSkips(sp.cartSkips) : { lines: [], more: 0 };
  const cartSkips = cartSkipReport.lines;
  const uniqueProductIds = [...new Set(list.items.map((it) => it.productId))];
  const resolvedEntries = await Promise.all(
    uniqueProductIds.map(async (pid): Promise<[string, ResolvedProduct | null]> => {
      try {
        const product = await getProductBySlug(pid, ctx);
        return [pid, { name: product.name, sku: product.sku, slug: product.slug }];
      } catch {
        return [pid, null];
      }
    }),
  );
  const productsById = new Map<string, ResolvedProduct | null>(resolvedEntries);

  return (
    <>
      <h2>{list.name}</h2>
      <p>
        <LocalizedLink href="/shopping-lists">{t('shoppingList.backToAll')}</LocalizedLink>
      </p>
      {sp.error ? <p className="b2b-auth__error">{sp.error}</p> : null}
      {sp.cartAdded ? (
        <p className="b2b-auth__success">
          {sp.cartSkipped && Number(sp.cartSkipped) > 0
            ? t('shoppingList.cartAddedSkipped')
                .replace('{count}', sp.cartAdded)
                .replace('{skipped}', sp.cartSkipped)
            : t('shoppingList.cartAdded').replace('{count}', sp.cartAdded)}
        </p>
      ) : null}
      {cartSkips.length > 0 ? (
        <section
          aria-labelledby="list-cart-skips"
          className="my-[12px] rounded-md border border-warn bg-warn-soft px-[16px] py-[12px] text-fg"
        >
          <h3 id="list-cart-skips" className="m-0 mb-1 text-[14px] font-semibold">
            {t('shoppingList.skip.heading')}
          </h3>
          <ul className="m-0 pl-5 text-[13px]">
            {cartSkips.map((skip) => (
              <li key={skip.itemId}>
                <strong>{productsById.get(skip.productId)?.name ?? t('cart.line.unknownProduct')}</strong>
                {' — '}
                {shoppingListSkipLabel(skip, locale)}
              </li>
            ))}
            {cartSkipReport.more > 0 ? <li>{reportMoreText(cartSkipReport.more, locale)}</li> : null}
          </ul>
        </section>
      ) : null}
      {sp.rfqAdded ? (
        <p className="b2b-auth__success">
          {sp.rfqSkipped && Number(sp.rfqSkipped) > 0
            ? t('shoppingList.rfqAddedSkipped')
                .replace('{count}', sp.rfqAdded)
                .replace('{skipped}', sp.rfqSkipped)
            : t('shoppingList.rfqAdded').replace('{count}', sp.rfqAdded)}{' '}
          <LocalizedLink href={`/quote-requests/${sp.rfqId}`}>{t('shoppingList.openRfq')}</LocalizedLink>
        </p>
      ) : null}

      {!canEdit ? (
        <p className="b2b-auth__hint" role="note">
          {t('account.lists.readOnlyNote')}
        </p>
      ) : null}

      {canEdit ? (
        <form action={renameAction} className="flex items-end gap-2">
          <input type="hidden" name="listId" value={list.id} />
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="rename" className="text-sm text-fg-soft">
              {t('shoppingList.rename.label')}
            </label>
            <input
              id="rename"
              name="name"
              defaultValue={list.name}
              required
              maxLength={160}
              className="w-full rounded-md border border-line px-3 py-2 text-sm"
            />
          </div>
          <button type="submit" className="btn btn--outline">
            {t('shoppingList.rename.submit')}
          </button>
        </form>
      ) : null}

      <h3 className="mt-10 mb-4">{t('shoppingList.items.heading')}</h3>
      {list.items.length === 0 ? (
        <p className="muted">
          {t('shoppingList.items.empty')}{' '}
          <LocalizedLink href="/catalog">{t('nav.catalog')}</LocalizedLink>
        </p>
      ) : (
        <>
        {/*
          The per-row "Save" / "Remove" controls and the "Convert" buttons each
          need their own form, but a table can't host nested forms (the browser
          drops the inner ones, which is why Remove appeared to do nothing).
          Instead we declare every form once here as a sibling of the table and
          wire the in-cell controls to them via the HTML `form` attribute.
        */}
        <form id="sl-convert" action={convertSelectedToCartAction}>
          <input type="hidden" name="listId" value={list.id} />
        </form>
        {canEdit
          ? list.items.map((it) => (
              <Fragment key={`forms-${it.id}`}>
                {/* `noValidate`: the browser's own `min` bubble speaks the browser's language. The
                    action validates and the row says what is wrong beside the field (U4). */}
                <form id={`sl-qty-${it.id}`} action={updateQtyAction} noValidate>
                  <input type="hidden" name="listId" value={list.id} />
                  <input type="hidden" name="itemId" value={it.id} />
                </form>
                <form id={`sl-remove-${it.id}`} action={removeAction}>
                  <input type="hidden" name="listId" value={list.id} />
                  <input type="hidden" name="itemId" value={it.id} />
                </form>
              </Fragment>
            ))
          : null}
        <table className="b2b-account__table">
            <thead>
              <tr>
                {abilities.convertListToCart || abilities.convertListToQuote ? <th></th> : null}
                <th>{t('shoppingList.col.product')}</th>
                <th>{t('shoppingList.col.qty')}</th>
                <th>{t('shoppingList.col.note')}</th>
                {canEdit ? <th></th> : null}
              </tr>
            </thead>
            <tbody>
              {list.items.map((it) => (
                <tr key={it.id}>
                  {abilities.convertListToCart || abilities.convertListToQuote ? (
                    <td>
                      <input type="checkbox" name="itemIds" value={it.id} form="sl-convert" />
                    </td>
                  ) : null}
                  <td>
                    {(() => {
                      const product = productsById.get(it.productId);
                      if (!product) {
                        return (
                          <span className="text-fg-soft">
                            {it.productId.slice(0, 8)}
                          </span>
                        );
                      }
                      return (
                        <LocalizedLink href={`/p/${product.slug}`} className="flex flex-col">
                          <span className="font-medium text-fg">{product.name}</span>
                          <span className="text-xs text-fg-soft">SKU: {product.sku}</span>
                        </LocalizedLink>
                      );
                    })()}
                    {it.variantId ? (
                      <span className="text-xs text-fg-soft"> · variant {it.variantId.slice(0, 8)}</span>
                    ) : null}
                  </td>
                  <td>
                    {canEdit ? (
                      <UpdateQtyForm
                        itemId={it.id}
                        qty={it.quantity}
                        label={t('common.quantity')}
                        saveLabel={t('shoppingList.qty.save')}
                        error={sp.qtyError === it.id ? t('shoppingList.qty.invalid') : null}
                      />
                    ) : (
                      <span>{it.quantity}</span>
                    )}
                  </td>
                  <td>{it.note ?? ''}</td>
                  {canEdit ? (
                    <td>
                      <RemoveItemForm itemId={it.id} label={t('shoppingList.remove')} />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
          {abilities.convertListToCart || abilities.convertListToQuote ? (
            <div className="mt-6 mb-10 flex flex-wrap gap-2">
              {abilities.convertListToCart ? (
                <>
                  <button type="submit" form="sl-convert" formAction={convertAllToCartAction} className="btn btn--primary">
                    {t('shoppingList.convertAllCart')}
                  </button>
                  <button type="submit" form="sl-convert" className="btn btn--outline">
                    {t('shoppingList.convertSelectedCart')}
                  </button>
                </>
              ) : null}
              {abilities.convertListToQuote ? (
                <>
                  <button type="submit" form="sl-convert" formAction={convertAllToRfqAction} className="btn btn--outline">
                    {t('shoppingList.convertAllRfq')}
                  </button>
                  <button type="submit" form="sl-convert" formAction={convertSelectedToRfqAction} className="btn btn--outline">
                    {t('shoppingList.convertSelectedRfq')}
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        {canEdit ? (
          <div className="mb-10 flex flex-wrap gap-2 border-t border-line pt-6">
            <ClearListButton
              listId={list.id}
              clearAction={clearListAction}
              labels={{
                clear: t('shoppingList.clear'),
                confirmTitle: t('shoppingList.clear.confirmTitle'),
                confirmBody: t('shoppingList.clear.confirmBody'),
                cancel: t('shoppingList.clear.cancel'),
                clearing: t('shoppingList.clear.clearing'),
              }}
            />
          </div>
        ) : null}
        </>
      )}
    </>
  );
}

/**
 * Per-row quantity editor. The control lives inside a table cell but is wired
 * to the standalone `sl-qty-<itemId>` form (declared as a table sibling) via
 * the HTML `form` attribute, so it submits independently of the convert form.
 */
function UpdateQtyForm({
  itemId,
  qty,
  label,
  saveLabel,
  error,
}: {
  itemId: string;
  qty: number;
  /** The input's accessible name, in the page's language. */
  label: string;
  saveLabel: string;
  /** The refusal of this row's last edit, in the page's language; `null` = none. */
  error: string | null;
}): ReactNode {
  const formId = `sl-qty-${itemId}`;
  const errorId = `sl-qty-error-${itemId}`;
  return (
    <span className="inline-flex flex-col gap-1">
      <span style={{ display: 'inline-flex', gap: '0.25rem' }}>
        <input
          type="number"
          name="quantity"
          form={formId}
          min={1}
          max={LIST_QUANTITY_MAX}
          defaultValue={qty}
          aria-label={label}
          {...(error ? { 'aria-invalid': true, 'aria-describedby': errorId } : {})}
          className="rounded-md border border-line px-2 py-1 text-sm"
          style={{ width: '4rem' }}
        />
        <button type="submit" form={formId} className="btn btn--outline btn--sm">
          {saveLabel}
        </button>
      </span>
      {/* Mounted empty on every row so the polite live region exists before it carries text
          (WCAG 4.1.3), as on the cart line. */}
      <p id={errorId} role="status" className="m-0 text-[12px] font-semibold text-bad">
        {error ?? ''}
      </p>
    </span>
  );
}

/** Per-row remove button, wired to the standalone `sl-remove-<itemId>` form. */
function RemoveItemForm({ itemId, label }: { itemId: string; label: string }): ReactNode {
  return (
    <button type="submit" form={`sl-remove-${itemId}`} className="btn btn--outline btn--sm">
      {label}
    </button>
  );
}

async function renameAction(formData: FormData): Promise<void> {
  'use server';
  const session = await getSessionCookie();
  if (!session) return await localeRedirect('/login');
  const listId = (formData.get('listId') as string) ?? '';
  const name = ((formData.get('name') as string) ?? '').trim();
  try {
    await renameShoppingList(session, listId, name);
  } catch (err) {
    const message = err instanceof StorefrontApiError ? err.detail : 'Rename failed.';
    return await localeRedirect(`/shopping-lists/${listId}?error=${encodeURIComponent(message)}`);
  }
  return await localeRedirect(`/shopping-lists/${listId}`);
}

async function updateQtyAction(formData: FormData): Promise<void> {
  'use server';
  const session = await getSessionCookie();
  if (!session) return await localeRedirect('/login');
  const listId = (formData.get('listId') as string) ?? '';
  const itemId = (formData.get('itemId') as string) ?? '';
  const quantity = parseListQuantity(formData.get('quantity'));
  if (quantity === null) {
    return await localeRedirect(`/shopping-lists/${listId}?qtyError=${encodeURIComponent(itemId)}`);
  }
  try {
    await updateShoppingListItem(session, listId, itemId, { quantity });
  } catch (err) {
    const message = err instanceof StorefrontApiError ? err.detail : 'Update failed.';
    return await localeRedirect(`/shopping-lists/${listId}?error=${encodeURIComponent(message)}`);
  }
  return await localeRedirect(`/shopping-lists/${listId}`);
}

async function removeAction(formData: FormData): Promise<void> {
  'use server';
  const session = await getSessionCookie();
  if (!session) return await localeRedirect('/login');
  const listId = (formData.get('listId') as string) ?? '';
  const itemId = (formData.get('itemId') as string) ?? '';
  try {
    await removeShoppingListItem(session, listId, itemId);
  } catch (err) {
    const message = err instanceof StorefrontApiError ? err.detail : 'Remove failed.';
    return await localeRedirect(`/shopping-lists/${listId}?error=${encodeURIComponent(message)}`);
  }
  return await localeRedirect(`/shopping-lists/${listId}`);
}

async function clearListAction(formData: FormData): Promise<void> {
  'use server';
  const session = await getSessionCookie();
  if (!session) return await localeRedirect('/login');
  const listId = (formData.get('listId') as string) ?? '';
  try {
    await clearShoppingListItems(session, listId);
  } catch (err) {
    const message = err instanceof StorefrontApiError ? err.detail : 'Clear failed.';
    return await localeRedirect(`/shopping-lists/${listId}?error=${encodeURIComponent(message)}`);
  }
  return await localeRedirect(`/shopping-lists/${listId}`);
}

async function convertAllToCartAction(formData: FormData): Promise<void> {
  'use server';
  const session = await getSessionCookie();
  if (!session) return await localeRedirect('/login');
  const listId = (formData.get('listId') as string) ?? '';
  // The success redirect must live OUTSIDE the try: Next's `redirect()` signals
  // by throwing `NEXT_REDIRECT`, which a surrounding catch would swallow and
  // mis-report as "Convert failed." (the bug this fixes). Only the API call is
  // guarded; the redirect runs after, matching removeAction/clearListAction.
  let result: Awaited<ReturnType<typeof convertShoppingListToCart>>;
  try {
    result = await convertShoppingListToCart(session, listId);
  } catch (err) {
    const message = err instanceof StorefrontApiError ? err.detail : 'Convert failed.';
    return await localeRedirect(`/shopping-lists/${listId}?error=${encodeURIComponent(message)}`);
  }
  // Flush the cart route's Router Cache so the newly added lines show on the
  // next visit instead of a stale (empty) cached page.
  revalidatePath('/cart');
  return await localeRedirect(cartConversionRedirect(listId, result));
}

async function convertSelectedToCartAction(formData: FormData): Promise<void> {
  'use server';
  const session = await getSessionCookie();
  if (!session) return await localeRedirect('/login');
  const listId = (formData.get('listId') as string) ?? '';
  const itemIds = (formData.getAll('itemIds') as string[]).filter(Boolean);
  if (itemIds.length === 0) {
    return await localeRedirect(`/shopping-lists/${listId}?error=Select+at+least+one+item.`);
  }
  let result: Awaited<ReturnType<typeof convertShoppingListToCart>>;
  try {
    result = await convertShoppingListToCart(session, listId, itemIds);
  } catch (err) {
    const message = err instanceof StorefrontApiError ? err.detail : 'Convert failed.';
    return await localeRedirect(`/shopping-lists/${listId}?error=${encodeURIComponent(message)}`);
  }
  revalidatePath('/cart');
  return await localeRedirect(cartConversionRedirect(listId, result));
}

async function convertAllToRfqAction(formData: FormData): Promise<void> {
  'use server';
  const session = await getSessionCookie();
  if (!session) return await localeRedirect('/login');
  const listId = (formData.get('listId') as string) ?? '';
  let result: Awaited<ReturnType<typeof convertShoppingListToRfq>>;
  try {
    result = await convertShoppingListToRfq(session, listId);
  } catch (err) {
    const message = err instanceof StorefrontApiError ? err.detail : 'Convert failed.';
    return await localeRedirect(`/shopping-lists/${listId}?error=${encodeURIComponent(message)}`);
  }
  // Without this, Next's Router Cache keeps serving the previously cached
  // (often empty) quote-requests list, so the freshly created RFQ looks like
  // it was never created even though the API persisted it.
  revalidatePath('/quote-requests');
  return await localeRedirect(
    `/shopping-lists/${listId}?rfqId=${result.rfqId}&rfqAdded=${result.added}&rfqSkipped=${result.skipped.length}`,
  );
}

async function convertSelectedToRfqAction(formData: FormData): Promise<void> {
  'use server';
  const session = await getSessionCookie();
  if (!session) return await localeRedirect('/login');
  const listId = (formData.get('listId') as string) ?? '';
  const itemIds = (formData.getAll('itemIds') as string[]).filter(Boolean);
  if (itemIds.length === 0) {
    return await localeRedirect(`/shopping-lists/${listId}?error=Select+at+least+one+item.`);
  }
  let result: Awaited<ReturnType<typeof convertShoppingListToRfq>>;
  try {
    result = await convertShoppingListToRfq(session, listId, itemIds);
  } catch (err) {
    const message = err instanceof StorefrontApiError ? err.detail : 'Convert failed.';
    return await localeRedirect(`/shopping-lists/${listId}?error=${encodeURIComponent(message)}`);
  }
  revalidatePath('/quote-requests');
  return await localeRedirect(
    `/shopping-lists/${listId}?rfqId=${result.rfqId}&rfqAdded=${result.added}&rfqSkipped=${result.skipped.length}`,
  );
}

/**
 * Feature 155 (FR-011) — where a list → cart conversion lands: the counts, and the skipped
 * rows themselves so the page can name each with its reason and minimum.
 */
function cartConversionRedirect(
  listId: string,
  result: { added: number; skipped: ReadonlyArray<unknown> },
): string {
  const params = new URLSearchParams({
    cartAdded: String(result.added),
    cartSkipped: String(result.skipped.length),
  });
  if (result.skipped.length > 0) params.set('cartSkips', encodeConversionSkips(result.skipped));
  return `/shopping-lists/${listId}?${params.toString()}`;
}
