import { Migration } from '@mikro-orm/migrations';

/**
 * Add `zh-CN` as an active storefront content language and make it the
 * platform default (Mobii / China storefront: locale and page content share
 * the same code; missing zh-CN copy still falls back to en-US at read time).
 *
 * ## What this does
 *
 * 1. Inserts `zh-CN` into `languages` when missing (active, sort after pl-PL).
 * 2. Pins the single default to `zh-CN` (partial unique index on `is_default`).
 * 3. Ensures every sales channel lists `zh-CN` and uses it as `default_language`,
 *    bumping `version` so stale admin forms get 412 instead of overwriting.
 *
 * Kernel `sales_channels` writes from a module migration are the permitted
 * direction (`module-migrations.md` item 4a); this module is non-deactivatable.
 */
export class Migration20261105T021036LanguagesAddZhCnDefault extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `insert into "languages" ("code", "label", "is_default", "is_active", "sort_order", "created_at", "updated_at")
       values ('zh-CN', 'Chinese (Simplified)', false, true, 2, now(), now())
       on conflict ("code") do update
         set "is_active" = true,
             "label" = excluded."label",
             "updated_at" = now();`,
    );

    this.addSql(`update "languages" set "is_default" = false where "is_default" = true;`);
    this.addSql(
      `update "languages"
          set "is_default" = true,
              "is_active" = true,
              "updated_at" = now()
        where "code" = 'zh-CN';`,
    );

    // Append zh-CN to the channel language list when absent, then set default.
    this.addSql(
      `update "sales_channels"
          set "languages" = case
                when "languages" ? 'zh-CN' then "languages"
                else "languages" || '["zh-CN"]'::jsonb
              end,
              "default_language" = 'zh-CN',
              "version" = "version" + 1,
              "updated_at" = now()
        where exists (select 1 from "languages" where "code" = 'zh-CN');`,
    );
  }

  override async down(): Promise<void> {
    // Restore en-US as the sole default when present; leave zh-CN row in place
    // (channels may still list it). Do not strip zh-CN from channel arrays —
    // that would drop operator intent after they added other languages.
    this.addSql(
      `update "sales_channels"
          set "default_language" = 'en-US',
              "version" = "version" + 1,
              "updated_at" = now()
        where "default_language" = 'zh-CN'
          and exists (select 1 from "languages" where "code" = 'en-US');`,
    );
    this.addSql(`update "languages" set "is_default" = false where "code" = 'zh-CN';`);
    this.addSql(
      `update "languages"
          set "is_default" = true,
              "updated_at" = now()
        where "code" = 'en-US';`,
    );
  }
}
