import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithI18n, passthroughBundle } from '../../helpers/render-with-i18n';
import { adminSession, modulePresence, withSession } from '../../helpers/render-with-session';

/**
 * Batch 58 — Delivery tab: tracking input + Mark success posts the receive
 * ingress with `outcome: 'success'` and the typed externalReference.
 */

const getSpy = vi.fn();
const postSpy = vi.fn();

vi.mock('@endora-commerce/admin-kit/lib', async () => {
  const actual = await vi.importActual<typeof import('@endora-commerce/admin-kit/lib')>(
    '@endora-commerce/admin-kit/lib',
  );
  return {
    ...actual,
    apiClient: {
      get: (...args: unknown[]) => getSpy(...args),
      post: (...args: unknown[]) => postSpy(...args),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  };
});

const { OrderShipmentsTab } = await import(
  '../../../../packages/modules/orders/src/admin/components/OrderShipmentsTab'
);

const PENDING = {
  id: 's-pending',
  status: 'pending',
  externalReference: null,
  providerDetails: null,
  failureReason: null,
  attemptNo: 1,
  customerConfirmedAt: null,
  createdAt: '2026-11-21T12:00:00Z',
};

const BUNDLE = passthroughBundle('core', [
  'orderDetail.shipments.title',
  'orderDetail.shipments.status.pending',
  'orderDetail.shipments.tracking.label',
  'orderDetail.shipments.tracking.placeholder',
  'orderDetail.shipments.markSuccess',
  'orderDetail.shipments.columns.attempt',
  'orderDetail.shipments.columns.status',
  'orderDetail.shipments.columns.tracking',
  'orderDetail.shipments.columns.createdAt',
  'orderDetail.shipments.columns.confirmedAt',
  'orderDetail.shipments.columns.failure',
]);

beforeEach(() => {
  getSpy.mockReset();
  postSpy.mockReset();
});

describe('OrderShipmentsTab — mark success with tracking (batch 58)', () => {
  it('posts /api/v1/shipments/receive with shipmentId, success and tracking', async () => {
    getSpy.mockResolvedValue({ data: [PENDING] });
    postSpy.mockResolvedValue({ data: { shipmentId: PENDING.id, status: 'success' } });
    const user = userEvent.setup();

    renderWithI18n(
      withSession(<OrderShipmentsTab orderId="o1" deliveryMethodCode="courier" />, {
        session: adminSession({ permissions: ['orders:write'] }),
        presence: modulePresence({ present: ['orders'] }),
      }),
      BUNDLE,
    );

    await screen.findByText('orderDetail.shipments.markSuccess');
    const input = screen.getByLabelText('orderDetail.shipments.tracking.label');
    await user.type(input, 'TRACK-42');
    await user.click(screen.getByText('orderDetail.shipments.markSuccess'));

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/api/v1/shipments/receive', {
        shipmentId: 's-pending',
        outcome: 'success',
        externalReference: 'TRACK-42',
      });
    });
  });
});
