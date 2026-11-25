import { describe, expect, it } from 'vitest';
import {
  ADMIN_UI_CONTENT_LOCALES,
  buildLocalizedNamePayload,
  offeredAdminContentLanguageCodes,
} from '@endora-commerce/admin-kit/components';

describe('offeredAdminContentLanguageCodes', () => {
  it('returns only Admin UI locales that are active on the platform', () => {
    expect(offeredAdminContentLanguageCodes(['en-US', 'pl-PL', 'zh-CN'])).toEqual([
      'en-US',
      'zh-CN',
    ]);
  });

  it('falls back to all Admin UI locales when none are active', () => {
    expect(offeredAdminContentLanguageCodes(['pl-PL'])).toEqual([...ADMIN_UI_CONTENT_LOCALES]);
  });
});

describe('buildLocalizedNamePayload', () => {
  it('preserves non–Admin-UI locales from the stored record on save', () => {
    const payload = buildLocalizedNamePayload(
      { 'en-US': 'Wire transfer' },
      { 'en-US': 'Old', 'pl-PL': 'Przelew' },
    );
    expect(payload).toEqual({ 'en-US': 'Wire transfer', 'pl-PL': 'Przelew' });
  });

  it('drops preserved locales when the stored value was empty', () => {
    expect(buildLocalizedNamePayload({ 'en-US': 'X' }, { 'pl-PL': '   ' })).toEqual({ 'en-US': 'X' });
  });
});