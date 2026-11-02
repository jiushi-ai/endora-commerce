import { Migration } from '@mikro-orm/migrations';

/**
 * `organization_staff_assignments` — multi-kind org owners (feature 165 / Batch C).
 *
 * Distinct from `organization_sales_rep_assignments` (RFQ scope). Unique on
 * (organization_id, admin_user_id, kind).
 */
export class Migration20261102T014300OrganizationsStaffAssignments extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table "organization_staff_assignments" (
        "id" uuid not null,
        "organization_id" uuid not null,
        "admin_user_id" uuid not null,
        "kind" text not null,
        "assigned_by_admin_user_id" uuid null,
        "created_at" timestamptz not null,
        constraint "organization_staff_assignments_pkey" primary key ("id"),
        constraint "org_staff_unique" unique ("organization_id", "admin_user_id", "kind")
      );
    `);
    this.addSql(
      `create index "org_staff_admin_user_idx" on "organization_staff_assignments" ("admin_user_id");`,
    );
    this.addSql(
      `create index "org_staff_organization_idx" on "organization_staff_assignments" ("organization_id");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "organization_staff_assignments" cascade;`);
  }
}
