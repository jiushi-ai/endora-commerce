import type { EntityManager } from '@mikro-orm/postgresql';
import {
  ERROR_CODES,
  type BiddingCampaign,
  type BiddingCampaignDetail,
  type CreateBiddingCampaignRequest,
  type UpdateBiddingCampaignRequest,
} from '@endora-commerce/contracts';
import { HttpError } from '@endora-commerce/platform/http';
import { recordAuditFromContext } from '@endora-commerce/platform/commands';
import type { AuditPort } from '@endora-commerce/platform/kernel';
import { BiddingCampaign as CampaignEntity } from '../entities/bidding-campaign.entity.js';
import { BiddingCampaignRuleVersion } from '../entities/bidding-campaign-rule-version.entity.js';
import { toCampaignDto, toRuleVersionDto } from './campaign-mapper.js';

/**
 * Campaign lifecycle: draft → publish (freeze rules) → close-bids → allocate.
 */
export class BiddingCampaignService {
  constructor(
    private readonly emFactory: () => EntityManager,
    private readonly auditLog?: AuditPort,
  ) {}

  async list(): Promise<BiddingCampaign[]> {
    const em = this.emFactory();
    const rows = await em.find(CampaignEntity, {}, { orderBy: { createdAt: 'DESC' } });
    return rows.map(toCampaignDto);
  }

  async getById(id: string): Promise<BiddingCampaign> {
    const detail = await this.getDetailById(id);
    return detail.campaign;
  }

  /** Campaign + latest rule (frozen `currentRuleVersionId`, else newest draft version). */
  async getDetailById(id: string): Promise<BiddingCampaignDetail> {
    const em = this.emFactory();
    const row = await em.findOne(CampaignEntity, { id });
    if (!row) {
      throw new HttpError(404, ERROR_CODES.BIDDING_CAMPAIGN_NOT_FOUND, 'Campaign not found.');
    }
    let ruleRow: BiddingCampaignRuleVersion | null = null;
    if (row.currentRuleVersionId) {
      ruleRow = await em.findOne(BiddingCampaignRuleVersion, { id: row.currentRuleVersionId });
    }
    if (!ruleRow) {
      ruleRow = await em.findOne(
        BiddingCampaignRuleVersion,
        { campaignId: id },
        { orderBy: { version: 'DESC' } },
      );
    }
    return {
      campaign: toCampaignDto(row),
      rules: ruleRow ? toRuleVersionDto(ruleRow) : null,
    };
  }

  async create(input: CreateBiddingCampaignRequest, adminUserId: string): Promise<BiddingCampaign> {
    if (new Date(input.closesAt) <= new Date(input.opensAt)) {
      throw new HttpError(
        422,
        ERROR_CODES.VALIDATION_FAILED,
        'closesAt must be after opensAt.',
      );
    }
    const em = this.emFactory();
    const existing = await em.findOne(CampaignEntity, { code: input.code });
    if (existing) {
      throw new HttpError(409, ERROR_CODES.BIDDING_CODE_CONFLICT, 'Campaign code already exists.');
    }
    const row = em.create(CampaignEntity, {
      code: input.code,
      title: input.title,
      status: 'draft',
      productVariantId: input.productVariantId,
      qty: input.qty,
      salesChannelId: input.salesChannelId,
      audience: input.audience,
      opensAt: new Date(input.opensAt),
      closesAt: new Date(input.closesAt),
      intentTemplateAssetId: input.intentTemplateAssetId ?? null,
      createdByAdminUserId: adminUserId,
    });
    em.persist(row);
    await em.flush();
    await this.persistPendingRules(em, row.id, input.rules, /* replaceLatestDraft */ false);

    if (this.auditLog) {
      recordAuditFromContext(this.auditLog, em, {
        action: 'bidding.campaign.create',
        objectType: 'bidding_campaign',
        objectId: row.id,
        stateBefore: null,
        stateAfter: { code: row.code, status: row.status },
      });
      await em.flush();
    }
    return toCampaignDto(row);
  }

