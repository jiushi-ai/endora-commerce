import { describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import type { EntityManager } from '@mikro-orm/postgresql';
import type { OrganizationStaffKind } from '@endora-commerce/contracts';
import { Organization } from '../entities/organization.entity.js';
import { OrganizationStaffAssignment } from '../entities/organization-staff-assignment.entity.js';
import { OrganizationStaffAssignmentService } from './staff-assignment-service.js';

/**
 * Upsert uniqueness for (organizationId, adminUserId, kind) — Batch C / T2.
 * Fake EntityManager: the subject is the service's uniqueness decision.
 */

interface StoredAssignment {
  id: string;
  organizationId: string;
  adminUserId: string;
  kind: OrganizationStaffKind;
  assignedByAdminUserId: string | null;
  createdAt: Date;
}

function fakeEmFactory(opts: {
  org: { id: string; isPersonal: boolean };
  rows: StoredAssignment[];
}): () => EntityManager {
  const { org, rows } = opts;
  return () =>
    ({
      findOne: async (entity: unknown, where: Record<string, unknown>) => {
        if (entity === Organization) {
          return where.id === org.id ? org : null;
        }
        if (entity === OrganizationStaffAssignment) {
          return (
            rows.find(
              (r) =>
                r.organizationId === where.organizationId &&
                r.adminUserId === where.adminUserId &&
                r.kind === where.kind,
            ) ?? null
          );
        }
        return null;
      },
      create: (_entity: unknown, data: Omit<StoredAssignment, 'id' | 'createdAt'>) => {
        const row: StoredAssignment = {
          id: randomUUID(),
          createdAt: new Date(),
          ...data,
        };
        return row;
      },
      persist: (row: StoredAssignment) => {
        rows.push(row);
      },
      flush: async () => undefined,
      find: async (_entity: unknown, where: { organizationId: string; kind?: OrganizationStaffKind }) =>
        rows.filter(
          (r) =>
            r.organizationId === where.organizationId &&
            (where.kind === undefined || r.kind === where.kind),
        ),
      removeAndFlush: async (row: StoredAssignment) => {
        const idx = rows.indexOf(row);
        if (idx >= 0) rows.splice(idx, 1);
      },
    }) as unknown as EntityManager;
}

describe('OrganizationStaffAssignmentService upsert uniqueness', () => {
  it('returns the existing row when org+admin+kind is upserted twice', async () => {
    const rows: StoredAssignment[] = [];
    const service = new OrganizationStaffAssignmentService(
      fakeEmFactory({ org: { id: 'org-1', isPersonal: false }, rows }),
    );

    const first = await service.upsert({
      organizationId: 'org-1',
      adminUserId: 'admin-1',
      kind: 'ops',
      assignedByAdminUserId: 'actor-1',
    });
    const second = await service.upsert({
      organizationId: 'org-1',
      adminUserId: 'admin-1',
      kind: 'ops',
      assignedByAdminUserId: 'actor-2',
    });

    expect(second.id).toBe(first.id);
    expect(rows).toHaveLength(1);
  });

  it('allows the same admin under a different kind on the same org', async () => {
    const rows: StoredAssignment[] = [];
    const service = new OrganizationStaffAssignmentService(
      fakeEmFactory({ org: { id: 'org-1', isPersonal: false }, rows }),
    );

    await service.upsert({ organizationId: 'org-1', adminUserId: 'admin-1', kind: 'ops' });
    await service.upsert({ organizationId: 'org-1', adminUserId: 'admin-1', kind: 'sales' });

    expect(rows).toHaveLength(2);
  });
});
