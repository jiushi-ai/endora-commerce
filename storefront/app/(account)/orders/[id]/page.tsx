import type { ReactNode } from 'react';
import {
  addOrderComment,
  cancelMyOrder,
  cloneOrderToQuote,
  confirmMyOrderReceipt,
  getMyOrder,
  listMyOrderShipments,
  listOrderComments,
  reorderOrder,
  type OrderComment,
  type OrderShipmentRow,
} from '../../../../lib/api/orders';
import { retryOrderPayment } from '../../../../lib/api/payments';
import { offersCancellation } from '../../../../lib/order-cancel';
import { offersPaymentRetry, paymentRetryDestination } from '../../../../lib/payment-retry';
import { getReturnable } from '../../../../lib/api/returns';
import { orderReturnAction, type OrderReturnAction } from '../../../../lib/returns/returnForm';
import { listMyOrderInvoices, invoiceDownloadUrl } from '../../../../lib/api/invoices';
import { getSessionCookie } from '../../../../lib/session';
import { getServerContext } from '../../../../lib/server-context';
import { StorefrontApiError } from '../../../../lib/api/client';
import { formatMoney } from '../../../../lib/i18n/money';
import { tForLocale } from '../../../../lib/i18n/messages';
import { resolvePaymentReturnNotice } from '../../../../lib/orders/payment-return-notice';
import { codeLabel } from '../../../../lib/account/labels';
import { orderStatusLabel } from '../../../../lib/orders/status-labels';
import { OrderItemRows } from '../../../../components/orders/OrderItemRows';
import { PurchaseTracker } from '../../../../components/analytics/EcommerceTrackers';
import { purchaseTrackingPayload } from '../../../../lib/analytics/purchase-eligibility';
import type { Metadata } from 'next';
import { localeRedirect } from '../../../../lib/i18n/navigation';
import { LocalizedLink } from '../../../../lib/i18n/localized-link';

