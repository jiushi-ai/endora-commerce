import type { SalesChannelDetail } from '@endora-commerce/contracts';

/**
 * Languages offered by `GET /api/v1/admin/sales-channels/:code`.
 * That route returns the channel detail object itself — not `{ data: … }`.
 */
export function languagesFromChannelDetail(
  detail: SalesChannelDetail | null | undefined,
): string[] {
  return detail?.languages ?? [];
}