  async update(id: string, input: UpdateBiddingCampaignRequest): Promise<BiddingCampaign> {
    const em = this.emFactory();
    const row = await em.findOne(CampaignEntity, { id });
    if (!row) {
      throw new HttpError(404, ERROR_CODES.BIDDING_CAMPAIGN_NOT_FOUND, 'Campaign not found.');
    }
    if (row.status !== 'draft') {
      throw new HttpError(
        409,
        ERROR_CODES.BIDDING_INVALID_TRANSITION,
        'Only a draft campaign can be edited.',
      );
    }
    if (input.code !== undefined) row.code = input.code;
    if (input.title !== undefined) row.title = input.title;
    if (input.productVariantId !== undefined) row.productVariantId = input.productVariantId;
    if (input.qty !== undefined) row.qty = input.qty;
    if (input.salesChannelId !== undefined) row.salesChannelId = input.salesChannelId;
    if (input.audience !== undefined) row.audience = input.audience;
    if (input.opensAt !== undefined) row.opensAt = new Date(input.opensAt);
    if (input.closesAt !== undefined) row.closesAt = new Date(input.closesAt);
    if (input.intentTemplateAssetId !== undefined) {
      row.intentTemplateAssetId = input.intentTemplateAssetId;
    }
    if (input.rules !== undefined) {
      await this.persistPendingRules(em, row.id, input.rules, true);
    }
    if (this.auditLog) {
      recordAuditFromContext(this.auditLog, em, {
        action: 'bidding.campaign.update',
        objectType: 'bidding_campaign',
        objectId: row.id,
        stateBefore: null,
        stateAfter: { code: row.code },
      });
    }
    await em.flush();
    return toCampaignDto(row);
  }

  /**
   * Publish: freeze the latest draft rule version (or create v1 from stored
   * draft rules), set status published (G-C2).
   */
  async publish(id: string): Promise<BiddingCampaign> {
    const em = this.emFactory();
    const row = await em.findOne(CampaignEntity, { id });
    if (!row) {
      throw new HttpError(404, ERROR_CODES.BIDDING_CAMPAIGN_NOT_FOUND, 'Campaign not found.');
    }
    if (row.status !== 'draft') {
      throw new HttpError(
        409,
        ERROR_CODES.BIDDING_INVALID_TRANSITION,
        'Only a draft campaign can be published.',
      );
    }
    const draftRule = await em.findOne(
      BiddingCampaignRuleVersion,
      { campaignId: id },
      { orderBy: { version: 'DESC' } },
    );
    if (!draftRule) {
      throw new HttpError(
        422,
        ERROR_CODES.BIDDING_RULE_REQUIRED,
        'Campaign has no rule version to freeze.',
      );
    }
    row.currentRuleVersionId = draftRule.id;
    row.status = 'published';
    if (this.auditLog) {
      recordAuditFromContext(this.auditLog, em, {
        action: 'bidding.campaign.publish',
        objectType: 'bidding_campaign',
        objectId: row.id,
        stateBefore: { status: 'draft' },
        stateAfter: { status: 'published', ruleVersionId: draftRule.id },
      });
    }
    await em.flush();
    return toCampaignDto(row);
  }

  async closeBids(id: string): Promise<BiddingCampaign> {
    const em = this.emFactory();
    const row = await em.findOne(CampaignEntity, { id });
    if (!row) {
      throw new HttpError(404, ERROR_CODES.BIDDING_CAMPAIGN_NOT_FOUND, 'Campaign not found.');
    }
    if (row.status !== 'published') {
      throw new HttpError(
        409,
        ERROR_CODES.BIDDING_INVALID_TRANSITION,
        'Only a published campaign can be closed for bids.',
      );
    }
    row.status = 'closed_for_bids';
    if (this.auditLog) {
      recordAuditFromContext(this.auditLog, em, {
        action: 'bidding.campaign.close_bids',
        objectType: 'bidding_campaign',
        objectId: row.id,
        stateBefore: { status: 'published' },
        stateAfter: { status: 'closed_for_bids' },
      });
    }
    await em.flush();
    return toCampaignDto(row);
  }

  private async persistPendingRules(
    em: EntityManager,
    campaignId: string,
    rules: CreateBiddingCampaignRequest['rules'],
    replaceLatestDraft: boolean,
  ): Promise<BiddingCampaignRuleVersion> {
    const latest = await em.findOne(
      BiddingCampaignRuleVersion,
      { campaignId },
      { orderBy: { version: 'DESC' } },
    );
    if (replaceLatestDraft && latest) {
      latest.minUnitPrice = rules.minUnitPrice;
      latest.currency = rules.currency;
      latest.maxQtyPerOrg = rules.maxQtyPerOrg;
      latest.minQty = rules.minQty ?? 1;
      latest.depositPercent = rules.depositPercent ?? null;
      latest.depositAmount = rules.depositAmount ?? null;
      latest.payloadJson = rules.payloadJson ?? {};
      await em.flush();
      return latest;
    }
    const version = (latest?.version ?? 0) + 1;
    const row = em.create(BiddingCampaignRuleVersion, {
      campaignId,
      version,
      minUnitPrice: rules.minUnitPrice,
      currency: rules.currency,
      maxQtyPerOrg: rules.maxQtyPerOrg,
      minQty: rules.minQty ?? 1,
      depositPercent: rules.depositPercent ?? null,
      depositAmount: rules.depositAmount ?? null,
      payloadJson: rules.payloadJson ?? {},
    });
    em.persist(row);
    await em.flush();
    return row;
  }
}
