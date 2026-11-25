import {
  I18N_SETTING_CODES,
  coerceDefaultUiLanguage,
  coerceNotificationEmailLanguage,
  type NotificationEmailLanguage,
} from '@endora-commerce/contracts';
import type { SupportedLanguage } from '@endora-commerce/contracts';
import type { SettingsReadPort } from '@endora-commerce/platform/kernel';

/**
 * Platform default Admin UI language (`_i18n.admin.default_ui_language`), for
 * callers that cannot open the settings admin API.
 */
export async function readDefaultUiLanguage(
  settings: Pick<SettingsReadPort, 'getMany'>,
): Promise<SupportedLanguage> {
  const row = (
    await settings.getMany([I18N_SETTING_CODES.DEFAULT_UI_LANGUAGE], null)
  ).get(I18N_SETTING_CODES.DEFAULT_UI_LANGUAGE);
  if (row?.ok !== true) return coerceDefaultUiLanguage(undefined);
  return coerceDefaultUiLanguage(row.value);
}

/**
 * Language for admin notification transactional e-mails
 * (`_i18n.admin.notification_email_language`). Values are BCP-47-style tags
 * aligned with transactional template language keys (`en-US`, `zh-CN`, …).
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