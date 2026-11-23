import { Migration } from '@mikro-orm/migrations';

/**
 * Batch 60 — seed zh-CN / zh-TW labels on the default order statuses.
 *
 * Admin previously rendered `name['en']` only; even after the UI follows the
 * operator language, existing rows still lack Chinese keys (seed was en/pl).
 * Fills missing keys only — an operator-edited zh value is left alone.
 */
const ZH_NAMES: ReadonlyArray<readonly [string, string, string]> = [
  ['new', '新创建', '新建立'],
  ['pending', '待处理', '待處理'],
  ['paid', '已付款', '已付款'],
  ['processing', '处理中', '處理中'],
  ['shipment_ready', '待发货', '待出貨'],
  ['shipment_sent', '已发货', '已出貨'],
  ['completed', '已完成', '已完成'],
  ['on_hold', '已挂起', '已暫停'],
  ['cancelled', '已取消', '已取消'],
];

export class Migration20261123T074110OrdersOrderStatusNamesZh extends Migration {
  override async up(): Promise<void> {
    for (const [code, zhCn, zhTw] of ZH_NAMES) {
      this.addSql(`
        update "order_statuses"
        set
          "name" = "name"
            || case when coalesce("name"->>'zh-CN', '') = '' then '{"zh-CN":"${zhCn}"}'::jsonb else '{}'::jsonb end
            || case when coalesce("name"->>'zh-TW', '') = '' then '{"zh-TW":"${zhTw}"}'::jsonb else '{}'::jsonb end,
          "updated_at" = now()
        where "code" = '${code}';
      `);
    }
  }

  override async down(): Promise<void> {
    for (const [code] of ZH_NAMES) {
      this.addSql(`
        update "order_statuses"
        set
          "name" = ("name" - 'zh-CN' - 'zh-TW'),
          "updated_at" = now()
        where "code" = '${code}';
      `);
    }
  }
}
