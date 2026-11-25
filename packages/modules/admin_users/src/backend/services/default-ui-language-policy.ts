import {
  I18N_SETTING_CODES,
  coerceDefaultUiLanguage,
  type SupportedLanguage,
} from '@endora-commerce/contracts';
import type { SettingsReadPort } from '@endora-commerce/platform/kernel';

/**
 * `_i18n.admin.default_ui_language` for `GET /api/v1/admin/me`. Same contract
 * as `readIdleLogoutMinutes`: platform-wide read, invalid values coerced, store
 * failures propagate.
 */
export async function readPlatformDefaultUiLanguage(
  settings: Pick<SettingsReadPort, 'getMany'>,
): Promise<SupportedLanguage> {
  const row = (
    await settings.getMany([I18N_SETTING_CODES.DEFAULT_UI_LANGUAGE], null)
  ).get(I18N_SETTING_CODES.DEFAULT_UI_LANGUAGE);
  if (row?.ok !== true) return coerceDefaultUiLanguage(undefined);
  return coerceDefaultUiLanguage(row.value);
}