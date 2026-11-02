import { Entity, Index, OptionalProps, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import type { BiddingReceiptStatus } from '@endora-commerce/contracts';
import { OrgScoped } from '@endora-commerce/platform/tenancy';
import { randomUUID } from 'crypto';

/**
 * BidReceipt — one Organization's sealed submission (feature 165).
 * Peer prices stay sealed until the campaign is closed for bids / allocated.
 */
@OrgScoped()
@Entity({ tableName: 'bid_receipts' })
@Unique({ properties: ['campaignId', 'organizationId'], name: 'bid_receipt_campaign_org_unique' })
export class BidReceipt {
  [OptionalProps]?:
    | 'id'
    | 'status'
    | 'bidUnitPrice'
    | 'bidQty'
    | 'attachmentAssetIds'
    | 'tradeId'
    | 'orderId'
    | 'createdAt'
    | 'updatedAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Property({ type: 'uuid' })
  @Index()
  campaignId!: string;

  @Property({ type: 'uuid' })
  @Index()
  organizationId!: string;

  @Property({ type: 'uuid' })
  ruleVersionId!: string;

  @Property({ type: 'text' })
  status: BiddingReceiptStatus = 'submitted';

  @Property({ type: 'numeric', precision: 18, scale: 4, nullable: true })
  bidUnitPrice?: string | null;

  @Property({ type: 'int', nullable: true })
  bidQty?: number | null;

  @Property({ type: 'json' })
  attachmentAssetIds: string[] = [];

  @Property({ type: 'text', nullable: true })
  tradeId?: string | null;

  @Property({ type: 'uuid', nullable: true })
  orderId?: string | null;

  @Property({ type: 'datetime', onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ type: 'datetime', onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
