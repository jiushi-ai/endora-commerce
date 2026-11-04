import { describe, expect, it, vi } from 'vitest';
import { ERROR_CODES } from '@endora-commerce/contracts';
import { HttpError } from '@endora-commerce/platform/http';
import {
  BiddingReceiptService,
  expectedDepositAmount,
  type BiddingConvertDeps,
} from './receipt-service.js';

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

function convertFakeEm(opts: {
  receipt: Record<string, unknown>;
  alloc?: Record<string, unknown> | null;
  campaign?: Record<string, unknown> | null;
  rule?: Record<string, unknown> | null;
}) {
  return {
    factory: () =>
      ({
        findOne: async (entity: { name?: string }, where: Record<string, unknown>) => {
          const name = entity?.name ?? String(entity);
          if (name.includes('Allocation')) {
            if (opts.alloc === null) return null;
            if (opts.alloc && where.receiptId === opts.receipt.id) return opts.alloc;
            return opts.alloc ?? null;
          }
          if (name.includes('Campaign') && !name.includes('Rule')) {
            return opts.campaign ?? null;
          }
          if (name.includes('Rule')) {
            return opts.rule ?? null;
          }
          if (name.includes('Receipt') || name.includes('BidReceipt')) {
            return where.id === opts.receipt.id ? opts.receipt : null;
          }
          return null;
        },
        create: (_e: unknown, data: unknown) => data,
        persist: () => undefined,
        flush: async () => undefined,
        find: async () => [],
      }) as never,
  };
}

function stubConvertDeps(overrides?: Partial<BiddingConvertDeps>): BiddingConvertDeps {
  return {
    carts: {
      replaceItemsForCustomer: vi.fn(async () => ({ cart: { id: 'cart1' }, items: [] })),
    } as unknown as BiddingConvertDeps['carts'],
    orderPlacement: {
      placeOrder: vi.fn(async () => ({ id: 'order-1', businessId: 'ORD-1' })),
    } as unknown as BiddingConvertDeps['orderPlacement'],
    catalogProducts: {
      findById: vi.fn(async (id: string) => ({ id, type: 'simple' })),
    } as unknown as BiddingConvertDeps['catalogProducts'],
    customerAccounts: {
      listByOrganization: vi.fn(async () => [{ id: 'cust-1' }]),
      findInOrganization: vi.fn(async (id: string) => ({ id })),
    } as unknown as BiddingConvertDeps['customerAccounts'],
    defaultPreferences: {
      resolveForCustomer: vi.fn(async () => ({
        paymentMethodId: 'pay-1',
        deliveryMethodId: 'del-1',
        billingAddressId: 'bill-1',
        shippingAddressId: 'ship-1',
        source: {
          payment: 'customer',
          delivery: 'customer',
          billing: 'customer',
          shipping: 'customer',
        },
      })),
    } as unknown as BiddingConvertDeps['defaultPreferences'],
    ...overrides,
  };
}

describe('expectedDepositAmount (T20)', () => {
  it('uses fixed depositAmount when set', () => {
    expect(expectedDepositAmount({ depositAmount: '50.5', depositPercent: 10 }, '100', 2)).toBe(
      '50.50',
    );
  });

  it('computes percent of bid total', () => {
    expect(expectedDepositAmount({ depositPercent: 20, depositAmount: null }, '100.00', 3)).toBe(
      '60.00',
    );
  });

  it('returns null when no deposit configured', () => {
    expect(expectedDepositAmount({ depositPercent: null, depositAmount: null }, '100', 1)).toBeNull();
  });
});

