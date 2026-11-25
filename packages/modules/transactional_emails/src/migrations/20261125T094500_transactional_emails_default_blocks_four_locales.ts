import { Migration } from '@mikro-orm/migrations';
import {
  DEFAULT_HEADER_BLOCK_CODE,
  defaultHeaderContentEnvelope,
} from '@endora-commerce/email-components/defaults/default-header';
import {
  DEFAULT_FOOTER_BLOCK_CODE,
  DEFAULT_SYSTEM_EMAIL_LANGUAGES,
  defaultFooterContentEnvelope,
} from '@endora-commerce/email-components/defaults/default-footer';

/**
 * Refresh system `default_email_header` / `default_email_footer` block content
 * with per-locale footer legal copy and header logo alt (en-US, zh-CN, zh-TW, pl-PL).
 *
 * Updates only `is_system = true` rows by block code. Does not delete operator
 * transactional email content overrides (unlike the 20260801 defaults reseed).
 */
const TE_HEADER = DEFAULT_HEADER_BLOCK_CODE;
const TE_FOOTER = DEFAULT_FOOTER_BLOCK_CODE;

function jsonbLiteral(value: unknown): string {
  return JSON.stringify(value).replace(/'/g, "''");
}

export class Migration20261125T094500TransactionalEmailsDefaultBlocksFourLocales extends Migration {
  override async up(): Promise<void> {
    const header = defaultHeaderContentEnvelope();
    const footer = defaultFooterContentEnvelope();
    const headerJson = jsonbLiteral(header);
    const footerJson = jsonbLiteral(footer);
    const languagesJson = jsonbLiteral([...DEFAULT_SYSTEM_EMAIL_LANGUAGES]);

    this.addSql(
      `update "email_blocks" set "content" = '${headerJson}'::jsonb, "languages" = '${languagesJson}'::jsonb, "version" = "version" + 1, "updated_at" = now() where "code" = '${TE_HEADER}' and "is_system" = true;`,
    );
    this.addSql(
      `update "email_blocks" set "content" = '${footerJson}'::jsonb, "languages" = '${languagesJson}'::jsonb, "version" = "version" + 1, "updated_at" = now() where "code" = '${TE_FOOTER}' and "is_system" = true;`,
    );
  }

  override async down(): Promise<void> {
    // Non-destructive content refresh; prior per-locale trees are not restored.
  }
}