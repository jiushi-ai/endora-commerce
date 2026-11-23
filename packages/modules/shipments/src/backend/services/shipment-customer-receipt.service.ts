import type { EntityManager } from '@mikro-orm/postgresql';
import type { ShipmentCustomerReceiptPort } from '@endora-commerce/contracts';
import { Shipment } from '../entities/shipment.entity.js';

/**
 * Batch 61 — stamp the latest dispatched shipment as buyer-received.
 *
 * Picks the highest `attemptNo` row in `success` (or already `received` for
 * idempotency). Leaves pending/failed attempts alone.
 */
export class ShipmentCustomerReceiptService implements ShipmentCustomerReceiptPort {
  constructor(private readonly emFactory: () => EntityManager) {}

  async markReceivedForOrder(orderId: string, confirmedAt: Date): Promise<void> {
    const em = this.emFactory();
    const rows = await em.find(
      Shipment,
      { orderId, status: { $in: ['success', 'received'] } },
      { orderBy: { attemptNo: 'desc' }, limit: 1 },
    );
    const latest = rows[0];
    if (!latest) return;
    if (latest.status === 'received' && latest.customerConfirmedAt) return;

    latest.status = 'received';
    latest.customerConfirmedAt = confirmedAt;
    await em.flush();
  }
}
