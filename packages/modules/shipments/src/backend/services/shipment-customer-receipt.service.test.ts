import { describe, expect, it } from 'vitest';
import type { EntityManager } from '@mikro-orm/postgresql';
import { ShipmentCustomerReceiptService } from './shipment-customer-receipt.service.js';

/**
 * Unit stub for the ORM find/flush path used by markReceivedForOrder.
 */
function emWithRows(
  rows: Array<{
    status: string;
    customerConfirmedAt: Date | null;
    attemptNo: number;
  }>,
) {
  const found = rows.slice().sort((a, b) => b.attemptNo - a.attemptNo).slice(0, 1);
  let flushed = false;
  const em = {
    find: async () => found,
    flush: async () => {
      flushed = true;
    },
  };
  return {
    emFactory: (() => em) as unknown as () => EntityManager,
    found,
    wasFlushed: () => flushed,
  };
}

describe('ShipmentCustomerReceiptService (batch 61)', () => {
  it('marks the latest success attempt as received and stamps confirmedAt', async () => {
    const confirmedAt = new Date('2026-11-23T08:00:00.000Z');
    const { emFactory, found, wasFlushed } = emWithRows([
      { status: 'success', customerConfirmedAt: null, attemptNo: 1 },
      { status: 'success', customerConfirmedAt: null, attemptNo: 2 },
    ]);
    // Stub returns already-sorted latest only (limit 1).
    found.length = 0;
    found.push({ status: 'success', customerConfirmedAt: null, attemptNo: 2 });

    const svc = new ShipmentCustomerReceiptService(emFactory);
    await svc.markReceivedForOrder('order-1', confirmedAt);

    expect(found[0]!.status).toBe('received');
    expect(found[0]!.customerConfirmedAt).toEqual(confirmedAt);
    expect(wasFlushed()).toBe(true);
  });

  it('is a no-op when already received with a confirmation time', async () => {
    const existing = new Date('2026-11-22T12:00:00.000Z');
    const { emFactory, found, wasFlushed } = emWithRows([
      { status: 'received', customerConfirmedAt: existing, attemptNo: 1 },
    ]);
    const svc = new ShipmentCustomerReceiptService(emFactory);
    await svc.markReceivedForOrder('order-1', new Date('2026-11-23T08:00:00.000Z'));

    expect(found[0]!.customerConfirmedAt).toEqual(existing);
    expect(wasFlushed()).toBe(false);
  });

  it('does nothing when there is no success/received attempt', async () => {
    const { emFactory, wasFlushed } = emWithRows([]);
    const svc = new ShipmentCustomerReceiptService(emFactory);
    await svc.markReceivedForOrder('order-1', new Date());
    expect(wasFlushed()).toBe(false);
  });
});
