import { Entity, Index, OptionalProps, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { GlobalEntity } from '@endora-commerce/platform/tenancy';
import { randomUUID } from 'crypto';
import type { OrganizationStaffKind } from '@endora-commerce/contracts';

/**
 * OrganizationStaffAssignment — multi-kind org owners for Mobii (feature 165).
 *
 * Kinds: `ops` | `sales` | `after_sales`. Deliberately **separate** from
 * `organization_sales_rep_assignments`, which RFQ sales-rep scope still uses.
 *
 * PRO note: Admin UI for editing these rows is deferred; Batch C ships API +
 * service only.
 */
@GlobalEntity()
@Entity({ tableName: 'organization_staff_assignments' })
@Unique({ properties: ['organizationId', 'adminUserId', 'kind'], name: 'org_staff_unique' })
export class OrganizationStaffAssignment {
  [OptionalProps]?: 'id' | 'createdAt' | 'assignedByAdminUserId';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Property({ type: 'uuid' })
  @Index()
  organizationId!: string;

  @Property({ type: 'uuid' })
  @Index()
  adminUserId!: string;

  @Property({ type: 'text' })
  kind!: OrganizationStaffKind;

  @Property({ type: 'uuid', nullable: true })
  assignedByAdminUserId?: string | null;

  @Property({ type: 'datetime', onCreate: () => new Date() })
  createdAt: Date = new Date();
}
