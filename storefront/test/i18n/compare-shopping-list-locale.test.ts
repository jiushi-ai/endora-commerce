import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { tForLocale, type MessageKey } from '../../lib/i18n/messages';

/** Batch 39 — compare + shopping-list detail leave Polish/English hardcoding. */

const KEYS: MessageKey[] = [
  'compare.crumb',
  'compare.title',
  'compare.empty.minTwo',
  'compare.add',
  'compare.remove',
  'shoppingList.backToAll',
  'shoppingList.convertAllCart',
  'shoppingList.clear',
];

const source = (rel: string): string =>
  readFileSync(resolve(import.meta.dirname, '../..', rel), 'utf8');

describe('batch 39 compare / shopping-list keys', () => {
  it('resolves zh-CN / zh-TW / en-US / pl-PL', () => {
    for (const key of KEYS) {
      expect(tForLocale('zh-CN')(key), key).not.toBe(key);
      expect(tForLocale('zh-TW')(key), key).not.toBe(key);
      expect(tForLocale('en-US')(key), key).not.toBe(key);
      expect(tForLocale('pl-PL')(key), key).not.toBe(key);
    }
    expect(tForLocale('zh-CN')('compare.crumb')).toBe('对比');
    expect(tForLocale('zh-TW')('compare.crumb')).toBe('對比');
    expect(tForLocale('en-US')('compare.add')).toBe('Add to comparison');
    expect(tForLocale('pl-PL')('compare.add')).toBe('Dodaj do porównania');
  });
});

describe('batch 39 call sites drop hardcoding', () => {
  it('compare page uses message keys', () => {
    const page = source('app/compare/page.tsx');
    expect(page).toContain("t('compare.crumb')");
    expect(page).toContain("t('compare.title')");
    expect(page).not.toContain('Porównywarka parametrów');
  });

  it('CompareToggle uses compare.add / compare.remove', () => {
    const toggle = source('components/CompareToggle.tsx');
    expect(toggle).toContain("t('compare.add')");
    expect(toggle).toContain("t('compare.remove')");
    expect(toggle).not.toContain('Dodaj do porównania');
  });

  it('shopping-list detail uses message keys', () => {
    const page = source('app/(account)/shopping-lists/[id]/page.tsx');
    expect(page).toContain("t('shoppingList.backToAll')");
    expect(page).toContain("t('shoppingList.convertAllCart')");
    expect(page).not.toContain('Convert all to cart');
    expect(page).not.toContain('← All lists');
  });
});
