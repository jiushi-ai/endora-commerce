import { ERROR_CODES } from '@endora-commerce/contracts';
import { HttpError } from '@endora-commerce/platform/http';

/**
 * Pure checklist for a bidding-linked order (G-S1 / T22).
 * Callers look up the receipt by `orderId`; non-bidding orders skip this.
 */
export function assertBiddingReceiptShipReady(receipt: {
  status: string;
  tradeId?: string | null;
  attachmentAssetIds?: string[] | null;
}): void {
  if (receipt.status !== 'converted' && receipt.status !== 'won_pending_fulfilment') {
    throw new HttpError(
      409,
      ERROR_CODES.BIDDING_SHIP_CHECKLIST_FAILED,
      'Bidding fulfilment checklist incomplete for this order.',
    );
  }
  if (!receipt.tradeId) {
    throw new HttpError(
      409,
      ERROR_CODES.BIDDING_SHIP_CHECKLIST_FAILED,
      'Bidding trade id missing on receipt.',
    );
  }
  if (!(receipt.attachmentAssetIds ?? []).length) {
    throw new HttpError(
      409,
      ERROR_CODES.BIDDING_SHIP_CHECKLIST_FAILED,
      'Intent attachment missing on bidding receipt.',
    );
  }
}
