import { Migration } from '@mikro-orm/migrations';

/**
 * Activate Traditional Chinese (`zh-TW`) beside `zh-CN` for the Mobii
 * storefront language switcher. Does not change the platform default
 * (still `zh-CN` from `…AddZhCnDefault`).
 */
export class Migration20261105T032600LanguagesAddZhTw extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `insert into "languages" ("code", "label", "is_default", "is_active", "sort_order", "created_at", "updated_at")
       values ('zh-TW', 'Chinese (Traditional)', false, true, 3, now(), now())
       on conflict ("code") do update
         set "is_active" = true,
             "label" = excluded."label",
             "updated_at" = now();`,
    );

    this.addSql(
      `update "sales_channels"
          set "languages" = case
                when "languages" ? 'zh-TW' then "languages"
                else "languages" || '["zh-TW"]'::jsonb
              end,
              "version" = "version" + 1,
              "updated_at" = now()
        where exists (select 1 from "languages" where "code" = 'zh-TW');`,
    );

    // Prefer regional zh-CN / zh-TW over the bare ISO `zh` catalogue row in the switcher.
    this.addSql(
      `update "languages"
          set "is_active" = false,
              "updated_at" = now()
        where "code" = 'zh'
          and exists (select 1 from "languages" where "code" = 'zh-CN' and "is_active" = true);`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `update "sales_channels"
          set "languages" = "languages" - 'zh-TW',
              "version" = "version" + 1,
              "updated_at" = now()
        where "languages" ? 'zh-TW';`,
    );
    this.addSql(
      `update "languages"
          set "is_active" = false,
              "updated_at" = now()
        where "code" = 'zh-TW';`,
    );
  }
}
