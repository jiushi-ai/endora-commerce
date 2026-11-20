import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { tForLocale, type MessageKey } from '../../lib/i18n/messages';

/**
 * Batch 47 — order detail + quote-request detail speak the page locale
 * (were English / Polish hard-coded).
 */

const ORDER_KEYS: MessageKey[] = [
  'order.detail.title',
  'order.detail.reorderQuote',
  'order.detail.statusHeading',
  'order.detail.paymentStatus.awaiting_payment',
  'order.detail.col.product',
];

const RFQ_KEYS: MessageKey[] = [
  'quoteRequest.detail.back',
  'quoteRequest.detail.title',
  'quoteRequest.detail.history',
  'quoteRequest.detail.accept',
  'quoteRequest.detail.convert',
  'quoteRequest.detail.event.created',
];

const source = (rel: string): string =>
  readFileSync(resolve(import.meta.dirname, '../..', rel), 'utf8');

describe('order.detail / quoteRequest.detail catalogue', () => {
  it('resolves zh-CN distinctly from en-US', () => {
    for (const key of [...ORDER_KEYS, ...RFQ_KEYS]) {
      expect(tForLocale('zh-CN')(key), key).not.toBe(key);
      expect(tForLocale('zh-CN')(key), key).not.toBe(tForLocale('en-US')(key));
    }
    expect(tForLocale('zh-CN')('order.detail.reorderQuote')).toBe('按此订单 → 询价请求');
    expect(tForLocale('en-US')('order.detail.reorderQuote')).toBe('Order again → quote request');
    expect(tForLocale('en-US')('order.detail.reorderQuote')).toContain('→');
    expect(tForLocale('zh-CN')('quoteRequest.detail.history')).toBe('变更历史');
    expect(tForLocale('pl-PL')('quoteRequest.detail.accept')).toBe('Akceptuj wersję');
  });

  it('covers zh-TW and pl for payment status', () => {
    expect(tForLocale('zh-TW')('order.detail.paymentStatus.awaiting_payment')).toBe('等待付款');
    expect(tForLocale('pl-PL')('order.detail.paymentStatus.awaiting_payment')).toBe(
      'Oczekuje na płatność',
    );
  });
});

describe('detail pages wire chrome through messages', () => {
  it('orders/[id] uses order.detail keys', () => {
    const src = source('app/(account)/orders/[id]/page.tsx');
    expect(src).toContain("t('order.detail.title')");
    expect(src).toContain("t('order.detail.reorderQuote')");
    expect(src).not.toContain('Thank you — order placed');
    expect(src).not.toContain('Order again → quote request');
  });

  it('quote-requests/[id] uses quoteRequest.detail keys', () => {
    const src = source('app/(account)/quote-requests/[id]/page.tsx');
    expect(src).toContain("t('quoteRequest.detail.back')");
    expect(src).toContain("t('quoteRequest.detail.history')");
    expect(src).not.toContain('Lista zapytań');
    expect(src).not.toContain('Historia zmian');
  });

  it('RfqDetailActions uses quoteRequest.detail action keys', () => {
    const src = source('components/rfq/RfqDetailActions.tsx');
    expect(src).toContain("t('quoteRequest.detail.accept')");
    expect(src).toContain("t('quoteRequest.detail.convert')");
    expect(src).not.toContain('Akceptuj wersję');
    expect(src).not.toContain('Złóż zamówienie z tej oferty');
  });
});