/**
 * Not indexed (`specs/098-storefront-ssr-seo-a11y-suite/`, FR-010): an
 * authenticated or transactional surface, of no use to a crawler and not a
 * page a search result should ever land a buyer on.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Order confirmation page (T158). Renders the order the buyer just placed
 * (or any prior order they own). The page also surfaces the `nextAction`
 * the backend returned — for the bank-transfer driver this is
 * `awaiting_transfer` and the page tells the buyer what to do next.
 *
 * Batch 47 — chrome goes through `tForLocale` (was English hard-coded).
 * Batch 48 — status/payment cells share `lib/orders/status-labels`.
 */

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  /**
   * `error` is written by every server action on this page. It had been
   * written and never read — the page took no `searchParams` at all — so a
   * reorder or a comment that failed redirected the buyer back to a page that
   * said nothing. Issue #264 needed the same channel for a refused payment.
   *
   * Issue #274 then made this page where every payment gateway returns the
   * buyer, so it also reads why they are back (`payment`).
   *
   * Kept optional: Next.js always passes it to a page, but the fallback costs
   * nothing and the destructure cannot throw on a caller that does not.
   */
  searchParams?: Promise<{ payment?: string; error?: string }>;
}): Promise<ReactNode> {
  const session = await getSessionCookie();
  const { id } = await params;
  const { payment: paymentReturn, error: actionError } = (await searchParams) ?? {};
  if (!session) return await localeRedirect(`/login?next=/orders/${id}`);

  const { locale } = await getServerContext();
  const t = tForLocale(locale);

  let order;
  try {
    order = await getMyOrder(session, id);
  } catch (err) {
    if (err instanceof StorefrontApiError && err.status === 404) {
      return (
        <div className="b2b-auth">
          <h1>{t('order.detail.notFound.title')}</h1>
          <p className="b2b-auth__error">{t('order.detail.notFound.body')}</p>
        </div>
      );
    }
    throw err;
  }

  let comments: OrderComment[] = [];
  try {
    comments = await listOrderComments(session, id);
  } catch {
    comments = [];
  }

  const paymentNotice = resolvePaymentReturnNotice(paymentReturn, order.paymentStatus);
  /**
   * The GA4 `purchase` conversion for this order (issue #277).
   *
   * Issue #274 made this page where every gateway returns the buyer, and it
   * rendered no tracker — so from that change until this one, a PayU or
   * Autopay buyer completed a payment and was counted nowhere. The eligibility
   * rule is the one `/checkout/success` applies, reused rather than restated:
   * a gateway order counts once its payment is confirmed, an order settled out
   * of band counts at placement, and a refunded or failed one never counts.
   *
   * Not gated on `?payment=`, deliberately. That marker says a gateway sent
   * the buyer here, and a buyer who closed the tab mid-redirect and opened the
   * order from their list an hour later arrives without it — the conversion is
   * no less real. What stops this from counting the same order on every visit
   * is the platform's claim, which the tracker spends before it fires and
   * which was never opened for any order placed before this existed.
   */
  const purchase = purchaseTrackingPayload(order);
  // Terminal orders close commenting; a pending payment surfaces a Pay CTA.
  const isTerminal = order.status === 'completed' || order.status === 'cancelled';
  // Deliberately narrow, and it stays narrow after feature 085 widened the two
  // predicates below it: this is the "we are waiting for your money" hint, and
  // an order whose payment was declined gets the stronger retry hint instead —
  // `failed` is only ever written by the gateway settlement ingress, so such an
  // order is always a gateway order and `canRetryPayment` is always true for
  // it. Widening this would print both.
  const awaitingPayment = !isTerminal && order.paymentStatus === 'awaiting_payment';
  // Issue #264 — deliberately not gated on `isTerminal`. It was written when
  // the settlement ingress applied a `status_on_failure` seeded `cancelled`
  // everywhere, so a declined card left a terminal-looking order the buyer
  // still owed money on. Feature 085 holds such an order at `on_hold` instead,
  // which is not terminal — but the decision is unchanged, because the server
  // owns it and the storefront must not re-derive a lifecycle rule. See
  // `lib/payment-retry.ts`.
  const canRetryPayment = offersPaymentRetry(order);
  // Feature 085 (US3) — read, never derived. The rule needs the configured
  // status graph and the payment method's configured failure status, so the
  // platform decides it and sends the answer; see `lib/order-cancel.ts`.
  const canCancel = offersCancellation(order);
  // Batch 58 — confirm receipt when the shop has marked the order shipped.
  const canConfirmReceipt = order.status === 'shipment_sent';

  // Surface a return/complaint entry point directly on the order — a return when
  // any line is returnable, a complaint when none is (feature 155, FR-018/FR-021:
  // `eligible: false` with `no_returnable_lines` still takes a complaint), nothing
  // otherwise. Falls back to hidden on any error so the page never breaks.
  let returnAction: OrderReturnAction | null = null;
  try {
    returnAction = orderReturnAction(await getReturnable(session, id), order.id, locale);
  } catch {
    returnAction = null;
  }

  // Invoices attached to this order (feature 047). Hidden when none are ready.
  let invoices: Awaited<ReturnType<typeof listMyOrderInvoices>> = [];
  try {
    invoices = await listMyOrderInvoices(session, id);
  } catch {
    invoices = [];
  }

  // Batch 58 — shipment status + tracking for the buyer.
  let shipments: OrderShipmentRow[] = [];
  try {
    shipments = await listMyOrderShipments(session, id);
  } catch {
    shipments = [];
  }

  return (
    <div className="b2b-auth max-w-[720px]">
      {/* Feature 049 — GA4 purchase (no-op unless Enhanced Ecommerce is on). */}
      {purchase ? <PurchaseTracker order={purchase} orderId={order.id} /> : null}
      <h1>{t('order.detail.title')}</h1>
      <p className="b2b-auth__success">
        {(() => {
          const [before, after = ''] = t('order.detail.received').split('{id}');
          return (
            <>
              {before}
              <strong>{order.businessId}</strong>
              {after}
            </>
          );
        })()}
      </p>

      {actionError && actionError.trim().length > 0 ? (
        <p role="alert" className="b2b-auth__error">
          {actionError}
        </p>
      ) : null}

      {paymentNotice ? <p className="b2b-auth__hint">{t(paymentNotice)}</p> : null}

      {order.nextAction?.kind === 'awaiting_transfer' ? (
        <p>{t('order.detail.transferHint')}</p>
      ) : null}

      {canRetryPayment ? (
        <div className="mb-6">
          <p className="b2b-auth__hint">{t('order.payment.retry.hint')}</p>
          <form action={retryPaymentAction} className="mt-2 inline">
            <input type="hidden" name="id" value={order.id} />
            <button type="submit" className="btn btn--primary btn--sm">
              {t('order.payment.retry.cta')}
            </button>
          </form>
        </div>
      ) : null}

      {canCancel ? (
        <div className="mb-6">
          <p className="b2b-auth__hint">{t('order.cancel.hint')}</p>
          <form action={cancelOrderAction} className="mt-2 inline">
            <input type="hidden" name="id" value={order.id} />
            <button type="submit" className="btn btn--outline btn--sm">
              {t('order.cancel.cta')}
            </button>
          </form>
        </div>
      ) : null}

      {canConfirmReceipt ? (
        <div className="mb-6">
          <p className="b2b-auth__hint">{t('order.confirmReceipt.hint')}</p>
          <form action={confirmReceiptAction} className="mt-2 inline">
            <input type="hidden" name="id" value={order.id} />
            <button type="submit" className="btn btn--primary btn--sm">
              {t('order.confirmReceipt.cta')}
            </button>
          </form>
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        <form action={reorderAction} className="inline">
          <input type="hidden" name="id" value={order.id} />
          <button type="submit" className="btn btn--outline btn--sm">
            {t('order.detail.reorderCart')}
          </button>
        </form>
        <form action={reorderToQuoteAction} className="inline">
          <input type="hidden" name="id" value={order.id} />
          <button type="submit" className="btn btn--outline btn--sm">
            {t('order.detail.reorderQuote')}
          </button>
        </form>
        {returnAction ? (
          <LocalizedLink href={returnAction.href} className="btn btn--outline btn--sm">
            {returnAction.label}
          </LocalizedLink>
        ) : null}
        {(invoices ?? []).map((inv) => (
          <a
            key={inv.id}
            href={invoiceDownloadUrl(order.id, inv.id)}
            target="_blank"
            rel="noreferrer"
            className="btn btn--outline btn--sm"
          >
            {t('order.detail.downloadInvoice').replace('{number}', inv.number)}
          </a>
        ))}
        <LocalizedLink href="/orders" className="btn btn--ghost btn--sm">
          {t('order.detail.seeAll')}
        </LocalizedLink>
      </div>

      <h2 className="mt-10">{t('order.detail.statusHeading')}</h2>
      <table className="b2b-account__table">
        <tbody>
          <tr>
            <th scope="row">{t('order.detail.orderStatus')}</th>
            <td>{orderStatusLabel(order, locale, t)}</td>
          </tr>
          <tr>
            <th scope="row">{t('order.detail.paymentStatus')}</th>
            <td>{codeLabel(t, 'order.detail.paymentStatus', order.paymentStatus)}</td>
          </tr>
          <tr>
            <th scope="row">{t('order.detail.placed')}</th>
            <td>{new Date(order.placedAt).toLocaleString(locale)}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="mt-10">{t('order.detail.shipmentsHeading')}</h2>
      {shipments.length === 0 ? (
        <p className="b2b-auth__hint">{t('order.detail.shipmentsEmpty')}</p>
      ) : (
        <table className="b2b-account__table">
          <thead>
            <tr>
              <th>{t('order.detail.shipments.col.status')}</th>
              <th>{t('order.detail.shipments.col.tracking')}</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => (
              <tr key={s.id}>
                <td>{codeLabel(t, 'order.detail.shipments.status', s.status)}</td>
                <td className="font-mono text-sm">{s.externalReference ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="mt-10">{t('order.detail.itemsHeading')}</h2>
      <table className="b2b-account__table">
        <thead>
          <tr>
            <th>{t('order.detail.col.product')}</th>
            <th>{t('order.detail.col.qty')}</th>
            <th>{t('order.detail.col.unit')}</th>
            <th className="text-right">{t('order.detail.col.line')}</th>
          </tr>
        </thead>
        <tbody>
          <OrderItemRows order={order} locale={locale} />
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={3} className="text-right">
              {t('order.detail.subtotal')}
            </th>
            <td className="text-right">
              {formatMoney(order.subtotal, order.currency, locale)}
            </td>
          </tr>
          <tr>
            <th colSpan={3} className="text-right">
              {t('order.detail.tax')}
            </th>
            <td className="text-right">
              {formatMoney(order.taxTotal, order.currency, locale)}
            </td>
          </tr>
          {order.discountTotal > 0 ? (
            <tr>
              <th colSpan={3} className="text-right">
                {t('order.detail.discount')}
              </th>
              <td className="text-right">
                −{formatMoney(order.discountTotal, order.currency, locale)}
              </td>
            </tr>
          ) : null}
          <tr>
            <th colSpan={3} className="text-right">
              {t('order.detail.delivery')}
            </th>
            <td className="text-right">
              {formatMoney(order.deliveryTotal, order.currency, locale)}
            </td>
          </tr>
          <tr>
            <th colSpan={3} className="text-right">
              <strong>{t('order.detail.total')}</strong>
            </th>
            <td className="text-right">
              <strong>
                {formatMoney(order.total, order.currency, locale)}
              </strong>
            </td>
          </tr>
        </tfoot>
      </table>

      {awaitingPayment ? (
        <p className="b2b-auth__hint">
          {t('order.detail.awaitingPayment')}{' '}
          {order.nextAction?.kind === 'awaiting_transfer'
            ? t('order.detail.awaitingPaymentTransfer')
            : t('order.detail.awaitingPaymentComplete')}
        </p>
      ) : null}

      <h2 className="mt-10">{t('order.detail.commentsHeading')}</h2>
      {comments.length === 0 ? (
        <p className="b2b-auth__hint">{t('order.detail.commentsEmpty')}</p>
      ) : (
        <ul className="b2b-account__comments">
          {comments.map((c) => (
            <li key={c.id}>
              <small>{new Date(c.createdAt).toLocaleString(locale)}</small>
              <p>{c.body}</p>
            </li>
          ))}
        </ul>
      )}
      {isTerminal ? (
        <p className="b2b-auth__hint">{t('order.detail.commentsClosed')}</p>
      ) : (
        <form action={addCommentAction} className="mt-4">
          <input type="hidden" name="id" value={order.id} />
          <textarea
            name="body"
            required
            aria-label={t('order.detail.commentAria')}
            rows={4}
            placeholder={t('order.detail.commentPlaceholder')}
            className="w-full resize-y rounded-md border border-line bg-surface px-[12px] py-[10px] text-[14px] leading-[1.5] text-fg placeholder:text-muted focus:border-line-strong focus:outline-none"
          />
          <div className="mt-4">
            <button type="submit" className="btn btn--outline btn--sm">
              {t('order.detail.commentSubmit')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

async function addCommentAction(formData: FormData): Promise<void> {
  'use server';
  const session = await getSessionCookie();
  if (!session) return await localeRedirect('/login');
  const id = (formData.get('id') as string) ?? '';
  const body = ((formData.get('body') as string) ?? '').trim();
  const { locale } = await getServerContext();
  const t = tForLocale(locale);
  if (body) {
    try {
      await addOrderComment(session, id, body);
    } catch (err) {
      const message =
        err instanceof StorefrontApiError ? err.detail : t('order.detail.error.comment');
      return await localeRedirect(`/orders/${id}?error=${encodeURIComponent(message)}`);
    }
  }
  return await localeRedirect(`/orders/${id}`);
}

async function reorderAction(formData: FormData): Promise<void> {
  'use server';
  const session = await getSessionCookie();
  if (!session) return await localeRedirect('/login');
  const id = (formData.get('id') as string) ?? '';
  const { locale } = await getServerContext();
  const t = tForLocale(locale);
  let target = '/cart';
  try {
    const result = await reorderOrder(session, id);
    target = result.checkoutUrl || '/cart';
  } catch (err) {
    const message =
      err instanceof StorefrontApiError ? err.detail : t('order.detail.error.reorder');
    return await localeRedirect(`/orders/${id}?error=${encodeURIComponent(message)}`);
  }
  return await localeRedirect(target);
}

/**
 * Pay this order again (issue #264).
 *
 * The redirect target is computed inside the `try` and taken outside it:
 * `redirect()` works by throwing, so calling it in the `try` would be caught by
 * the very handler meant for API failures.
 */
async function retryPaymentAction(formData: FormData): Promise<void> {
  'use server';
  const session = await getSessionCookie();
  if (!session) return await localeRedirect('/login');
  const id = (formData.get('id') as string) ?? '';
  const { locale } = await getServerContext();
  const t = tForLocale(locale);

  let target: string;
  try {
    const result = await retryOrderPayment(session, id);
    target =
      paymentRetryDestination(result) ??
      `/orders/${id}?error=${encodeURIComponent(
        result.opened ? t('order.payment.retry.failed') : t('order.payment.retry.inProgress'),
      )}`;
  } catch (err) {
    const message =
      err instanceof StorefrontApiError ? err.detail : t('order.payment.retry.failed');
    target = `/orders/${id}?error=${encodeURIComponent(message)}`;
  }
  return await localeRedirect(target);
}

/**
 * Cancel this order (feature 085, US3).
 *
 * The buyer **cancels** — the owner's ruling is that there is no approval step
 * and no pending state — so this is one call and a reload of the same page,
 * which then shows the order cancelled and no longer offers the control. A
 * refusal comes back through the page's own `?error=` channel; the server owns
 * the sentence, because the server owns the rule.
 */
async function cancelOrderAction(formData: FormData): Promise<void> {
  'use server';
  const session = await getSessionCookie();
  if (!session) return await localeRedirect('/login');
  const id = (formData.get('id') as string) ?? '';
  const { locale } = await getServerContext();
  const t = tForLocale(locale);
  try {
    await cancelMyOrder(session, id);
  } catch (err) {
    const message = err instanceof StorefrontApiError ? err.detail : t('order.cancel.failed');
    return await localeRedirect(`/orders/${id}?error=${encodeURIComponent(message)}`);
  }
  return await localeRedirect(`/orders/${id}`);
}

/** Batch 58 — confirm receipt (`shipment_sent` → `completed`). */
async function confirmReceiptAction(formData: FormData): Promise<void> {
  'use server';
  const session = await getSessionCookie();
  if (!session) return await localeRedirect('/login');
  const id = (formData.get('id') as string) ?? '';
  const { locale } = await getServerContext();
  const t = tForLocale(locale);
  try {
    await confirmMyOrderReceipt(session, id);
  } catch (err) {
    const message =
      err instanceof StorefrontApiError ? err.detail : t('order.confirmReceipt.failed');
    return await localeRedirect(`/orders/${id}?error=${encodeURIComponent(message)}`);
  }
  return await localeRedirect(`/orders/${id}`);
}


async function reorderToQuoteAction(formData: FormData): Promise<void> {
  'use server';
  const session = await getSessionCookie();
  if (!session) return await localeRedirect('/login');
  const id = (formData.get('id') as string) ?? '';
  const { locale, ctx } = await getServerContext();
  const t = tForLocale(locale);
  try {
    await cloneOrderToQuote(session, id, ctx);
  } catch (err) {
    const message =
      err instanceof StorefrontApiError ? err.detail : t('order.detail.error.cloneToQuote');
    return await localeRedirect(`/orders/${id}?error=${encodeURIComponent(message)}`);
  }
  return await localeRedirect('/quote-requests');
}
