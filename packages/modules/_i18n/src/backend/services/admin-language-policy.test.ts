import { describe, expect, it } from 'vitest';
import { I18N_SETTING_CODES } from '@endora-commerce/contracts';
import type { SettingsReadPort, SettingsReadResult } from '@endora-commerce/platform/kernel';
import {
  readDefaultUiLanguage,
  readNotificationEmailLanguage,
} from './admin-language-policy.js';

function settingsAnswering(
  results: Partial<Record<string, SettingsReadResult<unknown>>>,
): Pick<SettingsReadPort, 'getMany'> & { calls: Array<[string[], string | null]> } {
  const calls: Array<[string[], string | null]> = [];
  return {
    calls,
    getMany: async (codes, salesChannelId) => {
      calls.push([codes, salesChannelId]);
      return new Map(codes.map((code) => [code, results[code]!]));
    },
  };
}

describe('readDefaultUiLanguage', () => {
  it('reads the platform-wide _i18n.admin.default_ui_language', async () => {
    const settings = settingsAnswering({
      [I18N_SETTING_CODES.DEFAULT_UI_LANGUAGE]: { ok: true, value: 'zh-CN' },
    });
    expect(await readDefaultUiLanguage(settings)).toBe('zh-CN');
    expect(settings.calls).toEqual([
      [[I18N_SETTING_CODES.DEFAULT_UI_LANGUAGE], null],
    ]);
  });

  it('falls back to English when the setting is missing', async () => {
    expect(await readDefaultUiLanguage(settingsAnswering({}))).toBe('en');
  });
});

describe('readNotificationEmailLanguage', () => {
  it('reads BCP-47 notification mail language', async () => {
    const settings = settingsAnswering({
      [I18N_SETTING_CODES.NOTIFICATION_EMAIL_LANGUAGE]: { ok: true, value: 'pl-PL' },
    });
    expect(await readNotificationEmailLanguage(settings)).toBe('pl-PL');
  });

  it('defaults to en-US when unset', async () => {
    expect(await readNotificationEmailLanguage(settingsAnswering({}))).toBe('en-US');
  });
});