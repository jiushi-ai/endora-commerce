import { describe, expect, it } from 'vitest';
import {
  FONT_CJK_SC,
  FONT_CJK_TC,
  FONT_ROBOTO,
  resolvePdfDefaultFont,
} from './pdfmake.js';

describe('resolvePdfDefaultFont (batch 46)', () => {
  const both = { sc: true, tc: true };
  const scOnly = { sc: true, tc: false };
  const tcOnly = { sc: false, tc: true };
  const none = { sc: false, tc: false };

  it('picks TC for zh-TW / Hant when available', () => {
    expect(resolvePdfDefaultFont('zh-TW', both)).toBe(FONT_CJK_TC);
    expect(resolvePdfDefaultFont('zh-Hant', both)).toBe(FONT_CJK_TC);
    expect(resolvePdfDefaultFont('zh-HK', both)).toBe(FONT_CJK_TC);
  });

  it('falls back to SC for zh-TW when TC is missing', () => {
    expect(resolvePdfDefaultFont('zh-TW', scOnly)).toBe(FONT_CJK_SC);
  });

  it('picks SC for zh-CN when available', () => {
    expect(resolvePdfDefaultFont('zh-CN', both)).toBe(FONT_CJK_SC);
    expect(resolvePdfDefaultFont('zh', both)).toBe(FONT_CJK_SC);
  });

  it('uses CJK for en/pl so Chinese values still print', () => {
    expect(resolvePdfDefaultFont('en-US', both)).toBe(FONT_CJK_SC);
    expect(resolvePdfDefaultFont('pl-PL', tcOnly)).toBe(FONT_CJK_TC);
  });

  it('falls back to Roboto when no CJK face is installed', () => {
    expect(resolvePdfDefaultFont('zh-CN', none)).toBe(FONT_ROBOTO);
    expect(resolvePdfDefaultFont('en-US', none)).toBe(FONT_ROBOTO);
  });
});
