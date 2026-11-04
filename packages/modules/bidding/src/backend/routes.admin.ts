import type { FastifyInstance } from 'fastify';
import {
  allocateCampaignRequestSchema,
  approveBidReceiptRequestSchema,
  confirmDepositRequestSchema,
  convertToOrderRequestSchema,
  createBiddingCampaignRequestSchema,
  rejectBidReceiptRequestSchema,
  updateBiddingCampaignRequestSchema,
  type AssetsLibraryPort,
  type OrganizationDetailsPort,
} from '@endora-commerce/contracts';
import type { RequireAdminFactory } from '@endora-commerce/platform/kernel';
import type { BiddingCampaignService } from './services/campaign-service.js';
import type { BiddingReceiptService } from './services/receipt-service.js';

export interface BiddingAdminRoutesDeps {
  requireAdmin: RequireAdminFactory;
  campaigns: BiddingCampaignService;
  receipts: BiddingReceiptService;
  organizations: OrganizationDetailsPort;
  assetsLibrary: AssetsLibraryPort;
}

function actorAdminUserId(request: {
  actor?: { kind?: string; adminUserId?: string };
  testActor?: { kind?: string; adminUserId?: string };
}): string {
  if (request.actor?.kind === 'admin' && request.actor.adminUserId) {
    return request.actor.adminUserId;
  }
  if (request.testActor?.kind === 'admin' && request.testActor.adminUserId) {
    return request.testActor.adminUserId;
  }
  return '00000000-0000-0000-0000-000000000000';
}

export async function registerBiddingAdminRoutes(
  app: FastifyInstance,
  deps: BiddingAdminRoutesDeps,
): Promise<void> {
  const { requireAdmin, campaigns, receipts, organizations, assetsLibrary } = deps;

  app.get('/api/v1/admin/bidding/campaigns', { preHandler: requireAdmin('bidding:campaigns:read') }, async () => {
    const data = await campaigns.list();
    return { data, pagination: { nextCursor: null, hasMore: false } };
  });

  app.get<{ Params: { id: string } }>(
    '/api/v1/admin/bidding/campaigns/:id',
    { preHandler: requireAdmin('bidding:campaigns:read') },
    async (request) => ({ data: await campaigns.getDetailById(request.params.id) }),
  );

  app.post(
    '/api/v1/admin/bidding/campaigns',
    {
      preHandler: requireAdmin('bidding:campaigns:write'),
      schema: { body: createBiddingCampaignRequestSchema },
    },
    async (request, reply) => {
      const body = createBiddingCampaignRequestSchema.parse(request.body);
      const data = await campaigns.create(body, actorAdminUserId(request));
      reply.code(201);
      return { data };
    },
  );

  app.patch<{ Params: { id: string } }>(
    '/api/v1/admin/bidding/campaigns/:id',
    {
      preHandler: requireAdmin('bidding:campaigns:write'),
      schema: { body: updateBiddingCampaignRequestSchema },
    },
    async (request) => {
      const body = updateBiddingCampaignRequestSchema.parse(request.body);
      return { data: await campaigns.update(request.params.id, body) };
    },
  );

  app.post<{ Params: { id: string } }>(
    '/api/v1/admin/bidding/campaigns/:id/publish',
    { preHandler: requireAdmin('bidding:campaigns:write') },
    async (request) => ({ data: await campaigns.publish(request.params.id) }),
  );

  app.post<{ Params: { id: string } }>(
    '/api/v1/admin/bidding/campaigns/:id/close-bids',
    { preHandler: requireAdmin('bidding:campaigns:write') },
    async (request) => ({ data: await campaigns.closeBids(request.params.id) }),
  );

  app.post<{ Params: { id: string } }>(
    '/api/v1/admin/bidding/campaigns/:id/allocate',
    {
      preHandler: requireAdmin('bidding:allocate'),
      schema: { body: allocateCampaignRequestSchema },
    },
    async (request) => {
      const body = allocateCampaignRequestSchema.parse(request.body);
      const data = await receipts.allocate(request.params.id, actorAdminUserId(request), body);
      return { data };
    },
  );

  app.get<{ Querystring: { campaignId?: string; status?: string } }>(
    '/api/v1/admin/bidding/receipts',
    { preHandler: requireAdmin('bidding:receipts:review') },
    async (request) => {
      const filters: { campaignId?: string; status?: string } = {};
      if (request.query.campaignId !== undefined) filters.campaignId = request.query.campaignId;
      if (request.query.status !== undefined) filters.status = request.query.status;
      const data = await receipts.listForAdmin(filters, { organizations, assetsLibrary });
      return { data, pagination: { nextCursor: null, hasMore: false } };
    },
  );

  app.post<{ Params: { id: string } }>(
    '/api/v1/admin/bidding/receipts/:id/approve',
    {
      preHandler: requireAdmin('bidding:receipts:review'),
      schema: { body: approveBidReceiptRequestSchema },
    },
    async (request) => {
      const body = approveBidReceiptRequestSchema.parse(request.body);
      return { data: await receipts.approve(request.params.id, actorAdminUserId(request), body) };
    },
  );

  app.post<{ Params: { id: string } }>(
    '/api/v1/admin/bidding/receipts/:id/reject',
    {
      preHandler: requireAdmin('bidding:receipts:review'),
      schema: { body: rejectBidReceiptRequestSchema },
    },
    async (request) => {
      const body = rejectBidReceiptRequestSchema.parse(request.body);
      return { data: await receipts.reject(request.params.id, actorAdminUserId(request), body) };
    },
  );

  app.post<{ Params: { id: string }; Body: unknown }>(
    '/api/v1/admin/bidding/receipts/:id/confirm-deposit',
    {
      preHandler: requireAdmin('bidding:deposit:confirm'),
      schema: { body: confirmDepositRequestSchema },
    },
    async (request) => {
      const body = confirmDepositRequestSchema.parse(request.body);
      return {
        data: await receipts.confirmDeposit(
          request.params.id,
          actorAdminUserId(request),
          body,
        ),
      };
    },
  );

  app.post<{ Params: { id: string }; Body: unknown }>(
    '/api/v1/admin/bidding/receipts/:id/convert-to-order',
    {
      preHandler: requireAdmin('bidding:campaigns:write'),
      schema: { body: convertToOrderRequestSchema },
    },
    async (request) => {
      const body = convertToOrderRequestSchema.parse(request.body ?? {});
      return {
        data: await receipts.convertToOrder(
          request.params.id,
          actorAdminUserId(request),
          body,
        ),
      };
    },
  );
}
