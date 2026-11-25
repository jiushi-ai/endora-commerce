import { describe, expect, it } from 'vitest';
import { resolveNewOrgRegistrationStatusLabel } from './org-registration-language.js';
import type { OrganizationsTranslate } from './organizations-prose.js';

describe('resolveNewOrgRegistrationStatusLabel', () => {
  it('uses English prose for en-US without a translator', async () => {
    expect(
      await resolveNewOrgRegistrationStatusLabel({
        status: 'pending_verification',
        notificationEmailLanguage: 'en-US',
      }),
    ).toBe('Awaiting verification');
    expect(
      await resolveNewOrgRegistrationStatusLabel({
        status: 'active',
        notificationEmailLanguage: 'en-US',
      }),
    ).toBe('Active');
  });

  it('maps pl-PL to SupportedLanguage pl for the bundle lookup', async () => {
    const seen: string[] = [];
    const translate: OrganizationsTranslate = async (_key, language) => {
      seen.push(language);
      return 'Aktywna';
    };
    expect(
      await resolveNewOrgRegistrationStatusLabel({
        status: 'active',
        notificationEmailLanguage: 'pl-PL',
        translate,
      }),
    ).toBe('Aktywna');
    expect(seen).toEqual(['pl']);
  });

  it('prefers the bundle when translate answers', async () => {
    const translate = async () => '自定义状态';
    expect(
      await resolveNewOrgRegistrationStatusLabel({
        status: 'active',
        notificationEmailLanguage: 'zh-CN',
        translate,
      }),
    ).toBe('自定义状态');
  });
});