import type { EntityManager } from '@mikro-orm/postgresql';
import {
  ERROR_CODES,
  type AllocateCampaignRequest,
  type ApproveBidReceiptRequest,
  type AssetsLibraryPort,
  type BiddingAllocationOutcome,
  type BiddingReceipt,
  type BiddingReceiptAdmin,
  type BiddingReceiptAttachment,
  type OrganizationDetailsPort,
  type RejectBidReceiptRequest,
  type SubmitBidReceiptRequest,
} from '@endora-commerce/contracts';
import { HttpError } from '@endora-commerce/platform/http';
import { recordAuditFromContext } from '@endora-commerce/platform/commands';
import type { AuditPort } from '@endora-commerce/platform/kernel';
import { randomUUID } from 'crypto';
import { BidApprovalStepRow } from '../entities/bid-approval-step.entity.js';
import { BidReceipt } from '../entities/bid-receipt.entity.js';
import { BiddingAllocationResult } from '../entities/bidding-allocation-result.entity.js';
import { BiddingCampaign } from '../entities/bidding-campaign.entity.js';
import { BiddingCampaignRuleVersion } from '../entities/bidding-campaign-rule-version.entity.js';

/** Prefer a forced download when the library served a `/assets/file/:id` URL. */
function asDownloadLink(url: string, assetId: string): string {
  const [beforeFragment = ''] = url.split('#');
  const [path = '', query] = beforeFragment.split('?');
  if (!path.endsWith(`/assets/file/${assetId}`)) return url;
  if (query !== undefined && new URLSearchParams(query).has('download')) return url;
  return `${beforeFragment}${query === undefined ? '?' : '&'}download=1`;
}

export interface ReceiptAdminEnrichment {
  organizations: OrganizationDetailsPort;
  assetsLibrary: AssetsLibraryPort;
}

