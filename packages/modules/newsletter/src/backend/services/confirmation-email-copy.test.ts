import { describe, expect, it } from 'vitest';
import { confirmationEmailCopy } from './confirmation-email-copy.js';

describe('confirmationEmailCopy (batch 64)', () => {
  it('returns English for en-US and unknown tags', () => {
    expect(confirmationEmailCopy('en-US').subject).toBe('Confirm your newsletter subscription');
    expect(confirmationEmailCopy('de-DE').subject).toBe('Confirm your newsletter subscription');
    expect(confirmationEmailCopy(null).subject).toBe('Confirm your newsletter subscription');
  });

  it('resolves zh-CN / zh-TW / pl aliases', () => {
    expect(confirmationEmailCopy('zh-CN').subject).toContain('确认');
    expect(confirmationEmailCopy('zh').subject).toContain('确认');
    expect(confirmationEmailCopy('zh-TW').subject).toContain('確認');
    expect(confirmationEmailCopy('pl').subject).toContain('Potwierdź');
    expect(confirmationEmailCopy('pl-PL').subject).toContain('Potwierdź');
  });

  it('embeds the confirm URL in text and html', () => {
    const url = 'https://shop.example/api/v1/newsletter/confirm?token=abc';
    const copy = confirmationEmailCopy('zh-CN');
    expect(copy.text(url)).toContain(url);
    expect(copy.html(url)).toContain(url);
    expect(copy.html(url)).toContain('确认订阅');
  });
});
