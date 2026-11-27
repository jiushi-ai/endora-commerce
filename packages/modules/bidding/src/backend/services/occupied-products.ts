import { ERROR_CODES } from '@endora-commerce/contracts';
import { HttpError } from '@endora-commerce/platform/http';
import type { EntityManager } from '@mikro-orm/postgresql';
import { BiddingCampaign } from '../entities/bidding-campaign.entity.js';

/**
 * Product ids bound to a `published` scarce-stock campaign.
 * `BiddingCampaign.productVariantId` stores a simple product id (admin picker).
 */
export async function listPublishedOccupiedProductIds(em: EntityManager): Promise<string[]> {
  const rows = await em.find(
    BiddingCampaign,
    { status: 'published' },
    { fields: ['productVariantId'] },
  );
  return [...new Set(rows.map((r) => r.productVariantId))];
}

/** Refuse regular cart add when the product is occupied by a published campaign. */
export async function assertRegularPurchaseAllowed(
  em: EntityManager,
  productId: string,
): Promise<void> {
  const hit = await em.findOne(
    BiddingCampaign,
    { status: 'published', productVariantId: productId },
    { fields: ['id'] },
  );
  if (!hit) return;
  throw new HttpError(
    400,
    ERROR_CODES.CART_PRODUCT_IN_BIDDING,
    'This product is only available through bidding and cannot be added to the cart.',
    { productId },
  );
}
