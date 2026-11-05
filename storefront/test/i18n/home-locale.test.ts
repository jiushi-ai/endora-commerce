import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { storefrontLanguageOption } from '../../lib/i18n/language-labels';
import { tForLocale, type MessageKey } from '../../lib/i18n/messages';

/** Batch 18/23 — language pills + Mobii dual-path home shell i18n. */

const HOME_KEYS: MessageKey[] = [
  'home.mobile.shipToday',
  'home.hero.badge',
  'home.hero.titleEm',
  'home.hero.ctaBidding',
  'home.hero.ctaProcure',
  'home.path.biddingTitle',
  'home.campaigns.signIn',
  'home.stat.stock',
  'home.demo.lotMeta',
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
    expect(tForLocale('zh-CN')('home.hero.titleEm')).toBe('竞价批采');
    expect(tForLocale('zh-TW')('home.hero.titleEm')).toBe('競價批採');
    expect(tForLocale('en-US')('home.hero.titleEm')).toBe('bid to procure');
    expect(tForLocale('pl-PL')('home.hero.titleEm')).toBe('licytacja i zakupy');
    expect(tForLocale('zh-CN')('home.hero.ctaBidding')).toBe('参与竞价');
    expect(tForLocale('en-US')('home.path.biddingTitle')).toBe('Scarce-lot bidding');
  });

  it('wires page.tsx shell to messages (not hard-coded Industria Polish)', () => {
    const src = readFileSync(
      new URL('../../app/page.tsx', import.meta.url),
      'utf8',
    );
    expect(src).toContain("t('home.hero.ctaBidding')");
    expect(src).toContain("t('home.path.procureTitle')");
    expect(src).toContain("t('home.campaigns.signIn')");
    expect(src).toContain('/login?next=');
    expect(src).toContain('/account/bidding');
    expect(src).not.toContain('SKU 6205-2RS');
  });
});
