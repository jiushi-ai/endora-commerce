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

  it('returns the raw code when the catalogue has no label', () => {
    expect(codeLabel(tForLocale('zh-CN'), 'order.detail.paymentStatus', 'chargeback')).toBe(
      'chargeback',
    );
  });
});
