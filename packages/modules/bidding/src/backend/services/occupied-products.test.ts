import { describe, expect, it, vi } from 'vitest';
import { ERROR_CODES } from '@endora-commerce/contracts';
import { HttpError } from '@endora-commerce/platform/http';
import {
  assertRegularPurchaseAllowed,
  listPublishedOccupiedProductIds,
} from './occupied-products.js';

describe('listPublishedOccupiedProductIds', () => {
  it('dedupes product ids from published campaigns', async () => {
    const em = {
      find: vi.fn(async () => [
        { productVariantId: 'prod-a' },
        { productVariantId: 'prod-a' },
        { productVariantId: 'prod-b' },
      ]),
    };
    await expect(listPublishedOccupiedProductIds(em as never)).resolves.toEqual([
      'prod-a',
      'prod-b',
    ]);
  });
});

describe('assertRegularPurchaseAllowed', () => {
  it('allows when no published campaign binds the product', async () => {
    const em = { findOne: vi.fn(async () => null) };
    await expect(assertRegularPurchaseAllowed(em as never, 'prod-1')).resolves.toBeUndefined();
  });

  it('refuses with CART_PRODUCT_IN_BIDDING when published', async () => {
    const em = { findOne: vi.fn(async () => ({ id: 'camp-1' })) };
    try {
      await assertRegularPurchaseAllowed(em as never, 'prod-1');
      expect.fail('expected throw');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
      expect((err as HttpError).code).toBe(ERROR_CODES.CART_PRODUCT_IN_BIDDING);
    }
  });
});
