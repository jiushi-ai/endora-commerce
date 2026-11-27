import { describe, expect, it } from 'vitest';
import { buildHomepageSummary, campaignWindowHours } from './homepage-summary.js';

describe('campaignWindowHours', () => {
  it('rounds a 48h span to 48', () => {
    const opens = new Date('2026-01-01T00:00:00.000Z');
    const closes = new Date('2026-01-03T00:00:00.000Z');
    expect(campaignWindowHours(opens, closes)).toBe(48);
  });

  it('returns 0 when closes is not after opens', () => {
    const t = new Date('2026-01-01T00:00:00.000Z');
    expect(campaignWindowHours(t, t)).toBe(0);
  });
});

describe('buildHomepageSummary', () => {
  const opens = new Date('2026-06-01T00:00:00.000Z');
  const closes = new Date('2026-06-03T00:00:00.000Z');

  it('aggregates open count, distinct orgs, converted deals, and featured window', () => {
    const summary = buildHomepageSummary({
      published: [
        {
          id: 'c-new',
          code: 'LOT-2',
          title: 'Newer lot',
          qty: 50,
          opensAt: opens,
          closesAt: closes,
          productVariantId: 'prod-a',
        },
        {
          id: 'c-old',
          code: 'LOT-1',
          title: 'Older lot',
          qty: 10,
          opensAt: new Date('2026-05-01T00:00:00.000Z'),
          closesAt: new Date('2026-05-02T00:00:00.000Z'),
          productVariantId: 'prod-a',
        },
      ],
      receipts: [
        { organizationId: 'org-a', status: 'submitted' },
        { organizationId: 'org-a', status: 'converted' },
        { organizationId: 'org-b', status: 'rejected' },
        { organizationId: 'org-c', status: 'converted' },
      ],
    });

    expect(summary.openCampaignCount).toBe(2);
    expect(summary.participatingOrgCount).toBe(3);
    expect(summary.fulfilledDealCount).toBe(2);
    expect(summary.windowHours).toBe(48);
    expect(summary.occupiedProductIds).toEqual(['prod-a']);
    expect(summary.featured).toEqual({
      id: 'c-new',
      code: 'LOT-2',
      title: 'Newer lot',
      qty: 50,
      opensAt: opens.toISOString(),
      closesAt: closes.toISOString(),
    });
  });

  it('returns null featured and window when no published campaigns', () => {
    const summary = buildHomepageSummary({
      published: [],
      receipts: [{ organizationId: 'org-a', status: 'converted' }],
    });
    expect(summary.openCampaignCount).toBe(0);
    expect(summary.fulfilledDealCount).toBe(1);
    expect(summary.featured).toBeNull();
    expect(summary.windowHours).toBeNull();
    expect(summary.occupiedProductIds).toEqual([]);
  });
});
