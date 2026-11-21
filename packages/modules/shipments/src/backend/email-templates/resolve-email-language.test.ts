import { describe, expect, it } from 'vitest';
import { resolveShipmentEmailLanguage } from './resolve-email-language.js';

describe('resolveShipmentEmailLanguage (batch 58)', () => {
  it('prefers the account language when the channel offers it', () => {
    expect(
      resolveShipmentEmailLanguage({
        preferredLanguage: 'zh-CN',
        channelLanguages: ['en-US', 'zh-CN', 'pl-PL'],
        channelDefaultLanguage: 'en-US',
      }),
    ).toBe('zh-CN');
  });

  it('falls through to the channel default when preferred is not offered', () => {
    expect(
      resolveShipmentEmailLanguage({
        preferredLanguage: 'de-DE',
        channelLanguages: ['en-US', 'zh-CN'],
        channelDefaultLanguage: 'pl-PL',
      }),
    ).toBe('pl-PL');
  });

  it('uses en-US when nothing else is known', () => {
    expect(resolveShipmentEmailLanguage({})).toBe('en-US');
  });
});
