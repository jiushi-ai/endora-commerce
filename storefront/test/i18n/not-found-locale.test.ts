import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { tForLocale, type MessageKey } from '../../lib/i18n/messages';

/** Batch 41 — not-found chrome leaves Polish hardcoding. */

const KEYS: MessageKey[] = [
  'notFound.metaTitle',
  'notFound.badge',
  'notFound.title',
  'notFound.body',
  'notFound.searchLabel',
  'notFound.searchPlaceholder',
  'notFound.searchSubmit',
  'notFound.home',
  'notFound.catalog',
  'notFound.rfq',
  'notFound.popularHeading',
  'notFound.productsCount',
  'notFound.helpHeading',
  'notFound.asideAria',
];

const source = (rel: string): string =>
  readFileSync(resolve(import.meta.dirname, '../..', rel), 'utf8');

describe('batch 41 not-found keys', () => {
  it('resolves zh-CN / zh-TW / en-US / pl-PL', () => {
    for (const key of KEYS) {
      expect(tForLocale('zh-CN')(key), key).not.toBe(key);
      expect(tForLocale('zh-TW')(key), key).not.toBe(key);
      expect(tForLocale('en-US')(key), key).not.toBe(key);
      expect(tForLocale('pl-PL')(key), key).not.toBe(key);
    }
    expect(tForLocale('zh-CN')('notFound.title')).toBe('我们找不到这个页面。');
    expect(tForLocale('zh-TW')('notFound.title')).toBe('我們找不到這個頁面。');
    expect(tForLocale('en-US')('notFound.home')).toBe('Back to home');
    expect(tForLocale('pl-PL')('notFound.title')).toBe('Nie znaleźliśmy tej strony.');
  });
});

describe('batch 41 not-found uses messages', () => {
  it('page builds copy from tForLocale, not Polish literals', () => {
    const page = source('app/not-found.tsx');
    expect(page).toContain("t('notFound.title')");
    expect(page).toContain("t('notFound.body')");
    expect(page).toContain('tForLocale');
    expect(page).not.toContain('Nie znaleźliśmy tej strony.');
    expect(page).not.toContain('Błąd 404 · strona nie istnieje');
  });
});
