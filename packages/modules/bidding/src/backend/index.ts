import type { EntityManager } from '@mikro-orm/postgresql';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type {
  AdminRolePort,
  AssetsLibraryPort,
  BiddingFulfilmentGatePort,
  CartWritePort,
  CatalogProductReadPort,
  CustomerAccountReadPort,
  DefaultPreferencePort,
  OrderPlacementPort,
  OrganizationDetailsPort,
  SystemRoleCodePort,
} from '@endora-commerce/contracts';
import type { AuditPort, ModuleContext, RequireAdminFactory } from '@endora-commerce/platform/kernel';
import { effectiveState, lazyPort } from '@endora-commerce/platform/kernel';

import { BidApprovalStepRow } from './entities/bid-approval-step.entity.js';
import { BidReceipt } from './entities/bid-receipt.entity.js';
import { BiddingAllocationResult } from './entities/bidding-allocation-result.entity.js';
import { BiddingCampaign } from './entities/bidding-campaign.entity.js';
import { BiddingCampaignRuleVersion } from './entities/bidding-campaign-rule-version.entity.js';
import { registerBiddingAdminRoutes } from './routes.admin.js';
import { registerBiddingIntentUploadRoutes } from './routes.intent-upload.js';
import { registerBiddingStorefrontRoutes } from './routes.storefront.js';
import { BiddingCampaignService } from './services/campaign-service.js';
import { assertBiddingReceiptShipReady } from './services/fulfilment-gate.js';
import { BiddingIntentAttachmentUploadService } from './services/intent-attachment-upload-service.js';
import { BiddingReceiptService } from './services/receipt-service.js';
import { seedBiddingRoles } from './services/seed-roles.js';

/**
 * `bidding` — feature 165 (Mobii). Campaigns, receipts, approval, allocate,
 * real Order convert (T17′). Role seeder from Batch C remains.
 */

export interface BiddingCradle {
  readonly emFactory: () => EntityManager;
  readonly auditLogService: AuditPort;
  readonly requireAdmin: RequireAdminFactory;
  readonly requireCustomer: (req: FastifyRequest, reply: FastifyReply) => Promise<void> | void;
  readonly customerContextResolver: (req: FastifyRequest) => { organizationId: string };
  readonly biddingCampaignService: BiddingCampaignService;
  readonly biddingReceiptService: BiddingReceiptService;
  readonly biddingIntentAttachmentUploadService: BiddingIntentAttachmentUploadService;
}

export function registerModule(ctx: ModuleContext): void {
  const cradle = (): BiddingCradle => ctx.cradle<BiddingCradle>();

  ctx.di.register({
    biddingCampaignService: ctx
      .asFunction(
        ({ emFactory, auditLogService }: BiddingCradle) =>
          new BiddingCampaignService(emFactory, auditLogService),
      )
      .singleton(),
    biddingReceiptService: ctx
      .asFunction(
        ({ emFactory, auditLogService }: BiddingCradle) =>
          new BiddingReceiptService(emFactory, auditLogService, {
            carts: lazyPort<CartWritePort>(ctx, 'cartWritePort'),
            orderPlacement: lazyPort<OrderPlacementPort>(ctx, 'orderPlacementPort'),
            catalogProducts: lazyPort<CatalogProductReadPort>(ctx, 'catalogProductReadPort'),
            customerAccounts: lazyPort<CustomerAccountReadPort>(
              ctx,
              'customerAccountReadPort',
            ),
            defaultPreferences: lazyPort<DefaultPreferencePort>(
              ctx,
              'defaultPreferencePort',
            ),
          }),
      )
      .singleton(),
    biddingIntentAttachmentUploadService: ctx
      .asFunction(
        ({ emFactory }: BiddingCradle) =>
          new BiddingIntentAttachmentUploadService(
            emFactory,
            lazyPort<AssetsLibraryPort>(ctx, 'assetsLibraryPort'),
          ),
      )
      .singleton(),
  });

  /**
   * Ship checklist (T22 / G-S1): tradeId + intent attachment + converted path.
   * Non-bidding orders (no receipt for orderId) pass through.
   */
  ctx.di.providePort<BiddingFulfilmentGatePort>(
    'biddingFulfilmentGatePort',
    ctx
      .asFunction(
        ({ emFactory }: BiddingCradle): BiddingFulfilmentGatePort => ({
          assertShipAllowed: async (orderId: string) => {
            const em = emFactory();
            const receipt = await em.findOne(BidReceipt, { orderId });
            if (!receipt) return;
            assertBiddingReceiptShipReady(receipt);
          },
        }),
      )
      .singleton(),
  );

  ctx.onBoot(async () => {
    if (!effectiveState.isPresent('bidding')) return;
    await seedBiddingRoles(
      lazyPort<AdminRolePort>(ctx, 'adminRolePort'),
      lazyPort<SystemRoleCodePort>(ctx, 'systemRoleCodePort'),
    );
  });

  ctx.routes(async (app) => {
    await registerBiddingAdminRoutes(app, {
      requireAdmin: (permission) => async (req, reply) =>
        cradle().requireAdmin(permission)(req, reply),
      campaigns: cradle().biddingCampaignService,
      receipts: cradle().biddingReceiptService,
      organizations: lazyPort<OrganizationDetailsPort>(ctx, 'organizationDetailsPort'),
      assetsLibrary: lazyPort<AssetsLibraryPort>(ctx, 'assetsLibraryPort'),
    });
  });

  ctx.routes(async (app) => {
    await registerBiddingStorefrontRoutes(app, {
      emFactory: cradle().emFactory,
      requireCustomer: (req, reply) => cradle().requireCustomer(req, reply),
      resolveCustomerContext: (req) => cradle().customerContextResolver(req),
      receipts: cradle().biddingReceiptService,
    });
  });

  ctx.routes(async (app) => {
    await registerBiddingIntentUploadRoutes(app, {
      uploadService: cradle().biddingIntentAttachmentUploadService,
      requireCustomer: (req, reply) => cradle().requireCustomer(req, reply),
      resolveCustomerContext: (req) => cradle().customerContextResolver(req),
    });
  });
}

export const entities = [
  BiddingCampaign,
  BiddingCampaignRuleVersion,
  BidReceipt,
  BidApprovalStepRow,
  BiddingAllocationResult,
];
