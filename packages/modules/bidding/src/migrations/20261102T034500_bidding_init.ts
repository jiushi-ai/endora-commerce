import { Migration } from '@mikro-orm/migrations';

/**
 * Bidding domain tables (feature 165 / Batch D).
 *
 * Campaigns and rule versions are platform-global; receipts are org-scoped;
 * approval steps follow the receipt transitively; allocation results are global.
 */
export class Migration20261102T034500BiddingInit extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table "bidding_campaigns" (
        "id" uuid not null,
        "code" text not null,
        "title" text not null,
        "status" text not null default 'draft',
        "product_variant_id" uuid not null,
        "qty" int not null,
        "sales_channel_id" uuid not null,
        "audience" jsonb not null default '{"organizationIds":[],"customerGroupIds":[]}',
        "opens_at" timestamptz not null,
        "closes_at" timestamptz not null,
        "current_rule_version_id" uuid null,
        "intent_template_asset_id" uuid null,
        "created_by_admin_user_id" uuid not null,
        "created_at" timestamptz not null,
        "updated_at" timestamptz not null,
        constraint "bidding_campaigns_pkey" primary key ("id"),
        constraint "bidding_campaigns_code_unique" unique ("code")
      );
    `);
    this.addSql(
      `create index "bidding_campaigns_sales_channel_id_index" on "bidding_campaigns" ("sales_channel_id");`,
    );

    this.addSql(`
      create table "bidding_campaign_rule_versions" (
        "id" uuid not null,
        "campaign_id" uuid not null,
        "version" int not null,
        "min_unit_price" numeric(18,4) not null,
        "currency" text not null,
        "max_qty_per_org" int not null,
        "min_qty" int not null default 1,
        "deposit_percent" real null,
        "deposit_amount" numeric(18,2) null,
        "payload_json" jsonb not null default '{}',
        "created_at" timestamptz not null,
        constraint "bidding_campaign_rule_versions_pkey" primary key ("id"),
        constraint "bidding_rule_version_unique" unique ("campaign_id", "version")
      );
    `);
    this.addSql(
      `create index "bidding_campaign_rule_versions_campaign_id_index" on "bidding_campaign_rule_versions" ("campaign_id");`,
    );

    this.addSql(`
      create table "bid_receipts" (
        "id" uuid not null,
        "campaign_id" uuid not null,
        "organization_id" uuid not null,
        "rule_version_id" uuid not null,
        "status" text not null default 'submitted',
        "bid_unit_price" numeric(18,4) null,
        "bid_qty" int null,
        "attachment_asset_ids" jsonb not null default '[]',
        "trade_id" text null,
        "order_id" uuid null,
        "created_at" timestamptz not null,
        "updated_at" timestamptz not null,
        constraint "bid_receipts_pkey" primary key ("id"),
        constraint "bid_receipt_campaign_org_unique" unique ("campaign_id", "organization_id")
      );
    `);
    this.addSql(`create index "bid_receipts_campaign_id_index" on "bid_receipts" ("campaign_id");`);
    this.addSql(
      `create index "bid_receipts_organization_id_index" on "bid_receipts" ("organization_id");`,
    );

    this.addSql(`
      create table "bid_approval_steps" (
        "id" uuid not null,
        "receipt_id" uuid not null,
        "step" text not null,
        "actor_admin_user_id" uuid not null,
        "decided_at" timestamptz not null,
        "decision" text not null,
        "note" text null,
        constraint "bid_approval_steps_pkey" primary key ("id")
      );
    `);
    this.addSql(
      `create index "bid_approval_steps_receipt_id_index" on "bid_approval_steps" ("receipt_id");`,
    );

    this.addSql(`
      create table "bidding_allocation_results" (
        "id" uuid not null,
        "campaign_id" uuid not null,
        "receipt_id" uuid not null,
        "outcome" text not null,
        "allocated_qty" int not null default 0,
        "decided_by_admin_user_id" uuid not null,
        "decided_at" timestamptz not null,
        constraint "bidding_allocation_results_pkey" primary key ("id"),
        constraint "bidding_allocation_unique" unique ("campaign_id", "receipt_id")
      );
    `);
    this.addSql(
      `create index "bidding_allocation_results_campaign_id_index" on "bidding_allocation_results" ("campaign_id");`,
    );
    this.addSql(
      `create index "bidding_allocation_results_receipt_id_index" on "bidding_allocation_results" ("receipt_id");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "bidding_allocation_results" cascade;`);
    this.addSql(`drop table if exists "bid_approval_steps" cascade;`);
    this.addSql(`drop table if exists "bid_receipts" cascade;`);
    this.addSql(`drop table if exists "bidding_campaign_rule_versions" cascade;`);
    this.addSql(`drop table if exists "bidding_campaigns" cascade;`);
  }
}
