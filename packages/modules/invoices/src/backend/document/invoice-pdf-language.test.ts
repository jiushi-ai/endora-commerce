import { describe, expect, it } from 'vitest';
import {
  amountLocaleOf,
  numberLocaleOf,
  resolveInvoiceDocumentLanguage,
} from './invoice-pdf-language.js';

describe('resolveInvoiceDocumentLanguage (batch 44)', () => {
  it('prefers the account language when the channel offers it', () => {
    expect(
      resolveInvoiceDocumentLanguage({
        preferredLanguage: 'zh-CN',
        channelLanguages: ['en-US', 'zh-CN', 'pl-PL'],
        channelDefaultLanguage: 'en-US',
      }),
    ).toBe('zh-CN');
  });

  it('matches preferred language case-insensitively in the channel spelling', () => {
    expect(
      resolveInvoiceDocumentLanguage({
        preferredLanguage: 'zh-cn',
        channelLanguages: ['zh-CN', 'en-US'],
        channelDefaultLanguage: 'en-US',
      }),
    ).toBe('zh-CN');
  });

  it('falls back to a same-base channel language when the exact tag is absent', () => {
    expect(
      resolveInvoiceDocumentLanguage({
        preferredLanguage: 'pl',
        channelLanguages: ['pl-PL', 'en-US'],
        channelDefaultLanguage: 'en-US',
      }),
    ).toBe('pl-PL');
  });

  it('falls through to the channel default when preferred is not offered', () => {
    expect(
      resolveInvoiceDocumentLanguage({
        preferredLanguage: 'de-DE',
        channelLanguages: ['en-US', 'zh-CN'],
        channelDefaultLanguage: 'en-US',
      }),
    ).toBe('en-US');
  });

  it('uses en-US when nothing else is known', () => {
    expect(resolveInvoiceDocumentLanguage({})).toBe('en-US');
  });

  it('keeps preferred as-is when no channel language list is available', () => {
    expect(
      resolveInvoiceDocumentLanguage({
        preferredLanguage: 'zh-TW',
        channelDefaultLanguage: 'en-US',
      }),
    ).toBe('zh-TW');
  });
});

describe('amountLocaleOf / numberLocaleOf', () => {
  it('maps Polish tags to pl amount words', () => {
    expect(amountLocaleOf('pl-PL')).toBe('pl');
    expect(amountLocaleOf('pl')).toBe('pl');
    expect(amountLocaleOf('en-US')).toBe('en');
    expect(amountLocaleOf('zh-CN')).toBe('en');
  });

  it('picks a number-format locale', () => {
    expect(numberLocaleOf('pl-PL')).toBe('pl-PL');
    expect(numberLocaleOf('zh-CN')).toBe('zh-CN');
    expect(numberLocaleOf('en-GB')).toBe('en-US');
  });
});
