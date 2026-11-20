import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { codeLabel } from '../../lib/account/labels';
import { tForLocale } from '../../lib/i18n/messages';

/**
 * 85 pick — `codeLabel` adapted from upstream account i18n (`4645fffc1`).
 */

describe('codeLabel', () => {
  it('maps a known payment status code through the catalogue', () => {
    expect(codeLabel(tForLocale('en-US'), 'order.detail.paymentStatus', 'paid')).toBe('Paid');
    expect(codeLabel(tForLocale('zh-CN'), 'order.detail.paymentStatus', 'awaiting_payment')).toBe(
      '等待付款',
    );
    expect(codeLabel(tForLocale('pl-PL'), 'order.detail.paymentStatus', 'deferred')).toBe(
      'Odroczone',
    );
  });

  it('maps organization / VAT / cart enum codes (batch 50)', () => {
    expect(codeLabel(tForLocale('en-US'), 'account.organizationStatus', 'active')).toBe('Active');
    expect(codeLabel(tForLocale('zh-CN'), 'account.organizationStatus', 'pending_verification')).toBe(
      '待验证',
    );
    expect(codeLabel(tForLocale('zh-TW'), 'account.vatStatus', 'vat_exempt')).toBe('免稅');
    expect(codeLabel(tForLocale('pl-PL'), 'account.cartStatus', 'abandoned')).toBe('Porzucony');
    expect(
      codeLabel(tForLocale('en-US'), 'account.cartApprovalStatus', 'rejected_by_org_admin'),
    ).toBe('Rejected by an approver');
  });

  it('returns the raw code when the catalogue has no label', () => {
    expect(codeLabel(tForLocale('zh-CN'), 'order.detail.paymentStatus', 'chargeback')).toBe(
      'chargeback',
    );
  });
});

describe('organization pages wire codeLabel for API enums', () => {
  it('organization summary uses organizationStatus + vatStatus prefixes', () => {
    const src = readFileSync(
      resolve(import.meta.dirname, '../../app/(account)/organization/page.tsx'),
      'utf8',
    );
    expect(src).toContain("codeLabel(t, 'account.organizationStatus'");
    expect(src).toContain("codeLabel(t, 'account.vatStatus'");
    expect(src).not.toContain('{o.status}');
    expect(src).not.toContain('{o.vatStatus}');
  });

  it('organization carts uses cartStatus + cartApprovalStatus prefixes', () => {
    const src = readFileSync(
      resolve(import.meta.dirname, '../../app/(account)/organization/carts/page.tsx'),
      'utf8',
    );
    expect(src).toContain("codeLabel(t, 'account.cartStatus', cart.status)");
    expect(src).toContain(
      "codeLabel(t, 'account.cartApprovalStatus', cart.approvalStatus)",
    );
    // className may still interpolate `${cart.status}` for CSS modifiers;
    // assert the visible children are not the raw enum alone.
    expect(src).not.toMatch(/>\s*\{cart\.status\}\s*</);
    expect(src).not.toMatch(/>\s*\{cart\.approvalStatus\}\s*</);
  });
});
