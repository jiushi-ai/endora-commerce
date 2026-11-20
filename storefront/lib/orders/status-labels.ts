import type { MessageKey } from '../i18n/messages';
import { codeLabel } from '../account/labels';

/**
 * Order fulfilment status display (batch 48 / 85 pick).
 *
 * - **Payment / other API enums** → use `codeLabel` directly at the call site
 *   (open-source pattern; do not add per-enum wrappers).
 * - **Fulfilment status** → API `statusName` first (short-code locale fallback),
 *   then `codeLabel(t, 'order.status', code)`, then defaultName/code.
 */

type Translate = (key: MessageKey) => string;

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

/**
 * Fulfilment status for the page locale: API `statusName` first, then catalogue
 * `order.status.<code>` via `codeLabel`, then defaultName/code.
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
  const fromCatalogue = codeLabel(t, 'order.status', order.status);
  if (fromCatalogue !== order.status) return fromCatalogue;
  return order.statusDefaultName ?? order.status;
}
