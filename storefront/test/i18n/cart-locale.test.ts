import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { tForLocale, type MessageKey } from '../../lib/i18n/messages';

/** Batch 40 — cart page chrome leaves pl/en-only inline STRINGS. */

const KEYS: MessageKey[] = [
  'cart.heading',
  'cart.empty',
  'cart.continueShopping',
  'cart.summary.heading',
  'cart.cta.checkout',
  'cart.convert.toQr',
  'cart.line.saveToListLabel',
  'cart.totals.deliveryValue',
];

const source = (rel: string): string =>
  readFileSync(resolve(import.meta.dirname, '../..', rel), 'utf8');

describe('batch 40 cart page keys', () => {
  it('resolves zh-CN / zh-TW / en-US / pl-PL', () => {
    for (const key of KEYS) {
      expect(tForLocale('zh-CN')(key), key).not.toBe(key);
      expect(tForLocale('zh-TW')(key), key).not.toBe(key);
      expect(tForLocale('en-US')(key), key).not.toBe(key);
      expect(tForLocale('pl-PL')(key), key).not.toBe(key);
    }
    expect(tForLocale('zh-CN')('cart.heading')).toBe('您的购物车');
    expect(tForLocale('zh-TW')('cart.heading')).toBe('您的購物車');
    expect(tForLocale('en-US')('cart.cta.checkout')).toBe('Proceed to checkout');
    expect(tForLocale('pl-PL')('cart.heading')).toBe('Twój koszyk');
  });
});

describe('batch 40 cart page uses messages', () => {
  it('STRINGS builds from tForLocale keys, not pl/en hardcoding branches', () => {
    const page = source('app/(commerce)/cart/page.tsx');
    expect(page).toContain("t('cart.heading')");
    expect(page).toContain("t('cart.cta.checkout')");
    expect(page).not.toContain("locale.startsWith('pl')");
    expect(page).not.toContain("'Your cart'");
    expect(page).not.toContain("'Proceed to checkout'");
  });
});