describe('BiddingReceiptService.confirmDeposit amount check (T20)', () => {
  it('refuses when received amount mismatches expected', async () => {
    const receipt = {
      id: 'rcpt-d',
      campaignId: 'camp-1',
      organizationId: 'org-1',
      ruleVersionId: 'rule-1',
      status: 'await_deposit',
      bidUnitPrice: '100.00',
      bidQty: 2,
      attachmentAssetIds: ['a1'],
      tradeId: null,
      orderId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const em = convertFakeEm({
      receipt,
      rule: { id: 'rule-1', currency: 'PLN', depositPercent: 10, depositAmount: null },
    });
    const service = new BiddingReceiptService(em.factory);
    await expect(
      service.confirmDeposit('rcpt-d', 'admin-1', { amountReceived: '5.00' }),
    ).rejects.toMatchObject({
      code: ERROR_CODES.BIDDING_DEPOSIT_AMOUNT_MISMATCH,
    });
  });
});

describe('BiddingReceiptService.convertToOrder (T17′)', () => {
  const baseReceipt = {
    id: 'rcpt-1',
    campaignId: 'camp-1',
    organizationId: 'org-1',
    ruleVersionId: 'rule-1',
    status: 'won_pending_fulfilment',
    bidUnitPrice: '120.00',
    bidQty: 2,
    attachmentAssetIds: ['a1'],
    tradeId: 'TRD-ABC',
    orderId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('places a real order and writes orderId', async () => {
    const em = convertFakeEm({
      receipt: { ...baseReceipt },
      alloc: { outcome: 'won', allocatedQty: 2 },
      campaign: {
        id: 'camp-1',
        productVariantId: 'prod-1',
        salesChannelId: 'ch-1',
      },
      rule: { id: 'rule-1', currency: 'PLN' },
    });
    const deps = stubConvertDeps();
    const service = new BiddingReceiptService(em.factory, undefined, deps);
    const result = await service.convertToOrder('rcpt-1', 'admin-1', {});
    expect(result.orderId).toBe('order-1');
    expect(result.status).toBe('converted');
    expect(deps.carts.replaceItemsForCustomer).toHaveBeenCalled();
    expect(deps.orderPlacement.placeOrder).toHaveBeenCalled();
  });

  it('refuses when allocation is not won', async () => {
    const em = convertFakeEm({
      receipt: { ...baseReceipt },
      alloc: { outcome: 'lost', allocatedQty: 0 },
      campaign: { id: 'camp-1', productVariantId: 'prod-1', salesChannelId: 'ch-1' },
      rule: { id: 'rule-1', currency: 'PLN' },
    });
    const service = new BiddingReceiptService(em.factory, undefined, stubConvertDeps());
    await expect(service.convertToOrder('rcpt-1', 'admin-1')).rejects.toMatchObject({
      code: ERROR_CODES.BIDDING_INVALID_TRANSITION,
    });
  });

  it('refuses when deposit is not confirmed', async () => {
    const em = convertFakeEm({
      receipt: { ...baseReceipt, status: 'sales_review' },
      alloc: { outcome: 'won', allocatedQty: 2 },
    });
    const service = new BiddingReceiptService(em.factory, undefined, stubConvertDeps());
    await expect(service.convertToOrder('rcpt-1', 'admin-1')).rejects.toMatchObject({
      code: ERROR_CODES.BIDDING_DEPOSIT_REQUIRED,
    });
  });

  it('refuses when buyer defaults are missing', async () => {
    const em = convertFakeEm({
      receipt: { ...baseReceipt },
      alloc: { outcome: 'won', allocatedQty: 2 },
      campaign: { id: 'camp-1', productVariantId: 'prod-1', salesChannelId: 'ch-1' },
      rule: { id: 'rule-1', currency: 'PLN' },
    });
    const deps = stubConvertDeps({
      defaultPreferences: {
        resolveForCustomer: vi.fn(async () => ({
          paymentMethodId: null,
          deliveryMethodId: null,
          billingAddressId: null,
          shippingAddressId: null,
          source: {
            payment: 'none',
            delivery: 'none',
            billing: 'none',
            shipping: 'none',
          },
        })),
      } as unknown as BiddingConvertDeps['defaultPreferences'],
    });
    const service = new BiddingReceiptService(em.factory, undefined, deps);
    await expect(service.convertToOrder('rcpt-1', 'admin-1')).rejects.toMatchObject({
      statusCode: 422,
      code: ERROR_CODES.VALIDATION_FAILED,
    });
  });
});
