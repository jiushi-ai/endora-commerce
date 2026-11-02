import type {
  BiddingAudience,
  BiddingCampaign,
  BiddingRuleVersion,
} from '@endora-commerce/contracts';
import type { BiddingCampaign as CampaignEntity } from '../entities/bidding-campaign.entity.js';
import type { BiddingCampaignRuleVersion } from '../entities/bidding-campaign-rule-version.entity.js';

export function toCampaignDto(row: CampaignEntity): BiddingCampaign {
  const audience = (row.audience ?? {
    organizationIds: [],
    customerGroupIds: [],
  }) as BiddingAudience;
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    status: row.status,
    productVariantId: row.productVariantId,
    qty: row.qty,
    salesChannelId: row.salesChannelId,
    audience: {
      organizationIds: audience.organizationIds ?? [],
      customerGroupIds: audience.customerGroupIds ?? [],
    },
    opensAt: row.opensAt.toISOString(),
    closesAt: row.closesAt.toISOString(),
    currentRuleVersionId: row.currentRuleVersionId ?? null,
    intentTemplateAssetId: row.intentTemplateAssetId ?? null,
    createdByAdminUserId: row.createdByAdminUserId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toRuleVersionDto(row: BiddingCampaignRuleVersion): BiddingRuleVersion {
  return {
    id: row.id,
    campaignId: row.campaignId,
    version: row.version,
    minUnitPrice: String(row.minUnitPrice),
    currency: row.currency,
    maxQtyPerOrg: row.maxQtyPerOrg,
    minQty: row.minQty,
    depositPercent: row.depositPercent ?? null,
    depositAmount: row.depositAmount != null ? String(row.depositAmount) : null,
    payloadJson: row.payloadJson ?? {},
    createdAt: row.createdAt.toISOString(),
  };
}
