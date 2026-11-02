import { Entity, Index, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';
import type { BiddingApprovalDecision, BiddingApprovalStep } from '@endora-commerce/contracts';
import { TransitivelyScoped } from '@endora-commerce/platform/tenancy';
import { randomUUID } from 'crypto';

/**
 * One recorded approval/reject decision on a BidReceipt.
 * Tenant reach follows the receipt (Organization).
 */
@TransitivelyScoped('BidReceipt', 'receiptId')
@Entity({ tableName: 'bid_approval_steps' })
export class BidApprovalStepRow {
  [OptionalProps]?: 'id' | 'note' | 'decidedAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Property({ type: 'uuid' })
  @Index()
  receiptId!: string;

  @Property({ type: 'text' })
  step!: BiddingApprovalStep;

  @Property({ type: 'uuid' })
  actorAdminUserId!: string;

  @Property({ type: 'datetime', onCreate: () => new Date() })
  decidedAt: Date = new Date();

  @Property({ type: 'text' })
  decision!: BiddingApprovalDecision;

  @Property({ type: 'text', nullable: true })
  note?: string | null;
}
