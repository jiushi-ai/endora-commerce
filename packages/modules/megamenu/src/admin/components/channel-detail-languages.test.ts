import { describe, expect, it } from 'vitest';
import type { SalesChannelDetail } from '@endora-commerce/contracts';

import { languagesFromChannelDetail } from './channel-detail-languages.js';

function detail(languages: string[]): SalesChannelDetail {
  return {
    id: 'ch-1',
    code: 'p1_retail',
    name: { 'en-US': 'Retail' },
    active: true,
    anonymousAccess: true,
    systemDefault: true,
    defaultLanguage: languages[0] ?? 'en-US',
    defaultCurrency: 'CNY',
    languages,
    currencies: ['CNY'],
    themeCode: null,
    logoAssetId: null,
    logoUrl: null,
    version: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('languagesFromChannelDetail', () => {
  it('reads languages from the channel detail body (no data envelope)', () => {
    expect(languagesFromChannelDetail(detail(['zh-CN', 'en-US']))).toEqual(['zh-CN', 'en-US']);
  });

  it('returns [] when detail is missing or languages are absent', () => {
    expect(languagesFromChannelDetail(undefined)).toEqual([]);
    expect(languagesFromChannelDetail(null)).toEqual([]);
    expect(languagesFromChannelDetail(detail([]))).toEqual([]);
  });

  it('does not treat a mistaken { data } envelope as the detail', () => {
    // Regression: BindingsPanel used to do `res.data.languages` while the
    // API returns the detail at the top level — `res.data` is undefined.
    const mistaken = { data: undefined } as unknown as SalesChannelDetail;
    expect(languagesFromChannelDetail(mistaken)).toEqual([]);
  });
});
