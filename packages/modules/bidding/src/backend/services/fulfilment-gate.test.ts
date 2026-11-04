import { describe, expect, it } from 'vitest';
import { ERROR_CODES } from '@endora-commerce/contracts';
import { assertBiddingReceiptShipReady } from './fulfilment-gate.js';

describe('assertBiddingReceiptShipReady (T22)', () => {
  const ready = {
    status: 'converted',
    tradeId: 'TRD-1',
    attachmentAssetIds: ['asset-1'],
  };

  it('allows a converted receipt with tradeId and attachment', () => {
    expect(() => assertBiddingReceiptShipReady(ready)).not.toThrow();
  });

  it('refuses without tradeId (G-M4 / G-S1)', () => {
    expect(() =>
      assertBiddingReceiptShipReady({ ...ready, tradeId: null }),
    ).toThrow(
      expect.objectContaining({ code: ERROR_CODES.BIDDING_SHIP_CHECKLIST_FAILED }),
    );
  });

  it('refuses without intent attachment', () => {
    expect(() =>
      assertBiddingReceiptShipReady({ ...ready, attachmentAssetIds: [] }),
    ).toThrow(
      expect.objectContaining({ code: ERROR_CODES.BIDDING_SHIP_CHECKLIST_FAILED }),
    );
  });

  it('refuses incomplete status', () => {
    expect(() =>
      assertBiddingReceiptShipReady({ ...ready, status: 'await_deposit' }),
    ).toThrow(
      expect.objectContaining({ code: ERROR_CODES.BIDDING_SHIP_CHECKLIST_FAILED }),
    );
  });
});
