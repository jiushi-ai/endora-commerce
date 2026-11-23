import { Migration } from '@mikro-orm/migrations';

/**
 * Batch 61 — buyer confirm-receipt stamps the shipment attempt.
 *
 * - `status` gains `received` (after `success` / Dispatched).
 * - `customer_confirmed_at` records when the buyer clicked confirm receipt.
 */
export class Migration20261123T083236ShipmentsStatusReceivedAndCustomerConfirmedAt extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "shipments" drop constraint if exists "shipments_status_check";`);
    this.addSql(
      `alter table "shipments" add constraint "shipments_status_check" ` +
        `check ("status" in ('pending', 'pending_manual', 'success', 'received', 'failure'));`,
    );
    this.addSql(
      `alter table "shipments" add column "customer_confirmed_at" timestamptz null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `update "shipments" set "status" = 'success' where "status" = 'received';`,
    );
    this.addSql(`alter table "shipments" drop column if exists "customer_confirmed_at";`);
    this.addSql(`alter table "shipments" drop constraint if exists "shipments_status_check";`);
    this.addSql(
      `alter table "shipments" add constraint "shipments_status_check" ` +
        `check ("status" in ('pending', 'pending_manual', 'success', 'failure'));`,
    );
  }
}
