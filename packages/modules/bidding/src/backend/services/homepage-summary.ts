import type { BiddingHomepageSummary } from '@endora-commerce/contracts';
import type { EntityManager } from '@mikro-orm/postgresql';
import { withSystemScope } from '@endora-commerce/platform/tenancy';
import { BidReceipt } from '../entities/bid-receipt.entity.js';
import { BiddingCampaign } from '../entities/bidding-campaign.entity.js';

/** Hours between opens and closes (rounded; at least 1 when the span is positive). */
export function campaignWindowHours(opensAt: Date, closesAt: Date): number {
  const ms = closesAt.getTime() - opensAt.getTime();
  if (ms <= 0) return 0;
  return Math.max(1, Math.round(ms / 3_600_000));
}

/**
 * Pure aggregate for the anonymous homepage strip + featured card.
 * Fulfilled = receipts that reached `converted` (actual trade closed).
 * Participating orgs = distinct organizations that submitted any receipt.
 */
export function buildHomepageSummary(input: {
  published: Array<{
    id: string;
    code: string;
    title: string;
    qty: number;
    opensAt: Date;
    closesAt: Date;
  }>;
  receipts: Array<{ organizationId: string; status: string }>;
}): BiddingHomepageSummary {
  const featuredRow = input.published[0] ?? null;
  const featured = featuredRow
    ? {
        id: featuredRow.id,
        code: featuredRow.code,
        title: featuredRow.title,
        qty: featuredRow.qty,
        opensAt: featuredRow.opensAt.toISOString(),
        closesAt: featuredRow.closesAt.toISOString(),
      }
    : null;
  return {
    openCampaignCount: input.published.length,
    participatingOrgCount: new Set(input.receipts.map((r) => r.organizationId)).size,
    fulfilledDealCount: input.receipts.filter((r) => r.status === 'converted').length,
    windowHours: featuredRow
      ? campaignWindowHours(featuredRow.opensAt, featuredRow.closesAt)
      : null,
    featured,
  };
}

/**
 * Load published campaigns + cross-org receipt aggregates for the storefront home.
 * Receipts sit behind `@OrgScoped`, so the count path uses `withSystemScope`.
 */
export async function loadHomepageSummary(em: EntityManager): Promise<BiddingHomepageSummary> {
  const published = await em.find(
    BiddingCampaign,
    { status: 'published' },
    { orderBy: { opensAt: 'DESC' } },
  );
  const receipts = await withSystemScope('bidding: homepage aggregate stats', async () =>
    em.find(BidReceipt, {}),
  );
  return buildHomepageSummary({
    published: published.map((c) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      qty: c.qty,
      opensAt: c.opensAt,
      closesAt: c.closesAt,
    })),
    receipts: receipts.map((r) => ({
      organizationId: r.organizationId,
      status: r.status,
    })),
  });
}
