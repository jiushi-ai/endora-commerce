import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ERROR_CODES, submitBidReceiptRequestSchema } from '@endora-commerce/contracts';
import { HttpError } from '@endora-commerce/platform/http';
import type { EntityManager } from '@mikro-orm/postgresql';
import { BiddingCampaign } from './entities/bidding-campaign.entity.js';
import { BidReceipt } from './entities/bid-receipt.entity.js';
import type { BiddingReceiptService } from './services/receipt-service.js';
import { toCampaignDto } from './services/campaign-mapper.js';

export interface BiddingStorefrontRoutesDeps {
  emFactory: () => EntityManager;
  requireCustomer: (req: FastifyRequest, reply: FastifyReply) => Promise<void> | void;
  resolveCustomerContext: (req: FastifyRequest) => { organizationId: string };
  receipts: BiddingReceiptService;
}

function orgEligible(
  audience: { organizationIds?: string[]; customerGroupIds?: string[] },
  organizationId: string,
): boolean {
  const orgIds = audience.organizationIds ?? [];
  if (orgIds.length === 0) return true;
  return orgIds.includes(organizationId);
}

export async function registerBiddingStorefrontRoutes(
  app: FastifyInstance,
  deps: BiddingStorefrontRoutesDeps,
): Promise<void> {
  const { emFactory, requireCustomer, resolveCustomerContext, receipts } = deps;

  app.get('/api/v1/bidding/campaigns', { preHandler: requireCustomer }, async (request) => {
    const { organizationId } = resolveCustomerContext(request);
    const em = emFactory();
    const rows = await em.find(
      BiddingCampaign,
      { status: { $in: ['published', 'closed_for_bids', 'allocated'] } },
      { orderBy: { opensAt: 'DESC' } },
    );
    const visible = rows.filter((c) => orgEligible(c.audience, organizationId));
    return {
      data: visible.map(toCampaignDto),
      pagination: { nextCursor: null, hasMore: false },
    };
  });

  app.get<{ Params: { id: string } }>(
    '/api/v1/bidding/campaigns/:id',
    { preHandler: requireCustomer },
    async (request) => {
      const { organizationId } = resolveCustomerContext(request);
      const em = emFactory();
      const campaign = await em.findOne(BiddingCampaign, { id: request.params.id });
      if (!campaign || !orgEligible(campaign.audience, organizationId)) {
        throw new HttpError(404, ERROR_CODES.BIDDING_CAMPAIGN_NOT_FOUND, 'Campaign not found.');
      }
      if (!['published', 'closed_for_bids', 'allocated', 'closed'].includes(campaign.status)) {
        throw new HttpError(404, ERROR_CODES.BIDDING_CAMPAIGN_NOT_FOUND, 'Campaign not found.');
      }
      const mine = await em.findOne(BidReceipt, {
        campaignId: campaign.id,
        organizationId,
      });
      return {
        data: {
          campaign: toCampaignDto(campaign),
          myReceipt: mine
            ? {
                id: mine.id,
                status: mine.status,
                bidUnitPrice: mine.bidUnitPrice != null ? String(mine.bidUnitPrice) : null,
                bidQty: mine.bidQty ?? null,
                tradeId: mine.tradeId ?? null,
              }
            : null,
        },
      };
    },
  );

  app.post<{ Params: { id: string } }>(
    '/api/v1/bidding/campaigns/:id/receipts',
    { preHandler: requireCustomer, schema: { body: submitBidReceiptRequestSchema } },
    async (request, reply) => {
      const { organizationId } = resolveCustomerContext(request);
      const body = submitBidReceiptRequestSchema.parse(request.body);
      const data = await receipts.submit(request.params.id, organizationId, body);
      reply.code(201);
      return { data };
    },
  );

  app.get('/api/v1/bidding/receipts/mine', { preHandler: requireCustomer }, async (request) => {
    const { organizationId } = resolveCustomerContext(request);
    const data = await receipts.listMine(organizationId);
    return { data, pagination: { nextCursor: null, hasMore: false } };
  });
}
