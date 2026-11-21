import type { EntityManager } from '@mikro-orm/postgresql';
import { ERROR_CODES, type OrderTransitionPort } from '@endora-commerce/contracts';
import { HttpError } from '@endora-commerce/platform/http';
import { Order } from '../entities/order.entity.js';

/** Default graph target for buyer confirm-receipt (batch 58). */
export const CUSTOMER_RECEIPT_FROM_STATUS = 'shipment_sent';
export const CUSTOMER_RECEIPT_TO_STATUS = 'completed';

export interface CustomerOrderReceiptDeps {
  emFactory: () => EntityManager;
  transitions: OrderTransitionPort;
}

/**
 * Batch 58 — buyer confirms receipt of a shipped order.
 *
 * Moves `shipment_sent` → `completed` through the lifecycle port (not the
 * shipments receive ingress). Ownership is a scoped find: a foreign order id
 * answers 404, never 403.
 */
export class CustomerOrderReceiptService {
  constructor(private readonly deps: CustomerOrderReceiptDeps) {}

  async confirmByCustomer(orderId: string, customerAccountId: string): Promise<Order> {
    const em = this.deps.emFactory();
    const order = await em.findOne(Order, { id: orderId, placedByCustomerAccountId: customerAccountId });
    if (!order) throw new HttpError(404, ERROR_CODES.ORDER_NOT_FOUND, 'Order not found.');

    if (order.status === CUSTOMER_RECEIPT_TO_STATUS) return order;

    if (order.status !== CUSTOMER_RECEIPT_FROM_STATUS) {
      throw new HttpError(
        409,
        ERROR_CODES.INVALID_TRANSITION,
        'This order cannot be confirmed as received yet.',
      );
    }

    const outcome = await this.deps.transitions.applyStatus({
      orderId: order.id,
      to: CUSTOMER_RECEIPT_TO_STATUS,
      actor: { kind: 'customer', customerAccountId },
      reason: 'Confirmed received by the customer.',
    });
    if (!outcome.applied && outcome.reason !== 'already_there') {
      throw new HttpError(
        409,
        ERROR_CODES.INVALID_TRANSITION,
        'This order could not be confirmed as received. Please contact us and we will help.',
      );
    }

    return this.deps.emFactory().findOneOrFail(Order, { id: order.id }, { refresh: true });
  }

  /** Whether the buyer's surface should offer the confirm-receipt control. */
  isConfirmable(order: Pick<Order, 'status' | 'placedByCustomerAccountId'>, customerAccountId: string): boolean {
    return (
      order.placedByCustomerAccountId === customerAccountId &&
      order.status === CUSTOMER_RECEIPT_FROM_STATUS
    );
  }
}
