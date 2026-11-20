import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { tForLocale } from '../../lib/i18n/messages';
import { orderStatusLabel, paymentStatusLabel } from '../../lib/orders/status-labels';
import { resolveOrderStatusLabel } from '../../lib/api/orders';

/**
 * Batch 48 — orders list payment/status cells follow the page locale
 * (upstream `codeLabel` shape + short-code statusName fallback).
 */

describe('paymentStatusLabel', () => {
  it('maps API codes through the catalogue', () => {
    expect(paymentStatusLabel('awaiting_payment', tForLocale('en-US'))).toBe('Awaiting payment');
    expect(paymentStatusLabel('awaiting_payment', tForLocale('zh-CN'))).toBe('等待付款');
    expect(paymentStatusLabel('deferred', tForLocale('pl-PL'))).toBe('Odroczone');
  });

  it('returns an unknown code unchanged', () => {
    expect(paymentStatusLabel('chargeback', tForLocale('zh-CN'))).toBe('chargeback');
  });
});

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

  it('uses the catalogue when statusName has no zh entry', () => {
    expect(orderStatusLabel(order, 'zh-CN', tForLocale('zh-CN'))).toBe('新的');
    expect(orderStatusLabel(order, 'zh-TW', tForLocale('zh-TW'))).toBe('新的');
  });
});

describe('orders list wires status helpers', () => {
  it('does not render raw paymentStatus', () => {
    const src = readFileSync(
      resolve(import.meta.dirname, '../../app/(account)/orders/page.tsx'),
      'utf8',
    );
    expect(src).toContain('paymentStatusLabel(');
    expect(src).toContain('orderStatusLabel(');
    expect(src).not.toContain('{o.paymentStatus}');
  });
});
