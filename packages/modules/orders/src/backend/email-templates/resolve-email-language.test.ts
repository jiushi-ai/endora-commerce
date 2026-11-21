import { describe, expect, it } from 'vitest';
import { resolveOrderEmailLanguage } from './resolve-email-language.js';

describe('resolveOrderEmailLanguage (batch 58)', () => {
  it('prefers the account language when the channel offers it', () => {
    expect(
      resolveOrderEmailLanguage({
        preferredLanguage: 'zh-CN',
        channelLanguages: ['en-US', 'zh-CN', 'pl-PL'],
        channelDefaultLanguage: 'en-US',
      }),
    ).toBe('zh-CN');
  });

  it('matches preferred language case-insensitively in the channel spelling', () => {
    expect(
      resolveOrderEmailLanguage({
        preferredLanguage: 'zh-cn',
        channelLanguages: ['zh-CN', 'en-US'],
        channelDefaultLanguage: 'en-US',
      }),
    ).toBe('zh-CN');
  });

  it('falls back to a same-base channel language when the exact tag is absent', () => {
    expect(
      resolveOrderEmailLanguage({
        preferredLanguage: 'pl',
        channelLanguages: ['pl-PL', 'en-US'],
        channelDefaultLanguage: 'en-US',
      }),
    ).toBe('pl-PL');
  });

  it('falls through to the channel default when preferred is not offered', () => {
    expect(
      resolveOrderEmailLanguage({
        preferredLanguage: 'de-DE',
        channelLanguages: ['en-US', 'zh-CN'],
        channelDefaultLanguage: 'en-US',
      }),
    ).toBe('en-US');
  });

  it('uses en-US when nothing else is known', () => {
    expect(resolveOrderEmailLanguage({})).toBe('en-US');
  });

  it('keeps preferred as-is when no channel language list is available', () => {
    expect(
      resolveOrderEmailLanguage({
        preferredLanguage: 'zh-TW',
        channelDefaultLanguage: 'en-US',
      }),
    ).toBe('zh-TW');
  });
});
