import { Entity, Index, OptionalProps, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import type { BiddingAudience, BiddingCampaignStatus } from '@endora-commerce/contracts';
import { GlobalEntity } from '@endora-commerce/platform/tenancy';
import { randomUUID } from 'crypto';

/**
 * BiddingCampaign — platform-scoped scarce-stock event (feature 165).
 */
@GlobalEntity()
@Entity({ tableName: 'bidding_campaigns' })
export class BiddingCampaign {
  [OptionalProps]?:
    | 'id'
    | 'status'
    | 'currentRuleVersionId'
    | 'intentTemplateAssetId'
    | 'createdAt'
    | 'updatedAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Property({ type: 'text' })
  @Unique()
  code!: string;

  @Property({ type: 'text' })
  title!: string;

  @Property({ type: 'text' })
  status: BiddingCampaignStatus = 'draft';

  @Property({ type: 'uuid' })
  productVariantId!: string;

  @Property({ type: 'int' })
  qty!: number;

  @Property({ type: 'uuid' })
  @Index()
  salesChannelId!: string;

  @Property({ type: 'json' })
  audience: BiddingAudience = { organizationIds: [], customerGroupIds: [] };

  @Property({ type: 'datetime' })
  opensAt!: Date;

  @Property({ type: 'datetime' })
  closesAt!: Date;

  @Property({ type: 'uuid', nullable: true })
  currentRuleVersionId?: string | null;

  @Property({ type: 'uuid', nullable: true })
  intentTemplateAssetId?: string | null;

  @Property({ type: 'uuid' })
  createdByAdminUserId!: string;

  @Property({ type: 'datetime', onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ type: 'datetime', onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
