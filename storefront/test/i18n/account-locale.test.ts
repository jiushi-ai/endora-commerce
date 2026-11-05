import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { accountRoleLabel } from '../../lib/i18n/account-labels';
import { tForLocale, type MessageKey } from '../../lib/i18n/messages';

/** Batch 20 — account menu pages speak the page locale. */

const KEYS: MessageKey[] = [
  'account.profile.title',
  'account.password.title',
  'account.addresses.title',
  'account.orders.title',
  'account.returns.title',
  'account.rfq.title',
  'account.lists.title',
  'account.members.title',
  'account.bidding.title',
  'account.org.taxId',
];

const source = (rel: string): string =>
  readFileSync(resolve(import.meta.dirname, '../..', rel), 'utf8');

describe('account.* catalogue', () => {
  it('resolves zh-CN distinctly from en-US', () => {
    for (const key of KEYS) {
      expect(tForLocale('zh-CN')(key), key).not.toBe(key);
      expect(tForLocale('zh-CN')(key), key).not.toBe(tForLocale('en-US')(key));
    }
    expect(tForLocale('zh-CN')('account.profile.title')).toBe('个人资料');
    expect(tForLocale('zh-CN')('account.password.title')).toBe('修改密码');
    expect(accountRoleLabel('organization_admin', 'zh-CN')).toBe('组织管理员');
  });
});

describe('account pages wire chrome through messages', () => {
  it.each([
    ['app/(account)/account/page.tsx', "t('account.profile.title')"],
    ['app/(account)/account/password/page.tsx', "t('account.password.title')"],
    ['app/(account)/addresses/page.tsx', "t('account.addresses.title')"],
    ['app/(account)/orders/page.tsx', "t('account.orders.empty')"],
    ['app/(account)/returns/page.tsx', "t('account.returns.title')"],
    ['app/(account)/quote-requests/page.tsx', "t('account.rfq.title')"],
    ['app/(account)/shopping-lists/page.tsx', "t('account.lists.title')"],
    ['app/(account)/organization/page.tsx', "t('account.org.taxId')"],
    ['app/(account)/organization/members/page.tsx', "t('account.members.adminRequired')"],
    ['app/(account)/organization/addresses/page.tsx', "t('account.addresses.addHeading')"],
    ['app/(account)/account/bidding/page.tsx', 'locale={locale}'],
  ])('%s uses messages', (file, expected) => {
    expect(source(file)).toContain(expected);
  });
});
