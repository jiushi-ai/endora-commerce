import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { tForLocale } from '../../lib/i18n/messages';
import { codeLabel } from '../../lib/account/labels';
import { orderStatusLabel } from '../../lib/orders/status-labels';
import { resolveOrderStatusLabel } from '../../lib/api/orders';

/**
 * Batch 48 / 85 pick — orders list payment via `codeLabel`; fulfilment status
 * via API statusName then catalogue.
 */

describe('resolveOrderStatusLabel short-code fallback', () => {
  const order = {
    status: 'new',
    statusName: { en: 'New', pl: 'Nowy' },
    statusDefaultName: 'New',
  };

  it('resolves pl-PL via primary pl', () => {
    expect(resolveOrderStatusLabel(order, 'pl-PL')).toBe('Nowy');
  });

  it('falls back to defaultName when the locale family is absent', () => {
    expect(resolveOrderStatusLabel(order, 'zh-CN')).toBe('New');
  });
});

describe('orderStatusLabel', () => {
  const order = {
    status: 'new',
    statusName: { en: 'New', pl: 'Nowy' },
    statusDefaultName: 'New',
  };

  it('prefers API statusName when the short code matches', () => {
    expect(orderStatusLabel(order, 'pl-PL', tForLocale('pl-PL'))).toBe('Nowy');
  });

  it('uses codeLabel catalogue when statusName has no zh entry', () => {
    expect(orderStatusLabel(order, 'zh-CN', tForLocale('zh-CN'))).toBe('新的');
    expect(codeLabel(tForLocale('zh-CN'), 'order.status', 'new')).toBe('新的');
  });
});

describe('orders list wires open-source-style helpers', () => {
  it('uses codeLabel for payment and orderStatusLabel for status', () => {
    const src = readFileSync(
      resolve(import.meta.dirname, '../../app/(account)/orders/page.tsx'),
      'utf8',
    );
    expect(src).toContain("codeLabel(t, 'order.detail.paymentStatus'");
    expect(src).toContain('orderStatusLabel(');
    expect(src).not.toContain('{o.paymentStatus}');
    expect(src).not.toContain('paymentStatusLabel');
  });
});
