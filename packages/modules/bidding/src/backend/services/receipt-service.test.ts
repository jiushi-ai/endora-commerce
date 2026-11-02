import { describe, expect, it } from 'vitest';
import { ERROR_CODES } from '@endora-commerce/contracts';
import { HttpError } from '@endora-commerce/platform/http';
import { BiddingReceiptService } from './receipt-service.js';

/**
 * Audience + attachment + window gates for submit (Batch D / T12).
 * Fake EM focused on the eligibility decisions.
 */

function fakeEm(opts: {
  campaign: Record<string, unknown> | null;
  rule?: Record<string, unknown> | null;
  existingReceipt?: Record<string, unknown> | null;
}) {
  const created: unknown[] = [];
  return {
    created,
    factory: () =>
      ({
        findOne: async (entity: { name?: string }, where: Record<string, unknown>) => {
          const name = entity?.name ?? String(entity);
          if (name.includes('Campaign') && !name.includes('Rule')) {
            return opts.campaign && where.id === opts.campaign.id ? opts.campaign : null;
          }
          if (name.includes('Rule')) {
            return opts.rule ?? null;
          }
          if (name.includes('Receipt') || name.includes('BidReceipt')) {
            if (where.id) return null;
            return opts.existingReceipt ?? null;
          }
          return null;
        },
        create: (_e: unknown, data: unknown) => data,
        persist: (row: unknown) => {
          created.push(row);
        },
        flush: async () => undefined,
        find: async () => [],
      }) as never,
  };
}

describe('BiddingReceiptService.submit gates', () => {
  it('refuses when attachment list is empty', async () => {
    const em = fakeEm({ campaign: null });
    const service = new BiddingReceiptService(em.factory);
    await expect(
      service.submit('c1', 'o1', {
        bidUnitPrice: '100.00',
        bidQty: 1,
        attachmentAssetIds: [],
      }),
    ).rejects.toMatchObject({
      statusCode: 422,
      code: ERROR_CODES.BIDDING_ATTACHMENT_REQUIRED,
    });
  });

  it('refuses when organization is outside audience (G-C1)', async () => {
    const now = Date.now();
    const em = fakeEm({
      campaign: {
        id: 'c1',
        status: 'published',
        opensAt: new Date(now - 60_000),
        closesAt: new Date(now + 60_000),
        audience: { organizationIds: ['other-org'], customerGroupIds: [] },
        currentRuleVersionId: 'r1',
      },
      rule: {
        id: 'r1',
        minUnitPrice: '10',
        maxQtyPerOrg: 10,
        minQty: 1,
      },
    });
    const service = new BiddingReceiptService(em.factory);
    try {
      await service.submit('c1', 'o1', {
        bidUnitPrice: '100.00',
        bidQty: 1,
        attachmentAssetIds: ['a1'],
      });
      expect.fail('expected throw');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
      expect((err as HttpError).code).toBe(ERROR_CODES.BIDDING_NOT_ELIGIBLE);
    }
  });

  it('refuses when campaign is past deadline (G-C4)', async () => {
    const now = Date.now();
    const em = fakeEm({
      campaign: {
        id: 'c1',
        status: 'published',
        opensAt: new Date(now - 120_000),
        closesAt: new Date(now - 60_000),
        audience: { organizationIds: [], customerGroupIds: [] },
        currentRuleVersionId: 'r1',
      },
      rule: { id: 'r1', minUnitPrice: '10', maxQtyPerOrg: 10, minQty: 1 },
    });
    const service = new BiddingReceiptService(em.factory);
    try {
      await service.submit('c1', 'o1', {
        bidUnitPrice: '100.00',
        bidQty: 1,
        attachmentAssetIds: ['a1'],
      });
      expect.fail('expected throw');
    } catch (err) {
      expect((err as HttpError).code).toBe(ERROR_CODES.BIDDING_CLOSED);
    }
  });
});
