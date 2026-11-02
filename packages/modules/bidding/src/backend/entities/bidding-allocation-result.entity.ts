import { Entity, Index, OptionalProps, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import type { BiddingAllocationOutcome } from '@endora-commerce/contracts';
import { GlobalEntity } from '@endora-commerce/platform/tenancy';
import { randomUUID } from 'crypto';

/**
 * Allocation outcome for one receipt on a campaign (won / lost / waitlist).
 */
@GlobalEntity()
@Entity({ tableName: 'bidding_allocation_results' })
@Unique({ properties: ['campaignId', 'receiptId'], name: 'bidding_allocation_unique' })
export class BiddingAllocationResult {
  [OptionalProps]?: 'id' | 'allocatedQty' | 'decidedAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Property({ type: 'uuid' })
  @Index()
  campaignId!: string;

  @Property({ type: 'uuid' })
  @Index()
  receiptId!: string;

  @Property({ type: 'text' })
  outcome!: BiddingAllocationOutcome;

  @Property({ type: 'int' })
  allocatedQty: number = 0;

  @Property({ type: 'uuid' })
  decidedByAdminUserId!: string;

  @Property({ type: 'datetime', onCreate: () => new Date() })
  decidedAt: Date = new Date();
}
