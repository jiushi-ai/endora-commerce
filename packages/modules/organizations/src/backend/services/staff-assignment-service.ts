import type { EntityManager } from '@mikro-orm/postgresql';
import {
  ERROR_CODES,
  type OrganizationStaffAssignmentPort,
  type OrganizationStaffAssignmentRow,
  type OrganizationStaffKind,
} from '@endora-commerce/contracts';
import { HttpError } from '@endora-commerce/platform/http';
import { recordAuditFromContext } from '@endora-commerce/platform/commands';
import type { AuditPort } from '@endora-commerce/platform/kernel';
import { Organization } from '../entities/organization.entity.js';
import { OrganizationStaffAssignment } from '../entities/organization-staff-assignment.entity.js';

function toRow(entity: OrganizationStaffAssignment): OrganizationStaffAssignmentRow {
  return {
    id: entity.id,
    organizationId: entity.organizationId,
    adminUserId: entity.adminUserId,
    kind: entity.kind,
    assignedByAdminUserId: entity.assignedByAdminUserId ?? null,
    createdAt: entity.createdAt,
  };
}

/**
 * Multi-kind staff owners on an organization (feature 165 / Batch C).
 *
 * Upsert is unique on (organizationId, adminUserId, kind): a second call with
 * the same triple returns the existing row and writes nothing.
 */
export class OrganizationStaffAssignmentService implements OrganizationStaffAssignmentPort {
  constructor(
    private readonly emFactory: () => EntityManager,
    private readonly auditLog?: AuditPort,
  ) {}

  async listForOrganization(
    organizationId: string,
    kind?: OrganizationStaffKind,
  ): Promise<OrganizationStaffAssignmentRow[]> {
    const em = this.emFactory();
    const where: { organizationId: string; kind?: OrganizationStaffKind } = { organizationId };
    if (kind !== undefined) where.kind = kind;
    const rows = await em.find(OrganizationStaffAssignment, where);
    return rows.map(toRow);
  }

  async upsert(input: {
    organizationId: string;
    adminUserId: string;
    kind: OrganizationStaffKind;
    assignedByAdminUserId?: string | null;
  }): Promise<OrganizationStaffAssignmentRow> {
    const em = this.emFactory();
    const org = await em.findOne(Organization, { id: input.organizationId });
    if (!org) {
      throw new HttpError(404, ERROR_CODES.NOT_FOUND, 'Organization not found.');
    }
    if (org.isPersonal) {
      throw new HttpError(
        422,
        ERROR_CODES.VALIDATION_FAILED,
        'Staff cannot be assigned to a personal (individual) organization.',
      );
    }

    const existing = await em.findOne(OrganizationStaffAssignment, {
      organizationId: input.organizationId,
      adminUserId: input.adminUserId,
      kind: input.kind,
    });
    if (existing) return toRow(existing);

    const row = em.create(OrganizationStaffAssignment, {
      organizationId: input.organizationId,
      adminUserId: input.adminUserId,
      kind: input.kind,
      assignedByAdminUserId: input.assignedByAdminUserId ?? null,
    });
    em.persist(row);
    if (this.auditLog) {
      recordAuditFromContext(this.auditLog, em, {
        action: 'organization.staff_assign',
        objectType: 'organization',
        objectId: input.organizationId,
        stateBefore: null,
        stateAfter: { adminUserId: input.adminUserId, kind: input.kind },
      });
    }
    await em.flush();
    return toRow(row);
  }

  async unassign(input: {
    organizationId: string;
    adminUserId: string;
    kind: OrganizationStaffKind;
  }): Promise<boolean> {
    const em = this.emFactory();
    const existing = await em.findOne(OrganizationStaffAssignment, {
      organizationId: input.organizationId,
      adminUserId: input.adminUserId,
      kind: input.kind,
    });
    if (!existing) return false;
    if (this.auditLog) {
      recordAuditFromContext(this.auditLog, em, {
        action: 'organization.staff_unassign',
        objectType: 'organization',
        objectId: input.organizationId,
        stateBefore: { adminUserId: input.adminUserId, kind: input.kind },
        stateAfter: null,
      });
    }
    await em.removeAndFlush(existing);
    return true;
  }
}
