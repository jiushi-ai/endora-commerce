import type { MessageKey } from '../i18n/messages';

/**
 * Storefront labels for order / payment status codes (batch 48).
 *
 * Payment statuses are a fixed API enum — the catalogue owns the words, same
 * shape as upstream `codeLabel(t, 'account.paymentStatus', code)`.
 *
 * Fulfilment statuses carry per-language names from the order-status graph
 * (`statusName`). Those keys are short (`en` / `pl`), while the page locale is
 * often `en-US` / `pl-PL` / `zh-CN`, so lookup tries the full locale then the
 * primary subtag before falling back to catalogue / defaultName.
 */

type Translate = (key: MessageKey) => string;

const PAYMENT_STATUS_KEYS = {
  awaiting_payment: 'order.detail.paymentStatus.awaiting_payment',
  paid: 'order.detail.paymentStatus.paid',
  failed: 'order.detail.paymentStatus.failed',
  deferred: 'order.detail.paymentStatus.deferred',
  refunded: 'order.detail.paymentStatus.refunded',
} as const satisfies Record<string, MessageKey>;

/** Default graph status codes that have `order.status.*` catalogue entries. */
const ORDER_STATUS_KEYS = {
  new: 'order.status.new',
  pending: 'order.status.pending',
  paid: 'order.status.paid',
  processing: 'order.status.processing',
  shipment_ready: 'order.status.shipment_ready',
  shipment_sent: 'order.status.shipment_sent',
  completed: 'order.status.completed',
  on_hold: 'order.status.on_hold',
  cancelled: 'order.status.cancelled',
} as const satisfies Record<string, MessageKey>;

/** Human label for an order `paymentStatus` code, or the raw code if unknown. */
export function paymentStatusLabel(paymentStatus: string, t: Translate): string {
  const key = PAYMENT_STATUS_KEYS[paymentStatus as keyof typeof PAYMENT_STATUS_KEYS];
  return key ? t(key) : paymentStatus;
}

function statusNameForLocale(
  statusName: Record<string, string> | undefined,
  locale: string,
): string | undefined {
  if (!statusName) return undefined;
  if (statusName[locale]) return statusName[locale];
  const primary = locale.split('-')[0];
  if (primary && statusName[primary]) return statusName[primary];
  const lower = locale.toLowerCase();
  const primaryLower = primary?.toLowerCase();
  for (const [key, value] of Object.entries(statusName)) {
    const k = key.toLowerCase();
    if (k === lower || (primaryLower && k === primaryLower)) return value;
  }
  return undefined;
}

function catalogueStatusKey(statusCode: string): MessageKey | null {
  return ORDER_STATUS_KEYS[statusCode as keyof typeof ORDER_STATUS_KEYS] ?? null;
}

/**
 * Fulfilment status for the page locale: API `statusName` first (with short-code
 * fallback), then storefront catalogue `order.status.<code>`, then defaultName/code.
 */
export function orderStatusLabel(
  order: {
    status: string;
    statusName?: Record<string, string>;
    statusDefaultName?: string;
  },
  locale: string,
  t: Translate,
): string {
  const fromApi = statusNameForLocale(order.statusName, locale);
  if (fromApi) return fromApi;
  const key = catalogueStatusKey(order.status);
  if (key) return t(key);
  return order.statusDefaultName ?? order.status;
}
