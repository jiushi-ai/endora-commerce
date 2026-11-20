import { Migration } from '@mikro-orm/migrations';

/**
 * Issue #652 — the language a customer account's owner reads: one BCP-47
 * content-language tag, spelled the way the sales channel that captured it
 * spells it (`pl-PL`, `en-US`, `zh-CN`).
 *
 * Nullable and not backfilled. `NULL` means "not known yet". `varchar(35)` is
 * RFC 5646 §4.4.1's recommended minimum buffer for a language tag.
 */
export class Migration20261115T145934CustomerAccountsPreferredLanguage extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      'alter table "customer_accounts" add column if not exists "preferred_language" varchar(35) null;',
    );
  }

  override async down(): Promise<void> {
    this.addSql('alter table "customer_accounts" drop column if exists "preferred_language";');
  }
}
