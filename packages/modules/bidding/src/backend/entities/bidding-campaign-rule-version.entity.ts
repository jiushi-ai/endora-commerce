import { Entity, Index, OptionalProps, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { GlobalEntity } from '@endora-commerce/platform/tenancy';
import { randomUUID } from 'crypto';

/**
 * Immutable rule snapshot frozen on campaign publish (G-C2).
 */
@GlobalEntity()
@Entity({ tableName: 'bidding_campaign_rule_versions' })
@Unique({ properties: ['campaignId', 'version'], name: 'bidding_rule_version_unique' })
export class BiddingCampaignRuleVersion {
  [OptionalProps]?:
    | 'id'
    | 'depositPercent'
    | 'depositAmount'
    | 'payloadJson'
    | 'minQty'
    | 'createdAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Property({ type: 'uuid' })
  @Index()
  campaignId!: string;

  @Property({ type: 'int' })
  version!: number;

  @Property({ type: 'numeric', precision: 18, scale: 4 })
  minUnitPrice!: string;

  @Property({ type: 'text' })
  currency!: string;

  @Property({ type: 'int' })
  maxQtyPerOrg!: number;

  @Property({ type: 'int' })
  minQty: number = 1;

  @Property({ type: 'float', nullable: true })
  depositPercent?: number | null;

  @Property({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  depositAmount?: string | null;

  @Property({ type: 'json' })
  payloadJson: Record<string, unknown> = {};

  @Property({ type: 'datetime', onCreate: () => new Date() })
  createdAt: Date = new Date();
}
