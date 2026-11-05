import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { tForLocale, type MessageKey } from '../../lib/i18n/messages';

/** Batch 19 — PDP + catalog shell chrome leave Polish literals. */

const KEYS: MessageKey[] = [
  'gallery.zoom',
  'compare.add',
  'compare.remove',
  'catalog.count',
  'catalog.sort.relevance',
  'catalog.sort.newest',
  'catalog.perPage',
  'product.fromPerUnit',
  'product.gross',
];

const source = (rel: string): string =>
  readFileSync(resolve(import.meta.dirname, '../..', rel), 'utf8');

describe('batch 19 catalogue keys', () => {
  it('resolves zh-CN / en-US / pl-PL distinctly', () => {
    for (const key of KEYS) {
      const zh = tForLocale('zh-CN')(key);
      const en = tForLocale('en-US')(key);
      const pl = tForLocale('pl-PL')(key);
      expect(zh, key).not.toBe(key);
      expect(en, key).not.toBe(zh);
      expect(pl, key).not.toBe(en);
    }
    expect(tForLocale('zh-CN')('gallery.zoom')).toBe('放大');
    expect(tForLocale('zh-CN')('compare.add')).toBe('加入对比');
    expect(tForLocale('zh-CN')('product.fromPerUnit')).toBe('起 / 件');
    expect(tForLocale('pl-PL')('gallery.zoom')).toBe('Powiększ');
  });
});

describe('batch 19 call sites drop Polish hardcoding', () => {
  it('PDP shopping-list + compare + gallery use messages / locale', () => {
    const pdp = source('app/(catalog)/p/[slug]/page.tsx');
    expect(pdp).toContain("t('card.list.add')");
    expect(pdp).toContain("t('card.list.remove')");
    expect(pdp).not.toContain('Dodaj do listy zakupowej');
    expect(pdp).toContain('locale={locale}');
    expect(pdp).toMatch(/GallerySwitcher[\s\S]*locale=\{locale\}/);
  });

  it('CatalogToolbar sort / per-page / showing use messages', () => {
    const toolbar = source('components/CatalogToolbar.tsx');
    expect(toolbar).toContain("t('catalog.sort.relevance')");
    expect(toolbar).toContain("t('catalog.perPage')");
    expect(toolbar).not.toContain('Sortuj: trafność');
    expect(toolbar).not.toContain('/ strona');
  });

  it('product cards use fromPerUnit / gross keys', () => {
    const card = source('components/ProductCard.tsx');
    const row = source('components/ProductRow.tsx');
    expect(card).toContain("t('product.fromPerUnit')");
    expect(card).toContain("t('product.gross')");
    expect(row).toContain("t('product.fromPerUnit')");
    expect(card).not.toMatch(/['"]od \/ szt\.['"]/);
    expect(row).not.toMatch(/['"]od \/ szt\.['"]/);
  });
});
