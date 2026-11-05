import { describe, expect, it } from 'vitest';
import { storefrontLanguageOption } from '../../lib/i18n/language-labels';
import { tForLocale, type MessageKey } from '../../lib/i18n/messages';

/** Batch 18 — Admin-style language pills + Industria home shell i18n. */

const HOME_KEYS: MessageKey[] = [
  'home.mobile.shipToday',
  'home.hero.badge',
  'home.hero.titleEm',
  'home.hero.browseCatalog',
  'home.stat.stock',
  'home.demo.datasheet',
  'home.assortment.title',
  'home.benefit.shipTitle',
  'home.bestsellers.title',
  'home.fallback.fasteners',
];

describe('storefrontLanguageOption (Admin-aligned)', () => {
  it('exposes flag + EN/ZH-CN/ZH-TW + Chinese name', () => {
    expect(storefrontLanguageOption('en-US')).toMatchObject({
      displayCode: 'EN',
      label: '英语',
      flag: '🇬🇧',
    });
    expect(storefrontLanguageOption('zh-CN')).toMatchObject({
      displayCode: 'ZH-CN',
      label: '简体中文',
      flag: '🇨🇳',
    });
    expect(storefrontLanguageOption('zh-TW')).toMatchObject({
      displayCode: 'ZH-TW',
      label: '繁体中文',
      flag: '🇹🇼',
    });
  });
});

describe('home.* shell catalogue', () => {
  it('resolves distinct copy for zh-CN / zh-TW / en-US / pl-PL', () => {
    for (const key of HOME_KEYS) {
      const zh = tForLocale('zh-CN')(key);
      const tw = tForLocale('zh-TW')(key);
      const en = tForLocale('en-US')(key);
      const pl = tForLocale('pl-PL')(key);
      expect(zh, key).not.toBe(key);
      expect(en, key).not.toBe(key);
      expect(pl, key).not.toBe(key);
      expect(tw, key).not.toBe(key);
      expect(zh, key).not.toBe(en);
      expect(pl, key).not.toBe(en);
    }
    expect(tForLocale('zh-CN')('home.hero.titleEm')).toBe('现货供应');
    expect(tForLocale('zh-TW')('home.hero.titleEm')).toBe('現貨供應');
    expect(tForLocale('en-US')('home.hero.titleEm')).toBe('off the shelf');
    expect(tForLocale('pl-PL')('home.hero.titleEm')).toBe('od ręki');
  });
});