function toReceiptDto(row: BidReceipt, sealPrices: boolean): BiddingReceipt {
  return {
    id: row.id,
    campaignId: row.campaignId,
    organizationId: row.organizationId,
    ruleVersionId: row.ruleVersionId,
    status: row.status,
    bidUnitPrice: sealPrices ? null : row.bidUnitPrice != null ? String(row.bidUnitPrice) : null,
    bidQty: sealPrices ? null : (row.bidQty ?? null),
    attachmentAssetIds: [...(row.attachmentAssetIds ?? [])],
    tradeId: row.tradeId ?? null,
    orderId: row.orderId ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function orgEligible(
  audience: { organizationIds?: string[]; customerGroupIds?: string[] },
  organizationId: string,
): boolean {
  const orgIds = audience.organizationIds ?? [];
  // Empty org allow-list ⇒ open to all orgs (customer groups deferred to P3 wiring).
  if (orgIds.length === 0) return true;
  return orgIds.includes(organizationId);
}

/**
 * BidReceipt submit, dual review, deposit confirm, allocate, thin convert.
 */
export class BiddingReceiptService {
  constructor(
    private readonly emFactory: () => EntityManager,
    private readonly auditLog?: AuditPort,
  ) {}

  async listForAdmin(
    filters?: {
      campaignId?: string;
      status?: string;
    },
    enrich?: ReceiptAdminEnrichment,
  ): Promise<BiddingReceiptAdmin[]> {
    const em = this.emFactory();
    const where: Record<string, unknown> = {};
    if (filters?.campaignId) where.campaignId = filters.campaignId;
    if (filters?.status) where.status = filters.status;
    const rows = await em.find(BidReceipt, where, { orderBy: { createdAt: 'DESC' } });
    const campaignIds = [...new Set(rows.map((r) => r.campaignId))];
    const campaigns = campaignIds.length
      ? await em.find(BiddingCampaign, { id: { $in: campaignIds } })
      : [];
    const campaignById = new Map(campaigns.map((c) => [c.id, c]));

    const orgNameById = new Map<string, string>();
    if (enrich && rows.length > 0) {
      const orgIds = [...new Set(rows.map((r) => r.organizationId))];
      const orgs = await enrich.organizations.findByIds(orgIds);
      for (const org of orgs) orgNameById.set(org.id, org.name);
    }

    const attachmentCache = new Map<string, BiddingReceiptAttachment>();
    async function resolveAttachment(assetId: string): Promise<BiddingReceiptAttachment> {
      const hit = attachmentCache.get(assetId);
      if (hit) return hit;
      if (!enrich) {
        const stub: BiddingReceiptAttachment = { id: assetId, filename: assetId, url: null };
        attachmentCache.set(assetId, stub);
        return stub;
      }
      try {
        const asset = await enrich.assetsLibrary.getAsset(assetId);
        const resolved: BiddingReceiptAttachment = {
          id: asset.id,
          filename: asset.filename,
          url: asDownloadLink(asset.url, asset.id),
        };
        attachmentCache.set(assetId, resolved);
        return resolved;
      } catch {
        const missing: BiddingReceiptAttachment = {
          id: assetId,
          filename: assetId.slice(0, 8) + '…',
          url: null,
        };
        attachmentCache.set(assetId, missing);
        return missing;
      }
    }

    const out: BiddingReceiptAdmin[] = [];
    for (const row of rows) {
      const campaign = campaignById.get(row.campaignId);
      const seal =
        campaign?.status === 'published' ||
        campaign?.status === 'draft' ||
        campaign === undefined;
      const base = toReceiptDto(row, seal);
      const attachments = await Promise.all(
        (row.attachmentAssetIds ?? []).map((id) => resolveAttachment(id)),
      );
      out.push({
        ...base,
        campaignCode: campaign?.code,
        campaignTitle: campaign?.title,
        organizationName: orgNameById.get(row.organizationId) ?? null,
        attachments,
      });
    }
    return out;
  }

  async listMine(organizationId: string): Promise<BiddingReceipt[]> {
    const em = this.emFactory();
    const rows = await em.find(
      BidReceipt,
      { organizationId },
      { orderBy: { createdAt: 'DESC' } },
    );
    return rows.map((r) => toReceiptDto(r, false));
  }

  async submit(
    campaignId: string,
    organizationId: string,
    input: SubmitBidReceiptRequest,
  ): Promise<BiddingReceipt> {
    if (!input.attachmentAssetIds?.length) {
      throw new HttpError(
        422,
        ERROR_CODES.BIDDING_ATTACHMENT_REQUIRED,
        'At least one intent attachment is required.',
      );
    }
    const em = this.emFactory();
    const campaign = await em.findOne(BiddingCampaign, { id: campaignId });
    if (!campaign) {
      throw new HttpError(404, ERROR_CODES.BIDDING_CAMPAIGN_NOT_FOUND, 'Campaign not found.');
    }
    if (campaign.status !== 'published') {
      throw new HttpError(409, ERROR_CODES.BIDDING_CLOSED, 'Campaign is not open for bids.');
    }
    const now = new Date();
    if (now < campaign.opensAt || now > campaign.closesAt) {
      throw new HttpError(409, ERROR_CODES.BIDDING_CLOSED, 'Outside the bid window.');
    }
    if (!orgEligible(campaign.audience, organizationId)) {
      throw new HttpError(
        403,
        ERROR_CODES.BIDDING_NOT_ELIGIBLE,
        'Organization is not in the campaign audience.',
      );
    }
    if (!campaign.currentRuleVersionId) {
      throw new HttpError(422, ERROR_CODES.BIDDING_RULE_REQUIRED, 'Campaign has no frozen rules.');
    }
    const rule = await em.findOne(BiddingCampaignRuleVersion, {
      id: campaign.currentRuleVersionId,
    });
    if (!rule) {
      throw new HttpError(422, ERROR_CODES.BIDDING_RULE_REQUIRED, 'Rule version missing.');
    }
    if (Number(input.bidUnitPrice) < Number(rule.minUnitPrice)) {
      throw new HttpError(
        422,
        ERROR_CODES.VALIDATION_FAILED,
        'Bid unit price is below the campaign floor.',
      );
    }
    if (input.bidQty > rule.maxQtyPerOrg || input.bidQty < rule.minQty) {
      throw new HttpError(422, ERROR_CODES.VALIDATION_FAILED, 'Bid quantity out of bounds.');
    }
    const existing = await em.findOne(BidReceipt, { campaignId, organizationId });
    if (existing && !['rejected', 'withdrawn'].includes(existing.status)) {
      throw new HttpError(
        409,
        ERROR_CODES.BIDDING_ALREADY_SUBMITTED,
        'An active receipt already exists for this organization.',
      );
    }
    if (existing) {
      existing.ruleVersionId = rule.id;
      existing.status = 'submitted';
      existing.bidUnitPrice = input.bidUnitPrice;
      existing.bidQty = input.bidQty;
      existing.attachmentAssetIds = [...input.attachmentAssetIds];
      existing.tradeId = null;
      existing.orderId = null;
      if (this.auditLog) {
        recordAuditFromContext(this.auditLog, em, {
          action: 'bidding.receipt.resubmit',
          objectType: 'bid_receipt',
          objectId: existing.id,
          stateBefore: null,
          stateAfter: { status: 'submitted' },
        });
      }
      await em.flush();
      return toReceiptDto(existing, false);
    }
    const row = em.create(BidReceipt, {
      campaignId,
      organizationId,
      ruleVersionId: rule.id,
      status: 'submitted',
      bidUnitPrice: input.bidUnitPrice,
      bidQty: input.bidQty,
      attachmentAssetIds: [...input.attachmentAssetIds],
    });
    em.persist(row);
    if (this.auditLog) {
      recordAuditFromContext(this.auditLog, em, {
        action: 'bidding.receipt.submit',
        objectType: 'bid_receipt',
        objectId: row.id,
        stateBefore: null,
        stateAfter: { status: 'submitted', campaignId },
      });
    }
    await em.flush();
    return toReceiptDto(row, false);
  }

  async approve(
    receiptId: string,
    adminUserId: string,
    body: ApproveBidReceiptRequest,
  ): Promise<BiddingReceipt> {
    return this.decide(receiptId, adminUserId, body.step, 'approve', body.note);
  }

  async reject(
    receiptId: string,
    adminUserId: string,
    body: RejectBidReceiptRequest,
  ): Promise<BiddingReceipt> {
    return this.decide(receiptId, adminUserId, body.step, 'reject', body.note);
  }

  async confirmDeposit(receiptId: string, adminUserId: string): Promise<BiddingReceipt> {
    const em = this.emFactory();
    const row = await em.findOne(BidReceipt, { id: receiptId });
    if (!row) {
      throw new HttpError(404, ERROR_CODES.BIDDING_RECEIPT_NOT_FOUND, 'Receipt not found.');
    }
    if (row.status !== 'await_deposit') {
      throw new HttpError(
        409,
        ERROR_CODES.BIDDING_STEP_REQUIRED,
        'Receipt is not awaiting deposit.',
      );
    }
    const step = em.create(BidApprovalStepRow, {
      receiptId: row.id,
      step: 'finance_deposit',
      actorAdminUserId: adminUserId,
      decision: 'approve',
      note: null,
    });
    em.persist(step);
    row.status = 'deposit_confirmed';
    if (!row.tradeId) row.tradeId = `TRD-${randomUUID().slice(0, 8).toUpperCase()}`;
    if (this.auditLog) {
      recordAuditFromContext(this.auditLog, em, {
        action: 'bidding.receipt.confirm_deposit',
        objectType: 'bid_receipt',
        objectId: row.id,
        stateBefore: { status: 'await_deposit' },
        stateAfter: { status: 'deposit_confirmed', tradeId: row.tradeId },
      });
    }
    await em.flush();
    return toReceiptDto(row, false);
  }

  async allocate(
    campaignId: string,
    adminUserId: string,
    body: AllocateCampaignRequest,
  ): Promise<{ campaignStatus: string; results: Array<{ receiptId: string; outcome: string }> }> {
    const em = this.emFactory();
    const campaign = await em.findOne(BiddingCampaign, { id: campaignId });
    if (!campaign) {
      throw new HttpError(404, ERROR_CODES.BIDDING_CAMPAIGN_NOT_FOUND, 'Campaign not found.');
    }
    if (campaign.status !== 'closed_for_bids' && campaign.status !== 'published') {
      throw new HttpError(
        409,
        ERROR_CODES.BIDDING_INVALID_TRANSITION,
        'Campaign must be closed for bids (or published) before allocate.',
      );
    }
    if (campaign.status === 'published') {
      campaign.status = 'closed_for_bids';
    }
    const out: Array<{ receiptId: string; outcome: string }> = [];
    for (const item of body.results) {
      const receipt = await em.findOne(BidReceipt, { id: item.receiptId, campaignId });
      if (!receipt) {
        throw new HttpError(404, ERROR_CODES.BIDDING_RECEIPT_NOT_FOUND, 'Receipt not found.');
      }
      const existing = await em.findOne(BiddingAllocationResult, {
        campaignId,
        receiptId: item.receiptId,
      });
      if (existing) {
        existing.outcome = item.outcome;
        existing.allocatedQty = item.allocatedQty ?? 0;
        existing.decidedByAdminUserId = adminUserId;
        existing.decidedAt = new Date();
      } else {
        em.persist(
          em.create(BiddingAllocationResult, {
            campaignId,
            receiptId: item.receiptId,
            outcome: item.outcome,
            allocatedQty: item.allocatedQty ?? 0,
            decidedByAdminUserId: adminUserId,
          }),
        );
      }
      this.applyAllocationToReceipt(receipt, item.outcome);
      out.push({ receiptId: item.receiptId, outcome: item.outcome });
    }
    campaign.status = 'allocated';
    if (this.auditLog) {
      recordAuditFromContext(this.auditLog, em, {
        action: 'bidding.campaign.allocate',
        objectType: 'bidding_campaign',
        objectId: campaignId,
        stateBefore: null,
        stateAfter: { status: 'allocated', count: out.length },
      });
    }
    await em.flush();
    return { campaignStatus: campaign.status, results: out };
  }

  /**
   * Thin convert (Batch D): requires won path + deposit confirmed.
   * Sets status `converted` and keeps `orderId` null until Batch E wires
   * OrderCreationAdmin — trade id is already on the receipt.
   */
  async convertToOrder(receiptId: string, adminUserId: string): Promise<BiddingReceipt> {
    const em = this.emFactory();
    const row = await em.findOne(BidReceipt, { id: receiptId });
    if (!row) {
      throw new HttpError(404, ERROR_CODES.BIDDING_RECEIPT_NOT_FOUND, 'Receipt not found.');
    }
    if (row.status !== 'deposit_confirmed' && row.status !== 'won_pending_fulfilment') {
      throw new HttpError(
        409,
        ERROR_CODES.BIDDING_DEPOSIT_REQUIRED,
        'Receipt must be deposit-confirmed (and won) before convert.',
      );
    }
    const alloc = await em.findOne(BiddingAllocationResult, {
      campaignId: row.campaignId,
      receiptId: row.id,
    });
    if (!alloc || alloc.outcome !== 'won') {
      throw new HttpError(
        409,
        ERROR_CODES.BIDDING_INVALID_TRANSITION,
        'Only a won receipt can convert to an order.',
      );
    }
    if (!row.tradeId) row.tradeId = `TRD-${randomUUID().slice(0, 8).toUpperCase()}`;
    row.status = 'converted';
    // orderId stays null in Batch D thin path — Batch E creates the Order row.
    if (this.auditLog) {
      recordAuditFromContext(this.auditLog, em, {
        action: 'bidding.receipt.convert',
        objectType: 'bid_receipt',
        objectId: row.id,
        stateBefore: null,
        stateAfter: {
          status: 'converted',
          tradeId: row.tradeId,
          by: adminUserId,
          orderId: null,
        },
      });
    }
    await em.flush();
    return toReceiptDto(row, false);
  }

  private applyAllocationToReceipt(receipt: BidReceipt, outcome: BiddingAllocationOutcome): void {
    if (outcome === 'lost') {
      receipt.status = 'lost';
      return;
    }
    if (outcome === 'won' && receipt.status === 'deposit_confirmed') {
      receipt.status = 'won_pending_fulfilment';
    }
    // waitlist / won-before-deposit: allocation row is the source of truth; receipt stays.
  }

  private async decide(
    receiptId: string,
    adminUserId: string,
    step: ApproveBidReceiptRequest['step'],
    decision: 'approve' | 'reject',
    note?: string,
  ): Promise<BiddingReceipt> {
    const em = this.emFactory();
    const row = await em.findOne(BidReceipt, { id: receiptId });
    if (!row) {
      throw new HttpError(404, ERROR_CODES.BIDDING_RECEIPT_NOT_FOUND, 'Receipt not found.');
    }
    if (decision === 'reject') {
      const stepRow = em.create(BidApprovalStepRow, {
        receiptId: row.id,
        step,
        actorAdminUserId: adminUserId,
        decision: 'reject',
        note: note ?? null,
      });
      em.persist(stepRow);
      row.status = 'rejected';
      await em.flush();
      return toReceiptDto(row, false);
    }

    // approve
    if (step === 'ops') {
      if (row.status !== 'submitted' && row.status !== 'ops_review') {
        throw new HttpError(409, ERROR_CODES.BIDDING_STEP_REQUIRED, 'Ops step not expected.');
      }
      row.status = 'sales_review';
    } else if (step === 'sales') {
      if (row.status !== 'sales_review') {
        throw new HttpError(
          409,
          ERROR_CODES.BIDDING_STEP_REQUIRED,
          row.status === 'submitted'
            ? 'Ops approval required first.'
            : 'Sales step not expected.',
        );
      }
      row.status = 'await_deposit';
    } else if (step === 'legal') {
      if (row.status !== 'sales_review' && row.status !== 'legal_review') {
        throw new HttpError(409, ERROR_CODES.BIDDING_STEP_REQUIRED, 'Legal step not expected.');
      }
      row.status = 'await_deposit';
    } else if (step === 'finance_deposit') {
      return this.confirmDeposit(receiptId, adminUserId);
    } else {
      throw new HttpError(422, ERROR_CODES.VALIDATION_FAILED, 'Unknown approval step.');
    }

    const stepRow = em.create(BidApprovalStepRow, {
      receiptId: row.id,
      step,
      actorAdminUserId: adminUserId,
      decision: 'approve',
      note: note ?? null,
    });
    em.persist(stepRow);
    if (this.auditLog) {
      recordAuditFromContext(this.auditLog, em, {
        action: 'bidding.receipt.approve',
        objectType: 'bid_receipt',
        objectId: row.id,
        stateBefore: null,
        stateAfter: { step, status: row.status },
      });
    }
    await em.flush();
    return toReceiptDto(row, false);
  }
}
