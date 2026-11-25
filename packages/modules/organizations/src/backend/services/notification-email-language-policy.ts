import {
  I18N_SETTING_CODES,
  coerceNotificationEmailLanguage,
  type NotificationEmailLanguage,
} from '@endora-commerce/contracts';
import type { SettingsReadPort } from '@endora-commerce/platform/kernel';

/**
 * Reads `_i18n.admin.notification_email_language` — same contract as
 * `@endora-commerce/mod-i18n` `readNotificationEmailLanguage`, kept here so
 * `organizations` does not add a compile-time package edge to `_i18n`.
 */
export async function readNotificationEmailLanguage(
  settings: Pick<SettingsReadPort, 'getMany'>,
): Promise<NotificationEmailLanguage> {
  const row = (
    await settings.getMany([I18N_SETTING_CODES.NOTIFICATION_EMAIL_LANGUAGE], null)
  ).get(I18N_SETTING_CODES.NOTIFICATION_EMAIL_LANGUAGE);
  if (row?.ok !== true) return coerceNotificationEmailLanguage(undefined);
  return coerceNotificationEmailLanguage(row.value);
}