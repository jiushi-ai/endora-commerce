import { describe, expect, it } from 'vitest';
import type { EntityManager } from '@mikro-orm/postgresql';
import { ERROR_CODES, type OrderTransitionPort } from '@endora-commerce/contracts';
import {
  CUSTOMER_RECEIPT_FROM_STATUS,
  CUSTOMER_RECEIPT_TO_STATUS,
  CustomerOrderReceiptService,
} from './customer-order-receipt-service.js';

const ORDER_ID = '11111111-1111-4111-8111-111111111111';
const BUYER = '22222222-2222-4222-8222-222222222222';

function emFactory(order: { id: string; status: string; placedByCustomerAccountId: string } | null) {
  return (() =>
    ({
      findOne: async (_entity: unknown, where: { id?: string; placedByCustomerAccountId?: string }) => {
        if (!order) return null;
        if (where.id && where.id !== order.id) return null;
        if (
          where.placedByCustomerAccountId &&
          where.placedByCustomerAccountId !== order.placedByCustomerAccountId
        ) {
          return null;
        }
        return order;
      },
      findOneOrFail: async () => {
        if (!order) throw new Error('missing');
        return order;
      },
    })) as unknown as () => EntityManager;
}

describe('CustomerOrderReceiptService (batch 58)', () => {
  it('moves shipment_sent → completed for the placing buyer', async () => {
    const applied: unknown[] = [];
    const transitions = {
      applyStatus: async (input: {
        orderId: string;
        to: string;
        actor: { kind: string; customerAccountId?: string };
        reason?: string | null;
      }) => {
        applied.push(input);
        return { applied: true as const, from: CUSTOMER_RECEIPT_FROM_STATUS, to: CUSTOMER_RECEIPT_TO_STATUS };
      },
      isTerminal: async () => false,
    } satisfies OrderTransitionPort;
    const order = {
      id: ORDER_ID,
      status: CUSTOMER_RECEIPT_FROM_STATUS,
      placedByCustomerAccountId: BUYER,
    };
    const svc = new CustomerOrderReceiptService({
      emFactory: emFactory(order),
      transitions,
    });

    const result = await svc.confirmByCustomer(ORDER_ID, BUYER);
    expect(applied).toEqual([
      {
        orderId: ORDER_ID,
        to: CUSTOMER_RECEIPT_TO_STATUS,
        actor: { kind: 'customer', customerAccountId: BUYER },
        reason: 'Confirmed received by the customer.',
      },
    ]);
    expect(result.id).toBe(ORDER_ID);
  });

  it('refuses an order that is not shipment_sent', async () => {
    const transitions = {
      applyStatus: async () => ({
        applied: true as const,
        from: 'processing',
        to: CUSTOMER_RECEIPT_TO_STATUS,
      }),
      isTerminal: async () => false,
    } satisfies OrderTransitionPort;
    const svc = new CustomerOrderReceiptService({
      emFactory: emFactory({
        id: ORDER_ID,
        status: 'processing',
        placedByCustomerAccountId: BUYER,
      }),
      transitions,
    });

    await expect(svc.confirmByCustomer(ORDER_ID, BUYER)).rejects.toMatchObject({
      statusCode: 409,
      code: ERROR_CODES.INVALID_TRANSITION,
    });
  });

  it('isConfirmable only for shipment_sent owned by the buyer', () => {
    const svc = new CustomerOrderReceiptService({
      emFactory: emFactory(null),
      transitions: {
        applyStatus: async () => ({
          applied: false as const,
          reason: 'not_permitted' as const,
          from: 'new',
          detail: 'no',
        }),
        isTerminal: async () => false,
      },
    });
    expect(
      svc.isConfirmable(
        { status: CUSTOMER_RECEIPT_FROM_STATUS, placedByCustomerAccountId: BUYER },
        BUYER,
      ),
    ).toBe(true);
    expect(
      svc.isConfirmable(
        { status: CUSTOMER_RECEIPT_FROM_STATUS, placedByCustomerAccountId: BUYER },
        'other',
      ),
    ).toBe(false);
    expect(
      svc.isConfirmable({ status: 'completed', placedByCustomerAccountId: BUYER }, BUYER),
    ).toBe(false);
  });
});
