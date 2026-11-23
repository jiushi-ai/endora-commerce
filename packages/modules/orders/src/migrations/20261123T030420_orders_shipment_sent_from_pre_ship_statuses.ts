import { Migration } from '@mikro-orm/migrations';

/**
 * Batch 59 — allow Mark success / receive to move an order to `shipment_sent`
 * from early lifecycle statuses (`new`, `pending`, `paid`, `processing`).
 *
 * Offline shops often leave credit / bank-transfer orders on `new` until a
 * person marks the shipment successful. Without these edges the shipment row
 * becomes `success` while the order stays put, so the buyer never sees
 * confirm-receipt (`shipment_sent` → `completed`).
 *
 * `DEFAULT_EXPLICIT_TRANSITIONS` gains the same pairs for a fresh install; this
 * migration gives them to a graph that already exists. Idempotent on the unique
 * pair constraint — an operator-added edge is kept as they made it.
 *
 * `shipment_ready → shipment_sent` is already in the default seed.
 */
export class Migration20261123T030420OrdersShipmentSentFromPreShipStatuses extends Migration {
  override async up(): Promise<void> {
    for (const from of ['new', 'pending', 'paid', 'processing'] as const) {
      this.addSql(`
        insert into "order_status_transitions" ("id", "from_status_code", "to_status_code", "is_system", "created_at")
        values (gen_random_uuid(), '${from}', 'shipment_sent', false, now())
        on conflict ("from_status_code", "to_status_code") do nothing;
      `);
    }
  }

  override async down(): Promise<void> {
    for (const from of ['new', 'pending', 'paid', 'processing'] as const) {
      this.addSql(`
        delete from "order_status_transitions"
        where "from_status_code" = '${from}' and "to_status_code" = 'shipment_sent' and "is_system" = false;
      `);
    }
  }
}
