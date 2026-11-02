import type { FastifyInstance } from 'fastify';
import {
  ERROR_CODES,
  assignOrganizationStaffRequestSchema,
  organizationStaffKindSchema,
  type AdminUserReadPort,
  type OrganizationStaffAssignmentPort,
} from '@endora-commerce/contracts';
import type { EntityManager } from '@mikro-orm/postgresql';
import { HttpError } from '@endora-commerce/platform/http';
import { getTenantContext } from '@endora-commerce/platform/tenancy';
import type { RequireAdminFactory } from '@endora-commerce/platform/kernel';
import { Organization } from './entities/organization.entity.js';

/**
 * Multi-kind org staff assignment routes (feature 165 / Batch C / T2).
 *
 * Gated by the existing `organizations:assign-sales-rep` code so Batch C can
 * ship API + service without a new permission inventory row. Admin UI for
 * these endpoints is deferred (PRO Batch C note).
 *
 * Does not touch `organization_sales_rep_assignments` / RFQ scope.
 */

export interface StaffAssignmentRoutesDeps {
  emFactory: () => EntityManager;
  requireAdmin: RequireAdminFactory;
  staffAssignment: OrganizationStaffAssignmentPort;
  adminUsers: AdminUserReadPort;
}

function requireUnscopedActor(): void {
  const ctx = getTenantContext();
  if (!ctx || ctx.mode !== 'all') {
    throw new HttpError(
      403,
      ERROR_CODES.FORBIDDEN,
      'Only a platform administrator can change organization staff assignments.',
    );
  }
}

function actorAdminUserId(request: {
  actor?: { kind?: string; adminUserId?: string };
  testActor?: { kind?: string; adminUserId?: string };
}): string | null {
  if (request.actor?.kind === 'admin') return request.actor.adminUserId ?? null;
  if (request.testActor?.kind === 'admin') return request.testActor.adminUserId ?? null;
  return null;
}

export async function registerOrganizationStaffAssignmentRoutes(
  app: FastifyInstance,
  deps: StaffAssignmentRoutesDeps,
): Promise<void> {
  const { emFactory, requireAdmin, staffAssignment, adminUsers } = deps;
  const guard = requireAdmin('organizations:assign-sales-rep');

  app.get<{ Params: { organizationId: string }; Querystring: { kind?: string } }>(
    '/api/v1/admin/organizations/:organizationId/staff-assignments',
    { preHandler: guard },
    async (request) => {
      const em = emFactory();
      const org = await em.findOne(Organization, { id: request.params.organizationId });
      if (!org) throw new HttpError(404, ERROR_CODES.NOT_FOUND, 'Organization not found.');
      const kind =
        request.query.kind !== undefined
          ? organizationStaffKindSchema.parse(request.query.kind)
          : undefined;
      const assignments = await staffAssignment.listForOrganization(org.id, kind);
      const adminIds = [...new Set(assignments.map((a) => a.adminUserId))];
      const admins = adminIds.length > 0 ? await adminUsers.findByIds(adminIds) : [];
      const adminById = new Map(admins.map((a) => [a.id, a]));
      return {
        data: assignments.map((a) => {
          const u = adminById.get(a.adminUserId);
          return {
            id: a.id,
            organizationId: a.organizationId,
            adminUserId: a.adminUserId,
            kind: a.kind,
            displayName: u ? `${u.firstName} ${u.lastName}` : 'Unknown',
            email: u?.email ?? '',
            assignedAt: a.createdAt.toISOString(),
            assignedByAdminUserId: a.assignedByAdminUserId ?? null,
          };
        }),
      };
    },
  );

  app.post<{ Params: { organizationId: string } }>(
    '/api/v1/admin/organizations/:organizationId/staff-assignments',
    { preHandler: guard, schema: { body: assignOrganizationStaffRequestSchema } },
    async (request, reply) => {
      requireUnscopedActor();
      const body = assignOrganizationStaffRequestSchema.parse(request.body);
      const em = emFactory();
      const org = await em.findOne(Organization, { id: request.params.organizationId });
      if (!org) throw new HttpError(404, ERROR_CODES.NOT_FOUND, 'Organization not found.');
      const adminUser = await adminUsers.findById(body.adminUserId);
      if (!adminUser) {
        throw new HttpError(404, ERROR_CODES.NOT_FOUND, 'Admin user not found.');
      }
      const created = await staffAssignment.upsert({
        organizationId: org.id,
        adminUserId: adminUser.id,
        kind: body.kind,
        assignedByAdminUserId: actorAdminUserId(request),
      });
      reply.code(201);
      return {
        data: {
          id: created.id,
          organizationId: created.organizationId,
          adminUserId: created.adminUserId,
          kind: created.kind,
          displayName: `${adminUser.firstName} ${adminUser.lastName}`,
          email: adminUser.email,
          assignedAt: created.createdAt.toISOString(),
          assignedByAdminUserId: created.assignedByAdminUserId ?? null,
        },
      };
    },
  );

  app.delete<{
    Params: { organizationId: string; adminUserId: string; kind: string };
  }>(
    '/api/v1/admin/organizations/:organizationId/staff-assignments/:adminUserId/:kind',
    { preHandler: guard },
    async (request, reply) => {
      requireUnscopedActor();
      const kind = organizationStaffKindSchema.parse(request.params.kind);
      const removed = await staffAssignment.unassign({
        organizationId: request.params.organizationId,
        adminUserId: request.params.adminUserId,
        kind,
      });
      if (!removed) {
        throw new HttpError(404, ERROR_CODES.NOT_FOUND, 'Assignment not found.');
      }
      reply.code(204);
      return null;
    },
  );
}
